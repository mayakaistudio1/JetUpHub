import './_group.css';
import React, { useState, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   ENHANCED — Interaktive Sofia-Präsentation
   Bestehende /explore-Struktur (mobile-first, Pfadwahl Kunde/Partner, Sofia-Overlay)
   + verstärkter Inhalt aus dem Figma-Standalone-Deck DE
   (Hook, Sonic AI 85% / +41%, CopyX, 24× Amplify, Partner-Weg $100→Skalierung,
   Drei-Säulen Produkt+Leader+System).
═══════════════════════════════════════════════════════════════════════════ */

type ScreenId =
  | "cinema"
  | "path"
  | "c1" | "c2" | "c3" | "c4" | "c5" | "c6"
  | "p1" | "p2" | "p3" | "p4" | "p5"
  | "final";

type Path = "client" | "partner" | null;

const NEXT_MAP: Partial<Record<ScreenId, ScreenId>> = {
  cinema: "path",
  c1: "c2", c2: "c3", c3: "c4", c4: "c5", c5: "c6", c6: "final",
  p1: "p2", p2: "p3", p3: "p4", p4: "p5", p5: "final",
};

const PREV_MAP: Partial<Record<ScreenId, ScreenId>> = {
  path: "cinema",
  c1: "path", c2: "c1", c3: "c2", c4: "c3", c5: "c4", c6: "c5",
  p1: "path", p2: "p1", p3: "p2", p4: "p3", p5: "p4",
};

const PATH_PROGRESS: Record<string, number> = {
  c1: 1, c2: 2, c3: 3, c4: 4, c5: 5, c6: 6,
  p1: 1, p2: 2, p3: 3, p4: 4, p5: 5,
};

/* ═══════════════════════════════════════════════════════════════════════════
   BRAND
═══════════════════════════════════════════════════════════════════════════ */

const VIOLET = "#7C3AED";
const MAGENTA = "#E879F9";
const BG = "#060A14";
const BRAND_GRAD = `linear-gradient(135deg, ${VIOLET} 0%, ${MAGENTA} 100%)`;

function Brand({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ background: BRAND_GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...style }}>
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(232,121,249,0.6)", marginBottom: "1.6rem", animation: "fadeUp 0.5s ease-out 0.05s both" }}>
      {children}
    </p>
  );
}

/* Word-by-word reveal mit blur — kinematografische Animation für die ersten Screens */
function WordsReveal({
  text, baseDelay = 0, perWord = 0.09, brand = false, style,
}: { text: string; baseDelay?: number; perWord?: number; brand?: boolean; style?: React.CSSProperties }) {
  const words = text.split(" ");
  return (
    <span style={{ display: "inline-block", ...style }}>
      {words.map((w, i) => {
        const inner = (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: "0.28em",
              animation: `wordIn 0.7s cubic-bezier(0.16,1,0.3,1) ${baseDelay + i * perWord}s both`,
              background: brand ? BRAND_GRAD : "none",
              WebkitBackgroundClip: brand ? "text" : undefined,
              WebkitTextFillColor: brand ? "transparent" : undefined,
              filter: brand ? `drop-shadow(0 0 24px ${MAGENTA}55)` : undefined,
            }}
          >{w}</span>
        );
        return inner;
      })}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS DOTS
═══════════════════════════════════════════════════════════════════════════ */

