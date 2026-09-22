/**
 * Контактные данные NOX — ЕДИНЫЙ источник для интерфейса
 * (components/Contacts.tsx, components/FooterNav.tsx, components/Footer.tsx)
 * и структурированных данных (JSON-LD в app/page.tsx).
 *
 * Так телефон и ссылки не разъезжаются между блоками: раньше они были
 * продублированы в четырёх файлах и могли рассинхронизироваться.
 *
 * ВНИМАНИЕ: значения ниже — демонстрационные, для показа шаблона.
 * Перед реальным запуском заменить на данные клиента.
 */

export const CONTACTS = {
  /** Телефон как показываем на странице */
  phoneDisplay: "+7 (925) 148-72-30",
  /** Тот же номер для tel:-ссылки */
  phoneHref: "tel:+79251487230",

  whatsapp: "https://wa.me/79251487230",
  telegram: "https://t.me/noxquestrooms",
  instagram: "https://instagram.com/nox.questrooms",

  city: "Москва",
  /** Ориентир: точный адрес у квест-румов обычно выдают после брони */
  district: "ЦАО · 7 минут от м. «Курская»",
  addressNote:
    "Точный адрес и схему прохода присылаем после подтверждения брони. Вход со двора, чёрная дверь без вывески — вы не ошиблись.",

  hours: "Ежедневно, 12:00 — 23:00",
  hoursNote: "Последний сеанс начинается в 22:00",

  /** Юр. информация в подвале */
  legal: "ИП Воронов Н. А. · ОГРНИП 324770012345678",
} as const;

/** Соцсети для футера и JSON-LD — один список на весь сайт */
export const SOCIAL_LINKS = [
  { label: "Telegram", href: CONTACTS.telegram },
  { label: "WhatsApp", href: CONTACTS.whatsapp },
  { label: "Instagram", href: CONTACTS.instagram },
] as const;
