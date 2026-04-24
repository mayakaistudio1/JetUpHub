import type { ConversationStep } from "@/types/jetup";

export const CONCIERGE_STEPS: ConversationStep[] = [
  {
    id: "step-1",
    text: "Hey. Before I show you what JetUP is —",
    delay: 400,
  },
  {
    id: "step-2",
    text: "let me ask you one question.",
    delay: 0,
  },
  {
    id: "step-3",
    text: "What brought you here today?",
    delay: 0,
  },
];
