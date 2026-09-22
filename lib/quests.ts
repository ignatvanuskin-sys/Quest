/**
 * Плейсхолдер-каталог квестов NOX.
 * Замените на реальные данные клиента: названия, жанры, фото/видео, условия.
 */

export type GenreId = "horror" | "mystic" | "thriller" | "beginners";

export interface Genre {
  id: GenreId;
  label: string;
}

export const GENRES: Genre[] = [
  { id: "horror", label: "Хоррор" },
  { id: "mystic", label: "Мистика" },
  { id: "thriller", label: "Триллер" },
  { id: "beginners", label: "Для новичков" },
];

export interface Quest {
  slug: string;
  title: string;
  genreIds: GenreId[];
  genreLabel: string;
  /** Сложность 1..5 (черепа) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Длительность, минут */
  durationMin: number;
  playersMin: number;
  playersMax: number;
  ageLimit: string;
  /** Цена «от» за группу, ₽ (демо-значения — замените на реальные при адаптации) */
  priceFrom: number;
  /** Короткий тизер — 1 фраза, интрига без спойлеров */
  teaser: string;
  /** Полное описание сюжета без спойлера концовки */
  plot: string;
  /** Состав актёров (если есть) */
  actors: string;
  /** Что взять с собой */
  bring: string[];
  /** Противопоказания конкретно этой комнаты */
  contraindications: {
    strobe: boolean;
    tightSpaces: boolean;
    actorContact: boolean;
  };
  /** Сиды процедурного арта (фолбэк) + реальные self-hosted изображения */
  art: { cover: number; gallery: number[] };
  /** Обложка карточки (self-hosted, /media/quests/...) */
  cover: string;
  /** Кадры галереи в детальной карточке */
  gallery: string[];
}

