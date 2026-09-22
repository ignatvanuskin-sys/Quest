"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Reveal from "@/components/Reveal";

// WebGL-эффект грузим лениво: отдельный чанк, не попадает в основной бандл
const SmokeHeart = dynamic(
  () => import("@/components/ui/SmokeHeart").then((m) => m.SmokeHeart),
  { ssr: false }
);

/**
 * Кинематографичная секция-пауза между каталогом и бронированием:
 * сердце из дыма в палитре сайта (смола → кровавый → акцент) и слоган.
 *
 * Эффект монтируется только когда секция приближается к вьюпорту
 * (rootMargin 300px) — до этого показывается лёгкий CSS-градиент.
 * Дальше пауза вне вьюпорта, лимит пикселей и prefers-reduced-motion
 * обрабатываются внутри самого SmokeHeart.
 */
export default function SmokeHeartBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mountEffect, setMountEffect] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMountEffect(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="atmosphere"
      aria-label="Атмосфера NOX"
      className="below-fold relative isolate flex h-[58vh] min-h-[360px] items-center justify-center overflow-hidden md:h-[68vh]"
    >
      {mountEffect && <SmokeHeart className="absolute inset-0" />}

      {/* Затемнение краёв и подложка под текст — читаемость поверх эффекта */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, var(--bg) 0%, rgba(10,9,8,0.35) 22%, rgba(10,9,8,0.45) 62%, var(--bg) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(closest-side at 50% 55%, rgba(10,9,8,0.58) 0%, rgba(10,9,8,0.18) 55%, rgba(10,9,8,0.55) 100%)",
        }}
      />

      <div className="relative z-10 px-6 text-center">
        <Reveal>
          <p className="tracking-caps text-fg/60 text-[10px]">MEMENTO MORI</p>
          <p className="mx-auto mt-6 max-w-2xl font-display text-3xl leading-snug text-fg md:text-5xl">
            Страх живёт в паузе между ударами сердца.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
