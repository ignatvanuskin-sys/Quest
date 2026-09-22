import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRateLimitState, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("пропускает запросы в пределах лимита", () => {
    const key = `test-allow-${Date.now()}`;
    expect(rateLimit(key)).toBe(true);
    expect(rateLimit(key)).toBe(true);
    expect(rateLimit(key)).toBe(true);
  });

  it("блокирует запрос после превышения лимита (5/мин)", () => {
    const key = `test-block-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key)).toBe(true);
    }
    // шестой запрос в том же окне — блокируется
    expect(rateLimit(key)).toBe(false);
  });

  it("ведёт учёт по каждому ключу отдельно", () => {
    const a = `test-a-${Date.now()}`;
    const b = `test-b-${Date.now()}`;
    for (let i = 0; i < 5; i++) rateLimit(a);
    expect(rateLimit(a)).toBe(false);
    // другой ключ не затронут
    expect(rateLimit(b)).toBe(true);
  });

  it("сбрасывает лимит после истечения окна", () => {
    vi.useFakeTimers();
    const key = `test-window-${Date.now()}`;
    for (let i = 0; i < 5; i++) rateLimit(key);
    expect(rateLimit(key)).toBe(false);

    // прокручиваем время за пределы окна (60с + запас)
    vi.advanceTimersByTime(61_000);
    expect(rateLimit(key)).toBe(true);
    vi.useRealTimers();
  });

  it("отдаёт состояние для диагностики", () => {
    const state = getRateLimitState();
    expect(state.windowMs).toBe(60_000);
    expect(state.maxRequests).toBe(5);
    expect(typeof state.size).toBe("number");
  });
});