function PathProgress({ current, path }: { current: ScreenId; path: Path }) {
  const step = PATH_PROGRESS[current];
  if (!step || !path) return null;
  return (
    <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 40 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} style={{
          width: n === step ? 20 : 6, height: 6, borderRadius: 99,
          background: n === step ? MAGENTA : "rgba(255,255,255,0.12)",
          transition: "all 0.4s ease",
          boxShadow: n === step ? `0 0 10px ${MAGENTA}80` : "none",
        }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TOP PROGRESS BAR
═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ screen, path }: { screen: ScreenId; path: Path }) {
  const introIds: ScreenId[] = ["cinema", "path"];
  const clientIds: ScreenId[] = ["c1", "c2", "c3", "c4", "c5"];
  const partnerIds: ScreenId[] = ["p1", "p2", "p3", "p4", "p5"];
  let w = 0;
  if (introIds.includes(screen)) w = ((introIds.indexOf(screen) + 1) / introIds.length) * 30;
  else if (path === "client" && clientIds.includes(screen)) w = 30 + ((clientIds.indexOf(screen) + 1) / 5) * 65;
  else if (path === "partner" && partnerIds.includes(screen)) w = 30 + ((partnerIds.indexOf(screen) + 1) / 5) * 65;
  else if (screen === "final") w = 100;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.05)", zIndex: 50 }}>
      <div style={{ height: "100%", width: `${w}%`, background: BRAND_GRAD, boxShadow: `0 0 10px ${MAGENTA}80`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PATH SWITCHER + NAV ARROWS
═══════════════════════════════════════════════════════════════════════════ */

function PathSwitcher({ path, onSwitch }: { path: Path; onSwitch: (p: "client" | "partner") => void }) {
  if (!path) return null;
  return (
    <div style={{
      position: "absolute", top: 16, right: 16, zIndex: 60, display: "flex",
      background: "rgba(8,5,24,0.7)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 999, padding: 4, backdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {(["client", "partner"] as const).map((p) => {
        const active = path === p;
        return (
          <button key={p} onClick={() => !active && onSwitch(p)}
            style={{
              background: active ? BRAND_GRAD : "transparent", border: "none", borderRadius: 999,
              padding: "9px 20px", fontSize: "12px", fontWeight: 700,
              color: active ? "#fff" : "rgba(255,255,255,0.42)",
              cursor: active ? "default" : "pointer",
              letterSpacing: "0.05em", textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow: active ? `0 0 24px ${MAGENTA}55` : "none",
            }}
          >{p === "client" ? "Kunde" : "Partner"}</button>
        );
      })}
    </div>
  );
}

function NavArrows({ screen, hasPrev, hasNext, onPrev, onNext }: {
  screen: ScreenId; hasPrev: boolean; hasNext: boolean; onPrev: () => void; onNext: () => void;
}) {
  if (screen === "path") return null;
  const btn = (active: boolean, onClick: () => void, dir: "←" | "→", side: "left" | "right") => (
    <button onClick={onClick} disabled={!active}
      style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        [side]: 20, width: 50, height: 50, borderRadius: "50%", zIndex: 50,
        backdropFilter: "blur(12px)", border: "1px solid rgba(232,121,249,0.18)",
        background: "rgba(124,58,237,0.06)", cursor: active ? "pointer" : "default",
        fontSize: 18, color: active ? MAGENTA : "rgba(255,255,255,0.1)",
        opacity: active ? 0.7 : 0.15, transition: "all 0.2s ease",
        display: "flex", alignItems: "center", justifyContent: "center",
      } as React.CSSProperties}
    >{dir}</button>
  );
  return (<>{btn(hasPrev, onPrev, "←", "left")}{btn(hasNext, onNext, "→", "right")}</>);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOFIA OVERLAY — статичный плавающий бабл (визуальный прокси)
═══════════════════════════════════════════════════════════════════════════ */

