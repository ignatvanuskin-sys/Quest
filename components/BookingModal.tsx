"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import QuickBookingForm from "@/components/QuickBookingForm";
import RedEyes from "@/components/RedEyes";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { useScrollLock } from "@/lib/scroll-lock";
import { useOverlayHistory } from "@/lib/overlay-history";

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

  // onClose держим в ref. Если родитель передаёт новую функцию на каждый
  // рендер, эффект ниже перезапускается: его cleanup успевает снять
  // блокировку скролла и вернуть фокус, а потом всё ставится заново —
  // страница мигала «разблокировано», фокус прыгал на крестик.
  // Обновляем ref в отдельном эффекте (объявлен раньше — выполнится первым).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useFocusTrap(panelRef, open);
  // Блокировка прокрутки фона (счётная — см. lib/scroll-lock)
  useScrollLock(open);
  // Системное «Назад» закрывает диалог, а не уводит со страницы
  useOverlayHistory(open, onClose);

  // Esc + управление фокусом
  useEffect(() => {
    if (!open) return;
    triggerRef.current = document.activeElement as HTMLElement;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(
      () => {
        closeRef.current?.focus();
      },
      reduced ? 0 : 80
    );

    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      triggerRef.current?.focus();
    };
  }, [open, reduced]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Бронирование квеста"
        >
          {/* Бэкдроп. touch-none: жест по бэкдропу не должен прокручивать фон
              (на iOS overflow:hidden на <html> сам по себе этого не гарантирует).

              Анимация opacity живёт на обёртке, а не на самом размытом слое:
              если анимировать элемент с backdrop-filter, браузер пересобирает
              размытие каждый кадр — на телефоне это заметное мерцание. */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.3 }}
          >
            <button
              type="button"
              aria-label="Закрыть"
              tabIndex={-1}
              className="h-full w-full cursor-default touch-none bg-bg/80 backdrop-blur-sm"
              onClick={onClose}
            />
          </motion.div>

          {/* Панель: на мобильном — с отступом от краёв и ограничением высоты
              (раньше растягивалась на весь экран), на десктопе — компактная карточка.

              overflow-hidden + отдельный скроллящийся блок ниже: шапка с
              крестиком должна быть доступна ВСЕГДА. Раньше панель скроллилась
              целиком, и на низких экранах (320×568, ландшафт) кнопка закрытия
              уезжала за верх кадра на −236 px — выйти из формы можно было,
              только прокрутив панель обратно. */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: reduced ? 0 : 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduced ? 0 : 24 }}
            transition={{ duration: reduced ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="panel relative isolate z-10 flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden md:max-h-[88vh] md:max-w-lg"
          >
            {/* Пугающие красные глаза, выглядывающие из тьмы (фон диалога) */}
            <RedEyes />

            {/* Шапка диалога не скроллится. safe-area сверху — на iPhone
                с «челкой» кнопка закрытия не должна уезжать под вырез. */}
            <div className="relative z-20 shrink-0 border-b border-line px-5 pb-4 pt-[calc(1.25rem+env(safe-area-inset-top))] md:px-6 md:pt-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="tracking-caps text-[11px] text-muted">ЗАПИСЬ НА ИГРУ</p>
                  <p className="mt-1 font-display text-xl leading-tight text-fg">
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

            {/* Форма записи. Фон непрозрачный (bg-bg), а не bg-bg-alt/40:
                при полупрозрачном фоне декоративные «глаза» просвечивали
                сквозь форму и налезали на подписи полей. Теперь они видны
                только в шапке диалога — там, где и задуманы. */}
            {/* Единственный скроллящийся блок диалога (min-h-0 обязателен:
                без него flex-элемент не даёт себя сжать) */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-bg px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 md:px-6 md:py-5">
              <QuickBookingForm onClose={onClose} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
