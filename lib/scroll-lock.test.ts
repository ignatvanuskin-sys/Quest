import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * lib/scroll-lock.ts — счётная блокировка прокрутки фона.
 * Счётчик нужен для вложенных оверлеев: закрытие нижнего не должно
 * разблокировать страницу, пока открыт верхний.
 */

const htmlClasses = new Set<string>();
const dispatchEvent = vi.fn();

const fakeDocument = {
  documentElement: {
    classList: {
      add: (c: string) => htmlClasses.add(c),
      remove: (c: string) => htmlClasses.delete(c),
      contains: (c: string) => htmlClasses.has(c),
    },
    style: { overflow: "" },
  },
};

const fakeWindow = {
  dispatchEvent,
  addEventListener: () => {},
  removeEventListener: () => {},
};

beforeEach(() => {
  htmlClasses.clear();
  fakeDocument.documentElement.style.overflow = "";
  dispatchEvent.mockClear();
  vi.resetModules();
  vi.stubGlobal("document", fakeDocument);
  vi.stubGlobal("window", fakeWindow);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function load() {
  return import("@/lib/scroll-lock");
}

describe("lockScroll / unlockScroll", () => {
  it("первая блокировка скрывает прокрутку и вешает класс", async () => {
    const { lockScroll } = await load();
    lockScroll();
    expect(fakeDocument.documentElement.style.overflow).toBe("hidden");
    expect(htmlClasses.has("scroll-locked")).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
  });

  it("вложенные оверлеи: разблокировка только после закрытия последнего", async () => {
    const { lockScroll, unlockScroll } = await load();
    lockScroll();
    lockScroll();

    unlockScroll();
    expect(fakeDocument.documentElement.style.overflow).toBe("hidden");
    expect(htmlClasses.has("scroll-locked")).toBe(true);

    unlockScroll();
    expect(fakeDocument.documentElement.style.overflow).toBe("");
    expect(htmlClasses.has("scroll-locked")).toBe(false);
    // Ровно два события на два перехода состояния: остановка Lenis при
    // первой блокировке и запуск — при снятии последней. Вложенная
    // блокировка/разблокировка событий не порождает.
    expect(dispatchEvent).toHaveBeenCalledTimes(2);
  });

  it("лишний unlock не уводит счётчик в минус", async () => {
    const { lockScroll, unlockScroll } = await load();
    unlockScroll();
    lockScroll();
    expect(fakeDocument.documentElement.style.overflow).toBe("hidden");
  });
});
