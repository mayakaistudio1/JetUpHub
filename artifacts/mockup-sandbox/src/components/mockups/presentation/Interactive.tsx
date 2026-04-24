import './_group.css';
import React, { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & FLOW
═══════════════════════════════════════════════════════════════════════════ */

type ScreenId =
  | "cinema" | "s1" | "s2"
  | "path"
  | "c1" | "c2" | "c3" | "c4" | "c5"
  | "p1" | "p2" | "p3" | "p4" | "p5"
  | "final";

type Path = "client" | "partner" | null;

const NEXT_MAP: Partial<Record<ScreenId, ScreenId>> = {
  cinema: "s1", s1: "s2", s2: "path",
  c1: "c2", c2: "c3", c3: "c4", c4: "c5", c5: "final",
  p1: "p2", p2: "p3", p3: "p4", p4: "p5", p5: "final",
};

const PREV_MAP: Partial<Record<ScreenId, ScreenId>> = {
  s1: "cinema", s2: "s1", path: "s2",
  c1: "path", c2: "c1", c3: "c2", c4: "c3", c5: "c4",
  p1: "path", p2: "p1", p3: "p2", p4: "p3", p5: "p4",
};

const PATH_PROGRESS: Record<string, number> = {
  c1: 1, c2: 2, c3: 3, c4: 4, c5: 5,
  p1: 1, p2: 2, p3: 3, p4: 4, p5: 5,
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════════════════════════════════ */

const GOLD = "linear-gradient(135deg, #E8C84A 0%, #F5A623 100%)";
const GOLD_SOLID = "#E8C84A";

function Gold({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ background: GOLD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...style }}>
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(232,200,74,0.55)", marginBottom: "1.6rem", animation: "fadeUp 0.5s ease-out 0.05s both" }}>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS — dot track for path screens
═══════════════════════════════════════════════════════════════════════════ */

function PathProgress({ current, path }: { current: ScreenId; path: Path }) {
  const step = PATH_PROGRESS[current];
  if (!step || !path) return null;
  return (
    <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 40 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} style={{
          width: n === step ? 20 : 6, height: 6, borderRadius: 99,
          background: n === step ? GOLD_SOLID : "rgba(255,255,255,0.12)",
          transition: "all 0.4s ease",
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOP BAR — global progress line
═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ screen, path }: { screen: ScreenId; path: Path }) {
  const introIds: ScreenId[] = ["cinema", "s1", "s2", "path"];
  const clientIds: ScreenId[] = ["c1", "c2", "c3", "c4", "c5"];
  const partnerIds: ScreenId[] = ["p1", "p2", "p3", "p4", "p5"];

  let w = 0;
  if (introIds.includes(screen)) {
    w = ((introIds.indexOf(screen) + 1) / (introIds.length)) * 30;
  } else if (path === "client" && clientIds.includes(screen)) {
    w = 30 + ((clientIds.indexOf(screen) + 1) / 5) * 65;
  } else if (path === "partner" && partnerIds.includes(screen)) {
    w = 30 + ((partnerIds.indexOf(screen) + 1) / 5) * 65;
  } else if (screen === "final") {
    w = 100;
  }

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.05)", zIndex: 50 }}>
      <div style={{ height: "100%", width: `${w}%`, background: GOLD, boxShadow: `0 0 8px ${GOLD_SOLID}55`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PATH SWITCHER — always visible once path is chosen
═══════════════════════════════════════════════════════════════════════════ */

function PathSwitcher({ path, onSwitch }: { path: Path; onSwitch: (p: "client" | "partner") => void }) {
  if (!path) return null;
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, zIndex: 60,
      display: "flex", gap: 0,
      background: "rgba(8,5,24,0.7)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 999, padding: 4,
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {(["client", "partner"] as const).map((p) => {
        const active = path === p;
        return (
          <button key={p} onClick={() => !active && onSwitch(p)}
            style={{
              background: active ? GOLD : "transparent",
              border: "none", borderRadius: 999,
              padding: "9px 20px",
              fontSize: "12px", fontWeight: 700,
              color: active ? "#1a0e00" : "rgba(255,255,255,0.38)",
              cursor: active ? "default" : "pointer",
              letterSpacing: "0.05em", textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow: active ? `0 0 20px ${GOLD_SOLID}40` : "none",
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)"; }}
          >
            {p === "client" ? "Kunde" : "Partner"}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV ARROWS
═══════════════════════════════════════════════════════════════════════════ */

function NavArrows({ screen, hasPrev, hasNext, onPrev, onNext }: {
  screen: ScreenId; hasPrev: boolean; hasNext: boolean;
  onPrev: () => void; onNext: () => void;
}) {
  if (screen === "path") return null;

  const btn = (active: boolean, onClick: () => void, dir: "←" | "→", side: "left" | "right"): React.ReactElement => (
    <button onClick={onClick} disabled={!active}
      style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        [side]: 20, width: 50, height: 50, borderRadius: "50%", zIndex: 50,
        backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.03)", cursor: active ? "pointer" : "default",
        fontSize: 18, color: active ? GOLD_SOLID : "rgba(255,255,255,0.1)",
        opacity: active ? 0.6 : 0.15, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onMouseEnter={(e) => { if (active) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      onMouseLeave={(e) => { if (active) (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
    >
      {dir}
    </button>
  );

  return (
    <>
      {btn(hasPrev, onPrev, "←", "left")}
      {btn(hasNext, onNext, "→", "right")}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN 1 — CINEMA HOOK (auto 8s)
═══════════════════════════════════════════════════════════════════════════ */

function CinemaScreen({ t }: { t: number }) {
  const lines: { txt: string; gold: boolean; delay: number }[] = [
    { txt: "Die meisten Systeme", gold: false, delay: 0.4 },
    { txt: "versprechen viel.", gold: false, delay: 1.2 },
    { txt: "JetUP liefert.", gold: true, delay: 3.2 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 10% 12%" }}>
      {lines.filter((l) => t >= l.delay).map((l, i) => (
        <p key={i} style={{
          fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-0.04em", marginBottom: "0.05em",
          background: l.gold ? GOLD : "none",
          WebkitBackgroundClip: l.gold ? "text" : undefined,
          WebkitTextFillColor: l.gold ? "transparent" : undefined,
          color: l.gold ? undefined : "rgba(255,255,255,0.88)",
          textShadow: l.gold ? "none" : "0 2px 24px rgba(0,0,0,0.9)",
          filter: l.gold ? `drop-shadow(0 0 28px ${GOLD_SOLID}44)` : "none",
          animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          {l.txt}
        </p>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN 2 — STATEMENT 1
═══════════════════════════════════════════════════════════════════════════ */

function S1() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>JetUP</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Kein Angebot.
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}>
        <Gold>Ein System.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.8, maxWidth: "30ch", animation: "fadeUp 0.65s ease 0.55s both" }}>
        Produkt. Partnermodell. KI.<br />In einer Logik.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN 3 — STATEMENT 2
═══════════════════════════════════════════════════════════════════════════ */

function S2() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Dein Weg</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.08em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Eins hat sich geändert.
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}>
        <Gold>Alles greift ineinander.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.8, maxWidth: "32ch", animation: "fadeUp 0.65s ease 0.52s both" }}>
        Jeder Schritt baut auf dem nächsten auf.<br />Du startest — das System trägt weiter.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN 4 — PATH SELECTION
═══════════════════════════════════════════════════════════════════════════ */

function PathSelect({ onChoose }: { onChoose: (p: "client" | "partner") => void }) {
  const [hover, setHover] = useState<"client" | "partner" | null>(null);

  const choices: { id: "client" | "partner"; label: string; sub: string; accent: boolean }[] = [
    { id: "client", label: "Als Kunde starten", sub: "Investiere in dein Kapital. Ohne Komplexität.", accent: false },
    { id: "partner", label: "Als Partner aufbauen", sub: "Baue ein System. Nicht alleine.", accent: true },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Deine Wahl</Eyebrow>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.88)", marginBottom: "0.12em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Wie willst du
      </h1>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "3.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}>
        <Gold>JetUP nutzen?</Gold>
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 540, animation: "fadeUp 0.7s ease 0.4s both" }}>
        {choices.map((c) => {
          const isHovered = hover === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onChoose(c.id)}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                all: "unset", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "22px 0",
                borderTop: c.accent ? `1.5px solid ${GOLD_SOLID}50` : "1px solid rgba(255,255,255,0.1)",
                borderBottom: c.accent ? `1.5px solid ${GOLD_SOLID}50` : "1px solid rgba(255,255,255,0.1)",
                marginTop: c.accent ? -1 : 0,
                transform: isHovered ? "translateX(8px)" : "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            >
              <div>
                <div style={{
                  fontSize: "clamp(1.3rem, 2.8vw, 2rem)", fontWeight: 800, lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  background: isHovered || c.accent ? GOLD : "none",
                  WebkitBackgroundClip: (isHovered || c.accent) ? "text" : undefined,
                  WebkitTextFillColor: (isHovered || c.accent) ? "transparent" : undefined,
                  color: (isHovered || c.accent) ? undefined : "rgba(255,255,255,0.82)",
                  transition: "all 0.3s ease",
                }}>
                  {c.label}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: 5, fontWeight: 400 }}>
                  {c.sub}
                </div>
              </div>
              <div style={{ fontSize: 22, color: isHovered ? GOLD_SOLID : "rgba(255,255,255,0.2)", marginLeft: 20, transition: "color 0.3s ease, transform 0.3s ease", transform: isHovered ? "translateX(4px)" : "translateX(0)" }}>
                →
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.16)", marginTop: "2.5rem", letterSpacing: "0.02em", animation: "fadeUp 0.6s ease 0.65s both" }}>
        Keine Entscheidung für immer. Du kannst jederzeit zurück.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENT SCREENS
═══════════════════════════════════════════════════════════════════════════ */

const CLIENT_SCREENS: Record<string, React.ReactElement> = {
  c1: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 1</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du willst starten,
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both", marginBottom: "2rem" }}>
        <Gold>ohne alles selbst zu verstehen.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.85, animation: "fadeUp 0.65s ease 0.5s both" }}>
        Genau dafür ist JetUP gebaut worden.
      </p>
    </div>
  ),

  c2: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 2</Eyebrow>
      <div style={{ fontSize: "clamp(5rem, 16vw, 12rem)", fontWeight: 900, lineHeight: 0.88, letterSpacing: "-0.05em", color: "rgba(255,255,255,0.92)", animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both", marginBottom: "1.2rem" }}>
        Copy<Gold>X</Gold>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.65s ease 0.4s both", maxWidth: 400 }}>
        {["Professionelle Strategien.", "Automatisch. Einfach.", "Kein Trading-Wissen erforderlich."].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD_SOLID, flexShrink: 0 }} />
            <span style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  ),

  c3: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 3</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Dein Geld
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Gold>bleibt bei dir.</Gold>
      </h2>
      <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
        {[
          { label: "Eigenes Konto", sub: "Direkt bei TAG Markets" },
          { label: "Volle Kontrolle", sub: "Jederzeit Zugriff" },
          { label: "Kein Risikotransfer", sub: "Kapital bleibt geschützt" },
        ].map((f, i) => (
          <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
            <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>{f.label}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{f.sub}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  c4: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 4</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du bist
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Gold>nicht allein.</Gold>
      </h2>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
        {["System", "KI-Begleitung", "Unterstützung 24/7"].map((item, i) => (
          <div key={i} style={{
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid rgba(232,200,74,0.25)",
            background: "rgba(232,200,74,0.04)",
            fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
            color: "rgba(255,255,255,0.6)",
            fontWeight: 500,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  ),

  c5: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Dein nächster Schritt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Sieh es dir an.
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "1.2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Gold>Ohne Druck.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.32)", fontWeight: 300, marginBottom: "2.5rem", lineHeight: 1.8, animation: "fadeUp 0.6s ease 0.4s both", maxWidth: "34ch" }}>
        Kein Vertrag. Keine Entscheidung für immer.<br />Du startest, wann du willst.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 340, animation: "fadeUp 0.65s ease 0.52s both" }}>
        <button style={{
          background: GOLD, border: "none", borderRadius: 999,
          padding: "18px 36px", fontSize: "15px", fontWeight: 800,
          color: "#120900", cursor: "pointer", letterSpacing: "0.01em",
          boxShadow: `0 0 48px ${GOLD_SOLID}45, 0 4px 20px rgba(0,0,0,0.4)`,
          transform: "scale(1)", transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 64px ${GOLD_SOLID}60, 0 4px 20px rgba(0,0,0,0.4)`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 48px ${GOLD_SOLID}45, 0 4px 20px rgba(0,0,0,0.4)`; }}
        >
          Jetzt im System ansehen →
        </button>
        <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "16px 32px", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
          Digital Hub öffnen
        </button>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", paddingLeft: 4, lineHeight: 1.6 }}>
          Dort siehst du alles im Detail — in deinem eigenen Tempo.
        </p>
      </div>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   PARTNER SCREENS
═══════════════════════════════════════════════════════════════════════════ */

const PARTNER_SCREENS: Record<string, React.ReactElement> = {
  p1: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 1</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du willst nicht alles
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Gold>selbst erklären.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.85, animation: "fadeUp 0.65s ease 0.5s both" }}>
        Das System übernimmt den ersten Schritt für dich.
      </p>
    </div>
  ),

  p2: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 2</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.08em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du brauchst
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Gold>ein System.</Gold>
      </h2>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
        {["Tools", "Präsentation", "KI"].map((item, i) => (
          <div key={i} style={{
            padding: "12px 24px",
            borderRadius: 999,
            border: `1px solid rgba(232,200,74,${i === 2 ? "0.45" : "0.2"})`,
            background: i === 2 ? "rgba(232,200,74,0.08)" : "rgba(255,255,255,0.03)",
            fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
            color: i === 2 ? GOLD_SOLID : "rgba(255,255,255,0.55)",
            fontWeight: 600,
          }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  ),

  p3: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 3</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.035em", color: "rgba(255,255,255,0.88)", marginBottom: "0.08em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Mehrere Ebenen —
      </h1>
      <h2 style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.035em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Gold>aufgebaut für Wachstum.</Gold>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 480, animation: "fadeUp 0.65s ease 0.42s both" }}>
        {[
          { n: "01", label: "Lot Commission", sub: "Direkt. Ab erster Aktivität." },
          { n: "02", label: "Profit Share", sub: "Mit dem Ergebnis der Struktur." },
          { n: "03", label: "Infinity Bonus", sub: "Tiefe ohne Begrenzung." },
          { n: "04", label: "Global Pool", sub: "Gesamtumsatz der Plattform." },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(232,200,74,0.08)", border: `1px solid rgba(232,200,74,0.35)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 800, color: GOLD_SOLID,
              }}>
                {l.n}
              </div>
              {i < 3 && <div style={{ width: 1, height: 16, background: "rgba(232,200,74,0.15)" }} />}
            </div>
            <div style={{ paddingBottom: i < 3 ? 8 : 0, paddingTop: 4 }}>
              <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>{l.label}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{l.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  p4: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 4</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du skalierst
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Gold>nicht alleine.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.3)", fontWeight: 300, lineHeight: 1.85, maxWidth: "34ch", animation: "fadeUp 0.65s ease 0.5s both" }}>
        Das System arbeitet mit dir.<br />Nicht alles ist manuell.
      </p>
    </div>
  ),

  p5: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Dein nächster Schritt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Öffne das System.
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "1.2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Gold>Sieh es selbst.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.32)", fontWeight: 300, marginBottom: "2.5rem", lineHeight: 1.8, animation: "fadeUp 0.6s ease 0.4s both", maxWidth: "34ch" }}>
        Kein Vertrag. Keine Bindung.<br />Du entscheidest, ob es für dich passt.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 340, animation: "fadeUp 0.65s ease 0.52s both" }}>
        <button style={{
          background: GOLD, border: "none", borderRadius: 999,
          padding: "18px 36px", fontSize: "15px", fontWeight: 800,
          color: "#120900", cursor: "pointer", letterSpacing: "0.01em",
          boxShadow: `0 0 48px ${GOLD_SOLID}45, 0 4px 20px rgba(0,0,0,0.4)`,
          transform: "scale(1)", transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 64px ${GOLD_SOLID}60, 0 4px 20px rgba(0,0,0,0.4)`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 48px ${GOLD_SOLID}45, 0 4px 20px rgba(0,0,0,0.4)`; }}
        >
          System öffnen →
        </button>
        <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "16px 32px", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.45)", cursor: "pointer" }}>
          Einladung anfordern
        </button>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", paddingLeft: 4, lineHeight: 1.6 }}>
          Dort siehst du alle Details — in deinem eigenen Tempo.
        </p>
      </div>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   FINAL SCREEN
═══════════════════════════════════════════════════════════════════════════ */

function FinalScreen({ onReplay }: { onReplay: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Jetzt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Der nächste Schritt
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "1.4rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Gold>ist einfach.</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.32)", fontWeight: 300, marginBottom: "2.5rem", lineHeight: 1.8, animation: "fadeUp 0.6s ease 0.38s both", maxWidth: "36ch" }}>
        Kein Risiko. Kein Druck. Keine Bindung.<br />Du schaust, du entscheidest.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 360, animation: "fadeUp 0.65s ease 0.5s both" }}>
        <a href="https://jet-up.ai" target="_blank" rel="noopener noreferrer" style={{
          display: "block", textDecoration: "none",
          background: GOLD, borderRadius: 999,
          padding: "20px 40px", fontSize: "16px", fontWeight: 800,
          color: "#120900", cursor: "pointer", letterSpacing: "0.01em",
          boxShadow: `0 0 56px ${GOLD_SOLID}55, 0 6px 24px rgba(0,0,0,0.5)`,
          transform: "scale(1)", transition: "transform 0.2s ease, box-shadow 0.2s ease",
          textAlign: "left",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 72px ${GOLD_SOLID}70, 0 6px 24px rgba(0,0,0,0.5)`; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 56px ${GOLD_SOLID}55, 0 6px 24px rgba(0,0,0,0.5)`; }}
        >
          Zum Digital Hub →
        </a>
        <a href="https://www.youtube.com/@jetup" target="_blank" rel="noopener noreferrer" style={{
          display: "block", textDecoration: "none", textAlign: "left",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 999, padding: "16px 32px", fontSize: "14px", fontWeight: 500,
          color: "rgba(255,255,255,0.5)", cursor: "pointer",
          transition: "color 0.2s ease, border-color 0.2s ease",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          Auf YouTube ansehen
        </a>
        <div style={{ padding: "12px 4px", fontSize: "14px", color: "rgba(255,255,255,0.35)", fontWeight: 400, lineHeight: 1.75 }}>
          Oder frag die Person,<br />die dich eingeladen hat.
        </div>
      </div>
      <button onClick={onReplay} style={{ background: "none", border: "none", fontSize: "11px", color: "rgba(255,255,255,0.16)", cursor: "pointer", marginTop: "2.5rem", animation: "fadeUp 0.6s ease 0.7s both", textAlign: "left" }}>
        Von vorne ansehen ↺
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

export function Interactive() {
  const [screen, setScreen] = useState<ScreenId>("cinema");
  const [path, setPath] = useState<Path>(null);
  const [t, setT] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const isCinema = screen === "cinema";
  const CINEMA_DUR = 8;

  const goTo = useCallback((id: ScreenId) => {
    if (transitioning) return;
    setTransitioning(true);
    cancelAnimationFrame(rafRef.current);
    setTimeout(() => {
      setScreen(id);
      setT(0);
      startRef.current = performance.now();
      setTimeout(() => setTransitioning(false), 80);
    }, 400);
  }, [transitioning]);

  const choosePath = useCallback((p: "client" | "partner") => {
    setPath(p);
    goTo(p === "client" ? "c1" : "p1");
  }, [goTo]);

  const switchPath = useCallback((p: "client" | "partner") => {
    setPath(p);
    goTo(p === "client" ? "c1" : "p1");
  }, [goTo]);

  const nextId = NEXT_MAP[screen as ScreenId];
  const prevId = PREV_MAP[screen as ScreenId];

  const next = useCallback(() => { if (nextId) goTo(nextId); }, [goTo, nextId]);
  const prev = useCallback(() => { if (prevId) goTo(prevId); }, [goTo, prevId]);

  /* Cinema auto-advance */
  useEffect(() => {
    if (!isCinema) return;
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= CINEMA_DUR) { next(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isCinema, next]);

  /* Keyboard nav */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const renderContent = () => {
    switch (screen) {
      case "cinema": return <CinemaScreen t={t} />;
      case "s1": return <S1 />;
      case "s2": return <S2 />;
      case "path": return <PathSelect onChoose={choosePath} />;
      case "c1": return CLIENT_SCREENS.c1;
      case "c2": return CLIENT_SCREENS.c2;
      case "c3": return CLIENT_SCREENS.c3;
      case "c4": return CLIENT_SCREENS.c4;
      case "c5": return CLIENT_SCREENS.c5;
      case "p1": return PARTNER_SCREENS.p1;
      case "p2": return PARTNER_SCREENS.p2;
      case "p3": return PARTNER_SCREENS.p3;
      case "p4": return PARTNER_SCREENS.p4;
      case "p5": return PARTNER_SCREENS.p5;
      case "final": return <FinalScreen onReplay={() => goTo("cinema")} />;
      default: return null;
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#050210", fontFamily: "'Montserrat', 'Inter', sans-serif" }}>
      <style>{`
        .bg-vid { filter: saturate(0.22) brightness(0.28); }
        .vignette { background: radial-gradient(ellipse 80% 80% at 52% 50%, transparent 28%, rgba(4,2,16,0.72) 100%), linear-gradient(to bottom, rgba(4,2,16,0.52) 0%, transparent 18%, transparent 70%, rgba(4,2,16,0.9) 100%); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Video */}
      <video src="/videos/city_night_panorama.mp4" className="bg-vid" autoPlay muted loop playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Vignette */}
      <div className="vignette" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      {/* Top progress */}
      <TopBar screen={screen} path={path} />

      {/* Content */}
      <div key={screen} style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s ease", position: "absolute", inset: 0 }}>
        {renderContent()}
      </div>

      {/* Path switcher pill — always visible once path chosen */}
      <PathSwitcher path={path} onSwitch={switchPath} />

      {/* Path progress dots */}
      <PathProgress current={screen} path={path} />

      {/* Nav arrows */}
      <NavArrows
        screen={screen}
        hasPrev={!!prevId}
        hasNext={!!nextId}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}
