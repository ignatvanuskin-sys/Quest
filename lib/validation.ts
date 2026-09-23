import { z } from "zod";
import { TIME_SLOTS } from "@/lib/quests";

/** Минимум/максимум игроков на уровне схемы — общий предел для всех комнат */
export const PLAYERS_MIN = 1;
export const PLAYERS_MAX = 12;

/** Горизонт бронирования: не дальше этого числа дней вперёд */
export const MAX_DAYS_AHEAD = 180;

/**
 * Максимальный размер тела запроса к /api/book.
 * Реальная заявка — меньше килобайта; ограничение защищает от попытки
 * прислать многомегабайтный JSON и выесть память инстанса.
 */
export const MAX_BODY_BYTES = 16 * 1024;

/**
 * Бизнес работает в Москве (см. lib/contacts.ts → hours/hoursNote),
 * поэтому и «сегодня», и горизонт брони считаются по МСК, а не по локальной
 * таймзоне сервера.
 *
 * Раньше здесь была локальная таймзона процесса: на Vercel это UTC, и в ночные
 * часы по МСК (00:00–03:00) сервер считал «сегодня» предыдущие сутки — то есть
 * принимал заявки на дату, которая для гостя и администратора уже прошла.
 */
const BUSINESS_TZ = "Europe/Moscow";

const BUSINESS_DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: BUSINESS_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Сегодняшняя дата (YYYY-MM-DD) в таймзоне бизнеса — она же min для date-инпута.
 * Собирается из formatToParts, а не из готовой строки локали: порядок частей
 * и разделители у Intl зависят от движка, а `date`-инпуту нужен строго ISO.
 */
