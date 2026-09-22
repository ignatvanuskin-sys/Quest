"use client";

import { useEffect } from "react";

/**
 * Глобальный error boundary — перехватывает ошибки, которые возникают
 * в самом корневом layout (обычный error.tsx их не ловит).
 * Обязан содержать собственные <html> и <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[NOX] Критическая ошибка (root layout):", error);
  }, [error]);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0908",
          color: "#ece7df",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: "#8a8580",
          }}
        >
          КРИТИЧЕСКАЯ ОШИБКА
        </p>
        <h1 style={{ fontSize: "32px", margin: "16px 0 0", fontWeight: 600 }}>
          Свет погас
        </h1>
        <p
          style={{
            marginTop: "16px",
            maxWidth: "420px",
            color: "#8a8580",
            lineHeight: 1.65,
          }}
        >
          Приложение не смогло загрузиться. Попробуйте обновить страницу.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: "32px",
            minHeight: "44px",
            padding: "12px 28px",
            background: "#7a0f16",
            color: "#ece7df",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Попробовать снова
        </button>
      </body>
    </html>
  );
}
