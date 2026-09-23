/**
 * Глобальный skeleton-лоадер для маршрутов, ожидающих данных.
 * Для SSG-страниц этого проекта появляется редко, но нужен
 * для навигации между страницами и на медленных соединениях.
 */
export default function Loading() {
  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Загрузка…</span>
      <div
        className="flicker-soft font-display text-4xl tracking-[0.18em] text-fg/40"
        aria-hidden="true"
      >
        NOX
      </div>
      <div
        className="h-px w-24 overflow-hidden bg-line"
        aria-hidden="true"
        style={{ position: "relative" }}
      >
        <span className="scroll-line" style={{ height: "1px", width: "100%" }} />
      </div>
    </main>
  );
}
