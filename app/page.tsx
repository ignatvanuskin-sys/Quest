import Hero from "@/components/Hero";
import About from "@/components/About";
import QuestCatalog from "@/components/QuestCatalog";
import SmokeHeartBand from "@/components/SmokeHeartBand";
import BookingSteps from "@/components/BookingSteps";
import Reviews from "@/components/Reviews";
import SafetyFaq from "@/components/SafetyFaq";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import { REVIEWS, REVIEWS_AVG, REVIEWS_COUNT } from "@/lib/reviews";
import { FAQ_ITEMS } from "@/lib/faq";
import { CONTACTS, SOCIAL_LINKS } from "@/lib/contacts";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qwest-scary.vercel.app";

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

// Отзывы для JSON-LD — из lib/reviews.ts (единственный источник,
// UI и schema всегда согласованы). Данные — демо-плейсхолдеры.
const reviewsJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "NOX — квест-румы",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: REVIEWS_AVG.toFixed(1),
    reviewCount: String(REVIEWS_COUNT),
    bestRating: "5",
    worstRating: "1",
  },
  review: REVIEWS.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.name },
    datePublished: r.dateISO,
    reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5" },
    reviewBody: r.text,
  })),
};

export default function HomePage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }}
      />
      <Hero />
      <About />
      <QuestCatalog />
      <SmokeHeartBand />
      <BookingSteps />
      <Reviews />
      <SafetyFaq />
      <Contacts />
      <Footer />
    </main>
  );
}
