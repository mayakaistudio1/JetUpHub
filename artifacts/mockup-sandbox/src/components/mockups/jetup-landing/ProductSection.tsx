import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "#060612";
const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";
const GLASS = "rgba(255,255,255,0.04)";
const GLASS_BORDER = "rgba(255,255,255,0.08)";

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
  angle: number;
  deepDive: DeepDive[];
};

const PRODUCTS: Product[] = [
  {
    id: "copyx",
    label: "Copy-X",
    icon: "🔄",
    tagline: "Mirror top performers.",
    description:
      "Automated copy-trading platform. Choose a strategy, set your risk — Copy-X does the rest. No experience required.",
    features: ["Auto-Copy", "Risk Control", "Verified Strategies"],
    color: "#10B981",
    aiLine: "Copy-X is perfect if you want results without screen time. Pick a strategy and let it run.",
    angle: -90,
    deepDive: [
      { type: "video", label: "Watch how Copy-X works", icon: "▶" },
      { type: "dashboard", label: "See live strategy results", icon: "📊" },
    ],
  },
  {
    id: "amplify",
    label: "24x Amplify",
    icon: "⚡",
    tagline: "Scale your capital.",
    description:
      "Funded trading program. Prove your skill in evaluation, get up to $200K in trading capital. Keep up to 80% of profits.",
    features: ["Up to $200K Capital", "80% Profit Split", "Fast Payouts"],
    color: "#F59E0B",
    aiLine: "24x Amplify gives skilled traders real capital. Pass the challenge, trade with our money.",
    angle: 0,
    deepDive: [
      { type: "video", label: "How the challenge works", icon: "▶" },
      { type: "calculator", label: "Calculate your amplified capital", icon: "🔢" },
    ],
  },
  {
    id: "ib",
    label: "IB Portal",
    icon: "🤝",
    tagline: "Build your network.",
    description:
      "Introducing Broker program with real-time analytics, multi-tier commissions, and a personal CRM to manage your team.",
    features: ["Multi-Tier Commissions", "Real-Time Analytics", "Personal CRM"],
    color: "#EC4899",
    aiLine: "The IB Portal turns your network into recurring income. Track everything in real time.",
    angle: 90,
    deepDive: [
      { type: "video", label: "See the partner journey", icon: "▶" },
      { type: "dashboard", label: "Explore your dashboard", icon: "🖥" },
    ],
  },
];

function useTypewriter(text: string, speed = 22, trigger = false) {
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

function HubNode({
  product,
  isActive,
  onClick,
  hubCenter,
  radius,
}: {
  product: Product;
  isActive: boolean;
  onClick: () => void;
  hubCenter: { x: number; y: number };
  radius: number;
}) {
  const rad = (product.angle * Math.PI) / 180;
  const x = hubCenter.x + Math.cos(rad) * radius;
  const y = hubCenter.y + Math.sin(rad) * radius;
  const nodeSize = isActive ? 72 : 60;

  return (
    <>
      <motion.line
        x1={hubCenter.x}
        y1={hubCenter.y}
        x2={x}
        y2={y}
        stroke={isActive ? product.color : "rgba(255,255,255,0.06)"}
        strokeWidth={isActive ? 2 : 1}
        strokeDasharray={isActive ? "none" : "4 4"}
        animate={{ stroke: isActive ? product.color : "rgba(255,255,255,0.06)" }}
        transition={{ duration: 0.4 }}
      />
      {isActive && (
        <motion.circle
          cx={x}
          cy={y}
          r={radius + 10}
          fill="none"
          stroke={product.color}
          strokeWidth={1}
          opacity={0.15}
          initial={{ r: nodeSize / 2, opacity: 0 }}
          animate={{ r: radius * 0.6, opacity: 0.15 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}
      <g
        onClick={onClick}
        style={{ cursor: "pointer" }}
        data-testid={`hub-node-${product.id}`}
      >
        <motion.circle
          cx={x}
          cy={y}
          r={nodeSize / 2}
          fill={isActive ? `${product.color}22` : GLASS}
          stroke={isActive ? product.color : GLASS_BORDER}
          strokeWidth={isActive ? 2 : 1}
          animate={{
            r: nodeSize / 2,
            fill: isActive ? `${product.color}22` : GLASS,
          }}
          transition={{ duration: 0.3 }}
        />
        <text
          x={x}
          y={y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={isActive ? 26 : 22}
          style={{ pointerEvents: "none" }}
        >
          {product.icon}
        </text>
        <text
          x={x}
          y={y + nodeSize / 2 + 18}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isActive ? product.color : "rgba(255,255,255,0.4)"}
          fontSize={11}
          fontWeight={600}
          letterSpacing="0.04em"
          style={{ pointerEvents: "none", fontFamily: "inherit" }}
        >
          {product.label}
        </text>
      </g>
    </>
  );
}

function VideoPlayer({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        background: "#000",
        border: `1px solid ${product.color}30`,
        aspectRatio: "16/9",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${product.color}15, ${BG})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <div style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${product.color} 3px, ${product.color} 4px)`,
          pointerEvents: "none",
        }} />
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: `${product.color}25`,
            border: `2px solid ${product.color}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            cursor: "pointer",
            boxShadow: `0 0 30px ${product.color}30`,
          }}
        >
          ▶
        </motion.div>
        <div style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 13,
          fontWeight: 600,
        }}>
          {product.label} — Product Overview
        </div>
        <div style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: 11,
        }}>
          2:30 min
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        data-testid="btn-close-video"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 30,
          height: 30,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.7)",
          fontSize: 14,
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
  );
}

