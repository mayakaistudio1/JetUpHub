import { useState } from "react";

const ACCENT = "#7c3aed";
const ACCENT_DARK = "#5b21b6";

function PillButton({ children, primary, icon }: { children: React.ReactNode; primary?: boolean; icon?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: primary ? "17px 36px" : "16px 32px",
        background: primary ? (hov ? ACCENT_DARK : ACCENT) : hov ? "#f3f4f6" : "#fff",
        color: primary ? "#fff" : "#374151",
        border: primary ? "none" : "2px solid #d1d5db",
        borderRadius: 100,
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
        display: "flex",
        alignItems: "center",
        gap: 8,
        transition: "all 0.15s ease",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: primary && hov ? `0 8px 24px ${ACCENT}50` : "none",
      }}
    >
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      {children}
    </button>
  );
}

function AffordantCard({ icon, title, desc, cta }: { icon: string; title: string; desc: string; cta: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        border: `2px solid ${hov ? ACCENT : "#e5e7eb"}`,
        borderRadius: 16,
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.18s ease",
        transform: hov ? "translateY(-4px)" : "none",
        boxShadow: hov ? `0 12px 36px ${ACCENT}20` : "0 1px 4px rgba(0,0,0,0.06)",
        position: "relative" as const,
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, color: ACCENT, fontSize: 13, fontWeight: 600 }}>
        {cta}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hov && (
        <div style={{ position: "absolute", top: 12, right: 14, width: 8, height: 8, borderRadius: "50%", background: ACCENT }} />
      )}
    </div>
  );
}

export function Interaction() {
  const [activeMode, setActiveMode] = useState<"chat" | "voice" | "avatar">("chat");

  return (
    <div style={{ background: "#f9fafb", fontFamily: "'Montserrat', system-ui, sans-serif", color: "#111", minHeight: "100vh", overflowX: "hidden" }}>

      {/* STICKY TOP CTA BAR */}
      <div style={{ background: ACCENT, padding: "10px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#e9d5ff", fontWeight: 500 }}>
          Bewerbe dich jetzt — kostenlos und unverbindlich
        </span>
        <button style={{ padding: "7px 20px", background: "#fff", color: ACCENT, border: "none", borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Jetzt starten →
        </button>
      </div>

      {/* HEADER */}
      <header style={{ borderBottom: "2px solid #e5e7eb", padding: "18px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>J</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#111", letterSpacing: "-0.02em" }}>JETUP</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ padding: "9px 20px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 100, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Präsentation
          </button>
          <button style={{ padding: "10px 22px", background: ACCENT, color: "#fff", border: "none", borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Bewerbung ↓
          </button>
        </div>
      </header>

      {/* HERO — high affordance */}
      <section style={{ padding: "72px 48px 64px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "start" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 100, marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#15803d" }}>System aktiv</span>
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5.5vw, 64px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#111", marginBottom: 20 }}>
              Dein Einstieg ins<br />
              <span style={{ color: ACCENT }}>JetUP System</span>
            </h1>
            <p style={{ fontSize: 17, color: "#4b5563", lineHeight: 1.6, fontWeight: 400, maxWidth: 480, marginBottom: 36 }}>
              Automatisierte Handelsstrategien + Partnermodell + Maria AI — jetzt kostenlos erkunden.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <PillButton primary icon="→">System erkunden</PillButton>
              <PillButton icon="▶">Demo ansehen</PillButton>
            </div>
          </div>
          {/* Affordance hint card */}
          <div style={{ background: "#fff", border: "2px solid #e9d5ff", borderRadius: 16, padding: "20px 24px", minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.15em", marginBottom: 10 }}>3 SCHRITTE</div>
            {["Bewerbung ausfüllen", "Gespräch mit Team", "System starten"].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: ACCENT, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DREI PFEILER — affordant cards */}
      <section style={{ padding: "0 48px 64px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 20 }}>
          Die drei Pfeiler — klicke um mehr zu erfahren
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <AffordantCard icon="📈" title="Trading-Infrastruktur" desc="Regulierter Zugang zu automatisierten Strategien — SONIC & NEO.FX." cta="Strategien ansehen" />
          <AffordantCard icon="🤝" title="Partnermodell" desc="Residuales Einkommen aus echtem Handelsvolumen. Kein Hype." cta="Modell erkunden" />
          <AffordantCard icon="🤖" title="KI-Infrastruktur" desc="Maria AI — deine Beraterin. Text, Sprache oder Live-Avatar." cta="Mit Maria sprechen" />
        </div>
      </section>

      {/* MARIA AI — mode selector with clear affordance */}
      <section style={{ padding: "0 48px 64px", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ background: "#fff", border: "2px solid #e5e7eb", borderRadius: 20, padding: "36px", overflow: "hidden" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>KI-BERATERIN</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111", margin: 0 }}>Sprich mit Maria — wähle deinen Weg</h2>
          </div>
          {/* Segmented mode selector */}
          <div style={{ display: "flex", gap: 0, background: "#f3f4f6", borderRadius: 12, padding: 4, marginBottom: 24, width: "fit-content" }}>
            {([
              { k: "chat", label: "💬 Text-Chat" },
              { k: "voice", label: "🎙 Sprache" },
              { k: "avatar", label: "🎭 Live Avatar" },
            ] as const).map(m => (
              <button key={m.k} onClick={() => setActiveMode(m.k)} style={{
                padding: "9px 20px",
                background: activeMode === m.k ? "#fff" : "transparent",
                color: activeMode === m.k ? ACCENT : "#6b7280",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: activeMode === m.k ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
                boxShadow: activeMode === m.k ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
              }}>
                {m.label}
              </button>
            ))}
          </div>
          {/* Active mode content */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: "20px 20px", border: "1px solid #e5e7eb" }}>
            {activeMode === "chat" && (
              <div>
                <div style={{ background: "#ede9fe", borderRadius: "12px 12px 12px 4px", padding: "12px 16px", maxWidth: 420, marginBottom: 16 }}>
                  <span style={{ fontSize: 14, color: "#374151", lineHeight: 1.55 }}>
                    Was interessiert dich mehr — passives Einkommen aufbauen oder ein Team führen?
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Schreib deine Antwort…" style={{ flex: 1, padding: "10px 14px", background: "#fff", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", color: "#111" }} />
                  <button style={{ padding: "10px 20px", background: ACCENT, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Senden →</button>
                </div>
              </div>
            )}
            {activeMode === "voice" && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: ACCENT, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28 }}>🎙</span>
                </div>
                <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>Drücke und halte den Button, um mit Maria zu sprechen</p>
                <button style={{ padding: "12px 32px", background: ACCENT, color: "#fff", border: "none", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  🎙 Gedrückt halten zum Sprechen
                </button>
              </div>
            )}
            {activeMode === "avatar" && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 36 }}>🎭</span>
                </div>
                <p style={{ fontSize: 14, color: "#374151", fontWeight: 500, marginBottom: 8 }}>Live Avatar bereit</p>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Echtzeit-Gespräch mit Maria als Live-Avatar — persönlich und interaktiv.</p>
                <button style={{ padding: "13px 36px", background: ACCENT, color: "#fff", border: "none", borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  🎭 Avatar starten
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* USABILITY NOTE */}
      <div style={{ background: "#f5f3ff", borderTop: `2px solid ${ACCENT}`, padding: "20px 48px" }}>
        <p style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          VARIANTE B — Interaktion & Affordanz: Sticky-Bar · Segmented-Control · Hover-States · Schritt-Indikator · Prescriptive CTAs
        </p>
      </div>
    </div>
  );
}
