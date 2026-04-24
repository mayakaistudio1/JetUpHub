import { motion, AnimatePresence } from "framer-motion";
import { FLOWS } from "@/data/jetupFlows";
import { CONCIERGE_STEPS } from "@/data/jetupConcierge";
import { useJetupFlow } from "@/hooks/useJetupFlow";
import { HeroScene } from "./HeroScene";
import { SceneShell } from "./SceneShell";

const BG = "#0c0b1a";
const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";

export function JetupLanding() {
  const { stage, activeFlow, sceneIndex, startFlow, goNext, goBack, goHome, showChoices } = useJetupFlow();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes orb-pulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes float-particle {
          0%,100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-18px) translateX(8px); }
          66% { transform: translateY(-8px) translateX(-6px); }
        }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div
        data-testid="jetup-landing"
        style={{
          minHeight: "100dvh",
          width: "100%",
          background: BG,
          fontFamily: "'Inter', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Ambient orbs */}
        <div style={{
          position: "fixed", top: "-30%", left: "-20%",
          width: "70vw", height: "70vw", borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 65%)`,
          pointerEvents: "none", zIndex: 0,
          animation: "orb-pulse 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "fixed", bottom: "-20%", right: "-15%",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: `radial-gradient(circle, ${ACCENT2}14 0%, transparent 65%)`,
          pointerEvents: "none", zIndex: 0,
          animation: "orb-pulse 10s ease-in-out infinite reverse",
        }} />

        {/* Floating particles */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${(i % 3) * 0.8 + 0.8}px`,
                height: `${(i % 3) * 0.8 + 0.8}px`,
                borderRadius: "50%",
                background: i % 3 === 0 ? ACCENT2 : ACCENT,
                left: `${10 + (i * 4.7) % 80}%`,
                top: `${5 + (i * 6.3) % 85}%`,
                opacity: 0.15 + (i % 4) * 0.07,
                animation: `float-particle ${6 + (i % 4) * 2}s ease-in-out infinite`,
                animationDelay: `${(i % 5) * 0.8}s`,
              }}
            />
          ))}
        </div>

        {/* Fixed header */}
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0,
          padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(12,11,26,0.85)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          zIndex: 100,
        }}>
          <button
            data-testid="logo-home"
            onClick={goHome}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: "inherit",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#fff",
              boxShadow: `0 0 16px ${ACCENT}50`,
            }}>
              J
            </div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>
              JetUP
            </span>
          </button>

          <div style={{
            color: activeFlow ? activeFlow.color : "rgba(255,255,255,0.2)",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
            display: "flex", alignItems: "center", gap: 6,
            transition: "color 0.3s ease",
          }}>
            {activeFlow ? (
              <>
                <span>{activeFlow.icon}</span>
                <span>{activeFlow.label} Path</span>
              </>
            ) : (
              <span style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 11 }}>
                Interactive Demo
              </span>
            )}
          </div>
        </div>

        {/* Scrollable main content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          paddingTop: 64,
          paddingBottom: 32,
          position: "relative",
          zIndex: 10,
        }}>
          <div style={{
            maxWidth: 480,
            margin: "0 auto",
            padding: "32px 20px 24px",
            minHeight: "calc(100dvh - 64px)",
            display: "flex",
            flexDirection: "column",
          }}>
            <AnimatePresence mode="wait">
              {(stage === "concierge" || stage === "choice") && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.38 }}
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <HeroScene
                    steps={CONCIERGE_STEPS}
                    flows={FLOWS}
                    onSelectFlow={startFlow}
                    onConciergeDone={showChoices}
                    showChoices={stage === "choice"}
                  />
                </motion.div>
              )}

              {stage === "flow" && activeFlow && (
                <motion.div
                  key="flow"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <SceneShell
                    flow={activeFlow}
                    sceneIndex={sceneIndex}
                    onBack={goBack}
                    onHome={goHome}
                    onNext={goNext}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