function DeepDiveRow({ product, onVideoOpen }: { product: Product; onVideoOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{
        display: "flex",
        gap: 10,
      }}
    >
      {product.deepDive.map((dd) => (
        <motion.button
          key={dd.label}
          whileHover={{ scale: 1.03, borderColor: `${product.color}40` }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            e.stopPropagation();
            if (dd.type === "video") onVideoOpen();
          }}
          data-testid={`deep-dive-${dd.type}-${product.id}`}
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "12px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: `${product.color}12`,
            border: `1px solid ${product.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
          }}>
            {dd.icon}
          </div>
          <div style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "left" as const,
            lineHeight: 1.3,
          }}>
            {dd.label}
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  const aiText = useTypewriter(product.aiLine, 20, true);
  const [aiDone, setAiDone] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setAiDone(false);
    setShowVideo(false);
  }, [product.id]);

  useEffect(() => {
    if (aiText.length >= product.aiLine.length) {
      const t = setTimeout(() => setAiDone(true), 400);
      return () => clearTimeout(t);
    }
  }, [aiText, product.aiLine]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: `${product.color}18`,
            border: `1px solid ${product.color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          {product.icon}
        </div>
        <div>
          <div
            style={{
              color: product.color,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
            }}
          >
            {product.label}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: 1.2,
              marginTop: 2,
            }}
          >
            {product.tagline}
          </div>
        </div>
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {product.description}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
        {product.features.map((f) => (
          <div
            key={f}
            style={{
              background: `${product.color}10`,
              border: `1px solid ${product.color}25`,
              borderRadius: 20,
              padding: "6px 14px",
              color: product.color,
              fontSize: 12,
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
          borderRadius: 16,
          padding: "14px 16px",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${ACCENT2}, ${ACCENT})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
            boxShadow: `0 0 16px ${ACCENT2}40`,
          }}
        >
          ✦
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 14,
            lineHeight: 1.6,
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
          <DeepDiveRow product={product} onVideoOpen={() => setShowVideo(true)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideo && (
          <VideoPlayer product={product} onClose={() => setShowVideo(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PulsingRing({ color }: { color: string }) {
  return (
    <>
      <motion.circle
        cx={0}
        cy={0}
        r={24}
        fill="none"
        stroke={color}
        strokeWidth={1}
        initial={{ r: 24, opacity: 0.4 }}
        animate={{ r: 50, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx={0}
        cy={0}
        r={24}
        fill="none"
        stroke={color}
        strokeWidth={1}
        initial={{ r: 24, opacity: 0.3 }}
        animate={{ r: 45, opacity: 0 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.7,
        }}
      />
    </>
  );
}

export function ProductSection() {
  const [active, setActive] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProduct = PRODUCTS.find((p) => p.id === active) || null;

  const hubCenter = { x: 200, y: 180 };
  const radius = 130;

  return (
    <div
      ref={containerRef}
      data-testid="product-section"
      style={{
        minHeight: "100vh",
        background: BG,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "60px 40px 40px",
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
          background: `radial-gradient(ellipse 60% 50% at 30% 40%, ${ACCENT}08 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 70% 60%, ${ACCENT2}05 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              color: ACCENT2,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase" as const,
              marginBottom: 12,
            }}
          >
            Ecosystem
          </div>
          <h2
            style={{
              fontSize: 36,
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
              fontSize: 15,
              lineHeight: 1.6,
              marginTop: 14,
              maxWidth: 420,
            }}
          >
            Tap any product to explore. Everything is connected — trading, copying,
            scaling, earning.
          </p>
        </motion.div>

        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 40,
            alignItems: "flex-start",
            minHeight: 400,
          }}
        >
          <div style={{ flexShrink: 0, width: 400, height: 400 }}>
            <svg
              viewBox="0 0 400 400"
              width="400"
              height="400"
              style={{ overflow: "visible" }}
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g transform={`translate(${hubCenter.x}, ${hubCenter.y})`}>
                <PulsingRing color={activeProduct ? activeProduct.color : ACCENT2} />
              </g>

              <circle
                cx={hubCenter.x}
                cy={hubCenter.y}
                r={26}
                fill={`${ACCENT}30`}
                stroke={ACCENT2}
                strokeWidth={2}
              />
              <text
                x={hubCenter.x}
                y={hubCenter.y - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fff"
                fontSize={10}
                fontWeight={800}
                letterSpacing="0.08em"
                style={{ fontFamily: "inherit" }}
              >
                JetUP
              </text>
              <text
                x={hubCenter.x}
                y={hubCenter.y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255,255,255,0.25)"
                fontSize={6}
                fontWeight={500}
                letterSpacing="0.08em"
                style={{ fontFamily: "inherit" }}
              >
                powered by TAG Markets
              </text>

              {PRODUCTS.map((p) => (
                <HubNode
                  key={p.id}
                  product={p}
                  isActive={active === p.id}
                  onClick={() => setActive(active === p.id ? null : p.id)}
                  hubCenter={hubCenter}
                  radius={radius}
                />
              ))}
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingTop: 10 }}>
            <AnimatePresence mode="wait">
              {activeProduct ? (
                <ProductDetail key={activeProduct.id} product={activeProduct} />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    paddingTop: 30,
                  }}
                >
                  <div
                    style={{
                      color: "rgba(255,255,255,0.2)",
                      fontSize: 14,
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    ← Select a product to explore
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      marginTop: 10,
                    }}
                  >
                    {PRODUCTS.map((p) => (
                      <motion.div
                        key={p.id}
                        onClick={() => setActive(p.id)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        data-testid={`product-card-${p.id}`}
                        style={{
                          background: GLASS,
                          border: `1px solid ${GLASS_BORDER}`,
                          borderRadius: 14,
                          padding: "16px 14px",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = `${p.color}40`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = GLASS_BORDER;
                        }}
                      >
                        <div
                          style={{
                            fontSize: 20,
                            marginBottom: 8,
                          }}
                        >
                          {p.icon}
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {p.label}
                        </div>
                        <div
                          style={{
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 11,
                            marginTop: 4,
                          }}
                        >
                          {p.tagline}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              data-testid="btn-open-account"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`,
                border: "none",
                borderRadius: 14,
                padding: "14px 36px",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: `0 4px 24px ${ACCENT}50`,
                letterSpacing: "0.02em",
              }}
            >
              Start with {activeProduct?.label} →
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
