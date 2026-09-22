"use client";

import { useReducedMotion } from "framer-motion";
import { openBookingMenu, preselectQuest } from "@/lib/scroll";

/**
 * CTA «Забронировать эту комнату»: предзаполняет select в форме
 * (CustomEvent) и открывает меню бронирования. На странице /quests/[slug]
 * ведёт на главную, передавая slug квеста в URL — форма подхватит его
 * при загрузке, а меню можно открыть кнопкой «Забронировать».
 */
export default function BookQuestButton({
  slug,
  className = "btn-primary w-full",
}: {
  slug: string;
  className?: string;
}) {
  const reduced = useReducedMotion();

  const book = () => {
    preselectQuest(slug);
    // Со страницы квеста CustomEvent не переживёт навигацию — передаём slug в URL
    if (window.location.pathname.startsWith("/quests/")) {
      window.location.href = `/?quest=${encodeURIComponent(slug)}`;
      return;
    }
    window.setTimeout(() => openBookingMenu(), reduced ? 0 : 200);
  };

  return (
    <button type="button" onClick={book} className={className}>
      Забронировать эту комнату
    </button>
  );
}
