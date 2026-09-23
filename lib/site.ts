/**
 * Канонические данные сайта — ЕДИНЫЙ источник.
 *
 * Раньше строка `process.env.NEXT_PUBLIC_SITE_URL ?? "https://qwest-scary.vercel.app"`
 * была скопирована в пять файлов (layout, page, quests/[slug], sitemap, robots).
 * Одна опечатка или забытая правка — и canonical, OG-теги, sitemap и JSON-LD
 * начинают указывать на разные домены, что ломает индексацию.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://qwest-scary.vercel.app";

/** Название бренда для title, OG и schema.org */
export const SITE_NAME = "NOX";

/** Доп. услуга: видеозапись прохождения. Цена в одном месте — правится один раз. */
export const VIDEO_RECORD_PRICE = "1 500 ₽";
