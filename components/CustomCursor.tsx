"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Кастомный курсор (десктоп-only):
 * — тонкое кольцо, увеличивается и подсвечивается акцентом над интерактивными элементами;
 * — красное «свечение», следующее за курсором с задержкой (lerp).
 * Отключён на touch-устройствах и при prefers-reduced-motion.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFine || reduced) return;

    // Слабые CPU: пропускаем тяжёлое красное свечение (h-72 градиент перерисовки
    // на каждый кадр) — оставляем только лёгкое кольцо
    const weakCpu = (window.navigator.hardwareConcurrency ?? 8) <= 4;
    if (weakCpu) glowRef.current?.remove();

    setEnabled(true);
    document.body.classList.add("has-custom-cursor");

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let gx = mx;
    let gy = my;
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as HTMLElement | null;
      hovering = !!t?.closest(
        "a, button, [role='button'], input, select, textarea, label, summary"
      );
    };

    const loop = () => {
      // кольцо — почти без задержки, свечение — с заметной
      rx += (mx - rx) * 0.35;
      ry += (my - ry) * 0.35;
      gx += (mx - gx) * 0.08;
      gy += (my - gy) * 0.08;

      const ring = ringRef.current;
      const glow = glowRef.current;
      if (ring) {
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hovering ? 1.7 : 1})`;
        ring.style.borderColor = hovering
          ? "var(--accent-bright)"
          : "rgba(236,231,223,0.55)";
      }
      if (glow) {
        glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    // Safety: если rAF-луп упала (например, вкладка заснула),
    // убираем cursor:none через 3с бездействия, чтобы курсор не пропал
    let lastMove = Date.now();
    const safetyCheck = window.setInterval(() => {
      if (Date.now() - lastMove > 3000) {
        document.body.classList.remove("has-custom-cursor");
      } else {
        document.body.classList.add("has-custom-cursor");
      }
    }, 1000);
    const onMoveSafety = () => {
      lastMove = Date.now();
    };
    window.addEventListener("mousemove", onMoveSafety, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousemove", onMoveSafety);
      cancelAnimationFrame(raf);
      window.clearInterval(safetyCheck);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* красное свечение с задержкой */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[85] h-72 w-72 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(179,34,44,0.35) 0%, rgba(122,15,22,0.12) 40%, transparent 70%)",
        }}
      />
      {/* тонкое кольцо-курсор */}
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[95] h-7 w-7 rounded-full border transition-[border-color] duration-200"
        style={{ borderColor: "rgba(236,231,223,0.55)" }}
      />
    </>
  );
}
