import { useState, useCallback } from "react";
import type { Flow, JetupStage } from "@/types/jetup";

export type JetupFlowState = {
  stage: JetupStage;
  activeFlow: Flow | null;
  sceneIndex: number;
};

export type JetupFlowActions = {
  startFlow: (flow: Flow) => void;
  goNext: () => void;
  goBack: () => void;
  goHome: () => void;
  showChoices: () => void;
};

export function useJetupFlow(): JetupFlowState & JetupFlowActions {
  const [stage, setStage] = useState<JetupStage>("concierge");
  const [activeFlow, setActiveFlow] = useState<Flow | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);

  const showChoices = useCallback(() => {
    setStage("choice");
  }, []);

  const startFlow = useCallback((flow: Flow) => {
    setActiveFlow(flow);
    setSceneIndex(0);
    setStage("flow");
  }, []);

  const goNext = useCallback(() => {
    if (!activeFlow) return;
    const maxIndex = activeFlow.scenes.length - 1;
    setSceneIndex((i) => Math.min(i + 1, maxIndex));
  }, [activeFlow]);

  const goBack = useCallback(() => {
    setSceneIndex((i) => Math.max(0, i - 1));
  }, []);

  const goHome = useCallback(() => {
    setStage("concierge");
    setActiveFlow(null);
    setSceneIndex(0);
  }, []);

  return {
    stage,
    activeFlow,
    sceneIndex,
    startFlow,
    goNext,
    goBack,
    goHome,
    showChoices,
  };
}
