/**
 * Rate limiter для API route.
 *
 * Стратегия: global Map с TTL (работает в рамках одного инстанса — на Vercel
 * каждый serverless-инстанс даёт свой Map, но это всё равно отсекает спам
 * в рамках параллельных запросов на одном инстансе). Для строгого
 * кросс-инстанс лимита подключите @upstash/ratelimit + Redis —
 * интерфейс останется тем же (функция rateLimit(ip) → boolean).
 *
 * Дополнительно: периодическая очистка истёкших записей, защита от роста Map.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const CLEANUP_THRESHOLD = 5000;

// Используем globalThis чтобы Map пережила HMR в dev и разделялась между
// вызовами в рамках одного serverless-инстанса
const globalHits = globalThis as unknown as {
  __noxRateLimitHits?: Map<string, number[]>;
};
if (!globalHits.__noxRateLimitHits) {
  globalHits.__noxRateLimitHits = new Map<string, number[]>();
}
const hits = globalHits.__noxRateLimitHits;

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const arr = (hits.get(key) ?? []).filter((t) => t > windowStart);

  if (arr.length >= MAX_REQUESTS) {
    hits.set(key, arr);
    return false;
  }

  arr.push(now);
  hits.set(key, arr);

  // Периодическая очистка, чтобы Map не рос бесконечно
  if (hits.size > CLEANUP_THRESHOLD) {
    hits.forEach((v: number[], k: string) => {
      if (v.every((t: number) => t <= windowStart)) hits.delete(k);
    });
  }

  return true;
}

/**
 * Проверка конфигурации rate-limit (для диагностики и тестов).
 */
export function getRateLimitState(): {
  size: number;
  windowMs: number;
  maxRequests: number;
} {
  return { size: hits.size, windowMs: WINDOW_MS, maxRequests: MAX_REQUESTS };
}
