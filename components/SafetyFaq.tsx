import FaqGrid from "@/components/ui/FaqGrid";
import { FAQ_ITEMS } from "@/lib/faq";

/**
 * Безопасность и частые вопросы — юридически обязательный блок на главной.
 *
 * Разметка вынесена в переиспользуемый компонент FaqGrid
 * (components/ui/FaqGrid.tsx) в стиле NOX, данные — в lib/faq.ts
 * (единый источник для UI и JSON-LD в app/page.tsx).
 * Server component: без JS, контент всегда в HTML.
 *
 * ВАЖНО: класс `below-fold` (content-visibility: auto) здесь СОЗНАТЕЛЬНО убран.
 * Высота секции зависит от контента, поэтому до первого рендера браузер
 * подставлял заглушку contain-intrinsic-size (800 px вместо ~3900 px). Из-за
 * этого страница «дорастала» на 1778 px прямо во время скролла, а якорная
 * навигация промахивалась: замер на мобильном — пункт меню «Безопасность»
 * с холодной страницы приземлялся на 1851 px ниже цели. `below-fold`
 * оставлен только у блоков с высотой из вьюпорта (SmokeHeartBand), где
 * заглушка не может разойтись с реальностью.
 */
export default function SafetyFaq() {
  return (
    <FaqGrid
      id="safety"
      label="ВАЖНО ЗНАТЬ"
      title="Безопасность и правила"
      description="Страх у нас — постановочный. Безопасность — настоящая."
      items={FAQ_ITEMS}
    />
  );
}
