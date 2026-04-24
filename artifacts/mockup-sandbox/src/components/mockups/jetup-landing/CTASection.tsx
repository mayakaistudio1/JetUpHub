import type { Flow, Scene } from "@/types/jetup";

const ACCENT2 = "#A855F7";

type CTASectionProps = {
  scene: Scene;
  flow: Flow;
  onHome: () => void;
};

export function CTASection({ scene, flow, onHome }: CTASectionProps) {
  return (
    <div
      data-testid="cta-section"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <button
        data-testid="btn-cta-final"
        style={{
          background: `linear-gradient(135deg, ${flow.color}, ${ACCENT2})`,
          border: "none",
          borderRadius: 14,
          color: "#fff",
          fontSize: 15,
          fontWeight: 800,
          padding: "17px 24px",
          cursor: "pointer",
          fontFamily: "inherit",
          letterSpacing: "-0.01em",
          boxShadow: `0 4px 32px ${flow.color}50`,
          transition: "all 0.25s ease",
          width: "100%",
        }}
      >
        {scene.cta} →
      </button>
      <button
        data-testid="btn-restart"
        onClick={onHome}
        style={{
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14,
          color: "rgba(255,255,255,0.4)",
          fontSize: 13,
          fontWeight: 600,
          padding: "12px 24px",
          cursor: "pointer",
          fontFamily: "inherit",
          width: "100%",
        }}
      >
        ↩ Explore another path
      </button>
    </div>
  );
}
