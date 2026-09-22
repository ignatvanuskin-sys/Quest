import Reveal from "@/components/Reveal";
import type { FaqItem } from "@/lib/faq";

export type { FaqItem };

interface FaqGridProps {
  /** Вопросы и ответы (единый источник — lib/faq.ts) */
  items: FaqItem[];
  /** Надзаголовок-лейбл: капс с разрядкой (как остальные секции сайта) */
  label?: string;
  title?: string;
  description?: string;
  /** id секции — для анкорной навигации (например, #safety) */
  id?: string;
  className?: string;
}

/**
 * FAQ-сетка в стиле NOX — адаптация блока «Quick Answers» (8bit-faq2).
 *
 * Отличия от исходника: тёмная хоррор-палитра NOX (bg/bg-alt/fg/muted/accent),
 * шрифт заголовков — Cormorant (font-display), «кровавый» акцент на ховере,
 * тонкие hairline-разделители вместо ретро-бордеров, scroll-reveal на карточках.
 *
 * Server component: без "use client" и без JS — весь контент в HTML,
 * что важно для SEO FAQ-разметки (JSON-LD в app/page.tsx). Reveal внутри
 * остаётся клиентским.
 */
export default function FaqGrid({
  items,
  label,
  title,
  description,
  id,
  className = "",
}: FaqGridProps) {
  const hasHeader = Boolean(label || title || description);

  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-6 py-28 md:py-36 ${className}`}
      aria-label={title ?? "Частые вопросы"}
    >
      {hasHeader && (
        <Reveal>
          {label && <p className="tracking-caps text-[11px] text-muted">{label}</p>}
          {title && (
            <h2 className="mt-4 font-display text-4xl text-fg md:text-5xl">{title}</h2>
          )}
          {description && (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
        </Reveal>
      )}

      {/* Сетка карточек: разделители — тонкие линии фона между ячейками */}
      <div
        className={`grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 ${
          hasHeader ? "mt-12" : ""
        }`}
      >
        {items.map((item, i) => (
          <Reveal key={item.question} delay={Math.min(i * 0.05, 0.3)} className="h-full">
            <article className="group relative flex h-full flex-col gap-3 bg-bg-alt p-6 transition-colors duration-300 ease-cinematic hover:bg-bg md:p-7">
              {/* Кровавый акцент: линия по верхней кромке проявляется на ховере */}
              <span
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent-bright transition-transform duration-500 ease-cinematic group-hover:scale-x-100"
                aria-hidden="true"
              />
              <h3 className="font-display text-xl leading-snug text-fg transition-colors duration-300 group-hover:text-accent-bright">
                {item.question}
              </h3>
              <p className="text-sm leading-relaxed text-muted">{item.answer}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
