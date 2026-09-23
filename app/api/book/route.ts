import { NextResponse } from "next/server";
import { bookingSchema, MAX_BODY_BYTES, playersRangeError } from "@/lib/validation";
import { isDemoMode, isTelegramConfigured, sendTelegramMessage } from "@/lib/telegram";
import { getQuestBySlug } from "@/lib/quests";
import { rateLimit } from "@/lib/rate-limit";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { VIDEO_RECORD_PRICE } from "@/lib/site";
import { CONTACTS } from "@/lib/contacts";

/**
 * POST /api/book — приём заявки на бронирование.
 * Rate-limit + honeypot + дублирующая серверная Zod-валидация,
 * затем сообщение владельцу в Telegram.
 *
 * Ответы: 200 `{ok:true}` — доставлено; 200 `{ok:true, demo:true}` —
 * демо-режим (Telegram не подключён, заявка не отправлена);
 * 503 — приём выключен; 429 — лимит; 413 — большое тело; 422 — данные;
 * 400 — не-JSON; 502 — Telegram не принял сообщение.
 *
 * Рантайм Node обязателен: rate-limit живёт в памяти инстанса,
 * Edge-рантайм дал бы новый экземпляр на каждый вызов и лимит не работал бы.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Подписи уровня страха */
const SCARE_LABELS: Record<string, string> = {
  standard: "Стандарт",
  intense: "Интенсив",
  extreme: "Экстремаль",
};

function json(body: unknown, status = 200, headers?: Record<string, string>) {
  return NextResponse.json(body, { status, headers });
}

export async function POST(req: Request) {
  // Проверка конфигурации Telegram — не здесь, а на шаге доставки (см. ниже):
  // заявка должна пройти тот же путь валидации, что и на проде, в том числе
  // в демо-режиме. Иначе демо показывало бы «всё хорошо» мимо проверок.

  // 1. Ограничение размера тела до чтения JSON
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Слишком большой запрос" }, 413);
  }

  // 2. Rate-limit по IP (5 заявок/мин). IP берём из доверенных заголовков
  //    прокси — первый элемент X-Forwarded-For подделывается клиентом
  //    (см. lib/client-ip.ts).
  const ip = clientIpFromHeaders(req.headers);
  if (!rateLimit(ip)) {
    return json({ ok: false, error: "Слишком много заявок. Подождите минуту." }, 429, {
      "Retry-After": "60",
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ ok: false, error: "Некорректный запрос" }, 400);
  }

  // Honeypot: бот заполнил скрытое поле — молча «принимаем», но не шлём.
  // Проверяем ДО валидации, чтобы бот не получил подсказку об ошибке.
  const honeypot =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>).website
      : undefined;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return json({ ok: true });
  }

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      {
        ok: false,
        error: "Ошибка валидации",
        issues: parsed.error.flatten().fieldErrors,
      },
      422
    );
  }

  const data = parsed.data;

  const quest = getQuestBySlug(data.quest);
  if (!quest) {
    return json({ ok: false, error: "Неизвестный квест" }, 422);
  }

  // Вместимость конкретной комнаты важнее общего предела схемы:
  // без этой проверки проходила бронь «12 игроков» на комнату на 5 человек.
  const playersError = playersRangeError(
    quest.playersMin,
    quest.playersMax,
    data.players
  );
  if (playersError) {
    return json(
      { ok: false, error: playersError, issues: { players: [playersError] } },
      422
    );
  }

  // Доставка. Telegram не подключён — это либо демонстрационный режим
  // (форма рабочая, но заявка не уходит), либо боевой деплой без конфигурации.
  // Разбор — в isDemoMode() (lib/telegram.ts).
  if (!isTelegramConfigured()) {
    if (isDemoMode()) {
      console.warn(
        "[/api/book] Демо-режим: заявка прошла валидацию, но НЕ отправлена " +
          "(TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID не заданы)."
      );
      // demo:true — клиент по этому флагу показывает честную пометку вместо
      // «Заявка получена. Перезвоним».
      return json({ ok: true, demo: true });
    }
    console.error(
      "[/api/book] Приём заявок выключен: Telegram не настроен, а демо-режим отключён " +
        "(NEXT_PUBLIC_DEMO_MODE=false)."
    );
    return json(
      {
        ok: false,
        error: `Приём заявок временно недоступен. Позвоните: ${CONTACTS.phoneDisplay}`,
      },
      503
    );
  }

  const when = new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" });
  const text = [
    "🕯 Новая заявка NOX",
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    data.contact ? `Связь: ${data.contact}` : null,
    `Квест: ${quest.title}`,
    `Дата: ${data.date} ${data.time}`,
    `Игроков: ${data.players}`,
    data.scareLevel
      ? `Уровень страха: ${SCARE_LABELS[data.scareLevel] ?? data.scareLevel}`
      : null,
    data.videoRecord ? `Видеозапись прохождения: да (+${VIDEO_RECORD_PRICE})` : null,
    `Стоимость (примерно): от ${quest.priceFrom.toLocaleString("ru-RU")} ₽`,
    `Комментарий: ${data.comment || "—"}`,
    `Отправлено: ${when} (МСК)`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendTelegramMessage(text);

  if (!result.ok) {
    console.error("[/api/book] Ошибка отправки в Telegram:", result.error);
    return json(
      {
        ok: false,
        error: `Не удалось доставить заявку. Позвоните: ${CONTACTS.phoneDisplay}`,
      },
      502
    );
  }

  return json({ ok: true });
}
