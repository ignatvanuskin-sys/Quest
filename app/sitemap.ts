import type { MetadataRoute } from "next";
import { QUESTS } from "@/lib/quests";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://qwest-scary.vercel.app";

/**
 * Стабильная дата последнего изменения контента. Не new Date() — иначе каждый
 * билд рапортует «свежесть», которой нет, и поисковики перестают доверять sitemap.
 * Обновлять вручную при существенных изменениях контента.
 */
const LAST_UPDATED = new Date("2026-09-19");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...QUESTS.map((q) => ({
      url: `${SITE_URL}/quests/${q.slug}`,
      lastModified: LAST_UPDATED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
