export type Scene = {
  id: string;
  headline: string;
  body: string;
  visual?: string;
  cta?: string;
  ctaFinal?: boolean;
};

export type FlowKey = "product" | "partner" | "ai" | "system";

export type Flow = {
  key: FlowKey;
  label: string;
  icon: string;
  tagline: string;
  color: string;
  scenes: Scene[];
};

export type ConversationStep = {
  id: string;
  text: string;
  delay: number;
};

export type JetupStage = "concierge" | "choice" | "flow";
