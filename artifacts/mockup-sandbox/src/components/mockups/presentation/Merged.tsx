import './_group.css';
import React, { useState, useRef, useEffect, useCallback } from "react";

/* ─── TYPES ─────────────────────────────────────────────────────────────── */

interface RevealItem {
  question: string;
  answer: string;
}

interface PathStep {
  label: string;
  note?: string;
}

interface PillarItem {
  title: string;
  subtitle: string;
  color: string;
}

interface EcosystemNode {
  id: string;
  label: string;
  angle: number;
  text: string;
}

type ScreenType =
  | "intro"
  | "standard"
  | "path"
  | "pillars"
  | "comparison"
  | "ecosystem";

interface Screen {
  id: string;
  label: string;
  type: ScreenType;
  headline: string;
  subheadline?: string;
  body: string;
  pills?: string[];
  reveals?: RevealItem[];
  steps?: PathStep[];
  pillars?: PillarItem[];
  nodes?: EcosystemNode[];
  subtitles?: { text: string; start: number; end: number }[];
  duration?: number;
  overlay?: string;
}

/* ─── SCREEN DATA ────────────────────────────────────────────────────────── */

const screens: Screen[] = [
  {
    id: "s1",
    label: "Markt",
    type: "intro",
    duration: 7,
    overlay: "rgba(0,0,0,0.42)",
    headline: "",
    body: "",
    subtitles: [
      { text: "Der Markt ist überladen.", start: 0.8, end: 4.0 },
      { text: "Systeme sind es nicht.", start: 4.0, end: 7.0 },
    ],
  },
  {
    id: "s2",
    label: "Problem",
    type: "standard",
    headline: "Das Problem bist nicht du.",
    subheadline: "Das Problem ist das Modell.",
    body: "Ein Modell, das vollständig von einer Person abhängt, skaliert nicht. Sobald der Leader stoppt, verliert das ganze System an Dynamik.",
    pills: ["Abhängigkeit", "Keine Duplikation"],
    reveals: [
      {
        question: "Warum bricht Wachstum so oft ab?",
        answer: "Weil Produkt, Erklärung, Follow-up und Support oft nur am persönlichen Einsatz einzelner Menschen hängen.",
      },
      {
        question: "Warum wiederholt sich Erfolg nicht?",
        answer: "Weil ohne Struktur keine saubere Duplikation entsteht — und ohne Duplikation bleibt Wachstum manuell.",
      },
    ],
  },
  {
    id: "s3",
    label: "System",
    type: "standard",
    headline: "JetUP ist kein Angebot.",
    subheadline: "JetUP ist ein System.",
    body: "Produkt, Partnermodell und AI-Infrastruktur arbeiten hier nicht getrennt voneinander, sondern in einer gemeinsamen Logik.",
    pills: ["Produkt", "Partner", "AI"],
    reveals: [
      {
        question: "Was macht JetUP anders?",
        answer: "JetUP verbindet reale Produktlogik, Einkommensarchitektur und digitale Skalierung in einem zusammenhängenden Rahmen.",
      },
      {
        question: "Warum genau diese drei Ebenen?",
        answer: "Weil ein Produkt ohne Struktur nicht skaliert, ein Partnermodell ohne Produkt nicht trägt und AI ohne System nur ein Tool bleibt.",
      },
    ],
  },
  {
    id: "s4",
    label: "Einstieg",
    type: "standard",
    headline: "Ein Einstieg.",
    subheadline: "Klare Kontrolle.",
    body: "JetUP verbindet Zugang, Produkt und nächste Schritte in einer nachvollziehbaren Umgebung. Die Kontrolle bleibt beim Kunden.",
    pills: ["IB Portal", "Kontrolle", "Struktur"],
    reveals: [
      {
        question: "Welche Rolle spielt das IB Portal?",
        answer: "Das IB Portal ist der zentrale Einstiegspunkt in das gesamte System — dort laufen Zugang, Orientierung und Verbindungen zusammen.",
      },
      {
        question: "Warum ist Kontrolle hier so wichtig?",
        answer: "Konto, Auswahl und Bewegung im System bleiben auf Kundenseite nachvollziehbar und kontrollierbar.",
      },
    ],
  },
  {
    id: "s5",
    label: "Produktweg",
    type: "path",
    headline: "Du gehst nicht blind in den Markt.",
    subheadline: "Du gehst durch einen strukturierten Produktweg.",
    body: "Registrierung, Zugang, Strategieauswahl und Umsetzung folgen einer klareren Logik statt chaotischer Einzelentscheidungen.",
    steps: [
      { label: "Registrierung", note: "Über das IB Portal" },
      { label: "Broker-Anbindung", note: "TAG Markets" },
      { label: "CopyX / Strategiewahl", note: "Transparent & strukturiert" },
      { label: "Kapital beim Broker", note: "Volle Kontrolle bleibt bei dir" },
      { label: "Produktlogik aktiv", note: "System arbeitet für dich" },
    ],
    reveals: [
      {
        question: "Wie beginnt der Produktweg?",
        answer: "Der Einstieg erfolgt nicht isoliert, sondern über eine geführte Struktur mit Zugang, Auswahl und Verbindung zur Produktlogik.",
      },
      {
        question: "Was ist CopyX?",
        answer: "CopyX bedeutet strukturierter Zugang zu Strategien mit mehr Transparenz, klarerer Orientierung und der Möglichkeit, Entscheidungen nachvollziehbarer zu treffen.",
      },
      {
        question: "Wo bleibt das Kapital?",
        answer: "Das Kapital bleibt in der Broker-Infrastruktur — nicht in einer intransparenten Zwischenebene.",
      },
    ],
  },
  {
    id: "s6",
    label: "Transparenz",
    type: "standard",
    headline: "Struktur ist gut.",
    subheadline: "Transparenz ist besser.",
    body: "Produktlogik wird stärker, wenn Auswahl, Regeln, Risiko und Ergebnisse nachvollziehbar bleiben.",
    pills: ["Strategien", "Transparenz", "Risikologik"],
    reveals: [
      {
        question: "Warum wirkt das strukturierter?",
        answer: "Der Unterschied entsteht nicht nur durch Zugang, sondern durch nachvollziehbarere Regeln, Auswahl und Entscheidungsstruktur.",
      },
      {
        question: "Welche Rolle spielt Transparenz?",
        answer: "Transparenz schafft Vertrauen — nicht als Versprechen, sondern als sichtbare Produktlogik.",
      },
      {
        question: "Warum ist Risikologik wichtig?",
        answer: "Ein Produkt wird erst skalierbar, wenn es nicht nur interessant, sondern auch erklärbar und kontrollierbar bleibt.",
      },
    ],
  },
  {
    id: "s7",
    label: "Partner",
    type: "pillars",
    headline: "Einkommen entsteht durch Aktivität.",
    subheadline: "Nicht durch Versprechen.",
    body: "Die Partnerlogik von JetUP ist an reale Bewegung im System gebunden — nicht an leere Sprache.",
    pillars: [
      {
        title: "Lot Commission",
        subtitle: "Erster direkter Einkommensfluss durch reale Aktivität im System.",
        color: "#FFD700",
      },
      {
        title: "Profit Share",
        subtitle: "Einkommen wächst mit der Produktaktivität und dem Ergebnis im System.",
        color: "#FFA500",
      },
      {
        title: "Infinity Bonus",
        subtitle: "Struktur, Tiefe und Skalierung erzeugen breitere Einkommensarchitektur.",
        color: "#a78bfa",
      },
      {
        title: "Global Pool",
        subtitle: "Breitere Einkommensebene für Partner mit starker Systemtiefe.",
        color: "#34d399",
      },
    ],
    reveals: [
      {
        question: "Wo beginnt Einkommen?",
        answer: "Lot Commission ist der erste direkte Einkommensfluss — entstanden durch reale Aktivität, nicht durch Versprechen.",
      },
      {
        question: "Wann entsteht Tiefe?",
        answer: "Tiefe entsteht, wenn Duplikation sauber funktioniert — strukturierte Erklärung, Follow-up und System statt manueller Arbeit.",
      },
      {
        question: "Wie wächst das Modell weiter?",
        answer: "Infinity und Global Pool erweitern die Einkommensarchitektur für Partner, die Systemtiefe und Teamvolumen aufbauen.",
      },
    ],
  },
  {
    id: "s8",
    label: "Skalierung",
    type: "intro",
    duration: 7,
    overlay: "rgba(0,0,0,0.4)",
    headline: "",
    body: "",
    subtitles: [
      { text: "Selbst das beste Produkt", start: 0.8, end: 3.0 },
      { text: "skaliert nicht von allein.", start: 3.0, end: 6.5 },
    ],
  },
  {
    id: "s9",
    label: "AI Layer",
    type: "comparison",
    headline: "AI ersetzt dich nicht.",
    subheadline: "AI skaliert dich.",
    body: "AI hilft, Aufmerksamkeit zu halten, Fragen zu beantworten, Menschen zu begleiten und Kommunikation sauberer zu duplizieren.",
    reveals: [
      {
        question: "Was übernimmt AI konkret?",
        answer: "AI übernimmt erste Erklärung, wiederkehrende Fragen, Orientierung und Teile der Qualifizierung.",
      },
      {
        question: "Wo entsteht der größte Hebel?",
        answer: "Der größte Hebel entsteht dort, wo Wachstum bisher an Zeit, Wiederholung und Erreichbarkeit hängt.",
      },
      {
        question: "Warum ist das kein Spielzeug?",
        answer: "AI ist hier nicht Show, sondern Infrastruktur für sauberere Skalierung.",
      },
    ],
  },
  {
    id: "s10",
    label: "Ökosystem",
    type: "ecosystem",
    headline: "JetUP ist kein Produkt.",
    subheadline: "Es ist eine Umgebung.",
    body: "Produkt, Partnerlogik, AI und Infrastruktur greifen ineinander.",
    nodes: [
      { id: "tag", label: "TAG Markets", angle: -90, text: "Strategischer Broker-Partner für Marktzugang, Produktaktivität und strukturierte Nutzung." },
      { id: "ib", label: "IB Portal", angle: -18, text: "Der zentrale Einstiegspunkt, über den Zugang, Struktur und Systemlogik zusammenlaufen." },
      { id: "partner", label: "Partner System", angle: 54, text: "Ein Einkommensmodell, das auf realer Aktivität, Tiefe und Wachstum im System basiert." },
      { id: "ai", label: "AI Layer", angle: 126, text: "AI unterstützt Erklärung, Begleitung und Duplikation — als Infrastruktur, nicht als Gimmick." },
      { id: "bit1", label: "Bit1 / BIX", angle: 198, text: "Die Erweiterung des Ökosystems in Richtung Krypto, Wallet und alltagsnahe Nutzungslogik." },
    ],
    reveals: [
      {
        question: "Wie hängt alles zusammen?",
        answer: "Jede Ebene des Systems stärkt die andere — Produkt gibt dem Partnersystem Glaubwürdigkeit, AI gibt dem Partnerweg Skalierung.",
      },
      {
        question: "Was bringt das dem Partner?",
        answer: "Der Partner bewegt sich nicht mehr allein — er bewegt sich in einem strukturierten System mit Zugang, Tools und Infrastruktur.",
      },
    ],
  },
];

