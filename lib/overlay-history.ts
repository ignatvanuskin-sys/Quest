"use client";

import { useEffect, useRef } from "react";

/**
 * История навигации для оверлеев (модалка брони, детали квеста, бургер-меню).
 *
 * ЗАЧЕМ. На Android системная кнопка/жест «Назад» — основной способ закрыть
 * экран. Без этой логики открытие оверлея не создавало записи в истории:
 * «Назад» либо не делал ничего, либо уводил со страницы вместе с открытой формой.
 *
 * КАК. Каждый оверлей при открытии помечает запись истории глубиной
 * (`pushState` с `__noxOverlayDepth`), а на `popstate` закрывается ровно тот
 * оверлей, чью запись «отмотали». Вложенные оверлеи получают глубину 2, 3…,
 * поэтому первое «Назад» закрывает верхний, второе — следующий под ним.
 *
 * ПОЧЕМУ ЗДЕСЬ НЕТ `history.back()` — ЭТО ВАЖНО.
 * Первая версия при программном закрытии «убирала» свою запись вызовом
 * `history.back()`. На телефоне это вылезло багом: браузер выполняет переход
 * не мгновенно, и если гость успевал снова открыть меню (обычный сценарий —
 * закрыл и сразу открыл), отложенный переход прилетал уже при открытом
 * оверлее: `popstate` закрывал его сам — меню «мигало», пропадало и казалось
 * нерабочим, а сам переход добавлял заметный лаг и подвисание кадра.
 * Поэтому мы НИКОГДА не инициируем переход из кода. Закрытие только помечает
 * свою запись израсходованной через `replaceState` — синхронно и без навигации,
 * а следующее открытие эту запись переиспользует, так что история не растёт.
 *
 * Цена решения: после программного закрытия оверлея одно нажатие «Назад»
 * срабатывает «вхолостую» (возвращает на ту же страницу без видимых изменений).
 * Это заметно безопаснее, чем самопроизвольно закрывающиеся диалоги.
 *
 * Схема устойчива к React StrictMode: `replaceState` синхронен, в отличие от
 * отложенного `back()`, который в dev-режиме с двойным монтажом эффекта
 * прилетал уже после повторного `pushState` и закрывал только что открытый оверлей.
 */

const DEPTH_KEY = "__noxOverlayDepth";
const CONSUMED_KEY = "__noxOverlayConsumed";

type OverlayEntry = {
  depth: number;
  close: () => void;
};

/** Открытые оверлеи по возрастанию глубины (последний — верхний) */
const registry: OverlayEntry[] = [];

/**
 * Глубина, записанная в ТЕКУЩУЮ запись истории.
 * Источник правды о том, на какой записи мы стоим, — состояние самой записи,
 * а не счётчик открытых оверлеев в памяти.
 */
let stateDepth = 0;
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
  // Браузер мог восстановить нашу запись (перезагрузка, возврат из bfcache) —
  // тогда продолжаем нумерацию от неё, чтобы «Назад» отработал корректно.
  stateDepth = Math.max(stateDepth, readDepth(readState()));

  window.addEventListener("popstate", (event: PopStateEvent) => {
    const state: unknown = event.state;
    const next = readDepth(
      state && typeof state === "object" ? (state as Record<string, unknown>) : {}
    );
    const popped = stateDepth;
    stateDepth = next;

    // Перешли вперёд или это чужая навигация (роутер, внешний переход) —
    // оверлеи не трогаем. Закрываем только при движении назад по нашим записям.
    if (popped <= next) return;

    // «Назад» могли нажать с удержанием и отмотать несколько записей сразу —
    // закрываем все оверлеи глубже новой позиции, сверху вниз.
    while (registry.length > 0 && registry[registry.length - 1].depth > next) {
      const top = registry.pop() as OverlayEntry;
      top.close();
    }
  });
}

/** Регистрирует оверлей в истории. Возвращает его глубину. */
export function pushOverlay(close: () => void): number {
  ensureListener();
  if (registry.length === 0) stateDepth = Math.max(stateDepth, readDepth(readState()));

  stateDepth += 1;
  const myDepth = stateDepth;
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

/** Снимает оверлей с учёта (закрытие программное — Esc, крестик, бэкдроп, клик по пункту меню). */
export function popOverlay(myDepth: number): void {
  const i = registry.findIndex((entry) => entry.depth === myDepth);
  // Оверлея нет в реестре — его уже закрыл переход «Назад».
  if (i === -1) return;
  registry.splice(i, 1);
  // Закрылся не верхний оверлей — его запись потребит более позднее «Назад».
  if (stateDepth !== myDepth) return;

  stateDepth = myDepth - 1;
  // Только помечаем запись израсходованной. Никаких переходов: иначе на телефоне
  // отложенный back() прилетает уже при следующем открытом оверлее и закрывает его.
  window.history.replaceState(
    { ...readState(), [DEPTH_KEY]: stateDepth, [CONSUMED_KEY]: true },
    ""
  );
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
