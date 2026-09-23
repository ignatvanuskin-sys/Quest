"use client";

import { useEffect } from "react";
import { LENIS_START_EVENT, LENIS_STOP_EVENT } from "@/lib/scroll";

/**
 * Блокировка прокрутки фона под оверлеями (модалки, бургер-меню).
 *
 * Раньше эта логика была продублирована в трёх компонентах и каждый из них
 * писал `documentElement.style.overflow` напрямую. При вложенных оверлеях
 * (квест → бронь) закрытие нижнего снимало блокировку, хотя верхний ещё
 * открыт — страница на миг становилась прокручиваемой.
 *
 * Теперь счётчик: блокировка снимается только когда закрылся последний оверлей.
 * Дополнительно на <html> вешается класс `scroll-locked` — он гасит
 * scroll-chaining и «отскок» (rubber-band) на iOS, из-за которых жест по
 * бэкдропу мог утащить фон под модалкой.
 */
let locks = 0;

export function lockScroll(): void {
  if (typeof document === "undefined") return;
  locks += 1;
  if (locks > 1) return;

  document.documentElement.classList.add("scroll-locked");
  document.documentElement.style.overflow = "hidden";
  // Останавливаем Lenis, иначе колесо мыши/тач скроллят страницу под модалкой
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LENIS_STOP_EVENT));
  }
}

export function unlockScroll(): void {
  if (typeof document === "undefined") return;
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;

  document.documentElement.classList.remove("scroll-locked");
  document.documentElement.style.overflow = "";
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LENIS_START_EVENT));
  }
}

/** Блокирует прокрутку фона, пока `active`. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return unlockScroll;
  }, [active]);
}
