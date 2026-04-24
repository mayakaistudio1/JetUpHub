import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { VariantB } from "./VariantB";
import { VariantC } from "./VariantC";
import { VariantE } from "./VariantE";
import { VariantInlinePlayer } from "./VariantInlinePlayer";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const PAGE_BG = "#06060C";
const CARD_BG = "#0E0E18";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#F5F5FA";
const TEXT_SEC = "rgba(245,245,250,0.65)";
const TEXT_MUTED = "rgba(245,245,250,0.4)";

type Mode = "desktop" | "mobile";

const VARIANTS = [
  {
    key: "B" as const,
    title: "Variant B — Interactive Chapters",
    blurb:
      "Klassisches 2‑Spalten‑Layout: 6 anklickbare Kapitel links, eingebetteter Player rechts mit Prev/Play/Next, Progressbar und Vollbild‑Overlay.",
    pros: [
      "Vertraut — minimaler Re‑Designaufwand",
      "Player + Kapitel gleichzeitig sichtbar",
      "Auto‑Play optional, sehr direkt",
    ],
    cons: [
      "Wenig Wow‑Faktor",
      "Der Player wirkt im Vergleich zur Hero‑Sektion klein",
    ],
    Component: VariantB,
  },
  {
    key: "C" as const,
    title: "Variant C — Story Scroller",
    blurb:
      "Full‑width Story: vertikales Scroll‑Snap pro Kapitel, sticky Header, vertikale Dot‑Navigation, animierte Slide‑Visuals. Kapitel 01–10 als Geschichte.",
    pros: [
      "Maximale Immersion und Storytelling‑Wirkung",
      "Skaliert natürlich auf 10 Kapitel",
      'Fallback „In Fenster öffnen" für klassische Nutzung',
    ],
    cons: [
      "Section übernimmt die ganze Höhe — verändert /explore‑Flow",
      "Komplexer in der Wartung (Scroll‑Snap, Sticky)",
    ],
    Component: VariantC,
  },
  {
    key: "E" as const,
    title: "Variant E — Sofia‑led",
    blurb:
      'Sofia‑Avatar mit Voice‑Wave als Mittelpunkt. 6 Kapitel sind Fragen, die Sofia beantwortet. Mute/Pause/„Per Stimme unterbrechen" als Controls.',
    pros: [
      "Differenzierend — kein Konkurrenz‑Pitch hat das",
      "Bereitet Nutzer auf Sofia‑Live‑Interaktion vor",
      "Voice‑first passt zur Markenrichtung",
    ],
    cons: [
      "UI‑Gerüst — Sofia‑Runtime erst nach Auswahl",
      "Erwartungsmanagement: Voice nur in DE verfügbar",
    ],
    Component: VariantE,
  },
  {
    key: "InlinePlayer" as const,
    title: "Variant Inline Player — Player rechts",
    blurb:
      "Linke Spalte bleibt wie heute (Eyebrow, Headline, 2 Buttons «Slide» / «Interaktiv»). Rechts ersetzt ein eingebetteter 16:9-Player das Kapitel-Raster — mit Vollbild-Button und kompakter Kapitel-Leiste.",
    pros: [
      "Minimaler visueller Bruch zur aktuellen /explore",
      "Kein Pop-up — Vorschau startet sofort an Ort und Stelle",
      "Vollbild-Button für Kinoerlebnis bleibt erhalten",
    ],
    cons: [
      "Der Player ersetzt das übersichtliche Kapitel-Raster",
      "Zwei Modi (Slide/Interaktiv) müssen visuell klar getrennt bleiben",
    ],
    Component: VariantInlinePlayer,
  },
];

function ViewportToggle({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 0,
        background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`,
        borderRadius: 100, padding: 3,
      }}
    >
      {(["desktop", "mobile"] as const).map((m) => {
        const active = m === value;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            style={{
              padding: "6px 14px", borderRadius: 100, border: "none",
              background: active ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` : "transparent",
              color: active ? "#fff" : TEXT_SEC,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
              fontFamily: "inherit",
            }}
            data-testid={`viewport-${m}`}
          >
            {m === "desktop" ? <Monitor size={12} /> : <Smartphone size={12} />}
            {m === "desktop" ? "Desktop" : "Mobile"}
          </button>
        );
      })}
    </div>
  );
}

