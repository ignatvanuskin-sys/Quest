"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const TITLE = "NOX";

/**
 * Длительность интро, мс.
 * Было 2000 / 3400 / 900 — интро задерживало первый экран до 3.4 секунды
 * и всё это время блокировало скролл. Теперь это короткая «вспышка» на
 * входе: бренд успевает прочитаться, но страница не ощущается медленной.
 */
const MIN_SHOW = 900;
const MAX_SHOW = 1600;
const REPEAT_SHOW = 450;

/**
 * Стартовый экран в стилистике NOX: тьма, мерцающее название,
 * кровавая полоса прогресса, слоган — затем быстрое растворение.
 *
 * Техника: оверлей поверх SSR-контента (SEO и первый paint не страдают),
 * уходит по готовности страницы + минимальной паузе, но не дольше MAX_SHOW.
 * Скролл НЕ блокируется — оверлей уходит раньше, чем пользователь успевает
 * попытаться листать. При prefers-reduced-motion — почти мгновенно,
 * при повторной загрузке в рамках сессии — короткий вариант.
 */
export default function BootLoader() {
  const [visible, setVisible] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const seen = window.sessionStorage.getItem("nox:booted");
    const minShow = seen ? REPEAT_SHOW : MIN_SHOW;
    if (seen == null) window.sessionStorage.setItem("nox:booted", "1");

    let done = false;
    let maxTimer = 0;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(maxTimer);
      setVisible(false);
    };

    const started = Date.now();
    maxTimer = window.setTimeout(finish, MAX_SHOW);

    if (reduced) {
      window.setTimeout(finish, 200);
    } else if (document.readyState === "complete") {
      window.setTimeout(finish, minShow);
    } else {
      const onLoad = () => {
        const elapsed = Date.now() - started;
        window.setTimeout(finish, Math.max(0, minShow - elapsed));
      };
      window.addEventListener("load", onLoad, { once: true });
    }

    return () => {
      window.clearTimeout(maxTimer);
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
          exit={{ opacity: 0, scale: 1.03, filter: "blur(5px)" }}
          transition={{ duration: reduced ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
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

          {/* Визуал декоративный: для скринридера достаточно aria-label оверлея.
              Раньше здесь был <h1> — на странице получалось два h1 (второй в Hero). */}
          <div
            className="relative flex flex-col items-center px-6 text-center"
            aria-hidden="true"
          >
            <div
              className="flicker-soft font-display font-semibold leading-none text-fg"
              style={{ fontSize: "clamp(4.5rem, 20vw, 11rem)" }}
            >
              {TITLE.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block will-change-transform"
                  initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: reduced ? 0.2 : 0.7,
                    delay: reduced ? 0 : 0.06 + i * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>

            <motion.p
              className="tracking-caps mt-5 text-[11px] text-fg/70 md:text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.15 : 0.5, delay: reduced ? 0 : 0.35 }}
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
              className="mt-4 text-[11px] leading-relaxed text-muted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0.15 : 0.45, delay: reduced ? 0 : 0.5 }}
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
