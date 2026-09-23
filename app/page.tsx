import Hero from "@/components/Hero";
import About from "@/components/About";
import QuestCatalog from "@/components/QuestCatalog";
import SmokeHeartBand from "@/components/SmokeHeartBand";
import BookingSteps from "@/components/BookingSteps";
import Reviews from "@/components/Reviews";
import SafetyFaq from "@/components/SafetyFaq";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import { FAQ_ITEMS } from "@/lib/faq";
import { CONTACTS, SOCIAL_LINKS } from "@/lib/contacts";
import { SITE_URL } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EntertainmentBusiness",
  name: "NOX — комнаты страха",
  alternateName: "NOX Quest Rooms",
  description:
    "Премиальные постановочные квесты: живые актёры, реальные декорации, звук и свет, которые работают против вас.",
  url: SITE_URL,
  image: `${SITE_URL}/media/og-image.jpg`,
  slogan: "MEMENTO MORI",
  telephone: CONTACTS.phoneDisplay,
  // Точный адрес не публикуем: квест-рум выдаёт его после подтверждения брони,
  // поэтому в разметке — только город и страна (Google допускает частичный адрес).
  address: {
    "@type": "PostalAddress",
    addressLocality: CONTACTS.city,
    addressCountry: "RU",
  },
  openingHours: "Mo-Su 12:00-23:00",
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

// РАЗМЕТКА ОТЗЫВОВ УДАЛЕНА НАМЕРЕННО.
// Здесь была разметка Product + aggregateRating + 7 review, собранная из
// lib/reviews.ts, где данные прямо помечены как DEMO/PLACEHOLDER, а в UI
// (components/Reviews.tsx) при этом сказано «все отзывы — от гостей, реально
// прошедших комнаты». Разметка отзывов, за которой не стоит настоящий UGC,
// нарушает правила Google — это риск ручной санкции и потери сниппета.
// Вернуть разметку можно только вместе с реальными отзывами.
// Пока отзывы живут только в интерфейсе, без schema.org.

export default function HomePage() {
  return (
    <>
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <Hero />
        <About />
        <QuestCatalog />
        <SmokeHeartBand />
        <BookingSteps />
        <Reviews />
        <SafetyFaq />
        <Contacts />
      </main>
      {/* Подвал ВНЕ main: внутри main он теряет landmark contentinfo */}
      <Footer />
    </>
  );
}
