import { describe, expect, it } from "vitest";
import { clientIpFromHeaders, UNKNOWN_CLIENT } from "@/lib/client-ip";

const headers = (init: Record<string, string>) => new Headers(init);

describe("clientIpFromHeaders", () => {
  it("предпочитает x-real-ip (заголовок доверенного прокси)", () => {
    expect(
      clientIpFromHeaders(
        headers({
          "x-real-ip": "203.0.113.10",
          "x-forwarded-for": "1.2.3.4, 203.0.113.10",
        })
      )
    ).toBe("203.0.113.10");
  });

  it("НЕ доверяет первому элементу X-Forwarded-For (его задаёт клиент)", () => {
    // Ключевой регресс: раньше брался split(",")[0] — то есть подконтрольное
    // клиенту значение, и лимитер обходился одним заголовком на запрос.
    expect(
      clientIpFromHeaders(headers({ "x-forwarded-for": "spoof-me, 203.0.113.10" }))
    ).toBe("203.0.113.10");
  });

  it("не отдаёт не-IP значение в качестве ключа", () => {
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "unknown-client" }))).toBe(
      UNKNOWN_CLIENT
    );
    expect(clientIpFromHeaders(headers({ "x-forwarded-for": "a".repeat(300) }))).toBe(
      UNKNOWN_CLIENT
    );
  });

  it("отбрасывает порт у IPv4", () => {
    expect(clientIpFromHeaders(headers({ "x-real-ip": "203.0.113.10:52345" }))).toBe(
      "203.0.113.10"
    );
  });

  it("поддерживает IPv6, в том числе в квадратных скобках", () => {
    expect(clientIpFromHeaders(headers({ "x-real-ip": "2001:db8::1" }))).toBe(
      "2001:db8::1"
    );
    expect(clientIpFromHeaders(headers({ "x-real-ip": "[2001:db8::1]:443" }))).toBe(
      "2001:db8::1"
    );
  });

  it("использует x-vercel-forwarded-for, если x-real-ip отсутствует", () => {
    expect(
      clientIpFromHeaders(headers({ "x-vercel-forwarded-for": "203.0.113.10" }))
    ).toBe("203.0.113.10");
  });

  it("без заголовков возвращает UNKNOWN_CLIENT (никогда не пустую строку)", () => {
    expect(clientIpFromHeaders(headers({}))).toBe(UNKNOWN_CLIENT);
  });

  it("подделка XFF не даёт каждый раз новый ключ", () => {
    const a = clientIpFromHeaders(headers({ "x-forwarded-for": "fake-1" }));
    const b = clientIpFromHeaders(headers({ "x-forwarded-for": "fake-2" }));
    expect(a).toBe(UNKNOWN_CLIENT);
    expect(b).toBe(UNKNOWN_CLIENT);
  });
});
