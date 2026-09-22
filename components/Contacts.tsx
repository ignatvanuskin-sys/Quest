"use client";

import Reveal from "@/components/Reveal";
import QuestArt from "@/components/QuestArt";

/**
 * Локация и контакты.
 * Карта — атмосферная заглушка с пином; при адаптации замените на
 * статичную картинку карты (self-hosted) или embed Яндекс.Карт.
 * Адрес/телефон/ссылки — плейсхолдеры.
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
        {/* Карта-заглушка с пином */}
        <Reveal className="relative min-h-[300px] overflow-hidden border border-line">
          <QuestArt seed={31} label="Схематичная карта района" />
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
            <span className="bg-bg/70 tracking-caps mt-3 border border-line px-3 py-1.5 text-[10px] text-fg backdrop-blur-sm">
              МЫ ЗДЕСЬ
            </span>
          </div>
        </Reveal>

        {/* Контакты */}
        <Reveal delay={0.1}>
          <div className="panel flex h-full flex-col justify-center gap-8 p-8 md:p-10">
            <div>
              <h3 className="tracking-caps text-[11px] text-muted">АДРЕС</h3>
              <p className="mt-2 font-display text-2xl text-fg">
                ул. Примерная, 13, подвальный этаж
              </p>
              <p className="mt-1 text-sm text-muted">
                Вход со двора, чёрная дверь без вывески. Вы не ошиблись.
              </p>
            </div>

            <div>
              <h3 className="tracking-caps text-[11px] text-muted">ЧАСЫ РАБОТЫ</h3>
              <p className="mt-2 text-fg">Ежедневно, 12:00 — 23:00</p>
              <p className="mt-1 text-sm text-muted">
                Последний сеанс начинается в 22:00
              </p>
            </div>

            <div>
              <h3 className="tracking-caps text-[11px] text-muted">СВЯЗЬ</h3>
              <div className="mt-3 flex flex-col gap-2">
                <a
                  href="tel:+70000000000"
                  className="inline-flex min-h-[44px] items-center font-display text-2xl text-fg transition-colors hover:text-accent-bright"
                >
                  +7 (000) 000-00-00
                </a>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a
                    href="https://t.me/nox_quests"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-[11px]"
                  >
                    Telegram
                  </a>
                  <a
                    href="https://wa.me/70000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-[11px]"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="https://instagram.com/nox.quests"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost text-[11px]"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="tracking-caps text-[11px] text-muted">БОНУСЫ</h3>
              <ul className="text-fg/80 mt-3 space-y-2 text-sm">
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
                  Видеозапись прохождения +1 500 ₽
                </li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
