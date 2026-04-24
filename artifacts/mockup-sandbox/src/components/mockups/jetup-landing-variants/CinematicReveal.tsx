import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "#0c0b1a";
const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";
const DARK_SURFACE = "rgba(255, 255, 255, 0.02)";
const BORDER_LIGHT = "rgba(255, 255, 255, 0.06)";

const ZONES = [
  {
    id: "trading",
    title: "Trading",
    subtitle: "Institutional-grade execution.",
    color: "#3B82F6",
    gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)",
  },
  {
    id: "partner",
    title: "Partner",
    subtitle: "Built for true scale.",
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
  },
  {
    id: "ai",
    title: "AI Operations",
    subtitle: "Your digital duplicate.",
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #A855F7, #C084FC)",
  },
];

export function CinematicReveal() {
  const [stage, setStage] = useState(0); // 0: init, 1: aurora, 2: text, 3: cards
  const [activeZone, setActiveZone] = useState<string | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500); // aurora
    const t2 = setTimeout(() => setStage(2), 3000); // text
    const t3 = setTimeout(() => setStage(3), 5000); // cards
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      overflowX: "hidden", position: "relative",
      display: "flex", flexDirection: "column",
      alignItems: "center"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        
        .aurora {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          height: 100vh;
          background: radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, transparent 60%);
          filter: blur(100px);
          pointer-events: none;
          opacity: 0;
          transition: opacity 3s ease-in-out;
          z-index: 0;
        }

        .aurora.active {
          opacity: 1;
        }
          
        .magazine-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }
      `}</style>

      {/* Ambient Light */}
      <div className={`aurora ${stage >= 1 ? 'active' : ''}`} />

      {/* Initial JetUP */}
      <AnimatePresence>
        {stage < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              fontSize: 24, fontWeight: 300, letterSpacing: "0.2em", zIndex: 10
            }}
          >
            JETUP
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 2 && !activeZone ? 1 : 0, pointerEvents: stage >= 2 && !activeZone ? "auto" : "none" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", flexDirection: "column",
          padding: "80px", zIndex: 20
        }}
      >
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "8vh" }}>
            <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: "0.1em" }}>JETUP</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>EN / DE / RU</div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 20 }}
                transition={{ duration: 1.5, delay: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
                style={{ fontSize: 96, fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.03em", maxWidth: 1000, marginBottom: 24 }}
            >
                This is not just another opportunity.<br/>
                <span style={{ color: "rgba(255,255,255,0.4)" }}>This is a system.</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: stage >= 2 ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
                style={{ fontSize: 20, color: ACCENT, letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
                JetUP = Product + Partner Model + AI Infrastructure
            </motion.p>
        </div>

        {/* The Asymmetric Cards */}
        <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : 60 }}
            transition={{ duration: 1.5, ease: [0.2, 0.65, 0.3, 0.9] }}
            style={{ 
                display: "grid", 
                gridTemplateColumns: "1.5fr 1fr 0.8fr", 
                gap: 24,
                height: "40vh"
            }}
        >
            {ZONES.map((zone, i) => (
                <motion.div
                    key={zone.id}
                    onClick={() => setActiveZone(zone.id)}
                    whileHover={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.05)" }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: DARK_SURFACE,
                        border: `1px solid ${BORDER_LIGHT}`,
                        borderRadius: 24,
                        padding: 40,
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        position: "relative",
                        overflow: "hidden"
                    }}
                >
                    <div style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, background: `radial-gradient(circle, ${zone.color}20, transparent 70%)` }} />
                    <h2 style={{ fontSize: 32, fontWeight: 500, marginBottom: 8, letterSpacing: "-0.02em" }}>{zone.title}</h2>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)" }}>{zone.subtitle}</p>
                </motion.div>
            ))}
        </motion.div>

      </motion.div>

      {/* Expanded Zone Detail */}
      <AnimatePresence>
          {activeZone && (
              <motion.div
                  initial={{ opacity: 0, filter: "blur(20px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(20px)" }}
                  transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
                  style={{
                      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                      background: BG, zIndex: 30,
                      padding: "80px 120px",
                      overflowY: "auto"
                  }}
              >
                  <button 
                      onClick={() => setActiveZone(null)}
                      style={{ 
                          background: "none", border: "none", color: "#fff", opacity: 0.5,
                          fontSize: 14, letterSpacing: "0.1em", cursor: "pointer",
                          marginBottom: 80, textTransform: "uppercase"
                      }}
                  >
                      ← Return
                  </button>

                  {activeZone === "trading" && (
                      <div className="magazine-grid">
                          <div style={{ gridColumn: "span 12", marginBottom: 60 }}>
                              <h2 style={{ fontSize: 80, fontWeight: 300, letterSpacing: "-0.03em" }}>Trading<br/><span style={{ color: "rgba(255,255,255,0.3)" }}>Infrastructure</span></h2>
                          </div>
                          
                          <div style={{ gridColumn: "span 4" }}>
                              <div style={{ fontSize: 14, color: ACCENT, letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>01. Broker</div>
                              <h3 style={{ fontSize: 32, fontWeight: 400, marginBottom: 24 }}>TAG Markets</h3>
                              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, lineHeight: 1.6, marginBottom: 24 }}>A fully regulated institutional-grade broker providing direct market access. Minimal slippage, raw spreads, tier-1 execution.</p>
                          </div>

                          <div style={{ gridColumn: "span 8" }}>
                              <div style={{ background: DARK_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 24, padding: 48, height: "100%" }}>
                                  <div style={{ fontSize: 14, color: ACCENT, letterSpacing: "0.1em", marginBottom: 32, textTransform: "uppercase" }}>02. Strategies</div>
                                  <h3 style={{ fontSize: 40, fontWeight: 400, marginBottom: 32 }}>Copy-X</h3>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                                      <div>
                                          <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>Sonic</div>
                                          <div style={{ fontSize: 48, color: "#10B981", fontWeight: 300 }}>+65%</div>
                                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>ROI Active</div>
                                      </div>
                                      <div>
                                          <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 12 }}>NeoFX</div>
                                          <div style={{ fontSize: 48, color: "#3B82F6", fontWeight: 300 }}>Stable</div>
                                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>Risk-Adjusted</div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div style={{ gridColumn: "span 12", margin: "60px 0" }}>
                              <div style={{ textAlign: "center", padding: "80px 0", borderTop: `1px solid ${BORDER_LIGHT}`, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                                  <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>24x Amplify Calculator</div>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
                                      <div style={{ fontSize: 64, fontWeight: 300 }}>$100</div>
                                      <div style={{ fontSize: 24, color: ACCENT }}>→</div>
                                      <div style={{ fontSize: 80, fontWeight: 400, color: ACCENT }}>$2,400</div>
                                  </div>
                              </div>
                          </div>

                          <div style={{ gridColumn: "span 12" }}>
                              <div style={{ fontSize: 14, color: ACCENT, letterSpacing: "0.1em", marginBottom: 32, textTransform: "uppercase" }}>Quick Start</div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
                                  {["Register", "Verify KYC", "Fund", "Token", "Copy-X"].map((step, i) => (
                                      <div key={i} style={{ borderTop: `2px solid ${i === 0 ? ACCENT : BORDER_LIGHT}`, paddingTop: 24 }}>
                                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>0{i+1}</div>
                                          <div style={{ fontSize: 18 }}>{step}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {activeZone === "partner" && (
                      <div className="magazine-grid">
                          <div style={{ gridColumn: "span 12", marginBottom: 60 }}>
                              <h2 style={{ fontSize: 80, fontWeight: 300, letterSpacing: "-0.03em" }}>Partner<br/><span style={{ color: "rgba(255,255,255,0.3)" }}>Ecosystem</span></h2>
                          </div>
                          
                          <div style={{ gridColumn: "span 6" }}>
                              <div style={{ fontSize: 14, color: "#EC4899", letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>Core Income</div>
                              <h3 style={{ fontSize: 48, fontWeight: 300, marginBottom: 24 }}>Lot Commission</h3>
                              <div style={{ fontSize: 80, color: "#EC4899", fontWeight: 300, marginBottom: 16 }}>$10.50</div>
                              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 20, marginBottom: 40 }}>per lot. 10 levels deep.</p>
                              <div style={{ fontSize: 32, fontWeight: 300, marginBottom: 16 }}>Profit Share</div>
                              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 18 }}>Residual income derived directly from client trading success.</p>
                          </div>

                          <div style={{ gridColumn: "span 6" }}>
                              <div style={{ background: DARK_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 24, padding: 48 }}>
                                  <div style={{ fontSize: 14, color: "#EC4899", letterSpacing: "0.1em", marginBottom: 32, textTransform: "uppercase" }}>Elite Rewards</div>
                                  <h3 style={{ fontSize: 32, fontWeight: 300, marginBottom: 40 }}>Infinity Bonus</h3>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${BORDER_LIGHT}`, paddingBottom: 24 }}>
                                          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>€100K Volume</span>
                                          <span style={{ fontSize: 24, color: "#EC4899" }}>1%</span>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${BORDER_LIGHT}`, paddingBottom: 24 }}>
                                          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>€300K Volume</span>
                                          <span style={{ fontSize: 24, color: "#EC4899" }}>2%</span>
                                      </div>
                                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${BORDER_LIGHT}`, paddingBottom: 24 }}>
                                          <span style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>€1M Volume</span>
                                          <span style={{ fontSize: 24, color: "#EC4899" }}>3%</span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {activeZone === "ai" && (
                      <div className="magazine-grid">
                          <div style={{ gridColumn: "span 12", marginBottom: 60 }}>
                              <h2 style={{ fontSize: 80, fontWeight: 300, letterSpacing: "-0.03em" }}>AI<br/><span style={{ color: "rgba(255,255,255,0.3)" }}>Operations</span></h2>
                          </div>
                          
                          <div style={{ gridColumn: "span 5" }}>
                              <div style={{ position: "relative", width: "100%", aspectRatio: "3/4", background: DARK_SURFACE, borderRadius: 24, overflow: "hidden" }}>
                                  <img src="/__mockup/images/maria-avatar.png" alt="Maria AI" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} onError={(e) => e.currentTarget.style.display = 'none'} />
                                  <div style={{ position: "absolute", bottom: 32, left: 32 }}>
                                      <div style={{ fontSize: 14, color: ACCENT2, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>Assistant</div>
                                      <div style={{ fontSize: 32, fontWeight: 400 }}>Maria AI</div>
                                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Text + Video • DE / RU / EN</div>
                                  </div>
                              </div>
                          </div>

                          <div style={{ gridColumn: "span 7", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 40 }}>
                              <h3 style={{ fontSize: 48, fontWeight: 300, marginBottom: 40, lineHeight: 1.2 }}>
                                  "AI doesn't replace the leader.<br/>
                                  <span style={{ color: ACCENT2 }}>It makes the leader stronger.</span>"
                              </h3>
                              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 40 }}>
                                  Your digital duplicate. The AI Digital Hub manages onboarding, duplicates your presentation style, and scales your presence infinitely across timezones and languages.
                              </div>
                              <div style={{ fontSize: 14, color: ACCENT2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                  Digital Hub • AI Duplication • 24/7 Availability
                              </div>
                          </div>
                      </div>
                  )}

              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
