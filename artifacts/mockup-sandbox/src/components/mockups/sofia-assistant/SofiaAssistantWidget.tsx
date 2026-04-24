import { useEffect, useState } from "react";

const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";
const PANEL_BG = "rgba(17, 14, 32, 0.92)";
const PANEL_BORDER = "1px solid rgba(255,255,255,0.08)";

type SofiaState = "idle" | "listening" | "thinking" | "speaking";

const STATUS_COPY: Record<SofiaState, string> = {
  idle: "Your guide to markets, brokers, and first steps",
  listening: "Listening…",
  thinking: "Analyzing your request",
  speaking: "Responding",
};

const SUGGESTIONS = [
  "Show me Explore",
  "What is JetUP?",
  "How do I become a partner?",
  "Take me to events",
];

function SofiaDot({ size = 32, state }: { size?: number; state: SofiaState }) {
  const ring =
    state === "listening"
      ? `0 0 0 4px rgba(168,85,247,0.18), 0 0 24px ${ACCENT2}80`
      : state === "speaking"
        ? `0 0 0 6px rgba(168,85,247,0.10), 0 0 28px ${ACCENT2}aa`
        : state === "thinking"
          ? `0 0 0 3px rgba(168,85,247,0.14), 0 0 18px ${ACCENT2}60`
          : `0 0 14px ${ACCENT2}50`;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 35%, ${ACCENT2}, ${ACCENT})`,
          boxShadow: ring,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: size * 0.45,
          transition: "box-shadow 0.4s",
        }}
      >
        ✦
      </div>
      {state === "listening" && (
        <span
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "50%",
            border: `1px solid ${ACCENT2}80`,
            animation: "sofiaPulse 1.6s ease-out infinite",
          }}
        />
      )}
    </div>
  );
}

function Waveform({
  state,
  bars = 28,
  height = 28,
}: {
  state: SofiaState;
  bars?: number;
  height?: number;
}) {
  const active = state === "listening" || state === "speaking";
  const tick = useTick(active ? 90 : 0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        height,
      }}
      data-testid={`waveform-${state}`}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const base = 0.25 + (seed / 233280) * 0.55;
        const wob = active
          ? 0.35 + Math.abs(Math.sin((tick + i * 7) / 6)) * 0.65
          : 0.25;
        const h = Math.max(3, height * base * wob);
        const opacity = active ? 0.95 : 0.35;
        return (
          <span
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background:
                state === "speaking"
                  ? `linear-gradient(180deg, ${ACCENT2}, ${ACCENT})`
                  : `linear-gradient(180deg, ${ACCENT2}cc, #6366F1)`,
              opacity,
              transition: "height 80ms linear",
            }}
          />
        );
      })}
    </div>
  );
}

function useTick(intervalMs: number): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!intervalMs) return;
    const id = setInterval(() => setT((x) => x + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return t;
}

function Header({ state }: { state: SofiaState }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <SofiaDot size={28} state={state} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span
          style={{
            color: "white",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0.2,
          }}
          data-testid={`text-sofia-title-${state}`}
        >
          Sofia AI
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 11.5,
            fontWeight: 400,
          }}
          data-testid={`status-${state}`}
        >
          {STATUS_COPY[state]}
        </span>
      </div>
      <div style={{ flex: 1 }} />
      <button
        aria-label="Minimize"
        data-testid={`button-minimize-${state}`}
        style={iconBtn}
      >
        –
      </button>
      <button
        aria-label="Close"
        data-testid={`button-close-${state}`}
        style={iconBtn}
      >
        ×
      </button>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "rgba(255,255,255,0.7)",
  fontSize: 14,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

function SuggestionChips({ state }: { state: SofiaState }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "10px 14px 4px",
      }}
    >
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          data-testid={`chip-${s}`}
          style={{
            fontSize: 11.5,
            color: "rgba(255,255,255,0.85)",
            background: "rgba(168,85,247,0.10)",
            border: "1px solid rgba(168,85,247,0.28)",
            borderRadius: 999,
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
          color: "white",
          fontSize: 13,
          lineHeight: 1.5,
          padding: "9px 13px",
          borderRadius: "16px 16px 4px 16px",
          maxWidth: "78%",
          boxShadow: `0 2px 12px ${ACCENT}40`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function PartialVoiceBubble({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
      <div
        style={{
          background: "rgba(168,85,247,0.18)",
          color: "rgba(255,255,255,0.85)",
          fontSize: 13,
          fontStyle: "italic",
          lineHeight: 1.5,
          padding: "9px 13px",
          borderRadius: "16px 16px 4px 16px",
          maxWidth: "78%",
          border: `1px dashed ${ACCENT2}80`,
        }}
        data-testid="bubble-partial-voice"
      >
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#EF4444",
            marginRight: 6,
            verticalAlign: "middle",
            animation: "sofiaPulseDot 1s ease-in-out infinite",
          }}
        />
        {text}
        <span style={{ opacity: 0.5 }}>▋</span>
      </div>
    </div>
  );
}

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
      <SofiaDot size={22} state="idle" />
      <div
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.92)",
          fontSize: 13,
          lineHeight: 1.55,
          padding: "9px 13px",
          borderRadius: "16px 16px 16px 4px",
          maxWidth: "82%",
          backdropFilter: "blur(8px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ActionCard() {
  return (
    <div
      style={{
        marginLeft: 30,
        marginTop: 6,
        background:
          "linear-gradient(180deg, rgba(124,58,237,0.18), rgba(124,58,237,0.06))",
        border: `1px solid ${ACCENT2}50`,
        borderRadius: 12,
        padding: 12,
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
      data-testid="card-action-explore"
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${ACCENT2}, ${ACCENT})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        🌍
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 2,
          }}
        >
          Open Explore
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 11.5,
            lineHeight: 1.4,
          }}
        >
          Browse curated venues & events near you
        </div>
      </div>
      <button
        data-testid="button-card-go"
        style={{
          background: "white",
          color: "#0c0b1a",
          border: "none",
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Go →
      </button>
    </div>
  );
}

