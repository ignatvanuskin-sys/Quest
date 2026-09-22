import FaqGrid from "@/components/ui/FaqGrid";
import { FAQ_ITEMS } from "@/lib/faq";

/**
 * Безопасность и частые вопросы — юридически обязательный блок на главной.
 *
 * Разметка вынесена в переиспользуемый компонент FaqGrid
 * (components/ui/FaqGrid.tsx) в стиле NOX, данные — в lib/faq.ts
 * (единый источник для UI и JSON-LD в app/page.tsx).
 * Server component: без JS, контент всегда в HTML.
 */
export default function SafetyFaq() {
  return (
    <FaqGrid
      id="safety"
      label="ВАЖНО ЗНАТЬ"
      title="Безопасность и правила"
      description="Страх у нас — постановочный. Безопасность — настоящая."
      items={FAQ_ITEMS}
      className="below-fold"
    />
  );
}
