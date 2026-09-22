"use client";

import Link from "next/link";
import { scrollToId } from "@/lib/scroll";

/**
 * Навигация в футере — клиентский компонент для Lenis-скролла.
 */
export default function FooterNav() {
  return (
    <nav aria-label="Навигация в подвале">
      <ul className="tracking-caps flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-muted">
        <li>
          <button
            type="button"
            onClick={() => scrollToId("safety")}
            className="min-h-[44px] transition-colors hover:text-fg"
          >
            Правила безопасности
          </button>
        </li>
        <li>
          <Link
            href="/privacy"
            className="flex min-h-[44px] items-center transition-colors hover:text-fg"
          >
            Политика ПД
          </Link>
        </li>
        <li>
          <a
            href="https://t.me/nox_quests"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center transition-colors hover:text-fg"
          >
            Telegram
          </a>
        </li>
        <li>
          <a
            href="https://wa.me/70000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center transition-colors hover:text-fg"
          >
            WhatsApp
          </a>
        </li>
        <li>
          <a
            href="https://instagram.com/nox.quests"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center transition-colors hover:text-fg"
          >
            Instagram
          </a>
        </li>
      </ul>
    </nav>
  );
}
