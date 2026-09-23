"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { QUESTS, TIME_SLOTS } from "@/lib/quests";
import { useBookingForm } from "@/lib/useBookingForm";
import { PLAYERS_MAX, todayLocalISO } from "@/lib/validation";
import { VIDEO_RECORD_PRICE } from "@/lib/site";
import DarkSelect from "@/components/DarkSelect";

// Стили полей — общие классы из styles/globals.css (.field-input,
// .field-label, .field-error). Так все поля на сайте выглядят одинаково:
// 46px высота, отступ px-3.5, одинаковые hover/focus/invalid.
// 16px на мобильных — Safari не зумит форму при фокусе (input zoom).
const field = "field-input";
const label = "field-label";
const error = "field-error";

/** id ошибки для aria-describedby */
const errId = (name: string) => `q-${name}-error`;

/**
 * Компактная форма записи: имя, телефон, квест, дата/время, игроки, согласие.
 * Отправляет заявку в /api/book → Telegram. Заголовок даёт родительский
 * диалог (BookingModal); здесь — только поля.
 */
export default function QuickBookingForm({ onClose }: { onClose?: () => void }) {
  const {
    register,
    errors,
    status,
    players,
    phoneValue,
    questValue,
    timeValue,
    scareValue,
    setField,
    onSubmit,
    setPlayers,
    onPhoneChange,
    submitAnother,
  } = useBookingForm();

  /** Опции селектов в стилистике формы */
  const questOptions = QUESTS.map((q) => ({
    value: q.slug,
    label: `${q.title} · ${q.ageLimit}`,
  }));
  const timeOptions = TIME_SLOTS.map((t) => ({ value: t, label: t }));
  // Подписи короткие намеренно: длинные («Стандарт — атмосфера без агрессии»)
  // обрезались многоточием в поле селекта на экранах 320–360px, и игрок
  // не видел выбранный уровень, не раскрыв список заново.
  const scareOptions = [
    { value: "standard", label: "Стандарт — атмосфера" },
    { value: "intense", label: "Интенсив — актёры рядом" },
    { value: "extreme", label: "Экстремаль — максимум" },
  ];

  // min для date-инпута — только после монтирования (hydration-safe:
  // сервер и первый клиентский рендер совпадают, значение подставляется эффектом)
  const [minDate, setMinDate] = useState<string>("");
  useEffect(() => {
    setMinDate(todayLocalISO());
  }, []);

  return (
    // Раньше здесь была вложенная .panel — двойная рамка и двойные отступы
    // (40px по бокам на телефоне). Отступы и рамку даёт BookingModal.
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="ok"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-start gap-4 py-2"
            role="status"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-fg/40 text-fg/80">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2.5 8.5l3.5 3.5 7-8" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <div>
              <p className="font-display text-2xl text-fg">Заявка получена.</p>
              <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
                Перезвоним в течение 15 минут, чтобы подтвердить бронь.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={submitAnother}
                className="btn-ghost text-[11px]"
              >
                Ещё заявка
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary text-[11px]"
                >
                  Закрыть
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
            className="space-y-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="q-name" className={label}>
                  Имя
                </label>
                <input
                  id="q-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Как обращаться"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? errId("name") : undefined}
                  className={field}
                  {...register("name")}
                />
                {errors.name?.message && (
                  <p id={errId("name")} className={error} role="alert">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="q-phone" className={label}>
                  Телефон
                </label>
                <input
                  id="q-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 (___) ___-__-__"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? errId("phone") : undefined}
                  className={field}
                  value={phoneValue}
                  onChange={(e) => onPhoneChange(e.target.value)}
                />
                {errors.phone?.message && (
                  <p id={errId("phone")} className={error} role="alert">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <span id="q-quest-label" className={label}>
                Квест
              </span>
              <DarkSelect
                id="q-quest"
                name="quest"
                value={questValue}
                options={questOptions}
                placeholder="Выберите комнату"
                invalid={!!errors.quest}
                describedBy={errors.quest ? errId("quest") : undefined}
                onPick={(v) => setField("quest", v)}
              />
              {errors.quest?.message && (
                <p id={errId("quest")} className={error} role="alert">
                  {errors.quest.message}
                </p>
              )}
            </div>
            {/* Уровень страха — персонализация интенсивности */}
            <div>
              <span id="q-scareLevel-label" className={label}>
                Уровень страха
              </span>
              <DarkSelect
                id="q-scareLevel"
                name="scareLevel"
                value={scareValue}
                options={scareOptions}
                placeholder="Стандарт"
                onPick={(v) => setField("scareLevel", v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="q-date" className={label}>
                  Дата
                </label>
                <input
                  id="q-date"
                  type="date"
                  min={minDate || undefined}
                  aria-invalid={!!errors.date}
                  aria-describedby={errors.date ? errId("date") : undefined}
                  className={field}
                  {...register("date")}
                />
                {errors.date?.message && (
                  <p id={errId("date")} className={error} role="alert">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <span id="q-time-label" className={label}>
                  Время
                </span>
                <DarkSelect
                  id="q-time"
                  name="time"
                  value={timeValue}
                  options={timeOptions}
                  placeholder="Слот"
                  invalid={!!errors.time}
                  describedBy={errors.time ? errId("time") : undefined}
                  onPick={(v) => setField("time", v)}
                />
                {errors.time?.message && (
                  <p id={errId("time")} className={error} role="alert">
                    {errors.time.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="q-players" className={label}>
                Игроков
              </label>
              <div className="flex items-stretch border border-line bg-bg-alt">
                <button
                  type="button"
                  aria-label="Уменьшить количество игроков"
                  disabled={players <= 1}
                  onClick={() => setPlayers(players - 1)}
                  className="min-h-[46px] w-[48px] text-lg text-fg transition-colors hover:bg-fg/5 disabled:opacity-30"
                >
                  −
                </button>
                <output
                  id="q-players"
                  aria-live="polite"
                  // aria-invalid здесь невалиден: у role="status" (неявная роль
                  // <output>) он не поддерживается. Ошибку доносит текст ниже,
                  // связанный через aria-describedby.
                  aria-describedby={errors.players ? errId("players") : undefined}
                  className="flex flex-1 items-center justify-center border-x border-line text-[14px] text-fg"
                >
                  {players}
                </output>
                <button
                  type="button"
                  aria-label="Увеличить количество игроков"
                  disabled={players >= PLAYERS_MAX}
                  onClick={() => setPlayers(players + 1)}
                  className="min-h-[46px] w-[48px] text-lg text-fg transition-colors hover:bg-fg/5 disabled:opacity-30"
                >
                  +
                </button>
              </div>
              {errors.players?.message && (
                <p id={errId("players")} className={error} role="alert">
                  {errors.players.message}
                </p>
              )}
            </div>

            {/* Видеозапись прохождения — upsell */}
            <div>
              <label
                htmlFor="q-videoRecord"
                className="flex min-h-[44px] cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted transition-colors hover:text-fg"
              >
                <input
                  id="q-videoRecord"
                  type="checkbox"
                  className="checkbox mt-0.5"
                  {...register("videoRecord")}
                />
                <span>
                  Видеозапись <span className="text-fg">+{VIDEO_RECORD_PRICE}</span>
                </span>
              </label>
            </div>

            {/* Honeypot: скрыто от людей */}
            <div
              className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="q-website">Ваш сайт</label>
              <input
                id="q-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>

            <div>
              <label
                htmlFor="q-agree"
                className="flex min-h-[44px] cursor-pointer items-start gap-3 text-[12px] leading-relaxed text-muted transition-colors hover:text-fg"
              >
                <input
                  id="q-agree"
                  type="checkbox"
                  aria-invalid={!!errors.agree}
                  aria-describedby={errors.agree ? errId("agree") : undefined}
                  className="checkbox mt-0.5"
                  {...register("agree")}
                />
                <span>
                  Согласен(на) на{" "}
                  {/* py-1 увеличивает область тапа инлайн-ссылки до ~31px,
                      не влияя на высоту строки (padding инлайн-бокса) */}
                  <Link
                    href="/privacy"
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                    className="py-1 text-fg underline decoration-line underline-offset-2 transition-colors hover:text-accent-text"
                  >
                    обработку персональных данных
                  </Link>
                </span>
              </label>
              {errors.agree?.message && (
                <p id={errId("agree")} className={error} role="alert">
                  {errors.agree.message}
                </p>
              )}
            </div>

            {status === "error" && (
              <p
                className="border border-fg/30 bg-fg/5 px-3 py-2 text-[12px] text-fg"
                role="alert"
              >
                Не удалось отправить. Проверьте соединение и попробуйте снова.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary mt-1 min-h-[48px] w-full disabled:cursor-wait disabled:opacity-60"
            >
              {status === "loading"
                ? "Отправляем…"
                : status === "error"
                  ? "Повторить"
                  : "Забронировать"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
