import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";

const BG = "#0a0a12";
const SURFACE = "#0f0f16";
const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";
const TEXT = "#ffffff";
const TEXT_SEC = "rgba(255,255,255,0.45)";
const TEXT_MUTED = "rgba(255,255,255,0.25)";
const BORDER = "rgba(255,255,255,0.06)";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Reveal({ children, delay = 0, y = 30, style }: { children: React.ReactNode; delay?: number; y?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1.2, delay, ease }} style={style}>
      {children}
    </motion.div>
  );
}

function Pillar({ num, title, subtitle, open, onToggle, children }: {
  num: string; title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={onToggle} style={{
        width: "100%", background: "none", border: "none", color: TEXT,
        padding: "56px 0", cursor: "pointer", fontFamily: "inherit",
        display: "grid", gridTemplateColumns: "60px 1fr 40px", alignItems: "center", gap: 32, textAlign: "left",
      }}>
        <span style={{ fontSize: 13, fontWeight: 400, color: TEXT_MUTED, letterSpacing: "0.15em" }}>{num}</span>
        <div>
          <div style={{ fontSize: 38, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, color: open ? TEXT : TEXT_SEC, transition: "color 0.6s ease" }}>{title}</div>
          <div style={{ fontSize: 15, fontWeight: 300, color: TEXT_SEC, marginTop: 8, opacity: open ? 1 : 0, transition: "opacity 0.6s ease" }}>{subtitle}</div>
        </div>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.5, ease }} style={{ fontSize: 22, fontWeight: 300, color: open ? TEXT : TEXT_MUTED }}>+</motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.7, ease }} style={{ overflow: "hidden" }}>
            <div style={{ paddingBottom: 72, paddingLeft: 92 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CombinedPremium() {
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOp = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  const toggle = (id: string) => setOpenPillar(p => p === id ? null : id);

  return (
    <div style={{ background: BG, color: TEXT, fontFamily: "'Montserrat', sans-serif", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BG}; }
        ::selection { background: ${TEXT}; color: ${BG}; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 64px", height: 64,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        mixBlendMode: "difference",
      }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 1.5 }}
          style={{ fontSize: 13, fontWeight: 500, letterSpacing: "0.2em", color: TEXT_MUTED }}>JETUP</motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 1.5 }}
          style={{ display: "flex", gap: 20, fontSize: 12, fontWeight: 400, letterSpacing: "0.1em", color: TEXT_MUTED }}>
          <span style={{ color: TEXT }}>EN</span>
          <span style={{ cursor: "pointer" }}>DE</span>
          <span style={{ cursor: "pointer" }}>RU</span>
        </motion.div>
      </header>

      {/* ── HERO: NEGATIVE SPACE ── */}
      <motion.section ref={heroRef} style={{
        height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        position: "relative", opacity: heroOp, y: heroY,
      }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5, ease: "easeInOut" }}
          style={{ position: "absolute", fontSize: 11, fontWeight: 400, letterSpacing: "0.35em", color: TEXT_MUTED }}>
          JETUP
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 2.2, duration: 2.5, ease: "easeOut" }}
          style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%", padding: "0 20px" }}>
          <h1 style={{ fontSize: "clamp(34px, 4.8vw, 62px)", fontWeight: 200, letterSpacing: "-0.025em", lineHeight: 1.2, marginBottom: 28 }}>
            This is not just another opportunity.<br />
            <span style={{ color: TEXT_SEC }}>This is a system.</span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2, duration: 2 }}
            style={{ fontSize: "clamp(14px, 1.4vw, 16px)", fontWeight: 300, color: TEXT_SEC, letterSpacing: "0.03em", maxWidth: 560, lineHeight: 1.7 }}>
            Product at the center. Partner model for scale.<br />
            AI infrastructure that amplifies the leader.
          </motion.p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 4.5, duration: 1.5 }}
          style={{ position: "absolute", bottom: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll</span>
          <motion.div animate={{ y: [0, 8, 0], opacity: [0.15, 0.5, 0.15] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 32, background: TEXT }} />
        </motion.div>
      </motion.section>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 56px" }}>

        {/* PROBLEM + ANSWER */}
        <section style={{ padding: "140px 0 100px" }}>
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 64, alignItems: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", paddingTop: 6 }}>The Problem</div>
              <div>
                <h2 style={{ fontSize: 40, fontWeight: 300, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: 32 }}>
                  The market is overheated.<br />
                  <span style={{ color: TEXT_SEC }}>People see more offers — but less system.</span>
                </h2>
                <p style={{ fontSize: 17, color: TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 640 }}>
                  Leaders burn out on manual growth. Partners jump between short-lived projects. Clients lose trust in fragmented promises. The cycle repeats: entry — hope — burnout — search again.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        <div style={{ height: 1, background: BORDER }} />

        <section style={{ padding: "100px 0" }}>
          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 64, alignItems: "start" }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", paddingTop: 6 }}>The Answer</div>
              <div>
                <h2 style={{ fontSize: 44, fontWeight: 300, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 48 }}>
                  JetUP replaces chaos<br />with architecture.
                </h2>
                <div style={{ display: "flex", gap: 40 }}>
                  {[
                    { label: "Product", desc: "Real value at the center." },
                    { label: "Partner Model", desc: "Residual income, not hype." },
                    { label: "AI Infrastructure", desc: "Scale the leader, not replace." },
                  ].map((item, i) => (
                    <Reveal key={item.label} delay={0.12 * i} style={{ flex: 1 }}>
                      <div style={{ borderTop: `1px solid ${i === 0 ? ACCENT : BORDER}`, paddingTop: 20 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em" }}>{item.label}</div>
                        <div style={{ fontSize: 14, color: TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>{item.desc}</div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <div style={{ height: 1, background: BORDER }} />

        {/* FORMULA */}
        <section style={{ padding: "64px 0" }}>
          <Reveal>
            <div style={{ textAlign: "center", fontSize: 18, fontWeight: 400, letterSpacing: "0.06em" }}>
              <span style={{ fontWeight: 600 }}>JETUP</span>
              <span style={{ color: TEXT_SEC }}> = Product + Partner Model + AI Infrastructure</span>
            </div>
          </Reveal>
        </section>

        <div style={{ height: 1, background: BORDER }} />

        {/* ECOSYSTEM PILLARS */}
        <section style={{ padding: "64px 0 0" }}>
          <Reveal y={0}>
            <Pillar num="01" title="Trading Infrastructure" subtitle="Institutional-grade execution. Transparent product."
              open={openPillar === "trading"} onToggle={() => toggle("trading")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 48 }}>
                <div>
                  <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Broker</div>
                  <h3 style={{ fontSize: 28, fontWeight: 400, marginBottom: 14, letterSpacing: "-0.02em" }}>TAG Markets</h3>
                  <p style={{ fontSize: 15, color: TEXT_SEC, lineHeight: 1.7, fontWeight: 300, marginBottom: 24 }}>
                    Fully regulated institutional-grade broker. Direct market access, raw spreads, tier-1 execution.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Fully regulated & licensed", "Raw spreads, minimal slippage", "Tier-1 banking partners", "Institutional clearing speed"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: TEXT_SEC, fontWeight: 300 }}>
                        <div style={{ width: 3, height: 3, borderRadius: 2, background: ACCENT_LIGHT, flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Strategies</div>
                  <h3 style={{ fontSize: 28, fontWeight: 400, marginBottom: 20, letterSpacing: "-0.02em" }}>Copy-X</h3>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div style={{ flex: 1, padding: 28, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>Sonic</div>
                      <div style={{ fontSize: 36, fontWeight: 300, color: "#10B981", letterSpacing: "-0.03em" }}>+65%</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>ROI Active</div>
                    </div>
                    <div style={{ flex: 1, padding: 28, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>NeoFX</div>
                      <div style={{ fontSize: 36, fontWeight: 300, color: "#3B82F6", letterSpacing: "-0.03em" }}>Stable</div>
                      <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Risk-Adjusted</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "36px 44px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, color: TEXT_MUTED, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>24x Amplify</div>
                  <div style={{ fontSize: 16, color: TEXT_SEC, fontWeight: 300 }}>Your deposit, multiplied for execution power.</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 40, fontWeight: 300 }}>$100</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>Deposit</div>
                  </div>
                  <div style={{ width: 32, height: 1, background: BORDER }} />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, fontWeight: 300, color: ACCENT_LIGHT }}>$2,400</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 4 }}>MT5 Account</div>
                  </div>
                </div>
              </div>
            </Pillar>

            <Pillar num="02" title="Partner Model" subtitle="Residual income architecture. Built for leaders."
              open={openPillar === "partner"} onToggle={() => toggle("partner")}>
              <div style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Core Income</div>
                <h3 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 6 }}>Lot Commission</h3>
                <p style={{ fontSize: 15, color: TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 560, marginBottom: 28 }}>
                  Continuous income from your network's trading volume. Not a one-time payout — ongoing residual earnings tied to real product activity.
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 32 }}>
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 200, letterSpacing: "-0.03em", color: ACCENT_LIGHT }}>$10.50</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Per Lot Traded</div>
                  </div>
                  <div style={{ width: 1, height: 48, background: BORDER }} />
                  <div>
                    <div style={{ fontSize: 48, fontWeight: 200, letterSpacing: "-0.03em" }}>10</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Levels Deep</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
                <div style={{ padding: 32, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Ongoing</div>
                  <h4 style={{ fontSize: 20, fontWeight: 400, marginBottom: 10 }}>Profit Share</h4>
                  <p style={{ fontSize: 14, color: TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
                    Residual income derived from client trading success. Income continues as long as clients remain active.
                  </p>
                </div>
                <div style={{ padding: 32, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Leadership</div>
                  <h4 style={{ fontSize: 20, fontWeight: 400, marginBottom: 16 }}>Infinity Bonus</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[{ vol: "€100K", pct: "1%" }, { vol: "€300K", pct: "2%" }, { vol: "€1M", pct: "3%" }].map(row => (
                      <div key={row.vol} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
                        <span style={{ fontSize: 14, color: TEXT_SEC, fontWeight: 300 }}>From {row.vol}</span>
                        <span style={{ fontSize: 16, fontWeight: 500, color: ACCENT_LIGHT }}>{row.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ paddingLeft: 20, borderLeft: `2px solid ${ACCENT}`, fontSize: 18, fontWeight: 300, color: TEXT_SEC, fontStyle: "italic", lineHeight: 1.5 }}>
                "A newcomer sees the first commission.<br />A leader sees income architecture."
              </div>
            </Pillar>

            <Pillar num="03" title="AI Infrastructure" subtitle="Scale the leader. Not replace them."
              open={openPillar === "ai"} onToggle={() => toggle("ai")}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 48 }}>
                <div>
                  <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>The Limit</div>
                  <h3 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 14 }}>Why do strong leaders hit a ceiling?</h3>
                  <p style={{ fontSize: 16, color: TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
                    Because there is physically only one of them. Their time, energy, and bandwidth become the bottleneck of the entire structure.
                  </p>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>The Solution</div>
                  <h3 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 14 }}>AI as duplication layer</h3>
                  <p style={{ fontSize: 16, color: TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
                    JetUP AI doesn't replace the leader. It turns the leader's influence into a more scalable, repeatable, and accessible system.
                  </p>
                </div>
              </div>

              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "36px 44px", display: "flex", alignItems: "center", gap: 32, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                  <img src="/__mockup/images/maria-avatar.png" alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} onError={e => (e.currentTarget.style.display = 'none')} />
                  <span style={{ position: "absolute", fontSize: 22, fontWeight: 600 }}>M</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Maria AI</div>
                  <div style={{ fontSize: 14, color: TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>
                    Hybrid GPT-4 assistant with live video avatar. Speaks German, Russian, English. Knows every detail of the ecosystem. Available 24/7.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {["Text", "Video", "Voice"].map(m => (
                    <div key={m} style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${BORDER}`, fontSize: 12, fontWeight: 400, color: TEXT_MUTED }}>{m}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { t: "Digital Hub", d: "Unified entry point with AI-guided navigation" },
                  { t: "AI Duplication", d: "Clone the leader's communication style at scale" },
                  { t: "Automated Onboarding", d: "First steps guided without leader's time" },
                ].map(item => (
                  <div key={item.t} style={{ padding: 24, borderRadius: 12, border: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{item.t}</div>
                    <div style={{ fontSize: 13, color: TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>{item.d}</div>
                  </div>
                ))}
              </div>
            </Pillar>
          </Reveal>
        </section>

        {/* TRANSFORMATION */}
        <section style={{ padding: "120px 0" }}>
          <Reveal>
            <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto", marginBottom: 56 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 }}>Transformation</div>
              <h2 style={{ fontSize: 40, fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.03em" }}>
                From random growth<br />to managed infrastructure.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, borderRadius: 12, overflow: "hidden" }}>
              {[
                { before: "Manual recruiting", after: "AI-powered duplication" },
                { before: "Short-lived hype cycles", after: "Long-term residual income" },
                { before: "Leader as bottleneck", after: "Leader as architect" },
                { before: "Fragmented tools", after: "Unified ecosystem" },
              ].map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", background: SURFACE, padding: "28px 32px", alignItems: "center", gap: 20 }}>
                  <span style={{ fontSize: 15, color: TEXT_MUTED, textDecoration: "line-through", textDecorationColor: "rgba(255,255,255,0.12)", fontWeight: 300 }}>{row.before}</span>
                  <span style={{ color: ACCENT_LIGHT, fontSize: 13 }}>→</span>
                  <span style={{ fontSize: 15, fontWeight: 500 }}>{row.after}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* CTA */}
        <section style={{ padding: "80px 0 140px", textAlign: "center" }}>
          <Reveal>
            <div style={{ fontSize: 12, fontWeight: 500, color: ACCENT_LIGHT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>Ready?</div>
            <h2 style={{ fontSize: 48, fontWeight: 300, letterSpacing: "-0.03em", marginBottom: 16 }}>Enter the system.</h2>
            <p style={{ fontSize: 16, color: TEXT_SEC, marginBottom: 48, lineHeight: 1.6, fontWeight: 300 }}>
              Talk to Maria. Explore at your pace. Find your path inside JetUP.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
              <motion.button whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${ACCENT}30` }} whileTap={{ scale: 0.98 }}
                style={{ padding: "16px 40px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, border: "none", borderRadius: 100, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em" }}>
                Start with Maria AI
              </motion.button>
              <motion.button whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.04)" }} whileTap={{ scale: 0.98 }}
                style={{ padding: "16px 40px", background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 100, color: TEXT, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em" }}>
                Watch Presentation
              </motion.button>
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "36px 0", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", fontSize: 12, color: TEXT_MUTED, letterSpacing: "0.05em" }}>
          <div>JETUP</div>
          <div>Digital Infrastructure Platform</div>
        </footer>
      </div>
    </div>
  );
}
