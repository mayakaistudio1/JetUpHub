import { useState } from "react";
import { ChevronUp, MessageSquare, RotateCcw, ExternalLink } from "lucide-react";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const C = {
  BG: "#0a0a12",
  SURFACE: "#12121c",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.55)",
  TEXT_MUTED: "rgba(255,255,255,0.32)",
  BORDER: "rgba(255,255,255,0.08)",
};

export function RuthlessFocus() {
  const [trayOpen, setTrayOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TEXT,
        fontFamily: "Montserrat, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity:0; transform: translateY(12px);} to { opacity:1; transform: translateY(0);} }
        @keyframes glow { 0%,100% { box-shadow: 0 0 60px ${ACCENT}33; } 50% { box-shadow: 0 0 100px ${ACCENT}55; } }
      `}</style>

      {/* Centered hero — only ONE thing on screen */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px",
          textAlign: "center",
          animation: "fadeUp 0.6s ease both",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: ACCENT_LIGHT,
            marginBottom: 32,
          }}
        >
          Dein einziger nächster Schritt
        </div>

        {/* The number, dominant */}
        <div
          style={{
            fontSize: "clamp(72px, 14vw, 140px)",
            fontWeight: 200,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            background: `linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12,
          }}
        >
          4 800
          <span style={{ fontSize: "0.3em", marginLeft: 8, color: C.TEXT_MUTED, WebkitTextFillColor: C.TEXT_MUTED }}>
            USD
          </span>
        </div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: C.TEXT_SEC,
            marginBottom: 8,
            letterSpacing: "0.02em",
          }}
        >
          Handelskapital — du zahlst nur 100 USD
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: C.TEXT_MUTED,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 56,
          }}
        >
          Denis Fast-Start Promo
        </div>

        {/* THE button — single, dominant */}
        <button
          style={{
            padding: "22px 56px",
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
            border: "none",
            borderRadius: 100,
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.03em",
            animation: "glow 3s ease-in-out infinite",
          }}
        >
          Einladende Person kontaktieren
        </button>

        <div
          style={{
            fontSize: 12,
            fontWeight: 400,
            color: C.TEXT_MUTED,
            marginTop: 20,
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          Sie schaltet das Promo für dich frei und führt dich durch die Anmeldung.
        </div>
      </main>

      {/* Bottom tray — collapsed by default */}
      <div
        style={{
          borderTop: `1px solid ${C.BORDER}`,
          background: "rgba(10,10,18,0.7)",
          backdropFilter: "blur(20px)",
        }}
      >
        <button
          onClick={() => setTrayOpen(!trayOpen)}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            padding: "14px 20px",
            color: C.TEXT_MUTED,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
        >
          <ChevronUp
            size={12}
            style={{
              transform: trayOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s",
            }}
          />
          {trayOpen ? "Weniger" : "Andere Optionen"}
        </button>

        {trayOpen && (
          <div
            style={{
              padding: "8px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              animation: "fadeUp 0.3s ease both",
            }}
          >
            <TrayBtn icon={<MessageSquare size={14} />} label="Sofia fragen" />
            <TrayBtn icon={<ExternalLink size={14} />} label="Mehr im Digital Hub" />
            <TrayBtn icon={<RotateCcw size={14} />} label="Video von vorne" />
          </div>
        )}
      </div>
    </div>
  );
}

function TrayBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.BORDER}`,
        borderRadius: 12,
        padding: "12px 16px",
        color: C.TEXT_SEC,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textAlign: "left",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
