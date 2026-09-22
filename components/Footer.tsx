import FooterNav from "@/components/FooterNav";

/**
 * Футер: логотип, копирайт, юр. информация (плейсхолдер), соцсети,
 * ссылка на правила безопасности.
 */
export default function Footer() {
  return (
    <footer
      className="border-t border-line px-6 pb-28 pt-14 md:pb-14"
      aria-label="Подвал сайта"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-4xl tracking-[0.18em] text-fg">NOX</p>
          <p className="tracking-caps mt-2 text-[10px] text-muted">MEMENTO MORI</p>
          <p className="tracking-caps text-muted/60 mt-1 text-[10px]">
            QUEST ROOMS · КОМНАТЫ СТРАХА
          </p>
        </div>

        <FooterNav />

        <div className="text-muted/70 text-[11px] leading-relaxed">
          <p>© {new Date().getFullYear()} NOX. Все права защищены.</p>
          <p className="mt-1">ИП Плейсхолдер П. П. · ОГРНИП 000000000000000</p>
          <p className="mt-1">
            Названия комнат и визуальные материалы — демонстрационные.
          </p>
        </div>
      </div>
    </footer>
  );
}
