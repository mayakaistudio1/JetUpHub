const ACCENT = "#7c3aed";

function Section({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <section style={{ borderTop: "1px solid #e5e7eb", padding: "72px 0" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 48px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 56 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.25em", textTransform: "uppercase", minWidth: 32 }}>{n}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.25em", textTransform: "uppercase" }}>{label}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export function Hierarchy() {
  return (
    <div style={{ background: "#fafafa", fontFamily: "'Montserrat', system-ui, sans-serif", color: "#111", minHeight: "100vh", overflowX: "hidden" }}>

      {/* HEADER */}
      <header style={{ borderBottom: "1px solid #e5e7eb", padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: ACCENT }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111", letterSpacing: "-0.02em" }}>JETUP</span>
        </div>
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <a href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>System</a>
          <a href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>Strategie</a>
          <a href="#" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", fontWeight: 500 }}>Partner</a>
          <button style={{ padding: "9px 22px", background: ACCENT, color: "#fff", border: "none", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em" }}>
            Bewerbung starten
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ padding: "96px 48px 80px", maxWidth: 920, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 28 }}>
          Das JetUP System
        </div>
        <h1 style={{ fontSize: "clamp(52px, 7vw, 80px)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-0.04em", color: "#111", marginBottom: 28, maxWidth: 760 }}>
          Es ist kein Angebot.<br />Es ist ein System.
        </h1>
        <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.65, fontWeight: 300, maxWidth: 520, marginBottom: 48 }}>
          JetUP verbindet bewährte Handelsstrategien, ein transparentes Partnermodell und KI-Infrastruktur — in einer durchdachten Architektur.
        </p>
        <div style={{ display: "flex", gap: 14 }}>
          <button style={{ padding: "14px 32px", background: ACCENT, color: "#fff", border: "none", borderRadius: 100, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            System erkunden
          </button>
          <button style={{ padding: "14px 32px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 100, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
            Präsentation ansehen
          </button>
        </div>
      </section>

      {/* PROBLEM */}
      <Section n="01" label="Das Problem">
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.03em", color: "#111", marginBottom: 20, maxWidth: 600 }}>
          Der Markt belohnt Chaos — nicht Klarheit.
        </h2>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.75, fontWeight: 300, maxWidth: 560, marginBottom: 40 }}>
          Die meisten Menschen, die ins Trading einsteigen, verlieren Zeit und Geld — nicht weil sie zu wenig versuchen, sondern weil das System fehlt. Kein Rahmen. Keine Struktur. Kein nachhaltiges Einkommen.
        </p>
        <div style={{ padding: "28px 32px", borderLeft: `3px solid ${ACCENT}`, background: "#f5f3ff", borderRadius: "0 10px 10px 0" }}>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.7, fontWeight: 400, margin: 0 }}>
            JetUP wurde entwickelt, um diesen Zyklus zu durchbrechen — mit einem System, das für dich arbeitet, auch wenn du es nicht tust.
          </p>
        </div>
      </Section>

      {/* SOLUTION */}
      <Section n="02" label="Die Lösung">
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.03em", color: "#111", marginBottom: 48, maxWidth: 560 }}>
          Drei Pfeiler. Eine Architektur.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {[
            { n: "I", t: "Trading-Infrastruktur", d: "Regulierter Zugang zu automatisierten Handelsstrategien mit nachgewiesener Bilanz." },
            { n: "II", t: "Partnermodell", d: "Residuales Einkommen auf Basis echter Handelsvolumina — kein Empfehlungs-Hype." },
            { n: "III", t: "KI-Infrastruktur", d: "Maria AI beantwortet Fragen 24/7 — Text, Sprache und Live-Avatar." },
          ].map(c => (
            <div key={c.n} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.2em", marginBottom: 12 }}>{c.n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 8 }}>{c.t}</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, fontWeight: 300 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* TRANSFORMATION */}
      <Section n="03" label="Transformation">
        <h2 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.02em", color: "#111", marginBottom: 40, maxWidth: 560 }}>
          Was sich verändert, wenn du ins System eintrittst
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { b: "Manuelles Trading", a: "Automatisierte Strategien" },
            { b: "Einmaliger Verkauf", a: "Residuales Einkommen" },
            { b: "Isolation", a: "Unterstütztes Netzwerk" },
            { b: "Werbungs-Hype", a: "Echte Transparenz" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 0, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
              <div style={{ flex: 1, padding: "20px 20px", borderRight: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Vorher</span>
                <span style={{ fontSize: 13, color: "#9ca3af", textDecoration: "line-through", fontWeight: 300 }}>{r.b}</span>
              </div>
              <div style={{ flex: 1, padding: "20px 20px" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Nachher</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>{r.a}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid #e5e7eb", padding: "80px 48px", textAlign: "center", background: "#fff" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 20 }}>Nächster Schritt</div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#111", marginBottom: 16 }}>
            Bereit, in das System einzusteigen?
          </h2>
          <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.65, fontWeight: 300, marginBottom: 40 }}>
            Fülle das Formular aus. Wir melden uns innerhalb von 24 Stunden.
          </p>
          <button style={{ padding: "16px 44px", background: ACCENT, color: "#fff", border: "none", borderRadius: 100, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Bewerbung ausfüllen
          </button>
        </div>
      </section>

      {/* USABILITY NOTE */}
      <div style={{ background: "#f5f3ff", borderTop: `2px solid ${ACCENT}`, padding: "20px 48px" }}>
        <p style={{ fontSize: 12, color: ACCENT, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          VARIANTE A — Informations-Hierarchie: Starke typografische Skala · Section-Nummering · Großzügiges Whitespace · Konservative CTA-Gewichtung
        </p>
      </div>
    </div>
  );
}
