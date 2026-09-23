/**
 * Хелпер отправки сообщения владельцу в Telegram через Bot API.
 * Требует TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в окружении.
 *
 * ВАЖНО (изменено по итогам аудита): раньше при отсутствии env функция
 * возвращала `loggedOnly: true`, а route.ts отвечал клиенту `{ok:true}`.
 * Пользователь видел «Заявка получена», администратор не получал ничего —
 * заявка терялась молча, а текст с именем и телефоном уходил в серверный лог
 * (в логах Vercel их видит любой, у кого есть доступ к дашборду).
 *
 * Теперь: отправка при отсутствии конфигурации считается ЖЁСТКОЙ ошибкой
 * (route.ts отдаёт 503, клиент показывает сообщение и телефон для звонка),
 * а персональные данные в логи не пишутся.
 */

export interface TelegramResult {
  ok: boolean;
  error?: string;
  /**
   * Оставить поле для совместимости нельзя: раньше по нему route.ts решал,
   * что заявка «принята». Оставлен как явный признак, что отправка не была
   * выполнена из-за отсутствия конфигурации.
   */
  notConfigured?: boolean;
}

/** Настроена ли отправка заявок (обе переменные окружения заданы) */
export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/**
 * Демо-режим: Telegram ещё не подключён, но форма должна оставаться рабочей
 * для показа заказчику.
 *
 * Отличие от прежнего поведения принципиальное: раньше при отсутствии env
 * API отвечал `{ok:true}` и гость видел «Заявка получена. Перезвоним» — то есть
 * сайт утверждал, что заявка принята, хотя она никуда не уходила. Теперь демо
 * честно помечено: ответ содержит `demo: true`, и форма показывает
 * «Демо-режим: заявка не отправлена».
 *
 * Правило:
 *  - Telegram настроен            → живой режим, демо выключено;
 *  - Telegram не настроен, но
 *    NEXT_PUBLIC_DEMO_MODE=false  → приём заявок выключен, форма отдаёт ошибку
 *                                   с телефоном (боевой режим без конфигурации);
 *  - Telegram не настроен и флаг
 *    не выставлен в false         → демо-режим (значение по умолчанию для
 *                                   этого шаблона без переменных окружения).
 */
export function isDemoMode(): boolean {
  if (isTelegramConfigured()) return false;
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}

/**
 * Убирает из произвольного текста всё, что похоже на телефонный номер,
 * e-mail или токен, — чтобы диагностика не приводила к утечке ПД в логи.
 */
export function redactPii(text: string): string {
  return text
    .replace(/\+?\d[\d\s()-]{8,}\d/g, "<тел>")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "<email>")
    .replace(/\d{6,}:[A-Za-z0-9_-]{25,}/g, "<token>");
}

export async function sendTelegramMessage(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "[telegram] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID не заданы — заявка НЕ отправлена " +
        "(длина сообщения, символов: " +
        text.length +
        "). Настройте .env.local, иначе приём заявок выключен."
    );
    return { ok: false, error: "Telegram не настроен", notConfigured: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      // Таймаут 8с, а не 10с: у serverless-функции на Vercel свой лимит времени
      // (по умолчанию 10с). Если Telegram подвиснет, функция будет убита платформой
      // и гость получит 504 без внятного текста. 8с оставляют запас, чтобы
      // успеть вернуть контролируемую ошибку с телефоном для звонка.
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[telegram] API ответил ${res.status}: ${redactPii(body.slice(0, 200))}`
      );
      return {
        ok: false,
        error: `Telegram API ${res.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      console.error("[telegram] Таймаут запроса к Telegram API (8с)");
      return { ok: false, error: "Таймаут Telegram API" };
    }
    console.error("[telegram] Сетевая ошибка:", err instanceof Error ? err.name : err);
    return { ok: false, error: "Сетевая ошибка" };
  }
}
