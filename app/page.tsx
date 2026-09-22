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
  telephone: "+7 (000) 000-00-00",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Примерная, 13, подвальный этаж",
    addressCountry: "RU",
  },
  openingHours: "Mo-Su 12:00-23:00",
  sameAs: [
    "https://t.me/nox_quests",
    "https://wa.me/70000000000",
    "https://instagram.com/nox.quests",
  ],
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
