import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Maximize2, X } from "lucide-react";

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const onR = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return m;
}

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#A855F7";

const C = {
  BG: "#0A0A14",
  BG_ALT: "#0D0D1A",
  SURFACE: "#11111C",
  BORDER: "rgba(255,255,255,0.08)",
  BORDER_STRONG: "rgba(255,255,255,0.14)",
  TEXT: "#F5F5FA",
  TEXT_SEC: "rgba(245,245,250,0.7)",
  TEXT_MUTED: "rgba(245,245,250,0.4)",
};

const CHAPTERS = [
  { n: "01", title: "Warum JetUP?", body: "Warum jetzt? Warum dieses System? Eine Antwort, die mehr ist als ein Pitch — sie ist eine Einladung." },
  { n: "02", title: "Das Produkt", body: "Plattform, App, Telegram‑Mini‑App. Ein konsistentes Erlebnis für Trader, Partner und Sofia." },
  { n: "03", title: "Das Partnermodell", body: "Lot‑Provisionen, Infinity Bonus, Global Pools — transparent und nachvollziehbar bis ins Detail." },
  { n: "04", title: "KI‑Infrastruktur", body: "Sofia begleitet jeden Schritt: 24/7‑Antworten, Voice, Avatar — und alles in Echtzeit." },
  { n: "05", title: "Dein Einstieg", body: "Fünf Schritte, eine Vision: Account, Verifizierung, Strategie, Aktivierung, Wachstum." },
  { n: "06–10", title: "Deep Dive", body: "Strategien, Zahlen, Roadmap. Für alle, die alles wissen wollen — bevor sie entscheiden." },
];

function SlideVisual({ index }: { index: number }) {
  // Different abstract visual per chapter
  const palettes = [
    [ACCENT, "#312E81"],
    ["#0EA5E9", "#1E3A8A"],
    ["#F59E0B", "#7C2D12"],
    [ACCENT_LIGHT, "#312E81"],
    ["#10B981", "#064E3B"],
    [ACCENT, "#0F172A"],
  ];
  const [c1, c2] = palettes[index % palettes.length];
  return (
    <div
      style={{
        width: "100%", aspectRatio: "16/10", borderRadius: 18, position: "relative", overflow: "hidden",
        background: `radial-gradient(120% 80% at 30% 20%, ${c1}55 0%, ${c2} 60%, #050510 100%)`,
        border: `1px solid ${C.BORDER_STRONG}`,
        boxShadow: `0 30px 80px rgba(0,0,0,.45), 0 0 0 1px ${ACCENT}10`,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
        }}
      />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "min(60%, 280px)", aspectRatio: "1", borderRadius: "50%",
          background: `radial-gradient(circle, ${c1}80 0%, transparent 70%)`,
          filter: "blur(8px)",
        }} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 20, display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.85)" }}>SLIDE {String(index + 1).padStart(2, "0")}</span>
      </div>
      <div style={{ position: "absolute", left: 20, bottom: 20, fontSize: 11, color: "rgba(255,255,255,0.55)", letterSpacing: "0.1em" }}>
        VIDEO PLATZHALTER • 16:10
      </div>
    </div>
  );
}

function FullscreenOverlay({ onClose, index }: { onClose: () => void; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999, background: "rgba(5,5,12,0.96)",
        backdropFilter: "blur(20px)", display: "flex", flexDirection: "column", padding: 28,
      }}
      data-testid="fullscreen-overlay"
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.3em" }}>STORY • VOLLBILD</div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${C.BORDER_STRONG}`, background: "rgba(255,255,255,0.04)", color: C.TEXT, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28, alignItems: "center", minHeight: 0 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.3em", marginBottom: 12 }}>KAPITEL {CHAPTERS[index].n}</div>
          <h3 style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 300, letterSpacing: "-0.03em", color: C.TEXT, marginBottom: 18 }}>
            {CHAPTERS[index].title}
          </h3>
          <p style={{ fontSize: 17, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 520 }}>
            {CHAPTERS[index].body}
          </p>
        </div>
        <SlideVisual index={index} />
      </div>
    </motion.div>
  );
}

