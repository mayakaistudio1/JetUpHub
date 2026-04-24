import { MessageSquare, RotateCcw, ExternalLink, ArrowRight } from "lucide-react";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const C = {
  BG: "#0a0a12",
  SURFACE: "rgba(255,255,255,0.04)",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.6)",
  TEXT_MUTED: "rgba(255,255,255,0.35)",
  BORDER: "rgba(255,255,255,0.1)",
};

export function ConversationContinues() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TEXT,
        fontFamily: "Montserrat, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
        @keyframes slideR { from { opacity:0; transform: translateX(40px);} to { opacity:1; transform: translateX(0);} }
        @keyframes scaleIn { from { opacity:0; transform: scale(0.92);} to { opacity:1; transform: scale(1);} }
        @keyframes pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.02);} }
      `}</style>

      <main
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(280px, 38%) 1fr",
          gap: 0,
          minHeight: "100vh",
        }}
      >
        {/* LEFT — Sofia frame, "still on stage" */}
        <div
          style={{
            position: "relative",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderRight: `1px solid ${C.BORDER}`,
            animation: "scaleIn 0.6s ease both",
          }}
        >
          {/* Mock Sofia portrait — gradient placeholder */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 50% 35%, ${ACCENT}66 0%, ${ACCENT}22 30%, #000 70%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Sofia's "silhouette" — abstract */}
          <div
            style={{
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${ACCENT_LIGHT}88, ${ACCENT}55 50%, transparent 75%)`,
              filter: "blur(8px)",
              animation: "pulse 3s ease-in-out infinite",
            }}
          />

          {/* Live indicator */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${C.BORDER}`,
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.TEXT_SEC,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
            Sofia ist da
          </div>

          {/* Caption at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              right: 24,
              fontSize: 13,
              fontWeight: 300,
              color: C.TEXT_SEC,
              fontStyle: "italic",
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            "Klick einfach auf mich, falls du
            <br />
            Fragen hast."
          </div>
        </div>

        {/* RIGHT — the offer "from her hands" */}
        <div
          style={{
            padding: "60px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            animation: "slideR 0.7s cubic-bezier(.2,.8,.2,1) both",
            animationDelay: "0.2s",
          }}
        >
          {/* Speech mark */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 300,
              color: ACCENT,
              lineHeight: 0.6,
              marginBottom: -10,
              fontFamily: "Georgia, serif",
            }}
          >
            "
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 300,
              lineHeight: 1.35,
              letterSpacing: "-0.02em",
              color: C.TEXT,
              marginBottom: 36,
              maxWidth: 480,
            }}
          >
            Hier ist, was du heute mit
            <br />
            mir starten kannst:
          </div>

          {/* Offer "card" — feels like she's holding it up */}
          <div
            style={{
              background: C.SURFACE,
              border: `1px solid ${C.BORDER}`,
              borderRadius: 16,
              padding: "28px 32px",
              marginBottom: 32,
              backdropFilter: "blur(20px)",
              maxWidth: 480,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: ACCENT_LIGHT,
                marginBottom: 16,
              }}
            >
              Denis Fast-Start Promo
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 18, color: C.TEXT_SEC, fontWeight: 300 }}>
                100 + 100
              </div>
              <ArrowRight size={16} color={C.TEXT_MUTED} />
              <div
                style={{
                  fontSize: "clamp(40px, 5vw, 56px)",
                  fontWeight: 200,
                  letterSpacing: "-0.03em",
                  background: `linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                4 800
                <span style={{ fontSize: 14, color: C.TEXT_MUTED, marginLeft: 6, WebkitTextFillColor: C.TEXT_MUTED }}>
                  USD
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: 13,
                color: C.TEXT_MUTED,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Dein Handelskapital. Eigenes Konto bei TAG Markets.
              <br />
              Nur über persönliche Einladung.
            </div>
          </div>

          {/* Two paths, conversational */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: C.TEXT_SEC,
              marginBottom: 16,
              lineHeight: 1.7,
            }}
          >
            Sprich mit der Person, die dich eingeladen hat —
            <br />
            oder bleib bei mir, ich helfe gern.
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            <button
              style={{
                padding: "13px 24px",
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                border: "none",
                borderRadius: 100,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Einladende Person
            </button>
            <button
              style={{
                padding: "13px 22px",
                background: "transparent",
                border: `1px solid ${C.BORDER}`,
                borderRadius: 100,
                color: C.TEXT,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <MessageSquare size={13} />
              Mit Sofia sprechen
            </button>
          </div>

          {/* Tertiary, quiet */}
          <div
            style={{
              display: "flex",
              gap: 24,
              fontSize: 12,
              color: C.TEXT_MUTED,
              fontWeight: 500,
            }}
          >
            <button
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: 0,
              }}
            >
              <ExternalLink size={11} />
              Digital Hub
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                fontSize: "inherit",
                fontWeight: "inherit",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: 0,
              }}
            >
              <RotateCcw size={11} />
              Video erneut
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
