"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import QuickBookingForm from "@/components/QuickBookingForm";
import RedEyes from "@/components/RedEyes";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { LENIS_STOP_EVENT, LENIS_START_EVENT } from "@/lib/scroll";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Отдельный диалог бронирования (не внутри меню-бургера).
 * Открывается кнопкой «Забронировать» в шапке, CTA в Hero,
 * карточками квестов и пунктом меню.
 *
 * Адаптив: мобильный — полноэкранный лист; десктоп — центрированная панель.
 * Доступность: focus trap, Esc, блокировка скролла фона, возврат фокуса.
 * Декоративный фон — только «красные глаза» (RedEyes); кровавая кромка удалена.
 */
export default function BookingModal({ open, onClose }: BookingModalProps) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useFocusTrap(panelRef, open);

  // Esc + блокировка скролла + остановка Lenis + управление фокусом
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    // Останавливаем Lenis, чтобы колесо мыши не скроллило страницу под модалкой
    window.dispatchEvent(new Event(LENIS_STOP_EVENT));
    const focusTimer = window.setTimeout(
      () => {
        closeRef.current?.focus();
      },
      reduced ? 0 : 80
    );

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event(LENIS_START_EVENT));
      triggerRef.current?.focus();
    };
  }, [open, onClose, reduced]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-stretch justify-center md:items-center md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Бронирование квеста"
        >
          {/* Бэкдроп */}
          <motion.button
            type="button"
            aria-label="Закрыть"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-bg/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.3 }}
            onClick={onClose}
          />

          {/* Панель: мобильный — весь экран, десктоп — центрированная карточка */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: reduced ? 0 : 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24 }}
            transition={{ duration: reduced ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="panel relative z-10 flex w-full flex-col overflow-y-auto overscroll-contain md:max-h-[92vh] md:max-w-xl"
          >
            {/* Пугающие красные глаза, выглядывающие из тьмы (фон диалога) */}
            <RedEyes />

            {/* Шапка диалога. safe-area сверху — на iPhone с «челкой»
                диалог полноэкранный, кнопка закрытия не должна уезжать под вырез. */}
            <div className="relative overflow-visible border-b border-line px-5 pb-6 pt-[calc(1.5rem+env(safe-area-inset-top))] md:px-7 md:pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="tracking-caps text-[11px] text-muted">ЗАПИСЬ НА ИГРУ</p>
                  <p className="mt-1 font-display text-2xl leading-tight text-fg">
                    Забронировать квест
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Закрыть бронирование"
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center border border-line bg-bg/60 text-fg transition-colors hover:border-fg/60 hover:text-fg"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 2l12 12M14 2L2 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Форма записи */}
            <div className="bg-bg-alt/40 px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 md:px-7 md:py-6">
              <QuickBookingForm onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
