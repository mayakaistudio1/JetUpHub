import { ArrowLeft, ArrowRight, ExternalLink, Youtube, Instagram, Send, TrendingUp, Users, Sparkles, Check } from "lucide-react";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const C = {
  BG: "#0a0a12",
  SURFACE: "rgba(255,255,255,0.04)",
  SURFACE_HI: "rgba(255,255,255,0.07)",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.62)",
  TEXT_MUTED: "rgba(255,255,255,0.40)",
  BORDER: "rgba(255,255,255,0.08)",
  BORDER_HI: "rgba(255,255,255,0.16)",
};

export function FinalOverlay() {
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
        @keyframes fadeUp { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
        @keyframes pulse { 0%,100% { opacity: 0.85; transform: scale(1);} 50% { opacity: 1; transform: scale(1.06);} }
        @keyframes typing { 0%,60%,100% { opacity: 0.3; } 30% { opacity: 1; } }
        .social-btn { transition: all 0.2s ease; }
        .social-btn:hover { background: ${C.SURFACE_HI}; border-color: ${C.BORDER_HI}; transform: translateY(-1px); color: ${C.TEXT}; }
        .ghost-btn { transition: all 0.2s ease; }
        .ghost-btn:hover { background: ${C.SURFACE_HI}; border-color: ${C.BORDER_HI}; }
        .path-card { transition: all 0.25s ease; cursor: pointer; }
        .path-card:hover { background: ${C.SURFACE_HI}; border-color: ${ACCENT}55; transform: translateY(-2px); }
        .sofia-cta { transition: all 0.2s ease; cursor: pointer; }
        .sofia-cta:hover { background: ${C.SURFACE_HI}; border-color: ${ACCENT}66; }
        .dot-1 { animation: typing 1.4s ease-in-out infinite; animation-delay: 0s; }
        .dot-2 { animation: typing 1.4s ease-in-out infinite; animation-delay: 0.2s; }
        .dot-3 { animation: typing 1.4s ease-in-out infinite; animation-delay: 0.4s; }
      `}</style>

      {/* Atmospheric glow */}
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 65%)`,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      {/* TOP BAR */}
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
          animation: "fadeUp 0.5s ease both",
        }}
      >
        <button
          className="ghost-btn"
          data-testid="button-back-explore"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            background: C.SURFACE,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 100,
            color: C.TEXT_SEC,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ArrowLeft size={13} />
          Zurück zu /explore
        </button>

        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.TEXT_MUTED,
          }}
        >
          Vielen Dank fürs Zuschauen
        </div>
      </header>

      {/* SOFIA CHAT INVITE — top hero */}
      <section
        style={{
          padding: "16px 24px 0",
          position: "relative",
          zIndex: 2,
          animation: "fadeUp 0.6s ease 0.15s both",
        }}
      >
        <button
          className="sofia-cta"
          data-testid="button-talk-sofia"
          style={{
            width: "100%",
            background: C.SURFACE,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 20,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left",
            color: "inherit",
            fontFamily: "inherit",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Sofia photo */}
          <div
            style={{
              position: "relative",
              flexShrink: 0,
              width: 56,
              height: 56,
            }}
          >
            <img
              src="/images/sofia-avatar.png"
              alt="Sofia"
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${ACCENT}55`,
                display: "block",
              }}
            />
            {/* online dot */}
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#22c55e",
                border: `2px solid ${C.BG}`,
                animation: "pulse 1.8s ease-in-out infinite",
              }}
            />
          </div>

          {/* Bubble content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: C.TEXT }}>
                Sofia
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#22c55e",
                }}
              >
                online
              </div>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: C.TEXT_SEC,
                lineHeight: 1.45,
              }}
            >
              Hey! Ich bin Sofia. Hast du Fragen zum Video?
              <br />
              <span style={{ color: ACCENT_LIGHT, fontWeight: 500 }}>Schreib mir direkt — ich helfe dir weiter.</span>
            </div>

            {/* typing indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
              }}
            >
              <span
                className="dot-1"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: C.TEXT_MUTED,
                }}
              />
              <span
                className="dot-2"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: C.TEXT_MUTED,
                }}
              />
              <span
                className="dot-3"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: C.TEXT_MUTED,
                }}
              />
            </div>
          </div>

          <ArrowRight size={18} color={ACCENT_LIGHT} style={{ flexShrink: 0 }} />
        </button>
      </section>

      {/* MAIN — instruction + 3 path cards */}
      <main
        style={{
          flex: 1,
          padding: "28px 24px 20px",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Eyebrow + headline */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 20,
            animation: "fadeUp 0.6s ease 0.25s both",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: ACCENT_LIGHT,
              marginBottom: 12,
            }}
          >
            Dein nächster Schritt
          </div>
          <div
            style={{
              fontSize: "clamp(20px, 2.6vw, 26px)",
              fontWeight: 300,
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              color: C.TEXT,
              maxWidth: 560,
              margin: "0 auto",
            }}
          >
            Den Registrierungs-Link bekommst du
            <br />
            von der Person,{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              die dich eingeladen hat
            </span>
            .
          </div>
        </div>

        {/* Three path cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            maxWidth: 560,
            width: "100%",
            margin: "0 auto",
            animation: "fadeUp 0.6s ease 0.35s both",
          }}
        >
          <PathCard
            icon={<TrendingUp size={18} />}
            tag="Investor"
            title="Denis Fast-Start Promo"
            desc="100 + 100 USD"
            highlight="4 800 USD Handelskapital"
            testId="card-path-investor"
          />
          <PathCard
            icon={<Users size={18} />}
            tag="Partner"
            title="JetUP Partner-Programm"
            desc="Ohne Investment starten"
            highlight="10× besser verkaufen"
            testId="card-path-partner"
          />
          <PathCard
            icon={<Sparkles size={18} />}
            tag="Beides"
            title="Investor + Partner"
            desc="Kapital aufbauen & verdienen"
            highlight="Sofort live starten"
            testId="card-path-both"
          />
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 11,
            fontWeight: 500,
            color: C.TEXT_MUTED,
            letterSpacing: "0.04em",
            animation: "fadeUp 0.6s ease 0.45s both",
          }}
        >
          Dein Inviter schaltet den passenden Weg für dich frei
        </div>
      </main>

      {/* FOOTER — Hub + socials */}
      <footer
        style={{
          padding: "16px 24px 22px",
          borderTop: `1px solid ${C.BORDER}`,
          background: "rgba(10,10,18,0.55)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 2,
          animation: "fadeUp 0.6s ease 0.55s both",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <button
          className="ghost-btn"
          data-testid="button-open-hub"
          style={{
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 20px",
            background: C.SURFACE,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 100,
            color: C.TEXT,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ExternalLink size={14} color={ACCENT_LIGHT} />
          Mehr erfahren — JetUP Digital Hub
          <ArrowRight size={13} color={C.TEXT_MUTED} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.TEXT_MUTED,
            }}
          >
            Unser Netzwerk
          </span>
          <span style={{ width: 24, height: 1, background: C.BORDER }} />
          <div style={{ display: "flex", gap: 8 }}>
            <SocialIcon label="YouTube" testId="link-youtube">
              <Youtube size={16} />
            </SocialIcon>
            <SocialIcon label="Instagram" testId="link-instagram">
              <Instagram size={16} />
            </SocialIcon>
            <SocialIcon label="Telegram" testId="link-telegram">
              <Send size={16} />
            </SocialIcon>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PathCard({
  icon,
  tag,
  title,
  desc,
  highlight,
  testId,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  highlight: string;
  testId: string;
}) {
  return (
    <div
      className="path-card"
      data-testid={testId}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: C.SURFACE,
        border: `1px solid ${C.BORDER}`,
        borderRadius: 14,
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT_LIGHT}22)`,
          border: `1px solid ${ACCENT}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT_LIGHT,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 2,
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.TEXT_MUTED,
            }}
          >
            {tag}
          </div>
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.TEXT,
            lineHeight: 1.3,
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            color: C.TEXT_MUTED,
            fontWeight: 400,
          }}
        >
          {desc}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          background: `${ACCENT}1f`,
          border: `1px solid ${ACCENT}44`,
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 600,
          color: ACCENT_LIGHT,
          flexShrink: 0,
          letterSpacing: "0.01em",
        }}
      >
        <Check size={11} />
        {highlight}
      </div>
    </div>
  );
}

function SocialIcon({
  children,
  label,
  testId,
}: {
  children: React.ReactNode;
  label: string;
  testId: string;
}) {
  return (
    <button
      className="social-btn"
      data-testid={testId}
      aria-label={label}
      title={label}
      style={{
        width: 38,
        height: 38,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: C.SURFACE,
        border: `1px solid ${C.BORDER}`,
        borderRadius: "50%",
        color: C.TEXT_SEC,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
