# NOX — комнаты страха

Кинематографичный сайт сети квест-румов: каталог квестов + онлайн-бронирование
с уведомлением владельца в Telegram. Тёмный luxury-хоррор: крупная типографика,
туман, зерно плёнки, мерцающий свет.

## Стек

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Framer Motion ·
GSAP + ScrollTrigger · Lenis · React Hook Form + Zod

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # впишите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
npm run dev
```

Продакшен-сборка: `npm run build && npm start`. Линт: `npm run lint`.
Проверка типов: `npm run typecheck`.

## Переменные окружения

| Переменная             | Назначение                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN`   | Токен бота (@BotFather) для заявок из формы брони                                       |
| `TELEGRAM_CHAT_ID`     | chat_id владельца/группы, куда приходят заявки                                          |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL (для OG/canonical/sitemap). По умолчанию `https://qwest-scary.vercel.app` |

## Структура

- `app/page.tsx` — главная (все секции + JSON-LD)
- `app/quests/[slug]/page.tsx` — SEO-страницы квестов (SSG, per-quest OG)
- `app/api/book/route.ts` — приём заявки → Telegram (rate-limit + honeypot + Zod)
- `app/sitemap.ts`, `robots.ts`, `manifest.ts` — SEO-инфраструктура
- `components/` — секции и UI (Hero, каталог, модалка, форма, отзывы, FAQ, контакты)
- `lib/` — данные каталога, валидация, telegram-хелпер, rate-limit, скролл
- `public/media/` — self-hosted фото/видео (см. `public/media/README.md`)
- `tools/` — скрипты оптимизации медиа (кроп/постер/иконки)

## Медиа

Все изображения/видео — self-hosted в `public/media`, сгенерированы из папки
`МЕДИА КОНТЕНТ` скриптом `tools/optimize-media.ps1`. Для замены — положите
файлы с теми же именами или поправьте пути в `lib/quests.ts`.

## Доступность и производительность

- `prefers-reduced-motion` глушит параллакс/видео/зерно до простых fade
- Hero-видео отключается при save-data / медленном соединении (постер-фолбэк)
- `next/image` везде, `priority` только у LCP-элемента, кэширование `/media` — 1 год
- Skip-link, focus-менеджмент модалки, видимые фокус-стейты, aria-атрибуты
- Security headers, rate-limit, honeypot в форме
