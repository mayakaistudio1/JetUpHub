import './_group.css';
import React, { useState, useRef, useEffect, useCallback } from "react";

/* ─── TYPES ─────────────────────────────────────────────────────────────── */

type ScreenKind = "cinema" | "statement" | "pillars" | "path" | "income" | "ecosystem" | "final";

interface CinemaLine {
  text: string;
  gold?: boolean;
  start: number;
  end: number;
}

interface PillarDef {
  number: string;
  title: string;
  body: string;
  accent: string;
}

interface PathStep {
  n: number;
  label: string;
  sub: string;
}

interface IncomeTier {
  label: string;
  value: string;
  desc: string;
  accent: string;
}

interface EcoNode {
  id: string;
  label: string;
  angle: number;
  desc: string;
}

interface Screen {
  id: string;
  kind: ScreenKind;
  duration?: number;
  lines?: CinemaLine[];
  tagline?: string;
  headline?: string;
  goldWord?: string;
  sub?: string;
  pillars?: PillarDef[];
  steps?: PathStep[];
  income?: IncomeTier[];
  nodes?: EcoNode[];
  cta?: string[];
}

/* ─── DATA ───────────────────────────────────────────────────────────────── */

const SCREENS: Screen[] = [
  {
    id: "s1",
    kind: "cinema",
    duration: 9,
    lines: [
      { text: "90 % der Menschen verlieren.", gold: false, start: 0.5, end: 5.0 },
      { text: "Nicht wegen zu wenig Wissen.", gold: false, start: 3.0, end: 6.5 },
      { text: "Wegen zu wenig Struktur.", gold: true, start: 5.5, end: 9.0 },
    ],
  },
  {
    id: "s2",
    kind: "statement",
    tagline: "Was ist JetUP?",
    headline: "JetUP ist kein Angebot.",
    goldWord: "Es ist eine Architektur.",
    sub: "Produkt, Partnermodell und KI-Infrastruktur — in einem System.",
  },
  {
    id: "s3",
    kind: "pillars",
    tagline: "Drei Ebenen. Eine Logik.",
    pillars: [
      {
        number: "01",
        title: "Trading-Infrastruktur",
        body: "Regulierter Broker-Zugang. Dein Kapital bleibt bei dir. CopyX-Strategien mit nachvollziehbarer Logik.",
        accent: "#FFD700",
      },
      {
        number: "02",
        title: "Partnermodell",
        body: "Einkommen durch reale Aktivität. Lot-Kommission, Profit Share, Infinity Bonus, Global Pool — aufbauend.",
        accent: "#a78bfa",
      },
      {
        number: "03",
        title: "KI-Infrastruktur",
        body: "AI erklärt, begleitet und dupliziert. Kein manueller Burnout. Wachstum ohne Decke.",
        accent: "#34d399",
      },
    ],
  },
  {
    id: "s4",
    kind: "path",
    tagline: "Der Weg ins System",
    steps: [
      { n: 1, label: "Registrierung", sub: "Über das IB Portal. Sauber. Strukturiert." },
      { n: 2, label: "Broker-Anbindung", sub: "TAG Markets — regulierter Zugang." },
      { n: 3, label: "Strategie wählen", sub: "CopyX. Transparent, replizierbar." },
      { n: 4, label: "Kapital bleibt bei dir", sub: "Nicht in einer Zwischenebene." },
      { n: 5, label: "System arbeitet", sub: "Du skalierst. Nicht du arbeitest." },
    ],
  },
  {
    id: "s5",
    kind: "income",
    tagline: "Einkommen durch Aktivität",
    income: [
      {
        label: "Lot Commission",
        value: "$10.50",
        desc: "Pro Lot im Team. Bis 10 Ebenen. Passiv.",
        accent: "#FFD700",
      },
      {
        label: "Profit Share",
        value: "70 / 30",
        desc: "70 % des Handelsgewinns für den Kunden.",
        accent: "#FFA500",
      },
      {
        label: "Infinity Bonus",
        value: "1–3 %",
        desc: "Vom Teamvolumen. Wächst mit der Struktur.",
        accent: "#a78bfa",
      },
      {
        label: "Global Pool",
        value: "2 × 1 %",
        desc: "Vom Gesamtumsatz. Für Top-Partner.",
        accent: "#34d399",
      },
    ],
  },
  {
    id: "s6",
    kind: "ecosystem",
    tagline: "Das Ökosystem",
    nodes: [
      { id: "tag", label: "TAG Markets", angle: -90, desc: "Strategischer Broker-Partner." },
      { id: "ib", label: "IB Portal", angle: -18, desc: "Zentraler Einstiegspunkt." },
      { id: "partner", label: "Partner System", angle: 54, desc: "Aktivitätsbasiertes Einkommen." },
      { id: "ai", label: "AI Layer", angle: 126, desc: "Skalierung ohne Burnout." },
      { id: "bit1", label: "Bit1 / BIX", angle: 198, desc: "Krypto-Erweiterung des Systems." },
    ],
  },
  {
    id: "s7",
    kind: "final",
    headline: "Die Frage ist nicht,\nob das System funktioniert.",
    goldWord: "Die Frage ist: Bist du drin?",
    cta: ["Zum IB Portal", "Digital Hub öffnen", "Mit Maria sprechen"],
  },
];

