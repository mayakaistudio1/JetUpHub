import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "#060612";
const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";

type DeepDive = {
  type: "video" | "calculator" | "dashboard";
  label: string;
  icon: string;
};

type Product = {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  color: string;
  aiLine: string;
  deepDive: DeepDive[];
};

const PRODUCTS: Product[] = [
  {
    id: "copyx",
    label: "Copy-X",
    icon: "🔄",
    tagline: "Mirror top performers.",
    description:
      "Automated copy-trading. Choose a strategy, set risk — Copy-X does the rest.",
    features: ["Auto-Copy", "Risk Control", "Verified Strategies"],
    color: "#10B981",
    aiLine: "Copy-X is for results without screen time. Pick a strategy, let it run.",
    deepDive: [
      { type: "video", label: "Watch how it works", icon: "▶" },
      { type: "dashboard", label: "Live results", icon: "📊" },
    ],
  },
  {
    id: "amplify",
    label: "24x Amplify",
    icon: "⚡",
    tagline: "Scale your capital.",
    description:
      "Funded trading. Prove skill, get up to $200K capital. Keep up to 80% of profits.",
    features: ["$200K Capital", "80% Split", "Fast Payouts"],
    color: "#F59E0B",
    aiLine: "Skilled traders get real capital. Pass the challenge, trade with our money.",
    deepDive: [
      { type: "video", label: "How the challenge works", icon: "▶" },
      { type: "calculator", label: "Calculate capital", icon: "🔢" },
    ],
  },
  {
    id: "ib",
    label: "IB Portal",
    icon: "🤝",
    tagline: "Build your network.",
    description:
      "IB program with real-time analytics, multi-tier commissions, and personal CRM.",
    features: ["Multi-Tier", "Real-Time Analytics", "CRM"],
    color: "#EC4899",
    aiLine: "Turn your network into recurring income. Track everything live.",
    deepDive: [
      { type: "video", label: "Partner journey", icon: "▶" },
      { type: "dashboard", label: "Your dashboard", icon: "🖥" },
    ],
  },
];

function useTypewriter(text: string, speed = 20, trigger = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!trigger) {
      setDisplayed("");
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, trigger, speed]);
  return displayed;
}

