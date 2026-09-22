import Link from "next/link";

export const metadata = {
  title: "404 — Здесь никого нет. NOX",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="tracking-caps text-[11px] text-muted">ОШИБКА 404</p>
      <h1
        className="flicker-soft mt-4 font-display font-semibold leading-none text-fg"
        style={{ fontSize: "clamp(6rem, 26vw, 16rem)" }}
      >
        404
      </h1>
      <p className="mt-4 max-w-md text-base text-muted">
        Этой комнаты не существует. Или она не хочет, чтобы её нашли.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Вернуться на главную
        </Link>
        <Link href="/#quests" className="btn-ghost">
          Выбрать квест
        </Link>
      </div>
    </main>
  );
}
