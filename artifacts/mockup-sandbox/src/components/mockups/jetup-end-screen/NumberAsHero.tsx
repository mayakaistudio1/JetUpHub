import { MessageSquare, ArrowRight, RotateCcw } from "lucide-react";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const C = {
  BG: "#0a0a12",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.5)",
  TEXT_MUTED: "rgba(255,255,255,0.28)",
  BORDER: "rgba(255,255,255,0.08)",
};

export function NumberAsHero() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TEXT,
        fontFamily: "Montserrat, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
        @keyframes drop { from { opacity:0; transform: translateY(-40px) scale(1.1);} to { opacity:1; transform: translateY(0) scale(1);} }
        @keyframes fade { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* Background orb — atmospheric */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 800,
          background: `radial-gradient(circle, ${ACCENT}22 0%, transparent 60%)`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Tiny annotation above */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 13,
            fontWeight: 400,
            color: C.TEXT_SEC,
            marginBottom: 24,
            animation: "fade 0.8s ease both",
            letterSpacing: "0.02em",
          }}
        >
          <span>100 USD</span>
          <span style={{ color: C.TEXT_MUTED }}>+</span>
          <span>100 USD</span>
          <ArrowRight size={14} color={C.TEXT_MUTED} />
        </div>

        {/* The hero number — gigantic */}
        <div
          style={{
            fontSize: "clamp(120px, 22vw, 240px)",
            fontWeight: 200,
            letterSpacing: "-0.06em",
            lineHeight: 0.85,
            color: C.TEXT,
            textAlign: "center",
            marginBottom: 8,
            animation: "drop 0.7s cubic-bezier(.2,.8,.2,1) both",
          }}
        >
          4 800
        </div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 300,
            color: C.TEXT_SEC,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            marginBottom: 4,
            animation: "fade 1s ease 0.3s both",
          }}
        >
          USD
        </div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: C.TEXT_MUTED,
            marginBottom: 64,
            animation: "fade 1s ease 0.5s both",
          }}
        >
          Dein Handelskapital — sofort einsatzbereit
        </div>

        {/* Action row — quiet, supporting */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fade 1s ease 0.7s both",
          }}
        >
          <button
            style={{
              padding: "16px 32px",
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
              border: "none",
              borderRadius: 100,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
            }}
          >
            Promo aktivieren →
          </button>
          <button
            style={{
              padding: "16px 24px",
              background: "transparent",
              border: `1px solid ${C.BORDER}`,
              borderRadius: 100,
              color: C.TEXT_SEC,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MessageSquare size={14} />
            Sofia
          </button>
        </div>

        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: C.TEXT_MUTED,
            marginTop: 20,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            animation: "fade 1s ease 0.9s both",
          }}
        >
          Wende dich an die Person, die dich eingeladen hat
        </div>
      </main>

      {/* Footer line — minimal */}
      <footer
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          fontWeight: 500,
          color: C.TEXT_MUTED,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          animation: "fade 1s ease 1.1s both",
        }}
      >
        <button
          style={{
            background: "none",
            border: "none",
            color: "inherit",
            fontSize: "inherit",
            fontWeight: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: 0,
          }}
        >
          <RotateCcw size={11} />
          Replay
        </button>
        <div style={{ display: "flex", gap: 18 }}>
          {["YT", "TG", "IG", "TT"].map((s) => (
            <span key={s} style={{ cursor: "pointer" }}>
              {s}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
