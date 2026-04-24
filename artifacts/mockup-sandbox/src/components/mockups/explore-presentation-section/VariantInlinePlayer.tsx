import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pause,
  Play,
  Volume2,
  X,
} from "lucide-react";

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

type Mode = "slide" | "interactive";

const CHAPTERS = [
  { n: "01", title: "Warum JetUP?" },
  { n: "02", title: "Das Produkt" },
  { n: "03", title: "Das Partnermodell" },
  { n: "04", title: "KI-Infrastruktur" },
  { n: "05", title: "Dein Einstieg" },
  { n: "06", title: "Strategien" },
  { n: "07", title: "Zahlen" },
  { n: "08", title: "Roadmap" },
  { n: "09", title: "Sofia & du" },
  { n: "10", title: "Nächster Schritt" },
];

function SlideStage({ idx, fullscreen }: { idx: number; fullscreen?: boolean }) {
  const c = CHAPTERS[idx];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(120% 80% at 30% 20%, ${ACCENT}33 0%, #0B0B16 55%, #050510 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={c.n}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: ACCENT_LIGHT,
              letterSpacing: "0.3em",
              marginBottom: 14,
            }}
          >
            SLIDE {c.n} / 10
          </div>
          <div
            style={{
              fontSize: fullscreen ? "clamp(36px, 5vw, 64px)" : "clamp(22px, 3vw, 38px)",
              fontWeight: 300,
              letterSpacing: "-0.02em",
              color: C.TEXT,
              marginBottom: 12,
            }}
          >
            {c.title}
          </div>
          <div style={{ fontSize: 13, color: C.TEXT_MUTED, fontWeight: 300 }}>
            Slide-Präsentation • Vorschau
          </div>
        </motion.div>
      </AnimatePresence>
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${C.BORDER}`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 8px #22c55e",
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: C.TEXT_SEC,
            letterSpacing: "0.15em",
          }}
        >
          SLIDE-MODUS
        </span>
      </div>
    </div>
  );
}

function InteractiveStage({
  idx,
  playing,
  fullscreen,
}: {
  idx: number;
  playing: boolean;
  fullscreen?: boolean;
}) {
  const c = CHAPTERS[idx];
  const progress = ((idx + (playing ? 0.7 : 0.2)) / CHAPTERS.length) * 100;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(120% 80% at 50% 30%, #1E1B4B 0%, #050510 80%)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -55%)",
          width: "min(70%, 380px)",
          aspectRatio: "16/9",
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(15,23,42,0.6))",
          border: `1px solid ${C.BORDER_STRONG}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}
      >
        <motion.div
          animate={{ scale: playing ? [1, 1.08, 1] : 1, opacity: playing ? 0.6 : 1 }}
          transition={{ duration: 1.4, repeat: playing ? Infinity : 0 }}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 30px ${ACCENT}88`,
          }}
        >
          {playing ? <Pause size={20} color="#fff" /> : <Play size={22} color="#fff" style={{ marginLeft: 3 }} />}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={c.n}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: fullscreen ? 80 : 56,
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: ACCENT_LIGHT,
              letterSpacing: "0.3em",
              marginBottom: 6,
            }}
          >
            KAPITEL {c.n}
          </div>
          <div
            style={{
              fontSize: fullscreen ? 22 : 16,
              fontWeight: 500,
              color: C.TEXT,
              letterSpacing: "-0.01em",
            }}
          >
            {c.title}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Scrubber */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: fullscreen ? 36 : 18,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 10, color: C.TEXT_MUTED, fontVariantNumeric: "tabular-nums" }}>
          {String(Math.floor(idx * 1.2)).padStart(2, "0")}:
          {String((idx * 12) % 60).padStart(2, "0")}
        </span>
        <div
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
            style={{
              height: "100%",
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`,
            }}
          />
        </div>
        <span style={{ fontSize: 10, color: C.TEXT_MUTED, fontVariantNumeric: "tabular-nums" }}>
          12:00
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 16,
          top: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${C.BORDER}`,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: ACCENT_LIGHT,
            boxShadow: `0 0 8px ${ACCENT_LIGHT}`,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: C.TEXT_SEC,
            letterSpacing: "0.15em",
          }}
        >
          INTERAKTIV-MODUS
        </span>
      </div>
    </div>
  );
}

function PlayerFrame({
  mode,
  idx,
  playing,
  onTogglePlay,
  onPrev,
  onNext,
  onFullscreen,
  fullscreen,
}: {
  mode: Mode;
  idx: number;
  playing: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  fullscreen?: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: fullscreen ? undefined : "16 / 9",
        height: fullscreen ? "100%" : undefined,
        borderRadius: fullscreen ? 0 : 20,
        overflow: "hidden",
        border: fullscreen ? "none" : `1px solid ${ACCENT}30`,
        background: "#0B0B16",
        boxShadow: fullscreen ? "none" : `0 30px 80px rgba(0,0,0,0.45)`,
      }}
      data-testid="player-frame"
    >
      {mode === "slide" ? (
        <SlideStage idx={idx} fullscreen={fullscreen} />
      ) : (
        <InteractiveStage idx={idx} playing={playing} fullscreen={fullscreen} />
      )}

      {/* Top-right fullscreen button */}
      <button
        onClick={onFullscreen}
        title={fullscreen ? "Verkleinern" : "Vollbild"}
        aria-label={fullscreen ? "Verkleinern" : "Vollbild"}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 36,
          height: 36,
          borderRadius: 10,
          border: `1px solid ${C.BORDER_STRONG}`,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(8px)",
          color: C.TEXT,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
        data-testid="btn-fullscreen"
      >
        {fullscreen ? <X size={16} /> : <Maximize2 size={14} />}
      </button>

      {/* Bottom-center transport (slide mode) */}
      {mode === "slide" && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 8px",
            borderRadius: 999,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            border: `1px solid ${C.BORDER_STRONG}`,
          }}
        >
          <button
            onClick={onPrev}
            disabled={idx === 0}
            style={ctrlBtn(idx === 0)}
            aria-label="Vorheriges Kapitel"
            data-testid="btn-prev"
          >
            <ChevronLeft size={14} />
          </button>
          <button onClick={onTogglePlay} style={ctrlBtn(false, true)} data-testid="btn-play">
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            onClick={onNext}
            disabled={idx === CHAPTERS.length - 1}
            style={ctrlBtn(idx === CHAPTERS.length - 1)}
            aria-label="Nächstes Kapitel"
            data-testid="btn-next"
          >
            <ChevronRight size={14} />
          </button>
          <span
            style={{
              fontSize: 10,
              color: C.TEXT_MUTED,
              padding: "0 8px",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.1em",
            }}
          >
            {String(idx + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Bottom-right volume (interactive mode) */}
      {mode === "interactive" && !fullscreen && (
        <button
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${C.BORDER_STRONG}`,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            color: C.TEXT,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Lautstärke"
        >
          <Volume2 size={14} />
        </button>
      )}
    </div>
  );
}

