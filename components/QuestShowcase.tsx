"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QUESTS, type Quest } from "@/lib/quests";
import { openBookingMenu, preselectQuest } from "@/lib/scroll";

/** Автопрокрутка слайда, мс */
const AUTO_MS = 6000;

interface QuestShowcaseProps {
  onOpen: (quest: Quest) => void;
}

/**
 * Интерактивная витрина квестов — адаптация «lumina-interactive-list» под NOX.
 * Крупные обложки со сменой «кроссфейд + медленный Ken Burns зум», анимированный
 * заголовок (framer-motion), навигация-полосы с прогрессом автопрокрутки,
 * счётчик 01/NN. Автопрокрутка ставится на паузу при hover/focus/скрытой вкладке.
 * Вместо CDN-скриптов и WebGL-шейдера — надёжные CSS/framer переходы
 * (mobile-first, без тяжёлой 3D-библиотеки). Данные — из lib/quests.ts.
 * reduced-motion: статичная смена, без автопрокрутки и зума.
 */
export default function QuestShowcase({ onOpen }: QuestShowcaseProps) {
  const reduced = useReducedMotion();
  const count = QUESTS.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const runStartRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  activeRef.current = active;
  pausedRef.current = paused;

  const clearTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const go = useCallback(
    (i: number) => {
      elapsedRef.current = 0;
      setActive((cur) => ((i % count) + count) % count);
    },
    [count]
  );

  const schedule = useCallback(() => {
    clearTimer();
    if (reduced || pausedRef.current) return;
    const remaining = Math.max(60, AUTO_MS - elapsedRef.current);
    runStartRef.current = performance.now();
    timeoutRef.current = window.setTimeout(() => go(activeRef.current + 1), remaining);
  }, [go, reduced]);

  // Смена слайда → сброс накопленного времени и перезапуск таймера
  useEffect(() => {
    elapsedRef.current = 0;
    schedule();
    return clearTimer;
  }, [active, schedule]);

  // Пауза/возобновление с учётом уже прошедшего времени
  useEffect(() => {
    if (reduced) return;
    if (paused) {
      if (runStartRef.current) {
        elapsedRef.current += performance.now() - runStartRef.current;
        runStartRef.current = 0;
      }
      clearTimer();
    } else {
      schedule();
    }
  }, [paused, reduced, schedule]);

  // Пауза, когда вкладка скрыта
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const quest = QUESTS[active];
  const book = () => {
    preselectQuest(quest.slug);
    openBookingMenu();
  };

  // Свайп по витрине: горизонтальный жест меняет слайд,
  // вертикальный — оставляем скроллу страницы
  const touchX = useRef<number | null>(null);
  const touchY = useRef<number | null>(null);

  const onTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (touchX.current == null || touchY.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    touchX.current = null;
    touchY.current = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      go(activeRef.current + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <div
      className="relative flex min-h-[540px] flex-col overflow-hidden border border-line bg-bg-alt md:min-h-[560px]"
      data-showcase-paused={paused ? "true" : "false"}
      /* Пауза по наведению — только для мыши. На тач-устройстве pointerenter
         срабатывает при касании, а pointerleave может не прийти (палец ушёл
         на модалку, элемент уехал из-под пальца) — витрина замирала навсегда. */
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Витрина квестов"
    >
      {/* Фоновые слайды-обложки */}
      <div className="absolute inset-0" aria-hidden="true">
        {QUESTS.map((q, i) => (
          <div key={q.slug} className={`quest-slide ${i === active ? "is-active" : ""}`}>
            <Image
              src={q.cover}
              alt=""
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="quest-slide-img object-cover"
            />
          </div>
        ))}
        {/* Затемнение + кровавая виньетка для читаемости текста */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,9,8,0.2) 0%, rgba(10,9,8,0.45) 45%, rgba(10,9,8,0.92) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 100%, rgba(122,15,22,0.18) 0%, rgba(10,9,8,0) 55%)",
          }}
        />
      </div>

      {/* Навигация-полосы (сверху) */}
      <div
        className="relative z-10 flex gap-2 p-4 md:px-6"
        role="tablist"
        aria-label="Слайды квестов"
      >
        {QUESTS.map((q, i) => (
          <button
            key={q.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Слайд ${i + 1}: ${q.title}`}
            onClick={() => go(i)}
            className="group/nav flex min-h-[44px] flex-1 flex-col justify-center gap-2 px-1"
          >
            <span className="block h-px w-full bg-fg/20">
              {i === active && !reduced ? (
                <span
                  key={active}
                  className="quest-progress-fill"
                  style={{ animationDuration: `${AUTO_MS}ms` }}
                />
              ) : null}
            </span>
            <span
              className={`tracking-caps hidden text-left text-[11px] transition-colors md:block ${
                i === active ? "text-fg" : "text-muted group-hover/nav:text-fg"
              }`}
            >
              {q.title}
            </span>
          </button>
        ))}
      </div>

      {/* Распорка — прижимает контент к низу, блок растёт при узком экране */}
      <div className="flex-1" />

      {/* Контент текущего квеста */}
      <div className="relative z-10 flex flex-col gap-3 p-5 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 flex-1 text-[11px] uppercase leading-relaxed tracking-[0.16em] text-accent-text">
            {quest.genreLabel} · {quest.ageLimit}
          </span>
          <span className="shrink-0 font-display text-sm text-muted" aria-live="polite">
            {String(active + 1).padStart(2, "0")}
            <span className="text-fg/40"> / </span>
            {String(count).padStart(2, "0")}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={quest.slug}
            initial={{ opacity: 0, y: reduced ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : -12 }}
            transition={{ duration: reduced ? 0.15 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-display text-3xl leading-tight text-fg md:text-5xl">
              {quest.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg/80 md:text-base">
              {quest.teaser}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] tracking-wide text-fg/70">
              <span>{quest.durationMin} мин</span>
              <span>
                {quest.playersMin}–{quest.playersMax} игроков
              </span>
              <span className="text-accent-text">
                от {quest.priceFrom.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpen(quest)}
            className="btn-ghost text-[11px]"
          >
            Подробнее
          </button>
          <button type="button" onClick={book} className="btn-primary text-[11px]">
            Забронировать
          </button>
        </div>
      </div>
    </div>
  );
}