/* ─── PROGRESS BAR ───────────────────────────────────────────────────────── */

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 h-[2px] bg-white/5">
      <div
        className="h-full transition-all duration-700"
        style={{
          width: `${((current + 1) / total) * 100}%`,
          background: "linear-gradient(90deg, #FFD700, #FFA500)",
          boxShadow: "0 0 8px rgba(255,215,0,0.4)",
        }}
      />
    </div>
  );
}

/* ─── SCREEN COUNTER ─────────────────────────────────────────────────────── */

function Counter({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="absolute bottom-6 right-6 z-40 font-mono"
      style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.08em" }}
    >
      {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </div>
  );
}

/* ─── CINEMA SCREEN ──────────────────────────────────────────────────────── */

function CinemaScreen({ screen, t }: { screen: Screen; t: number }) {
  if (!screen.lines) return null;
  const visible = screen.lines.filter((l) => t >= l.start);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-24 px-8 z-20">
      <div className="flex flex-col items-center gap-3 w-full max-w-3xl">
        {visible.map((line, i) => (
          <p
            key={`${line.text}-${i}`}
            className="animate-line-in text-center"
            style={{
              fontSize: "clamp(1.8rem, 4.5vw, 3.8rem)",
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              color: line.gold ? "#FFD700" : "rgba(255,255,255,0.95)",
              textShadow: line.gold
                ? "0 0 40px rgba(255,215,0,0.5), 0 2px 12px rgba(0,0,0,0.95)"
                : "0 2px 12px rgba(0,0,0,0.95)",
              filter: line.gold ? "drop-shadow(0 0 16px rgba(255,215,0,0.3))" : "none",
            }}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── STATEMENT SCREEN ───────────────────────────────────────────────────── */

function StatementScreen({ screen, onNext }: { screen: Screen; onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <div className="max-w-2xl">
        {screen.tagline && (
          <p
            className="animate-tagline-in mb-6"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,215,0,0.6)",
            }}
          >
            {screen.tagline}
          </p>
        )}
        {screen.headline && (
          <h1
            className="animate-h1-in"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5.2rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.95)",
              marginBottom: "0.25em",
            }}
          >
            {screen.headline}
          </h1>
        )}
        {screen.goldWord && (
          <h2
            className="animate-gold-in"
            style={{
              fontSize: "clamp(2.4rem, 6vw, 5.2rem)",
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.25))",
              marginBottom: "1.2em",
            }}
          >
            {screen.goldWord}
          </h2>
        )}
        {screen.sub && (
          <p
            className="animate-sub-in"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.3rem)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.65,
              maxWidth: "38ch",
            }}
          >
            {screen.sub}
          </p>
        )}
        <button
          onClick={onNext}
          className="animate-sub-in mt-10 flex items-center gap-2 transition-all duration-300 hover:gap-4 group"
          style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
        >
          <span>Mehr erfahren</span>
          <span
            className="transition-all duration-300"
            style={{ color: "#FFD700" }}
          >→</span>
        </button>
      </div>
    </div>
  );
}

/* ─── PILLARS SCREEN ─────────────────────────────────────────────────────── */

