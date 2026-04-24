import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Play, Pause, X } from "lucide-react";

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
  { n: "01", title: "Warum JetUP?", desc: "Vision & Mission" },
  { n: "02", title: "Das Produkt", desc: "Plattform & Features" },
  { n: "03", title: "Das Partnermodell", desc: "Provisionen & Boni" },
  { n: "04", title: "KI‑Infrastruktur", desc: "Sofia & Automatisierung" },
  { n: "05", title: "Dein Einstieg", desc: "Onboarding in 5 Schritten" },
  { n: "06–10", title: "Deep Dive", desc: "Strategie, Zahlen, Roadmap" },
];

function PlayerStage({ chapter, fullscreen }: { chapter: typeof CHAPTERS[number]; fullscreen?: boolean }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: fullscreen ? undefined : "16 / 9",
        height: fullscreen ? "100%" : undefined,
        background: `radial-gradient(120% 80% at 50% 20%, ${ACCENT}22 0%, #0B0B16 55%, #060610 100%)`,
        borderRadius: fullscreen ? 0 : 16,
        overflow: "hidden",
        border: fullscreen ? "none" : `1px solid ${C.BORDER_STRONG}`,
      }}
      data-testid="player-stage"
    >
      {/* Decorative grid */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.n}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.45 }}
          style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 32, textAlign: "center" }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.3em", marginBottom: 14 }}>
            KAPITEL {chapter.n}
          </div>
          <div style={{ fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 300, color: C.TEXT, letterSpacing: "-0.02em", marginBottom: 12 }}>
            {chapter.title}
          </div>
          <div style={{ fontSize: 14, color: C.TEXT_SEC, fontWeight: 300, maxWidth: 420 }}>
            {chapter.desc}
          </div>
        </motion.div>
      </AnimatePresence>
      {/* Play badge */}
      <div style={{ position: "absolute", left: 16, top: 16, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", border: `1px solid ${C.BORDER}` }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: C.TEXT_SEC, letterSpacing: "0.15em" }}>VORSCHAU</span>
      </div>
    </div>
  );
}

function TransportControls({
  index, total, playing, onPrev, onNext, onTogglePlay, onFullscreen, fullscreen,
}: {
  index: number; total: number; playing: boolean;
  onPrev: () => void; onNext: () => void; onTogglePlay: () => void;
  onFullscreen: () => void; fullscreen?: boolean;
}) {
  const progress = ((index + 1) / total) * 100;
  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ position: "relative", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ position: "absolute", inset: 0, right: "auto", background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})` }}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={onPrev}
            disabled={index === 0}
            style={ctrlBtn(index === 0)}
            data-testid="btn-prev"
            aria-label="Vorheriges Kapitel"
          >
            <ChevronLeft size={16} />
          </button>
          <button onClick={onTogglePlay} style={ctrlBtn(false, true)} data-testid="btn-play">
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            onClick={onNext}
            disabled={index === total - 1}
            style={ctrlBtn(index === total - 1)}
            data-testid="btn-next"
            aria-label="Nächstes Kapitel"
          >
            <ChevronRight size={16} />
          </button>
          <span style={{ marginLeft: 10, fontSize: 11, color: C.TEXT_MUTED, letterSpacing: "0.15em" }}>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <button
          onClick={onFullscreen}
          style={{ ...ctrlBtn(false), display: "flex", alignItems: "center", gap: 6, padding: "0 12px", width: "auto", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em" }}
          data-testid="btn-fullscreen"
        >
          {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          {fullscreen ? "VERKLEINERN" : "VOLLBILD"}
        </button>
      </div>
    </div>
  );
}

function ctrlBtn(disabled: boolean, primary = false): React.CSSProperties {
  return {
    width: 32, height: 32, borderRadius: 8,
    border: `1px solid ${primary ? `${ACCENT}55` : C.BORDER_STRONG}`,
    background: primary ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` : "rgba(255,255,255,0.04)",
    color: primary ? "#fff" : C.TEXT,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .2s ease",
    fontFamily: "inherit",
  };
}