function ctrlBtn(disabled: boolean, primary = false): React.CSSProperties {
  return {
    width: 28,
    height: 28,
    borderRadius: 7,
    border: `1px solid ${primary ? `${ACCENT}55` : C.BORDER_STRONG}`,
    background: primary
      ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`
      : "rgba(255,255,255,0.04)",
    color: primary ? "#fff" : C.TEXT,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
  };
}

function ChapterStrip({
  idx,
  onPick,
}: {
  idx: number;
  onPick: (i: number) => void;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "thin",
      }}
      data-testid="chapter-strip"
    >
      {CHAPTERS.map((c, i) => {
        const active = i === idx;
        return (
          <button
            key={c.n}
            onClick={() => onPick(i)}
            style={{
              flex: "0 0 auto",
              padding: "8px 12px",
              borderRadius: 100,
              border: `1px solid ${active ? `${ACCENT}80` : C.BORDER}`,
              background: active
                ? `linear-gradient(135deg, ${ACCENT}28, ${ACCENT_LIGHT}10)`
                : "rgba(255,255,255,0.03)",
              color: active ? C.TEXT : C.TEXT_SEC,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
            data-testid={`chapter-chip-${i}`}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: active ? ACCENT_LIGHT : C.TEXT_MUTED,
                letterSpacing: "0.18em",
              }}
            >
              {c.n}
            </span>
            <span>{c.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function FullscreenOverlay({
  mode,
  idx,
  setIdx,
  playing,
  setPlaying,
  onClose,
}: {
  mode: Mode;
  idx: number;
  setIdx: (i: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(5,5,12,0.97)",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
      data-testid="fullscreen-overlay"
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: ACCENT,
            letterSpacing: "0.3em",
          }}
        >
          {mode === "slide" ? "SLIDE-PRÄSENTATION" : "INTERAKTIV"} • VOLLBILD
        </div>
        <button
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1px solid ${C.BORDER_STRONG}`,
            background: "rgba(255,255,255,0.04)",
            color: C.TEXT,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Schließen"
          data-testid="btn-fullscreen-close"
        >
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PlayerFrame
          mode={mode}
          idx={idx}
          playing={playing}
          onTogglePlay={() => setPlaying(!playing)}
          onPrev={() => setIdx(Math.max(0, idx - 1))}
          onNext={() => setIdx(Math.min(CHAPTERS.length - 1, idx + 1))}
          onFullscreen={onClose}
          fullscreen
        />
      </div>
      <div style={{ marginTop: 14 }}>
        <ChapterStrip idx={idx} onPick={setIdx} />
      </div>
    </motion.div>
  );
}

