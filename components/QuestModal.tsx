"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Quest } from "@/lib/quests";
import QuestArt from "@/components/QuestArt";
import QuestDetailsBody from "@/components/QuestDetailsBody";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useScrollLock } from "@/lib/scroll-lock";
import { useOverlayHistory } from "@/lib/overlay-history";
import { openBookingMenu, preselectQuest } from "@/lib/scroll";

interface QuestModalProps {
  quest: Quest;
  onClose: () => void;
}

/**
 * Полноэкранная детальная карточка квеста.
 * Shared-layout анимация (layoutId совпадает с карточкой каталога):
 * обложка «разворачивается» в hero-модалки.
 * Фокус переводится в диалог, Esc закрывает, скролл фона блокируется,
 * Tab циклируется внутри модалки (focus trap).
 */
export default function QuestModal({ quest, onClose }: QuestModalProps) {
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // onClose — в ref: при смене идентичности функции (родитель пересоздаёт её
  // на каждом рендере) эффект ниже перезапускался бы, на миг снимая
  // блокировку скролла и возвращая фокус на карточку-триггер.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useFocusTrap(panelRef, true);
  // Блокировка прокрутки фона (счётная — см. lib/scroll-lock)
  useScrollLock(true);
  // Системное «Назад» закрывает детали квеста, а не уводит со страницы
  useOverlayHistory(true, onClose);

  // Esc + перенос фокуса в диалог
  useEffect(() => {
    // Запоминаем элемент, который открыл модалку — вернём фокус при закрытии
    triggerRef.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    // Небольшая задержка чтобы фокус сработал после mount-анимации
    const focusTimer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      // Восстанавливаем фокус на триггер
      triggerRef.current?.focus();
    };
  }, []);

  const bookThis = () => {
    preselectQuest(quest.slug);
    onClose();
    window.setTimeout(() => openBookingMenu(), reduced ? 0 : 200);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-stretch justify-center md:items-center md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`Квест «${quest.title}»`}
    >
      {/* Бэкдроп */}
      {/* Анимация opacity — на обёртке, а не на размытом слое: элемент с
          backdrop-filter при анимации opacity пересобирает размытие каждый
          кадр (на телефоне это мерцание «бликов» за стеклом). */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0.15 : 0.35 }}
      >
        <button
          type="button"
          aria-label="Закрыть"
          className="h-full w-full cursor-default touch-none bg-bg/80 backdrop-blur-sm"
          onClick={onClose}
        />
      </motion.div>

      {/* Панель — shared layout с карточкой.
          overflow-hidden + скролл во внутреннем блоке: hero с крестиком
          остаётся на месте, а прокручиваются только детали. Раньше панель
          скроллилась целиком и на 320×568 крестик уезжал за верх кадра. */}
      <motion.div
        ref={panelRef}
        layoutId={`quest-${quest.slug}`}
        transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="panel relative z-10 flex max-h-full w-full max-w-3xl flex-col overflow-hidden"
      >
        {/* Hero модалки — фиксированная шапка панели (не скроллится) */}
        <div className="relative h-56 shrink-0 overflow-hidden md:h-72">
          <QuestArt
            seed={quest.art.cover}
            imageSrc={quest.cover}
            imagePosition="50% 40%"
            label={`Обложка квеста «${quest.title}»`}
            sizes="(max-width: 768px) 100vw, 768px"
          />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,9,8,0.15) 0%, rgba(10,9,8,0.95) 100%)",
            }}
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Закрыть детали квеста"
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top))] flex h-[44px] w-[44px] items-center justify-center border border-line bg-bg/60 text-fg backdrop-blur-sm transition-colors hover:border-accent-bright hover:text-accent-text"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="tracking-caps flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-fg/70">
              <span>{quest.genreLabel}</span>
              <span
                className="h-1 w-1 shrink-0 rounded-full bg-fg/40"
                aria-hidden="true"
              />
              <span>{quest.ageLimit}</span>
            </div>
            <h3 className="mt-1 font-display text-4xl text-fg">{quest.title}</h3>
          </div>
        </div>

        {/* Единственный скроллящийся блок диалога (min-h-0 обязателен:
            без него flex-элемент не даёт себя сжать) */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          <QuestDetailsBody
            quest={quest}
            headingAs="h4"
            cta={
              <div className="space-y-3">
                <button type="button" onClick={bookThis} className="btn-primary w-full">
                  Забронировать эту комнату
                </button>
                <Link
                  href={`/quests/${quest.slug}`}
                  className="btn-ghost w-full text-[11px]"
                  onClick={onClose}
                >
                  Полная страница квеста
                </Link>
              </div>
            }
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