function ConversationThread({ state }: { state: SofiaState }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "10px 14px",
        maxHeight: 230,
        overflow: "hidden",
      }}
    >
      <UserBubble>What can you help me with?</UserBubble>
      <AssistantBubble>
        I can guide you through JetUP — Explore, events, partner program, or
        anything else. Want a quick tour?
      </AssistantBubble>
      <PartialVoiceBubble text="show me what's happening tonight in" />
      {state === "speaking" || state === "thinking" || state === "idle" ? (
        <>
          <AssistantBubble>
            Got it — here's what's live tonight in your area.
          </AssistantBubble>
          <ActionCard />
        </>
      ) : null}
    </div>
  );
}

function VoiceStatusStrip({ state }: { state: SofiaState }) {
  const label =
    state === "listening"
      ? "Listening · 0:04"
      : state === "thinking"
        ? "Thinking…"
        : state === "speaking"
          ? "Speaking · 0:02"
          : "Tap mic to talk";
  const dotColor =
    state === "listening"
      ? "#EF4444"
      : state === "speaking"
        ? "#22C55E"
        : state === "thinking"
          ? "#F59E0B"
          : "rgba(255,255,255,0.3)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        background: "rgba(255,255,255,0.025)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: dotColor,
          boxShadow:
            state !== "idle" ? `0 0 8px ${dotColor}` : "none",
          animation:
            state === "listening" || state === "speaking"
              ? "sofiaPulseDot 1s ease-in-out infinite"
              : "none",
        }}
      />
      <span
        style={{
          fontSize: 11.5,
          color: "rgba(255,255,255,0.7)",
          minWidth: 96,
        }}
        data-testid={`label-voice-${state}`}
      >
        {label}
      </span>
      <div style={{ flex: 1 }}>
        <Waveform state={state} bars={32} height={24} />
      </div>
    </div>
  );
}

