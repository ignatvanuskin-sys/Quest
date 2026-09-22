"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NOX] Необработанная ошибка:", error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <p className="tracking-caps text-[11px] text-muted">ЧТО-ТО ПОШЛО НЕ ТАК</p>
      <h1 className="mt-4 font-display text-5xl text-fg">Свет погас</h1>
      <p className="mt-4 max-w-md text-base text-muted">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу — или возвращайтесь
        чуть позже.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn-primary">
          Попробовать снова
        </button>
        <a href="/" className="btn-ghost">
          На главную
        </a>
      </div>
    </main>
  );
}