export function VariantC({ forceMobile }: { forceMobile?: boolean } = {}) {
  const detected = useIsMobile();
  const mob = forceMobile ?? detected;
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [openedWindow, setOpenedWindow] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.55) {
            const i = Number((e.target as HTMLElement).dataset.idx);
            if (!Number.isNaN(i)) setActive(i);
          }
        });
      },
      { root: el, threshold: [0.55] }
    );
    slideRefs.current.forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const goTo = (i: number) => {
    const node = slideRefs.current[i];
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div style={{ background: C.BG, color: C.TEXT, fontFamily: "'Montserrat', system-ui, sans-serif", minHeight: "100vh" }}>
      <section
        style={{ borderTop: `1px solid ${C.BORDER}`, position: "relative" }}
        data-testid="section-presentation-variant-c"
      >
        {/* Sticky header inside the section */}
        <div
          style={{
            position: "sticky", top: 0, zIndex: 30, padding: mob ? "14px 18px" : "20px 56px",
            background: `${C.BG}cc`, backdropFilter: "blur(14px)",
            borderBottom: `1px solid ${C.BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: mob ? 10 : 24,
            flexWrap: mob ? "wrap" : "nowrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: mob ? 10 : 18, flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: mob ? 10 : 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.25em", whiteSpace: "nowrap" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT, marginRight: 8, transform: "translateY(-2px)" }} />
              PRÄSENTATION
            </div>
            {!mob && (
              <h2 style={{ fontSize: "clamp(20px, 2.2vw, 28px)", fontWeight: 300, letterSpacing: "-0.02em", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Interaktive Präsentation
              </h2>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: mob ? 6 : 10 }}>
            <button
              onClick={() => setFullscreen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: mob ? "8px 12px" : "10px 16px", borderRadius: 100, border: `1px solid ${ACCENT}55`, background: "transparent", color: C.TEXT, fontSize: mob ? 11 : 12, fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit" }}
              data-testid="btn-fullscreen"
            >
              <Maximize2 size={13} /> {mob ? "" : "Vollbild"}
            </button>
            <button
              onClick={() => {
                // Fallback: open the same preview in a new window so the
                // classic "open in window" mode still works for users who
                // prefer a separated viewer.
                if (typeof window !== "undefined") {
                  const url = window.location.pathname.includes("/explore-presentation-section/")
                    ? window.location.href
                    : "/__mockup/preview/explore-presentation-section/VariantC";
                  const w = window.open(url, "_blank", "noopener,noreferrer,width=1280,height=800");
                  setOpenedWindow(Boolean(w));
                  if (!w) setFullscreen(true);
                }
              }}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: mob ? "8px 12px" : "10px 16px", borderRadius: 100, border: "none", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`, color: "#fff", fontSize: mob ? 11 : 12, fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer", fontFamily: "inherit" }}
              data-testid="btn-open-window"
              title={openedWindow ? "Bereits in Fenster geöffnet" : "In neuem Fenster öffnen"}
            >
              <ExternalLink size={13} /> {mob ? "" : "In Fenster öffnen"}
            </button>
          </div>
        </div>

        <div style={{ position: "relative", display: "flex" }}>
          {/* Vertical dot nav (hidden on mobile to free width) */}
          {!mob && (
          <div
            style={{
              position: "sticky", top: 90, alignSelf: "flex-start",
              padding: "32px 18px 32px 28px", display: "flex", flexDirection: "column", gap: 14,
              zIndex: 20,
            }}
            data-testid="dot-nav"
          >
            {CHAPTERS.map((c, i) => {
              const isActive = i === active;
              return (
                <button
                  key={c.n}
                  onClick={() => goTo(i)}
                  title={`${c.n} — ${c.title}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, background: "transparent",
                    border: "none", color: C.TEXT, cursor: "pointer", padding: 0,
                  }}
                  data-testid={`dot-${i}`}
                >
                  <span
                    style={{
                      width: isActive ? 22 : 10, height: isActive ? 4 : 4,
                      borderRadius: 2,
                      background: isActive ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT_LIGHT})` : "rgba(255,255,255,0.18)",
                      transition: "all .3s ease",
                    }}
                  />
                  <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400, color: isActive ? C.TEXT : C.TEXT_MUTED, letterSpacing: "0.1em" }}>
                    {c.n}
                  </span>
                </button>
              );
            })}
          </div>
          )}

          {/* Scroll snap container */}
          <div
            ref={containerRef}
            style={{
              flex: 1, height: "calc(100vh - 81px)", overflowY: "auto",
              scrollSnapType: "y mandatory",
              scrollBehavior: "smooth",
            }}
            data-testid="scroll-container"
          >
            {CHAPTERS.map((c, i) => (
              <div
                key={c.n}
                ref={(el) => { slideRefs.current[i] = el; }}
                data-idx={i}
                style={{
                  scrollSnapAlign: "start",
                  minHeight: "calc(100vh - 81px)",
                  padding: mob ? "32px 20px" : "0 56px",
                  display: "grid",
                  gridTemplateColumns: mob ? "1fr" : "1fr 1.3fr",
                  gap: mob ? 24 : 56,
                  alignItems: "center",
                  background: i % 2 === 0 ? C.BG : C.BG_ALT,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ root: containerRef, amount: 0.5 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.3em", marginBottom: 16 }}>
                    KAPITEL {c.n}
                  </div>
                  <h3 style={{ fontSize: mob ? "clamp(28px, 8vw, 40px)" : "clamp(40px, 5vw, 72px)", fontWeight: 200, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: mob ? 16 : 24 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: mob ? 14 : 17, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 480 }}>
                    {c.body}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ root: containerRef, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <SlideVisual index={i} />
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {fullscreen && <FullscreenOverlay onClose={() => setFullscreen(false)} index={active} />}
      </AnimatePresence>
    </div>
  );
}

export default VariantC;
