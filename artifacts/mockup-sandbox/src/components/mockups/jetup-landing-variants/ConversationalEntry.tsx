import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "#0c0b1a";
const ACCENT = "#7C3AED";
const ACCENT2 = "#A855F7";
const DARK_SURFACE = "rgba(255, 255, 255, 0.02)";
const BORDER_LIGHT = "rgba(255, 255, 255, 0.06)";

type Interest = "trading" | "partner" | "ai";

const INTERESTS = [
  {
    id: "trading" as Interest,
    label: "I want to grow my capital",
    icon: "📊",
    color: "#3B82F6",
    mariaResponse: "Excellent choice. Institutional-grade execution is the foundation of structured growth. Let me show you our trading infrastructure.",
  },
  {
    id: "partner" as Interest,
    label: "I want to build a team",
    icon: "🤝",
    color: "#EC4899",
    mariaResponse: "A true leader's mindset. Building a robust organization requires a scalable ecosystem. Here is our partner model.",
  },
  {
    id: "ai" as Interest,
    label: "I want to scale with AI",
    icon: "🧠",
    color: "#A855F7",
    mariaResponse: "Scaling efficiently requires digital duplication. Our AI infrastructure makes leaders stronger. Let's explore.",
  },
];

function SubBlock({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div 
      layout
      style={{
        background: open ? "rgba(255, 255, 255, 0.03)" : DARK_SURFACE, 
        border: `1px solid ${open ? "rgba(255, 255, 255, 0.1)" : BORDER_LIGHT}`,
        borderRadius: 20, overflow: "hidden", marginBottom: 16,
        transition: "all 0.3s ease"
      }}
    >
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none", color: "#fff",
        padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", fontFamily: "inherit", fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em"
      }}>
        {title}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ color: "rgba(255,255,255,0.3)" }}>
          ↓
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 32px 32px", color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.7 }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ConversationalEntry() {
  const [step, setStep] = useState<"intro" | "response" | "content">("intro");
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);

  const handleSelect = (interest: Interest) => {
    setSelectedInterest(interest);
    setStep("response");
    setTimeout(() => {
      setStep("content");
    }, 3000);
  };

  const activeData = INTERESTS.find(i => i.id === selectedInterest);

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif",
      overflowX: "hidden", position: "relative", display: "flex", flexDirection: "column"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes glow-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
      `}</style>

      {/* Ambient Background */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60vw", height: "60vw", background: `radial-gradient(circle, ${ACCENT}15 0%, transparent 60%)`, borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${ACCENT2}10 0%, transparent 60%)`, borderRadius: "50%", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyNmZmYnIGZpbGwtb3BhY2l0eT0nMC4wMScvPjwvc3ZnPg==')", opacity: 0.3 }} />
      </div>

      {/* Header */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, padding: "24px 60px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        zIndex: 100, background: "rgba(12, 11, 26, 0.7)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${BORDER_LIGHT}`
      }}>
        <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.04em", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 0 20px ${ACCENT}40` }}>J</div>
          JetUP
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
          <span style={{ color: "#fff", cursor: "pointer" }}>EN</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>DE</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>RU</span>
        </div>
      </header>

      {/* Main Area */}
      <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", paddingTop: 100 }}>
        
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}
            >
              <div style={{ position: "relative", marginBottom: 48 }}>
                <div style={{ width: 140, height: 140, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, boxShadow: `0 0 60px ${ACCENT}60`, zIndex: 2, position: "relative" }}>
                  <img src="/__mockup/images/maria-avatar.png" alt="Maria" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = 'none'} />
                  <span style={{position: 'absolute'}}>M</span>
                </div>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)`, animation: "glow-pulse 4s infinite", zIndex: 1 }} />
              </div>
              
              <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 64, textAlign: "center" }}>
                What brought you here today?
              </h1>

              <div style={{ display: "flex", gap: 24, maxWidth: 1200, width: "100%", justifyContent: "center" }}>
                {INTERESTS.map((interest, i) => (
                  <motion.button
                    key={interest.id}
                    onClick={() => handleSelect(interest.id)}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                    whileHover={{ y: -8, background: "rgba(255, 255, 255, 0.05)", borderColor: interest.color }}
                    style={{
                      background: DARK_SURFACE, border: `1px solid ${BORDER_LIGHT}`, borderRadius: 24, padding: "40px 32px",
                      cursor: "pointer", transition: "all 0.3s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
                      width: 320, color: "#fff", fontFamily: "inherit"
                    }}
                  >
                    <div style={{ fontSize: 40 }}>{interest.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em" }}>{interest.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "response" && activeData && (
            <motion.div
              key="response"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, maxWidth: 600 }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: `0 0 40px ${ACCENT}50` }}>
                  <img src="/__mockup/images/maria-avatar.png" alt="Maria" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = 'none'} />
                  <span style={{position: 'absolute', fontSize: 32}}>M</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER_LIGHT}`, padding: "32px 40px", borderRadius: 32, backdropFilter: "blur(20px)", position: "relative" }}>
                  <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 20, height: 20, background: "rgba(255,255,255,0.05)", borderLeft: `1px solid ${BORDER_LIGHT}`, borderTop: `1px solid ${BORDER_LIGHT}` }} />
                  <p style={{ fontSize: 24, lineHeight: 1.5, fontWeight: 400, textAlign: "center", letterSpacing: "-0.01em" }}>
                    "{activeData.mariaResponse}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "content" && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flex: 1, maxWidth: 1400, margin: "0 auto", width: "100%", padding: "40px 60px" }}
            >
              {/* Sidebar navigation / Maria context */}
              <div style={{ width: 320, flexShrink: 0, paddingRight: 60, position: "sticky", top: 140, height: "fit-content" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 48, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 20, border: `1px solid ${BORDER_LIGHT}`, backdropFilter: "blur(12px)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT2})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <img src="/__mockup/images/maria-avatar.png" alt="Maria" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = 'none'} />
                    <span style={{position: 'absolute', fontSize: 20}}>M</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Maria AI</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Guiding your tour</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {INTERESTS.map(interest => (
                    <button
                      key={interest.id}
                      onClick={() => setSelectedInterest(interest.id)}
                      style={{
                        background: selectedInterest === interest.id ? "rgba(255,255,255,0.08)" : "transparent",
                        border: "none", color: selectedInterest === interest.id ? "#fff" : "rgba(255,255,255,0.4)",
                        padding: "16px 20px", borderRadius: 16, textAlign: "left", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 12, fontSize: 16, fontWeight: 600, transition: "all 0.2s",
                        fontFamily: "inherit"
                      }}
                    >
                      <span style={{ fontSize: 20, opacity: selectedInterest === interest.id ? 1 : 0.5 }}>{interest.icon}</span>
                      {interest.id === "trading" ? "Trading" : interest.id === "partner" ? "Partner Model" : "AI Operations"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div style={{ flex: 1, paddingBottom: 120 }}>
                {selectedInterest === "trading" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <div style={{ marginBottom: 48 }}>
                      <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>Trading Infrastructure</h2>
                      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 600, lineHeight: 1.6 }}>Institutional-grade execution, fully regulated conditions, and automated scaling strategies.</p>
                    </div>

                    <SubBlock title="TAG Markets" defaultOpen>
                      <p style={{ marginBottom: 16 }}>The foundation of our trading ecosystem. A fully regulated institutional-grade broker providing direct market access.</p>
                      <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0 }}>
                        {["Regulation: Fully compliant and licensed", "Payout Speed: Institutional clearing", "Scale: Built for high-volume execution"].map(item => (
                          <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ color: "#3B82F6" }}>✓</span> {item}</li>
                        ))}
                      </ul>
                    </SubBlock>

                    <SubBlock title="Copy-X Strategies">
                      <p style={{ marginBottom: 24 }}>Seamless copy-trading connection via Community Token. Mirror top performers without managing positions yourself.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}` }}>
                          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sonic</div>
                          <div style={{ color: "#10B981", fontSize: 24, fontWeight: 800 }}>+65% ROI</div>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>Aggressive growth strategy.</div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, border: `1px solid ${BORDER_LIGHT}` }}>
                          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>NeoFX</div>
                          <div style={{ color: "#3B82F6", fontSize: 24, fontWeight: 800 }}>Stable</div>
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>Risk-adjusted algorithmic approach.</div>
                        </div>
                      </div>
                    </SubBlock>

                    <SubBlock title="24x Amplify Calculator">
                      <div style={{ background: "rgba(0,0,0,0.4)", padding: 32, borderRadius: 20, border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", background: "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1))" }} />
                        <div>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Initial Deposit</div>
                          <div style={{ fontSize: 40, fontWeight: 800 }}>$100</div>
                        </div>
                        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.2)" }}>→</div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: "#3B82F6", marginBottom: 4 }}>24x Leverage</div>
                          <div style={{ height: 2, background: "#3B82F6", width: 40, margin: "0 auto" }} />
                        </div>
                        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.2)" }}>→</div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Trading Account</div>
                          <div style={{ fontSize: 48, fontWeight: 900, color: "#3B82F6" }}>$2,400</div>
                        </div>
                      </div>
                    </SubBlock>
                    
                    <SubBlock title="Quick Start Timeline">
                      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingLeft: 12, borderLeft: "2px solid rgba(255,255,255,0.1)" }}>
                        {[
                          "Register on TAG Markets portal",
                          "Verify your identity (KYC)",
                          "Fund your account",
                          "Enter Community Token",
                          "Connect to Copy-X Strategy"
                        ].map((step, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <div style={{ position: "absolute", left: -19, top: 4, width: 12, height: 12, borderRadius: "50%", background: "#3B82F6", border: "2px solid #0c0b1a" }} />
                            <div style={{ fontSize: 14, color: "#3B82F6", fontWeight: 700, marginBottom: 4 }}>Step 0{i + 1}</div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "#fff" }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </SubBlock>
                  </motion.div>
                )}

                {selectedInterest === "partner" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <div style={{ marginBottom: 48 }}>
                      <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>Partner Ecosystem</h2>
                      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 600, lineHeight: 1.6 }}>Built for true scale. A residual income model that rewards leadership and structure.</p>
                    </div>

                    <SubBlock title="Lot Commission" defaultOpen>
                      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ marginBottom: 16 }}>Earn continuous income from your network's trading volume. The core of our residual income model.</p>
                          <div style={{ fontSize: 48, fontWeight: 900, color: "#EC4899", marginBottom: 8 }}>$10.50</div>
                          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>per lot traded in your network</div>
                        </div>
                        <div style={{ width: 1, height: 80, background: BORDER_LIGHT }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>10 Levels Deep</div>
                          <p style={{ color: "rgba(255,255,255,0.5)" }}>Commissions cascade through your organization.</p>
                        </div>
                      </div>
                    </SubBlock>

                    <SubBlock title="Profit Share & Infinity Bonus">
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <div style={{ background: "rgba(0,0,0,0.3)", padding: 32, borderRadius: 20, border: `1px solid ${BORDER_LIGHT}` }}>
                          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Profit Share</div>
                          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Ongoing income derived directly from client trading success.</p>
                          <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 8, display: "inline-block", fontSize: 14, fontWeight: 600 }}>Recurring Residual</div>
                        </div>
                        <div style={{ background: "rgba(236, 72, 153, 0.05)", padding: 32, borderRadius: 20, border: "1px solid rgba(236, 72, 153, 0.2)" }}>
                          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Infinity Bonus</div>
                          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Differential bonus with no depth limit.</p>
                          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                            <li style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.5)" }}>From €100K Vol</span> <span style={{ fontWeight: 700, color: "#EC4899" }}>1% Bonus</span></li>
                            <li style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.5)" }}>From €300K Vol</span> <span style={{ fontWeight: 700, color: "#EC4899" }}>2% Bonus</span></li>
                            <li style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "rgba(255,255,255,0.5)" }}>From €1M Vol</span> <span style={{ fontWeight: 700, color: "#EC4899" }}>3% Bonus</span></li>
                          </ul>
                        </div>
                      </div>
                    </SubBlock>
                    
                    <SubBlock title="Lifestyle Rewards">
                      <p style={{ marginBottom: 24 }}>Achieve milestones, unlock tangible rewards. Not just digital numbers, but real-world recognition.</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                        {["Luxury Travel", "Rolex Watch", "Real Estate"].map((item, i) => (
                          <div key={item} style={{ height: 120, background: "rgba(0,0,0,0.4)", borderRadius: 16, border: `1px solid ${BORDER_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.15), transparent)`, pointerEvents: "none" }} />
                            <div style={{ fontSize: 16, fontWeight: 700, zIndex: 1 }}>{item}</div>
                          </div>
                        ))}
                      </div>
                    </SubBlock>
                  </motion.div>
                )}

                {selectedInterest === "ai" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                    <div style={{ marginBottom: 48 }}>
                      <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>AI Operations</h2>
                      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 600, lineHeight: 1.6 }}>AI doesn't replace the leader. It makes the leader stronger.</p>
                    </div>

                    <SubBlock title="Maria AI Assistant" defaultOpen>
                      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Your 24/7 Expert</h3>
                          <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24, lineHeight: 1.6 }}>Maria handles initial inquiries, explains complex products, and guides partners through onboarding. Available in Text & Video formats.</p>
                          <div style={{ display: "flex", gap: 12 }}>
                            {["English", "German", "Russian"].map(lang => (
                              <span key={lang} style={{ padding: "6px 16px", background: "rgba(168, 85, 247, 0.1)", color: "#A855F7", borderRadius: 100, fontSize: 14, fontWeight: 600 }}>{lang}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ width: 160, height: 160, borderRadius: 32, background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER_LIGHT}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                           <img src="/__mockup/images/maria-avatar.png" alt="Maria" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.currentTarget.style.display = 'none'} />
                        </div>
                      </div>
                    </SubBlock>

                    <SubBlock title="Digital Hub">
                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 32, borderRadius: 20, border: `1px solid ${BORDER_LIGHT}` }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Centralized Knowledge Base</h3>
                        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>A unified interface containing presentations, tutorials, and marketing assets dynamically updated and searchable by AI.</p>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                          {["Presentations", "B-Rolls", "Step-by-Step Guides", "Compliance Docs"].map(item => (
                            <div key={item} style={{ background: "rgba(255,255,255,0.05)", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500 }}>{item}</div>
                          ))}
                        </div>
                      </div>
                    </SubBlock>

                    <SubBlock title="AI Duplication">
                      <div style={{ textAlign: "center", padding: "40px 20px" }}>
                        <div style={{ fontSize: 48, marginBottom: 24 }}>⚡️</div>
                        <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Perfect Duplication at Scale</h3>
                        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                          When every team member has access to the exact same high-level expertise via Maria AI, the message never degrades down the line. 
                        </p>
                      </div>
                    </SubBlock>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
      
      {/* Floating System Formula */}
      <div style={{ position: "fixed", bottom: 40, left: 60, right: 60, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 100 }}>
        <div style={{ background: "rgba(12, 11, 26, 0.8)", backdropFilter: "blur(24px)", border: `1px solid ${BORDER_LIGHT}`, padding: "16px 32px", borderRadius: 100, display: "flex", alignItems: "center", gap: 16, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>JETUP</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>=</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#3B82F6" }}>Product</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>+</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#EC4899" }}>Partner Model</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>+</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#A855F7" }}>AI Infrastructure</span>
        </div>
      </div>
    </div>
  );
}
