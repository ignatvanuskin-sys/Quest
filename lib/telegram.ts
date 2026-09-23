/**
 * Хелпер отправки сообщения владельцу в Telegram через Bot API.
 * Требует TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в окружении.
 *
 * Если env-переменные не заданы — не выбрасывает, а логирует предупреждение
 * и сохраняет текст заявки в console.warn, чтобы заявка не потерялась
 * бесследно. Вызывающий код (route.ts) интерпретирует результат.
 */

export interface TelegramResult {
  ok: boolean;
  error?: string;
  /** Если env не задан — сообщение залогировано, но не отправлено */
  loggedOnly?: boolean;
}

export async function sendTelegramMessage(text: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegram] Env не настроен: TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID отсутствуют. " +
        "Заявка не отправлена, но залогирована для ручной обработки:\n" +
        text
    );
    return { ok: false, error: "Telegram не настроен", loggedOnly: true };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      // Таймаут 10с чтобы запрос не висел бесконечно
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[telegram] API ответил ${res.status}: ${body.slice(0, 200)}`);
      return {
        ok: false,
        error: `Telegram API ${res.status}`,
      };
    }

    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      console.error("[telegram] Таймаут запроса к Telegram API (10с)");
      return { ok: false, error: "Таймаут Telegram API" };
    }
    console.error("[telegram] Сетевая ошибка:", err);
    return { ok: false, error: "Сетевая ошибка" };
  }
}
