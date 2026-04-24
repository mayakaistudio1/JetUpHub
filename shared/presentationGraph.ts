export type PresentationLang = "de" | "ru" | "en";

export interface PresentationChoice {
  id: string;
  label: Partial<Record<PresentationLang, string>>;
  next: string;
}

export type EndAction = "replay" | "sofia" | "close";

export interface PresentationScene {
  id: string;
  videoKey: Partial<Record<PresentationLang, string>>;
  choices?: PresentationChoice[];
  next?: string;
  endActions?: EndAction[];
}

export const PRESENTATION_GRAPH: Record<string, PresentationScene> = {
  intro: {
    id: "intro",
    videoKey: { de: "intro", ru: "intro", en: "intro" },
    choices: [
      {
        id: "investor",
        label: { de: "Investor", ru: "Инвестор", en: "Investor" },
        next: "investor",
      },
      {
        id: "partner",
        label: { de: "Partner", ru: "Партнёр", en: "Partner" },
        next: "partner",
      },
      {
        id: "both",
        label: { de: "Beides", ru: "Оба варианта", en: "Both" },
        next: "both",
      },
    ],
  },
  investor: {
    id: "investor",
    videoKey: { de: "investor", ru: "investor", en: "investor" },
    endActions: ["replay", "sofia"],
  },
  partner: {
    id: "partner",
    videoKey: { de: "partner", ru: "partner", en: "partner" },
    endActions: ["replay", "sofia"],
  },
  both: {
    id: "both",
    videoKey: { de: "both", ru: "both", en: "both" },
    endActions: ["replay", "sofia"],
  },
};

export const PRESENTATION_START_SCENE = "intro";

export const PRESENTATION_END_LABELS: Record<EndAction, Partial<Record<PresentationLang, string>>> = {
  replay: { de: "Erneut ansehen", ru: "Смотреть ещё раз", en: "Watch again" },
  sofia: { de: "Mit Sofia sprechen", ru: "Поговорить с Софией", en: "Talk to Sofia" },
  close: { de: "Schliessen", ru: "Закрыть", en: "Close" },
};