function SofiaOverlay() {
  return (
    <div style={{
      position: "absolute", bottom: 70, right: 18, zIndex: 70,
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 14px 8px 8px",
      background: "rgba(8,5,24,0.78)",
      border: "1px solid rgba(232,121,249,0.28)",
      borderRadius: 999,
      backdropFilter: "blur(20px)",
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${VIOLET}30`,
      animation: "fadeUp 0.6s ease 0.3s both",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: BRAND_GRAD,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 800, color: "#fff",
        boxShadow: `0 0 16px ${MAGENTA}66`,
      }}>S</div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>Sofia</span>
        <span style={{ fontSize: 10, color: "rgba(232,121,249,0.85)", letterSpacing: "0.04em" }}>
          <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#22ee99", marginRight: 5, boxShadow: "0 0 6px #22ee99" }} />
          Live · frag mich
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREENS — Intro
═══════════════════════════════════════════════════════════════════════════ */

function CinemaScreen({ t }: { t: number }) {
  // Hook aus dem Figma-Deck — direkter, härter
  const lines: { txt: string; brand: boolean; delay: number }[] = [
    { txt: "Wie viel verdienst du", brand: false, delay: 0.3 },
    { txt: "wirklich. Konstant?", brand: false, delay: 1.2 },
    { txt: "JetUP gibt dir die Antwort.", brand: true, delay: 3.0 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 10% 14%" }}>
      {lines.filter((l) => t >= l.delay).map((l, i) => (
        <p key={i} style={{
          fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-0.04em", marginBottom: "0.05em",
          color: l.brand ? undefined : "rgba(255,255,255,0.9)",
          textShadow: l.brand ? "none" : "0 2px 24px rgba(0,0,0,0.9)",
          animation: l.brand ? "brandPulse 3.6s ease-in-out infinite" : undefined,
        }}>
          <WordsReveal text={l.txt} brand={l.brand} perWord={0.11} />
        </p>
      ))}
    </div>
  );
}

function S1() {
  // Aus Figma Slide 3: "Das Problem liegt nicht an dir. Es liegt am Modell."
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Das eigentliche Problem</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.6rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em" }}>
        <WordsReveal text="Es liegt nicht an dir." baseDelay={0.15} perWord={0.1} />
      </h1>
      <h2 style={{ fontSize: "clamp(2.6rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2rem" }}>
        <WordsReveal text="Es liegt am Modell." baseDelay={0.85} perWord={0.1} brand />
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.36)", fontWeight: 300, lineHeight: 1.75, maxWidth: "34ch", animation: "fadeUp 0.65s ease 0.55s both" }}>
        Ein Modell, in dem alles von einer Person abhängt — skaliert nicht.<br />Es bricht immer am gleichen Punkt.
      </p>
    </div>
  );
}

function S2() {
  // Aus Figma Slide 5+7: "Dem Markt fehlt Infrastruktur."
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Was fehlt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.4rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.08em" }}>
        <WordsReveal text="Dem Markt fehlt" baseDelay={0.15} perWord={0.1} />
      </h1>
      <h2 style={{ fontSize: "clamp(2.4rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2.5rem" }}>
        <WordsReveal text="Infrastruktur." baseDelay={0.7} perWord={0.1} brand />
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.36)", fontWeight: 300, lineHeight: 1.75, maxWidth: "36ch", animation: "fadeUp 0.65s ease 0.52s both" }}>
        JetUP ist die fehlende Wachstums-Infrastruktur:<br />Produkt, Leader und System — zum ersten Mal vereint.
      </p>
    </div>
  );
}

function PathSelect({ onChoose }: { onChoose: (p: "client" | "partner") => void }) {
  const [hover, setHover] = useState<"client" | "partner" | null>(null);
  const choices: { id: "client" | "partner"; label: string; sub: string; accent: boolean }[] = [
    { id: "client", label: "Als Kunde starten", sub: "Investiere mit dem System. Ohne Trading-Wissen.", accent: false },
    { id: "partner", label: "Als Partner aufbauen", sub: "Skaliere mit Produkt, Leader und System.", accent: true },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Deine Wahl</Eyebrow>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.88)", marginBottom: "0.12em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Wie willst du
      </h1>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "3.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}>
        <Brand>JetUP nutzen?</Brand>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 560, animation: "fadeUp 0.7s ease 0.4s both" }}>
        {choices.map((c) => {
          const isHovered = hover === c.id;
          return (
            <button key={c.id} onClick={() => onChoose(c.id)}
              onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)}
              style={{
                all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "22px 0",
                borderTop: c.accent ? `1.5px solid ${MAGENTA}55` : "1px solid rgba(255,255,255,0.1)",
                borderBottom: c.accent ? `1.5px solid ${MAGENTA}55` : "1px solid rgba(255,255,255,0.1)",
                marginTop: c.accent ? -1 : 0,
                transform: isHovered ? "translateX(8px)" : "translateX(0)",
                transition: "transform 0.3s ease",
              }}>
              <div>
                <div style={{
                  fontSize: "clamp(1.3rem, 2.8vw, 2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em",
                  background: (isHovered || c.accent) ? BRAND_GRAD : "none",
                  WebkitBackgroundClip: (isHovered || c.accent) ? "text" : undefined,
                  WebkitTextFillColor: (isHovered || c.accent) ? "transparent" : undefined,
                  color: (isHovered || c.accent) ? undefined : "rgba(255,255,255,0.85)",
                  transition: "all 0.3s ease",
                }}>{c.label}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.36)", marginTop: 5 }}>{c.sub}</div>
              </div>
              <div style={{ fontSize: 22, color: isHovered ? MAGENTA : "rgba(255,255,255,0.22)", marginLeft: 20, transition: "all 0.3s ease", transform: isHovered ? "translateX(4px)" : "translateX(0)" }}>→</div>
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", marginTop: "2.5rem", letterSpacing: "0.02em", animation: "fadeUp 0.6s ease 0.65s both" }}>
        Keine Entscheidung für immer. Du kannst jederzeit wechseln.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENT SCREENS — verstärkt mit Figma-Inhalten (CopyX, 24× Amplify, Sonic AI)
═══════════════════════════════════════════════════════════════════════════ */

const CLIENT_SCREENS: Record<string, React.ReactElement> = {
  c1: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 1 / 6</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du willst starten —
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Brand>ohne Trading-Wissen.</Brand>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.36)", fontWeight: 300, lineHeight: 1.85, maxWidth: "34ch", animation: "fadeUp 0.65s ease 0.5s both" }}>
        Genau dafür wurde JetUP gebaut.<br />Du musst nichts können — du musst nur starten.
      </p>
    </div>
  ),

  c2: (
    // CopyX 3 шага из Figma
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 2 / 6 · CopyX</Eyebrow>
      <div style={{ fontSize: "clamp(4rem, 13vw, 10rem)", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.05em", color: "rgba(255,255,255,0.94)", animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both", marginBottom: "0.4rem" }}>
        Copy<Brand>X</Brand>
      </div>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.5)", fontWeight: 400, marginBottom: "2rem", animation: "fadeUp 0.65s ease 0.3s both" }}>
        50+ professionelle Strategien. In drei Schritten.
      </p>
      <div style={{ display: "flex", gap: 18, animation: "fadeUp 0.65s ease 0.45s both", flexWrap: "wrap" }}>
        {[
          { n: "1", title: "Wählen", sub: "Strategie aus geprüfter Liste" },
          { n: "2", title: "Verbinden", sub: "Mit eigenem TAG Markets-Konto" },
          { n: "3", title: "Erhalten", sub: "Trades laufen automatisch" },
        ].map((s) => (
          <div key={s.n} style={{ flex: "1 1 140px", minWidth: 140 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MAGENTA, letterSpacing: "0.16em", marginBottom: 8 }}>SCHRITT {s.n}</div>
            <div style={{ fontSize: "clamp(1.05rem, 1.9vw, 1.3rem)", fontWeight: 800, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  // NEW · c3 — Trust / Sicherheit · KERN-Botschaft: dein Geld bleibt auf deinem Konto
  c3: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 3 / 6 · Sicherheit</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.4rem, 6.8vw, 6.2rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.06em" }}>
        <WordsReveal text="Dein Geld bleibt" baseDelay={0.15} perWord={0.09} />
      </h1>
      <h2 style={{ fontSize: "clamp(2.4rem, 6.8vw, 6.2rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2rem" }}>
        <WordsReveal text="auf deinem Konto." baseDelay={0.7} perWord={0.09} brand />
      </h2>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 18, animation: "fadeUp 0.7s ease 1.4s both", marginBottom: "1.4rem", maxWidth: 760,
      }}>
        {[
          { t: "Eigenes TAG-Markets-Konto", s: "Auf deinen Namen, von dir eröffnet." },
          { t: "Nur du hast Zugriff", s: "Niemand sonst kann darauf zugreifen." },
          { t: "Auszahlung jederzeit", s: "Ohne Sperrfristen, ohne Wartezeit." },
          { t: "Regulierter Broker", s: "TAG Markets — vollständig reguliert." },
        ].map((b) => (
          <div key={b.t} style={{
            padding: "14px 16px",
            borderLeft: `2px solid ${MAGENTA}`,
            background: "rgba(124,58,237,0.06)",
          }}>
            <div style={{ fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)", fontWeight: 700, color: "rgba(255,255,255,0.92)", marginBottom: 4 }}>{b.t}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{b.s}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", animation: "fadeUp 0.6s ease 1.7s both" }}>
        JetUP gibt dir das System — das Geld gehört immer dir.
      </p>
    </div>
  ),

  // 24× Amplify aus Figma — neu c4
  c4: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 4 / 6 · Amplify</Eyebrow>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25em", animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both", marginBottom: "0.6rem" }}>
        <span style={{ fontSize: "clamp(5rem, 16vw, 13rem)", fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.05em" }}>
          <Brand>24×</Brand>
        </span>
        <span style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)", fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.01em" }}>Hebelwirkung</span>
      </div>
      <p style={{ fontSize: "clamp(1rem, 1.7vw, 1.25rem)", color: "rgba(255,255,255,0.55)", fontWeight: 400, marginBottom: "1.8rem", maxWidth: "36ch", lineHeight: 1.6, animation: "fadeUp 0.65s ease 0.3s both" }}>
        Aus <Brand>$1.000</Brand> wird Handelsvolumen von <Brand>$24.000</Brand>.<br />Funktioniert ohne Trading-Erfahrung.
      </p>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
        {["Reguliert", "Eigenes Konto", "Volle Kontrolle"].map((t) => (
          <div key={t} style={{
            padding: "8px 16px", borderRadius: 999,
            border: `1px solid ${VIOLET}40`, background: `${VIOLET}10`,
            fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600,
          }}>{t}</div>
        ))}
      </div>
    </div>
  ),

  c5: (
    // Sonic AI Performance: 85% / +41% / Myfxbook LIVE — aus Figma
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 5 / 6 · Sonic AI</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.4rem, 6.5vw, 6rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "1.8rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        <Brand>Sonic AI</Brand> Performance.
      </h1>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", animation: "fadeUp 0.7s ease 0.4s both", marginBottom: "1.5rem" }}>
        {[
          { v: "85%", l: "Trefferquote" },
          { v: "+41%", l: "Jahresperformance" },
          { v: "LIVE", l: "Auf Myfxbook verifiziert" },
        ].map((m) => (
          <div key={m.l} style={{ borderTop: `1.5px solid ${MAGENTA}50`, paddingTop: 12, minWidth: 130 }}>
            <div style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
              <Brand>{m.v}</Brand>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 500 }}>{m.l}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", lineHeight: 1.6, maxWidth: "44ch", animation: "fadeUp 0.6s ease 0.6s both" }}>
        Keine Versprechen. Öffentlich nachprüfbar. Vergangene Performance ist keine Garantie.
      </p>
    </div>
  ),

  c6: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Kunden · 6 / 6 · Dein nächster Schritt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Start ab <Brand>$100</Brand>.
      </h1>
      <h2 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "1.2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Brand>Ohne Druck.</Brand>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.4)", fontWeight: 300, marginBottom: "2rem", lineHeight: 1.75, animation: "fadeUp 0.6s ease 0.4s both", maxWidth: "38ch" }}>
        Kein Vertrag. Keine Entscheidung für immer.<br />Du startest, wann du willst — Geld bleibt auf deinem Konto.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, animation: "fadeUp 0.65s ease 0.52s both" }}>
        <button style={{
          background: BRAND_GRAD, border: "none", borderRadius: 999,
          padding: "18px 36px", fontSize: 15, fontWeight: 800, color: "#fff",
          cursor: "pointer", letterSpacing: "0.01em",
          boxShadow: `0 0 48px ${MAGENTA}55, 0 4px 20px rgba(0,0,0,0.4)`,
        }}>Jetzt im System ansehen →</button>
        <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "16px 32px", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
          Digital Hub öffnen
        </button>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", paddingLeft: 4, lineHeight: 1.6 }}>
          Frag Sofia jederzeit — sie ist während der gesamten Tour da.
        </p>
      </div>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   PARTNER SCREENS — verstärkt: Drei Säulen, Income, Partner-Weg $100→Skalierung
═══════════════════════════════════════════════════════════════════════════ */

const PARTNER_SCREENS: Record<string, React.ReactElement> = {
  p1: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 1</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Du musst nicht
      </h1>
      <h2 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
        <Brand>alles selbst erklären.</Brand>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.36)", fontWeight: 300, lineHeight: 1.85, maxWidth: "36ch", animation: "fadeUp 0.65s ease 0.5s both" }}>
        Sofia, das System und die Tools übernehmen die Arbeit.<br />Du führst — sie konvertieren.
      </p>
    </div>
  ),

  p2: (
    // Drei Säulen aus Figma Slide 6+7
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 2 · Drei Säulen</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.2rem, 5.8vw, 5.2rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.4rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Produkt. Leader. System.
      </h1>
      <p style={{ fontSize: "clamp(1rem, 1.7vw, 1.2rem)", color: "rgba(255,255,255,0.55)", marginBottom: "2rem", animation: "fadeUp 0.65s ease 0.3s both" }}>
        Zum ersten Mal <Brand>vereint</Brand>.
      </p>
      <div style={{ display: "flex", gap: 18, animation: "fadeUp 0.65s ease 0.5s both", flexWrap: "wrap" }}>
        {[
          { t: "Produkt", d: "CopyX, Sonic AI, 24× Amplify — was wirklich funktioniert" },
          { t: "Leader", d: "Erfahrene Partner, die mit dir bauen — nicht über dich" },
          { t: "System", d: "Sofia + JetUP-Tools übernehmen Konversion und Onboarding" },
        ].map((p) => (
          <div key={p.t} style={{ flex: "1 1 180px", minWidth: 180, borderTop: `1.5px solid ${MAGENTA}45`, paddingTop: 12 }}>
            <div style={{ fontSize: "clamp(1.1rem, 2vw, 1.4rem)", fontWeight: 800, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em", marginBottom: 6 }}>
              <Brand>{p.t}</Brand>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.5 }}>{p.d}</div>
          </div>
        ))}
      </div>
    </div>
  ),

  p3: (
    // Income breakdown — bestehende Struktur, verstärkter Wortlaut
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 3 · Einkommen</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.4rem, 6.5vw, 6rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "1.8rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Vier Einkommens-<Brand>quellen</Brand>.
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.7s ease 0.4s both", maxWidth: 540 }}>
        {[
          { t: "Lot Commission", d: "Pro gehandeltem Volumen deiner Kunden" },
          { t: "Profit Share", d: "Anteil am Gewinn der Sonic-AI-Strategien" },
          { t: "Infinity Bonus", d: "Tiefenbonus aus dem gesamten Team" },
          { t: "Global Pool", d: "Anteil am unternehmensweiten Umsatz-Pool" },
        ].map((i, idx) => (
          <div key={i.t} style={{ display: "flex", alignItems: "baseline", gap: 16, paddingBottom: 8, borderBottom: idx < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MAGENTA, letterSpacing: "0.16em", minWidth: 24 }}>0{idx + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{i.t}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{i.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  p4: (
    // Partner-Weg $100 → Skalierung aus Figma Slide 10
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Für den Partner · 4 · Der Weg</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.2rem, 5.8vw, 5.2rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "1.6rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        Vom <Brand>Start</Brand> zur Skalierung.
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.65s ease 0.4s both", maxWidth: 540 }}>
        {[
          { n: "1", t: "Start ab $100", d: "Du startest selbst — verstehst das Produkt" },
          { n: "2", t: "Erste Partner", d: "Du teilst, was funktioniert. Sofia konvertiert" },
          { n: "3", t: "Team wächst", d: "System und Tools übernehmen Onboarding" },
          { n: "4", t: "Skalierung", d: "Einkommen läuft, auch wenn du nicht arbeitest" },
        ].map((s, idx) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: idx === 3 ? BRAND_GRAD : "rgba(255,255,255,0.06)",
              border: idx === 3 ? "none" : "1px solid rgba(232,121,249,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: idx === 3 ? "#fff" : MAGENTA,
              flexShrink: 0,
              boxShadow: idx === 3 ? `0 0 18px ${MAGENTA}55` : "none",
            }}>{s.n}</div>
            <div>
              <div style={{ fontSize: "clamp(1rem, 1.7vw, 1.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.92)" }}>{s.t}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),

  p5: (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Dein nächster Schritt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Bau dein
      </h1>
      <h2 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "1.4rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Brand>System auf.</Brand>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.36)", fontWeight: 300, marginBottom: "2.5rem", lineHeight: 1.75, animation: "fadeUp 0.6s ease 0.4s both", maxWidth: "36ch" }}>
        Im IB Portal siehst du alles:<br />Kommissionen, Team, Tools, Sofia-Setup.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360, animation: "fadeUp 0.65s ease 0.52s both" }}>
        <button style={{
          background: BRAND_GRAD, border: "none", borderRadius: 999,
          padding: "18px 36px", fontSize: 15, fontWeight: 800, color: "#fff",
          cursor: "pointer", letterSpacing: "0.01em",
          boxShadow: `0 0 48px ${MAGENTA}55, 0 4px 20px rgba(0,0,0,0.4)`,
        }}>IB Portal öffnen →</button>
        <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "16px 32px", fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>
          Mit deinem Einlader sprechen
        </button>
      </div>
    </div>
  ),
};

/* ═══════════════════════════════════════════════════════════════════════════
   FINAL
═══════════════════════════════════════════════════════════════════════════ */

function FinalScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>Der nächste Schritt</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.92)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        Ist einfach.
      </h1>
      <h2 style={{ fontSize: "clamp(2.6rem, 7vw, 6.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "1.6rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}>
        <Brand>Frag deinen Einlader.</Brand>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.4)", fontWeight: 300, lineHeight: 1.75, maxWidth: "38ch", animation: "fadeUp 0.6s ease 0.4s both" }}>
        Die Person, die dich eingeladen hat, kennt das System.<br />Sie zeigt dir den ersten Schritt — persönlich.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN — ENHANCED
═══════════════════════════════════════════════════════════════════════════ */

export function Enhanced() {
  const [screen, setScreen] = useState<ScreenId>("cinema");
  const [path, setPath] = useState<Path>(null);
  const [t, setT] = useState(0);
  const cinemaTimer = useRef<number | null>(null);

  // Cinema auto-advance
  useEffect(() => {
    if (screen !== "cinema") return;
    setT(0);
    const start = Date.now();
    const id = window.setInterval(() => setT((Date.now() - start) / 1000), 50);
    cinemaTimer.current = window.setTimeout(() => setScreen("path"), 6800);
    return () => {
      window.clearInterval(id);
      if (cinemaTimer.current) window.clearTimeout(cinemaTimer.current);
    };
  }, [screen]);

  const goNext = useCallback(() => {
    const next = NEXT_MAP[screen];
    if (next) setScreen(next);
  }, [screen]);

  const goPrev = useCallback(() => {
    const prev = PREV_MAP[screen];
    if (prev) setScreen(prev);
  }, [screen]);

  const choosePath = useCallback((p: "client" | "partner") => {
    setPath(p);
    setScreen(p === "client" ? "c1" : "p1");
  }, []);

  const switchPath = useCallback((p: "client" | "partner") => {
    setPath(p);
    setScreen(p === "client" ? "c1" : "p1");
  }, []);

  const renderScreen = () => {
    if (screen === "cinema") return <CinemaScreen t={t} />;
    if (screen === "path") return <PathSelect onChoose={choosePath} />;
    if (screen.startsWith("c")) return CLIENT_SCREENS[screen];
    if (screen.startsWith("p")) return PARTNER_SCREENS[screen];
    if (screen === "final") return <FinalScreen />;
    return null;
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: BG, color: "#fff",
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      overflow: "hidden",
    }}>
      {/* Cinematic city backdrop — looping panorama, very subtle so text stays primary */}
      <video
        src="/videos/city_night_panorama.mp4"
        autoPlay muted loop playsInline
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.45,
          filter: "saturate(0.85) contrast(1.05)",
          zIndex: 0,
        }}
      />
      {/* Brand color wash on top of video */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 18% 22%, ${VIOLET}55, transparent 55%), radial-gradient(circle at 82% 78%, ${MAGENTA}35, transparent 50%), linear-gradient(180deg, rgba(6,10,20,0.55) 0%, rgba(6,10,20,0.78) 100%)`,
        pointerEvents: "none", zIndex: 1,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.6) 100%)",
        pointerEvents: "none", zIndex: 2,
      }} />

      <TopBar screen={screen} path={path} />
      <PathSwitcher path={path} onSwitch={switchPath} />

      <div key={screen + (path || "")} style={{ position: "absolute", inset: 0 }}>
        {renderScreen()}
      </div>

      <NavArrows
        screen={screen}
        hasPrev={!!PREV_MAP[screen]}
        hasNext={!!NEXT_MAP[screen]}
        onPrev={goPrev} onNext={goNext}
      />

      <PathProgress current={screen} path={path} />
      <SofiaOverlay />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wordIn {
          0%   { opacity: 0; transform: translateY(22px); filter: blur(10px); }
          60%  { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes brandPulse {
          0%, 100% { filter: drop-shadow(0 0 24px ${MAGENTA}55); }
          50%      { filter: drop-shadow(0 0 48px ${MAGENTA}80); }
        }
      `}</style>
    </div>
  );
}

// helper that returns null but forces React diff key reset on screen change
function key(_: ScreenId) { return null; }
