import type { Quest } from "@/lib/quests";
import QuestArt from "@/components/QuestArt";

/** Строка «да/нет» для противопоказаний */
function Flag({ label, value }: { label: string; value: boolean }) {
  return (
    <li className="flex items-center justify-between gap-4 border-b border-line py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className={value ? "text-accent-text" : "text-fg/70"}>
        {value ? "Есть" : "Нет"}
      </span>
    </li>
  );
}

/**
 * Тело детальной карточки квеста: мета, сюжет, галерея, актёры,
 * что взять, особенности комнаты, CTA. Переиспользуется в модалке
 * и на странице /quests/[slug].
 */
export default function QuestDetailsBody({
  quest,
  cta,
  headingAs = "h2",
}: {
  quest: Quest;
  cta: React.ReactNode;
  /** Уровень заголовков внутри блока: h2 на странице квеста, h4 в модалке (заголовок — h3) */
  headingAs?: "h2" | "h4";
}) {
  const Heading = ({ children }: { children: React.ReactNode }) =>
    headingAs === "h2" ? (
      <h2 className="tracking-caps text-[11px] text-muted">{children}</h2>
    ) : (
      <h4 className="tracking-caps text-[11px] text-muted">{children}</h4>
    );

  return (
    <div className="space-y-8 p-5 md:p-8">
      {/* Мета */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] tracking-wide text-fg/70">
        <span>Сложность: {quest.difficulty}/5</span>
        <span>{quest.durationMin} минут</span>
        <span>
          {quest.playersMin}–{quest.playersMax} игроков
        </span>
        <span>{quest.ageLimit}</span>
        <span className="text-accent-text">
          от {quest.priceFrom.toLocaleString("ru-RU")} ₽ за группу
        </span>
      </div>

      {/* Сюжет */}
      <p className="text-base leading-relaxed text-fg/85">{quest.plot}</p>

      {/* Галерея — свайп на мобильном.
          Снап здесь намеренно не включаем: на горизонтальном скроллере внутри
          вертикально прокручиваемого диалога он мешает прокрутке диалога.
          (Слово-класс не пишем в комментарии — Tailwind сканирует текст
          и сгенерировал бы мёртвую утилиту.) */}
      <div>
        <Heading>АТМОСФЕРА</Heading>
        <div className="snap-row mt-3 flex gap-3 overflow-x-auto pb-2">
          {quest.gallery.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-40 w-64 shrink-0 overflow-hidden border border-line"
            >
              <QuestArt
                seed={quest.art.gallery[i] ?? 0}
                imageSrc={src}
                label={`Кадр ${i + 1} из квеста «${quest.title}»`}
                sizes="256px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Актёры и что взять */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Heading>АКТЁРЫ</Heading>
          <p className="mt-3 text-sm leading-relaxed text-fg/80">{quest.actors}</p>
        </div>
        <div>
          <Heading>ЧТО ВЗЯТЬ С СОБОЙ</Heading>
          <ul className="mt-3 space-y-2 text-sm text-fg/80">
            {quest.bring.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-[9px] h-px w-4 shrink-0 bg-accent-bright"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Противопоказания этой комнаты */}
      <div>
        <Heading>ОСОБЕННОСТИ КОМНАТЫ</Heading>
        <ul className="mt-3">
          <Flag
            label="Стробоскопические вспышки"
            value={quest.contraindications.strobe}
          />
          <Flag label="Тесные пространства" value={quest.contraindications.tightSpaces} />
          <Flag
            label="Физический контакт с актёром"
            value={quest.contraindications.actorContact}
          />
        </ul>
      </div>

      {cta}
    </div>
  );
}
