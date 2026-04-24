import { useState } from "react";
import { motion } from "framer-motion";
import type { Flow } from "@/types/jetup";

type ChoiceCardProps = {
  flow: Flow;
  onClick: () => void;
};

function ChoiceCard({ flow, onClick }: ChoiceCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      data-testid={`choice-card-${flow.key}`}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered
          ? `linear-gradient(135deg, ${flow.color}18, ${flow.color}08)`
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${hovered ? flow.color + "50" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 16,
        padding: "15px 18px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.25s ease",
        backdropFilter: "blur(8px)",
        boxShadow: hovered ? `0 0 24px ${flow.color}22` : "none",
        width: "100%",
        fontFamily: "inherit",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${flow.color}15`,
        border: `1px solid ${flow.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, transition: "transform 0.25s ease",
        transform: hovered ? "scale(1.1) rotate(-3deg)" : "scale(1)",
      }}>
        {flow.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{flow.label}</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.4 }}>{flow.tagline}</div>
      </div>
      <div style={{ color: flow.color, opacity: hovered ? 1 : 0.4, fontSize: 18, transition: "all 0.2s ease" }}>
        →
      </div>
    </motion.button>
  );
}

type ChoiceCardsProps = {
  flows: Flow[];
  onSelect: (flow: Flow) => void;
};

export function ChoiceCards({ flows, onSelect }: ChoiceCardsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div style={{
        color: "rgba(255,255,255,0.3)", fontSize: 11,
        fontWeight: 700, letterSpacing: "0.12em",
        textTransform: "uppercase", marginBottom: 12,
      }}>
        Choose your path
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {flows.map((flow, i) => (
          <motion.div
            key={flow.key}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChoiceCard flow={flow} onClick={() => onSelect(flow)} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
