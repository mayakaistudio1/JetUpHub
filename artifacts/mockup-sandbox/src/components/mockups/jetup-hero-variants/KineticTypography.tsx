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

function FadeIn({ children, delay = 0, y = 40, style }: { children: React.ReactNode; delay?: number; y?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
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

export function KineticTypography() {
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const toggle = (id: string) => setOpenPillar(prev => prev === id ? null : id);

  return (
    <div style={{ background: BG, color: TEXT_PRIMARY, fontFamily: "'Montserrat', sans-serif", overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: ${ACCENT}40; color: #fff; }
        html { scroll-behavior: smooth; }
        body { background: ${BG}; }
        .hero-word { display: inline-block; white-space: pre; }
      `}</style>

      {/* ═══════ HEADER ═══════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 80px", height: 72,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(10,10,18,0.3)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid transparent`,
        transition: "border-color 0.3s"
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.08em" }}>JETUP</div>
        <div style={{ display: "flex", gap: 20, fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.08em" }}>
          {["EN", "DE", "RU"].map((lang, i) => (
            <span key={lang} style={{ color: i === 0 ? TEXT_PRIMARY : TEXT_MUTED, cursor: "pointer", transition: "color 0.3s" }}
              onMouseOver={e => (e.currentTarget.style.color = TEXT_PRIMARY)}
              onMouseOut={e => { if (i !== 0) e.currentTarget.style.color = TEXT_MUTED; }}
            >{lang}</span>
          ))}
        </div>
      </header>

      {/* ═══════ HERO (KINETIC TYPOGRAPHY) ═══════ */}
      <motion.section
        ref={heroRef}
        style={{ 
          opacity: heroOpacity, 
          scale: heroScale, 
          height: "100vh", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          padding: "0 80px", 
          position: "relative" 
        }}
      >
        <div style={{ maxWidth: "100%", width: "100%", display: "flex", flexDirection: "column", gap: 0, position: "relative", zIndex: 2 }}>
          
          <div style={{ overflow: "hidden" }}>
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{ fontSize: "clamp(4rem, 11vw, 12rem)", fontWeight: 300, lineHeight: 0.85, letterSpacing: "-0.04em", color: TEXT_MUTED }}
            >
              THIS IS NOT
            </motion.div>
          </div>

          <div style={{ overflow: "hidden" }}>
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ fontSize: "clamp(4rem, 11vw, 12rem)", fontWeight: 600, lineHeight: 0.85, letterSpacing: "-0.03em", color: TEXT_SECONDARY }}
            >
              JUST ANOTHER
            </motion.div>
          </div>

          <div style={{ overflow: "hidden", display: "flex", alignItems: "center", gap: 32 }}>
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              style={{ fontSize: "clamp(4rem, 11vw, 12rem)", fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.02em", color: TEXT_PRIMARY }}
            >
              OPPORTUNITY.
            </motion.div>
            
            <motion.div
               initial={{ opacity: 0, scaleX: 0 }}
               animate={{ opacity: 1, scaleX: 1 }}
               transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1.4 }}
               style={{ flex: 1, height: 4, background: TEXT_PRIMARY, transformOrigin: "left", marginTop: 24 }}
            />
          </div>

          <div style={{ overflow: "hidden", marginTop: "clamp(1rem, 3vw, 4rem)" }}>
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
              style={{ fontSize: "clamp(3rem, 7vw, 8rem)", fontWeight: 300, lineHeight: 0.85, letterSpacing: "-0.02em", color: TEXT_MUTED }}
            >
              THIS IS A <motion.span 
                initial={{ opacity: 0, filter: "blur(20px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 1.8 }}
                style={{ fontWeight: 800, color: ACCENT_LIGHT }}
              >SYSTEM.</motion.span>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 2.2 }}
            style={{ marginTop: "clamp(2rem, 5vw, 6rem)", maxWidth: 600 }}
          >
            <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.6, fontWeight: 400 }}>
              <span style={{ color: TEXT_PRIMARY }}>Product</span> at the center.<br />
              <span style={{ color: TEXT_PRIMARY }}>Partner model</span> for scale.<br />
              <span style={{ color: TEXT_PRIMARY }}>AI infrastructure</span> that amplifies the leader.
            </p>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
          style={{ position: "absolute", bottom: 48, left: 80, display: "flex", alignItems: "center", gap: 16 }}
        >
          <motion.div animate={{ height: [0, 40, 0], y: [0, 20, 40] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} style={{ width: 2, background: `linear-gradient(180deg, transparent, ${TEXT_PRIMARY}, transparent)` }} />
          <span style={{ fontSize: 11, color: TEXT_MUTED, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600 }}>Scroll to explore</span>
        </motion.div>
      </motion.section>

      {/* ═══════ PROBLEM STATEMENT ═══════ */}
      <section style={{ padding: "160px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 80, alignItems: "start" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", paddingTop: 8 }}>
              The Problem
            </div>
            <div>
              <h2 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.03em", marginBottom: 40 }}>
                The market is overheated.<br />
                <span style={{ color: TEXT_SECONDARY }}>People see more offers — but less system.</span>
              </h2>
              <p style={{ fontSize: 20, color: TEXT_SECONDARY, lineHeight: 1.7, maxWidth: 700 }}>
                Leaders burn out on manual growth. Partners jump between short-lived projects. Clients lose trust in fragmented promises. The cycle repeats: entry — hope — burnout — disappointment — search again.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

      <div style={{ padding: "0 80px", maxWidth: 1200, margin: "0 auto" }}><Divider /></div>

      {/* ═══════ THE ANSWER ═══════ */}
      <section style={{ padding: "160px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 80, alignItems: "start" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", paddingTop: 8 }}>
              The Answer
            </div>
            <div>
              <h2 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 32 }}>
                JetUP replaces chaos<br />with architecture.
              </h2>
              <div style={{ display: "flex", gap: 48, marginTop: 56 }}>
                {[
                  { label: "Product", desc: "Real value. Not noise." },
                  { label: "Partner Model", desc: "Residual income. Not hype." },
                  { label: "AI Infrastructure", desc: "Scale the leader. Not replace." },
                ].map((item, i) => (
                  <FadeIn key={item.label} delay={0.15 * i} style={{ flex: 1 }}>
                    <div style={{ borderTop: `2px solid ${i === 0 ? ACCENT : BORDER}`, paddingTop: 24 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <div style={{ padding: "0 80px", maxWidth: 1200, margin: "0 auto" }}><Divider /></div>

      {/* ═══════ FORMULA BAR ═══════ */}
      <section style={{ padding: "80px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: "0.08em", color: TEXT_MUTED }}>
              <span style={{ color: TEXT_PRIMARY }}>JETUP</span> = Product + Partner Model + AI Infrastructure
            </div>
          </div>
        </FadeIn>
      </section>

      <div style={{ padding: "0 80px", maxWidth: 1200, margin: "0 auto" }}><Divider /></div>

      {/* ═══════ THREE PILLARS — INTERACTIVE ═══════ */}
      <section style={{ padding: "80px 80px 0", maxWidth: 1200, margin: "0 auto" }}>
        <FadeIn>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginBottom: 60 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Broker</div>
                <h3 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>TAG Markets</h3>
                <p style={{ fontSize: 16, color: TEXT_SECONDARY, lineHeight: 1.7, marginBottom: 32 }}>
                  A fully regulated institutional-grade broker. Direct market access, raw spreads, tier-1 execution. The product layer everything else builds on.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Fully regulated & licensed", "Raw spreads, minimal slippage", "Tier-1 banking partners", "Institutional clearing speed"].map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: TEXT_SECONDARY }}>
                      <div style={{ width: 4, height: 4, borderRadius: 2, background: ACCENT_LIGHT, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Strategies</div>
                <h3 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.02em" }}>Copy-X</h3>
                <div style={{ display: "flex", gap: 24 }}>
                  <div style={{ flex: 1, padding: 32, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Sonic</div>
                    <div style={{ fontSize: 40, fontWeight: 700, color: "#10B981", letterSpacing: "-0.03em" }}>+65%</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>ROI Active</div>
                  </div>
                  <div style={{ flex: 1, padding: 32, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>NeoFX</div>
                    <div style={{ fontSize: 40, fontWeight: 700, color: "#3B82F6", letterSpacing: "-0.03em" }}>Stable</div>
                    <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Risk-Adjusted</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "48px 56px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>24x Amplify</div>
                <div style={{ fontSize: 18, color: TEXT_SECONDARY }}>Your deposit, multiplied.</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, fontWeight: 700 }}>$100</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>Deposit</div>
                </div>
                <div style={{ fontSize: 20, color: TEXT_MUTED }}>→</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 56, fontWeight: 800, color: ACCENT_LIGHT }}>$2,400</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>MT5 Account</div>
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
            <div style={{ marginBottom: 56 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>Core Income</div>
              <h3 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8 }}>Lot Commission</h3>
              <p style={{ fontSize: 16, color: TEXT_SECONDARY, lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
                Continuous income from your network's trading volume. Not a one-time payout — ongoing residual earnings tied to real product activity.
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                <StatCard value="$10.50" label="Per Lot Traded" accent={ACCENT_LIGHT} />
                <div style={{ width: 1, height: 60, background: BORDER }} />
                <StatCard value="10" label="Levels Deep" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 48 }}>
              <div style={{ padding: 40, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Ongoing</div>
                <h4 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Profit Share</h4>
                <p style={{ fontSize: 15, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                  Residual income derived from client trading success. Income continues as long as clients remain active.
                </p>
              </div>
              <div style={{ padding: 40, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>Leadership</div>
                <h4 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Infinity Bonus</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}>
                  {[
                    { vol: "€100K", pct: "1%" },
                    { vol: "€300K", pct: "2%" },
                    { vol: "€1M", pct: "3%" },
                  ].map(row => (
                    <div key={row.vol} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
                      <span style={{ fontSize: 15, color: TEXT_SECONDARY }}>From {row.vol} Volume</span>
                      <span style={{ fontSize: 18, fontWeight: 700, color: ACCENT_LIGHT }}>{row.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ padding: "24px 0", fontSize: 20, fontWeight: 500, color: TEXT_SECONDARY, fontStyle: "italic", borderLeft: `3px solid ${ACCENT}`, paddingLeft: 24 }}>
              "A newcomer sees the first commission. A leader sees income architecture."
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, marginBottom: 56 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>The Limit</div>
                <h3 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>Why do strong leaders hit a ceiling?</h3>
                <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                  Because there is physically only one of them. Their time, energy, and personal bandwidth become the bottleneck of the entire structure.
                </p>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>The Solution</div>
                <h3 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16 }}>AI as duplication layer</h3>
                <p style={{ fontSize: 18, color: TEXT_SECONDARY, lineHeight: 1.7 }}>
                  JetUP AI doesn't replace the leader. It turns the leader's influence into a more scalable, repeatable, and accessible system.
                </p>
              </div>
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "48px 56px", display: "flex", alignItems: "center", gap: 40 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <span style={{ position: "absolute", fontSize: 28, fontWeight: 700 }}>M</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Maria AI</div>
                <div style={{ fontSize: 16, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                  Hybrid AI assistant — GPT-4 intelligence with live video avatar. Speaks German, Russian, English. Knows every detail of the ecosystem. Available 24/7.
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                {["Text", "Video", "Voice"].map(mode => (
                  <div key={mode} style={{ padding: "8px 16px", borderRadius: 100, border: `1px solid ${BORDER}`, fontSize: 13, fontWeight: 600, color: TEXT_MUTED }}>
                    {mode}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 32 }}>
              {[
                { title: "Digital Hub", desc: "Centralized knowledge base and navigation point." },
                { title: "AI Duplication", desc: "Replicate your tone, style, and onboarding flow." },
                { title: "Automated Onboarding", desc: "Guide new partners through their first 30 days." },
              ].map(item => (
                <div key={item.title} style={{ padding: 32, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16 }}>
                  <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{item.title}</h4>
                  <p style={{ fontSize: 14, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </PillarScene>
        </FadeIn>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section style={{ padding: "200px 80px", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 40 }}>
            Ready to build?
          </h2>
          <button style={{
            background: TEXT_PRIMARY, color: BG, border: "none",
            padding: "24px 64px", fontSize: 18, fontWeight: 700, borderRadius: 100,
            cursor: "pointer", transition: "transform 0.2s, opacity 0.2s",
            letterSpacing: "-0.01em"
          }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
          >
            Enter the System
          </button>
        </FadeIn>
      </section>
    </div>
  );
}
