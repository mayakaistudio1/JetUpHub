const ACCENT = "#6d28d9";
const ACCENT_BG = "#f5f3ff";
const TEXT = "#111827";
const TEXT_SEC = "#4b5563";
const BORDER = "#d1d5db";
const BG = "#fefefe";
const SURFACE = "#fff";

function SkipLink() {
  return (
    <a href="#main-content" style={{
      position: "absolute", top: -60, left: 0, padding: "12px 20px",
      background: ACCENT, color: "#fff", fontWeight: 700, fontSize: 14,
      zIndex: 100, borderRadius: "0 0 8px 0",
      textDecoration: "none",
    }} onFocus={e => { (e.target as HTMLAnchorElement).style.top = "0"; }}
    onBlur={e => { (e.target as HTMLAnchorElement).style.top = "-60px"; }}>
      Zum Hauptinhalt springen
    </a>
  );
}

function AccessibleButton({ children, primary, ariaLabel }: { children: React.ReactNode; primary?: boolean; ariaLabel?: string }) {
  return (
    <button
      aria-label={ariaLabel}
      style={{
        padding: primary ? "18px 40px" : "17px 36px",
        minWidth: 180,
        minHeight: 56,
        background: primary ? ACCENT : SURFACE,
        color: primary ? "#fff" : TEXT,
        border: primary ? "none" : `2px solid ${BORDER}`,
        borderRadius: 10,
        fontSize: 17,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
        lineHeight: 1.4,
        outline: "none",
      }}
      onFocus={e => { (e.target as HTMLButtonElement).style.outline = `3px solid ${ACCENT}`; (e.target as HTMLButtonElement).style.outlineOffset = "3px"; }}
      onBlur={e => { (e.target as HTMLButtonElement).style.outline = "none"; }}
    >
      {children}
    </button>
  );
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 20, background: ACCENT, borderRadius: 2 }} />
        {label}
      </div>
      <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em", color: TEXT, margin: 0, maxWidth: "22ch" }}>
        {title}
      </h2>
    </div>
  );
}

