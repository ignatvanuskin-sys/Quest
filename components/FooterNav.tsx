"use client";

import Link from "next/link";
import { scrollToId } from "@/lib/scroll";
import { SOCIAL_LINKS } from "@/lib/contacts";

/**
 * Навигация в футере — клиентский компонент для Lenis-скролла.
 * Соцсети берутся из lib/contacts.ts, чтобы ссылки не разъезжались
 * с блоком «Контакты» и со структурированными данными.
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
        {SOCIAL_LINKS.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center transition-colors hover:text-fg"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
