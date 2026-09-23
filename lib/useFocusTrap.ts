import { useEffect } from "react";

/**
 * Focus trap: перехват Tab/Shift+Tab внутри контейнера.
 * Общий для всех диалогов (QuestModal, BookingModal).
 *
 * Слушатель вешается на document, а не на сам контейнер. Раньше Tab ловился
 * на контейнере — и этого не хватало: клик по бэкдропу (кнопка вне панели)
 * или программный focus оставляли фокус ЗА пределами диалога, а keydown с
 * <body> до контейнера не всплывает. Tab после этого уводил фокус на
 * страницу под модалкой. На document мы это видим и затягиваем фокус назад.
 *
 * Стек активных ловушек нужен для вложенных диалогов: Tab должен
 * обрабатывать только верхний, иначе нижний перетягивает фокус к себе.
 */
const trapStack: React.RefObject<HTMLElement | null>[] = [];

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;

    const selector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    trapStack.push(containerRef);

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      // Обрабатывает только верхняя ловушка
      if (trapStack[trapStack.length - 1] !== containerRef) return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = container.querySelectorAll<HTMLElement>(selector);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement as HTMLElement | null;

      // Фокус вне диалога (бэкдроп, Esc в списке, программный focus) —
      // затягиваем его обратно внутрь.
      if (!current || !container.contains(current)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }

      if (e.shiftKey) {
        if (current === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (current === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => {
      const i = trapStack.indexOf(containerRef);
      if (i !== -1) trapStack.splice(i, 1);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [active, containerRef]);
}
