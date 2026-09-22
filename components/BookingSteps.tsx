"use client";

import Image from "next/image";
import Reveal from "@/components/Reveal";

const STEPS = [
  {
    n: "01",
    title: "Выберите квест и время",
    text: "Определитесь со страхом и удобным слотом — от 12:00 до 22:00.",
    icon: (
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm1-13h-2v6l5.2 3.1 1-1.6-4.2-2.5V7z" />
    ),
  },
  {
    n: "02",
    title: "Оставьте заявку",
    text: "Мы перезвоним в течение 15 минут, чтобы подтвердить бронь.",
    icon: (
      <path d="M6.6 10.8a15.9 15.9 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1l-2.22 2.2z" />
    ),
  },
  {
    n: "03",
    title: "Внесите предоплату",
    text: "Опционально — если требуется для выбранной комнаты и даты.",
    icon: (
      <path d="M21 7H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-1 8H4v-2.5h2V11H4V9h16v2h-2v1.5h2V15z" />
    ),
  },
  {
    n: "04",
    title: "Приезжайте за 10 минут",
    text: "Инструктаж, сдача телефонов — остальное сделаем мы.",
    icon: (
      <path d="M12 2 4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4zm0 2.2 6 3v4.7c0 4-2.6 7.6-6 8.1-3.4-.5-6-4.1-6-8.1V7.2l6-3z" />
    ),
  },
];

/**
 * Как проходит бронирование: горизонтальный таймлайн (десктоп) /
 * вертикальный стэк (мобильный), line-иконки.
 */
export default function BookingSteps() {
  return (
    <section
      id="steps"
      className="relative mx-auto max-w-6xl overflow-hidden px-6 py-28 md:py-36"
      aria-label="Как проходит бронирование"
    >
      {/* Фоновый образ (десктоп): приоткрытая дверь со светом */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] opacity-20 lg:block"
        aria-hidden="true"
      >
        <Image
          src="/media/bg-steps.jpg"
          alt=""
          fill
          sizes="40vw"
          className="object-cover"
          style={{ objectPosition: "60% 50%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgb(var(--bg)) 0%, rgba(10,9,8,0.5) 50%, rgba(10,9,8,0.2) 100%)",
          }}
        />
      </div>

      <Reveal>
        <p className="tracking-caps text-[11px] text-muted">ПРОСТО</p>
        <h2 className="mt-4 font-display text-4xl text-fg md:text-5xl">
          Как проходит бронирование
        </h2>
      </Reveal>

      <ol className="mt-14 space-y-10 md:grid md:grid-cols-4 md:gap-6 md:space-y-0">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 0.12} className="relative md:pt-10">
            {/* соединительная линия таймлайна (десктоп) */}
            <span
              className="absolute left-0 top-5 hidden h-px w-full bg-line md:block"
              aria-hidden="true"
            />
            <span
              className="absolute left-0 top-[18px] hidden h-[5px] w-[5px] rounded-full bg-accent-bright md:block"
              aria-hidden="true"
            />
            <div className="flex items-start gap-4 md:flex-col">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="shrink-0 text-fg/70"
              >
                {s.icon}
              </svg>
              <div>
                <p className="tracking-caps text-[11px] text-accent-text">{s.n}</p>
                <h3 className="mt-2 font-display text-xl text-fg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