function FullscreenOverlay({ onClose, index, setIndex, playing, setPlaying }: {
  onClose: () => void; index: number; setIndex: (i: number) => void;
  playing: boolean; setPlaying: (p: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,12,0.96)",
        backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", padding: 24,
      }}
      data-testid="fullscreen-overlay"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.3em" }}>PRÄSENTATION • VOLLBILD</div>
        <button onClick={onClose} style={{ ...ctrlBtn(false), width: 36, height: 36 }} aria-label="Schließen">
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PlayerStage chapter={CHAPTERS[index]} fullscreen />
      </div>
      <div style={{ marginTop: 12 }}>
        <TransportControls
          index={index} total={CHAPTERS.length} playing={playing}
          onPrev={() => setIndex(Math.max(0, index - 1))}
          onNext={() => setIndex(Math.min(CHAPTERS.length - 1, index + 1))}
          onTogglePlay={() => setPlaying(!playing)}
          onFullscreen={onClose}
          fullscreen
        />
      </div>
    </motion.div>
  );
}

export function VariantB({ forceMobile }: { forceMobile?: boolean } = {}) {
  const detected = useIsMobile();
  const mob = forceMobile ?? detected;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => {
      setActive((i) => (i + 1) % CHAPTERS.length);
    }, 4500);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [playing]);

  return (
    <div style={{ background: C.BG, color: C.TEXT, fontFamily: "'Montserrat', system-ui, sans-serif", minHeight: "100vh" }}>
      <section
        style={{ padding: mob ? "60px 20px" : "100px 56px", borderTop: `1px solid ${C.BORDER}` }}
        data-testid="section-presentation-variant-b"
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          {/* Heading */}
          <div style={{ marginBottom: mob ? 28 : 40, maxWidth: 620 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              Präsentation
            </div>
            <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 34px)" : "clamp(32px, 3vw, 44px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 14 }}>
              Interaktive Präsentation
            </h2>
            <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
              Ein geführter Storytelling‑Walkthrough durch das JetUP‑System — in 10 Slides.
            </p>
          </div>

          {/* Chapters then player on mobile (single column); two columns on desktop */}
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "minmax(0, 1.05fr) minmax(0, 1.4fr)", gap: mob ? 20 : 28, alignItems: "start" }}>
            {/* Chapters list */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} data-testid="chapter-grid">
              {CHAPTERS.map((c, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={c.n}
                    onClick={() => { setActive(i); }}
                    style={{
                      textAlign: "left", padding: "16px 16px",
                      borderRadius: 12,
                      background: isActive
                        ? `linear-gradient(135deg, ${ACCENT}28, ${ACCENT_LIGHT}10)`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? `${ACCENT}80` : C.BORDER}`,
                      cursor: "pointer", color: C.TEXT, fontFamily: "inherit",
                      transition: "all .25s ease",
                      position: "relative", overflow: "hidden",
                    }}
                    data-testid={`chapter-tab-${i}`}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700, color: isActive ? ACCENT_LIGHT : C.TEXT_MUTED, letterSpacing: "0.18em", marginBottom: 6 }}>
                      {c.n}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: C.TEXT_MUTED, fontWeight: 300 }}>{c.desc}</div>
                    {isActive && (
                      <motion.div
                        layoutId="active-indicator-b"
                        style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${ACCENT}, ${ACCENT_LIGHT})` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Player */}
            <div>
              <PlayerStage chapter={CHAPTERS[active]} />
              <TransportControls
                index={active} total={CHAPTERS.length} playing={playing}
                onPrev={() => setActive(Math.max(0, active - 1))}
                onNext={() => setActive(Math.min(CHAPTERS.length - 1, active + 1))}
                onTogglePlay={() => setPlaying((p) => !p)}
                onFullscreen={() => setFullscreen(true)}
              />
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {fullscreen && (
          <FullscreenOverlay
            onClose={() => setFullscreen(false)}
            index={active} setIndex={setActive}
            playing={playing} setPlaying={setPlaying}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default VariantB;
