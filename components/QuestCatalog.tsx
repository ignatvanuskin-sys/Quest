"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GENRES, QUESTS, type GenreId, type Quest } from "@/lib/quests";
import QuestCard from "@/components/QuestCard";
import QuestShowcase from "@/components/QuestShowcase";
import QuestModal from "@/components/QuestModal";
import Reveal from "@/components/Reveal";

/**
 * Каталог квестов: фильтр-чипы по жанру + карточки.
 * Мобильный — горизонтальная snap-карусель на всю ширину;
 * десктоп — сетка внутри того же центрированного контейнера, что и заголовок,
 * поэтому карточки выровнены с ним и по центру страницы.
 * Открытие детальной карточки — shared-layout переход (layoutId) в модалку.
 */
export default function QuestCatalog() {
  const [filter, setFilter] = useState<GenreId | "all">("all");
  const [active, setActive] = useState<Quest | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  // Индикатор карусели на мобильном: «N / всего»
  const [slide, setSlide] = useState(1);

  const visible = useMemo(
    () => (filter === "all" ? QUESTS : QUESTS.filter((q) => q.genreIds.includes(filter))),
    [filter]
  );

  const onRowScroll = () => {
    const row = rowRef.current;
    const first = row?.firstElementChild as HTMLElement | null;
    if (!row || !first) return;
    const step = first.offsetWidth + 16; // 16px = gap-4
    setSlide(
      Math.min(visible.length, Math.max(1, Math.round(row.scrollLeft / step) + 1))
    );
  };

  // Колесо мыши → горизонтальный скролл карусели (только когда она реально
  // скроллится — на мобильных/узких вьюпортах). Без этого wheel просто крутит
  // страницу, а карточки остаются неподвижны.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const onWheel = (e: WheelEvent) => {
      const el = rowRef.current;
      if (!el) return;
      // Работаем только когда контейнер реально скроллится по горизонтали
      if (el.scrollWidth <= el.clientWidth + 1) return;
      // Преимущественно горизонтальный трекпад — пропускаем (не ломаем нативный UX)
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    row.addEventListener("wheel", onWheel, { passive: false });
    return () => row.removeEventListener("wheel", onWheel);
  }, [visible.length]);

  return (
    <section id="quests" className="relative py-28 md:py-36" aria-label="Каталог квестов">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <p className="tracking-caps text-[11px] text-muted">КАТАЛОГ</p>
          <h2 className="mt-4 font-display text-4xl text-fg md:text-6xl">
            Выберите свой страх
          </h2>
        </Reveal>

        {/* Интерактивная витрина: крупные обложки со сменой + автопрокрутка */}
        <Reveal delay={0.05}>
          <div className="mt-10">
            <QuestShowcase onOpen={setActive} />
          </div>
        </Reveal>

        {/* Фильтры */}
        <Reveal delay={0.1}>
          <div
            className="mt-10 flex flex-wrap gap-2"
            role="group"
            aria-label="Фильтр по жанру"
          >
            <button
              type="button"
              className="chip"
              data-active={filter === "all"}
              onClick={() => {
                setFilter("all");
                setSlide(1);
              }}
              aria-pressed={filter === "all"}
            >
              Все
            </button>
            {GENRES.map((g) => (
              <button
                key={g.id}
                type="button"
                className="chip"
                data-active={filter === g.id}
                onClick={() => {
                  setFilter(g.id);
                  setSlide(1);
                }}
                aria-pressed={filter === g.id}
              >
                {g.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Карточки. key={filter} — смена фильтра перезапускает stagger-reveal.
            scroll-pl-6 критично на мобильном: без него scroll-snap выравнивает
            первую карточку по кромке скроллпорта и она прилипает к краю экрана,
            теряя общий отступ 24px (шапка/заголовок остаются с отступом). */}
        <div
          key={filter}
          ref={rowRef}
          onScroll={onRowScroll}
          className="snap-row -mx-6 mt-10 flex scroll-pl-6 gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:mt-12 md:grid md:scroll-pl-0 md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 xl:grid-cols-4"
        >
          {visible.map((quest, i) => (
            <QuestCard key={quest.slug} quest={quest} index={i} onOpen={setActive} />
          ))}
        </div>

        {/* Индикатор прогресса карусели — только мобильный */}
        <div
          className="tracking-caps mt-2 flex items-center justify-center gap-2 text-[11px] text-muted md:hidden"
          aria-live="polite"
        >
          <span>{slide}</span>
          <span className="h-px w-6 bg-line" aria-hidden="true" />
          <span>{visible.length}</span>
        </div>
      </div>

      {/* Shared-layout переход карточка → детальная модалка */}
      <AnimatePresence>
        {active && <QuestModal quest={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}
