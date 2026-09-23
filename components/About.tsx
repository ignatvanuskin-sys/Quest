import Image from "next/image";
import Reveal from "@/components/Reveal";
import { QUESTS } from "@/lib/quests";

const LINES = [
  "NOX — это не аттракцион. Это час, в который вы забудете, что происходящее — постановка.",
  "Живые актёры, реальные декорации, звук и свет, которые работают против вас.",
  "Мы не пугаем скримерами — мы строим напряжение, которое не отпускает.",
];

/** «4 комнаты» / «5 комнат» — правильная форма для числа из каталога */
function roomsLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "комната";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "комнаты";
  return "комнат";
}

/**
 * Число комнат берётся из каталога (lib/quests.ts), а не хардкодится:
 * раньше здесь стояло «5 комнат» при четырёх квестах в каталоге —
 * расхождение было видно невооружённым глазом.
 */
const STATS = [
  { value: String(QUESTS.length), label: roomsLabel(QUESTS.length) },
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
              "linear-gradient(90deg, rgb(var(--bg)) 0%, rgba(10,9,8,0.55) 45%, rgba(10,9,8,0.15) 100%)",
          }}
        />
      </div>

      {/* Настоящий h2: раньше здесь был <p>, и у секции не было заголовка —
          после h1 из Hero сразу шёл h3 в карточках статистики, что нарушает
          порядок заголовков (WCAG 1.3.1). Визуально это тот же мелкий капс:
          font-body снимает дисплейную гарнитуру, которую базовый слой
          навешивает на h1–h4. */}
      <Reveal>
        <h2 className="tracking-caps font-body text-[11px] font-normal text-muted">
          О НАС
        </h2>
      </Reveal>

      <div className="mt-8 space-y-8">
        {LINES.map((line, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <p className="font-display text-2xl leading-snug text-fg/90 md:text-4xl">
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