export function VariantInlinePlayer({
  forceMobile,
}: { forceMobile?: boolean } = {}) {
  const detected = useIsMobile();
  const mob = forceMobile ?? detected;
  const [mode, setMode] = useState<Mode>("slide");
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div
      style={{
        background: C.BG,
        color: C.TEXT,
        fontFamily: "'Montserrat', system-ui, sans-serif",
        minHeight: "100vh",
      }}
    >
      <section
        style={{
          padding: mob ? "60px 20px" : "100px 56px",
          borderTop: `1px solid ${C.BORDER}`,
        }}
        data-testid="section-presentation-variant-inline-player"
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div
            style={{
              display: mob ? "block" : "grid",
              gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.4fr)",
              gap: mob ? 28 : 56,
              alignItems: "start",
            }}
          >
            {/* LEFT — kept as in current PresentationSection */}
            <div style={{ marginBottom: mob ? 28 : 0 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: ACCENT,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: ACCENT,
                  }}
                />
                Präsentation
              </div>
              <h2
                style={{
                  fontSize: mob
                    ? "clamp(26px, 6vw, 34px)"
                    : "clamp(32px, 3vw, 44px)",
                  fontWeight: 300,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                  color: C.TEXT,
                  marginBottom: 16,
                }}
              >
                Interaktive Präsentation
              </h2>
              <p
                style={{
                  fontSize: mob ? 14 : 16,
                  color: C.TEXT_SEC,
                  lineHeight: 1.75,
                  fontWeight: 300,
                  maxWidth: 420,
                  marginBottom: 28,
                }}
              >
                Wähle dein Format — der Player rechts startet sofort. Mit
                einem Klick auf «Vollbild» wird er zum Kinoerlebnis.
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  alignItems: "stretch",
                  maxWidth: 360,
                }}
              >
                <button
                  onClick={() => {
                    setMode("slide");
                    setIdx(0);
                    setPlaying(false);
                  }}
                  data-testid="btn-mode-slide"
                  style={modeBtn(mode === "slide", true)}
                >
                  Slide-Präsentation öffnen
                </button>
                <button
                  onClick={() => {
                    setMode("interactive");
                    setIdx(0);
                    setPlaying(true);
                  }}
                  data-testid="btn-mode-interactive"
                  style={modeBtn(mode === "interactive", false)}
                >
                  Interaktiv ansehen →
                </button>
                <div
                  style={{
                    fontSize: 11,
                    color: C.TEXT_MUTED,
                    letterSpacing: "0.04em",
                    marginTop: 4,
                  }}
                  data-testid="text-mode-hint"
                >
                  {mode === "slide"
                    ? "10 Slides · klickbar · Sofia-Voiceover optional"
                    : "Video-Walkthrough · Pfad-Auswahl · ~12 min"}
                </div>
              </div>
            </div>

            {/* RIGHT — inline player */}
            <div>
              <PlayerFrame
                mode={mode}
                idx={idx}
                playing={playing}
                onTogglePlay={() => setPlaying((p) => !p)}
                onPrev={() => setIdx((i) => Math.max(0, i - 1))}
                onNext={() =>
                  setIdx((i) => Math.min(CHAPTERS.length - 1, i + 1))
                }
                onFullscreen={() => setFullscreen(true)}
              />
              <ChapterStrip idx={idx} onPick={setIdx} />
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {fullscreen && (
          <FullscreenOverlay
            mode={mode}
            idx={idx}
            setIdx={setIdx}
            playing={playing}
            setPlaying={setPlaying}
            onClose={() => setFullscreen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function modeBtn(active: boolean, primary: boolean): React.CSSProperties {
  if (primary) {
    return {
      padding: "14px 24px",
      background: active
        ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`
        : "rgba(255,255,255,0.04)",
      border: `1px solid ${active ? "transparent" : C.BORDER_STRONG}`,
      borderRadius: 100,
      color: active ? "#fff" : C.TEXT,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: "0.02em",
      textAlign: "center",
      boxShadow: active ? `0 0 40px ${ACCENT}35` : "none",
      transition: "all .25s ease",
    };
  }
  return {
    padding: "13px 22px",
    background: active ? `${ACCENT}1a` : "transparent",
    border: `1px solid ${active ? `${ACCENT_LIGHT}` : `${ACCENT}55`}`,
    borderRadius: 100,
    color: active ? ACCENT_LIGHT : C.TEXT,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
    textAlign: "center",
    transition: "all .25s ease",
  };
}

export default VariantInlinePlayer;