function ComposerBar({ state }: { state: SofiaState }) {
  const micActive = state === "listening";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px 12px",
      }}
    >
      <div
        style={{
          flex: 1,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
          padding: "8px 14px",
          fontSize: 13,
          color: "rgba(255,255,255,0.4)",
        }}
        data-testid={`input-composer-${state}`}
      >
        Ask Sofia anything…
      </div>
      <button
        aria-label="Mic"
        data-testid={`button-mic-${state}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: micActive
            ? `linear-gradient(135deg, #EF4444, #DC2626)`
            : "rgba(255,255,255,0.06)",
          color: "white",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: micActive ? "0 0 16px #EF444480" : "none",
        }}
      >
        🎙
      </button>
      <button
        aria-label="Send"
        data-testid={`button-send-${state}`}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: `linear-gradient(135deg, ${ACCENT2}, ${ACCENT})`,
          color: "white",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 14px ${ACCENT}60`,
        }}
      >
        ➤
      </button>
    </div>
  );
}

function AssistantShell({ state }: { state: SofiaState }) {
  return (
    <div
      style={{
        width: 380,
        background: PANEL_BG,
        border: PANEL_BORDER,
        borderRadius: 20,
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(168,85,247,0.06)",
        overflow: "hidden",
        backdropFilter: "blur(18px)",
        display: "flex",
        flexDirection: "column",
      }}
      data-testid={`shell-sofia-${state}`}
    >
      <Header state={state} />
      <SuggestionChips state={state} />
      <ConversationThread state={state} />
      <VoiceStatusStrip state={state} />
      <ComposerBar state={state} />
    </div>
  );
}

function CollapsedVoiceDock({
  state,
  label,
}: {
  state: SofiaState;
  label?: string;
}) {
  const stateLabel =
    label ??
    (state === "listening"
      ? "Listening"
      : state === "speaking"
        ? "Speaking"
        : state === "thinking"
          ? "Thinking"
          : "Sofia");
  const transcript =
    state === "listening"
      ? "show me what's happening tonight…"
      : state === "speaking"
        ? "Got it — here's what's live tonight…"
        : state === "thinking"
          ? "One moment…"
          : "Tap to talk to Sofia";
  return (
    <div
      style={{
        width: 520,
        height: 64,
        background: PANEL_BG,
        border: PANEL_BORDER,
        borderRadius: 999,
        padding: "0 14px 0 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
        backdropFilter: "blur(18px)",
      }}
      data-testid={`dock-collapsed-${state}`}
    >
      <SofiaDot size={36} state={state} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: 80,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {stateLabel}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10.5,
          }}
        >
          Sofia AI
        </span>
      </div>
      <div style={{ width: 90 }}>
        <Waveform state={state} bars={14} height={20} />
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
          fontStyle: "italic",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        “{transcript}”
      </div>
      <DockButton label="Mute" icon="🔇" />
      <DockButton label="Stop" icon="⏹" tone="danger" />
      <DockButton label="Expand" icon="⤢" tone="accent" />
    </div>
  );
}

function DockButton({
  label,
  icon,
  tone,
}: {
  label: string;
  icon: string;
  tone?: "danger" | "accent";
}) {
  const bg =
    tone === "danger"
      ? "rgba(239,68,68,0.15)"
      : tone === "accent"
        ? `linear-gradient(135deg, ${ACCENT2}, ${ACCENT})`
        : "rgba(255,255,255,0.06)";
  const color = tone === "accent" ? "white" : "rgba(255,255,255,0.85)";
  const border =
    tone === "accent"
      ? "none"
      : tone === "danger"
        ? "1px solid rgba(239,68,68,0.4)"
        : "1px solid rgba(255,255,255,0.08)";
  return (
    <button
      aria-label={label}
      data-testid={`dock-btn-${label.toLowerCase()}`}
      style={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        background: bg,
        color,
        border,
        cursor: "pointer",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </button>
  );
}

function StateFrame({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 12,
            marginTop: 2,
          }}
        >
          {caption}
        </div>
      </div>
      <div
        style={{
          padding: 24,
          background:
            "radial-gradient(circle at 30% 0%, rgba(124,58,237,0.18), transparent 60%), #0a0814",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SofiaAssistantWidget() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 0%, #1a0f3a 0%, #07060f 60%), #07060f",
        padding: "48px 40px 80px",
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "white",
      }}
      data-testid="page-sofia-widget"
    >
      <style>{`
        @keyframes sofiaPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes sofiaPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>

      <header style={{ maxWidth: 1320, margin: "0 auto 32px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(168,85,247,0.10)",
            border: `1px solid ${ACCENT2}40`,
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 11,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          <SofiaDot size={14} state="idle" />
          Sofia · Multimodal Spec
        </div>
        <h1
          style={{
            fontSize: 34,
            fontWeight: 700,
            margin: 0,
            letterSpacing: -0.6,
          }}
        >
          Sofia Assistant Widget
        </h1>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 15,
            marginTop: 8,
            maxWidth: 720,
            lineHeight: 1.55,
          }}
        >
          One panel that unifies voice and text. Below: the full assistant
          shell, the collapsed voice dock, and side-by-side state frames for
          visual review.
        </p>
      </header>

      <section
        style={{
          maxWidth: 1320,
          margin: "0 auto 48px",
          display: "grid",
          gridTemplateColumns: "minmax(420px, 460px) 1fr",
          gap: 32,
          alignItems: "start",
        }}
      >
        <StateFrame
          title="Full assistant shell"
          caption="Header · Suggestions · Thread · Voice strip · Composer"
        >
          <AssistantShell state="speaking" />
        </StateFrame>
        <StateFrame
          title="Collapsed voice dock — desktop"
          caption="Sofia dot · State · Mini wave · Transcript · Mute / Stop / Expand"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              alignItems: "center",
            }}
          >
            <CollapsedVoiceDock state="listening" />
            <CollapsedVoiceDock state="speaking" />
            <CollapsedVoiceDock state="idle" label="Sofia · Idle" />
          </div>
        </StateFrame>
      </section>

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto 20px",
          color: "rgba(255,255,255,0.85)",
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        State frames
      </div>

      <section
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
          gap: 24,
        }}
      >
        <StateFrame
          title="Idle"
          caption="“Your guide to markets, brokers, and first steps” — composer ready, mic dim"
        >
          <AssistantShell state="idle" />
        </StateFrame>
        <StateFrame
          title="Listening"
          caption="“Listening…” — mic active, partial voice bubble live"
        >
          <AssistantShell state="listening" />
        </StateFrame>
        <StateFrame
          title="Thinking"
          caption="“Analyzing your request” — strip pulses amber, reply pending"
        >
          <AssistantShell state="thinking" />
        </StateFrame>
        <StateFrame
          title="Speaking"
          caption="“Responding” — assistant reply + inline action card"
        >
          <AssistantShell state="speaking" />
        </StateFrame>
        <StateFrame
          title="Collapsed · Listening"
          caption="Dock variant during voice capture"
        >
          <div
            style={{
              alignSelf: "center",
              display: "flex",
              alignItems: "center",
              minHeight: 380,
            }}
          >
            <CollapsedVoiceDock state="listening" />
          </div>
        </StateFrame>
      </section>
    </div>
  );
}