function VariantCard({
  v, index,
}: {
  v: (typeof VARIANTS)[number]; index: number;
}) {
  const [mode, setMode] = useState<Mode>("desktop");
  const desktopWidth = 1280;
  const mobileWidth = 390;
  const innerWidth = mode === "desktop" ? desktopWidth : mobileWidth;
  const innerHeight = 760;
  const cardWidth = 540;
  const scale = Math.min(1, (cardWidth - 40) / innerWidth);
  const Component = v.Component;
  const isMobileMode = mode === "mobile";

  return (
    <div
      style={{
        background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 18,
        overflow: "hidden", display: "flex", flexDirection: "column",
        width: cardWidth, flex: "0 0 auto",
      }}
      data-testid={`compare-card-${v.key}`}
    >
      {/* Header */}
      <div style={{ padding: "20px 22px 14px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.18em" }}>
              VARIANT {v.key}
            </span>
          </div>
          <ViewportToggle value={mode} onChange={setMode} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, margin: 0, lineHeight: 1.25 }}>
          {v.title}
        </h3>
        <p style={{ fontSize: 12, color: TEXT_SEC, lineHeight: 1.55, margin: "8px 0 0", fontWeight: 300 }}>
          {v.blurb}
        </p>
      </div>

      {/* Preview frame */}
      <div
        style={{
          background: "#000", borderBottom: `1px solid ${BORDER}`,
          height: 420, position: "relative", overflow: "hidden",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            width: innerWidth, height: innerHeight,
            transform: `scale(${scale})`, transformOrigin: "top center",
            border: `1px solid ${BORDER}`, borderRadius: 8,
            background: "#0A0A14", overflow: "hidden",
            boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
          }}
        >
          {/* Render the actual variant inline so it updates live.
              Pass forceMobile so mobile layouts/controls visibly switch
              even though the real window width hasn't changed. */}
          <div style={{ width: innerWidth, height: innerHeight, overflow: "auto" }}>
            <Component forceMobile={isMobileMode} />
          </div>
        </div>
        {/* Width badge */}
        <div
          style={{
            position: "absolute", left: 16, bottom: 12,
            padding: "4px 10px", borderRadius: 999,
            background: "rgba(0,0,0,0.5)", border: `1px solid ${BORDER}`,
            fontSize: 10, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.12em",
          }}
        >
          {innerWidth}px · {mode.toUpperCase()}
        </div>
      </div>

      {/* Pros / Cons */}
      <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: "0.18em", marginBottom: 8 }}>+ STÄRKEN</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: TEXT_SEC, fontSize: 12, lineHeight: 1.55 }}>
            {v.pros.map((p) => <li key={p} style={{ marginBottom: 4 }}>{p}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#f97316", letterSpacing: "0.18em", marginBottom: 8 }}>− RISIKEN</div>
          <ul style={{ margin: 0, paddingLeft: 16, color: TEXT_SEC, fontSize: 12, lineHeight: 1.55 }}>
            {v.cons.map((c) => <li key={c} style={{ marginBottom: 4 }}>{c}</li>)}
          </ul>
        </div>
      </div>

      {/* Open in new window link */}
      <div style={{ padding: "0 22px 20px" }}>
        <a
          href={`/__mockup/preview/explore-presentation-section/${
            v.key === "B"
              ? "VariantB"
              : v.key === "C"
              ? "VariantC"
              : v.key === "E"
              ? "VariantE"
              : "VariantInlinePlayer"
          }`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", textAlign: "center", padding: "10px 14px",
            borderRadius: 100, border: `1px solid ${ACCENT}55`,
            color: TEXT, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
            textDecoration: "none", background: "transparent",
          }}
          data-testid={`open-${v.key}`}
        >
          IN EIGENEM TAB ÖFFNEN →
        </a>
      </div>
    </div>
  );
}

export function Compare() {
  return (
    <div
      style={{
        background: PAGE_BG, color: TEXT,
        fontFamily: "'Montserrat', system-ui, sans-serif",
        minHeight: "100vh", padding: "40px 32px 80px",
      }}
      data-testid="compare-canvas"
    >
      <div style={{ maxWidth: 1800, margin: "0 auto" }}>
        <div style={{ marginBottom: 28, maxWidth: 720 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.25em", marginBottom: 14 }}>
            CANVAS COMPARE • TASK #157
          </div>
          <h1 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 300, letterSpacing: "-0.03em", margin: "0 0 12px", lineHeight: 1.15 }}>
            Explore Presentation — 4 Varianten im Vergleich
          </h1>
          <p style={{ fontSize: 14, color: TEXT_SEC, lineHeight: 1.6, fontWeight: 300, margin: 0 }}>
            Vier Richtungen für die Section <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>PresentationSection</code> auf <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>/explore</code>.
            Pro Karte ein Live‑Preview (Desktop/Mobile umschaltbar) plus Stärken & Risiken.
            Wähle einen Favoriten — wir „graduieren" ihn anschließend in den Hauptapp.
          </p>
        </div>

        <div
          style={{
            display: "flex", gap: 24, flexWrap: "wrap",
            alignItems: "stretch",
          }}
          data-testid="compare-grid"
        >
          {VARIANTS.map((v, i) => (
            <VariantCard key={v.key} v={v} index={i} />
          ))}
        </div>

        <div
          style={{
            marginTop: 36, padding: "18px 22px", borderRadius: 14,
            background: "rgba(124,58,237,0.07)", border: `1px solid ${ACCENT}30`,
            color: TEXT_SEC, fontSize: 13, lineHeight: 1.6, fontWeight: 300,
            maxWidth: 980,
          }}
        >
          <strong style={{ color: TEXT, fontWeight: 600 }}>Hinweis:</strong> Alle vier Varianten verwenden die Produktion‑Farben (ACCENT <span style={{ color: ACCENT_LIGHT }}>#7C3AED</span>),
          das dunkle Theme und die DE‑Strings aus <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>explore.presentation.*</code>.
          Slides/Videos sind als Platzhalter gestubbt — der echte Content wird nach der Wahl angeschlossen.
        </div>
      </div>
    </div>
  );
}

export default Compare;
