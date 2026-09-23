"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  scrollToId,
  openBookingMenu,
  OPEN_BOOKING_EVENT,
} from "@/lib/scroll";
import BookingModal from "@/components/BookingModal";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useScrollLock } from "@/lib/scroll-lock";
import { useOverlayHistory } from "@/lib/overlay-history";

const NAV = [
  { id: "quests", label: "Квесты" },
  { id: "reviews", label: "Отзывы" },
  { id: "safety", label: "Безопасность" },
  { id: "contacts", label: "Контакты" },
];

/**
 * Минимальный хедер: логотип + кнопка «Забронировать» + бургер.
 * Бронирование — отдельный диалог (BookingModal), НЕ внутри бургер-меню.
 * Бургер-меню — только навигация + крупный CTA записи.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const reduced = useReducedMotion();
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Меню блокирует скролл страницы и накрывает её целиком, поэтому ведёт себя
  // как модальный диалог: фокус не должен уходить на невидимый контент под
  // оверлеем. Без этого Tab уводил клавиатуру на скрытые кнопки страницы.
  useFocusTrap(menuRef, open);

  // Блокировка скролла и история «Назад» для бургер-меню.
  // Диалог брони регистрирует себя сам (BookingModal) — иначе на один
  // диалог приходилось бы две записи истории и лишнее нажатие «Назад».
  useScrollLock(open);
  useOverlayHistory(open, () => setOpen(false));

  // Esc закрывает меню (бронирование закрывает свой Esc внутри BookingModal)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Внешние CTA «Забронировать» открывают отдельный диалог бронирования
  useEffect(() => {
    const onOpen = () => setBookingOpen(true);
    window.addEventListener(OPEN_BOOKING_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_BOOKING_EVENT, onOpen);
  }, []);

  // Открытие меню: фокус в первый пункт (keyboard/screen reader),
  // закрытие: фокус возвращается на бургер-триггер.
  // На первичном монтировании фокус не трогаем.
  const hasOpenedRef = useRef(false);
  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      const t = window.setTimeout(
        () => {
          menuRef.current?.querySelector<HTMLElement>("button")?.focus();
        },
        reduced ? 0 : 150
      );
      return () => window.clearTimeout(t);
    }
    if (hasOpenedRef.current) burgerRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    // небольшая пауза, чтобы оверлей успел закрыться
    window.setTimeout(() => scrollToId(id), reduced ? 0 : 150);
  };

  // Состояние «проскроллено»: шапке нужна контрастная подложка,
  // чтобы не теряться на светлых участках страницы
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* На 320 px шапке нужно ≈332 px при боковых отступах 20 px: логотип и CTA
          смыкались (замер: зазор лого→CTA = 0), а бургер прижимался к краю.
          До 360 px сужаем боковые отступы и кнопку. */}
      <header
        /* При открытом меню шапка НЕ рисует собственную подложку: раньше её
           `bg-bg/85 + backdrop-blur-md` ложился поверх такого же размытого слоя
           меню и на экране появлялась светлая полоса с жёсткой границей по
           border-b («блик» поперёк верха экрана). */
        className={`fixed inset-x-0 top-0 z-[70] flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] min-[360px]:px-5 md:px-10 md:pb-6 md:pt-[max(1.5rem,env(safe-area-inset-top))] ${
          open
            ? // Переход отключаем: иначе подложка и линия угасают 500 мс уже
              // поверх меню и читаются как «полоса», ползущая по верху экрана
              "border-b border-transparent bg-transparent"
            : `transition-colors duration-500 ${
                scrolled
                  ? "border-b border-line bg-bg/85 backdrop-blur-md"
                  : "border-b border-transparent bg-transparent"
              }`
        }`}
      >
        <button
          type="button"
          onClick={() => go("hero")}
          className="flex min-h-[44px] shrink-0 flex-col items-start justify-center leading-none"
          aria-label="NOX — наверх"
        >
          <span className="font-display text-2xl tracking-[0.18em] text-fg">NOX</span>
          {/* Подпись прячем на самых узких экранах (320–399px): иначе логотип
              сжимается флексом и «MEMENTO MORI» переносится в две строки,
              а кнопка «Забронировать» упирается в бургер. */}
          <span className="tracking-caps mt-1 hidden text-[11px] text-fg/60 min-[400px]:block">
            MEMENTO MORI
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            aria-hidden={open}
            tabIndex={open ? -1 : 0}
            className={`btn-primary min-h-[44px] px-3.5 py-2 text-[10px] transition-opacity duration-300 min-[360px]:px-4 min-[360px]:text-[11px] sm:px-5 ${
              open ? "pointer-events-none opacity-0" : ""
            }`}
          >
            Забронировать
          </button>
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className="flex h-[44px] w-[44px] flex-col items-center justify-center gap-[7px]"
          >
            <span
              className={`block h-px w-7 bg-fg transition-transform duration-300 ${
                open ? "translate-y-[4px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-7 bg-fg transition-transform duration-300 ${
                open ? "-translate-y-[4px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          /* Почему меню НЕПРОЗРАЧНОЕ и без backdrop-blur.
             Раньше слой был `bg-bg/95 backdrop-blur-md` и появлялся анимацией
             opacity: за ним просвечивало hero-видео и WebGL-канвас, а размытие
             пересчитывалось на каждом кадре — на телефоне это читалось как
             мерцание меню и «блики» (яркие пятна, ползущие за стеклом).
             Теперь подложка сплошная и появляется сразу (`initial={false}`),
             а анимируется только содержимое — оно без фильтров и стоит дёшево. */
          <motion.div
            key="menu"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.25 }}
            className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-bg"
            role="dialog"
            aria-modal="true"
            aria-label="Основное меню"
          >
            <div
              ref={menuRef}
              className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-10 px-6 pb-[calc(4rem+env(safe-area-inset-bottom))] pt-[calc(6rem+env(safe-area-inset-top))] md:px-10 lg:flex-row lg:items-start lg:gap-16 lg:pt-[calc(8rem+env(safe-area-inset-top))]"
            >
              {/* Навигация */}
              <div className="lg:flex-1">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 0.06 }}
                  className="tracking-caps text-[11px] text-muted"
                >
                  НАВИГАЦИЯ
                </motion.p>

                <nav aria-label="Разделы сайта">
                  <ul className="mt-5 space-y-1">
                    {NAV.map((item, i) => (
                      <motion.li
                        key={item.id}
                        initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: reduced ? 0 : 0.1 + i * 0.06,
                          duration: 0.5,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => go(item.id)}
                          className="group flex min-h-[52px] items-baseline gap-4 py-1 text-left"
                        >
                          <span className="tracking-caps text-[11px] text-muted transition-colors group-hover:text-accent-text">
                            0{i + 1}
                          </span>
                          <span className="font-display text-3xl text-fg transition-colors group-hover:text-accent-text md:text-4xl">
                            {item.label}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* CTA записи — крупная, отдельная от навигации */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openBookingMenu();
                  }}
                  initial={{ opacity: 0, y: reduced ? 0 : 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduced ? 0 : 0.3,
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="btn-primary mt-10 w-full max-w-md text-[13px]"
                >
                  Записаться на игру
                </motion.button>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: reduced ? 0 : 0.45 }}
                  className="tracking-caps mt-10 text-[11px] text-muted"
                >
                  NOX · QUEST ROOMS · КОМНАТЫ СТРАХА
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Отдельный диалог бронирования — не внутри бургер-меню */}
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
