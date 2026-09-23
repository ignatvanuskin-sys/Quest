import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * lib/overlay-history.ts — поведение системной кнопки «Назад» с оверлеями.
 * Тест подменяет window.history минимальной моделью: записи + индекс,
 * pushState/replaceState/back и рассылка popstate.
 */

class FakeHistory {
  entries: { state: unknown }[] = [{ state: null }];
  index = 0;

  get state(): unknown {
    return this.entries[this.index]?.state ?? null;
  }

  get length(): number {
    return this.entries.length;
  }

  pushState(state: unknown) {
    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push({ state });
    this.index = this.entries.length - 1;
  }

  replaceState(state: unknown) {
    this.entries[this.index].state = state;
  }

  back() {
    this.index = Math.max(0, this.index - 1);
    listeners.forEach((fn) => fn({ state: this.state }));
  }
}

let history: FakeHistory;
let listeners: Set<(event: { state: unknown }) => void>;

const fakeWindow = {
  get history() {
    return history;
  },
  addEventListener: (type: string, fn: (event: { state: unknown }) => void) => {
    if (type === "popstate") listeners.add(fn);
  },
  removeEventListener: (type: string, fn: (event: { state: unknown }) => void) => {
    if (type === "popstate") listeners.delete(fn);
  },
  setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms),
};

beforeEach(() => {
  history = new FakeHistory();
  listeners = new Set();
  vi.resetModules();
  vi.stubGlobal("window", fakeWindow);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function load() {
  return import("@/lib/overlay-history");
}

describe("запись истории при открытии оверлея", () => {
  it("открытие добавляет запись, повторное закрытие её переиспользует", async () => {
    const { pushOverlay, popOverlay } = await load();
    expect(history.length).toBe(1);

    const d1 = pushOverlay(() => {});
    expect(history.length).toBe(2);
    expect(history.state).toMatchObject({ __noxOverlayDepth: 1 });

    popOverlay(d1);
    expect(history.state).toMatchObject({ __noxOverlayConsumed: true });
    // История не растёт: следующее открытие занимает ту же запись
    const d2 = pushOverlay(() => {});
    expect(history.length).toBe(2);
    expect(history.state).toMatchObject({ __noxOverlayDepth: 1 });
    popOverlay(d2);
  });

  it("вложенные оверлеи получают разные уровни", async () => {
    const { pushOverlay, popOverlay } = await load();
    const a = pushOverlay(() => {});
    const b = pushOverlay(() => {});
    expect(a).toBe(1);
    expect(b).toBe(2);
    expect(history.length).toBe(3);
    popOverlay(b);
    popOverlay(a);
  });
});

describe("системное «Назад» (popstate)", () => {
  it("закрывает верхний оверлей и не уводит со страницы", async () => {
    const { pushOverlay, popOverlay } = await load();
    const close = vi.fn();
    const d = pushOverlay(close);

    history.back(); // ровно то, что делает кнопка «Назад»

    expect(close).toHaveBeenCalledTimes(1);
    // Мы остались на той же странице: запись сброшена, оверлей снят с учёта
    expect(history.state).toBeNull();
    expect(history.index).toBe(0);
    // Повторное снятие (например, из cleanup эффекта) уже ничего не делает
    popOverlay(d);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("вложенные: первое «Назад» закрывает только верхний", async () => {
    const { pushOverlay, popOverlay } = await load();
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    const bottom = pushOverlay(closeBottom);
    const top = pushOverlay(closeTop);

    history.back();

    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();

    history.back();

    expect(closeBottom).toHaveBeenCalledTimes(1);
    popOverlay(top);
    popOverlay(bottom);
  });
});

describe("программное закрытие (крестик, Esc, клик по пункту меню)", () => {
  it("помечает запись израсходованной и НЕ выполняет переход", async () => {
    vi.useFakeTimers();
    const { pushOverlay, popOverlay } = await load();
    const d = pushOverlay(() => {});
    expect(history.length).toBe(2);

    popOverlay(d);

    expect(history.index).toBe(1);
    expect(history.state).toMatchObject({ __noxOverlayConsumed: true });

    // Раньше здесь планировался history.back(). На телефоне браузер выполняет
    // переход не мгновенно, и если гость успевал снова открыть меню, попавший
    // в это окно popstate закрывал его сам — меню мигало и казалось нерабочим.
    vi.advanceTimersByTime(5000);
    expect(history.index).toBe(1);
  });

  it("следующее открытие переиспользует запись — история не растёт", async () => {
    const { pushOverlay, popOverlay } = await load();
    const d1 = pushOverlay(() => {});
    popOverlay(d1);
    expect(history.length).toBe(2);

    const d2 = pushOverlay(() => {});
    expect(history.length).toBe(2);
    expect(history.state).toMatchObject({ __noxOverlayDepth: 1 });
    popOverlay(d2);
  });

  it("«Назад» после программного закрытия ничего лишнего не закрывает", async () => {
    const { pushOverlay, popOverlay } = await load();
    const close = vi.fn();
    popOverlay(pushOverlay(close));

    history.back();

    expect(close).not.toHaveBeenCalled();
    expect(history.index).toBe(0);
  });
});
