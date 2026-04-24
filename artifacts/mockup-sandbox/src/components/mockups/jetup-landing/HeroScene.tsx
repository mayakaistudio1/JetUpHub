import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ConversationStep, Flow } from "@/types/jetup";
import { AIConcierge } from "./AIConcierge";
import { ChoiceCards } from "./ChoiceCards";

const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";

type HeroSceneProps = {
  steps: ConversationStep[];
  flows: Flow[];
  onSelectFlow: (flow: Flow) => void;
  onConciergeDone: () => void;
  showChoices: boolean;
};

export function HeroScene({ steps, flows, onSelectFlow, onConciergeDone, showChoices }: HeroSceneProps) {
  return (
    <div data-testid="hero-scene" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      {/* Hero headline */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 36, paddingTop: 8 }}
      >
        <div style={{
          display: "inline-block",
          background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT2}14)`,
          border: `1px solid ${ACCENT}30`,
          borderRadius: 100,
          padding: "5px 14px",
          marginBottom: 20,
        }}>
          <span style={{ color: ACCENT2, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>
            ✦ INTERACTIVE EXPERIENCE
          </span>
        </div>
        <h1
          data-testid="hero-headline"
          style={{
            color: "#fff",
            fontSize: "clamp(1.85rem, 6vw, 2.5rem)",
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 14,
          }}
        >
          This is not just another opportunity.{" "}
          <span style={{
            backgroundImage: `linear-gradient(135deg, ${ACCENT2}, #C084FC, ${ACCENT})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            This is a system.
          </span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, lineHeight: 1.6 }}>
          Trading infrastructure. Partner business. AI layer.
        </p>
      </motion.div>

      {/* AI Concierge */}
      <div style={{ marginBottom: 28 }}>
        <AIConcierge steps={steps} onAllDone={onConciergeDone} />
      </div>

      {/* Choice Cards — appear after concierge finishes */}
      <AnimatePresence>
        {showChoices && (
          <ChoiceCards flows={flows} onSelect={onSelectFlow} />
        )}
      </AnimatePresence>
    </div>
  );
}
