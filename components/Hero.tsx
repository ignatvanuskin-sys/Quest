"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { scrollToId, openBookingMenu } from "@/lib/scroll";

const TITLE = "NOX";

/**
 * Hero: fullscreen, фоновая видео-петля (/media/hero-loop.mp4) с постером-фолбэком,
 * посимвольный GSAP reveal заголовка, параллакс фона при скролле.
 * При prefers-reduced-motion или экономии трафика — статичный постер вместо видео.
 */
export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [useVideo, setUseVideo] = useState(false);

  // Видео только если нет reduced-motion и нет экономии трафика
  useEffect(() => {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const saveData = conn?.saveData === true;
    const slow = conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";
    if (!reduced && !saveData && !slow) setUseVideo(true);
  }, [reduced]);

  // Ленивый запуск видео: только когда hero в viewport
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (!useVideo || !videoRef.current) return;
    const video = videoRef.current;

    // iOS: React проставляет muted как свойство, но не как атрибут в разметке,
    // а политика автоплея у Safari смотрит на элемент. Выставляем явно —
    // без этого видео на телефоне просто не стартует и остаётся постер.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    let gestureDone = false;
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(video);

    // Если автоплей заблокирован (режим энергосбережения iOS, строгие политики),
    // запускаем с первого же касания — пользователь всё равно взаимодействует.
    const onFirstGesture = () => {
      if (gestureDone) return;
      gestureDone = true;
      tryPlay();
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("click", onFirstGesture);
    };
    window.addEventListener("touchstart", onFirstGesture, { passive: true });
    window.addEventListener("click", onFirstGesture);

    return () => {
      observer.disconnect();
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("click", onFirstGesture);
    };
  }, [useVideo]);

  useEffect(() => {
    if (reduced) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    (async () => {
      const gsapModule = await import("gsap");
      const stModule = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      const gsap = gsapModule.gsap;
      gsap.registerPlugin(stModule.ScrollTrigger);

      ctx = gsap.context(() => {
        // Посимвольный reveal заголовка: fade + blur-in.
        // Тайминги сжаты под короткое интро (см. BootLoader): раньше
        // последовательность тянулась ~2.4с и первый экран казался вялым.
        const chars = titleRef.current?.querySelectorAll<HTMLElement>("[data-char]");
        if (chars?.length) {
          gsap.fromTo(
            chars,
            { opacity: 0, yPercent: 40, filter: "blur(14px)" },
            {
              opacity: 1,
              yPercent: 0,
              filter: "blur(0px)",
              duration: 1.1,
              stagger: 0.1,
              ease: "power3.out",
              delay: 0.1,
            }
          );
        }
        if (subRef.current) {
          gsap.fromTo(
            subRef.current.children,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.08,
              ease: "power2.out",
              delay: 0.5,
            }
          );
        }
        // Параллакс фона: уезжает медленнее контента
        if (bgRef.current) {
          gsap.to(bgRef.current, {
            yPercent: 22,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
          // Лёгкое затемнение hero при уходе
          gsap.to(rootRef.current, {
            opacity: 0.25,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "40% top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }, rootRef);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <section
      id="hero"
      ref={rootRef}
      className="relative flex h-[100dvh] flex-col items-center justify-center overflow-hidden"
      aria-label="NOX — комнаты страха"
    >
      {/* Фон: видео-петля или постер-фолбэк */}
      <div ref={bgRef} className="absolute inset-0 scale-110 will-change-transform">
        {useVideo ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            // metadata, а не none: с preload="none" iOS не всегда стартует play()
            preload="metadata"
            poster="/media/hero-poster.jpg"
            aria-hidden="true"
            onError={() => setUseVideo(false)}
          >
            <source src="/media/hero-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <Image
            src="/media/hero-poster.jpg"
            alt="Туманный коридор с тёплым светом лампы"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Затемняющий градиент снизу для читаемости */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0.1) 35%, rgba(10,9,8,0.2) 65%, rgba(10,9,8,0.92) 100%)",
        }}
      />

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <h1
          ref={titleRef}
          className="flicker-soft font-display font-semibold leading-none text-fg"
          style={{ fontSize: "clamp(5.5rem, 30vw, 17rem)" }}
          aria-label="NOX"
        >
          {TITLE.split("").map((ch, i) => (
            <span key={i} data-char className="inline-block will-change-transform">
              {ch}
            </span>
          ))}
        </h1>

        <div ref={subRef} className="flex flex-col items-center">
          <p className="mt-2 text-[11px] tracking-[0.5em] text-fg/80 md:text-sm">
            MEMENTO&nbsp;MORI
          </p>
          <p className="mt-8 max-w-md text-base text-fg/70 md:text-lg">
            Ты готов узнать, чего боишься на самом деле?
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => scrollToId("quests")}
              className="btn-ghost flex-1 sm:flex-none"
            >
              Выбрать квест
            </button>
            <button
              type="button"
              onClick={() => openBookingMenu()}
              className="btn-primary flex-1 sm:flex-none"
            >
              Забронировать
            </button>
          </div>
        </div>
      </div>

      {/* Индикатор скролла. .scroll-hint прячется на низких экранах
          (max-height: 620px) — там он упирается в кнопки. */}
      <div className="scroll-hint absolute bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="tracking-caps text-[11px] text-fg/60">SCROLL</span>
        <div className="scroll-line" aria-hidden="true" />
      </div>
    </section>
  );
}
