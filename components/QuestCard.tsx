"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Quest } from "@/lib/quests";
import QuestArt from "@/components/QuestArt";

interface QuestCardProps {
  quest: Quest;
  onOpen: (quest: Quest) => void;
  /** Порядковый номер в сетке — для stagger-анимации появления */
  index?: number;
}

/** Черепа сложности — SVG-иконки, акцентный цвет только у «заполненных» */
function Skulls({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`Сложность ${level} из 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={i < level ? "text-accent-bright" : "text-fg/20"}
        >
          <path d="M12 2C7.03 2 3 6.03 3 11c0 2.4.94 4.58 2.5 6.17V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2.83A8.96 8.96 0 0 0 21 11c0-4.97-4.03-9-9-9zM8.5 13a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zm7 0a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zM10 16h4v3h-1v-1.5h-2V19h-1v-3z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Карточка квеста в каталоге.
 * Hover: scale 1.02 + усиление тени (десктоп); tap: scale 0.98 (мобильный).
 * layoutId связывает карточку с полноэкранной модалкой (shared transition).
 */
export default function QuestCard({ quest, onOpen, index = 0 }: QuestCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.article
      layoutId={`quest-${quest.slug}`}
      initial={{ opacity: 0, y: reduced ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      whileHover={reduced ? undefined : { scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: reduced ? 0.2 : 0.7,
        delay: reduced ? 0 : Math.min(index * 0.08, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="panel group relative flex w-[82vw] max-w-[360px] shrink-0 flex-col overflow-hidden md:w-full md:max-w-none"
    >
      {/* Обложка. Клик по ней открывает детали — крупный touch-target;
          кнопка «Подробнее» ниже остаётся отдельным интерактивом (без вложенных
          интерактивных элементов) */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <QuestArt
          seed={quest.art.cover}
          imageSrc={quest.cover}
          label={`Обложка квеста «${quest.title}»`}
          sizes="(max-width: 768px) 82vw, (max-width: 1200px) 33vw, 360px"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,9,8,0.05) 30%, rgba(10,9,8,0.85) 100%)",
          }}
        />
        <button
          type="button"
          onClick={() => onOpen(quest)}
          aria-haspopup="dialog"
          aria-label={`Открыть детали квеста «${quest.title}»`}
          className="hover:bg-fg/5 focus-visible:bg-fg/5 absolute inset-0 cursor-pointer transition-colors"
        />
        <span className="bg-bg/60 text-fg/80 pointer-events-none absolute left-4 top-4 max-w-[calc(100%-5.5rem)] border border-line px-3 py-1.5 text-[10px] uppercase leading-relaxed tracking-[0.14em] backdrop-blur-sm">
          {quest.genreLabel}
        </span>
        <span className="bg-bg/60 tracking-caps text-fg/80 pointer-events-none absolute right-4 top-4 border border-line px-3 py-1 text-[10px] backdrop-blur-sm">
          {quest.ageLimit}
        </span>
        <span className="border-accent-bright/50 bg-bg/60 pointer-events-none absolute bottom-4 left-4 border px-3 py-1 text-[11px] tracking-wide text-accent-bright backdrop-blur-sm">
          от {quest.priceFrom.toLocaleString("ru-RU")} ₽
        </span>
      </div>

      {/* Текст */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-2xl text-fg">{quest.title}</h3>
        <p className="text-sm leading-relaxed text-muted">{quest.teaser}</p>

        <div className="text-fg/60 mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[11px] tracking-wide">
          <Skulls level={quest.difficulty} />
          <span>{quest.durationMin} мин</span>
          <span>
            {quest.playersMin}–{quest.playersMax} игроков
          </span>
          <span className="text-fg/80">
            от {quest.priceFrom.toLocaleString("ru-RU")} ₽
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpen(quest)}
          className="btn-ghost mt-3 w-full text-[11px]"
          aria-haspopup="dialog"
        >
          Подробнее
        </button>
      </div>
    </motion.article>
  );
}
