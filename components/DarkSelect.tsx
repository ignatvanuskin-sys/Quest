"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface DarkSelectProps {
  id: string;
  /** Имя поля в форме брони (quest | time | scareLevel) */
  name: "quest" | "time" | "scareLevel";
  value: string;
  options: Option[];
  placeholder: string;
  invalid?: boolean;
  describedBy?: string;
  onPick: (value: string) => void;
}

/**
 * Тёмный кастомный селект в стилистике NOX: поле-кнопка + выпадающий
 * тёмный listbox. Нативный <select> давал белый системный попап,
 * несовместимый с дизайном — поэтому свой компонент.
 * Доступность: role=listbox/option, aria-expanded/selected, keyboard,
 * Esc, закрытие по клику вне, фокус на выбранный пункт.
 */
export default function DarkSelect({
  id,
  name,
  value,
  options,
  placeholder,
  invalid,
  describedBy,
  onPick,
}: DarkSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const picked = options.find((o) => o.value === value);

  // Клик вне — закрыть
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // При открытии — фокус на выбранный пункт (или первый)
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      listRef.current
        ?.querySelector<HTMLElement>('[aria-selected="true"], [role="option"]')
        ?.focus();
    }, 30);
    return () => window.clearTimeout(t);
  }, [open]);

  const pick = (v: string) => {
    onPick(v);
    setOpen(false);
    // Возвращаем фокус на кнопку-триггер
    rootRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        data-field={name}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={`bg-bg-alt flex min-h-[46px] w-full items-center justify-between gap-3 rounded-none border px-3.5 py-2.5 text-left text-[16px] transition-colors duration-300 focus:border-fg/40 focus:outline-none md:text-[14px] ${
          picked ? "border-line text-fg" : "text-muted/70 border-line"
        } ${open ? "border-fg/40" : ""}`}
      >
        <span className="truncate">{picked ? picked.label : placeholder}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <ul
          id={`${id}-list`}
          ref={listRef}
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-[220px] overflow-y-auto rounded-none border border-line bg-bg-alt shadow-[0_18px_50px_rgba(0,0,0,0.7)]"
        >
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onClick={() => pick(o.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      pick(o.value);
                    }
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const items = Array.from(
                        listRef.current?.querySelectorAll<HTMLElement>(
                          '[role="option"]'
                        ) ?? []
                      );
                      const i = items.indexOf(e.currentTarget as HTMLElement);
                      const next =
                        items[
                          (i + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
                            items.length
                        ];
                      next?.focus();
                    }
                  }}
                  className={`hover:bg-fg/10 focus:bg-fg/10 flex min-h-[44px] w-full cursor-pointer items-center px-3.5 py-2.5 text-left text-[14px] transition-colors focus:outline-none ${
                    selected ? "bg-fg/10 text-fg" : "text-fg/85"
                  }`}
                >
                  {o.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Скрытое поле — для фокуса на первую ошибку + нативных подсказок */}
      <input type="hidden" name={name} value={value} data-field={name} />
    </div>
  );
}
