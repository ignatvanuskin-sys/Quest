import type { Metadata, Viewport } from "next";
import "@fontsource/cormorant/500.css";
import "@fontsource/cormorant/600.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@/styles/globals.css";
import LenisProvider from "@/components/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import Header from "@/components/Header";
import BootLoader from "@/components/BootLoader";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://qwest-scary.vercel.app"
  ),
  title: "NOX — комнаты страха. Квесты с актёрами и полным погружением",
  description:
    "NOX — премиальные постановочные квесты: живые актёры, реальные декорации, звук и свет, которые работают против вас. Выберите свой страх и забронируйте время.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NOX — MEMENTO MORI",
    description: "Ты готов узнать, чего боишься на самом деле?",
    type: "website",
    images: [
      {
        url: "/media/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NOX — ворон на викторианском кресле в заброшенном особняке",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="font-body">
        <a
          href="#main"
          className="focus:tracking-caps sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-5 focus:py-3 focus:text-[12px] focus:text-fg"
        >
          К содержимому
        </a>
        <LenisProvider />
        <CustomCursor />
        <BootLoader />
        <Header />
        {children}
        {/* Film grain поверх всего сайта */}
        <div className="grain-overlay" aria-hidden="true" />
        <Analytics />
      </body>
    </html>
  );
}
