import type { Flow } from "@/types/jetup";
import { ProgressDots } from "./ProgressDots";
import { StoryPanel } from "./StoryPanel";

type SceneShellProps = {
  flow: Flow;
  sceneIndex: number;
  onBack: () => void;
  onHome: () => void;
  onNext: () => void;
};

export function SceneShell({ flow, sceneIndex, onBack, onHome, onNext }: SceneShellProps) {
  const scene = flow.scenes[sceneIndex];
  const totalScenes = flow.scenes.length;

  return (
    <div
      data-testid="scene-shell"
      style={{ display: "flex", flexDirection: "column", flex: 1, gap: 0 }}
    >
      {/* Top navigation bar */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", paddingBottom: 20,
      }}>
        <button
          data-testid="btn-back"
          onClick={sceneIndex === 0 ? onHome : onBack}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "rgba(255,255,255,0.5)",
            fontSize: 13, fontWeight: 600,
            padding: "7px 14px",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          ← {sceneIndex === 0 ? "Back" : "Previous"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15 }}>{flow.icon}</span>
          <span style={{ color: flow.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em" }}>
            {flow.label.toUpperCase()}
          </span>
        </div>
        <div style={{
          color: "rgba(255,255,255,0.2)", fontSize: 11,
          fontWeight: 600, letterSpacing: "0.1em",
        }}>
          {String(sceneIndex + 1).padStart(2, "0")}/{String(totalScenes).padStart(2, "0")}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ paddingBottom: 22 }}>
        <ProgressDots total={totalScenes} current={sceneIndex} color={flow.color} />
      </div>

      {/* Animated scene content */}
      <StoryPanel
        key={scene.id}
        scene={scene}
        sceneIndex={sceneIndex}
        flow={flow}
        onNext={onNext}
        onHome={onHome}
      />
    </div>
  );
}
