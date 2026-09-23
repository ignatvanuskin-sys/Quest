"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  PRESELECT_EVENT,
  readPreselectedQuest,
  clearPreselectedQuest,
} from "@/lib/scroll";

export type BookingStatus = "idle" | "loading" | "success" | "error";

/**
 * Общая логика формы бронирования: RHF (mode: onTouched) + Zod, состояния
 * отправки, фокус на первую ошибку при неудачном submit,
 * предзаполнение квеста (CustomEvent из модалки или ?quest=slug в URL).
 * Единственный потребитель — компактная форма брони в меню (QuickBookingForm).
 */
export function useBookingForm() {
  const [status, setStatus] = useState<BookingStatus>("idle");
  /** Текст ошибки, пришедший с сервера (rate-limit, недоступный Telegram и т.п.) */
  const [serverError, setServerError] = useState<string | null>(null);
  /**
   * Демо-режим: сервер принял заявку, но Telegram не подключён и она никуда
   * не отправлена (`{ok:true, demo:true}`). Экран успеха в этом случае другой —
   * нельзя показывать «Перезвоним в течение 15 минут» там, где никто не позвонит.
   */
  const [demoDelivered, setDemoDelivered] = useState(false);

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

  /**
   * Вместимость выбранной комнаты. Общий предел схемы (1..12) не знает о зале:
   * «Дом Ворона» — 2–5 человек. Степпер обязан упираться в лимит комнаты,
   * иначе гость отправляет заявку на 12 игроков в комнату на 5.
   * Пока квест не выбран — действует общий предел.
   */
  const selectedQuest = useMemo(
    () => QUESTS.find((q) => q.slug === questValue) ?? null,
    [questValue]
  );
  const playersMin = selectedQuest?.playersMin ?? PLAYERS_MIN;
  const playersMax = selectedQuest?.playersMax ?? PLAYERS_MAX;

  const playersRef = useRef(players);
  playersRef.current = players;

  // Смена квеста подтягивает количество игроков в диапазон новой комнаты
  useEffect(() => {
    const quest = QUESTS.find((q) => q.slug === questValue);
    if (!quest) return;
    const current = playersRef.current;
    const clamped = Math.min(quest.playersMax, Math.max(quest.playersMin, current));
    if (clamped !== current) setValue("players", clamped, { shouldValidate: true });
  }, [questValue, setValue]);

  // Предзаполнение квеста: CustomEvent (если форма уже смонтирована),
  // сохранённый slug (preselectQuest вызван до открытия диалога) или ?quest=slug
  useEffect(() => {
    const onPreselect = (e: Event) => {
      setValue("quest", (e as CustomEvent<string>).detail, {
        shouldValidate: true,
      });
    };
    window.addEventListener(PRESELECT_EVENT, onPreselect);

    // Подхват сохранённого предвыбора (формы не было в DOM при диспатче).
    // Значение одноразовое: применили — очистили, иначе оно «прилипало»
    // ко всем следующим открытиям формы до перезагрузки страницы.
    const pending = readPreselectedQuest();
    if (pending && QUESTS.some((q) => q.slug === pending)) {
      setValue("quest", pending, { shouldValidate: true });
    }
    clearPreselectedQuest();

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
    setServerError(null);
    setDemoDelivered(false);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        // Сервер объясняет причину человеческим языком (429 — лимит,
        // 503 — приём заявок выключен, 422 — правило комнаты).
        // Показываем именно её вместо безликого «проверьте соединение».
        let message: string | null = null;
        try {
          const payload: unknown = await res.json();
          if (
            payload &&
            typeof payload === "object" &&
            typeof (payload as { error?: unknown }).error === "string"
          ) {
            message = (payload as { error: string }).error;
          }
        } catch {
          /* тело не JSON — остаёмся с общей формулировкой */
        }
        setServerError(message);
        setStatus("error");
        return;
      }
      // Читаем тело даже при успехе: сервер помечает демо-режим флагом demo.
      // Разбор не должен ломать успех — при любой проблеме считаем режим живым.
      try {
        const payload: unknown = await res.json();
        setDemoDelivered(
          Boolean(
            payload &&
            typeof payload === "object" &&
            (payload as { demo?: unknown }).demo === true
          )
        );
      } catch {
        setDemoDelivered(false);
      }
      setStatus("success");
    } catch {
      // Сеть/обрыв: сообщение сервера недоступно
      setServerError(null);
      setStatus("error");
    }
  }, onInvalid);

  /** Степпер игроков с ограничением вместимости выбранной комнаты */
  const setPlayers = (next: number) =>
    setValue("players", Math.min(playersMax, Math.max(playersMin, next)), {
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
    setServerError(null);
    setDemoDelivered(false);
    setStatus("idle");
  };

  return {
    register,
    errors,
    status,
    serverError,
    demoDelivered,
    players,
    playersMin,
    playersMax,
    selectedQuest,
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