function ProductCard({
  product,
  isActive,
  onClick,
}: {
  product: Product;
  isActive: boolean;
  onClick: () => void;
}) {
  const aiText = useTypewriter(product.aiLine, 18, isActive);
  const [aiDone, setAiDone] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setAiDone(false);
      setShowVideo(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive && aiText.length >= product.aiLine.length) {
      const t = setTimeout(() => setAiDone(true), 400);
      return () => clearTimeout(t);
    }
  }, [aiText, product.aiLine, isActive]);

  return (
    <motion.div
      layout
      data-testid={`mobile-product-${product.id}`}
      onClick={onClick}
      style={{
        background: isActive
          ? `${product.color}08`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${isActive ? `${product.color}30` : "rgba(255,255,255,0.06)"}`,
        borderRadius: 20,
        padding: isActive ? "20px 18px" : "16px 18px",
        cursor: "pointer",
        overflow: "hidden",
      }}
      transition={{ layout: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: isActive ? `${product.color}18` : "rgba(255,255,255,0.04)",
            border: `1px solid ${isActive ? `${product.color}30` : "rgba(255,255,255,0.06)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
            transition: "all 0.3s",
          }}
        >
          {product.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: isActive ? product.color : "rgba(255,255,255,0.8)",
              fontSize: 15,
              fontWeight: 700,
              transition: "color 0.3s",
            }}
          >
            {product.label}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {product.tagline}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            color: isActive ? product.color : "rgba(255,255,255,0.2)",
            fontSize: 14,
          }}
        >
          ▾
        </motion.div>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingTop: 16 }}>
              <div
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  lineHeight: 1.65,
                  marginBottom: 14,
                }}
              >
                {product.description}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap" as const,
                  marginBottom: 16,
                }}
              >
                {product.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      background: `${product.color}10`,
                      border: `1px solid ${product.color}20`,
                      borderRadius: 16,
                      padding: "5px 12px",
                      color: product.color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {f}
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: "12px 14px",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${ACCENT2}, ${ACCENT})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    flexShrink: 0,
                    boxShadow: `0 0 12px ${ACCENT2}40`,
                  }}
                >
                  ✦
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: 13,
                    lineHeight: 1.55,
                  }}
                >
                  {aiText}
                  {aiText.length < product.aiLine.length && (
                    <span
                      style={{
                        opacity: 0.4,
                        animation: "blink 0.8s step-end infinite",
                      }}
                    >
                      ▋
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {aiDone && !showVideo && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {product.deepDive.map((dd) => (
                      <motion.button
                        key={dd.label}
                        whileTap={{ scale: 0.96 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dd.type === "video") setShowVideo(true);
                        }}
                        data-testid={`mobile-dd-${dd.type}-${product.id}`}
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 10,
                          padding: "10px 8px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          background: `${product.color}12`,
                          border: `1px solid ${product.color}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          flexShrink: 0,
                        }}>
                          {dd.icon}
                        </span>
                        <span style={{
                          color: "rgba(255,255,255,0.65)",
                          fontSize: 11,
                          fontWeight: 600,
                          textAlign: "left" as const,
                          lineHeight: 1.2,
                        }}>
                          {dd.label}
                        </span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showVideo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      marginTop: 12,
                      borderRadius: 14,
                      overflow: "hidden",
                      background: "#000",
                      border: `1px solid ${product.color}25`,
                      aspectRatio: "16/9",
                      position: "relative",
                    }}
                  >
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${product.color}12, #060612)`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}>
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          background: `${product.color}22`,
                          border: `2px solid ${product.color}50`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          boxShadow: `0 0 20px ${product.color}25`,
                        }}
                      >
                        ▶
                      </motion.div>
                      <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 600 }}>
                        {product.label} Overview
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                        2:30 min
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowVideo(false); }}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,0.5)",
                        border: "1px solid rgba(255,255,255,0.15)",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "inherit",
                        zIndex: 2,
                      }}
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showVideo && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  data-testid={`btn-start-${product.id}`}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    background: `linear-gradient(135deg, ${product.color}cc, ${product.color})`,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px 0",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Explore {product.label} →
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ProductSectionMobile() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      data-testid="product-section-mobile"
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#fff",
        padding: "50px 20px 30px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${ACCENT}08 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              color: ACCENT2,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              marginBottom: 10,
            }}
          >
            Ecosystem
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
              background: `linear-gradient(135deg, #fff 40%, ${ACCENT2})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            One platform.
            <br />
            Every tool you need.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              lineHeight: 1.6,
              marginTop: 12,
            }}
          >
            Tap any product to explore how it works.
          </p>
        </motion.div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            margin: "24px 0",
          }}
        >
          <svg viewBox="0 0 320 60" width="320" height="60">
            {PRODUCTS.map((p, i) => {
              const x = 60 + i * 100;
              const isActive = active === p.id;
              return (
                <g key={p.id}>
                  {i < PRODUCTS.length - 1 && (
                    <line
                      x1={x + 18}
                      y1={30}
                      x2={x + 82}
                      y2={30}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={30}
                    r={isActive ? 18 : 14}
                    fill={isActive ? `${p.color}22` : "rgba(255,255,255,0.04)"}
                    stroke={isActive ? p.color : "rgba(255,255,255,0.1)"}
                    strokeWidth={isActive ? 2 : 1}
                    style={{ cursor: "pointer", transition: "all 0.3s" }}
                    onClick={() =>
                      setActive(active === p.id ? null : p.id)
                    }
                  />
                  <text
                    x={x}
                    y={31}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isActive ? 14 : 12}
                    style={{ pointerEvents: "none" }}
                  >
                    {p.icon}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {PRODUCTS.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isActive={active === p.id}
              onClick={() => setActive(active === p.id ? null : p.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
