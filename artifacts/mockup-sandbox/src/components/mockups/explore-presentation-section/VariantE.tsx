import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Pause, Play, Maximize2, X, Sparkles } from "lucide-react";

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onR = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return m;
}

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const C = {
  BG: "#0A0A14",
  SURFACE: "#11111C",
  BORDER: "rgba(255,255,255,0.08)",
  BORDER_STRONG: "rgba(255,255,255,0.14)",
  TEXT: "#F5F5FA",
  TEXT_SEC: "rgba(245,245,250,0.7)",
  TEXT_MUTED: "rgba(245,245,250,0.4)",
};

const CHAPTERS = [
  { n: "01", title: "Warum JetUP?", question: "Sofia, warum JetUP?", answer: "Weil JetUP ein durchdachtes System ist — kein Versprechen, sondern Infrastruktur." },
  { n: "02", title: "Das Produkt", question: "Was bekomme ich konkret?", answer: "Eine Plattform, eine App und einen KI‑Assistenten, der dich rund um die Uhr begleitet." },
  { n: "03", title: "Das Partnermodell", question: "Wie funktioniert die Provision?", answer: "Lot‑Provision, Infinity Bonus und Global Pools — bis zu zehn Ebenen tief, transparent." },
  { n: "04", title: "KI‑Infrastruktur", question: "Was kannst du, Sofia?", answer: "Ich beantworte Fragen, führe durch Onboarding und erkläre Strategien — in Echtzeit." },
  { n: "05", title: "Dein Einstieg", question: "Wie starte ich?", answer: "Fünf Schritte: Account, Verifizierung, Strategie‑Auswahl, Aktivierung — und dann begleiten wir dich." },
  { n: "06–10", title: "Deep Dive", question: "Wo finde ich Details?", answer: "Strategien, Zahlen, Roadmap — alles in den weiterführenden Kapiteln." },
];

function SofiaAvatar({ speaking, paused }: { speaking: boolean; paused: boolean }) {
  return (
    <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      {/* Outer pulse */}
      <AnimatePresence>
        {speaking && !paused && (
          <>
            <motion.div
              key="r1"
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1.45, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid ${ACCENT_LIGHT}` }}
            />
            <motion.div
              key="r2"
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1.7, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${ACCENT}` }}
            />
          </>
        )}
      </AnimatePresence>
      <div
        style={{
          position: "absolute", inset: 6, borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${ACCENT_LIGHT}, ${ACCENT} 65%, #1E1B4B)`,
          boxShadow: `0 0 50px ${ACCENT}66, inset 0 4px 30px rgba(255,255,255,0.18)`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Sparkles size={36} color="#fff" strokeWidth={1.5} />
      </div>
    </div>
  );
}