/* ─── GOLD STYLE HELPERS ─────────────────────────────────────────────────── */

const gold = {
  from: "#FFD700",
  to: "#FFA500",
  gradient: "linear-gradient(135deg, #FFD700, #FFA500)",
  glow: "0 0 20px rgba(255,215,0,0.25)",
  textStyle: {
    background: "linear-gradient(135deg, #FFD700, #FFA500)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    filter: "drop-shadow(0 0 12px rgba(255,215,0,0.2))",
  },
};

const glass = {
  card: {
    background: "linear-gradient(135deg, rgba(10,10,30,0.92) 0%, rgba(18,12,38,0.92) 100%)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,215,0,0.08)",
    boxShadow: "0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
};

/* ─── TIMELINE ───────────────────────────────────────────────────────────── */

function Timeline({ currentIndex, onSelect }: { currentIndex: number; onSelect: (i: number) => void }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 px-4 pt-4 pb-2">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        <div className="absolute top-[9px] left-0 right-0 h-[1.5px] bg-white/8" />
        <div
          className="absolute top-[9px] left-0 h-[1.5px] transition-all duration-700"
          style={{ width: `${(currentIndex / Math.max(screens.length - 1, 1)) * 100}%`, background: gold.gradient }}
        />
        {screens.map((s, i) => {
          const active = i <= currentIndex;
          const current = i === currentIndex;
          return (
            <button key={s.id} onClick={() => onSelect(i)} className="relative flex flex-col items-center z-10">
              <div
                className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-500 flex items-center justify-center"
                style={{
                  borderColor: active ? "#FFD700" : "rgba(255,255,255,0.12)",
                  backgroundColor: current ? "#FFD700" : active ? "rgba(255,215,0,0.2)" : "transparent",
                  transform: current ? "scale(1.35)" : "scale(1)",
                  boxShadow: current ? "0 0 10px rgba(255,215,0,0.5)" : "none",
                }}
              >
                {current && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <span
                className="mt-1.5 whitespace-nowrap transition-all duration-300"
                style={{ color: active ? "#FFD700" : "rgba(255,255,255,0.2)", fontSize: "8px", fontWeight: current ? 600 : 400 }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── SUBTITLES (for intro screens) ─────────────────────────────────────── */

function Subtitles({ subtitles, t }: { subtitles: Screen["subtitles"]; t: number }) {
  if (!subtitles) return null;
  const active = subtitles.filter((s) => t >= s.start && t <= s.end);
  if (!active.length) return null;
  return (
    <div className="absolute inset-x-0 z-20 flex flex-col items-center gap-2 px-6" style={{ bottom: "12%" }}>
      {active.map((s, i) => (
        <p
          key={`${s.text}-${i}`}
          className="text-center font-bold animate-subtitle-in"
          style={{
            color: "#FFD700",
            fontSize: "clamp(1.8rem, 5.5vw, 3.8rem)",
            lineHeight: 1.25,
            textShadow: "0 2px 10px rgba(0,0,0,0.98), 0 0 60px rgba(0,0,0,0.8)",
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {s.text}
        </p>
      ))}
    </div>
  );
}

/* ─── REVEAL CARD ────────────────────────────────────────────────────────── */

function RevealPills({ reveals, screenId }: { reveals: RevealItem[]; screenId: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-2 mt-4">
      {reveals.map((r, i) => {
        const isOpen = open === i;
        return (
          <div key={`${screenId}-r${i}`}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left flex items-center gap-2 transition-all duration-300"
              style={{
                background: isOpen ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.03)",
                border: isOpen ? "1px solid rgba(255,215,0,0.25)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "8px 14px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: isOpen ? "#FFD700" : "rgba(255,255,255,0.5)",
                  transition: "color 0.3s",
                  flex: 1,
                }}
              >
                {r.question}
              </span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0 }}
              >
                <path d="M3 2L7 5L3 8" stroke={isOpen ? "#FFD700" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div
                className="animate-block-expand px-3 pt-2 pb-3"
                style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", lineHeight: 1.7, fontWeight: 400 }}
              >
                {r.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── PILL TAGS ──────────────────────────────────────────────────────────── */

function Pills({ pills }: { pills: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {pills.map((p) => (
        <span
          key={p}
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 500,
            color: "rgba(255,215,0,0.7)",
            background: "rgba(255,215,0,0.07)",
            border: "1px solid rgba(255,215,0,0.18)",
            letterSpacing: "0.03em",
          }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

/* ─── PATH STEP BLOCK ────────────────────────────────────────────────────── */

function PathStepBlock({ steps }: { steps: PathStep[] }) {
  return (
    <div className="relative flex flex-col gap-0 mt-5 mb-2">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className="flex gap-4 items-start">
            <div className="flex flex-col items-center" style={{ minWidth: 28 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(255,215,0,0.12)",
                  border: "1.5px solid rgba(255,215,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#FFD700",
                  flexShrink: 0,
                  zIndex: 1,
                }}
              >
                {i + 1}
              </div>
              {!isLast && (
                <div style={{ width: 1, flex: 1, minHeight: 20, background: "rgba(255,215,0,0.2)", marginTop: 2, marginBottom: 2 }} />
              )}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 12, paddingTop: 4 }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 1 }}>{step.label}</div>
              {step.note && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", fontWeight: 400 }}>{step.note}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── PILLAR CARDS ───────────────────────────────────────────────────────── */

function PillarCards({ pillars }: { pillars: PillarItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 mt-5">
      {pillars.map((p, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(135deg, ${p.color}08, ${p.color}04)`,
            border: `1px solid ${p.color}28`,
            borderRadius: "14px",
            padding: "14px 14px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: p.color, marginBottom: 5, letterSpacing: "0.01em" }}>{p.title}</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, fontWeight: 400 }}>{p.subtitle}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── AI COMPARISON BLOCK ────────────────────────────────────────────────── */

function ComparisonBlock() {
  const rows = [
    { area: "Erklärung", without: "Manuell, zeitintensiv", with: "AI erklärt 24/7" },
    { area: "Begleitung", without: "Abhängig vom Leader", with: "Strukturiert & skaliert" },
    { area: "Duplikation", without: "Langsam & fehleranfällig", with: "Sauber replizierbar" },
  ];
  return (
    <div className="mt-5 rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="grid grid-cols-3">
        <div style={{ background: "rgba(255,255,255,0.04)", padding: "8px 12px", fontSize: "10px", color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Bereich</div>
        <div style={{ background: "rgba(255,80,80,0.06)", padding: "8px 12px", fontSize: "10px", color: "rgba(255,120,120,0.6)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>Ohne AI</div>
        <div style={{ background: "rgba(255,215,0,0.06)", padding: "8px 12px", fontSize: "10px", color: "rgba(255,215,0,0.7)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>Mit AI</div>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ padding: "10px 12px", fontSize: "12px", color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.02)" }}>{r.area}</div>
          <div style={{ padding: "10px 12px", fontSize: "11px", color: "rgba(255,120,120,0.7)", borderLeft: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,60,60,0.03)" }}>{r.without}</div>
          <div style={{ padding: "10px 12px", fontSize: "11px", color: "rgba(255,215,0,0.75)", borderLeft: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,215,0,0.03)" }}>{r.with}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── ECOSYSTEM NODE MAP ─────────────────────────────────────────────────── */

function EcosystemNodeMap({ nodes }: { nodes: EcosystemNode[] }) {
  const [active, setActive] = useState<string | null>(null);
  const r = 115;

  return (
    <div className="relative flex flex-col items-center mt-4">
      <div className="relative" style={{ width: 300, height: 300 }}>
        {/* Connection lines */}
        <svg className="absolute inset-0" width={300} height={300} viewBox="0 0 300 300">
          {nodes.map((n) => {
            const rad = (n.angle * Math.PI) / 180;
            const cx = 150 + r * Math.cos(rad);
            const cy = 150 + r * Math.sin(rad);
            return (
              <line
                key={n.id}
                x1={150} y1={150} x2={cx} y2={cy}
                stroke={active === n.id ? "rgba(255,215,0,0.4)" : "rgba(255,215,0,0.1)"}
                strokeWidth={active === n.id ? 1.5 : 1}
                style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
              />
            );
          })}
        </svg>

        {/* Center */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            width: 68, height: 68, borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,165,0,0.08))",
            border: "1.5px solid rgba(255,215,0,0.35)",
            boxShadow: "0 0 28px rgba(255,215,0,0.15)",
            top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 800, color: "#FFD700", letterSpacing: "0.05em" }}>JETUP</span>
        </div>

        {/* Nodes */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const cx = 150 + r * Math.cos(rad);
          const cy = 150 + r * Math.sin(rad);
          const isActive = active === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setActive(isActive ? null : n.id)}
              className="absolute flex items-center justify-center transition-all duration-300"
              style={{
                width: 56, height: 56,
                borderRadius: "50%",
                background: isActive ? "rgba(255,215,0,0.12)" : "rgba(20,15,40,0.9)",
                border: isActive ? "1.5px solid rgba(255,215,0,0.5)" : "1px solid rgba(255,215,0,0.2)",
                boxShadow: isActive ? "0 0 20px rgba(255,215,0,0.2)" : "0 4px 16px rgba(0,0,0,0.4)",
                top: cy - 28, left: cx - 28,
                transform: isActive ? "scale(1.12)" : "scale(1)",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
                zIndex: 10,
                padding: 0,
              }}
            >
              <span style={{ fontSize: "8.5px", fontWeight: 600, color: isActive ? "#FFD700" : "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.3, padding: "0 4px" }}>
                {n.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info card for active node */}
      {active && (() => {
        const node = nodes.find((n) => n.id === active)!;
        return (
          <div
            className="animate-card-in mt-3 w-full max-w-sm"
            style={{
              background: "rgba(12,8,28,0.95)",
              border: "1px solid rgba(255,215,0,0.18)",
              borderRadius: "14px",
              padding: "14px 16px",
              backdropFilter: "blur(20px)",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#FFD700", marginBottom: 6 }}>{node.label}</div>
            <div style={{ fontSize: "11.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontWeight: 400 }}>{node.text}</div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── FINAL CTA ──────────────────────────────────────────────────────────── */

function FinalCTA({ onReplay }: { onReplay: () => void }) {
  const ctaLinks = [
    { label: "Zum IB Portal", primary: true },
    { label: "Digital Hub öffnen", primary: false },
    { label: "Mit Maria sprechen", primary: false },
    { label: "Ökosystem ansehen", primary: false },
  ];
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-card-in px-6"
      style={{ background: "rgba(4,2,16,0.88)", backdropFilter: "blur(16px)" }}
    >
      <div
        style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center", ...gold.textStyle }}
      >
        JetUP
      </div>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px", marginBottom: 36, textAlign: "center" }}>
        Produkt, Partnerlogik, AI und Infrastruktur — in einem System.
      </p>
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {ctaLinks.map((c, i) => (
          <button
            key={i}
            className="w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
            style={
              c.primary
                ? { background: gold.gradient, color: "#000", boxShadow: gold.glow }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }
            }
          >
            {c.label}
          </button>
        ))}
      </div>
      <button
        onClick={onReplay}
        className="mt-8 text-xs transition-all duration-200 hover:text-white"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        Nochmal ansehen ↺
      </button>
    </div>
  );
}

/* ─── SCREEN HEADLINE BLOCK ──────────────────────────────────────────────── */

function ScreenContent({ screen, onNext }: { screen: Screen; onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl animate-card-in overflow-y-auto max-h-[82vh] no-scrollbar">
        <div className="rounded-3xl p-6 md:p-8" style={glass.card}>
          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(1.7rem, 4.5vw, 2.4rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginBottom: 4,
              ...gold.textStyle,
            }}
          >
            {screen.headline}
          </h2>
          {screen.subheadline && (
            <h3
              style={{
                fontSize: "clamp(1.1rem, 2.8vw, 1.5rem)",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                marginBottom: 16,
              }}
            >
              {screen.subheadline}
            </h3>
          )}

          {/* Body text */}
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, fontWeight: 400, marginBottom: 16, maxWidth: "42ch" }}>
            {screen.body}
          </p>

          {/* Pills */}
          {screen.pills && screen.pills.length > 0 && <Pills pills={screen.pills} />}

          {/* Screen-type-specific content */}
          {screen.type === "path" && screen.steps && <PathStepBlock steps={screen.steps} />}
          {screen.type === "pillars" && screen.pillars && <PillarCards pillars={screen.pillars} />}
          {screen.type === "comparison" && <ComparisonBlock />}
          {screen.type === "ecosystem" && screen.nodes && <EcosystemNodeMap nodes={screen.nodes} />}

          {/* Reveal questions */}
          {screen.reveals && screen.reveals.length > 0 && (
            <RevealPills reveals={screen.reveals} screenId={screen.id} />
          )}

          {/* Next button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onNext}
              className="px-7 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              Weiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */

export function Merged() {
  const [idx, setIdx] = useState(0);
  const [t, setT] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [finished, setFinished] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const screen = screens[idx];

  const goTo = useCallback(
    (next: number) => {
      if (next < 0 || next >= screens.length || transitioning) return;
      setTransitioning(true);
      cancelAnimationFrame(rafRef.current);
      setTimeout(() => {
        setIdx(next);
        setT(0);
        setFinished(false);
        startRef.current = performance.now();
        setTimeout(() => setTransitioning(false), 100);
      }, 550);
    },
    [transitioning]
  );

  const handleNext = useCallback(() => {
    if (idx < screens.length - 1) goTo(idx + 1);
    else setFinished(true);
  }, [idx, goTo]);

  /* Auto-advance intro screens */
  useEffect(() => {
    if (screen.type !== "intro" || !screen.duration) return;
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= screen.duration!) {
        handleNext();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen.id, screen.type, screen.duration, handleNext]);

  const handleReplay = () => {
    setTransitioning(true);
    cancelAnimationFrame(rafRef.current);
    setTimeout(() => {
      setIdx(0);
      setT(0);
      setFinished(false);
      startRef.current = performance.now();
      setTimeout(() => setTransitioning(false), 100);
    }, 550);
  };

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      style={{ fontFamily: "'Montserrat', 'Inter', sans-serif" }}
    >
      <style>{`
        @keyframes subtitleIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .animate-subtitle-in { animation: subtitleIn 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.95) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0);       }
        }
        .animate-card-in { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }

        @keyframes blockExpand {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 300px; }
        }
        .animate-block-expand { animation: blockExpand 0.35s ease-out forwards; overflow: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── Video BG ── */}
      <video
        src="/videos/city_night_panorama.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(0.45) brightness(0.4)" }}
        autoPlay muted loop playsInline preload="auto"
      />

      {/* ── Gradient overlays ── */}
      <div
        className="absolute inset-0 transition-all duration-600 pointer-events-none"
        style={{ backgroundColor: screen.overlay || "rgba(0,0,0,0.5)" }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 65%, rgba(0,0,0,0.75) 100%)" }}
      />

      {/* ── Content ── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {screen.type === "intro" && (
          <Subtitles subtitles={screen.subtitles} t={t} />
        )}
        {screen.type !== "intro" && (
          <ScreenContent key={screen.id} screen={screen} onNext={handleNext} />
        )}
      </div>

      {/* ── Timeline ── */}
      <Timeline currentIndex={idx} onSelect={goTo} />

      {/* ── Finished overlay ── */}
      {finished && <FinalCTA onReplay={handleReplay} />}
    </div>
  );
}
