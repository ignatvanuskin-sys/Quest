/**
 * Скролл к секциям: основной путь — глобальный инстанс Lenis
 * (см. components/LenisProvider), резервный — нативный scrollIntoView.
 *
 * ПОЧЕМУ ЕСТЬ РЕЗЕРВНЫЙ ПУТЬ (исправлено по итогам аудита):
 * раньше функция ТОЛЬКО диспатчила CustomEvent, а единственный слушатель
 * регистрировался внутри LenisProvider ПОСЛЕ раннего выхода
 * `if (reduced) return;`. То есть при `prefers-reduced-motion: reduce`
 * (а также если Lenis не инициализировался) кнопки «Выбрать квест»,
 * пункты меню и «Правила безопасности» не делали ничего — событие уходило
 * в пустоту. Комментарий обещал фолбэк, которого в коде не было.
 *
 * Признак живого Lenis — класс `lenis` на <html>: его ставит сам Lenis при
 * инициализации и снимает при destroy(). Один источник истины, без дублирования
 * состояния в модуле.
 */

export const LENIS_EVENT = "nox:lenis-scroll";
export const LENIS_STOP_EVENT = "nox:lenis-stop";
export const LENIS_START_EVENT = "nox:lenis-start";
export const OPEN_BOOKING_EVENT = "nox:open-booking";
export const PRESELECT_EVENT = "nox:preselect-quest";

/**
 * Отступ под фиксированную шапку.
 *
 * ЕДИНЫЙ ИСТОЧНИК — CSS (`scroll-margin-top` у целей анкоров). Оба пути скролла
 * его уважают: нативный `scrollIntoView` по спецификации, а Lenis читает
 * `scroll-margin-top` из computed style. Раньше отступ вычитался ДВАЖДЫ —
 * ещё и параметром `offset: -72` в LenisProvider, — и цель уезжала на 72 px
 * вверх (замер: `#safety` останавливалась на 144 px вместо 72 px).
 */
export const ANCHOR_OFFSET_PX = 72;

/** Задержка перед перепроверкой позиции якоря, мс */
const CORRECTION_DELAY_MS = 900;
/** Допустимое расхождение позиции цели, px */
const CORRECTION_TOLERANCE_PX = 8;

let correctionTimer: ReturnType<typeof setTimeout> | null = null;

/** Активен ли сглаженный скролл (Lenis инициализирован и не уничтожен) */
export function isSmoothScrollActive(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("lenis");
}

export function scrollToId(id: string): void {
  if (typeof window === "undefined") return;

  const el = document.getElementById(id);
  if (!el) return;

  const run = () => {
    if (isSmoothScrollActive()) {
      window.dispatchEvent(new CustomEvent<string>(LENIS_EVENT, { detail: id }));
      return;
    }
    // Нативный фолбэк. Отступ от верха даёт CSS: scroll-margin-top у целей анкоров.
    el.scrollIntoView({ block: "start", behavior: "auto" });
  };

  run();
  scheduleAnchorCorrection(el, run);
}

/**
 * Перепроверка позиции якоря после прокрутки.
 *
 * Разметка меняет высоту уже во время прокрутки: секции ниже первого экрана
 * раскрываются, грузятся изображения, подменяются шрифты. Цель, посчитанная в
 * момент клика, из-за этого «уезжает» — мобильный замер давал промах 1851 px
 * (пункт меню «Безопасность» приземлялся в середину блока отзывов).
 * Здесь через CORRECTION_DELAY_MS мы сверяем фактическую позицию цели и, если
 * она разошлась больше допуска, повторяем прокрутку — не более двух раз.
 */
function scheduleAnchorCorrection(el: HTMLElement, run: () => void, attempt = 0): void {
  if (correctionTimer !== null) clearTimeout(correctionTimer);

  correctionTimer = setTimeout(() => {
    correctionTimer = null;

    const offset = el.getBoundingClientRect().top;
    if (Math.abs(offset - ANCHOR_OFFSET_PX) <= CORRECTION_TOLERANCE_PX) return;

    run();
    if (attempt < 1) scheduleAnchorCorrection(el, run, attempt + 1);
  }, CORRECTION_DELAY_MS);
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

/**
 * Сброс предвыбора ПОСЛЕ того, как форма его применила.
 *
 * Без сброса значение жило до перезагрузки страницы: гость выбирал «Дом
 * Ворона», закрывал диалог, потом открывал форму снова «с нуля» из шапки —
 * и получал в поле квеста ту же комнату, хотя не выбирал её.
 */
export function clearPreselectedQuest(): void {
  if (typeof window === "undefined") return;
  delete (window as unknown as { __noxPreselectQuest?: string }).__noxPreselectQuest;
}