function PillarsScreen({ screen, onNext }: { screen: Screen; onNext: () => void }) {
  if (!screen.pillars) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-12 py-20">
      {screen.tagline && (
        <p
          className="animate-tagline-in mb-8"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,215,0,0.5)" }}
        >
          {screen.tagline}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {screen.pillars.map((p, i) => (
          <div
            key={i}
            className="animate-pillar-in"
            style={{
              animationDelay: `${i * 0.15}s`,
              borderLeft: `2px solid ${p.accent}`,
              paddingLeft: "20px",
            }}
          >
            <div
              style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.15em", color: p.accent, marginBottom: "8px", opacity: 0.7 }}
            >
              {p.number}
            </div>
            <div
              style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: 1.2, marginBottom: "10px", letterSpacing: "-0.01em" }}
            >
              {p.title}
            </div>
            <div
              style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", lineHeight: 1.7, fontWeight: 400 }}
            >
              {p.body}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        className="animate-sub-in mt-10 self-start flex items-center gap-2 transition-all duration-300 hover:gap-4"
        style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
      >
        <span>Weiter</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── PATH SCREEN ────────────────────────────────────────────────────────── */

function PathScreen({ screen, onNext }: { screen: Screen; onNext: () => void }) {
  if (!screen.steps) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-12 py-20">
      {screen.tagline && (
        <p
          className="animate-tagline-in mb-8"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,215,0,0.5)" }}
        >
          {screen.tagline}
        </p>
      )}
      <div className="flex flex-col gap-0">
        {screen.steps.map((step, i) => (
          <div
            key={i}
            className="animate-pillar-in flex gap-5 items-start"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex flex-col items-center" style={{ width: 32, flexShrink: 0 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "1px solid rgba(255,215,0,0.4)",
                  background: "rgba(255,215,0,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, color: "#FFD700",
                }}
              >
                {step.n}
              </div>
              {i < screen.steps!.length - 1 && (
                <div style={{ width: 1, height: 28, background: "rgba(255,215,0,0.15)", margin: "3px 0" }} />
              )}
            </div>
            <div style={{ paddingBottom: i < screen.steps!.length - 1 ? 0 : 0, paddingTop: 6, paddingBottom: 6 }}>
              <div style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)", fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                {step.label}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                {step.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        className="animate-sub-in mt-8 self-start flex items-center gap-2 transition-all duration-300 hover:gap-4"
        style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
      >
        <span>Weiter</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── INCOME SCREEN ──────────────────────────────────────────────────────── */

function IncomeScreen({ screen, onNext }: { screen: Screen; onNext: () => void }) {
  if (!screen.income) return null;
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-12 py-20">
      {screen.tagline && (
        <p
          className="animate-tagline-in mb-8"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,215,0,0.5)" }}
        >
          {screen.tagline}
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {screen.income.map((tier, i) => (
          <div
            key={i}
            className="animate-pillar-in"
            style={{
              animationDelay: `${i * 0.12}s`,
              borderTop: `2px solid ${tier.accent}40`,
              paddingTop: "16px",
            }}
          >
            <div
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: tier.accent, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "8px" }}
            >
              {tier.value}
            </div>
            <div
              style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "6px" }}
            >
              {tier.label}
            </div>
            <div
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", lineHeight: 1.55 }}
            >
              {tier.desc}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onNext}
        className="animate-sub-in mt-10 self-start flex items-center gap-2 transition-all duration-300 hover:gap-4"
        style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
      >
        <span>Weiter</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── ECOSYSTEM SCREEN ───────────────────────────────────────────────────── */

function EcosystemScreen({ screen, onNext }: { screen: Screen; onNext: () => void }) {
  const [active, setActive] = useState<string | null>(null);
  if (!screen.nodes) return null;
  const R = 130;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center items-center px-8 py-20">
      {screen.tagline && (
        <p
          className="animate-tagline-in mb-6"
          style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,215,0,0.5)" }}
        >
          {screen.tagline}
        </p>
      )}

      <div className="relative" style={{ width: 320, height: 320 }}>
        <svg className="absolute inset-0" width={320} height={320}>
          {screen.nodes.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const cx = 160 + R * Math.cos(rad);
            const cy = 160 + R * Math.sin(rad);
            return (
              <line
                key={n.id}
                x1={160} y1={160} x2={cx} y2={cy}
                stroke={active === n.id ? "rgba(255,215,0,0.5)" : "rgba(255,255,255,0.06)"}
                strokeWidth={active === n.id ? 1.5 : 1}
                style={{ transition: "stroke 0.4s" }}
              />
            );
          })}
        </svg>

        {/* Center */}
        <div
          className="absolute"
          style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,215,0,0.08)",
            border: "1px solid rgba(255,215,0,0.4)",
            boxShadow: "0 0 32px rgba(255,215,0,0.1)",
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 800, color: "#FFD700", letterSpacing: "0.06em" }}>JetUP</span>
        </div>

        {screen.nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const cx = 160 + R * Math.cos(rad);
          const cy = 160 + R * Math.sin(rad);
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActive(isActive ? null : n.id)}
              className="absolute transition-all duration-300"
              style={{
                width: 54, height: 54, borderRadius: "50%",
                top: cy - 27, left: cx - 27,
                background: isActive ? "rgba(255,215,0,0.1)" : "rgba(8,5,20,0.95)",
                border: isActive ? "1px solid rgba(255,215,0,0.5)" : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isActive ? "0 0 20px rgba(255,215,0,0.2)" : "none",
                transform: isActive ? "scale(1.15)" : "scale(1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ fontSize: "8px", fontWeight: 600, color: isActive ? "#FFD700" : "rgba(255,255,255,0.5)", textAlign: "center", lineHeight: 1.3, padding: "0 4px" }}>
                {n.label}
              </span>
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="animate-sub-in mt-4 text-center max-w-xs"
          style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}
        >
          <span style={{ color: "#FFD700", fontWeight: 700 }}>
            {screen.nodes.find((n) => n.id === active)?.label}
          </span>
          {" "}— {screen.nodes.find((n) => n.id === active)?.desc}
        </div>
      ) : (
        <div
          className="mt-4 text-center"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)" }}
        >
          Klicke auf einen Knoten
        </div>
      )}

      <button
        onClick={onNext}
        className="animate-sub-in mt-8 flex items-center gap-2 transition-all duration-300 hover:gap-4"
        style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500, background: "none", border: "none", cursor: "pointer" }}
      >
        <span>Weiter</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── FINAL SCREEN ───────────────────────────────────────────────────────── */

