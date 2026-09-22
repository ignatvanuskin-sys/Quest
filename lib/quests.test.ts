import { describe, expect, it } from "vitest";
import { GENRES, QUESTS, TIME_SLOTS, getQuestBySlug } from "@/lib/quests";

describe("каталог квестов", () => {
  it("содержит хотя бы один квест", () => {
    expect(QUESTS.length).toBeGreaterThan(0);
  });

  it("все slug уникальны", () => {
    const slugs = QUESTS.map((q) => q.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("slug соответствует URL-безопасному формату", () => {
    for (const q of QUESTS) {
      expect(q.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("у каждого квеста корректные диапазоны игроков", () => {
    for (const q of QUESTS) {
      expect(q.playersMin).toBeGreaterThan(0);
      expect(q.playersMax).toBeGreaterThanOrEqual(q.playersMin);
    }
  });

  it("сложность в пределах 1..5", () => {
    for (const q of QUESTS) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1);
      expect(q.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it("жанры квестов существуют в списке GENRES", () => {
    const known = new Set(GENRES.map((g) => g.id));
    for (const q of QUESTS) {
      expect(q.genreIds.length).toBeGreaterThan(0);
      for (const id of q.genreIds) {
        expect(known.has(id)).toBe(true);
      }
    }
  });

  it("у каждого квеста есть обложка и галерея", () => {
    for (const q of QUESTS) {
      expect(q.cover).toMatch(/^\/media\//);
      expect(q.gallery.length).toBeGreaterThan(0);
      for (const g of q.gallery) {
        expect(g).toMatch(/^\/media\//);
      }
    }
  });

  it("getQuestBySlug находит существующий и не находит несуществующий", () => {
    expect(getQuestBySlug(QUESTS[0].slug)?.slug).toBe(QUESTS[0].slug);
    expect(getQuestBySlug("no-such-quest")).toBeUndefined();
  });
});

describe("временные слоты", () => {
  it("идут с 12:00 до 22:00 включительно", () => {
    expect(TIME_SLOTS[0]).toBe("12:00");
    expect(TIME_SLOTS[TIME_SLOTS.length - 1]).toBe("22:00");
  });

  it("все слоты в формате HH:00", () => {
    for (const t of TIME_SLOTS) {
      expect(t).toMatch(/^\d{2}:00$/);
    }
  });

  it("слоты отсортированы по возрастанию", () => {
    const sorted = [...TIME_SLOTS].sort();
    expect(TIME_SLOTS).toEqual(sorted);
  });
});
