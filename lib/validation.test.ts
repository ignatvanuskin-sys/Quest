import { describe, expect, it } from "vitest";
import { bookingSchema, formatPhone, PLAYERS_MAX, PLAYERS_MIN } from "@/lib/validation";

/** Хелпер: собрать валидную заявку и переопределить нужные поля */
function validBooking(overrides: Record<string, unknown> = {}) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = tomorrow.toISOString().slice(0, 10);

  return {
    name: "Иван Петров",
    phone: "+7 (999) 123-45-67",
    contact: "@ivan",
    quest: "dom-vorona",
    date: iso,
    time: "19:00",
    players: 3,
    comment: "",
    agree: true,
    website: "",
    ...overrides,
  };
}

describe("formatPhone", () => {
  it("форматирует пустую строку в пустую", () => {
    expect(formatPhone("")).toBe("");
  });

  it("добавляет +7 к цифрам без кода", () => {
    expect(formatPhone("9991234567")).toBe("+7 (999) 123-45-67");
  });

  it("заменяет ведущую 8 на +7", () => {
    expect(formatPhone("89991234567")).toBe("+7 (999) 123-45-67");
  });

  it("не даёт ввести больше 11 цифр", () => {
    expect(formatPhone("799912345679999")).toBe("+7 (999) 123-45-67");
  });

  it("корректно обрабатывает частичный ввод", () => {
    expect(formatPhone("999")).toBe("+7 (999");
    expect(formatPhone("9991")).toBe("+7 (999) 1");
    expect(formatPhone("999123")).toBe("+7 (999) 123");
  });

  it("игнорирует нецифровые символы", () => {
    expect(formatPhone("+7 (999) abc 12-34-567")).toBe("+7 (999) 123-45-67");
  });
});

describe("bookingSchema", () => {
  it("принимает валидную заявку", () => {
    const result = bookingSchema.safeParse(validBooking());
    expect(result.success).toBe(true);
  });

  it("отклоняет слишком короткое имя", () => {
    const result = bookingSchema.safeParse(validBooking({ name: "И" }));
    expect(result.success).toBe(false);
  });

  it("отклоняет телефон без полного номера", () => {
    const result = bookingSchema.safeParse(validBooking({ phone: "+7 (999) 12" }));
    expect(result.success).toBe(false);
  });

  it("принимает телефон, начинающийся с 8", () => {
    const result = bookingSchema.safeParse(validBooking({ phone: "89991234567" }));
    expect(result.success).toBe(true);
  });

  it("отклоняет дату в прошлом", () => {
    const result = bookingSchema.safeParse(validBooking({ date: "2020-01-01" }));
    expect(result.success).toBe(false);
  });

  it("принимает сегодняшнюю дату", () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const result = bookingSchema.safeParse(validBooking({ date: `${y}-${m}-${d}` }));
    expect(result.success).toBe(true);
  });

  it("отклоняет дату неверного формата", () => {
    const result = bookingSchema.safeParse(validBooking({ date: "19.09.2026" }));
    expect(result.success).toBe(false);
  });

  it("отклоняет игроков меньше минимума", () => {
    const result = bookingSchema.safeParse(validBooking({ players: 0 }));
    expect(result.success).toBe(false);
  });

  it("отклоняет игроков больше максимума", () => {
    const result = bookingSchema.safeParse(validBooking({ players: PLAYERS_MAX + 1 }));
    expect(result.success).toBe(false);
  });

  it("принимает граничные значения игроков", () => {
    expect(bookingSchema.safeParse(validBooking({ players: PLAYERS_MIN })).success).toBe(
      true
    );
    expect(bookingSchema.safeParse(validBooking({ players: PLAYERS_MAX })).success).toBe(
      true
    );
  });

  it("отклоняет дробное количество игроков", () => {
    const result = bookingSchema.safeParse(validBooking({ players: 2.5 }));
    expect(result.success).toBe(false);
  });

  it("требует согласие на обработку ПД", () => {
    const result = bookingSchema.safeParse(validBooking({ agree: false }));
    expect(result.success).toBe(false);
  });

  it("отклоняет пустой квест", () => {
    const result = bookingSchema.safeParse(validBooking({ quest: "" }));
    expect(result.success).toBe(false);
  });

  it("отклоняет слишком длинный комментарий", () => {
    const result = bookingSchema.safeParse(validBooking({ comment: "x".repeat(501) }));
    expect(result.success).toBe(false);
  });

  it("допускает пустой комментарий и contact", () => {
    const result = bookingSchema.safeParse(validBooking({ comment: "", contact: "" }));
    expect(result.success).toBe(true);
  });
});
