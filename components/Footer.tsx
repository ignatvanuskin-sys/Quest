import FooterNav from "@/components/FooterNav";
import { CONTACTS } from "@/lib/contacts";

/**
 * Футер: логотип, копирайт, юр. информация, соцсети,
 * ссылка на правила безопасности.
 * Нижний отступ учитывает home-индикатор iPhone (safe-area), а не
 * несуществующую больше липкую кнопку брони (раньше было pb-28 = 112px пустоты).
 * Реквизиты — из lib/contacts.ts (единый источник, заменить на данные клиента).
 */
export default function Footer() {
  return (
    <footer
      className="border-t border-line px-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-14 md:pb-14"
      aria-label="Подвал сайта"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-4xl tracking-[0.18em] text-fg">NOX</p>
          <p className="tracking-caps mt-2 text-[11px] text-muted">MEMENTO MORI</p>
          <p className="tracking-caps mt-1 text-[11px] text-muted">
            QUEST ROOMS · КОМНАТЫ СТРАХА
          </p>
        </div>

        <FooterNav />

        <div className="text-[11px] leading-relaxed text-muted">
          <p>© {new Date().getFullYear()} NOX. Все права защищены.</p>
          <p className="mt-1">{CONTACTS.legal}</p>
          <p className="mt-1">
            {CONTACTS.city} · {CONTACTS.hours}
          </p>
        </div>
      </div>
    </footer>
  );
}
