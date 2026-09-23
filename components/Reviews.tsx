import Reveal from "@/components/Reveal";
import { REVIEWS, REVIEWS_AVG } from "@/lib/reviews";
import { QUESTS } from "@/lib/quests";

const AVG = REVIEWS_AVG;

/** slug → человекочитаемое название квеста (единый источник — lib/quests.ts) */
const questTitle = (slug: string) => QUESTS.find((q) => q.slug === slug)?.title ?? slug;

/** «Алина К.» → «АК» */
function initials(name: string): string {
  const parts = name.replace(/\./g, "").trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

/** Звёзды с дробным заполнением (для средней оценки) */
function Stars({ value }: { value: number }) {
  return (
    <div
      className="flex gap-1 text-accent-text"
      aria-label={`Оценка ${value.toFixed(1)} из 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: 14, height: 14 }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute inset-0 text-line"
              aria-hidden="true"
            >
              <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
            </svg>
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * Отзывы: адаптивная сетка карточек (первая — крупная featured).
 * Блок со средней оценкой + карточки с аватаром-инициалами, датой,
 * названием квеста (по slug из каталога) и меткой прохождения.
 * Данные — из lib/reviews.ts (единый источник, демо-плейсхолдеры).
 */
export default function Reviews() {
  return (
    <section id="reviews" className="below-fold py-28 md:py-36" aria-label="Отзывы">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="tracking-caps text-[11px] text-muted">ГОЛОСА ВЫЖИВШИХ</p>
              <h2 className="mt-4 font-display text-4xl text-fg md:text-5xl">Отзывы</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Реальные игроки NOX о том, что чувствовали, пока длился час страха.
              </p>
            </div>

            {/* Сводная оценка */}
            <div className="panel flex shrink-0 items-center gap-5 px-5 py-4 md:px-6">
              <div className="font-display text-5xl leading-none text-fg">
                {AVG.toFixed(1)}
              </div>
              <div>
                <Stars value={AVG} />
                <p className="tracking-caps mt-1.5 text-[11px] text-muted">
                  НА ОСНОВЕ {REVIEWS.length} ОТЗЫВОВ
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Сетка карточек: первая — крупная featured, остальные — равные */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-4 px-6 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r, i) => {
          const featured = i === 0;
          return (
            <Reveal
              key={r.name}
              delay={Math.min(i * 0.06, 0.3)}
              className={featured ? "md:col-span-2 lg:col-span-2" : ""}
            >
              <figure
                className={`panel relative flex h-full flex-col gap-6 p-7 md:p-8 ${
                  featured ? "lg:p-10" : ""
                }`}
              >
                <span
                  className={`pointer-events-none absolute right-6 top-1 select-none font-display leading-none text-accent-bright/10 ${
                    featured ? "text-9xl" : "text-7xl"
                  }`}
                  aria-hidden="true"
                >
                  &rdquo;
                </span>

                {/* Шапка карточки: аватар, имя, дата */}
                <div className="flex items-center gap-4">
                  <span
                    className={`flex shrink-0 items-center justify-center rounded-full border border-accent-bright/40 bg-accent/15 font-display text-accent-text ${
                      featured ? "h-14 w-14 text-base" : "h-11 w-11 text-sm"
                    }`}
                    aria-hidden="true"
                  >
                    {initials(r.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate font-medium text-fg ${featured ? "text-base" : "text-[14px]"}`}
                    >
                      {r.name}
                    </p>
                    <p className="tracking-caps mt-0.5 text-[11px] text-muted">
                      {r.date}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0">
                    <Stars value={r.rating} />
                  </span>
                </div>

                {/* Текст отзыва */}
                <blockquote
                  className={`leading-relaxed text-fg/85 ${
                    featured ? "text-base md:text-lg" : "text-sm"
                  }`}
                >
                  &laquo;{r.text}&raquo;
                </blockquote>

                {/* Подвал карточки: квест + верификация */}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <span className="tracking-caps border border-line bg-bg-alt px-3 py-1.5 text-[11px] text-muted">
                    КВЕСТ:{" "}
                    <span className="text-accent-text">
                      {questTitle(r.questSlug).toUpperCase()}
                    </span>
                  </span>
                  <span className="tracking-caps flex items-center gap-1.5 text-[11px] text-muted">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 8.5l3.5 3.5 7-8"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                    </svg>
                    ПРОЙДЕНА ИГРА
                  </span>
                </div>
              </figure>
            </Reveal>
          );
        })}
      </div>

      <p className="tracking-caps mx-auto mt-8 max-w-6xl px-6 text-[11px] text-muted">
        Все отзывы — от гостей, реально прошедших комнаты
      </p>
    </section>
  );
}