function VoiceWave({ speaking, paused }: { speaking: boolean; paused: boolean }) {
  const bars = Array.from({ length: 28 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, height: 56 }}>
      {bars.map((_, i) => (
        <motion.span
          key={i}
          animate={
            speaking && !paused
              ? { height: [8, 8 + Math.abs(Math.sin(i * 0.6)) * 40 + Math.random() * 12, 8] }
              : { height: 8 }
          }
          transition={{ duration: 0.7 + (i % 5) * 0.08, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
          style={{
            display: "inline-block", width: 3, borderRadius: 2,
            background: `linear-gradient(180deg, ${ACCENT_LIGHT}, ${ACCENT})`,
            opacity: speaking && !paused ? 0.9 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

function PlayerStage({ active, speaking, paused, mob }: { active: number; speaking: boolean; paused: boolean; mob?: boolean }) {
  const c = CHAPTERS[active];
  return (
    <div
      style={{
        position: "relative", width: "100%", aspectRatio: mob ? "4/5" : "16/8",
        borderRadius: 20, overflow: "hidden",
        background: `radial-gradient(120% 80% at 30% 20%, ${ACCENT}33 0%, #0B0B16 55%, #050510 100%)`,
        border: `1px solid ${C.BORDER_STRONG}`,
        boxShadow: `0 30px 80px rgba(0,0,0,.45), 0 0 0 1px ${ACCENT}10`,
      }}
      data-testid="player-stage"
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: mob ? "column" : "row", alignItems: "center", justifyContent: "center", padding: mob ? 22 : 36, gap: mob ? 18 : 36 }}>
        <SofiaAvatar speaking={speaking} paused={paused} />
        <div style={{ flex: 1, minWidth: 0, textAlign: mob ? "center" : "left" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.3em", marginBottom: 10 }}>
                KAPITEL {c.n}
              </div>
              <div style={{ fontSize: mob ? "clamp(20px, 5.5vw, 26px)" : "clamp(22px, 2.6vw, 34px)", fontWeight: 300, letterSpacing: "-0.02em", color: C.TEXT, marginBottom: 14, lineHeight: 1.2 }}>
                {c.title}
              </div>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: mob ? "center" : "flex-start" }}>
                <VoiceWave speaking={speaking} paused={paused} />
              </div>
              <div style={{ fontSize: mob ? 13 : 14, color: C.TEXT_SEC, lineHeight: 1.6, fontWeight: 300, maxWidth: 560 }}>
                <span style={{ color: ACCENT_LIGHT, fontWeight: 600 }}>Sofia:</span> {c.answer}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Status pill */}
      <div style={{ position: "absolute", left: 16, top: 16, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: `1px solid ${C.BORDER}` }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: speaking && !paused ? ACCENT_LIGHT : "#64748b", boxShadow: speaking && !paused ? `0 0 8px ${ACCENT_LIGHT}` : "none" }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: C.TEXT_SEC, letterSpacing: "0.15em" }}>
          {paused ? "PAUSIERT" : speaking ? "SOFIA ANTWORTET" : "BEREIT"}
        </span>
      </div>
    </div>
  );
}

export function VariantE({ forceMobile }: { forceMobile?: boolean } = {}) {
  const detected = useIsMobile();
  const mob = forceMobile ?? detected;
  const [active, setActive] = useState(0);
  const [speaking, setSpeaking] = useState(true);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timer = useRef<number | null>(null);

  // Simulate speaking duration before going idle
  useEffect(() => {
    if (paused) return;
    setSpeaking(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSpeaking(false), 4200);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [active, paused]);

  return (
    <div style={{ background: C.BG, color: C.TEXT, fontFamily: "'Montserrat', system-ui, sans-serif", minHeight: "100vh" }}>
      <section
        style={{ padding: mob ? "60px 20px" : "100px 56px", borderTop: `1px solid ${C.BORDER}` }}
        data-testid="section-presentation-variant-e"
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Heading + status */}
          <div style={{ display: "flex", alignItems: mob ? "flex-start" : "flex-end", justifyContent: "space-between", gap: mob ? 16 : 24, marginBottom: mob ? 22 : 30, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                Präsentation mit Sofia
              </div>
              <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 34px)" : "clamp(32px, 3vw, 44px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 14 }}>
                Interaktive Präsentation
              </h2>
              <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
                Frag Sofia. Sie führt dich durch das System — in deinem Tempo.
              </p>
            </div>

            {/* Right-side mini status & controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setMuted((m) => !m)}
                title={muted ? "Stumm aus" : "Stumm an"}
                style={ctrlBtn(false)}
                data-testid="btn-mute"
              >
                {muted ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <button
                onClick={() => setPaused((p) => !p)}
                style={ctrlBtn(false)}
                data-testid="btn-pause"
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                onClick={() => {
                  setActive((i) => i); setSpeaking(true); setPaused(false);
                }}
                style={{ ...ctrlBtn(false), width: "auto", padding: mob ? "0 10px" : "0 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}
                data-testid="btn-interrupt"
                title="Per Stimme unterbrechen"
              >
                <Mic size={13} /> {mob ? "" : "Per Stimme unterbrechen"}
              </button>
              <button
                onClick={() => setFullscreen(true)}
                style={{ ...ctrlBtn(false), width: "auto", padding: mob ? "0 10px" : "0 14px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 8 }}
                data-testid="btn-fullscreen"
                title="Vollbild"
              >
                <Maximize2 size={13} /> {mob ? "" : "Vollbild"}
              </button>
            </div>
          </div>

          {/* Player */}
          <PlayerStage active={active} speaking={speaking} paused={paused} mob={mob} />

          {/* Chapter chips */}
          <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", gap: 10 }} data-testid="chapter-chips">
            {CHAPTERS.map((c, i) => {
              const isActive = i === active;
              return (
                <button
                  key={c.n}
                  onClick={() => { setActive(i); setSpeaking(true); setPaused(false); }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
                    padding: "12px 18px", borderRadius: 16,
                    background: isActive
                      ? `linear-gradient(135deg, ${ACCENT}30, ${ACCENT_LIGHT}12)`
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isActive ? `${ACCENT}80` : C.BORDER}`,
                    color: C.TEXT, fontFamily: "inherit", cursor: "pointer",
                    transition: "all .25s ease", textAlign: "left",
                    minWidth: 168, flex: "1 1 168px",
                  }}
                  data-testid={`chip-${i}`}
                >
                  <span style={{ fontSize: 10, fontWeight: 700, color: isActive ? ACCENT_LIGHT : C.TEXT_MUTED, letterSpacing: "0.18em" }}>
                    KAPITEL {c.n}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{c.question}</span>
                </button>
              );
            })}
          </div>

          {/* Indicator strip */}
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: C.TEXT_MUTED, letterSpacing: "0.05em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: speaking && !paused ? ACCENT_LIGHT : "#475569" }} />
            <span>{paused ? "Pausiert — Sofia wartet auf dich." : speaking ? "Sofia antwortet auf deine Frage…" : "Wähle ein Kapitel oder sprich Sofia direkt an."}</span>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,12,0.96)",
              backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", padding: 28,
            }}
            data-testid="fullscreen-overlay"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.3em" }}>SOFIA • VOLLBILD</div>
              <button onClick={() => setFullscreen(false)} style={{ ...ctrlBtn(false), width: 36, height: 36 }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
              <div style={{ width: "100%", maxWidth: 1280 }}>
                <PlayerStage active={active} speaking={speaking} paused={paused} mob={mob} />
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {CHAPTERS.map((c, i) => (
                    <button
                      key={c.n}
                      onClick={() => { setActive(i); setSpeaking(true); setPaused(false); }}
                      style={{
                        padding: "8px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600,
                        background: i === active ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` : "rgba(255,255,255,0.06)",
                        color: i === active ? "#fff" : C.TEXT,
                        border: `1px solid ${i === active ? "transparent" : C.BORDER_STRONG}`,
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      {c.n} · {c.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ctrlBtn(disabled: boolean): React.CSSProperties {
  return {
    width: 36, height: 36, borderRadius: 10,
    border: `1px solid ${C.BORDER_STRONG}`,
    background: "rgba(255,255,255,0.04)",
    color: C.TEXT,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .2s ease", fontFamily: "inherit",
  };
}

export default VariantE;