export const QUESTS: Quest[] = [
  {
    slug: "dom-vorona",
    title: "Дом Ворона",
    genreIds: ["horror"],
    genreLabel: "Психологический хоррор",
    difficulty: 4,
    durationMin: 60,
    playersMin: 2,
    playersMax: 5,
    ageLimit: "16+",
    priceFrom: 4000,
    teaser:
      "В этом доме не живут уже тридцать лет. Но каждую ночь в его окнах кто-то стоит.",
    plot: "Провинциальный особняк на окраине города пустует с тех пор, как бесследно исчезла семья Вороновых. Вы — группа энтузиастов, решивших проверить, правдивы ли городские легенды. Дверь за вами закрывается, дом начинает рассказывать свою историю — и она оказывается страшнее любой легенды. Никаких скримеров в лицо: напряжение нарастает через звук, свет и детали, которые вы заметите слишком поздно.",
    actors: "1 актёр — «хранитель дома». Появляется неожиданно, контакта нет.",
    bring: [
      "Удобная обувь без каблуков",
      "Одежда, которую не жалко запачкать",
      "Телефон сдаётся на входе",
    ],
    contraindications: { strobe: true, tightSpaces: true, actorContact: false },
    art: { cover: 7, gallery: [7, 19, 42] },
    cover: "/media/quests/dom-vorona.jpg",
    gallery: [
      "/media/quests/g-door.jpg",
      "/media/quests/g-chair.jpg",
      "/media/quests/g-corridor.jpg",
    ],
  },
  {
    slug: "klinika-9",
    title: "Клиника №9",
    genreIds: ["horror", "thriller"],
    genreLabel: "Триллер · актёр в комнате",
    difficulty: 5,
    durationMin: 60,
    playersMin: 2,
    playersMax: 6,
    ageLimit: "18+",
    priceFrom: 4500,
    teaser:
      "Палата №9 в закрытой клинике числится пустой. Журнал приёма говорит обратное.",
    plot: "Заброшенное крыло районной клиники, где в 90-е проводили незарегистрированные исследования. Вы проникаете внутрь ночью, чтобы найти документы, и обнаруживаете, что клиника не совсем заброшена. Самый интенсивный формат NOX: живой актёр взаимодействует с группой, сценарий подстраивается под ваши решения. Для тех, кто уверен в своих нервах.",
    actors:
      "2 актёра — «санитар» и «пациент». Возможен лёгкий контакт по правилам (обсуждается до старта).",
    bring: [
      "Удобная обувь и одежда для активного передвижения",
      "Только трезвое состояние — строго",
      "Телефон и ценности сдаются на входе",
    ],
    contraindications: { strobe: true, tightSpaces: true, actorContact: true },
    art: { cover: 3, gallery: [3, 11, 28] },
    cover: "/media/quests/klinika-9.jpg",
    gallery: [
      "/media/quests/g-corridor.jpg",
      "/media/quests/g-door.jpg",
      "/media/quests/g-chair.jpg",
    ],
  },
  {
    slug: "kukolnyh-del-master",
    title: "Кукольных дел мастер",
    genreIds: ["mystic"],
    genreLabel: "Мистика",
    difficulty: 3,
    durationMin: 60,
    playersMin: 2,
    playersMax: 6,
    ageLimit: "14+ (с родителем)",
    priceFrom: 3800,
    teaser:
      "Каждая кукла в его мастерской — чья-то несыгранная роль. Одна из них ждала именно вас.",
    plot: "Старинная мастерская кукольника, закрытая после его загадочной смерти. Говорят, мастер вкладывал в свои работы нечто большее, чем талант. Ваша задача — разгадать тайну последней, незаконченной куклы. Атмосферная мистика без агрессивных скримеров: головоломки, звуковой дизайн и история, которая цепляет за живое. Отличный выбор для первого визита в NOX.",
    actors: "Без актёров. Полностью декорационно-механический формат.",
    bring: [
      "Ничего специального",
      "Очки, если плохо видите в сумерках — внутри приглушённый свет",
    ],
    contraindications: { strobe: false, tightSpaces: true, actorContact: false },
    art: { cover: 13, gallery: [13, 33, 55] },
    cover: "/media/quests/kukolnyh-del-master.jpg",
    gallery: [
      "/media/quests/g-key.jpg",
      "/media/quests/g-door.jpg",
      "/media/quests/g-chair.jpg",
    ],
  },
  {
    slug: "cherny-korabl",
    title: "Чёрный корабль",
    genreIds: ["beginners", "mystic"],
    genreLabel: "Приключения · лёгкий формат",
    difficulty: 2,
    durationMin: 60,
    playersMin: 2,
    playersMax: 6,
    ageLimit: "10+",
    priceFrom: 3500,
    teaser:
      "Корабль-призрак снова вошёл в гавань. Говорят, на его борту — карта, которой нет ни в одном атласе.",
    plot: "Приключенческий квест в декорациях старинного фрегата: трюм, капитанская каюта, шторм за бортом и проклятие, которое нужно снять до рассвета. Динамичные задания, командная работа и никакого хоррора — только азарт и атмосфера морской легенды. Подходит детям от 10 лет и тем, кто хочет познакомиться с жанром без стресса.",
    actors: "Без актёров. Ведущий сопровождает группу дистанционно.",
    bring: ["Удобная обувь", "Хорошее настроение — остальное найдётся на борту"],
    contraindications: { strobe: false, tightSpaces: false, actorContact: false },
    art: { cover: 21, gallery: [21, 47, 63] },
    cover: "/media/quests/cherny-korabl.jpg",
    gallery: [
      "/media/quests/g-corridor.jpg",
      "/media/quests/g-door.jpg",
      "/media/quests/g-chair.jpg",
    ],
  },
];

export function getQuestBySlug(slug: string): Quest | undefined {
  return QUESTS.find((q) => q.slug === slug);
}

/** Слоты желаемого времени (статичные на MVP, 12:00–22:00, шаг 1 час) */
export const TIME_SLOTS: string[] = Array.from({ length: 11 }, (_, i) => {
  const h = 12 + i;
  return `${String(h).padStart(2, "0")}:00`;
});
