import { z } from "zod";

/** Минимум/максимум игроков — единый источник истины для UI и валидации */
export const PLAYERS_MIN = 1;
export const PLAYERS_MAX = 12;

/**
 * Возвращает сегодняшнюю дату в формате YYYY-MM-DD в локальной таймзоне.
 * Используется для проверки «не в прошлом» (валидация)
 * и как min для date-инпута (см. QuickBookingForm).
 */
export function todayLocalISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isNotPast(valueDate: string): boolean {
  return valueDate >= todayLocalISO();
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
    .max(60, "Слишком длинное имя"),
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
    .optional()
    .or(z.literal("")),
  quest: z.string().trim().min(1, "Выберите квест"),
  date: z
    .string()
    .min(1, "Выберите дату")
    .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Некорректная дата")
    .refine(isNotPast, "Дата не может быть в прошлом"),
  time: z.string().min(1, "Выберите время"),
  players: z
    .number({ invalid_type_error: "Укажите количество игроков" })
    .int("Количество игроков — целое число")
    .min(PLAYERS_MIN, `Минимум ${PLAYERS_MIN} игрок`)
    .max(PLAYERS_MAX, `Максимум ${PLAYERS_MAX} игроков`),
  comment: z
    .string()
    .trim()
    .max(500, "Комментарий слишком длинный (макс. 500 символов)")
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
  website: z.string().optional(),
});

export type BookingData = z.infer<typeof bookingSchema>;

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
