import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * lib/scroll.ts работает с DOM, поэтому тест подменяет глобальные document/window
 * минимальными заглушками — полноценный jsdom ради одной функции не нужен.
 */
type FakeEl = {
  scrollIntoView: ReturnType<typeof vi.fn>;
  getBoundingClientRect: () => { top: number };
};

let hasLenis = false;
let element: FakeEl | null = null;
let dispatchEvent: ReturnType<typeof vi.fn>;

const fakeDocument = {
  documentElement: {
    classList: { contains: (c: string) => c === "lenis" && hasLenis },
  },
  getElementById: (_id: string) => element,
};

const fakeWindow: { dispatchEvent: unknown } = { dispatchEvent: undefined };

beforeEach(() => {
  hasLenis = false;
  // top = ANCHOR_OFFSET_PX: цель уже на месте, коррекция не срабатывает
  element = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top: 72 }) };
  dispatchEvent = vi.fn();
  fakeWindow.dispatchEvent = dispatchEvent;
  vi.stubGlobal("document", fakeDocument);
  vi.stubGlobal("window", fakeWindow);
  // CustomEvent в node-окружении отсутствует — нужен только как контейнер
  vi.stubGlobal(
    "CustomEvent",
    class {
      detail: unknown;
      constructor(_type: string, init?: { detail?: unknown }) {
        this.detail = init?.detail;
      }
    }
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function loadModule() {
  return import("@/lib/scroll");
}

describe("isSmoothScrollActive", () => {
  it("истинно только при классе lenis на <html>", async () => {
    const { isSmoothScrollActive } = await loadModule();
    expect(isSmoothScrollActive()).toBe(false);
    hasLenis = true;
    expect(isSmoothScrollActive()).toBe(true);
  });
});

describe("scrollToId", () => {
  it("с живым Lenis сообщает ему о скролле и не трогает нативный путь", async () => {
    hasLenis = true;
    const { scrollToId } = await loadModule();
    scrollToId("quests");
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    expect(element?.scrollIntoView).not.toHaveBeenCalled();
  });

  it("БЕЗ Lenis (например prefers-reduced-motion) скроллит нативно", async () => {
    // Регресс: раньше функция только диспатчила событие, слушателя не было,
    // и кнопки «Выбрать квест» / пункты меню не делали ничего.
    hasLenis = false;
    const { scrollToId } = await loadModule();
    scrollToId("quests");
    expect(dispatchEvent).not.toHaveBeenCalled();
    expect(element?.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
      behavior: "auto",
    });
  });

  it("ничего не делает для несуществующего id", async () => {
    element = null;
    const { scrollToId } = await loadModule();
    scrollToId("no-such-section");
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it("повторяет прокрутку, если цель уехала (разметка выросла по пути)", async () => {
    // Регресс: секции ниже раскрывались во время прокрутки, высота страницы
    // росла, и цель, посчитанная в момент клика, оказывалась на 1851 px ниже.
    vi.useFakeTimers();
    hasLenis = false;
    let top = 72;
    element = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top }) };
    const { scrollToId } = await loadModule();

    scrollToId("safety");
    expect(element.scrollIntoView).toHaveBeenCalledTimes(1);

    top = 1923; // страница «доросла», цель сместилась вниз
    vi.advanceTimersByTime(900);
    expect(element.scrollIntoView).toHaveBeenCalledTimes(2);

    top = 72; // после повторной прокрутки цель на месте
    vi.advanceTimersByTime(900);
    expect(element.scrollIntoView).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it("делает не больше двух попыток коррекции", async () => {
    vi.useFakeTimers();
    hasLenis = false;
    element = { scrollIntoView: vi.fn(), getBoundingClientRect: () => ({ top: 999 }) };
    const { scrollToId } = await loadModule();

    scrollToId("safety");
    vi.advanceTimersByTime(900);
    vi.advanceTimersByTime(900);
    vi.advanceTimersByTime(900);
    expect(element.scrollIntoView).toHaveBeenCalledTimes(3); // 1 + 2 коррекции

    vi.useRealTimers();
  });
});

describe("предвыбор квеста", () => {
  it("сохраняется, читается и одноразово очищается", async () => {
    const { preselectQuest, readPreselectedQuest, clearPreselectedQuest } =
      await loadModule();
    expect(readPreselectedQuest()).toBe(null);

    preselectQuest("dom-vorona");
    expect(readPreselectedQuest()).toBe("dom-vorona");

    clearPreselectedQuest();
    expect(readPreselectedQuest()).toBe(null);
  });
});
