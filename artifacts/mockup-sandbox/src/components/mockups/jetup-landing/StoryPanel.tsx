import { motion, AnimatePresence } from "framer-motion";
import type { Scene, Flow } from "@/types/jetup";
import { VisualPlaceholder } from "./VisualPlaceholder";
import { CTASection } from "./CTASection";

type StoryPanelProps = {
  scene: Scene;
  sceneIndex: number;
  flow: Flow;
  onNext: () => void;
  onHome: () => void;
};

export function StoryPanel({ scene, sceneIndex, flow, onNext, onHome }: StoryPanelProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scene.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        data-testid={`story-panel-${sceneIndex}`}
        style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}
      >
        {scene.visual && (
          <div style={{ marginBottom: 22 }}>
            <VisualPlaceholder type={scene.visual} />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <h2
            data-testid="scene-headline"
            style={{
              color: "#fff",
              fontSize: scene.ctaFinal ? "1.6rem" : "1.4rem",
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: "-0.025em",
              marginBottom: 14,
            }}
          >
            {scene.headline}
          </h2>
          <p
            data-testid="scene-body"
            style={{
              color: "rgba(255,255,255,0.58)",
              fontSize: 14,
              lineHeight: 1.72,
              fontWeight: 400,
            }}
          >
            {scene.body}
          </p>
        </div>

        <div style={{ paddingTop: 24 }}>
          {scene.ctaFinal ? (
            <CTASection scene={scene} flow={flow} onHome={onHome} />
          ) : (
            <button
              data-testid="btn-next"
              onClick={onNext}
              style={{
                background: `linear-gradient(135deg, ${flow.color}22, ${flow.color}10)`,
                border: `1px solid ${flow.color}50`,
                borderRadius: 14,
                color: flow.color,
                fontSize: 15,
                fontWeight: 700,
                padding: "16px 24px",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.25s ease",
                boxShadow: `0 0 20px ${flow.color}18`,
                width: "100%",
              }}
            >
              Continue <span style={{ fontSize: 18 }}>→</span>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
