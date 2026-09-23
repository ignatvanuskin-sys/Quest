import Reveal from "@/components/Reveal";
import QuestArt from "@/components/QuestArt";
import { CONTACTS, SOCIAL_LINKS } from "@/lib/contacts";
import { VIDEO_RECORD_PRICE } from "@/lib/site";

/**
 * Локация и контакты.
 * Слева — атмосферная схема района с пином (декоративный арт, не карта
 * с точной привязкой: квест-румы не публикуют точный адрес до брони).
 * Справа — адрес-ориентир, часы работы, телефон и соцсети.
 * Все данные — из lib/contacts.ts, единого источника.
 */
export default function Contacts() {
  return (
    <section
      id="contacts"
      className="mx-auto max-w-6xl px-6 py-28 md:py-36"
      aria-label="Локация и контакты"
    >
      <Reveal>
        <p className="tracking-caps text-[11px] text-muted">НАЙТИ НАС</p>
        <h2 className="mt-4 font-display text-4xl text-fg md:text-5xl">
          Локация и контакты
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {/* Схема района с пином (декоративный арт) */}
        <Reveal className="relative min-h-[300px] overflow-hidden border border-line">
          <QuestArt
            seed={31}
            label={`Схема расположения: ${CONTACTS.city}, ${CONTACTS.district}`}
          />
          <div
            className="absolute inset-0 opacity-25"
            aria-hidden="true"
            style={{
              backgroundImage:
                "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          {/* Пин */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="relative flex h-5 w-5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-bright opacity-40" />
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-bright">
                <span className="h-1.5 w-1.5 rounded-full bg-fg" />
              </span>
            </span>
            <span className="tracking-caps mt-3 border border-line bg-bg/70 px-3 py-1.5 text-[11px] text-fg backdrop-blur-sm">
              {CONTACTS.district}
            </span>
          </div>
        </Reveal>

        {/* Контакты */}
        <Reveal delay={0.1}>
          <div className="panel flex h-full flex-col justify-center gap-8 p-8 md:p-10">
            <div>
              <h3 className="tracking-caps text-[11px] text-muted">АДРЕС</h3>
              <p className="mt-2 font-display text-2xl text-fg">{CONTACTS.city}</p>
              <p className="mt-1 text-sm text-muted">{CONTACTS.addressNote}</p>
            </div>

            <div>
              <h3 className="tracking-caps text-[11px] text-muted">ЧАСЫ РАБОТЫ</h3>
              <p className="mt-2 text-fg">{CONTACTS.hours}</p>
              <p className="mt-1 text-sm text-muted">{CONTACTS.hoursNote}</p>
            </div>

            <div>
              <h3 className="tracking-caps text-[11px] text-muted">СВЯЗЬ</h3>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href={CONTACTS.phoneHref}
                  className="inline-flex min-h-[44px] items-center font-display text-2xl text-fg transition-colors hover:text-accent-text"
                >
                  {CONTACTS.phoneDisplay}
                </a>
                <div className="mt-2 flex flex-wrap gap-3">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost text-[11px]"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="tracking-caps text-[11px] text-muted">БОНУСЫ</h3>
              <ul className="mt-3 space-y-2 text-sm text-fg/80">
                <li className="flex gap-2">
                  <span
                    className="mt-[9px] h-px w-4 shrink-0 bg-accent-bright"
                    aria-hidden="true"
                  />
                  Подарочные сертификаты — готовый подарок на любую сумму
                </li>
                <li className="flex gap-2">
                  <span
                    className="mt-[9px] h-px w-4 shrink-0 bg-accent-bright"
                    aria-hidden="true"
                  />
                  Имениннику скидка 15% в день рождения
                </li>
                <li className="flex gap-2">
                  <span
                    className="mt-[9px] h-px w-4 shrink-0 bg-accent-bright"
                    aria-hidden="true"
                  />
                  Видеозапись прохождения +{VIDEO_RECORD_PRICE}
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
