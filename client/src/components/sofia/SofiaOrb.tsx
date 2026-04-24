import React from "react";
import { motion } from "framer-motion";

interface OrbProps {
  size?: number;
  color?: string;
  colorAlt?: string;
  /** Legacy: subtle rotating glow. */
  active?: boolean;
  /** When true, render concentric ripples + extra glow (Sofia speaking). */
  speaking?: boolean;
  /** Render dimmed (e.g. muted state). */
  dimmed?: boolean;
}

const ACCENT = "#A855F7";

/**
 * Animated gradient avatar disc. The only round element in the Sofia panel
 * (everything else is sharp per spec). Renders three concentric ripples
 * outward when `speaking` is true.
 */
export default function SofiaOrb({
  size = 36,
  color = "#7C3AED",
  colorAlt = "#A855F7",
  active = false,
  speaking = false,
  dimmed = false,
}: OrbProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
        opacity: dimmed ? 0.45 : 1,
        transition: "opacity 0.2s ease",
      }}
      aria-hidden
    >
      <style>{`
        @keyframes sofia-orb-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sofia-orb-breathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.05); opacity: 1; }
        }
      `}</style>

      {/* Concentric ripples — only when Sofia is speaking. */}
      {speaking &&
        [0, 0.4, 0.8].map((delay) => (
          <motion.div
            key={delay}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${ACCENT}`,
              pointerEvents: "none",
            }}
          />
        ))}

      {/* Outer rotating ring (kept for `active` legacy callers). */}
      {active && !speaking && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `conic-gradient(from 0deg, ${color}, ${colorAlt}, ${color}, ${colorAlt}, ${color})`,
            animation: "sofia-orb-spin 6s linear infinite",
            maskImage: "radial-gradient(circle at center, black 35%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at center, black 35%, transparent 72%)",
          }}
        />
      )}

      {/* Main orb — idle state breathes slowly; speaking state gets glow. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${colorAlt}, ${color} 70%, #1a1230 100%)`,
          boxShadow: speaking
            ? `0 0 60px rgba(168, 85, 247, 0.5), inset 0 0 ${size * 0.35}px ${color}aa`
            : `inset 0 0 ${size * 0.35}px ${color}aa`,
          animation: !speaking && !active ? "sofia-orb-breathe 2.4s ease-in-out infinite" : undefined,
        }}
      />
    </div>
  );
}