export function todayBusinessISO(now: Date = new Date()): string {
  const parts = BUSINESS_DATE_FMT.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Последняя доступная дата брони (сегодня + MAX_DAYS_AHEAD) в формате YYYY-MM-DD.
 * Нужна как `max` у date-инпута — без неё гость мог выбрать дату за горизонтом
 * и узнать о запрете только после отправки.
 */
export function maxBookableISO(now: Date = new Date()): string {
  const d = new Date(`${todayBusinessISO(now)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + MAX_DAYS_AHEAD);
  return d.toISOString().slice(0, 10);
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Существует ли такая календарная дата (отсекает 2026-02-31 и подобное) */
function isRealCalendarDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Сколько календарных дней от `fromISO` до `toISO` (может быть отрицательным) */
function daysBetween(fromISO: string, toISO: string): number {
  const a = Date.parse(`${fromISO}T00:00:00Z`);
  const b = Date.parse(`${toISO}T00:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Дата брони валидна, если она:
 *  - настоящая календарная дата нужного формата;
 *  - не раньше сегодняшнего дня по МСК;
 *  - не дальше MAX_DAYS_AHEAD дней вперёд.
 *
 * Без верхней границы принималось что угодно, включая 9999-12-31 —
 * такая заявка уходила администратору в Telegram как реальная бронь.
 */
export function isBookableDate(
  value: string,
  today: string = todayBusinessISO()
): boolean {
  if (!isRealCalendarDate(value)) return false;
  const delta = daysBetween(today, value);
  return delta >= 0 && delta <= MAX_DAYS_AHEAD;
}

/** Даты желаемого времени — только реальные слоты расписания (lib/quests.ts) */
export function isBookableTime(value: string): boolean {
  return TIME_SLOTS.includes(value);
}

/**
 * Управляющие символы.
 * Отдельно от табов/переводов строк: в однострочных полях они тоже недопустимы,
 * а в комментарии перевод строки — норма.
 */
const RAW_CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const ANY_CONTROL_RE = /[\u0000-\u001F\u007F]/;

/** Комментарий: любой управляющий символ, кроме перевода строки */
function noRawControlChars(value: string): boolean {
  return !RAW_CONTROL_RE.test(value);
}

/** Однострочное поле: вообще без управляющих символов */
function noAnyControlChars(value: string): boolean {
  return !ANY_CONTROL_RE.test(value);
}

/**
 * Схема заявки на бронирование.
 * Используется и на клиенте (react-hook-form через zodResolver),
 * и на сервере (app/api/book/route.ts) — дублирующая валидация.
 */
export const bookingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя (минимум 2 символа)")
    .max(60, "Слишком длинное имя")
    .refine(noAnyControlChars, "Недопустимые символы в имени"),
  phone: z
    .string()
    .trim()
    .min(1, "Укажите телефон")
    .refine(
      (v) => v.replace(/\D/g, "").length === 11 && /^[78]/.test(v.replace(/\D/g, "")),
      "Введите телефон полностью: +7 (___) ___-__-__"
    ),
  contact: z
    .string()
    .trim()
    .max(80, "Слишком длинное значение")
    .refine(noAnyControlChars, "Недопустимые символы")
    .optional()
    .or(z.literal("")),
  quest: z.string().trim().min(1, "Выберите квест"),
  date: z
    .string()
    .min(1, "Выберите дату")
    .refine(isBookableDate, "Выберите дату в пределах 180 дней от сегодня"),
  time: z
    .string()
    .min(1, "Выберите время")
    .refine(isBookableTime, "Выберите время из доступных слотов"),
  players: z
    .number({ invalid_type_error: "Укажите количество игроков" })
    .int("Количество игроков — целое число")
    .min(PLAYERS_MIN, `Минимум ${PLAYERS_MIN} игрок`)
    .max(PLAYERS_MAX, `Максимум ${PLAYERS_MAX} игроков`),
  comment: z
    .string()
    .trim()
    .max(500, "Комментарий слишком длинный (макс. 500 символов)")
    .refine(noRawControlChars, "Недопустимые символы в комментарии")
    .optional()
    .or(z.literal("")),
  agree: z.literal(true, {
    errorMap: () => ({ message: "Нужно согласие на обработку персональных данных" }),
  }),
  /**
   * Уровень страха — персонализация интенсивности (фишка конкурентов вроде
   * tunnel-quest.ru). Необязателен: по умолчанию «standard».
   */
  scareLevel: z.enum(["standard", "intense", "extreme"]).optional(),
  /** Видеозапись прохождения (+1 500 ₽) — доп. услуга / upsell */
  videoRecord: z.boolean().optional(),
  /**
   * Honeypot-ловушка для ботов: скрытое поле, у людей всегда пустое.
   * Проверяется в API до валидации (см. app/api/book/route.ts).
   */
  website: z.string().max(200).optional(),
});

export type BookingData = z.infer<typeof bookingSchema>;

/**
 * Проверка количества игроков против лимитов конкретной комнаты.
 * Общий предел схемы (1..12) ничего не знает о вместимости зала, поэтому без
 * этой проверки проходила заявка «12 игроков» на комнату на 5 человек —
 * невозможная бронь уходила администратору как обычная.
 *
 * Возвращает текст ошибки или null, если всё в порядке.
 */
export function playersRangeError(
  min: number,
  max: number,
  players: number
): string | null {
  if (players >= min && players <= max) return null;
  const range = min === max ? `${min}` : `${min}–${max}`;
  return `Для этой комнаты допустимо ${range} игроков`;
}

/** Маска телефона +7 (___) ___-__-__ — чистый JS, без зависимостей */
export function formatPhone(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("8")) digits = "7" + digits.slice(1);
  if (digits.length > 0 && !digits.startsWith("7")) digits = "7" + digits;
  digits = digits.slice(0, 11);

  if (digits.length === 0) return "";

  const p1 = digits.slice(1, 4);
  const p2 = digits.slice(4, 7);
  const p3 = digits.slice(7, 9);
  const p4 = digits.slice(9, 11);

  let out = "+7";
  if (p1) out += ` (${p1}`;
  if (p2) out += `) ${p2}`;
  if (p3) out += `-${p3}`;
  if (p4) out += `-${p4}`;
  return out;
}
