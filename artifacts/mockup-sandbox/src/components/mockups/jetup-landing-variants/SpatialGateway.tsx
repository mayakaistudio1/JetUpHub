import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BG = "#0c0b1a";

const ZONES = [
  {
    id: "trading",
    title: "Trading",
    color: "#3B82F6",
    colorLight: "rgba(59, 130, 246, 0.15)",
    content: (
      <ZoneContent 
        title="Trading Infrastructure" 
        subtitle="Institutional-grade execution"
        color="#3B82F6"
        icon="📊"
      >
        <SubBlock title="TAG Markets" defaultOpen>
          <p style={{ marginBottom: 16 }}>The foundation of our trading ecosystem. A fully regulated institutional-grade broker providing direct market access.</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0 }}>
            {["Regulation: Fully compliant and licensed", "Payout Speed: Institutional clearing", "Scale: Built for high-volume execution", "Security: Tier-1 banking partners", "Conditions: Raw spreads, minimal slippage"].map(item => (
              <li key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}><span style={{ color: "#3B82F6" }}>✓</span> {item}</li>
            ))}
          </ul>
        </SubBlock>

        <SubBlock title="Copy-X Strategies">
          <p style={{ marginBottom: 24 }}>Seamless copy-trading connection via Community Token. Mirror top performers without managing positions yourself.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, border: `1px solid rgba(255, 255, 255, 0.06)` }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sonic</div>
              <div style={{ color: "#10B981", fontSize: 24, fontWeight: 800 }}>+65% ROI</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>Aggressive growth strategy.</div>
            </div>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 24, borderRadius: 16, border: `1px solid rgba(255, 255, 255, 0.06)` }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>NeoFX</div>
              <div style={{ color: "#3B82F6", fontSize: 24, fontWeight: 800 }}>Stable</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 8 }}>Risk-adjusted algorithmic approach.</div>
            </div>
          </div>
        </SubBlock>

        <SubBlock title="24x Amplify Calculator">
          <p style={{ marginBottom: 24 }}>Leverage our capital to amplify your trading potential. Scale your initial deposit dramatically.</p>
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
      </ZoneContent>
    )
  },
  {
    id: "partner",
    title: "Partner",
    color: "#EC4899",
    colorLight: "rgba(236, 72, 153, 0.15)",
    content: (
      <ZoneContent 
        title="Partner Ecosystem" 
        subtitle="Built for true scale"
        color="#EC4899"
        icon="🤝"
      >
        <SubBlock title="Lot Commission" defaultOpen>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: 16 }}>Earn continuous income from your network's trading volume. The core of our residual income model.</p>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#EC4899", marginBottom: 8 }}>$10.50</div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>per lot traded in your network</div>
            </div>
            <div style={{ width: 1, height: 80, background: "rgba(255, 255, 255, 0.06)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>10 Levels Deep</div>
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Commissions cascade through your organization, rewarding true leadership and team building.</p>
            </div>
          </div>
        </SubBlock>

        <SubBlock title="Profit Share & Infinity Bonus">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "rgba(0,0,0,0.3)", padding: 32, borderRadius: 20, border: `1px solid rgba(255, 255, 255, 0.06)` }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Profit Share</div>
              <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Ongoing income derived directly from client trading success. Align your earnings with your clients' results.</p>
              <div style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 8, display: "inline-block", fontSize: 14, fontWeight: 600 }}>Recurring Residual</div>
            </div>
            <div style={{ background: "rgba(236, 72, 153, 0.05)", padding: 32, borderRadius: 20, border: "1px solid rgba(236, 72, 153, 0.2)" }}>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Infinity Bonus</div>
              <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Differential bonus with no depth limit for elite leaders.</p>
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
              <div key={item} style={{ height: 160, background: "rgba(0,0,0,0.4)", borderRadius: 16, border: `1px solid rgba(255, 255, 255, 0.06)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.15), transparent)`, pointerEvents: "none" }} />
                <div style={{ fontSize: 18, fontWeight: 700, zIndex: 1 }}>{item}</div>
              </div>
            ))}
          </div>
        </SubBlock>
      </ZoneContent>
    )
  },
  {
    id: "ai",
    title: "AI Infrastructure",
    color: "#A855F7",
    colorLight: "rgba(168, 85, 247, 0.15)",
    content: (
      <ZoneContent 
        title="AI Operations" 
        subtitle="Your digital duplicate"
        color="#A855F7"
        icon="🧠"
      >
        <SubBlock title="Maria AI Assistant" defaultOpen>
          <p style={{ marginBottom: 16 }}>Your personal concierges that knows everything about the system. Text and video capabilities, available in DE/RU/EN.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 32px", background: "rgba(255, 255, 255, 0.03)", border: `1px solid rgba(255, 255, 255, 0.06)`, borderRadius: 100, backdropFilter: "blur(24px)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, #7C3AED, #A855F7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 0 30px #7C3AED60`, position: "relative" }}>
              <img src="/__mockup/images/maria-avatar.png" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", opacity: 0.9 }} onError={e => e.currentTarget.style.display = 'none'} />
              <span style={{position: 'absolute'}}>M</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 8 }}>
                Maria AI Live Assistant
                <span style={{ padding: "2px 8px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", borderRadius: 100, fontSize: 11, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>Online</span>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>"How can I help you scale today?"</div>
            </div>
          </div>
        </SubBlock>

        <SubBlock title="Digital Hub">
          <p style={{ marginBottom: 16 }}>Centralized intelligence center for managing your entire operation. Analytics, resources, and communication unified.</p>
          <div style={{ height: 200, background: "rgba(0,0,0,0.3)", borderRadius: 16, border: `1px solid rgba(255, 255, 255, 0.06)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>Dashboard Interface Concept</span>
          </div>
        </SubBlock>

        <SubBlock title="AI Duplication">
          <div style={{ padding: 32, background: "rgba(168, 85, 247, 0.05)", borderRadius: 20, border: "1px solid rgba(168, 85, 247, 0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, left: -20, fontSize: 120, color: "rgba(168, 85, 247, 0.1)", lineHeight: 1 }}>"</div>
            <p style={{ fontSize: 24, fontWeight: 500, fontStyle: "italic", lineHeight: 1.4, position: "relative", zIndex: 1, marginBottom: 24 }}>
              AI doesn't replace the leader.<br/>It makes the leader stronger.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center" }}>J</div>
              <div>
                <div style={{ fontWeight: 700 }}>JetUP Philosophy</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Core Principle</div>
              </div>
            </div>
          </div>
        </SubBlock>
      </ZoneContent>
    )
  }
];

function SubBlock({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div 
      layout
      style={{
        background: open ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.02)", 
        border: `1px solid ${open ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.06)"}`,
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

function ZoneContent({ title, subtitle, color, icon, children }: { title: string, subtitle: string, color: string, icon: string, children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 40px 120px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 64 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: `${color}20`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>{icon}</div>
        <div>
          <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>{title}</h2>
          <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SpatialGateway() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);

  const getWidth = (zoneId: string) => {
    if (activeZone === zoneId) return "100vw";
    if (activeZone && activeZone !== zoneId) return "0vw";
    
    if (!hoveredZone) return "33.333vw";
    if (hoveredZone === zoneId) return "40vw";
    return "30vw"; // 60vw remaining / 2
  };

  return (
    <div style={{
      height: "100vh", width: "100vw", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif",
      overflow: "hidden", position: "relative", display: "flex"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Shared Header/Close Button when active */}
      <AnimatePresence>
        {activeZone && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={{ position: "fixed", top: 40, left: 40, zIndex: 100 }}
          >
            <button 
              onClick={() => setActiveZone(null)} 
              style={{ 
                background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(12px)", border: `1px solid rgba(255,255,255,0.1)`, 
                borderRadius: 100, padding: "16px 32px", color: "#fff", cursor: "pointer", 
                fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 12,
                transition: "all 0.2s" 
              }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.transform = "scale(1.05)"; }} 
              onMouseOut={e => { e.currentTarget.style.background = "rgba(0, 0, 0, 0.4)"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span style={{ fontSize: 20 }}>←</span> Back to Gateway
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header */}
      <div style={{ position: "fixed", top: 40, right: 40, zIndex: 90, display: "flex", gap: 16, pointerEvents: activeZone ? "none" : "auto", opacity: activeZone ? 0 : 1, transition: "opacity 0.4s" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.05em", padding: "12px 24px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 16 }}>
          <span style={{ color: "#fff", cursor: "pointer" }}>EN</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>DE</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}>RU</span>
        </div>
      </div>

      {/* Giant Foreground Text spans across */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "90vw", zIndex: 20, pointerEvents: "none", mixBlendMode: "overlay",
        opacity: activeZone ? 0 : 1, transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <h1 style={{ 
          fontSize: "6vw", fontWeight: 900, lineHeight: 0.9, letterSpacing: "-0.04em", 
          textTransform: "uppercase", textAlign: "center", color: "rgba(255,255,255,0.8)"
        }}>
          This is not just another<br/>opportunity.<br/>This is a<br/>system.
        </h1>
      </div>

      {ZONES.map((zone) => (
        <motion.div
          key={zone.id}
          layout
          initial={false}
          animate={{ 
            width: getWidth(zone.id),
            opacity: activeZone && activeZone !== zone.id ? 0 : 1
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onHoverStart={() => !activeZone && setHoveredZone(zone.id)}
          onHoverEnd={() => !activeZone && setHoveredZone(null)}
          onClick={() => !activeZone && setActiveZone(zone.id)}
          style={{
            height: "100%", position: "relative",
            borderRight: "1px solid rgba(255,255,255,0.03)",
            cursor: activeZone ? "default" : "pointer",
            overflowY: activeZone === zone.id ? "auto" : "hidden",
            overflowX: "hidden"
          }}
          className="hide-scrollbar"
        >
          {/* Ambient Background Gradient for Panel */}
          <div style={{
            position: "absolute", inset: 0, 
            background: `linear-gradient(180deg, ${BG} 0%, ${zone.colorLight} 100%)`,
            opacity: (!activeZone && hoveredZone === zone.id) ? 0.8 : (activeZone === zone.id ? 0.3 : 0.4),
            transition: "opacity 0.6s ease"
          }} />

          {/* Grain Overlay */}
          <div style={{ position: "absolute", inset: 0, background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0JyBoZWlnaHQ9JzQnPjxyZWN0IHdpZHRoPSc0JyBoZWlnaHQ9JzQnIGZpbGw9JyNmZmYnIGZpbGwtb3BhY2l0eT0nMC4wMScvPjwvc3ZnPg==')", opacity: 0.5, pointerEvents: "none" }} />

          {/* Default State Content */}
          <motion.div 
            animate={{ 
              opacity: activeZone === zone.id ? 0 : 1,
              y: activeZone === zone.id ? -40 : 0
            }}
            transition={{ duration: 0.4 }}
            style={{ position: "absolute", inset: 0, padding: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end", pointerEvents: "none" }}
          >
            <motion.div
              animate={{ 
                scale: (!activeZone && hoveredZone === zone.id) ? 1.05 : 1,
                transformOrigin: "left bottom"
              }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div style={{ fontSize: 48, marginBottom: 24 }}>{zone.icon}</div>
              <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 16 }}>{zone.title}</h2>
              <div style={{ 
                height: 2, background: zone.color, width: (!activeZone && hoveredZone === zone.id) ? 120 : 40,
                transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)", marginBottom: 24
              }} />
              <p style={{ 
                fontSize: 18, color: "rgba(255,255,255,0.6)", 
                opacity: (!activeZone && hoveredZone === zone.id) ? 1 : 0,
                transform: `translateY(${(!activeZone && hoveredZone === zone.id) ? 0 : 20}px)`,
                transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
              }}>
                Enter {zone.title} Zone →
              </p>
            </motion.div>
          </motion.div>

          {/* Active State Content */}
          <div style={{ position: "relative", zIndex: 10, minHeight: "100%", width: "100vw", display: activeZone === zone.id ? "block" : "none" }}>
            {zone.content}
          </div>
        </motion.div>
      ))}
      
      {/* Footer Formula overlay */}
      <div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", zIndex: 90, pointerEvents: "none", opacity: activeZone ? 0 : 1, transition: "opacity 0.4s" }}>
        <div style={{ padding: "16px 32px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", borderRadius: 100, border: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", color: "rgba(255,255,255,0.6)" }}>
            JetUP = <span style={{ color: "#3B82F6" }}>Product</span> + <span style={{ color: "#EC4899" }}>Partner Model</span> + <span style={{ color: "#A855F7" }}>AI Infrastructure</span>
          </span>
        </div>
      </div>
    </div>
  );
}
