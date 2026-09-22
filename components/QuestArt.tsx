import Image from "next/image";
import type { CSSProperties } from "react";

interface QuestArtProps {
  /** Сид процедурного арта — детерминированно варьирует оттенок/свет (фолбэк) */
  seed: number;
  className?: string;
  /** aria-label, если арт несёт смысл; иначе оставьте пустым (декоративный) */
  label?: string;
  /** Self-hosted изображение (/media/...). Если задано — рендерится вместо процедурного арта */
  imageSrc?: string;
  /** object-position для фокальной точки (например "50% 40%") */
  imagePosition?: string;
  /** приоритетная загрузка (только для LCP-элементов) */
  priority?: boolean;
  /** sizes для responsive images */
  sizes?: string;
}

/**
 * Атмосферный фон карточки/секции.
 * Если передан imageSrc — рендерит реальное self-hosted фото (next/image,
 * cover, без layout shift). Иначе — процедурный арт (градиенты + туман + зерно),
 * который остаётся фолбэком.
 */
export default function QuestArt({
  seed,
  className,
  label,
  imageSrc,
  imagePosition = "50% 50%",
  priority = false,
  sizes = "(max-width: 768px) 82vw, (max-width: 1200px) 33vw, 360px",
}: QuestArtProps) {
  if (imageSrc) {
    return (
      <div
        className={`quest-art ${className ?? ""}`}
        role={label ? "img" : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <Image
          src={imageSrc}
          alt={label ?? ""}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />
        {/* поверх фото — лёгкий туман для единства атмосферы */}
        <div className="fog" aria-hidden="true" />
      </div>
    );
  }

  const hue = (seed * 37) % 40; // 0–40: красно-янтарный диапазон
  const x = 20 + ((seed * 53) % 60);
  const y = 10 + ((seed * 29) % 40);
  const angle = (seed * 61) % 360;

  const style = {
    "--art-hue": hue,
    "--art-x": `${x}%`,
    "--art-y": `${y}%`,
    "--art-angle": `${angle}deg`,
  } as CSSProperties;

  return (
    <div
      className={`quest-art ${className ?? ""}`}
      style={style}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="fog" />
      <div className="fog fog--2" />
    </div>
  );
}
