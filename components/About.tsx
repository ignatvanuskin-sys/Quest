"use client";

import Image from "next/image";
import Reveal from "@/components/Reveal";

const LINES = [
  "NOX — это не аттракцион. Это час, в который вы забудете, что происходящее — постановка.",
  "Живые актёры, реальные декорации, звук и свет, которые работают против вас.",
  "Мы не пугаем скримерами — мы строим напряжение, которое не отпускает.",
];

const STATS = [
  { value: "5", label: "комнат" },
  { value: "40+", label: "актёров-аниматоров" },
  { value: "16 000", label: "прошедших квест" },
];

/**
 * О бренде: короткий манифест крупной типографикой + три трастовых блока.
 * Текст проявляется построчно при входе во вьюпорт.
 */
export default function About() {
  return (
    <section
      id="about"
      className="relative mx-auto max-w-5xl overflow-hidden px-6 py-28 md:py-40"
      aria-label="О NOX"
    >
      {/* Фоновый образ (десктоп): коридор с туманом, сильно приглушён */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] opacity-25 lg:block"
        aria-hidden="true"
      >
        <Image
          src="/media/bg-about.jpg"
          alt=""
          fill
          sizes="46vw"
          className="object-cover"
          style={{ objectPosition: "50% 40%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, var(--bg) 0%, rgba(10,9,8,0.55) 45%, rgba(10,9,8,0.15) 100%)",
          }}
        />
      </div>

      <Reveal>
        <p className="tracking-caps text-[11px] text-muted">О НАС</p>
      </Reveal>

      <div className="mt-8 space-y-8">
        {LINES.map((line, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <p className="text-fg/90 font-display text-2xl leading-snug md:text-4xl">
              {line}
            </p>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-3">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="bg-bg">
            <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 px-4 py-8 text-center">
              <span className="font-display text-4xl text-fg md:text-5xl">{s.value}</span>
              <span className="tracking-caps text-[11px] text-muted">{s.label}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
