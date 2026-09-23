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
Проверка типов: `npm run typecheck`. Тесты: `npm run test`
(API-контракт, валидация, rate-limit, скролл-фолбэк).

> [!IMPORTANT]
> **Демо-режим (по умолчанию).** Пока `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`
> не заданы, сайт полностью работоспособен как демо: форма отправляется,
> серверная валидация и проверки комнаты срабатывают, но заявка **никуда не
> уходит**, и гость видит честную пометку «Демо-режим: заявка не отправлена»
> вместо «Перезвоним в течение 15 минут». Так демо не создаёт ложного
> впечатления, что бронь принята.
>
> Для боевого сайта: задайте `TELEGRAM_*` — заявки начнут доставляться в бота.
> Если Telegram не нужен, но и демо-пометка недопустима, поставьте
> `NEXT_PUBLIC_DEMO_MODE=false`: тогда `POST /api/book` отвечает `503`
> с телефоном для звонка. Проверить режим:
> `curl -s -X POST localhost:3000/api/book -H "Content-Type: application/json" -d '{}'`
> (`{"demo":true,…}` в ответе с `200` — демо; `503` — приём выключен; `422` — приём включён, тело пустое).

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

## Мобильные детали

- Системная кнопка/жест «Назад» закрывает модалку и меню, а не уводит со страницы
  (`lib/overlay-history.ts`); вложенные диалоги (квест → бронь) закрываются по одному.
- Прокрутка фона под оверлеем блокируется счётно (`lib/scroll-lock.ts`) и не разблокируется,
  пока открыт хотя бы один диалог.
- Шапки модалок (крестик) и hero квеста не скроллятся вместе с содержимым — на низких экранах
  кнопка закрытия всегда в кадре.
- `hover`-стили включены только при `@media (hover: hover)`; на тач-устройствах отклик даёт `:active`.
- Отступ якорной навигации задаётся одним источником — CSS `scroll-margin-top` (Lenis читает его сам).

Проверка мобильных сценариев с настоящими touch-событиями:

```bash
npm run build && npx next start -p 3111
node audit/mobile/mobile-probe.mjs after   # 16 сценариев, отчёт в audit/mobile/report/
```

Разбор находок и исправлений — `audit/mobile/MOBILE-AUDIT-REPORT.md`.
