import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { ConversationStep } from "@/types/jetup";

const ACCENT2 = "#A855F7";
const ACCENT = "#7C3AED";

function AvatarDot() {
  return (
    <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${ACCENT2}, ${ACCENT})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, boxShadow: `0 0 20px ${ACCENT2}60`,
      }}>
        ✦
      </div>
      <div style={{
        position: "absolute", bottom: 1, right: 1,
        width: 10, height: 10, borderRadius: "50%",
        background: "#22C55E", border: "2px solid #0c0b1a",
      }} />
    </div>
  );
}

function TypingBubble({
  text,
  onDone,
  startDelay = 0,
}: {
  text: string;
  onDone?: () => void;
  startDelay?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (onDoneRef.current) setTimeout(onDoneRef.current, 350);
      }
    }, 26);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      data-testid="concierge-bubble"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "18px 18px 18px 4px",
        padding: "13px 17px",
        maxWidth: 320,
        backdropFilter: "blur(12px)",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, lineHeight: 1.55, fontWeight: 400 }}>
        {displayed}
        {displayed.length < text.length && started && (
          <span style={{ opacity: 0.5, animation: "blink 0.8s step-end infinite" }}>▋</span>
        )}
      </span>
    </motion.div>
  );
}

type AIConciergeProps = {
  steps: ConversationStep[];
  onAllDone: () => void;
};

export function AIConcierge({ steps, onAllDone }: AIConciergeProps) {
  const [visibleCount, setVisibleCount] = useState(1);

  const handleBubbleDone = (index: number) => {
    if (index < steps.length - 1) {
      setVisibleCount(index + 2);
    } else {
      onAllDone();
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <AvatarDot />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {steps.slice(0, visibleCount).map((step, i) => (
          <TypingBubble
            key={step.id}
            text={step.text}
            startDelay={i === 0 ? step.delay : 0}
            onDone={i === visibleCount - 1 ? () => handleBubbleDone(i) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
