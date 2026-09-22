"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const TITLE = "NOX";

/** Длительность интро, мс */
const MIN_SHOW = 2000;
const MAX_SHOW = 3400;
const REPEAT_SHOW = 900;

/**
 * Стартовый экран загрузки в стилистике NOX: тьма, мерцающее название,
 * кровавая полоса прогресса, слоган — затем плавное растворение.
 *
 * Техника: оверлей поверх SSR-контента (SEO и первый paint не страдают),
 * сайт под ним грузится, уходит по готовности страницы + минимальной паузе.
 * При prefers-reduced-motion — почти мгновенно. При повторной навигации
 * в рамках сессии — короткий вариант (900 мс).
 */
export default function BootLoader() {
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const seen = window.sessionStorage.getItem("nox:booted");
    const minShow = seen ? REPEAT_SHOW : MIN_SHOW;
    if (seen == null) window.sessionStorage.setItem("nox:booted", "1");

    // Блокируем скролл пока идёт интро
    document.documentElement.style.overflow = "hidden";

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(maxTimer);
      document.documentElement.style.overflow = "";
      setVisible(false);
    };

    const started = Date.now();
    const maxTimer = window.setTimeout(finish, MAX_SHOW);

    if (reduced) {
      window.setTimeout(finish, 250);
    } else if (document.readyState === "complete") {
      window.setTimeout(finish, minShow);
    } else {
      const onLoad = () => {
        const elapsed = Date.now() - started;
        const wait = Math.max(0, minShow - elapsed);
        window.setTimeout(finish, wait);
      };
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.clearTimeout(maxTimer);
      document.documentElement.style.overflow = "";
    };
  }, [reduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          role="status"
          aria-label="Загрузка NOX"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-bg"
          exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Тлеющий туман по краям */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 55%, rgba(122,15,22,0.22) 0%, rgba(10,9,8,0) 70%)",
            }}
          />

          {/* Название — пословное проявление сквозь тьму */}
          <div className="relative flex flex-col items-center px-6 text-center">
            <h1
              className="flicker-soft font-display font-semibold leading-none text-fg"
              style={{ fontSize: "clamp(4.5rem, 20vw, 11rem)" }}
              aria-label="NOX"
            >
              {TITLE.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: 1.1,
                    delay: reduced ? 0 : 0.25 + i * 0.18,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="tracking-caps text-fg/70 mt-5 text-[11px] md:text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: reduced ? 0 : 0.9 }}
            >
              MEMENTO&nbsp;MORI
            </motion.p>

            {/* Кровавая полоса прогресса */}
            <div
              className="mt-10 h-px w-48 overflow-hidden bg-line md:w-64"
              aria-hidden="true"
            >
              <motion.div
                className="h-full w-full origin-left bg-accent-bright"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: reduced ? 0.2 : MIN_SHOW / 1000,
                  ease: "easeInOut",
                }}
                style={{ boxShadow: "0 0 12px 1px rgba(179,34,44,0.8)" }}
              />
            </div>

            <motion.p
              className="mt-4 text-[10px] leading-relaxed text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: reduced ? 0 : 1.2 }}
            >
              Ты готов узнать, чего боишься на самом деле?
            </motion.p>
          </div>

          {/* Зловещее мерцание света */}
          <div
            className="candle-glow pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
