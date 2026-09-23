"use client";

import { useEffect, useRef } from "react";

/**
 * История навигации для оверлеев (модалка брони, детали квеста, бургер-меню).
 *
 * ЗАЧЕМ. На Android системная кнопка/жест «Назад» — основной способ закрыть
 * экран. До этой правки открытие оверлея не создавало записи в истории, и
 * «Назад» либо не делал ничего, либо уводил со страницы вместе с открытой
 * формой. Мобильный замер: `history.length` до и после открытия модалки —
 * 2 → 2; после `history.back()` модалка осталась открыта.
 *
 * КАК. Каждый оверлей при открытии помечает текущую запись истории глубиной
 * (pushState с `__noxOverlayDepth`), а на `popstate` закрывается ровно тот
 * оверлей, чью запись «отмотали». Вложенные оверлеи получают глубину 2, 3…,
 * поэтому первое «Назад» закрывает верхний, второе — следующий под ним.
 *
 * ПОЧЕМУ НЕ `history.back()` ПРИ ЗАКРЫТИИ. Классическая схема «закрылся →
 * history.back()» ломается в React StrictMode (dev): эффект монтируется
 * дважды, `back()` уходит в очередь и прилетает уже после повторного
 * pushState — только что открытый оверлей закрывается сам. Здесь закрытие
 * синхронно помечает запись «израсходованной» через `replaceState` (навигации
 * не происходит), а сама запись убирается отложенно — если её никто не
 * переиспользовал. Схема не растёт: повторные открытия занимают ту же запись.
 *
 * Итоговое поведение: «Назад» с открытой модалкой закрывает модалку и не
 * уводит со страницы; второе «Назад» — обычный выход со страницы.
 */

const DEPTH_KEY = "__noxOverlayDepth";
const CONSUMED_KEY = "__noxOverlayConsumed";

type OverlayEntry = {
  depth: number;
  close: () => void;
};

/** Открытые оверлеи по возрастанию глубины (последний — верхний) */
const registry: OverlayEntry[] = [];

/** Текущая глубина оверлеев (совпадает с верхней записью истории) */
let depth = 0;
let listening = false;

function readState(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const state: unknown = window.history.state;
  return state && typeof state === "object" ? (state as Record<string, unknown>) : {};
}

function readDepth(state: Record<string, unknown>): number {
  const value = state[DEPTH_KEY];
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;
}

function ensureListener(): void {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("popstate", (event: PopStateEvent) => {
    const state: unknown = event.state;
    const next = readDepth(
      state && typeof state === "object" ? (state as Record<string, unknown>) : {}
    );
    // Вперёд или чужая навигация — оверлеи не трогаем.
    if (next >= depth) return;
    // Пользователь мог «отмотать» сразу несколько записей (долгое удержание
    // кнопки «Назад») — закрываем все оверлеи глубже новой позиции.
    while (registry.length > 0 && registry[registry.length - 1].depth > next) {
      const top = registry.pop() as OverlayEntry;
      depth = top.depth - 1;
      top.close();
    }
    depth = next;
  });
}

/** Регистрирует оверлей в истории. Возвращает его глубину. */
export function pushOverlay(close: () => void): number {
  ensureListener();
  // Первый оверлей после перезагрузки: если браузер восстановил нашу запись
  // (state с глубиной), продолжаем нумерацию от неё, чтобы «Назад» сработал.
  if (registry.length === 0) depth = Math.max(depth, readDepth(readState()));

  depth += 1;
  const myDepth = depth;
  registry.push({ depth: myDepth, close });

  const state = readState();
  const next = { ...state, [DEPTH_KEY]: myDepth, [CONSUMED_KEY]: false };
  // Запись, оставшуюся от прошлого закрытия, переиспользуем — история не растёт.
  if (state[CONSUMED_KEY] === true) {
    window.history.replaceState(next, "");
  } else {
    window.history.pushState(next, "");
  }
  return myDepth;
}

/** Снимает оверлей с учёта (закрытие программное — Esc, крестик, бэкдроп). */
export function popOverlay(myDepth: number): void {
  const i = registry.findIndex((entry) => entry.depth === myDepth);
  if (i === -1) return;
  registry.splice(i, 1);
  // Закрылся не верхний оверлей — его запись потребит более позднее «Назад».
  if (depth !== myDepth) return;

  depth = myDepth - 1;
  window.history.replaceState(
    { ...readState(), [DEPTH_KEY]: depth, [CONSUMED_KEY]: true },
    ""
  );

  // Отложенная уборка «израсходованной» записи: если к следующему тику её
  // никто не занял, убираем её из истории, чтобы «Назад» сразу уводил со
  // страницы, а не требовал второго нажатия.
  window.setTimeout(() => {
    if (depth !== 0 || registry.length > 0) return;
    if (readState()[CONSUMED_KEY] !== true) return;
    window.history.back();
  }, 0);
}

/**
 * Подключает оверлей к истории: пока `open`, системное «Назад» вызывает
 * `onClose` вместо ухода со страницы.
 */
export function useOverlayHistory(open: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  // Колбэк обновляем в отдельном эффекте (объявлен раньше — выполнится первым):
  // родитель создаёт новую функцию на каждом рендере, и без ref эффект ниже
  // перезапускался бы, снимая и заново ставя запись истории на каждый рендер.
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const myDepth = pushOverlay(() => onCloseRef.current());
    return () => popOverlay(myDepth);
  }, [open]);
}
