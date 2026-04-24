import React, { useState } from "react";

const videoGroups = [
  {
    video: 1,
    title: "Video 1 — Lot Commissions",
    images: [
      { id: "v1-s1-commission-scale", label: "Комиссия за лот", desc: "10-level commission scale" },
      { id: "v1-s2-unlock-logic", label: "Глубина структуры", desc: "Level unlock requirements" },
      { id: "v1-s3-recurring-income", label: "Повторяющийся доход", desc: "Recurring income cycle" },
      { id: "v1-s4-team-activity", label: "Доход с активности команды", desc: "Team activity income" },
    ],
  },
  {
    video: 2,
    title: "Video 2 — Profit Share",
    images: [
      { id: "v2-s1-profit-share", label: "Profit Share", desc: "Profit share scale table" },
      { id: "v2-s2-activity-vs-result", label: "Доход с результата", desc: "Activity vs Result split" },
      { id: "v2-s3-residual-income", label: "Остаточный доход", desc: "Growing team income" },
    ],
  },
  {
    video: 3,
    title: "Video 3 — Infinity Bonus",
    images: [
      { id: "v3-s1-infinity-bonus", label: "Infinity Bonus", desc: "Infinity bonus tiers" },
      { id: "v3-s2-depth-income", label: "Доход с глубины", desc: "Deep structure map" },
      { id: "v3-s3-team-scale", label: "Масштаб команды", desc: "Scale & duplication" },
    ],
  },
  {
    video: 4,
    title: "Video 4 — Global Pool",
    images: [
      { id: "v4-s1-global-pool", label: "Global Pool", desc: "Pool 1 vs Pool 2" },
      { id: "v4-s2-bonus-economy", label: "Бонусная экономика", desc: "Broader economy flow" },
      { id: "v4-s3-mature-layer", label: "Зрелый бонусный слой", desc: "Multi-layer architecture" },
    ],
  },
  {
    video: 5,
    title: "Video 5 — Overview",
    images: [
      { id: "v5-s1-partner-program", label: "Партнёрская программа JetUP", desc: "Four income layers" },
      { id: "v5-s2-multi-level", label: "Многоуровневая система дохода", desc: "Step-by-step flow" },
      { id: "v5-s3-ecosystem", label: "Долгосрочный партнёрский доход", desc: "Unified ecosystem" },
    ],
  },
];

export default function BrollGalleryPage() {
  const [themeFilter, setThemeFilter] = useState<"both" | "dark" | "light">("both");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060212",
        color: "#fff",
        fontFamily: "'Montserrat', system-ui, sans-serif",
        padding: "40px 24px",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      <h1
        data-testid="text-gallery-title"
        style={{
          fontSize: 32,
          fontWeight: 800,
          textAlign: "center",
          marginBottom: 8,
          background: "linear-gradient(180deg, #7C3AED 0%, #C084FC 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        JetUP HeyGen B-Roll Infographics
      </h1>
      <p
        data-testid="text-gallery-subtitle"
        style={{
          textAlign: "center",
          color: "rgba(255,255,255,0.6)",
          fontSize: 14,
          marginBottom: 32,
        }}
      >
        16 data-driven infographics × 2 themes = 32 PNGs
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 48,
        }}
      >
        {(["both", "dark", "light"] as const).map((t) => (
          <button
            key={t}
            data-testid={`button-theme-${t}`}
            onClick={() => setThemeFilter(t)}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: themeFilter === t ? "2px solid #7C3AED" : "2px solid rgba(124,58,237,0.2)",
              background: themeFilter === t ? "rgba(124,58,237,0.2)" : "transparent",
              color: themeFilter === t ? "#C084FC" : "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              textTransform: "capitalize",
            }}
          >
            {t === "both" ? "Both Themes" : t === "dark" ? "Dark Theme" : "Light Theme"}
          </button>
        ))}
      </div>

      {videoGroups.map((group, gi) => (
        <div key={gi} style={{ marginBottom: 56 }}>
          <h2
            data-testid={`text-group-title-${gi}`}
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 20,
              paddingBottom: 10,
              borderBottom: "1px solid rgba(124, 58, 237, 0.3)",
              color: "#C084FC",
            }}
          >
            {group.title}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                themeFilter === "both"
                  ? "repeat(auto-fill, minmax(500px, 1fr))"
                  : "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {group.images.map((img, ii) => (
              <div
                key={ii}
                data-testid={`card-broll-${gi}-${ii}`}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(124, 58, 237, 0.2)",
                  borderRadius: 16,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px 10px",
                    borderBottom: "1px solid rgba(124, 58, 237, 0.15)",
                  }}
                >
                  <span
                    data-testid={`text-broll-label-${gi}-${ii}`}
                    style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}
                  >
                    {img.label}
                  </span>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 4,
                    }}
                  >
                    {img.desc}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: themeFilter === "both" ? 1 : 0,
                    background: themeFilter === "both" ? "rgba(124,58,237,0.1)" : "transparent",
                  }}
                >
                  {(themeFilter === "both" || themeFilter === "dark") && (
                    <div style={{ flex: 1, position: "relative" }}>
                      {themeFilter === "both" && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            background: "rgba(0,0,0,0.7)",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 6,
                            zIndex: 1,
                          }}
                        >
                          DARK
                        </div>
                      )}
                      <img
                        src={`/images/heygen-broll/${img.id}-dark.png`}
                        alt={`${img.label} — dark`}
                        data-testid={`img-broll-dark-${gi}-${ii}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          background: "#0F0A1A",
                        }}
                      />
                    </div>
                  )}
                  {(themeFilter === "both" || themeFilter === "light") && (
                    <div style={{ flex: 1, position: "relative" }}>
                      {themeFilter === "both" && (
                        <div
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            background: "rgba(124,58,237,0.8)",
                            color: "#fff",
                            fontSize: 10,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 6,
                            zIndex: 1,
                          }}
                        >
                          LIGHT
                        </div>
                      )}
                      <img
                        src={`/images/heygen-broll/${img.id}-light.png`}
                        alt={`${img.label} — light`}
                        data-testid={`img-broll-light-${gi}-${ii}`}
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                          background: "#F8F8FA",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div
                  style={{
                    padding: "8px 16px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    fontFamily: "monospace",
                    borderTop: "1px solid rgba(124, 58, 237, 0.1)",
                  }}
                >
                  {img.id}-dark.png / {img.id}-light.png
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
