import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

const BG = "#0a0a12";
const SURFACE = "#101018";
const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";
const BORDER = "rgba(255,255,255,0.06)";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "rgba(255,255,255,0.5)";
const TEXT_MUTED = "rgba(255,255,255,0.3)";

const ease = [0.22, 1, 0.36, 1];

function FadeIn({ children, delay = 0, y = 40, style, once = true }: { children: React.ReactNode; delay?: number; y?: number; style?: React.CSSProperties; once?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1.2, delay, ease }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function Divider() {
  return <div style={{ width: "100%", height: 1, background: BORDER, margin: "0 auto" }} />;
}

function PillarScene({ id, number, title, subtitle, isOpen, onToggle, children }: {
  id: string; number: string; title: string; subtitle: string;
  isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <motion.div layout style={{ borderBottom: `1px solid ${BORDER}` }}>
      <motion.button
        onClick={onToggle}
        layout
        style={{
          width: "100%", background: "none", border: "none", color: TEXT_PRIMARY,
          padding: "64px 0", cursor: "pointer", fontFamily: "'Montserrat', sans-serif",
          display: "grid", gridTemplateColumns: "80px 1fr auto", alignItems: "center", gap: 40,
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: TEXT_MUTED, letterSpacing: "0.1em" }}>{number}</span>
        <div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 18, color: TEXT_SECONDARY, marginTop: 8, fontWeight: 400 }}>{subtitle}</div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.5, ease }}
          style={{ width: 48, height: 48, borderRadius: "50%", border: `1px solid ${isOpen ? ACCENT : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: isOpen ? ACCENT : TEXT_MUTED, transition: "border-color 0.4s, color 0.4s" }}
        >
          +
        </motion.div>
      </motion.button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.7, ease }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingBottom: 80, paddingLeft: 120 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatCard({ value, label, accent }: { value: string; label: string; accent?: string }) {
  return (
    <div style={{ padding: "40px 0" }}>
      <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: "-0.03em", color: accent || TEXT_PRIMARY, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 15, color: TEXT_SECONDARY, marginTop: 12, fontWeight: 400, letterSpacing: "0.02em" }}>{label}</div>
    </div>
  );
}

export function SplitManifesto() {
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const toggle = (id: string) => setOpenPillar(prev => prev === id ? null : id);

  return (
    <div style={{ background: BG, color: TEXT_PRIMARY, fontFamily: "'Montserrat', sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${ACCENT}40; color: #fff; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; }
        
        .split-hero-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          position: relative;
        }

        .split-left {
          flex: 0 0 45%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 80px;
          border-right: 1px solid ${BORDER};
          overflow: hidden;
        }

        .split-right {
          flex: 0 0 55%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 120px 0 100px;
          position: relative;
        }

        .giant-wordmark {
          font-size: 28vw;
          font-weight: 900;
          line-height: 0.75;
          letter-spacing: -0.06em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.04);
          transform: rotate(-90deg);
          transform-origin: right center;
          position: absolute;
          right: 20px;
          white-space: nowrap;
          pointer-events: none;
        }

        .giant-wordmark-fill {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 30%, ${TEXT_PRIMARY} 70%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          opacity: 0.1;
        }
      `}</style>

      {/* ═══════ HEADER ═══════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 60px", height: 80,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        mixBlendMode: "difference"
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "0.1em", color: "#fff" }}>JETUP</div>
        <div style={{ display: "flex", gap: 32, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
          {["EN", "DE", "RU"].map((lang, i) => (
            <span key={lang} style={{ color: i === 0 ? "#fff" : "inherit", cursor: "pointer", transition: "color 0.3s" }}
              onMouseOver={e => (e.currentTarget.style.color = "#fff")}
              onMouseOut={e => { if (i !== 0) e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >{lang}</span>
          ))}
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity }} className="split-hero-container">
        {/* Glow effect */}
        <div style={{ position: "absolute", top: "20%", right: "10%", width: "40vw", height: "40vw", background: `radial-gradient(circle, ${ACCENT}08 0%, transparent 70%)`, borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />

        <div className="split-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="giant-wordmark"
          >
            JETUP
            <div className="giant-wordmark-fill">JETUP</div>
          </motion.div>
        </div>

        <div className="split-right">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.4, delay: 0.6, ease }}
            style={{ position: "relative", zIndex: 2 }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 32 }}>
              Digital Infrastructure Platform
            </div>

            <h1 style={{ fontSize: "5.5vw", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 40 }}>
              This is not just<br />
              <span style={{ color: TEXT_SECONDARY }}>another opportunity.</span>
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 56 }}>
              <div style={{ width: 60, height: 1, background: `linear-gradient(90deg, ${ACCENT}, transparent)` }} />
              <span style={{ fontSize: 32, fontWeight: 400, color: TEXT_PRIMARY, letterSpacing: "-0.02em" }}>
                This is a <span style={{ fontWeight: 700 }}>system.</span>
              </span>
            </div>

            <p style={{ fontSize: 18, color: TEXT_SECONDARY, maxWidth: 520, lineHeight: 1.7, fontWeight: 400 }}>
              Product at the center. Partner model for scale.<br />
              AI infrastructure that amplifies the leader.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          style={{ position: "absolute", bottom: 40, left: "45%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 16 }}
        >
          <span style={{ fontSize: 11, color: TEXT_MUTED, letterSpacing: "0.2em", textTransform: "uppercase", transform: "rotate(-90deg)", transformOrigin: "right center", display: "inline-block", marginRight: 8 }}>Scroll</span>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} style={{ width: 1, height: 40, background: `linear-gradient(180deg, ${TEXT_MUTED}, transparent)` }} />
        </motion.div>
      </motion.section>

      {/* ═══════ PROBLEM STATEMENT ═══════ */}
      <section style={{ padding: "160px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 120, alignItems: "start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 32 }}>
                The Problem
              </div>
              <h2 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
                The market is overheated.
              </h2>
            </div>
            <div style={{ paddingTop: 24 }}>
              <p style={{ fontSize: 24, color: TEXT_PRIMARY, lineHeight: 1.5, marginBottom: 32, fontWeight: 500, letterSpacing: "-0.01em" }}>
                People see more offers — but less system.
              </p>
              <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                Leaders burn out on manual growth. Partners jump between short-lived projects. Clients lose trust in fragmented promises. The cycle repeats: entry — hope — burnout — disappointment — search again.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <div style={{ padding: "0 80px", maxWidth: 1400, margin: "0 auto" }}><Divider /></div>

      {/* ═══════ THE ANSWER ═══════ */}
      <section style={{ padding: "160px 80px", maxWidth: 1400, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 120, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 32 }}>
                The Answer
              </div>
              <h2 style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: 40 }}>
                JetUP replaces chaos with <span style={{ color: ACCENT_LIGHT }}>architecture.</span>
              </h2>
            </div>
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
                {[
                  { label: "Product", desc: "Real value. Not noise." },
                  { label: "Partner Model", desc: "Residual income. Not hype." },
                  { label: "AI Infrastructure", desc: "Scale the leader. Not replace." },
                ].map((item, i) => (
                  <FadeIn key={item.label} delay={0.1 * i}>
                    <div style={{ borderLeft: `2px solid ${i === 0 ? ACCENT : BORDER}`, paddingLeft: 32 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>{item.label}</div>
                      <div style={{ fontSize: 16, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <div style={{ background: SURFACE }}>
        {/* ═══════ FORMULA BAR ═══════ */}
        <section style={{ padding: "80px", maxWidth: 1400, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.08em", color: TEXT_MUTED }}>
                <span style={{ color: TEXT_PRIMARY }}>JETUP</span> = Product + Partner Model + AI Infrastructure
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ═══════ THREE PILLARS — INTERACTIVE ═══════ */}
        <section style={{ padding: "40px 80px 160px", maxWidth: 1200, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 40 }}>
              The Ecosystem
            </div>
          </FadeIn>

          {/* ── TRADING ── */}
          <FadeIn delay={0.1}>
            <PillarScene
              id="trading" number="01" title="Trading Infrastructure"
              subtitle="Institutional-grade execution. Transparent product."
              isOpen={openPillar === "trading"} onToggle={() => toggle("trading")}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginBottom: 60 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Broker</div>
                  <h3 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>TAG Markets</h3>
                  <p style={{ fontSize: 16, color: TEXT_SECONDARY, lineHeight: 1.7, marginBottom: 32 }}>
                    A fully regulated institutional-grade broker. Direct market access, raw spreads, tier-1 execution. The product layer everything else builds on.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {["Fully regulated & licensed", "Raw spreads, minimal slippage", "Tier-1 banking partners", "Institutional clearing speed"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 15, color: TEXT_SECONDARY }}>
                        <div style={{ width: 6, height: 6, borderRadius: 3, background: ACCENT_LIGHT, flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Strategies</div>
                  <h3 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>Copy-X</h3>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ flex: 1, padding: 32, background: BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Sonic</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#10B981", letterSpacing: "-0.03em" }}>+65%</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>ROI Active</div>
                    </div>
                    <div style={{ flex: 1, padding: 32, background: BG, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>NeoFX</div>
                      <div style={{ fontSize: 40, fontWeight: 700, color: "#3B82F6", letterSpacing: "-0.03em" }}>Stable</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Risk-Adjusted</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "48px 56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>24x Amplify</div>
                  <div style={{ fontSize: 20, color: TEXT_PRIMARY, fontWeight: 500 }}>Your deposit, multiplied.</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, fontWeight: 700 }}>$100</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 8 }}>Deposit</div>
                  </div>
                  <div style={{ fontSize: 24, color: TEXT_MUTED, fontWeight: 300 }}>→</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 56, fontWeight: 800, color: ACCENT_LIGHT }}>$2,400</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 8 }}>MT5 Account</div>
                  </div>
                </div>
              </div>
            </PillarScene>
          </FadeIn>

          {/* ── PARTNER ── */}
          <FadeIn delay={0.2}>
            <PillarScene
              id="partner" number="02" title="Partner Model"
              subtitle="Residual income architecture. Built for leaders."
              isOpen={openPillar === "partner"} onToggle={() => toggle("partner")}
            >
              <div style={{ marginBottom: 64 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Core Income</div>
                <h3 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>Lot Commission</h3>
                <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.7, maxWidth: 680, marginBottom: 40 }}>
                  Continuous income from your network's trading volume. Not a one-time payout — ongoing residual earnings tied to real product activity.
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 40 }}>
                  <StatCard value="$10.50" label="Per Lot Traded" accent={ACCENT_LIGHT} />
                  <div style={{ width: 1, height: 60, background: BORDER }} />
                  <StatCard value="10" label="Levels Deep" />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginBottom: 48 }}>
                <div style={{ padding: 48, background: BG, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Ongoing</div>
                  <h4 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Profit Share</h4>
                  <p style={{ fontSize: 16, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                    Residual income derived from client trading success. Income continues as long as clients remain active.
                  </p>
                </div>
                <div style={{ padding: 48, background: BG, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Leadership</div>
                  <h4 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Infinity Bonus</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
                    {[
                      { vol: "€100K", pct: "1%" },
                      { vol: "€300K", pct: "2%" },
                      { vol: "€1M", pct: "3%" },
                    ].map(row => (
                      <div key={row.vol} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
                        <span style={{ fontSize: 16, color: TEXT_SECONDARY }}>From {row.vol} Volume</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: ACCENT_LIGHT }}>{row.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PillarScene>
          </FadeIn>

          {/* ── AI ── */}
          <FadeIn delay={0.3}>
            <PillarScene
              id="ai" number="03" title="AI Infrastructure"
              subtitle="Scale the leader. Not replace the leader."
              isOpen={openPillar === "ai"} onToggle={() => toggle("ai")}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, marginBottom: 64 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>The Limit</div>
                  <h3 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>Why do strong leaders hit a ceiling?</h3>
                  <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                    Because there is physically only one of them. Their time, energy, and personal bandwidth become the bottleneck of the entire structure.
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>The Solution</div>
                  <h3 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>AI as duplication layer</h3>
                  <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                    JetUP AI doesn't replace the leader. It turns the leader's influence into a more scalable, repeatable, and accessible system.
                  </p>
                </div>
              </div>

              <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "48px 56px", display: "flex", alignItems: "center", gap: 48 }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                  <img src="/images/maria-avatar.png" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = 'none')} />
                  <span style={{ position: "absolute", fontSize: 32, fontWeight: 700, zIndex: 0 }}>M</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Maria AI Assistant</div>
                  <div style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                    Hybrid AI assistant — GPT-4 intelligence with live video avatar. Speaks German, Russian, English. Knows every detail of the ecosystem. Available 24/7.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                  {["Text", "Video", "Voice"].map(mode => (
                    <div key={mode} style={{ padding: "10px 24px", borderRadius: 100, border: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 600, color: TEXT_MUTED }}>
                      {mode}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, marginTop: 40 }}>
                {[
                  { title: "Digital Hub", desc: "Single entry point for information and routing." },
                  { title: "AI Duplication", desc: "Replicate your style and answers automatically." },
                  { title: "Automated Onboarding", desc: "Guide new partners through their first steps." },
                ].map(feature => (
                  <div key={feature.title} style={{ padding: 32, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{feature.title}</div>
                    <div style={{ fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{feature.desc}</div>
                  </div>
                ))}
              </div>
            </PillarScene>
          </FadeIn>
        </section>
      </div>

      {/* ═══════ QUOTE SECTION ═══════ */}
      <section style={{ padding: "160px 80px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.3, letterSpacing: "-0.02em", color: TEXT_PRIMARY, fontStyle: "italic", maxWidth: 900, margin: "0 auto" }}>
            "A newcomer sees the first commission.<br />
            <span style={{ color: TEXT_SECONDARY }}>A leader sees income architecture.</span>"
          </div>
        </FadeIn>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section style={{ padding: "0 80px 160px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 24, padding: "80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "100%", background: `radial-gradient(ellipse at top, ${ACCENT}20 0%, transparent 70%)`, pointerEvents: "none" }} />
            
            <h2 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 24, position: "relative", zIndex: 1 }}>
              Ready to enter the system?
            </h2>
            <p style={{ fontSize: 20, color: TEXT_SECONDARY, marginBottom: 48, maxWidth: 600, margin: "0 auto 48px", position: "relative", zIndex: 1 }}>
              Stop searching for the next project. Start building your architecture.
            </p>
            <button style={{
              background: TEXT_PRIMARY, color: BG, border: "none", padding: "20px 48px",
              fontSize: 16, fontWeight: 700, borderRadius: 100, cursor: "pointer",
              letterSpacing: "0.05em", textTransform: "uppercase", position: "relative", zIndex: 1,
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Access Digital Hub
            </button>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
