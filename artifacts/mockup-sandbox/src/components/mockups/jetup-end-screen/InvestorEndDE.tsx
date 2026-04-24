import { useState } from "react";
import { ArrowLeft, Sun, Moon, MessageSquare, ExternalLink, Check } from "lucide-react";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const DARK = {
  BG: "#0a0a12",
  SURFACE: "#12121c",
  SURFACE_ALT: "#16162a",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.5)",
  TEXT_MUTED: "rgba(255,255,255,0.25)",
  BORDER: "rgba(255,255,255,0.06)",
  BORDER_STRONG: "rgba(255,255,255,0.12)",
  HEADER_BG: "rgba(10,10,18,0.6)",
  CARD_SHADOW: "none",
};

const LIGHT = {
  BG: "#f6f6fa",
  SURFACE: "#ffffff",
  SURFACE_ALT: "#ede9fc",
  TEXT: "#0d0d1a",
  TEXT_SEC: "rgba(13,13,26,0.56)",
  TEXT_MUTED: "rgba(13,13,26,0.38)",
  BORDER: "rgba(13,13,26,0.09)",
  BORDER_STRONG: "rgba(13,13,26,0.18)",
  HEADER_BG: "rgba(246,246,250,0.92)",
  CARD_SHADOW: "0 2px 8px rgba(13,13,26,0.06), 0 8px 32px rgba(13,13,26,0.04)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: ACCENT_LIGHT,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

export function InvestorEndDE() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const C = theme === "dark" ? DARK : LIGHT;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.BG,
        color: C.TEXT,
        fontFamily:
          "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        transition: "background 0.4s ease, color 0.4s ease",
        paddingBottom: 80,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity:0; transform: translateY(8px);} to { opacity:1; transform: translateY(0);} }
      `}</style>

      {/* Header — same style as ExploreHeader, with Back + Theme toggle */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          padding: "0 32px",
          height: 64,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(16px)",
          background: C.HEADER_BG,
          borderBottom: `1px solid ${C.BORDER}`,
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        <button
          style={{
            background: "none",
            border: `1px solid ${C.BORDER_STRONG}`,
            borderRadius: 100,
            color: C.TEXT_SEC,
            cursor: "pointer",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "inherit",
            transition: "color 0.2s ease, border-color 0.2s ease",
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.6} />
          Zur Auswahl
        </button>

        <img
          src="/jetup-logo.png"
          alt="JetUP"
          style={{
            height: 28,
            width: "auto",
            filter: theme === "dark" ? "brightness(0) invert(1)" : "none",
            transition: "filter 0.4s ease",
          }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          style={{
            background: "none",
            border: `1px solid ${C.BORDER}`,
            borderRadius: 8,
            color: C.TEXT_MUTED,
            cursor: "pointer",
            padding: "6px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      {/* Main content */}
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "80px 32px 0",
          animation: "fadeUp 0.6s ease both",
        }}
      >
        <SectionLabel>Dein nächster Schritt</SectionLabel>

        <h1
          style={{
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 300,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: 0,
            marginBottom: 20,
            color: C.TEXT,
          }}
        >
          Starte jetzt mit dem
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Denis-Promo.
          </span>
        </h1>

        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            color: C.TEXT_SEC,
            lineHeight: 1.7,
            maxWidth: 520,
            margin: 0,
            marginBottom: 56,
          }}
        >
          Limitiertes Eröffnungsangebot. Du zahlst 100 USD, bekommst 100 USD on
          top — und startest mit 4.800 USD Handelskapital.
        </p>

        {/* Promo card */}
        <div
          style={{
            background: C.SURFACE,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 20,
            padding: "36px 32px",
            marginBottom: 48,
            boxShadow: C.CARD_SHADOW,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})`,
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr auto 1.2fr",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
            }}
          >
            {[
              { v: "100", u: "USD", label: "Deine Einzahlung" },
              { v: "100", u: "USD", label: "Bonus on top" },
              { v: "4 800", u: "USD", label: "Handelskapital", accent: true },
            ].map((item, i, arr) => (
              <>
                <div key={`item-${i}`} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "clamp(28px, 4vw, 40px)",
                      fontWeight: 300,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      color: item.accent ? ACCENT_LIGHT : C.TEXT,
                      marginBottom: 6,
                    }}
                  >
                    {item.v}
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.TEXT_MUTED,
                        marginLeft: 4,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {item.u}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: C.TEXT_MUTED,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.label}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div
                    key={`sep-${i}`}
                    style={{
                      fontSize: 22,
                      fontWeight: 200,
                      color: C.TEXT_MUTED,
                      paddingBottom: 18,
                    }}
                  >
                    {i === arr.length - 2 ? "=" : "+"}
                  </div>
                )}
              </>
            ))}
          </div>

          <div
            style={{
              borderTop: `1px solid ${C.BORDER}`,
              paddingTop: 22,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {[
              "Eigenes Konto bei TAG Markets — dein Geld bleibt bei dir",
              "Sofort einsetzbar in Copy-X Strategien",
              "Aktion limitiert — nur über persönliche Einladung",
            ].map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 13,
                  fontWeight: 400,
                  color: C.TEXT_SEC,
                }}
              >
                <Check size={14} strokeWidth={1.8} color={ACCENT_LIGHT} />
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA — speak to inviter */}
        <SectionLabel>So registrierst du dich</SectionLabel>

        <p
          style={{
            fontSize: 17,
            fontWeight: 300,
            color: C.TEXT_SEC,
            lineHeight: 1.7,
            maxWidth: 520,
            margin: 0,
            marginBottom: 24,
          }}
        >
          Wende dich an die Person, die dich eingeladen hat. Sie hilft dir bei
          der Registrierung und schaltet das Promo für dich frei.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 64,
          }}
        >
          <button
            style={{
              padding: "14px 28px",
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
              border: "none",
              borderRadius: 100,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Einladende Person kontaktieren
          </button>
          <button
            style={{
              padding: "14px 24px",
              background: "transparent",
              border: `1px solid ${C.BORDER_STRONG}`,
              borderRadius: 100,
              color: C.TEXT,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MessageSquare size={14} strokeWidth={1.6} />
            Sofia fragen
          </button>
        </div>

        {/* Hub link */}
        <div
          style={{
            background: C.SURFACE_ALT,
            border: `1px solid ${C.BORDER}`,
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            cursor: "pointer",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: C.TEXT,
                marginBottom: 4,
              }}
            >
              Mehr über JetUP & Partnerprogramm
            </div>
            <div style={{ fontSize: 12, color: C.TEXT_SEC, fontWeight: 300 }}>
              Vollständige Infos im Digital Hub
            </div>
          </div>
          <ExternalLink size={16} strokeWidth={1.6} color={C.TEXT_SEC} />
        </div>

        {/* Footer — social */}
        <div
          style={{
            borderTop: `1px solid ${C.BORDER}`,
            paddingTop: 32,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C.TEXT_MUTED,
            }}
          >
            Folge uns
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["YouTube", "Telegram", "Instagram", "TikTok"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  fontSize: 13,
                  fontWeight: 400,
                  color: C.TEXT_SEC,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Tiny replay link */}
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: C.TEXT_MUTED,
            cursor: "pointer",
            padding: 0,
            marginTop: 32,
            fontFamily: "inherit",
          }}
        >
          Video von vorne ansehen ↺
        </button>
      </main>
    </div>
  );
}
