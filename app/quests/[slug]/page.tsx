import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { QUESTS, getQuestBySlug } from "@/lib/quests";
import { CONTACTS } from "@/lib/contacts";
import { SITE_URL } from "@/lib/site";
import QuestArt from "@/components/QuestArt";
import QuestDetailsBody from "@/components/QuestDetailsBody";
import BookQuestButton from "@/components/BookQuestButton";
import Reveal from "@/components/Reveal";

interface QuestPageProps {
  params: { slug: string };
}

// Неизвестные slug отдаются 404 на уровне роутинга (до стриминга),
// иначе notFound() во время стриминга возвращает HTTP 200 (soft-404)
export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTS.map((q) => ({ slug: q.slug }));
}

export function generateMetadata({ params }: QuestPageProps): Metadata {
  const quest = getQuestBySlug(params.slug);
  if (!quest) return { title: "Квест не найден — NOX" };
  return {
    title: `${quest.title} — ${quest.genreLabel} · ${quest.ageLimit} | NOX`,
    description: quest.teaser,
    alternates: {
      canonical: `/quests/${quest.slug}`,
    },
    openGraph: {
      title: `${quest.title} — NOX`,
      description: quest.teaser,
      type: "website",
      locale: "ru_RU",
      siteName: "NOX",
      url: `/quests/${quest.slug}`,
      images: [
        {
          url: quest.cover,
          width: 900,
          height: 1125,
          alt: `Квест «${quest.title}»`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${quest.title} — NOX`,
      description: quest.teaser,
      images: [quest.cover],
    },
  };
}

export default function QuestPage({ params }: QuestPageProps) {
  const quest = getQuestBySlug(params.slug);
  if (!quest) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EntertainmentBusiness",
    name: `NOX — ${quest.title}`,
    description: quest.plot,
    // Абсолютный URL: относительный путь в schema.org невалиден — Google его отбрасывает
    image: `${SITE_URL}${quest.cover}`,
    url: `${SITE_URL}/quests/${quest.slug}`,
    telephone: CONTACTS.phoneDisplay,
    // Точный адрес квест-рум выдаёт после подтверждения брони:
    // в разметке только город и страна (Google допускает частичный адрес).
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACTS.city,
      addressCountry: "RU",
    },
  };

  // BreadcrumbList: структура реальна — на странице есть ссылка «← Все квесты»
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог квестов",
        item: `${SITE_URL}/#quests`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: quest.title,
      },
    ],
  };

  return (
    <main
      id="main"
      className="mx-auto max-w-3xl px-6 pb-28 pt-[calc(7rem+env(safe-area-inset-top))] md:pt-36"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Reveal>
        <Link
          href="/#quests"
          className="tracking-caps inline-flex min-h-[44px] items-center gap-2 text-[11px] text-muted transition-colors hover:text-fg"
        >
          <span aria-hidden="true">←</span> ВСЕ КВЕСТЫ
        </Link>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="panel mt-6 overflow-hidden">
          {/* Hero */}
          <div className="relative h-72 overflow-hidden md:h-96">
            <QuestArt
              seed={quest.art.cover}
              imageSrc={quest.cover}
              imagePosition="50% 40%"
              priority
              label={`Квест «${quest.title}»`}
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(180deg, rgba(10,9,8,0.15) 0%, rgba(10,9,8,0.95) 100%)",
              }}
            />
            <div className="absolute bottom-5 left-6 right-6 md:left-8 md:right-8">
              <span className="tracking-caps text-[11px] text-fg/70">
                {quest.genreLabel} · {quest.ageLimit}
              </span>
              <h1 className="mt-1 font-display text-4xl text-fg md:text-5xl">
                {quest.title}
              </h1>
            </div>
          </div>

          <QuestDetailsBody quest={quest} cta={<BookQuestButton slug={quest.slug} />} />
        </div>
      </Reveal>
    </main>
  );
}
