import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

const BG = "#0a0a12";
const SURFACE = "#0f0f16";
const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";
const TEXT_PRIMARY = "#ffffff";
const TEXT_SECONDARY = "rgba(255, 255, 255, 0.4)";
const BORDER = "rgba(255, 255, 255, 0.04)";

const ease = [0.16, 1, 0.3, 1];

function FadeReveal({ children, delay = 0, y = 30, duration = 1.2, className = "" }: { children: React.ReactNode, delay?: number, y?: number, duration?: number, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PillarSection({ number, title, subtitle, isOpen, onToggle, children }: {
  number: string; title: string; subtitle: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button 
        onClick={onToggle}
        style={{
          width: "100%", background: "none", border: "none", color: TEXT_PRIMARY,
          padding: "60px 0", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "flex-start", gap: "8vw", textAlign: "left",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 400, color: TEXT_SECONDARY, letterSpacing: "0.15em", marginTop: "14px" }}>{number}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: "40px", fontWeight: 300, letterSpacing: "-0.02em", marginBottom: "12px", color: isOpen ? TEXT_PRIMARY : TEXT_SECONDARY, transition: "color 0.8s ease" }}>{title}</h3>
          <p style={{ fontSize: "16px", fontWeight: 300, color: TEXT_SECONDARY, letterSpacing: "0.02em", opacity: isOpen ? 1 : 0, transition: "opacity 0.8s ease" }}>{subtitle}</p>
        </div>
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }} 
          transition={{ duration: 0.6, ease }}
          style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 300, color: isOpen ? TEXT_PRIMARY : TEXT_SECONDARY, marginTop: "14px" }}
        >
          +
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingBottom: "80px", paddingLeft: "calc(8vw + 30px)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NegativeSpace() {
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const opacityOut = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yOut = useTransform(scrollYProgress, [0, 0.5], [0, -50]);

  return (
    <div style={{ 
      background: BG, 
      color: TEXT_PRIMARY, 
      fontFamily: "'Montserrat', sans-serif", 
      minHeight: "100vh",
      overflowX: "hidden"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${BG}; }
        ::selection { background: ${TEXT_PRIMARY}; color: ${BG}; }
        
        .metric-value {
          font-size: 56px;
          font-weight: 200;
          letter-spacing: -0.04em;
          margin-bottom: 8px;
        }
        
        .metric-label {
          font-size: 13px;
          font-weight: 400;
          color: ${TEXT_SECONDARY};
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        padding: "40px 60px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        mixBlendMode: "difference"
      }}>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4, duration: 2 }}
          style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.2em", color: TEXT_SECONDARY }}
        >
          JETUP
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4, duration: 2 }}
          style={{ display: "flex", gap: "24px", fontSize: "12px", fontWeight: 400, letterSpacing: "0.1em", color: TEXT_SECONDARY }}
        >
          <span style={{ color: TEXT_PRIMARY }}>EN</span>
          <span style={{ cursor: "pointer" }}>DE</span>
          <span style={{ cursor: "pointer" }}>RU</span>
        </motion.div>
      </header>

      {/* Hero - Emptiness as luxury */}
      <motion.section 
        ref={heroRef}
        style={{ 
          height: "100vh", 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          alignItems: "center",
          position: "relative",
          opacity: opacityOut,
          y: yOut
        }}
      >
        <AnimatePresence>
          {/* Phase 1: Small Wordmark */}
          <motion.div
            key="wordmark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 2, ease: "easeInOut", exit: { duration: 1.5 } }}
            style={{
              position: "absolute",
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.3em",
              color: TEXT_SECONDARY,
            }}
          >
            JETUP
          </motion.div>
        </AnimatePresence>

        {/* Phase 2: Statement */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 2.5, duration: 2.5, ease: "easeOut" }}
          style={{
            position: "absolute",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            padding: "0 20px"
          }}
        >
          <h1 style={{ 
            fontSize: "clamp(32px, 5vw, 64px)", 
            fontWeight: 200, 
            letterSpacing: "-0.02em", 
            lineHeight: 1.2,
            marginBottom: "32px",
            color: TEXT_PRIMARY
          }}>
            This is not just another opportunity.<br />
            <span style={{ color: TEXT_SECONDARY }}>This is a system.</span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5, duration: 2 }}
            style={{ 
              fontSize: "clamp(14px, 1.5vw, 16px)", 
              fontWeight: 300,
              color: TEXT_SECONDARY, 
              letterSpacing: "0.04em",
              maxWidth: "600px",
              lineHeight: 1.6
            }}
          >
            Product at the center. Partner model for scale.<br />
            AI infrastructure that amplifies the leader.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 4.5, duration: 2 }}
          style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}
        >
          <motion.div 
            animate={{ y: [0, 10, 0], opacity: [0.2, 0.6, 0.2] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
            style={{ width: "1px", height: "40px", background: TEXT_PRIMARY }} 
          />
        </motion.div>
      </motion.section>

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 40px" }}>
        
        {/* Problem & Formula */}
        <section style={{ padding: "160px 0 80px" }}>
          <FadeReveal>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px" }}>
              <div>
                <p style={{ fontSize: "24px", fontWeight: 300, lineHeight: 1.6, color: TEXT_PRIMARY, letterSpacing: "-0.01em" }}>
                  The market is overheated. People see more offers — but less system. Leaders burn out on manual growth, while clients lose trust in fragmented promises.
                </p>
              </div>
              <div style={{ paddingTop: "8px" }}>
                <p style={{ fontSize: "16px", fontWeight: 300, lineHeight: 1.8, color: TEXT_SECONDARY }}>
                  We built JetUP to replace chaos with architecture. It is not a project to jump into; it is infrastructure to build upon.
                </p>
                <div style={{ marginTop: "40px", padding: "30px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: "13px", fontWeight: 400, color: TEXT_SECONDARY, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "16px" }}>The Formula</div>
                  <div style={{ fontSize: "18px", fontWeight: 300, letterSpacing: "0.02em" }}>
                    JETUP <span style={{ color: TEXT_SECONDARY }}>= Product + Partner Model + AI</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeReveal>
        </section>

        {/* Pillars */}
        <section style={{ padding: "80px 0 160px" }}>
          <FadeReveal y={0}>
            <PillarSection
              number="01"
              title="Trading Infrastructure"
              subtitle="Institutional-grade execution. Transparent product."
              isOpen={openPillar === "trading"}
              onToggle={() => setOpenPillar(openPillar === "trading" ? null : "trading")}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: TEXT_SECONDARY, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Broker</div>
                  <div style={{ fontSize: "24px", fontWeight: 300, marginBottom: "20px" }}>TAG Markets</div>
                  <p style={{ fontSize: "15px", color: TEXT_SECONDARY, lineHeight: 1.6, fontWeight: 300 }}>
                    A fully regulated institutional-grade broker. Direct market access, raw spreads, tier-1 execution. The solid product layer everything else builds upon.
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: TEXT_SECONDARY, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Strategies</div>
                  <div style={{ fontSize: "24px", fontWeight: 300, marginBottom: "20px" }}>Copy-X</div>
                  <div style={{ display: "flex", gap: "40px" }}>
                    <div>
                      <div className="metric-value" style={{ fontSize: "40px" }}>+65%</div>
                      <div className="metric-label">Sonic ROI</div>
                    </div>
                    <div>
                      <div className="metric-value" style={{ fontSize: "40px", color: TEXT_SECONDARY }}>Stable</div>
                      <div className="metric-label">NeoFX Risk</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: "60px", paddingTop: "40px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 300, marginBottom: "8px" }}>24x Amplify</div>
                  <div style={{ fontSize: "14px", color: TEXT_SECONDARY, fontWeight: 300 }}>Your deposit, multiplied for execution power.</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: 300 }}>$100</div>
                    <div style={{ fontSize: "12px", color: TEXT_SECONDARY, letterSpacing: "0.05em", marginTop: "4px" }}>Deposit</div>
                  </div>
                  <div style={{ width: "40px", height: "1px", background: BORDER }}></div>
                  <div>
                    <div style={{ fontSize: "32px", fontWeight: 300 }}>$2,400</div>
                    <div style={{ fontSize: "12px", color: TEXT_SECONDARY, letterSpacing: "0.05em", marginTop: "4px" }}>MT5 Account</div>
                  </div>
                </div>
              </div>
            </PillarSection>

            <PillarSection
              number="02"
              title="Partner Model"
              subtitle="Residual income architecture. Built for scale."
              isOpen={openPillar === "partner"}
              onToggle={() => setOpenPillar(openPillar === "partner" ? null : "partner")}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", marginBottom: "60px" }}>
                <div>
                  <div className="metric-value">$10.50</div>
                  <div className="metric-label" style={{ marginBottom: "16px" }}>Lot Commission</div>
                  <p style={{ fontSize: "15px", color: TEXT_SECONDARY, lineHeight: 1.6, fontWeight: 300 }}>
                    Earn continuous income from your network's trading volume, paid up to 10 levels deep. Real residual earnings tied to actual product activity.
                  </p>
                </div>
                <div>
                  <div className="metric-value" style={{ fontSize: "32px", marginBottom: "20px" }}>Profit Share</div>
                  <p style={{ fontSize: "15px", color: TEXT_SECONDARY, lineHeight: 1.6, fontWeight: 300, marginBottom: "32px" }}>
                    Residual income derived from client trading success. The income continues as long as clients remain active in the ecosystem.
                  </p>
                </div>
              </div>

              <div style={{ paddingTop: "40px", borderTop: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "12px", color: TEXT_SECONDARY, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "24px" }}>Infinity Bonus</div>
                <div style={{ display: "flex", gap: "60px" }}>
                  {[
                    { v: "€100K", p: "1%" },
                    { v: "€300K", p: "2%" },
                    { v: "€1M", p: "3%" }
                  ].map((item) => (
                    <div key={item.v}>
                      <div style={{ fontSize: "32px", fontWeight: 200, marginBottom: "4px" }}>{item.p}</div>
                      <div style={{ fontSize: "13px", color: TEXT_SECONDARY, fontWeight: 300 }}>from {item.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </PillarSection>

            <PillarSection
              number="03"
              title="AI Infrastructure"
              subtitle="Scale the leader. Do not replace them."
              isOpen={openPillar === "ai"}
              onToggle={() => setOpenPillar(openPillar === "ai" ? null : "ai")}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "60px" }}>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: 300, marginBottom: "16px" }}>Maria AI</div>
                  <p style={{ fontSize: "15px", color: TEXT_SECONDARY, lineHeight: 1.6, fontWeight: 300, marginBottom: "24px" }}>
                    Hybrid GPT-4 assistant with a live video avatar. Fluent in English, German, and Russian. Knows every detail of the ecosystem.
                  </p>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {["Text", "Voice", "Video"].map(mode => (
                      <div key={mode} style={{ fontSize: "12px", color: TEXT_SECONDARY, border: `1px solid ${BORDER}`, padding: "6px 12px", borderRadius: "4px" }}>{mode}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 400, marginBottom: "8px" }}>Digital Hub</div>
                      <div style={{ fontSize: "14px", color: TEXT_SECONDARY, fontWeight: 300, lineHeight: 1.5 }}>A unified point where a prospect receives information, navigates the ecosystem, and transitions seamlessly to registration.</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 400, marginBottom: "8px" }}>Automated Onboarding</div>
                      <div style={{ fontSize: "14px", color: TEXT_SECONDARY, fontWeight: 300, lineHeight: 1.5 }}>First-touch guidance that explains the steps, routing partners and clients correctly without draining the leader's bandwidth.</div>
                    </div>
                  </div>
                </div>
              </div>
            </PillarSection>
          </FadeReveal>
        </section>
        
        {/* Quote & CTA */}
        <section style={{ padding: "80px 0 160px", textAlign: "center" }}>
          <FadeReveal y={40}>
            <div style={{ maxWidth: "700px", margin: "0 auto", marginBottom: "100px" }}>
              <div style={{ fontSize: "32px", fontWeight: 200, lineHeight: 1.4, color: TEXT_PRIMARY, letterSpacing: "-0.01em" }}>
                "A newcomer sees the first commission. <br/>
                <span style={{ color: TEXT_SECONDARY }}>A leader sees income architecture.</span>"
              </div>
            </div>
            
            <button style={{
              background: TEXT_PRIMARY,
              color: BG,
              border: "none",
              padding: "20px 48px",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "transform 0.3s ease, opacity 0.3s ease",
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              Enter the System
            </button>
          </FadeReveal>
        </section>
        
        {/* Footer */}
        <footer style={{ padding: "40px 0", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: "12px", color: TEXT_SECONDARY, letterSpacing: "0.05em" }}>
          <div>© {new Date().getFullYear()} JETUP</div>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ cursor: "pointer" }}>Terms</span>
            <span style={{ cursor: "pointer" }}>Privacy</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
