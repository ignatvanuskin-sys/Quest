/**
 * Плавный скролл к секции через глобальный инстанс Lenis (см. components/LenisProvider),
 * с фолбэком на нативный scrollIntoView (и для prefers-reduced-motion).
 */

export const LENIS_EVENT = "nox:lenis-scroll";
export const LENIS_STOP_EVENT = "nox:lenis-stop";
export const LENIS_START_EVENT = "nox:lenis-start";
export const OPEN_BOOKING_EVENT = "nox:open-booking";
export const PRESELECT_EVENT = "nox:preselect-quest";

export function scrollToId(id: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(LENIS_EVENT, { detail: id }));
}

/**
 * Открывает диалог бронирования (BookingModal в Header),
 * где находится форма записи. Используется всеми CTA «Забронировать»,
 * чтобы форма не была статически видна на странице.
 */
export function openBookingMenu(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_BOOKING_EVENT));
}

/**
 * Предвыбор квеста для формы брони.
 *
 * ВАЖНО: форма (QuickBookingForm) рендерится только когда открыт диалог
 * бронирования — слушателя события в момент диспатча может не быть.
 * Поэтому slug дополнительно сохраняется в window — форма подхватит его
 * при монтировании (см. useBookingForm).
 */
export function preselectQuest(slug: string): void {
  if (typeof window === "undefined") return;
  (window as unknown as { __noxPreselectQuest?: string }).__noxPreselectQuest = slug;
  window.dispatchEvent(new CustomEvent<string>(PRESELECT_EVENT, { detail: slug }));
}

/** Чтение сохранённого предвыбора (используется формой при монтировании) */
export function readPreselectedQuest(): string | null {
  if (typeof window === "undefined") return null;
  return (
    (window as unknown as { __noxPreselectQuest?: string }).__noxPreselectQuest ?? null
  );
}
