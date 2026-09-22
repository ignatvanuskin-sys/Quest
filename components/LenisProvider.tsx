"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { LENIS_EVENT, LENIS_STOP_EVENT, LENIS_START_EVENT } from "@/lib/scroll";

/**
 * Глобальный инерционный скролл Lenis.
 * - При prefers-reduced-motion не инициализируется (нативный скролл).
 * - Гоняется через rAF; GSAP ScrollTrigger синхронизируется через событие scroll.
 * - Слушает CustomEvent LENIS_EVENT для плавного скролла к якорям.
 */
export default function LenisProvider() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Синхронизация с GSAP ScrollTrigger
    const syncGsap = async () => {
      try {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        lenis.on("scroll", () => ScrollTrigger.update());
      } catch {
        /* gsap может быть ещё не загружен — не критично */
      }
    };
    void syncGsap();

    const onScrollTo = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      const el = document.getElementById(id);
      if (!el) return;
      lenis.scrollTo(el, { offset: -72, duration: 1.4 });
    };
    const onStop = () => lenis.stop();
    const onStart = () => lenis.start();
    window.addEventListener(LENIS_EVENT, onScrollTo);
    window.addEventListener(LENIS_STOP_EVENT, onStop);
    window.addEventListener(LENIS_START_EVENT, onStart);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(LENIS_EVENT, onScrollTo);
      window.removeEventListener(LENIS_STOP_EVENT, onStop);
      window.removeEventListener(LENIS_START_EVENT, onStart);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
