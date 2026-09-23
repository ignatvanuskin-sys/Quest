import { describe, expect, it } from "vitest";
import {
  bookingSchema,
  formatPhone,
  isBookableDate,
  isBookableTime,
  maxBookableISO,
  MAX_DAYS_AHEAD,
  PLAYERS_MAX,
  PLAYERS_MIN,
  playersRangeError,
  todayBusinessISO,
} from "@/lib/validation";
import { TIME_SLOTS } from "@/lib/quests";

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

/**
 * Регрессы аудита: до правок схема принимала произвольную строку в time,
 * любую дату (включая 9999-12-31) и управляющие символы в однострочных полях.
 */
describe("bookingSchema — время только из расписания", () => {
  it("принимает каждый реальный слот", () => {
    for (const slot of TIME_SLOTS) {
      expect(bookingSchema.safeParse(validBooking({ time: slot })).success).toBe(true);
    }
  });

  it("отклоняет произвольный текст в time", () => {
    expect(bookingSchema.safeParse(validBooking({ time: "абракадабра" })).success).toBe(
      false
    );
  });

  it("отклоняет несуществующее время и время вне диапазона", () => {
    for (const bad of ["99:99", "25:00", "03:00", "23:59", "12:30"]) {
      expect(bookingSchema.safeParse(validBooking({ time: bad })).success).toBe(false);
    }
  });

  it("отклоняет очень длинный time (ранее проходил целиком)", () => {
    expect(
      bookingSchema.safeParse(validBooking({ time: "9".repeat(5000) })).success
    ).toBe(false);
  });

  it("isBookableTime — единый источник истины для UI и сервера", () => {
    expect(isBookableTime("12:00")).toBe(true);
    expect(isBookableTime("22:00")).toBe(true);
    expect(isBookableTime("23:00")).toBe(false);
  });
});

describe("bookingSchema — дата", () => {
  const iso = (offsetDays: number) => {
    const d = new Date(`${todayBusinessISO()}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  };

  it("принимает сегодня и горизонт", () => {
    expect(bookingSchema.safeParse(validBooking({ date: iso(0) })).success).toBe(true);
    expect(
      bookingSchema.safeParse(validBooking({ date: iso(MAX_DAYS_AHEAD) })).success
    ).toBe(true);
  });

  it("отклоняет вчера", () => {
    expect(bookingSchema.safeParse(validBooking({ date: iso(-1) })).success).toBe(false);
  });

  it("отклоняет дату за горизонтом бронирования", () => {
    expect(
      bookingSchema.safeParse(validBooking({ date: iso(MAX_DAYS_AHEAD + 1) })).success
    ).toBe(false);
    expect(bookingSchema.safeParse(validBooking({ date: "9999-12-31" })).success).toBe(
      false
    );
  });

  it("отклоняет несуществующую календарную дату", () => {
    expect(isBookableDate("2026-02-31")).toBe(false);
    expect(isBookableDate("2026-13-01")).toBe(false);
    expect(isBookableDate("2026-00-10")).toBe(false);
  });
});

describe("bookingSchema — управляющие символы", () => {
  it("отклоняет NUL и ESC в имени", () => {
    expect(bookingSchema.safeParse(validBooking({ name: "A\u0000B" })).success).toBe(
      false
    );
    expect(bookingSchema.safeParse(validBooking({ name: "A\u001b[31m" })).success).toBe(
      false
    );
  });

  it("отклоняет перевод строки в имени (подмена структуры сообщения)", () => {
    expect(
      bookingSchema.safeParse(validBooking({ name: "Иван\nИгроков: 99" })).success
    ).toBe(false);
  });

  it("разрешает перевод строки в комментарии, но не NUL", () => {
    expect(
      bookingSchema.safeParse(validBooking({ comment: "первая\nвторая" })).success
    ).toBe(true);
    expect(
      bookingSchema.safeParse(validBooking({ comment: "плохо\u0000" })).success
    ).toBe(false);
  });

  it("отклоняет управляющие символы в contact", () => {
    expect(bookingSchema.safeParse(validBooking({ contact: "@ok\u0007" })).success).toBe(
      false
    );
  });
});

describe("playersRangeError — вместимость конкретной комнаты", () => {
  it("пропускает значения внутри диапазона", () => {
    expect(playersRangeError(2, 5, 2)).toBe(null);
    expect(playersRangeError(2, 5, 5)).toBe(null);
  });

  it("отклоняет 1 и 12 игроков для комнаты 2–5 (регресс аудита)", () => {
    expect(playersRangeError(2, 5, 1)).toContain("2–5");
    expect(playersRangeError(2, 5, 12)).toContain("2–5");
  });

  it("для диапазона из одного значения не печатает диапазон", () => {
    expect(playersRangeError(3, 3, 4)).toContain("3 игроков");
  });
});

describe("todayBusinessISO", () => {
  it("возвращает дату по МСК независимо от локальной зоны процесса", () => {
    // 2026-09-22T22:30:00Z = 23 сентября 01:30 по Москве
    expect(todayBusinessISO(new Date("2026-09-22T22:30:00Z"))).toBe("2026-09-23");
    // 2026-09-22T20:30:00Z = 22 сентября 23:30 по Москве
    expect(todayBusinessISO(new Date("2026-09-22T20:30:00Z"))).toBe("2026-09-22");
  });

  it("формат совпадает с ISO-датой для инпута", () => {
    expect(todayBusinessISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("maxBookableISO совпадает с горизонтом бронирования", () => {
    // 22.09.2026 + 180 дней = 21.03.2027
    const max = maxBookableISO(new Date("2026-09-22T20:30:00Z"));
    expect(max).toBe("2027-03-21");
    expect(isBookableDate(max, "2026-09-22")).toBe(true);

    const overMax = new Date(`${max}T00:00:00Z`);
    overMax.setUTCDate(overMax.getUTCDate() + 1);
    expect(isBookableDate(overMax.toISOString().slice(0, 10), "2026-09-22")).toBe(false);
  });
});
