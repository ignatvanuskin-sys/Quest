"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span,
} as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** задержка, сек */
  delay?: number;
  /** сдвиг снизу, px (по ТЗ 24–32) */
  y?: number;
  as?: keyof typeof MOTION_TAGS;
}

/**
 * Scroll-reveal: fade + сдвиг снизу при входе во вьюпорт.
 * При prefers-reduced-motion — простое появление без сдвига.
 * Начальное состояние (opacity 0) применяется только в JS на клиенте —
 * в SSR-HTML контент полностью видим, при отключённом JS сайт не пустует.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Tag = MOTION_TAGS[as];

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{ duration: reduced ? 0.2 : 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
