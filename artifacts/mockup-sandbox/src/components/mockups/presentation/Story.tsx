import './_group.css';
import React, { useState, useRef, useEffect, useCallback } from "react";

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

/* ─── PROGRESS BAR ───────────────────────────────────────────────────────── */

function ProgressBar({ idx, total }: { idx: number; total: number }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/[0.04] z-40">
      <div
        style={{
          height: "100%", width: `${((idx + 1) / total) * 100}%`,
          background: "linear-gradient(90deg, #FFD700, #FFA500)",
          boxShadow: "0 0 8px rgba(255,215,0,0.5)",
          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

/* ─── SCREEN COUNTER ─────────────────────────────────────────────────────── */

function Counter({ idx, total }: { idx: number; total: number }) {
  return (
    <div className="absolute bottom-6 right-20 z-40" style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.1em", fontFamily: "monospace" }}>
      {String(idx + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </div>
  );
}

/* ─── TAGLINE ────────────────────────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <p className="animate-tag" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,215,0,0.5)", marginBottom: "1.4rem" }}>
      {children}
    </p>
  );
}

/* ─── SCREEN 1 — CINEMA HOOK ─────────────────────────────────────────────── */

function S1_Cinema({ t }: { t: number }) {
  const lines = [
    { text: "Wie viel verdienst du wirklich", start: 0.5, end: 5.5, gold: false },
    { text: "— stabil?", start: 2.2, end: 5.5, gold: true },
    { text: "Nicht im besten Monat.", start: 4.0, end: 7.5, gold: false },
    { text: "Jeden Monat — vorhersehbar.", start: 6.0, end: 9.0, gold: true },
  ];
  const visible = lines.filter((l) => t >= l.start);
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end pb-28 px-10 md:px-20">
      <div className="flex flex-col gap-1.5 max-w-2xl">
        {visible.map((l, i) => (
          <p key={i} className="animate-line"
            style={{
              fontSize: "clamp(2rem, 5.5vw, 4.8rem)", fontWeight: 800,
              lineHeight: 1.1, letterSpacing: "-0.02em",
              color: l.gold ? "#FFD700" : "rgba(255,255,255,0.92)",
              textShadow: l.gold ? "0 0 60px rgba(255,215,0,0.4), 0 2px 16px rgba(0,0,0,0.95)" : "0 2px 16px rgba(0,0,0,0.95)",
              filter: l.gold ? "drop-shadow(0 0 20px rgba(255,215,0,0.25))" : "none",
            }}>
            {l.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── SCREEN 2 — DAS PROBLEM ─────────────────────────────────────────────── */

function S2_Problem({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <Tag>Das Problem</Tag>
      <h1 className="animate-h1" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.1em" }}>
        Der Markt<br />ist müde.
      </h1>
      <h2 className="animate-gold" style={{ fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1.5rem" }}>
        Du auch.
      </h2>
      <p className="animate-sub" style={{ fontSize: "clamp(1rem, 1.8vw, 1.3rem)", color: "rgba(255,255,255,0.32)", fontWeight: 300, lineHeight: 1.7, maxWidth: "36ch" }}>
        Zu viele Versprechen. Zu wenig Struktur.<br />
        Alles hängt an einer Person. Stoppt der Leader — stoppt alles.
      </p>
      <button onClick={onNext} className="animate-sub mt-10 self-start flex items-center gap-2 hover:gap-3 transition-all duration-200 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500 }}>
        <span>Weiter</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── SCREEN 3 — REPOSITIONING ───────────────────────────────────────────── */

function S3_Reposition({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <Tag>Die Wahrheit</Tag>
      <h1 className="animate-h1" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.88)", marginBottom: "0.15em" }}>
        Das Problem<br />bist nicht du.
      </h1>
      <h2 className="animate-gold" style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1.5rem" }}>
        Das Problem<br />ist das Modell.
      </h2>
      <p className="animate-sub" style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", color: "rgba(255,255,255,0.3)", fontWeight: 300, lineHeight: 1.75, maxWidth: "34ch" }}>
        Ein Modell, das von einer Person abhängt,<br />skaliert nicht. Das ist keine persönliche Schwäche.<br />Das ist Architekturmangel.
      </p>
      <button onClick={onNext} className="animate-sub mt-10 self-start flex items-center gap-2 hover:gap-3 transition-all duration-200 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500 }}>
        <span>Die Lösung</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── SCREEN 4 — DIE LÖSUNG ──────────────────────────────────────────────── */

function S4_Solution({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <Tag>JetUP</Tag>
      <h1 className="animate-h1" style={{ fontSize: "clamp(3rem, 7.5vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)", marginBottom: "0.08em" }}>
        JetUP ist<br />kein Angebot.
      </h1>
      <h2 className="animate-gold" style={{ fontSize: "clamp(3rem, 7.5vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "1.6rem" }}>
        Es ist eine<br />Architektur.
      </h2>
      <div className="animate-sub flex gap-8">
        {["Produkt", "Partnermodell", "KI-Infrastruktur"].map((item, i) => (
          <div key={i} style={{ borderTop: "1px solid rgba(255,215,0,0.25)", paddingTop: "10px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,215,0,0.65)", letterSpacing: "0.06em" }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{item}</div>
          </div>
        ))}
      </div>
      <button onClick={onNext} className="animate-sub mt-10 self-start flex items-center gap-2 hover:gap-3 transition-all duration-200 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500 }}>
        <span>Für den Kunden</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── SCREEN 5 — CINEMA DIVIDER (CLIENT) ─────────────────────────────────── */

function S5_ClientIntro({ t }: { t: number }) {
  const lines = [
    { text: "Dein Weg", start: 0.5, end: 5.5, gold: false },
    { text: "als Kunde.", start: 1.8, end: 5.5, gold: true },
  ];
  const visible = lines.filter((l) => t >= l.start);
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-10 md:px-16">
      <div className="flex flex-col gap-1">
        {visible.map((l, i) => (
          <p key={i} className="animate-line" style={{ fontSize: "clamp(2.5rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", color: l.gold ? "#FFD700" : "rgba(255,255,255,0.88)", textShadow: "0 2px 20px rgba(0,0,0,0.95)", filter: l.gold ? "drop-shadow(0 0 24px rgba(255,215,0,0.3))" : "none" }}>
            {l.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── SCREEN 6 — CLIENT PATH (CopyX) ────────────────────────────────────── */

function S6_Client({ onNext }: { onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <Tag>CopyX — TAG Markets</Tag>

      {/* Hero number */}
      <div className="animate-h1" style={{ fontSize: "clamp(5rem, 18vw, 13rem)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.05em", background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 40px rgba(255,215,0,0.2))", marginBottom: "0.1em" }}>
        70 %
      </div>

      <div className="animate-gold flex flex-col gap-1" style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "clamp(1.3rem, 3vw, 2.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em" }}>
          Gewinn gehört dir. Immer.
        </div>
        <div style={{ fontSize: "clamp(1rem, 2vw, 1.4rem)", fontWeight: 400, color: "rgba(255,255,255,0.35)", letterSpacing: "0" }}>
          Jederzeit auszahlbar. Kein Umweg.
        </div>
      </div>

      {/* 4 key facts */}
      <div className="animate-sub grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl" style={{ marginBottom: "2rem" }}>
        {[
          { value: "+138 %", label: "Gesamtrendite verifiziert" },
          { value: "< 10 %", label: "Max. Drawdown" },
          { value: "24 Mo.", label: "Offener Track-Record" },
          { value: "24×", label: "Kapitalverstärkung" },
        ].map((f, i) => (
          <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px" }}>
            <div style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", fontWeight: 800, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em" }}>{f.value}</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "4px", lineHeight: 1.4 }}>{f.label}</div>
          </div>
        ))}
      </div>

      <p className="animate-sub" style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginBottom: "1.5rem", maxWidth: "40ch", lineHeight: 1.6 }}>
        Kapital bleibt auf deinem Konto bei TAG Markets. Lizenzierter Broker. Vollständige Kontrolle zu jeder Zeit. Verifiziert durch Myfxbook.
      </p>

      <button onClick={onNext} className="animate-sub self-start flex items-center gap-2 hover:gap-3 transition-all duration-200 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500 }}>
        <span>Für den Partner</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── SCREEN 7 — CINEMA DIVIDER (PARTNER) ────────────────────────────────── */

function S7_PartnerIntro({ t }: { t: number }) {
  const lines = [
    { text: "Dein Weg", start: 0.5, end: 5.5, gold: false },
    { text: "als Partner.", start: 1.8, end: 5.5, gold: true },
  ];
  const visible = lines.filter((l) => t >= l.start);
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-10 md:px-16">
      <div className="flex flex-col gap-1">
        {visible.map((l, i) => (
          <p key={i} className="animate-line" style={{ fontSize: "clamp(2.5rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em", color: l.gold ? "#FFD700" : "rgba(255,255,255,0.88)", textShadow: "0 2px 20px rgba(0,0,0,0.95)", filter: l.gold ? "drop-shadow(0 0 24px rgba(255,215,0,0.3))" : "none" }}>
            {l.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ─── SCREEN 8 — PARTNER INCOME ──────────────────────────────────────────── */

function S8_PartnerIncome({ onNext }: { onNext: () => void }) {
  const layers = [
    { n: "01", label: "Lot Commission", value: "$2–10 / Lot", desc: "Direkt. Von erster Aktivität.", accent: "#FFD700" },
    { n: "02", label: "Profit Share", value: "bis 4 %", desc: "Vom Ergebnis der Struktur.", accent: "#FFA500" },
    { n: "03", label: "Infinity Bonus", value: "+1–3 %", desc: "Tiefe unbegrenzt. Keine Decke.", accent: "#a78bfa" },
    { n: "04", label: "Global Pool", value: "2 × 1 %", desc: "Gesamtumsatz der Plattform.", accent: "#34d399" },
  ];
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <Tag>Einkommensarchitektur</Tag>
      <h1 className="animate-h1" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.88)", marginBottom: "0.15em" }}>
        Einkommen wächst
      </h1>
      <h2 className="animate-gold" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "2.2rem" }}>
        mit dem System.
      </h2>

      {/* Income cascade */}
      <div className="animate-sub flex flex-col gap-0 max-w-2xl">
        {layers.map((l, i) => (
          <div key={i} className="flex items-stretch gap-5">
            {/* Left connector */}
            <div className="flex flex-col items-center" style={{ width: 36, flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: `${l.accent}12`, border: `1.5px solid ${l.accent}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 800, color: l.accent,
              }}>
                {l.n}
              </div>
              {i < layers.length - 1 && (
                <div style={{ width: 1, flex: 1, minHeight: 14, background: `linear-gradient(to bottom, ${l.accent}30, ${layers[i + 1].accent}20)`, margin: "2px 0" }} />
              )}
            </div>

            {/* Content */}
            <div style={{ paddingTop: 7, paddingBottom: i < layers.length - 1 ? 14 : 0, flex: 1 }}>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span style={{ fontSize: "clamp(1rem, 2vw, 1.35rem)", fontWeight: 800, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.01em" }}>{l.label}</span>
                <span style={{ fontSize: "clamp(0.9rem, 1.8vw, 1.15rem)", fontWeight: 700, color: l.accent }}>{l.value}</span>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: 2, fontWeight: 400 }}>{l.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="animate-sub" style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", marginTop: "1.5rem", maxWidth: "44ch", lineHeight: 1.65 }}>
        Jede Schicht baut auf der vorherigen auf. Einstieg ab Level 1 — Wachstum bis zur globalen Ebene.
      </p>

      <button onClick={onNext} className="animate-sub mt-8 self-start flex items-center gap-2 hover:gap-3 transition-all duration-200 cursor-pointer" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", fontSize: "12px", fontWeight: 500 }}>
        <span>Weiter</span><span style={{ color: "#FFD700" }}>→</span>
      </button>
    </div>
  );
}

/* ─── SCREEN 9 — CINEMA PROOF ────────────────────────────────────────────── */

function S9_Proof({ t }: { t: number }) {
  const lines = [
    { text: "+138 %", start: 0.5, end: 8.0, gold: true },
    { text: "Verifiziert.", start: 3.0, end: 8.0, gold: false },
    { text: "Unabhängig. Transparent.", start: 4.5, end: 8.0, gold: false },
  ];
  const visible = lines.filter((l) => t >= l.start);
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center items-start px-10 md:px-16">
      <div className="flex flex-col gap-2">
        {visible.map((l, i) => (
          <p key={i} className="animate-line" style={{
            fontSize: i === 0 ? "clamp(5rem, 16vw, 12rem)" : "clamp(1.8rem, 4.5vw, 3.8rem)",
            fontWeight: 900,
            lineHeight: i === 0 ? 0.9 : 1.2,
            letterSpacing: i === 0 ? "-0.05em" : "-0.02em",
            color: l.gold ? "#FFD700" : "rgba(255,255,255,0.75)",
            textShadow: l.gold ? "0 0 80px rgba(255,215,0,0.5)" : "none",
            filter: l.gold ? "drop-shadow(0 0 30px rgba(255,215,0,0.3))" : "none",
          }}>
            {l.text}
          </p>
        ))}
      </div>
      {t >= 4.5 && (
        <p className="animate-sub" style={{ marginTop: "2rem", fontSize: "12px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>
          Myfxbook · 24 Monate · Maximaler Drawdown unter 10 %
        </p>
      )}
    </div>
  );
}

/* ─── SCREEN 10 — FINAL ──────────────────────────────────────────────────── */

function S10_Final({ onReplay }: { onReplay: () => void }) {
  const ctas = [
    { label: "Zum IB Portal", primary: true },
    { label: "Digital Hub öffnen", primary: false },
    { label: "Mit Maria sprechen", primary: false },
  ];
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center px-10 md:px-16">
      <Tag>Bereit?</Tag>
      <h1 className="animate-h1" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.8rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.88)", marginBottom: "0.1em" }}>
        30 Tage. 100 Dollar.
      </h1>
      <h2 className="animate-gold" style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.8rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "2.5rem" }}>
        Danach entscheidest du.
      </h2>
      <div className="animate-sub flex flex-col gap-2.5 max-w-xs">
        {ctas.map((c, i) => (
          <button key={i} style={c.primary ? { background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#000", border: "none", padding: "14px 28px", borderRadius: "999px", fontSize: "14px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.01em", boxShadow: "0 0 32px rgba(255,215,0,0.2)" } : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.09)", padding: "14px 28px", borderRadius: "999px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
            {c.label}
          </button>
        ))}
      </div>
      <button onClick={onReplay} className="animate-sub mt-8" style={{ background: "none", border: "none", fontSize: "11px", color: "rgba(255,255,255,0.18)", cursor: "pointer" }}>
        Von vorne ↺
      </button>
    </div>
  );
}

/* ─── SCREEN REGISTRY ────────────────────────────────────────────────────── */

type ScreenDef = {
  id: string;
  kind: "cinema" | "interactive";
  duration?: number;
};

const SCREEN_DEFS: ScreenDef[] = [
  { id: "hook", kind: "cinema", duration: 9 },
  { id: "problem", kind: "interactive" },
  { id: "reposition", kind: "interactive" },
  { id: "solution", kind: "interactive" },
  { id: "client-intro", kind: "cinema", duration: 5 },
  { id: "client-path", kind: "interactive" },
  { id: "partner-intro", kind: "cinema", duration: 5 },
  { id: "partner-income", kind: "interactive" },
  { id: "proof", kind: "cinema", duration: 8 },
  { id: "final", kind: "interactive" },
];

/* ─── MAIN ───────────────────────────────────────────────────────────────── */

export function Story() {
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const def = SCREEN_DEFS[idx];

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= SCREEN_DEFS.length || transitioning) return;
    setTransitioning(true);
    cancelAnimationFrame(rafRef.current);
    setTimeout(() => {
      setIdx(next);
      setT(0);
      startRef.current = performance.now();
      setTimeout(() => setTransitioning(false), 80);
    }, 380);
  }, [transitioning]);

  const next = useCallback(() => goTo(idx + 1), [goTo, idx]);
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx]);

  /* Cinema auto-advance */
  useEffect(() => {
    if (def.kind !== "cinema" || !def.duration) return;
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= def.duration!) { next(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [def.id, def.kind, def.duration, next]);

  /* Keyboard nav */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const renderScreen = () => {
    switch (def.id) {
      case "hook": return <S1_Cinema t={t} />;
      case "problem": return <S2_Problem onNext={next} />;
      case "reposition": return <S3_Reposition onNext={next} />;
      case "solution": return <S4_Solution onNext={next} />;
      case "client-intro": return <S5_ClientIntro t={t} />;
      case "client-path": return <S6_Client onNext={next} />;
      case "partner-intro": return <S7_PartnerIntro t={t} />;
      case "partner-income": return <S8_PartnerIncome onNext={next} />;
      case "proof": return <S9_Proof t={t} />;
      case "final": return <S10_Final onReplay={() => goTo(0)} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#050310]" style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
      <style>{`
        .bg-vid { filter: saturate(0.28) brightness(0.28); }
        .vignette { background: radial-gradient(ellipse 80% 80% at 50% 50%, transparent 35%, rgba(3,1,16,0.75) 100%), linear-gradient(to bottom, rgba(3,1,16,0.55) 0%, transparent 22%, transparent 68%, rgba(3,1,16,0.88) 100%); }

        @keyframes lineIn { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        .animate-line { animation: lineIn 0.72s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes tagIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-tag { animation: tagIn 0.5s ease-out 0.1s both; }

        @keyframes h1In { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        .animate-h1 { animation: h1In 0.72s cubic-bezier(0.16,1,0.3,1) 0.18s both; }

        @keyframes goldIn { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        .animate-gold { animation: goldIn 0.72s cubic-bezier(0.16,1,0.3,1) 0.36s both; }

        @keyframes subIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .animate-sub { animation: subIn 0.65s ease-out 0.56s both; }
      `}</style>

      {/* Video */}
      <video src="/videos/city_night_panorama.mp4" className="absolute inset-0 w-full h-full object-cover bg-vid" autoPlay muted loop playsInline />

      {/* Vignette */}
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Progress */}
      <ProgressBar idx={idx} total={SCREEN_DEFS.length} />

      {/* Counter */}
      <Counter idx={idx} total={SCREEN_DEFS.length} />

      {/* Content */}
      <div style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.38s ease" }}>
        {renderScreen()}
      </div>

      {/* Nav arrows */}
      <NavArrows idx={idx} total={SCREEN_DEFS.length} onPrev={prev} onNext={next} />
    </div>
  );
}