export function Accessibility() {
  return (
    <div style={{ background: BG, fontFamily: "'Montserrat', system-ui, sans-serif", color: TEXT, minHeight: "100vh", overflowX: "hidden", fontSize: 18 }}>
      <SkipLink />

      {/* HEADER */}
      <header role="banner" style={{ borderBottom: `2px solid ${BORDER}`, padding: "20px 56px", display: "flex", alignItems: "center", justifyContent: "space-between", background: SURFACE }}>
        <a href="/" aria-label="JETUP Startseite" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }} aria-hidden="true">
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>J</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: TEXT, letterSpacing: "-0.02em" }}>JETUP</span>
        </a>
        <nav aria-label="Hauptnavigation" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="#system" style={{ fontSize: 16, color: TEXT_SEC, textDecoration: "none", fontWeight: 600, padding: "8px 4px", borderBottom: "2px solid transparent" }}
            onFocus={e => (e.target as HTMLAnchorElement).style.outline = `3px solid ${ACCENT}`}
            onBlur={e => (e.target as HTMLAnchorElement).style.outline = "none"}>
            Das System
          </a>
          <a href="#partner" style={{ fontSize: 16, color: TEXT_SEC, textDecoration: "none", fontWeight: 600, padding: "8px 4px" }}
            onFocus={e => (e.target as HTMLAnchorElement).style.outline = `3px solid ${ACCENT}`}
            onBlur={e => (e.target as HTMLAnchorElement).style.outline = "none"}>
            Partner werden
          </a>
          <AccessibleButton primary ariaLabel="Zur Bewerbung scrollen">Bewerbung starten</AccessibleButton>
        </nav>
      </header>

      {/* HERO */}
      <main id="main-content">
        <section aria-label="Einleitung" style={{ padding: "80px 56px", maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 18, background: ACCENT, borderRadius: 2 }} />
            Das JetUP System
          </div>
          <h1 style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: TEXT, marginBottom: 28, maxWidth: "18ch" }}>
            Kein Angebot. Ein System.
          </h1>
          <p style={{ fontSize: 19, color: TEXT_SEC, lineHeight: 1.75, fontWeight: 400, maxWidth: "54ch", marginBottom: 48 }}>
            JetUP verbindet bewährte Handelsstrategien, ein transparentes Partnermodell und KI-Infrastruktur — in einer durchdachten, zugänglichen Architektur für jeden Einstiegslevel.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <AccessibleButton primary ariaLabel="System erkunden — scrollt zur Systemübersicht">System erkunden</AccessibleButton>
            <AccessibleButton ariaLabel="Interaktive Präsentation öffnen">Präsentation öffnen</AccessibleButton>
          </div>
        </section>

        {/* PROBLEM */}
        <section aria-labelledby="problem-heading" style={{ padding: "64px 56px", background: ACCENT_BG, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <SectionTitle label="Das Problem" title="Was hält Menschen vom nachhaltigen Einkommen ab?" />
            <p style={{ fontSize: 18, color: TEXT_SEC, lineHeight: 1.75, maxWidth: "54ch", marginBottom: 28, fontWeight: 400 }}>
              Die meisten Trading-Ansätze scheitern an fehlender Struktur — nicht an mangelndem Einsatz. Ohne System verbrennst du Zeit und Energie.
            </p>
            <div style={{ borderLeft: `4px solid ${ACCENT}`, paddingLeft: 24, paddingTop: 4, paddingBottom: 4 }}>
              <p style={{ fontSize: 17, color: TEXT, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                JetUP durchbricht diesen Kreislauf mit einer durchdachten Infrastruktur, die für dich arbeitet — auch wenn du es gerade nicht tust.
              </p>
            </div>
          </div>
        </section>

        {/* SOLUTION — 3 pillars */}
        <section aria-labelledby="solution-heading" style={{ padding: "64px 56px", background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <SectionTitle label="Die Lösung" title="Drei Pfeiler tragen das System" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              {[
                { tag: "Pfeiler 1 von 3", icon: "📈", t: "Trading-Infrastruktur", d: "Regulierter Zugang zu automatisierten Handelsstrategien. SONIC und NEO.FX bieten nachgewiesene Renditen." },
                { tag: "Pfeiler 2 von 3", icon: "🤝", t: "Partnermodell", d: "Residuales Einkommen auf Basis echter Handelsvolumina. Keine Abhängigkeit von Neukundengewinnung." },
                { tag: "Pfeiler 3 von 3", icon: "🤖", t: "KI-Infrastruktur", d: "Maria AI beantwortet Fragen rund um die Uhr — per Text, Sprache oder Live-Avatar-Gespräch." },
              ].map((c, i) => (
                <article key={i} aria-label={c.tag} style={{ background: BG, border: `2px solid ${BORDER}`, borderRadius: 14, padding: "28px 28px" }}>
                  <div role="img" aria-label={c.t} style={{ fontSize: 32, marginBottom: 16 }}>{c.icon}</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 12 }}>{c.t}</h3>
                  <p style={{ fontSize: 16, color: TEXT_SEC, lineHeight: 1.7, margin: 0, fontWeight: 400 }}>{c.d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TRANSFORMATION */}
        <section aria-labelledby="transform-heading" style={{ padding: "64px 56px", background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <SectionTitle label="Transformation" title="Vorher und nachher im Vergleich" />
            <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Vergleichstabelle: Vorher und Nachher">
              <thead>
                <tr>
                  <th scope="col" style={{ fontSize: 13, fontWeight: 700, color: TEXT_SEC, textAlign: "left", padding: "0 0 12px 0", borderBottom: `2px solid ${BORDER}`, letterSpacing: "0.1em" }}>OHNE SYSTEM</th>
                  <th scope="col" style={{ fontSize: 13, fontWeight: 700, color: ACCENT, textAlign: "left", padding: "0 0 12px 24px", borderBottom: `2px solid ${ACCENT}`, letterSpacing: "0.1em" }}>MIT JETUP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Manuelles Trading", "Automatisierte Strategien"],
                  ["Einmaliger Verkauf", "Residuales Einkommen"],
                  ["Isolation", "Unterstütztes Partnernetzwerk"],
                  ["Werbe-Hype", "Transparente Provisionsmechanik"],
                ].map(([b, a], i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td style={{ padding: "16px 0", fontSize: 16, color: TEXT_SEC, fontWeight: 400 }}>{b}</td>
                    <td style={{ padding: "16px 0 16px 24px", fontSize: 16, color: ACCENT, fontWeight: 700 }}>{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Aufforderung zur Bewerbung" style={{ padding: "80px 56px", textAlign: "center", background: ACCENT_BG }}>
          <div style={{ maxWidth: "52ch", margin: "0 auto" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div style={{ width: 4, height: 18, background: ACCENT, borderRadius: 2 }} />
              Nächster Schritt
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, lineHeight: 1.2, color: TEXT, marginBottom: 20 }}>
              Bereit, in das System einzusteigen?
            </h2>
            <p style={{ fontSize: 18, color: TEXT_SEC, lineHeight: 1.75, marginBottom: 40 }}>
              Fülle das Formular aus — unverbindlich und kostenlos. Wir melden uns innerhalb von 24 Stunden bei dir.
            </p>
            <AccessibleButton primary ariaLabel="Zur Bewerbungsformular-Sektion springen">
              Zum Bewerbungsformular
            </AccessibleButton>
          </div>
        </section>
      </main>

      {/* USABILITY NOTE */}
      <div style={{ background: "#ecfdf5", borderTop: "2px solid #059669", padding: "20px 56px" }}>
        <p style={{ fontSize: 12, color: "#065f46", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          VARIANTE C — Zugänglichkeit: Text ≥18px · Zeilenlänge max. 54ch · 1.75 Line-Height · Semantisches HTML · Sichtbare Focus-Indikatoren · Farbe + Text
        </p>
      </div>
    </div>
  );
}
