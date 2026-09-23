import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/book/route";
import { QUESTS } from "@/lib/quests";
import { MAX_BODY_BYTES, todayBusinessISO } from "@/lib/validation";

/**
 * Контракт приёмника заявок. Проверяем поведение, а не реализацию:
 * какие коды возвращаются на некорректные данные и что происходит,
 * когда отправка не настроена.
 */

const tomorrowMSK = () => {
  const d = new Date(`${todayBusinessISO()}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/** Валидная заявка: комната 2–5 игроков → 3 игрока */
const valid = (over: Record<string, unknown> = {}) => ({
  name: "Иван Петров",
  phone: "+7 (999) 123-45-67",
  quest: "dom-vorona",
  date: tomorrowMSK(),
  time: "19:00",
  players: 3,
  comment: "",
  agree: true,
  ...over,
});

let ipCounter = 0;
const uniqueIp = () => `198.51.100.${++ipCounter}`;

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-real-ip": uniqueIp(),
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  // Отправка настроена: проверяем ветки валидации, а не конфигурацию,
  // и подменяем сеть, чтобы заявки не уходили в реальный Telegram.
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "test-token");
  vi.stubEnv("TELEGRAM_CHAT_ID", "test-chat");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/book — приём заявки", () => {
  it("принимает валидную заявку", async () => {
    const res = await POST(post(valid()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("отклоняет мусор во времени (регресс: раньше 200)", async () => {
    const res = await POST(post(valid({ time: "абракадабра" })));
    expect(res.status).toBe(422);
  });

  it("отклоняет дату вне горизонта (регресс: раньше 200)", async () => {
    const res = await POST(post(valid({ date: "9999-12-31" })));
    expect(res.status).toBe(422);
  });

  it("отклоняет игроков вне вместимости комнаты (регресс: раньше 200)", async () => {
    const quest = QUESTS.find((q) => q.slug === "dom-vorona");
    expect(quest).toBeTruthy();
    const over = quest!.playersMax + 1;

    const res = await POST(post(valid({ players: over })));
    expect(res.status).toBe(422);
    const body = (await res.json()) as { ok: boolean; error: string };
    expect(body.error).toContain(`${quest!.playersMin}–${quest!.playersMax}`);
  });

  it("отклоняет управляющие символы в имени", async () => {
    const res = await POST(post(valid({ name: "A\u0000B" })));
    expect(res.status).toBe(422);
  });

  it("отклоняет неизвестный квест", async () => {
    const res = await POST(post(valid({ quest: "no-such-room" })));
    expect(res.status).toBe(422);
  });

  it("отклоняет не-JSON тело как 400", async () => {
    const res = await POST(post("{{{ broken"));
    expect(res.status).toBe(400);
  });

  it("отклоняет слишком большое тело как 413", async () => {
    const res = await POST(
      post(valid(), { "content-length": String(MAX_BODY_BYTES + 1) })
    );
    expect(res.status).toBe(413);
  });

  it("молча подтверждает заполненный honeypot и НЕ шлёт заявку", async () => {
    const res = await POST(post(valid({ website: "http://spam.example" })));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("возвращает 429 и Retry-After после исчерпания лимита с одного IP", async () => {
    const ip = "203.0.113.200";
    for (let i = 1; i <= 5; i++) {
      const ok = await POST(post(valid(), { "x-real-ip": ip }));
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(post(valid(), { "x-real-ip": ip }));
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBe("60");
  });

  it("без Telegram и с выключенным демо не отдаёт 200 (регресс: заявка терялась молча)", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_CHAT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");

    const res = await POST(post(valid()));
    expect(res.status).toBe(503);
    const body = (await res.json()) as { ok: boolean; error: string };
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/Позвоните/);
  });

  it("демо-режим помечает ответ флагом demo и не отправляет заявку", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_CHAT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");

    const res = await POST(post(valid()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, demo: true });
    // Заявка не уходит в Telegram, а гость получает пометку демо, а не «Перезвоним»
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("в демо-режиме валидация работает так же, как на проде", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_CHAT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");

    expect((await POST(post(valid({ time: "абракадабра" })))).status).toBe(422);
    expect((await POST(post(valid({ players: 12 })))).status).toBe(422);
    expect((await POST(post(valid({ date: "9999-12-31" })))).status).toBe(422);
  });
});