function FinalScreen({ onReplay }: { onReplay: () => void }) {
  const screen = SCREENS[SCREENS.length - 1];
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <div className="max-w-2xl">
        {screen.headline && (
          <h1
            className="animate-h1-in"
            style={{
              fontSize: "clamp(2rem, 5vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "rgba(255,255,255,0.88)",
              marginBottom: "0.3em",
              whiteSpace: "pre-line",
            }}
          >
            {screen.headline}
          </h1>
        )}
        {screen.goldWord && (
          <h2
            className="animate-gold-in"
            style={{
              fontSize: "clamp(2rem, 5vw, 4.2rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 24px rgba(255,215,0,0.3))",
              marginBottom: "2rem",
            }}
          >
            {screen.goldWord}
          </h2>
        )}
        {screen.cta && (
          <div className="animate-sub-in flex flex-col gap-3 max-w-xs">
            {screen.cta.map((label, i) => (
              <button
                key={i}
                className="w-full py-3.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
                style={
                  i === 0
                    ? {
                        background: "linear-gradient(135deg, #FFD700, #FFA500)",
                        color: "#000",
                        boxShadow: "0 0 24px rgba(255,215,0,0.2), 0 4px 16px rgba(0,0,0,0.3)",
                        letterSpacing: "0.01em",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={onReplay}
          className="mt-8 transition-all duration-200 hover:text-white"
          style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer" }}
        >
          Von vorne ansehen ↺
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────── */

export function Premium() {
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const screen = SCREENS[idx];
  const total = SCREENS.length;

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= total || transitioning) return;
      setTransitioning(true);
      cancelAnimationFrame(rafRef.current);
      setTimeout(() => {
        setIdx(next);
        setT(0);
        startRef.current = performance.now();
        setTimeout(() => setTransitioning(false), 80);
      }, 450);
    },
    [transitioning, total]
  );

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  /* Auto-advance cinema screens */
  useEffect(() => {
    if (screen.kind !== "cinema" || !screen.duration) return;
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= screen.duration!) {
        next();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen.id, screen.kind, screen.duration, next]);

  const replay = () => goTo(0);

  return (
    <div className="fixed inset-0 bg-[#06040f] overflow-hidden" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
      <style>{`
        /* Video desaturation */
        .bg-video { filter: saturate(0.3) brightness(0.32); }

        /* Gradient vignette */
        .vignette {
          background: radial-gradient(ellipse at center, transparent 30%, rgba(4,2,14,0.7) 100%),
                      linear-gradient(to bottom, rgba(4,2,14,0.5) 0%, transparent 20%, transparent 72%, rgba(4,2,14,0.85) 100%);
        }

        /* Screen transition */
        .screen-content { transition: opacity 0.45s ease; }
        .screen-content.hidden { opacity: 0; pointer-events: none; }

        /* Cinema line animation */
        @keyframes lineIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-line-in { animation: lineIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

        /* Statement animations */
        @keyframes tagIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-tagline-in { animation: tagIn 0.5s ease-out 0.1s both; }

        @keyframes h1In {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-h1-in { animation: h1In 0.65s cubic-bezier(0.16,1,0.3,1) 0.2s both; }

        @keyframes goldIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-gold-in { animation: goldIn 0.65s cubic-bezier(0.16,1,0.3,1) 0.42s both; }

        @keyframes subIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-sub-in { animation: subIn 0.6s ease-out 0.62s both; }

        /* Pillar animation */
        @keyframes pillarIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-pillar-in { animation: pillarIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }

        /* Noise texture overlay */
        .noise {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
          mix-blend-mode: overlay;
        }
      `}</style>

      {/* ── Video background ── */}
      <video
        src="/videos/city_night_panorama.mp4"
        className="absolute inset-0 w-full h-full object-cover bg-video"
        autoPlay muted loop playsInline preload="auto"
      />

      {/* ── Vignette + noise ── */}
      <div className="absolute inset-0 vignette pointer-events-none" />
      <div className="absolute inset-0 noise pointer-events-none" />

      {/* ── Progress bar ── */}
      <ProgressBar current={idx} total={total} />

      {/* ── Screen counter ── */}
      <Counter current={idx} total={total} />

      {/* ── Content ── */}
      <div
        className="absolute inset-0"
        style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.45s ease" }}
      >
        {screen.kind === "cinema" && <CinemaScreen screen={screen} t={t} />}
        {screen.kind === "statement" && <StatementScreen screen={screen} onNext={next} />}
        {screen.kind === "pillars" && <PillarsScreen screen={screen} onNext={next} />}
        {screen.kind === "path" && <PathScreen screen={screen} onNext={next} />}
        {screen.kind === "income" && <IncomeScreen screen={screen} onNext={next} />}
        {screen.kind === "ecosystem" && <EcosystemScreen screen={screen} onNext={next} />}
        {screen.kind === "final" && <FinalScreen onReplay={replay} />}
      </div>

      {/* ── Swipe / keyboard navigation ── */}
      <SwipeHandler onNext={next} onPrev={prev} />

      {/* ── Nav arrows ── */}
      <NavArrows idx={idx} total={total} onPrev={prev} onNext={next} />
    </div>
  );
}

/* ─── NAV ARROWS ─────────────────────────────────────────────────────────── */

function NavArrows({
  idx, total, onPrev, onNext,
}: { idx: number; total: number; onPrev: () => void; onNext: () => void }) {
  const atStart = idx === 0;
  const atEnd = idx === total - 1;
  const base: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    width: 52, height: 52, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(16px)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    cursor: "pointer", zIndex: 50,
    transition: "all 0.25s ease",
    fontSize: 20,
  };
  return (
    <>
      <button
        onClick={onPrev}
        disabled={atStart}
        style={{ ...base, left: 18, opacity: atStart ? 0.1 : 0.55, color: atStart ? "#fff" : "#FFD700" }}
        onMouseEnter={(e) => { if (!atStart) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { if (!atStart) (e.currentTarget as HTMLElement).style.opacity = "0.55"; }}
      >
        ←
      </button>
      <button
        onClick={onNext}
        disabled={atEnd}
        style={{ ...base, right: 18, opacity: atEnd ? 0.1 : 0.55, color: atEnd ? "#fff" : "#FFD700" }}
        onMouseEnter={(e) => { if (!atEnd) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
        onMouseLeave={(e) => { if (!atEnd) (e.currentTarget as HTMLElement).style.opacity = "0.55"; }}
      >
        →
      </button>
    </>
  );
}

/* ─── SWIPE HANDLER ──────────────────────────────────────────────────────── */

function SwipeHandler({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const touchRef = useRef<number>(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") onNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev]);

  return (
    <div
      className="absolute inset-0 z-30"
      style={{ pointerEvents: "none" }}
      onTouchStart={(e) => { touchRef.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchRef.current;
        if (dx < -50) onNext();
        else if (dx > 50) onPrev();
      }}
    />
  );
}
