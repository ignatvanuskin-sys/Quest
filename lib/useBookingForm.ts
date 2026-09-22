"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bookingSchema,
  formatPhone,
  PLAYERS_MIN,
  PLAYERS_MAX,
  type BookingData,
} from "@/lib/validation";
import { QUESTS } from "@/lib/quests";
import { PRESELECT_EVENT, readPreselectedQuest } from "@/lib/scroll";

export type BookingStatus = "idle" | "loading" | "success" | "error";

/**
 * Общая логика формы бронирования: RHF (mode: onTouched) + Zod, состояния
 * отправки, фокус на первую ошибку при неудачном submit,
 * предзаполнение квеста (CustomEvent из модалки или ?quest=slug в URL).
 * Единственный потребитель — компактная форма брони в меню (QuickBookingForm).
 */
export function useBookingForm() {
  const [status, setStatus] = useState<BookingStatus>("idle");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingData>({
    // onTouched: ошибки полей появляются после первого blur — раньше,
    // чем пачка ошибок при submit, но без раздражающей валидации на каждый ввод
    mode: "onTouched",
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      phone: "",
      contact: "",
      quest: "",
      date: "",
      time: "",
      players: 2,
      comment: "",
      scareLevel: "standard",
      videoRecord: false,
      agree: false as unknown as true,
      website: "",
    },
  });

  const players = watch("players");
  const phoneValue = watch("phone");
  const questValue = watch("quest");
  const timeValue = watch("time");
  const scareValue = watch("scareLevel") ?? "standard";

  // Предзаполнение квеста: CustomEvent (если форма уже смонтирована),
  // сохранённый slug (preselectQuest вызван до открытия диалога) или ?quest=slug
  useEffect(() => {
    const onPreselect = (e: Event) => {
      setValue("quest", (e as CustomEvent<string>).detail, {
        shouldValidate: true,
      });
    };
    window.addEventListener(PRESELECT_EVENT, onPreselect);

    // Подхват сохранённого предвыбора (формы не было в DOM при диспатче)
    const pending = readPreselectedQuest();
    if (pending && QUESTS.some((q) => q.slug === pending)) {
      setValue("quest", pending, { shouldValidate: true });
    }

    const fromUrl = new URLSearchParams(window.location.search).get("quest");
    if (fromUrl && QUESTS.some((q) => q.slug === fromUrl)) {
      setValue("quest", fromUrl, { shouldValidate: true });
    }

    return () => window.removeEventListener(PRESELECT_EVENT, onPreselect);
  }, [setValue]);

  /**
   * При ошибке валидации переводим фокус на первое поле с aria-invalid.
   * Сначала проверяем кастомные селекты (DarkSelect: кнопка-триггер
   * с data-field), затем обычные инпуты. Короткая задержка — ждём
   * рендер ошибок. Мягко: без агрессивного скролла.
   */
  const onInvalid = () => {
    window.setTimeout(() => {
      const custom = document.querySelector<HTMLElement>(
        'button[data-field][aria-invalid="true"]'
      );
      if (custom) {
        custom.focus();
        return;
      }
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }, 60);
  };

  const onSubmit = handleSubmit(async (data) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, onInvalid);

  /** Степпер игроков с ограничением PLAYERS_MIN..PLAYERS_MAX */
  const setPlayers = (next: number) =>
    setValue("players", Math.min(PLAYERS_MAX, Math.max(PLAYERS_MIN, next)), {
      shouldValidate: true,
    });

  const onPhoneChange = (value: string) =>
    setValue("phone", formatPhone(value), { shouldValidate: true });

  /**
   * Установка поля из кастомного селекта (DarkSelect) — с триггером валидации.
   * Нужна, т.к. кастомный listbox не регистрируется через register().
   * Типобезопасно для трёх полей формы; дженерик setValue из RHF
   * не выводит такие юнионы корректно, поэтому явный switch.
   */
  const setField = (name: "quest" | "time" | "scareLevel", value: string) => {
    if (name === "quest") {
      setValue("quest", value, { shouldValidate: true, shouldTouch: true });
    } else if (name === "time") {
      setValue("time", value, { shouldValidate: true, shouldTouch: true });
    } else {
      setValue("scareLevel", value as "standard" | "intense" | "extreme", {
        shouldValidate: true,
        shouldTouch: true,
      });
    }
  };

  const submitAnother = () => {
    reset();
    setStatus("idle");
  };

  return {
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
  };
}
