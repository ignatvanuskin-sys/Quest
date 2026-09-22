import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation";
import { sendTelegramMessage } from "@/lib/telegram";
import { getQuestBySlug } from "@/lib/quests";
import { rateLimit } from "@/lib/rate-limit";

/** Человекочитаемые подписи уровня страха */
const SCARE_LABELS: Record<string, string> = {
  standard: "Стандарт",
  intense: "Интенсив",
  extreme: "Экстремаль",
};

/**
 * POST /api/book — приём заявки на бронирование.
 * Rate-limit + honeypot + дублирующая серверная Zod-валидация,
 * затем сообщение владельцу в Telegram.
 */
export async function POST(req: Request) {
  // Rate-limit по IP (5 заявок/мин)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много заявок. Подождите минуту." },
      { status: 429 }
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некорректный запрос" },
      { status: 400 }
    );
  }

  // Honeypot: бот заполнил скрытое поле — молча «принимаем», но не шлём.
  // Проверяем ДО валидации, чтобы бот не получил подсказку об ошибке.
  const honeypot =
    typeof raw === "object" && raw !== null
      ? (raw as Record<string, unknown>).website
      : undefined;
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Ошибка валидации",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const data = parsed.data;

  const quest = getQuestBySlug(data.quest);
  if (!quest) {
    return NextResponse.json({ ok: false, error: "Неизвестный квест" }, { status: 422 });
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
    data.videoRecord ? "Видеозапись прохождения: да (+1 500 ₽)" : null,
    `Стоимость (примерно): от ${quest.priceFrom.toLocaleString("ru-RU")} ₽`,
    `Комментарий: ${data.comment || "—"}`,
    `Отправлено: ${when} (МСК)`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await sendTelegramMessage(text);

  if (!result.ok) {
    // Если env не задан — заявка залогирована, возвращаем успех (клиент не виноват)
    if (result.loggedOnly) {
      console.warn("[/api/book] Заявка принята, но Telegram не настроен. См. лог выше.");
      return NextResponse.json({ ok: true });
    }
    console.error("[/api/book] Ошибка отправки в Telegram:", result.error);
    return NextResponse.json(
      { ok: false, error: "Не удалось доставить заявку. Попробуйте позже." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
