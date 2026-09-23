/**
 * Определение IP клиента для rate-limit.
 *
 * Проблема, которую решает модуль: раньше IP брался как
 * `x-forwarded-for.split(",")[0]` — то есть ПЕРВЫЙ элемент заголовка.
 * Первый элемент XFF — это то, что прислал сам клиент; доверенный прокси
 * (Vercel/nginx) дописывает реальный адрес В КОНЕЦ. Любой желающий мог
 * отправить `X-Forwarded-For: <случайная строка>` и получить собственный
 * bucket на каждый запрос — лимит 5 заявок/мин не работал вообще.
 * Проверено: 6 запросов с разными XFF прошли (см. audit/api-probe.mjs).
 *
 * Порядок доверия:
 *  1. `x-real-ip` / `cf-connecting-ip` — их ставит сам прокси по своему
 *     соединению, подделать снаружи нельзя;
 *  2. `x-vercel-forwarded-for` — платформенный заголовок Vercel;
 *  3. `x-forwarded-for` — берём ПОСЛЕДНИЙ элемент (его дописал прокси).
 *
 * Значение дополнительно проверяется как похожее на IP и обрезается по длине:
 * ключ должен быть предсказуемым, иначе Map лимитера растёт от произвольных
 * строк (плюс это способ раздуть память инстанса).
 */

/** Грубая проверка IPv4/IPv6 — цель не строгая валидация, а ограничение формы ключа */
const IPV4_RE = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-f:]{3,45}$/i;

export const UNKNOWN_CLIENT = "unknown";

function normalize(raw: string | null | undefined): string | null {
  if (!raw) return null;
  // "198.51.100.7:443" (nginx иногда пишет порт) → отбрасываем порт
  let value = raw.trim().split(",").pop()?.trim() ?? "";
  if (value.startsWith("[")) {
    // IPv6 в скобках: [::1]:443
    value = value.slice(1, value.indexOf("]") > 0 ? value.indexOf("]") : undefined);
  } else if (value.includes(":") && IPV4_RE.test(value.split(":")[0])) {
    value = value.split(":")[0];
  }
  if (!value || value.length > 45) return null;
  if (!IPV4_RE.test(value) && !IPV6_RE.test(value)) return null;
  return value;
}

/**
 * Возвращает ключ для rate-limit по заголовкам запроса.
 * Никогда не бросает и никогда не возвращает пустую строку.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const candidates = [
    headers.get("x-real-ip"),
    headers.get("cf-connecting-ip"),
    headers.get("x-vercel-forwarded-for"),
    headers.get("x-forwarded-for"),
  ];
  for (const candidate of candidates) {
    const ip = normalize(candidate);
    if (ip) return ip;
  }
  return UNKNOWN_CLIENT;
}
