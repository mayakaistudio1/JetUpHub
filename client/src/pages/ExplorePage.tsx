import React, { useRef, useState, useEffect, useCallback, useContext, createContext } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useLanguage, Language } from "../contexts/LanguageContext";
import { X, Menu, Moon, Sun, Check, MessageSquare, Mic, MicOff, Video, Send, Play, ExternalLink, Maximize2, ChevronLeft, ChevronRight, ChevronDown, MoreHorizontal, Volume2, VolumeX, Loader2, Square } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import PresentationOverlay from "./partner/PresentationOverlay";
import InteractivePresentation, { type InteractivePresentationHandle } from "./partner/InteractivePresentation";
import VideoPresentationPlayer from "../components/VideoPresentationPlayer";
import type { SharedMessage } from "./PartnerDigitalHub";
import { useSofia } from "@/contexts/SofiaSessionContext";
import { getVisitorId, appendSharedChatTurn, loadSharedChat, saveSharedChat, sofiaFetch, type SharedChatMsg, type SofiaMode } from "@/lib/sofiaVisitor";
import { SofiaVoiceProvider, useSofiaVoice } from "@/components/sofia/SofiaVoiceProvider";
import { SofiaVoiceBottomBar } from "@/components/sofia/SofiaPanel";
import SofiaPanel from "@/components/sofia/SofiaPanel";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#E879F9";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface ThemeColors {
  BG: string;
  SURFACE: string;
  SURFACE_ALT: string;
  TEXT: string;
  TEXT_SEC: string;
  TEXT_MUTED: string;
  BORDER: string;
  BORDER_STRONG: string;
  HEADER_BG: string;
  CARD_SHADOW: string;
  SECTION_STRIPE: string;
}

const DARK: ThemeColors = {
  BG: "#0a0a12",
  SURFACE: "#12121c",
  SURFACE_ALT: "#16162a",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.5)",
  TEXT_MUTED: "rgba(255,255,255,0.25)",
  BORDER: "rgba(255,255,255,0.06)",
  BORDER_STRONG: "rgba(255,255,255,0.12)",
  HEADER_BG: "rgba(10,10,18,0.6)",
  CARD_SHADOW: "none",
  SECTION_STRIPE: "#0d0d18",
};

const LIGHT: ThemeColors = {
  BG: "#f6f6fa",
  SURFACE: "#ffffff",
  SURFACE_ALT: "#ede9fc",
  TEXT: "#0d0d1a",
  TEXT_SEC: "rgba(13,13,26,0.56)",
  TEXT_MUTED: "rgba(13,13,26,0.38)",
  BORDER: "rgba(13,13,26,0.09)",
  BORDER_STRONG: "rgba(13,13,26,0.18)",
  HEADER_BG: "rgba(246,246,250,0.92)",
  CARD_SHADOW: "0 2px 8px rgba(13,13,26,0.06), 0 8px 32px rgba(13,13,26,0.04)",
  SECTION_STRIPE: "#ffffff",
};

type ExploreTheme = "dark" | "light";

interface ThemeCtxValue {
  theme: ExploreTheme;
  C: ThemeColors;
  toggle: () => void;
}

const ThemeCtx = createContext<ThemeCtxValue>({ theme: "dark", C: DARK, toggle: () => {} });

function useTheme() { return useContext(ThemeCtx); }

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="currentColor" />
    </svg>
  );
}

function IconPause() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2.5" y="1.5" width="3" height="11" rx="0.75" fill="currentColor" />
      <rect x="8.5" y="1.5" width="3" height="11" rx="0.75" fill="currentColor" />
    </svg>
  );
}

function IconVolumeOn() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5.5H4.5L8 2V14L4.5 10.5H2C1.45 10.5 1 10.05 1 9.5V6.5C1 5.95 1.45 5.5 2 5.5Z" fill="currentColor" />
      <path d="M10.5 4.5C11.6 5.4 12.3 6.6 12.3 8C12.3 9.4 11.6 10.6 10.5 11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M12.5 2.5C14.3 3.9 15.3 5.8 15.3 8C15.3 10.2 14.3 12.1 12.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconVolumeOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 5.5H4.5L8 2V14L4.5 10.5H2C1.45 10.5 1 10.05 1 9.5V6.5C1 5.95 1.45 5.5 2 5.5Z" fill="currentColor" />
      <path d="M11 5.5L15 10.5M15 5.5L11 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function Reveal({ children, delay = 0, y = 40, className = "" }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay, ease: EASE }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }} data-testid="section-label">
      {children}
    </div>
  );
}

function ExploreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mob = useIsMobile();
  const { language, setLanguage, t } = useLanguage();
  const { theme, C, toggle } = useTheme();

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: mob ? "0 20px" : "0 56px", height: mob ? 56 : 72,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        backdropFilter: "blur(16px)", background: C.HEADER_BG,
        borderBottom: `1px solid ${C.BORDER}`,
        overflow: "visible",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
          <img
            src="/jetup-logo.png"
            alt="JetUP"
            style={{
              height: mob ? 28 : 36,
              width: "auto",
              objectFit: "contain",
              display: "block",
              filter: theme === "dark" ? "brightness(0) invert(1)" : "none",
              transition: "filter 0.4s ease",
            }}
            data-testid="img-explore-logo"
          />
        </motion.div>

        {!mob && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 1 }}
            style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {[
              { label: t('explore.nav.presentation'), onClick: () => document.getElementById('presentation')?.scrollIntoView({ behavior: 'smooth' }) },
              { label: t('explore.nav.videos'), onClick: () => document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' }) },
            ].map(item => (
              <button key={item.label} onClick={item.onClick} style={{
                background: "none", border: "none", color: C.TEXT_SEC, fontSize: 13, fontWeight: 400,
                cursor: "pointer", fontFamily: "inherit", padding: "6px 14px", borderRadius: 8,
                transition: "color 0.2s ease, background 0.2s ease",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = C.TEXT; e.currentTarget.style.background = C.BORDER; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.TEXT_SEC; e.currentTarget.style.background = "none"; }}
              >{item.label}</button>
            ))}
            <a href="https://jet-up.ai/" target="_blank" rel="noopener noreferrer" style={{
              color: C.TEXT_SEC, textDecoration: "none", fontSize: 13, fontWeight: 400,
              padding: "6px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 4,
              transition: "color 0.2s ease, background 0.2s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = C.TEXT; e.currentTarget.style.background = C.BORDER; }}
              onMouseLeave={e => { e.currentTarget.style.color = C.TEXT_SEC; e.currentTarget.style.background = "none"; }}
            >Hub <ExternalLink size={11} strokeWidth={1.5} /></a>
          </motion.div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: mob ? 10 : 16 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
            style={{ display: "flex", alignItems: "center", gap: mob ? 10 : 16, fontSize: 12, fontWeight: 400, letterSpacing: "0.1em", color: C.TEXT_MUTED }}>
            {(['en', 'de', 'ru'] as Language[]).map(lang => (
              <span
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{ color: language === lang ? C.TEXT : C.TEXT_MUTED, cursor: "pointer", transition: "color 0.3s ease" }}
                data-testid={`lang-toggle-${lang}`}
              >
                {lang.toUpperCase()}
              </span>
            ))}
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                background: "none", border: `1px solid ${C.BORDER}`, borderRadius: 8,
                color: C.TEXT_MUTED, cursor: "pointer", padding: "4px 6px",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "border-color 0.3s ease, color 0.3s ease",
              }}
              data-testid="btn-theme-toggle"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </motion.div>

          {mob && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              style={{ background: "none", border: "none", color: C.TEXT_SEC, cursor: "pointer", padding: 4, display: "flex" }}
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {mob && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed", top: 56, left: 0, right: 0, zIndex: 99,
              background: theme === "dark" ? "rgba(10,10,18,0.95)" : "rgba(255,255,255,0.95)",
              backdropFilter: "blur(16px)",
              borderBottom: `1px solid ${C.BORDER}`,
              padding: "16px 20px",
              display: "flex", flexDirection: "column", gap: 16,
            }}
            data-testid="mobile-menu"
          >
            {[
              { label: t('explore.nav.presentation'), onClick: () => { document.getElementById('presentation')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); } },
              { label: t('explore.nav.videos'), onClick: () => { document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); } },
              { label: "Digital Hub", onClick: () => { window.open('https://jet-up.ai/', '_blank'); setMobileMenuOpen(false); } },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.onClick}
                style={{ background: "none", border: "none", color: C.TEXT_SEC, fontSize: 15, fontWeight: 400, cursor: "pointer", fontFamily: "inherit", textAlign: "left", padding: 0 }}
              >
                {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: C.BORDER }} />
            <div style={{ display: "flex", gap: 20 }}>
              {SOCIAL_LINKS.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ color: C.TEXT_MUTED, fontSize: 13, textDecoration: "none" }}
                >{s.label}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function HeroSection({ onOpenMaria }: { onOpenMaria: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.7], [0, -60]);
  const [videoReady, setVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoHovered, setVideoHovered] = useState(false);
  const { language, t } = useLanguage();
  const mob = useIsMobile();
  const { theme, C } = useTheme();

  const videoSrcMap: Record<Language, string> = {
    en: "/videos/jetup-intro.mp4",
    de: "/videos/jetup-intro-de.mp4",
    ru: "/videos/jetup-intro-ru.mp4",
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.src = videoSrcMap[language];
      video.load();
      if (isPlaying) {
        video.play().catch(() => {});
      }
    }
  }, [language]);

  return (
    <motion.section ref={ref} style={{ height: "100vh", position: "relative", overflow: "hidden", opacity: heroOp, y: heroY }} data-testid="section-hero">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.BG}; transition: background 0.4s ease; }
        ::selection { background: ${ACCENT}; color: #fff; }
        html { scroll-behavior: smooth; }
        .explore-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{
        position: "absolute", inset: 0,
        display: mob ? "flex" : "grid",
        flexDirection: mob ? "column" : undefined,
        gridTemplateColumns: mob ? undefined : "1fr 1fr",
        alignItems: "center",
        paddingTop: mob ? 72 : 0,
      }}>
        <div style={{ paddingLeft: mob ? "6%" : "8%", paddingRight: mob ? "6%" : "4%", zIndex: 2, flex: mob ? "1 1 auto" : undefined, display: mob ? "flex" : undefined, alignItems: mob ? "center" : undefined }}>
          <motion.div initial={{ opacity: 0, y: 20, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 2, ease: "easeOut" }}>
            <div style={{ fontSize: mob ? 10 : 12, fontWeight: 500, letterSpacing: "0.25em", color: C.TEXT_MUTED, marginBottom: mob ? 16 : 32, textTransform: "uppercase" }}>
              {t('explore.hero.label')}
            </div>
            <h1 style={{ fontSize: mob ? "clamp(28px, 8vw, 44px)" : "clamp(44px, 5vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.02, marginBottom: mob ? 16 : 24, color: C.TEXT }} data-testid="hero-title">
              {t('explore.hero.title1')}<br />{t('explore.hero.title2')}<br />
              <span style={{ color: C.TEXT_SEC }}>{t('explore.hero.title3')}</span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1.5 }}
              style={{ fontSize: mob ? 14 : 17, fontWeight: 300, color: C.TEXT_SEC, lineHeight: 1.7, maxWidth: 440, marginBottom: mob ? 20 : 40 }}>
              {t('explore.hero.subtitle1')}<br />
              {t('explore.hero.subtitle2')}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.5, duration: 1 }}
              style={{ display: "flex", gap: 12, flexWrap: mob ? "wrap" : undefined }}>
              <button
                onClick={onOpenMaria}
                style={{
                  padding: mob ? "12px 24px" : "14px 32px", background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                  border: "none", borderRadius: 100, color: "#fff", fontSize: mob ? 13 : 14, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                }} data-testid="hero-cta-maria">
                {t('explore.hero.cta1')}
              </button>
              <button
                onClick={() => document.getElementById('presentation')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: mob ? "12px 24px" : "14px 32px", background: "transparent", border: `1px solid ${C.BORDER_STRONG}`,
                  borderRadius: 100, color: C.TEXT, fontSize: mob ? 13 : 14, fontWeight: 500, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "0.02em",
                }} data-testid="hero-cta-explore">
                {t('explore.hero.cta2')}
              </button>
            </motion.div>
          </motion.div>
        </div>

        <div style={{
          position: "relative",
          height: mob ? "auto" : "100%",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: mob ? "0 6% 24px" : "0 6% 0 0",
          flex: mob ? "0 0 auto" : undefined,
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: videoReady ? 1 : 0, scale: 1 }}
            transition={{ delay: 1.5, duration: 1.5 }}
            onHoverStart={() => setVideoHovered(true)}
            onHoverEnd={() => setVideoHovered(false)}
            style={{
              position: "relative", width: "100%", maxWidth: mob ? "100%" : 600, aspectRatio: "16/9",
              borderRadius: mob ? 12 : 16, overflow: "hidden", border: `1px solid ${C.BORDER}`,
              boxShadow: `0 0 80px rgba(124,58,237,0.15), 0 32px 64px rgba(0,0,0,0.5)`,
            }}
          >
            <video
              ref={videoRef}
              src={videoSrcMap[language]}
              autoPlay
              muted={isMuted}
              playsInline
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoReady(true)}
              onEnded={() => setIsPlaying(false)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              data-testid="hero-video"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: mob ? 1 : videoHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "24px 16px 12px",
                background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
                display: "flex", justifyContent: "flex-end", gap: 6,
              }}
            >
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (isPlaying) { videoRef.current.pause(); } else { videoRef.current.play(); }
                    setIsPlaying(!isPlaying);
                  }
                }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                  border: "none", color: "rgba(255,255,255,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
                data-testid="hero-video-playpause"
              >
                {isPlaying ? <IconPause /> : <IconPlay />}
              </button>
              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (videoRef.current) videoRef.current.muted = !isMuted;
                }}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
                  border: "none", color: "rgba(255,255,255,0.8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
                data-testid="hero-video-mute"
              >
                {isMuted ? <IconVolumeOff /> : <IconVolumeOn />}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {!mob && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.5, duration: 1 }}
          style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2 }}>
          <motion.div animate={{ y: [0, 8, 0], opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 32, background: C.TEXT }} />
        </motion.div>
      )}
    </motion.section>
  );
}

function Pillar({ num, title, subtitle, open, onToggle, children, id, isMobile }: {
  num: string; title: string; subtitle: string; open: boolean; onToggle: () => void; children: React.ReactNode; id?: string; isMobile?: boolean;
}) {
  const mob = isMobile;
  const { C } = useTheme();
  return (
    <div id={id} style={{ borderBottom: `1px solid ${C.BORDER}` }}>
      <button onClick={onToggle} style={{
        width: "100%", background: "none", border: "none", color: C.TEXT,
        padding: mob ? "32px 0" : "52px 0", cursor: "pointer", fontFamily: "inherit",
        display: "grid", gridTemplateColumns: mob ? "28px 1fr 28px" : "60px 1fr 40px", alignItems: "center", gap: mob ? 12 : 32, textAlign: "left",
      }} data-testid={`pillar-toggle-${num}`}>
        <span style={{ fontSize: mob ? 11 : 13, fontWeight: 400, color: C.TEXT_MUTED, letterSpacing: "0.15em" }}>{num}</span>
        <div>
          <div style={{ fontSize: mob ? "clamp(22px, 5vw, 28px)" : "clamp(28px, 3vw, 38px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, color: open ? C.TEXT : C.TEXT_SEC, transition: "color 0.6s ease" }}>{title}</div>
          <div style={{ fontSize: mob ? 13 : 15, fontWeight: 300, color: C.TEXT_SEC, marginTop: 8, opacity: open ? 1 : 0, transition: "opacity 0.6s ease" }}>{subtitle}</div>
        </div>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.5, ease: EASE }} style={{ fontSize: 22, fontWeight: 300, color: open ? C.TEXT : C.TEXT_MUTED }}>+</motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.7, ease: EASE }} style={{ overflow: "hidden" }}>
            <div style={{ paddingBottom: mob ? 32 : 64, paddingLeft: mob ? 0 : 92 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContentSections() {
  const [openPillar, setOpenPillar] = useState<string | null>(null);
  const toggle = (id: string) => setOpenPillar(p => p === id ? null : id);
  const { t } = useLanguage();
  const mob = useIsMobile();
  const { C } = useTheme();

  const answerColumns = [
    { label: t('explore.answer.col1.label'), desc: t('explore.answer.col1.desc') },
    { label: t('explore.answer.col2.label'), desc: t('explore.answer.col2.desc') },
    { label: t('explore.answer.col3.label'), desc: t('explore.answer.col3.desc') },
  ];

  const pillar1Items = [
    t('explore.pillar1.item1'),
    t('explore.pillar1.item2'),
    t('explore.pillar1.item3'),
    t('explore.pillar1.item4'),
  ];

  const pillar1Cards = [
    { t: t('explore.pillar1.card1.title'), d: t('explore.pillar1.card1.desc') },
    { t: t('explore.pillar1.card2.title'), d: t('explore.pillar1.card2.desc') },
    { t: t('explore.pillar1.card3.title'), d: t('explore.pillar1.card3.desc') },
  ];

  const pillar2Items = [
    t('explore.pillar2.item1'),
    t('explore.pillar2.item2'),
    t('explore.pillar2.item3'),
    t('explore.pillar2.item4'),
  ];

  const pillar3Cards = [
    { t: t('explore.pillar3.card1.title'), d: t('explore.pillar3.card1.desc') },
    { t: t('explore.pillar3.card2.title'), d: t('explore.pillar3.card2.desc') },
    { t: t('explore.pillar3.card3.title'), d: t('explore.pillar3.card3.desc') },
  ];

  const transformRows = [
    { before: t('explore.transform.before1'), after: t('explore.transform.after1') },
    { before: t('explore.transform.before2'), after: t('explore.transform.after2') },
    { before: t('explore.transform.before3'), after: t('explore.transform.after3') },
    { before: t('explore.transform.before4'), after: t('explore.transform.after4') },
  ];

  return (
    <div style={{ background: C.SECTION_STRIPE, borderTop: `1px solid ${C.BORDER}`, borderBottom: `1px solid ${C.BORDER}` }}>
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: mob ? "0 20px" : "0 56px" }}>

      <section style={{ padding: mob ? "60px 0 40px" : "120px 0 80px" }} data-testid="section-problem">
        <Reveal>
          <div style={{
            background: `rgba(124,58,237,0.05)`,
            border: `1px solid rgba(124,58,237,0.15)`,
            borderLeft: `3px solid ${ACCENT}`,
            borderRadius: 14,
            padding: mob ? "28px 20px" : "48px 52px",
          }}>
            <div style={{
              display: mob ? "flex" : "grid",
              flexDirection: mob ? "column" : undefined,
              gridTemplateColumns: mob ? undefined : "160px 1fr",
              gap: mob ? 16 : 64,
              alignItems: "start",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: ACCENT,
                letterSpacing: "0.2em", textTransform: "uppercase", paddingTop: 6,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                {t('explore.problem.label')}
              </div>
              <div>
                <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 32px)" : "clamp(32px, 3.5vw, 44px)", fontWeight: 300, lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: mob ? 16 : 28, color: C.TEXT }}>
                  {t('explore.problem.title1')}<br />
                  <span style={{ color: C.TEXT_SEC }}>{t('explore.problem.title2')}</span>
                </h2>
                <p style={{ fontSize: mob ? 15 : 17, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 640 }}>
                  {t('explore.problem.body')}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <div style={{ height: 1, background: C.BORDER }} />

      <section style={{ padding: mob ? "40px 0" : "80px 0" }} id="product" data-testid="section-answer">
        <Reveal>
          <div style={{
            display: mob ? "flex" : "grid",
            flexDirection: mob ? "column" : undefined,
            gridTemplateColumns: mob ? undefined : "160px 1fr",
            gap: mob ? 16 : 64,
            alignItems: "start",
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.TEXT_MUTED, letterSpacing: "0.15em", textTransform: "uppercase", paddingTop: 6 }}>{t('explore.answer.label')}</div>
            <div>
              <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 34px)" : "clamp(34px, 4vw, 48px)", fontWeight: 300, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: mob ? 24 : 44, color: C.TEXT }}>
                {t('explore.answer.title1')}<br />{t('explore.answer.title2')}
              </h2>
              <div style={{ display: "flex", flexDirection: mob ? "column" : "row", gap: mob ? 24 : 40 }}>
                {answerColumns.map((item, i) => (
                  <Reveal key={i} delay={0.12 * i}>
                    <div style={{ flex: 1, borderTop: `1px solid ${i === 0 ? ACCENT : C.BORDER}`, paddingTop: 20 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, letterSpacing: "-0.01em", color: C.TEXT }}>{item.label}</div>
                      <div style={{ fontSize: 14, color: C.TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>{item.desc}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <div style={{ height: 1, background: C.BORDER }} />

      <section style={{ padding: mob ? "32px 0" : "48px 0" }} data-testid="section-formula">
        <Reveal>
          <div style={{
            background: C.SURFACE_ALT,
            borderRadius: 14,
            border: `1px solid ${C.BORDER_STRONG}`,
            padding: mob ? "20px 24px" : "28px 40px",
            textAlign: "center",
            fontSize: mob ? 15 : 18,
            fontWeight: 400,
            letterSpacing: "0.06em",
            color: C.TEXT,
            boxShadow: C.CARD_SHADOW,
          }}>
            <span style={{ fontWeight: 700, color: ACCENT }}>JETUP</span>
            <span style={{ color: C.TEXT_SEC }}> {t('explore.formula')}</span>
          </div>
        </Reveal>
      </section>

      <div style={{ height: 1, background: C.BORDER }} />

      <section style={{ padding: "48px 0 0" }} id="difference" data-testid="section-pillars">
        <Reveal y={0}>
          <Pillar num="01" title={t('explore.pillar1.title')} subtitle={t('explore.pillar1.subtitle')}
            open={openPillar === "trading"} onToggle={() => toggle("trading")} isMobile={mob}>
            <div style={{ marginBottom: mob ? 24 : 48 }}>
              <h3 style={{ fontSize: mob ? 22 : 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 14, color: C.TEXT }}>{t('explore.pillar1.heading')}</h3>
              <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 640, marginBottom: mob ? 20 : 32 }}>
                {t('explore.pillar1.body')}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pillar1Items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: mob ? 13 : 14, color: C.TEXT_SEC, fontWeight: 300 }}>
                    <div style={{ width: 3, height: 3, borderRadius: 2, background: ACCENT_LIGHT, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
              {pillar1Cards.map((item, idx) => (
                <div key={idx} style={{ padding: mob ? 20 : 24, borderRadius: 12, border: `1px solid ${C.BORDER_STRONG}`, background: C.SURFACE, boxShadow: C.CARD_SHADOW }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: C.TEXT }}>{item.t}</div>
                  <div style={{ fontSize: 13, color: C.TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>{item.d}</div>
                </div>
              ))}
            </div>
          </Pillar>

          <Pillar num="02" title={t('explore.pillar2.title')} subtitle={t('explore.pillar2.subtitle')}
            open={openPillar === "partner"} onToggle={() => toggle("partner")} id="partner" isMobile={mob}>
            <div style={{ marginBottom: mob ? 24 : 48 }}>
              <h3 style={{ fontSize: mob ? 22 : 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 14, color: C.TEXT }}>{t('explore.pillar2.heading')}</h3>
              <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 640, marginBottom: mob ? 20 : 32 }}>
                {t('explore.pillar2.body')}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pillar2Items.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: mob ? 13 : 14, color: C.TEXT_SEC, fontWeight: 300 }}>
                    <div style={{ width: 3, height: 3, borderRadius: 2, background: ACCENT_LIGHT, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ paddingLeft: 20, borderLeft: `2px solid ${ACCENT}`, fontSize: mob ? 15 : 18, fontWeight: 300, color: C.TEXT_SEC, fontStyle: "italic", lineHeight: 1.5 }}>
              {t('explore.pillar2.quote1')}<br />{t('explore.pillar2.quote2')}
            </div>
          </Pillar>

          <Pillar num="03" title={t('explore.pillar3.title')} subtitle={t('explore.pillar3.subtitle')}
            open={openPillar === "ai"} onToggle={() => toggle("ai")} id="ai" isMobile={mob}>
            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 24 : 48, marginBottom: mob ? 24 : 48 }}>
              <div>
                <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>{t('explore.pillar3.limitLabel')}</div>
                <h3 style={{ fontSize: mob ? 22 : 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 14, color: C.TEXT }}>{t('explore.pillar3.limitHeading')}</h3>
                <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
                  {t('explore.pillar3.limitBody')}
                </p>
              </div>
              <div>
                <div style={{ fontSize: 12, color: ACCENT_LIGHT, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>{t('explore.pillar3.solutionLabel')}</div>
                <h3 style={{ fontSize: mob ? 22 : 28, fontWeight: 400, letterSpacing: "-0.02em", marginBottom: 14, color: C.TEXT }}>{t('explore.pillar3.solutionHeading')}</h3>
                <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300 }}>
                  {t('explore.pillar3.solutionBody')}
                </p>
              </div>
            </div>

            <div style={{
              background: C.SURFACE,
              border: `1px solid ${C.BORDER_STRONG}`,
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: mob ? 12 : 16,
              padding: mob ? "20px" : "36px 44px",
              display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "flex-start" : "center",
              gap: mob ? 16 : 32, marginBottom: 28,
              boxShadow: C.CARD_SHADOW,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: mob ? 48 : 64, height: mob ? 48 : 64, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: `0 0 40px ${ACCENT}25`,
                }}>
                  <span style={{ fontSize: mob ? 18 : 24, fontWeight: 300, color: "#fff" }}>M</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: mob ? 17 : 20, fontWeight: 500, marginBottom: 4, color: C.TEXT }}>Maria AI</div>
                  {mob && (
                    <div style={{ fontSize: 13, color: C.TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>
                      {t('explore.pillar3.mariaDesc')}
                    </div>
                  )}
                </div>
              </div>
              {!mob && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: C.TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>
                    {t('explore.pillar3.mariaDesc')}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                {[t('explore.pillar3.mode.text'), t('explore.pillar3.mode.video'), t('explore.pillar3.mode.voice')].map(m => (
                  <div key={m} style={{ padding: mob ? "5px 12px" : "6px 14px", borderRadius: 100, border: `1px solid ${C.BORDER}`, fontSize: mob ? 11 : 12, fontWeight: 400, color: C.TEXT_MUTED }}>{m}</div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
              {pillar3Cards.map((item, idx) => (
                <div key={idx} style={{ padding: mob ? 20 : 24, borderRadius: 12, border: `1px solid ${C.BORDER_STRONG}`, background: C.SURFACE, boxShadow: C.CARD_SHADOW }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: C.TEXT }}>{item.t}</div>
                  <div style={{ fontSize: 13, color: C.TEXT_SEC, lineHeight: 1.6, fontWeight: 300 }}>{item.d}</div>
                </div>
              ))}
            </div>
          </Pillar>
        </Reveal>
      </section>

      <section style={{ padding: mob ? "48px 0" : "100px 0" }} data-testid="section-transformation">
        <Reveal>
          <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto", marginBottom: mob ? 24 : 48 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: ACCENT,
              letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: mob ? 16 : 24,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              {t('explore.transform.label')}
            </div>
            <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 32px)" : "clamp(32px, 3.5vw, 44px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.03em", color: C.TEXT }}>
              {t('explore.transform.title1')}<br />{t('explore.transform.title2')}
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: 8 }}>
            {transformRows.map((row, i) => (
              <div key={i} style={{
                display: mob ? "flex" : "grid",
                flexDirection: mob ? "column" : undefined,
                gridTemplateColumns: mob ? undefined : "1fr auto 1fr",
                background: C.SURFACE,
                borderRadius: 10,
                border: `1px solid ${C.BORDER_STRONG}`,
                borderLeft: `3px solid rgba(124,58,237,0.35)`,
                padding: mob ? "18px 18px" : "28px 32px",
                alignItems: mob ? "flex-start" : "center", gap: mob ? 8 : 20,
                boxShadow: C.CARD_SHADOW,
              }} data-testid={`transform-row-${i}`}>
                <span style={{ fontSize: mob ? 13 : 15, color: C.TEXT_MUTED, textDecoration: "line-through", textDecorationColor: C.BORDER, fontWeight: 300 }}>{row.before}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, transform: mob ? "rotate(90deg)" : undefined }}>
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: mob ? 14 : 15, fontWeight: 600, color: ACCENT }}>{row.after}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEOTHEK SECTION
// ─────────────────────────────────────────────────────────────────────────────
interface Tutorial {
  id: number;
  title: string;
  description: string | null;
  youtubeVideoId: string;
  sortOrder: number;
  isActive: boolean;
}

function VideoShowcaseSection() {
  const { language } = useLanguage();
  const mob = useIsMobile();
  const { C } = useTheme();
  const [videos, setVideos] = useState<Tutorial[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const FALLBACK_IDS: Record<string, number[]> = { de: [15, 16, 26], en: [13, 18, 20, 24], ru: [25, 17, 21, 23] };
    Promise.all([
      fetch(`/api/tutorials?language=${language}`).then(r => r.json()).catch(() => []),
      fetch("/api/landing-settings").then(r => r.json()).catch(() => null),
    ]).then(([data, settings]: [Tutorial[], Record<string, number[]> | null]) => {
      const pinnedIds = settings || FALLBACK_IDS;
      const ids = pinnedIds[language] ?? FALLBACK_IDS[language];
      const active = Array.isArray(data)
        ? ids
          ? ids.map(id => data.find(t => t.id === id)).filter((t): t is Tutorial => t !== undefined)
          : data.filter(t => t.isActive)
        : [];
      setVideos(active);
      setCurrent(0);
      setPlayingId(null);
    });
  }, [language]);

  const texts = {
    de: { label: "VIDEOTHEK", title: "Videothek" },
    en: { label: "LIBRARY", title: "Video Library" },
    ru: { label: "БИБЛИОТЕКА", title: "Видеотека" },
  };
  const tx = texts[language as keyof typeof texts] || texts.de;

  const perPage = mob ? 1 : 3;
  const maxIndex = Math.max(0, videos.length - perPage);
  const prev = () => { setCurrent(i => Math.max(0, i - 1)); setPlayingId(null); };
  const next = () => { setCurrent(i => Math.min(maxIndex, i + 1)); setPlayingId(null); };

  if (videos.length === 0) return null;

  const visible = videos.slice(current, current + perPage);

  return (
    <section id="videos" style={{ padding: mob ? "60px 0" : "100px 0", background: C.SECTION_STRIPE, borderTop: `1px solid ${C.BORDER}` }} data-testid="section-videothek">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: mob ? "0 20px" : "0 56px" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: mob ? 28 : 44 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                {tx.label}
              </div>
              <h2 style={{ fontSize: mob ? "clamp(22px, 5vw, 28px)" : "clamp(28px, 2.5vw, 38px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.03em", color: C.TEXT, margin: 0 }}>
                {tx.title}
              </h2>
            </div>
            {videos.length > perPage && (
              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                <button
                  onClick={prev}
                  disabled={current === 0}
                  data-testid="videothek-prev"
                  style={{
                    width: 42, height: 42, borderRadius: "50%",
                    border: `1px solid ${current === 0 ? C.BORDER : C.BORDER_STRONG}`,
                    background: current === 0 ? "transparent" : C.SURFACE,
                    color: current === 0 ? C.TEXT_MUTED : C.TEXT,
                    cursor: current === 0 ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  onClick={next}
                  disabled={current >= maxIndex}
                  data-testid="videothek-next"
                  style={{
                    width: 42, height: 42, borderRadius: "50%",
                    border: `1px solid ${current >= maxIndex ? C.BORDER : C.BORDER_STRONG}`,
                    background: current >= maxIndex ? "transparent" : C.SURFACE,
                    color: current >= maxIndex ? C.TEXT_MUTED : C.TEXT,
                    cursor: current >= maxIndex ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : `repeat(${perPage}, 1fr)`, gap: mob ? 16 : 20 }}>
            {visible.map((v) => (
              <div
                key={v.id}
                onClick={() => setPlayingId(playingId === v.youtubeVideoId ? null : v.youtubeVideoId)}
                data-testid={`video-card-${v.id}`}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#000",
                  cursor: "pointer",
                  position: "relative",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={e => { if (playingId !== v.youtubeVideoId) { (e.currentTarget as HTMLElement).style.transform = "scale(1.02)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 48px rgba(0,0,0,0.28)"; } }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 32px rgba(0,0,0,0.18)"; }}
              >
                {playingId === v.youtubeVideoId ? (
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${v.youtubeVideoId}?autoplay=1&rel=0`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                ) : (
                  <div style={{ position: "relative", aspectRatio: "16/9" }}>
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`}
                      alt={v.title}
                      loading="lazy"
                      style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)",
                      display: "flex", flexDirection: "column", justifyContent: "space-between",
                      padding: "16px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                          border: "1.5px solid rgba(255,255,255,0.35)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "background 0.2s ease, transform 0.2s ease",
                        }}>
                          <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
                        </div>
                      </div>
                      <div style={{ fontSize: mob ? 12 : 13, fontWeight: 500, color: "#fff", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                        {v.title}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {videos.length > perPage && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28 }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setPlayingId(null); }}
                data-testid={`videothek-dot-${i}`}
                style={{
                  width: i === current ? 20 : 6, height: 6,
                  borderRadius: 3, border: "none", cursor: "pointer",
                  background: i === current ? ACCENT : C.BORDER_STRONG,
                  transition: "all 0.25s ease", padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITING AI SECTION — inline chat + live avatar
// ─────────────────────────────────────────────────────────────────────────────
interface ChatMsg { role: "user" | "assistant"; content: string; mode?: SofiaMode; }

type MicState = "idle" | "requesting" | "listening" | "transcribing" | "denied" | "error";

const MIC_LABELS: Record<string, { speak: string; stop: string; listening: string; transcribing: string; denied: string; speakerOn: string; speakerOff: string }> = {
  de: { speak: "Sprechen", stop: "Stopp", listening: "Ich höre zu …", transcribing: "Verstehe …", denied: "Mikrofon-Zugriff verweigert", speakerOn: "Antworten vorlesen", speakerOff: "Stumm" },
  en: { speak: "Speak", stop: "Stop", listening: "Listening …", transcribing: "Understanding …", denied: "Microphone permission denied", speakerOn: "Read replies aloud", speakerOff: "Mute" },
  ru: { speak: "Говорить", stop: "Стоп", listening: "Слушаю …", transcribing: "Распознаю …", denied: "Доступ к микрофону запрещён", speakerOn: "Озвучивать ответы", speakerOff: "Без звука" },
};

const VAD_SILENCE_THRESHOLD = 0.018;
const VAD_SILENCE_HOLD_MS = 1100;
const VAD_MIN_SPEECH_MS = 350;
const VAD_MAX_SEGMENT_MS = 18000;

function pickRecorderMime(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
}

function RecruitingChat({ lang }: { lang: string }) {
  const { C } = useTheme();
  const mob = useIsMobile();
  const visitorId = getVisitorId();

  const greetings: Record<string, string> = {
    de: "Hallo! Ich bin Sofia, deine persönliche Beraterin bei JetUP. Was interessiert dich mehr — passives Einkommen aufbauen oder ein eigenes Team führen?",
    en: "Hi! I'm Sofia, your personal JetUP consultant. What interests you more — building passive income or leading your own team?",
    ru: "Привет! Я София, твой личный консультант JetUP. Что тебе интереснее — пассивный доход или построение своей команды?",
  };

  const initialMessages = (): ChatMsg[] => {
    const stored = loadSharedChat(lang) as ChatMsg[];
    if (stored.length) return stored;
    return [{ role: "assistant", content: greetings[lang] || greetings.de, mode: "chat" }];
  };
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState(false);
  const [micState, setMicState] = useState<MicState>("idle");
  const [voiceAvailable, setVoiceAvailable] = useState<boolean | null>(null);
  const [speakerOn, setSpeakerOn] = useState<boolean>(() => {
    try { return localStorage.getItem("sofia-speaker-on") !== "0"; } catch { return true; }
  });
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  // Mic recorder refs.
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const rafRef = useRef<number | null>(null);
  const recorderMimeRef = useRef<string>("");
  const speakingStartRef = useRef<number | null>(null);
  const lastVoiceRef = useRef<number>(0);
  const segmentStartRef = useRef<number>(0);

  const tMic = MIC_LABELS[lang] || MIC_LABELS.de;
  const placeholders: Record<string, string> = { de: "Schreib deine Frage…", en: "Type your question…", ru: "Напиши свой вопрос…" };

  // Probe whether voice is configured for this language (STT + TTS available server-side).
  useEffect(() => {
    let cancelled = false;
    setVoiceAvailable(null);
    fetch(`/api/sofia/voice/config?lang=${lang}`)
      .then((r) => r.json())
      .then((cfg) => { if (!cancelled) setVoiceAvailable(!!cfg?.enabled); })
      .catch(() => { if (!cancelled) setVoiceAvailable(false); });
    return () => { cancelled = true; };
  }, [lang]);

  useEffect(() => {
    try { localStorage.setItem("sofia-speaker-on", speakerOn ? "1" : "0"); } catch { /* ignore */ }
    if (!speakerOn) stopTts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakerOn]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  // Persist back into the shared store. This intentionally mirrors what
  // appendSharedChatTurn writes; we don't dispatch the cross-component
  // "sofia:chat-updated" event from here to avoid a feedback loop.
  useEffect(() => {
    saveSharedChat(lang, messages as SharedChatMsg[]);
  }, [messages, lang]);

  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  useEffect(() => {
    function onReset() {
      setMessages([{ role: "assistant", content: greetings[lang] || greetings.de, mode: "chat" }]);
      setStreaming("");
      setLoading(false);
    }
    window.addEventListener("sofia:reset-chat", onReset);
    return () => window.removeEventListener("sofia:reset-chat", onReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Other modes (voice, avatar) write directly to the shared local
  // store via appendSharedChatTurn. Listen for that signal and rehydrate
  // so the chat tab catches up even if it was never opened during the
  // call.
  useEffect(() => {
    function onUpdated(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      if (detail.lang && detail.lang !== lang) return;
      const stored = loadSharedChat(lang) as ChatMsg[];
      if (stored.length) setMessages(stored);
    }
    window.addEventListener("sofia:chat-updated", onUpdated);
    return () => window.removeEventListener("sofia:chat-updated", onUpdated);
  }, [lang]);

  useEffect(() => {
    function onInject(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      const text: string = String(detail.text || "").trim();
      if (!text || loadingRef.current) return;
      send(text);
    }
    window.addEventListener("sofia:inject-user-message", onInject);
    return () => window.removeEventListener("sofia:inject-user-message", onInject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // sofia:voice-transcript fires for every voice/avatar transcript. The
  // emitter is also responsible for writing to the shared store via
  // appendSharedChatTurn, so the chat tab gets a "sofia:chat-updated"
  // signal and re-reads. We still listen here to keep the in-memory
  // state up to date when this component is mounted and the source
  // event reaches us before the store change handler.
  useEffect(() => {
    function onVoice(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      const text = typeof detail.message === "string" ? detail.message.trim() : "";
      if (!text) return;
      const role: ChatMsg["role"] = detail.source === "user" ? "user" : "assistant";
      const mode: SofiaMode = detail.mode === "avatar" ? "avatar" : "voice";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role && last.content.trim() === text) {
          return prev;
        }
        return [...prev, { role, content: text, mode }];
      });
    }
    window.addEventListener("sofia:voice-transcript", onVoice);
    return () => window.removeEventListener("sofia:voice-transcript", onVoice);
  }, []);

  function stopTts() {
    const a = ttsAudioRef.current;
    if (a) {
      try { a.pause(); a.src = ""; } catch { /* ignore */ }
      ttsAudioRef.current = null;
    }
    setSpeaking(false);
  }

  async function speakReply(text: string) {
    if (!speakerOn || !text.trim()) return;
    try {
      const r = await fetch("/api/sofia/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (!r.ok) return;
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      stopTts();
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      setSpeaking(true);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      try { URL.revokeObjectURL(url); } catch { /* ignore */ }
      if (ttsAudioRef.current === audio) ttsAudioRef.current = null;
      setSpeaking(false);
    } catch {
      setSpeaking(false);
    }
  }

  async function send(overrideText?: string, opts: { fromVoice?: boolean } = {}) {
    const text = (overrideText ?? input).trim();
    if (!text || loadingRef.current) return;
    const turnMode: SofiaMode = opts.fromVoice ? "voice" : "chat";
    const userMsg: ChatMsg = { role: "user", content: text, mode: turnMode };
    const newHistory = [...messagesRef.current, userMsg];
    setMessages(newHistory);
    if (overrideText === undefined) setInput("");
    setLoading(true);
    setStreaming("");

    try {
      const resp = await sofiaFetch("/api/maria/recruiting/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          language: lang,
          visitorId,
          mode: turnMode,
        }),
      });
      if (!resp.body) throw new Error("No body");
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.content) { full += d.content; setStreaming(full); }
              if (d.done) {
                setMessages(prev => [...prev, { role: "assistant", content: full, mode: turnMode }]);
                setStreaming("");
                setLoading(false);
                if (opts.fromVoice && full.trim()) {
                  void speakReply(full.trim());
                }
              }
            } catch {}
          }
        }
      }
    } catch {
      setLoading(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ───── Mic / VAD recording ────────────────────────────────────────────
  function tearDownMic() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch { /* ignore */ }
    recorderRef.current = null;
    chunksRef.current = [];
    try { streamRef.current?.getTracks().forEach((tr) => tr.stop()); } catch { /* ignore */ }
    streamRef.current = null;
    try { analyserRef.current?.disconnect(); } catch { /* ignore */ }
    analyserRef.current = null;
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    audioCtxRef.current = null;
  }

  async function startMic() {
    if (loading || micState !== "idle") return;
    stopTts();
    setMicState("requesting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setMicState("denied");
      window.setTimeout(() => setMicState((s) => (s === "denied" ? "idle" : s)), 3000);
      return;
    }
    streamRef.current = stream;
    const AudioCtx = window.AudioContext
      || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      tearDownMic();
      setMicState("error");
      window.setTimeout(() => setMicState("idle"), 2000);
      return;
    }
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyserRef.current = analyser;
    recorderMimeRef.current = pickRecorderMime();

    chunksRef.current = [];
    let rec: MediaRecorder;
    try {
      rec = recorderMimeRef.current
        ? new MediaRecorder(stream, { mimeType: recorderMimeRef.current })
        : new MediaRecorder(stream);
    } catch {
      tearDownMic();
      setMicState("error");
      window.setTimeout(() => setMicState("idle"), 2000);
      return;
    }
    recorderRef.current = rec;
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    rec.onstop = () => {
      const mime = recorderMimeRef.current || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      tearDownMic();
      void processVoiceBlob(blob);
    };
    rec.start(250);
    setMicState("listening");

    speakingStartRef.current = null;
    lastVoiceRef.current = 0;
    segmentStartRef.current = performance.now();
    const buf = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (recorderRef.current !== rec) return;
      analyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      const now = performance.now();
      const elapsed = now - segmentStartRef.current;

      if (rms > VAD_SILENCE_THRESHOLD) {
        if (speakingStartRef.current === null) speakingStartRef.current = now;
        lastVoiceRef.current = now;
      }
      const hadSpeech = speakingStartRef.current !== null
        && now - speakingStartRef.current >= VAD_MIN_SPEECH_MS;
      const silenceLongEnough = lastVoiceRef.current > 0
        && now - lastVoiceRef.current >= VAD_SILENCE_HOLD_MS;

      if ((hadSpeech && silenceLongEnough) || (elapsed >= VAD_MAX_SEGMENT_MS && hadSpeech)) {
        try { rec.stop(); } catch { /* ignore */ }
        return;
      }
      if (elapsed >= VAD_MAX_SEGMENT_MS && !hadSpeech) {
        // Nothing said within the cap — abandon this segment quietly.
        try { rec.stop(); } catch { /* ignore */ }
        chunksRef.current = [];
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function cancelMic() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try { recorderRef.current.stop(); } catch { /* ignore */ }
    }
    chunksRef.current = [];
    tearDownMic();
    setMicState("idle");
  }

  async function processVoiceBlob(blob: Blob) {
    if (!blob.size) {
      setMicState("idle");
      return;
    }
    setMicState("transcribing");
    try {
      const fd = new FormData();
      fd.append("file", blob, `speech.${blob.type.includes("mp4") ? "mp4" : "webm"}`);
      fd.append("lang", lang);
      const r = await fetch("/api/sofia/voice/stt", { method: "POST", body: fd });
      if (!r.ok) throw new Error(`stt ${r.status}`);
      const { text } = (await r.json()) as { text?: string };
      const userText = (text || "").trim();
      setMicState("idle");
      if (userText) {
        void send(userText, { fromVoice: true });
      }
    } catch {
      setMicState("error");
      window.setTimeout(() => setMicState("idle"), 2000);
    }
  }

  // Cleanup on unmount.
  useEffect(() => () => { tearDownMic(); stopTts(); }, []);

  const bubbleBg = (role: "user" | "assistant") =>
    role === "user"
      ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`
      : C.SURFACE;
  const bubbleColor = (role: "user" | "assistant") => (role === "user" ? "#fff" : C.TEXT);
  const bubbleBorder = (role: "user" | "assistant") => (role === "user" ? "none" : `1px solid ${C.BORDER_STRONG}`);

  const micBusy = micState !== "idle" && micState !== "denied" && micState !== "error";
  const showMic = voiceAvailable !== false; // default to showing while probe is in flight
  const statusLine =
    micState === "listening" ? tMic.listening
    : micState === "transcribing" ? tMic.transcribing
    : micState === "denied" ? tMic.denied
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: mob ? 380 : 440, border: `1px solid ${C.BORDER_STRONG}`, borderRadius: 16, overflow: "hidden", background: C.BG }} data-testid="recruiting-chat">
      <div style={{ flex: 1, overflowY: "auto", padding: mob ? "16px 12px" : "20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => {
          const voiceLabel = lang === "de" ? "Sprache" : lang === "en" ? "voice" : "голос";
          const avatarLabel = lang === "de" ? "Avatar" : lang === "en" ? "avatar" : "аватар";
          const badge = m.mode === "voice" ? `🎙 ${voiceLabel}` : m.mode === "avatar" ? `🎥 ${avatarLabel}` : null;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 2 }}>
              {badge && (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.TEXT_MUTED,
                    padding: "1px 6px",
                    borderRadius: 6,
                    background: m.role === "user" ? "rgba(124,58,237,0.12)" : C.SURFACE,
                    border: `1px solid ${C.BORDER}`,
                  }}
                  data-testid={`chat-msg-mode-${i}`}
                >
                  {badge}
                </div>
              )}
              <div style={{
                maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: bubbleBg(m.role), color: bubbleColor(m.role),
                border: bubbleBorder(m.role), fontSize: mob ? 13 : 14, lineHeight: 1.55, fontWeight: 400,
              }} data-testid={`chat-msg-${i}`}>
                {m.content}
              </div>
            </div>
          );
        })}
        {(streaming || loading) && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: "16px 16px 16px 4px",
              background: C.SURFACE, color: C.TEXT, border: `1px solid ${C.BORDER_STRONG}`,
              fontSize: mob ? 13 : 14, lineHeight: 1.55,
            }}>
              {streaming || <span style={{ opacity: 0.4 }}>…</span>}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {(statusLine || speaking) && (
        <div
          style={{
            padding: "6px 14px",
            borderTop: `1px solid ${C.BORDER}`,
            background: micState === "listening" ? `${ACCENT}14` : C.SURFACE,
            color: micState === "denied" || micState === "error" ? "#EF4444" : C.TEXT_SEC,
            fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
          }}
          data-testid="recruiting-chat-status"
        >
          {speaking && !statusLine ? (
            <>
              <Volume2 size={12} />
              <span>{lang === "de" ? "Sofia spricht …" : lang === "ru" ? "София говорит …" : "Sofia is speaking …"}</span>
              <button
                onClick={stopTts}
                style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 2, display: "flex" }}
                data-testid="recruiting-chat-stop-tts"
                title="Stop"
              >
                <Square size={11} />
              </button>
            </>
          ) : (
            <>
              {micState === "listening" && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, boxShadow: `0 0 8px ${ACCENT}`, animation: "pulse 1.2s ease-in-out infinite" }} />
              )}
              {micState === "transcribing" && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
              <span>{statusLine}</span>
            </>
          )}
        </div>
      )}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.BORDER}`, display: "flex", gap: 8, background: C.SURFACE, alignItems: "center" }}>
        {showMic && (
          <button
            onClick={micBusy ? cancelMic : startMic}
            disabled={loading && !micBusy}
            style={{
              width: 40, height: 40, borderRadius: 10, cursor: loading && !micBusy ? "not-allowed" : "pointer",
              background: micState === "listening" ? "#EF4444" : micBusy ? C.BORDER_STRONG : "transparent",
              color: micState === "listening" ? "#fff" : C.TEXT_SEC,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              transition: "background 0.15s ease", border: micState === "listening" ? "none" : `1px solid ${C.BORDER_STRONG}`,
              opacity: (loading && !micBusy) ? 0.4 : 1,
            }}
            data-testid="recruiting-chat-mic"
            title={micBusy ? tMic.stop : tMic.speak}
            aria-label={micBusy ? tMic.stop : tMic.speak}
          >
            {micState === "listening" ? <MicOff size={16} /> : micState === "transcribing" ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Mic size={16} />}
          </button>
        )}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder={placeholders[lang] || placeholders.de}
          disabled={loading || micBusy}
          style={{
            flex: 1, background: C.BG, border: `1px solid ${C.BORDER_STRONG}`, borderRadius: 10,
            color: C.TEXT, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none",
            opacity: (loading || micBusy) ? 0.6 : 1,
          }}
          data-testid="recruiting-chat-input"
        />
        <button
          onClick={() => setSpeakerOn((v) => !v)}
          style={{
            width: 36, height: 40, borderRadius: 10, border: `1px solid ${C.BORDER_STRONG}`, cursor: "pointer",
            background: "transparent", color: speakerOn ? ACCENT : C.TEXT_MUTED,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
          data-testid="recruiting-chat-speaker-toggle"
          title={speakerOn ? tMic.speakerOff : tMic.speakerOn}
          aria-label={speakerOn ? tMic.speakerOff : tMic.speakerOn}
        >
          {speakerOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
        <button
          onClick={() => send()}
          disabled={loading || micBusy || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 10, border: "none", cursor: "pointer",
            background: input.trim() && !loading && !micBusy ? ACCENT : C.BORDER_STRONG,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s ease", flexShrink: 0,
          }}
          data-testid="recruiting-chat-send"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function RecruitingAISection() {
  const { language } = useLanguage();
  const mob = useIsMobile();
  const { C } = useTheme();

  const texts = {
    de: {
      label: "KI-SCHICHT RECRUITING",
      title: "Sprich mit Sofia",
      subtitle: "Deine persönliche Beraterin beantwortet alle Fragen — schreib oder sprich, ganz wie du willst.",
    },
    en: {
      label: "AI RECRUITING LAYER",
      title: "Talk to Sofia",
      subtitle: "Your personal consultant answers all questions — type or speak, whichever you prefer.",
    },
    ru: {
      label: "ИИ-СЛОЙ РЕКРУТИНГ",
      title: "Поговори с Софией",
      subtitle: "Твой личный консультант ответит на все вопросы — пиши или говори, как удобно.",
    },
  };
  const tx = texts[language as keyof typeof texts] || texts.de;

  return (
    <section style={{
      padding: mob ? "60px 20px 80px" : "100px 56px 120px",
      background: C.BG,
      borderTop: `1px solid ${C.BORDER}`,
      position: "relative",
    }} data-testid="section-recruiting-ai">
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: mob ? 32 : 48 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: ACCENT,
              letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
              {tx.label}
            </div>
            <h2 style={{
              fontSize: mob ? "clamp(28px, 7vw, 40px)" : "clamp(36px, 4vw, 52px)",
              fontWeight: 300, lineHeight: 1.15, letterSpacing: "-0.03em", color: C.TEXT, marginBottom: 14,
            }}>
              {tx.title}
            </h2>
            <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 480, margin: "0 auto" }}>
              {tx.subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <RecruitingChat lang={language} />
        </Reveal>
      </div>
    </section>
  );
}

type PresentationMode = "slide" | "interactive";

function SlideNavBar({
  canPrev,
  canNext,
  onPrev,
  onNext,
  C,
}: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  C: ThemeColors;
}) {
  const btnStyle = (enabled: boolean): React.CSSProperties => ({
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: `1px solid ${enabled ? `${ACCENT}55` : C.BORDER}`,
    background: enabled
      ? `linear-gradient(135deg, ${ACCENT}22, ${ACCENT_LIGHT}10)`
      : "transparent",
    color: enabled ? C.TEXT : C.TEXT_MUTED,
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s ease, transform 0.15s ease",
  });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "6px 8px",
      }}
      data-testid="slide-nav-bar"
    >
      <button
        onClick={canPrev ? onPrev : undefined}
        disabled={!canPrev}
        aria-label="Previous slide"
        data-testid="button-slide-prev"
        style={btnStyle(canPrev)}
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={canNext ? onNext : undefined}
        disabled={!canNext}
        aria-label="Next slide"
        data-testid="button-slide-next"
        style={btnStyle(canNext)}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

function InlinePlayerStage({
  mode,
  language,
  onSofiaHandoff,
  onChoosePath,
  onOpenHub,
  presenterRef,
  onNavStateChange,
}: {
  mode: PresentationMode;
  language: Language;
  onSofiaHandoff?: () => void;
  onChoosePath?: (key: "investor" | "partner" | "both") => void;
  onOpenHub?: () => void;
  presenterRef?: React.Ref<InteractivePresentationHandle>;
  onNavStateChange?: (state: { canPrev: boolean; canNext: boolean }) => void;
}) {
  const lang = (language === "de" || language === "ru" || language === "en" ? language : "de") as "de" | "ru" | "en";
  const noop = useCallback(() => {}, []);
  const handleHub = onOpenHub ?? noop;
  const handleChoosePath = useCallback(
    (key: "investor" | "partner" | "both") => {
      if (onChoosePath) onChoosePath(key);
      else if (onSofiaHandoff) onSofiaHandoff();
    },
    [onChoosePath, onSofiaHandoff],
  );

  // Slide content uses vw-based fonts that reference the browser viewport.
  // To make it fit any container size (inline 16:9 frame OR fullscreen),
  // we render the slide inside a fixed-size virtual viewport equal to the
  // browser viewport, then scale the whole thing to fit the parent. The
  // ResizeObserver re-runs on every parent size change so toggling fullscreen
  // simply rescales the SAME mounted instance — no remount, no audio dropout.
  const stageRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
  const [vh, setVh] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 720));
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dw = window.innerWidth || 1280;
      const dh = window.innerHeight || 720;
      setVw(dw);
      setVh(dh);
      if (r.width > 0 && r.height > 0) {
        setScale(Math.min(r.width / dw, r.height / dh));
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, []);

  if (mode === "slide") {
    return (
      <div ref={stageRef} style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0B0B16" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: vw,
            height: vh,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <InteractivePresentation
            key={`slide-${lang}`}
            ref={presenterRef}
            embedded
            onClose={noop}
            language={lang}
            onNavStateChange={onNavStateChange}
          />
        </div>
      </div>
    );
  }
  return (
    <VideoPresentationPlayer
      key={`video-${lang}`}
      embedded
      language={lang}
      onClose={noop}
      onSofiaHandoff={onSofiaHandoff}
      onContactInviter={onSofiaHandoff}
      onChoosePath={handleChoosePath}
      onOpenHub={handleHub}
    />
  );
}

function PresentationSection() {
  const { t } = useLanguage();
  const { language } = useLanguage();
  const mob = useIsMobile();
  const { C } = useTheme();
  const [mode, setMode] = useState<PresentationMode>("slide");
  const [fullscreen, setFullscreen] = useState(false);
  const [navState, setNavState] = useState({ canPrev: false, canNext: false });
  const presenterRef = useRef<InteractivePresentationHandle>(null);

  const switchMode = useCallback((m: PresentationMode) => {
    setMode(m);
  }, []);

  const handleNavStateChange = useCallback((s: { canPrev: boolean; canNext: boolean }) => {
    setNavState(s);
  }, []);

  const handlePrev = useCallback(() => { presenterRef.current?.prev(); }, []);
  const handleNext = useCallback(() => { presenterRef.current?.next(); }, []);

  const handleSofiaFromPlayer = useCallback(() => {
    setFullscreen(false);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("sofia:open-chat"));
    }, 100);
  }, []);

  const handleChoosePathFromPlayer = useCallback(
    (key: "investor" | "partner" | "both") => {
      const lang = language === "ru" || language === "en" ? language : "de";
      const seeds: Record<string, Record<"investor" | "partner" | "both", string>> = {
        de: {
          investor: "Ich interessiere mich für den Investor-Weg. Erzähl mir mehr über die Denis Fast-Start Promo.",
          partner: "Ich möchte als Partner starten — ohne Investment. Wie funktioniert das JetUP Partner-Programm?",
          both: "Ich will beides: Investor und Partner. Wie kombiniere ich das?",
        },
        ru: {
          investor: "Меня интересует путь инвестора. Расскажи подробнее про Denis Fast-Start Promo.",
          partner: "Хочу стартовать как партнёр — без инвестиций. Как работает партнёрская программа JetUP?",
          both: "Хочу и то, и другое: инвестор и партнёр. Как это совместить?",
        },
        en: {
          investor: "I'm interested in the investor path. Tell me more about the Denis Fast-Start Promo.",
          partner: "I want to start as a partner — without investment. How does the JetUP partner program work?",
          both: "I want both: investor and partner. How do I combine them?",
        },
      };
      const seedUserMessage = seeds[lang]?.[key] ?? seeds.de[key];
      setFullscreen(false);
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("sofia:open-chat", { detail: { seedUserMessage } }),
        );
      }, 100);
    },
    [language],
  );

  const handleOpenHubFromPlayer = useCallback(() => {
    setFullscreen(false);
    window.location.href = "/partner";
  }, []);

  // Lock body scroll while the cinema overlay is open + close on Esc.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  const ModePill = ({ value, label, primary }: { value: PresentationMode; label: string; primary: boolean }) => {
    const active = mode === value;
    return (
      <motion.button
        onClick={() => switchMode(value)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: mob ? "13px 24px" : "15px 30px",
          background: primary
            ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`
            : active
              ? `linear-gradient(135deg, ${ACCENT}28, ${ACCENT_LIGHT}10)`
              : "transparent",
          border: primary ? "none" : `1px solid ${active ? `${ACCENT}99` : `${ACCENT}55`}`,
          borderRadius: 100,
          color: primary ? "#fff" : (active ? C.TEXT : C.TEXT_SEC),
          fontSize: mob ? 13 : 14,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
          letterSpacing: "0.02em",
          width: "100%",
          textAlign: "left",
        }}
        data-testid={value === "slide" ? "btn-mode-slide" : "btn-mode-interactive"}
      >
        {label}
      </motion.button>
    );
  };

  return (
    <section
      id="presentation"
      style={{ padding: mob ? "60px 20px" : "100px 56px", background: C.BG, borderTop: `1px solid ${C.BORDER}` }}
      data-testid="section-presentation"
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal>
          <div style={{
            display: mob ? "block" : "grid",
            gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.4fr)",
            gap: mob ? 28 : 56,
            alignItems: "start",
          }}>
            {/* LEFT — selector */}
            <div style={{ marginBottom: mob ? 28 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                {t('explore.presentation.label')}
              </div>
              <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 34px)" : "clamp(32px, 3vw, 44px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.15, color: C.TEXT, marginBottom: 16 }}>
                {t('explore.presentation.title')}
              </h2>
              <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.75, fontWeight: 300, maxWidth: 420, marginBottom: 28 }}>
                {t('explore.presentation.modeHint')}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "stretch", maxWidth: 360 }}>
                <ModePill value="slide" label={t('explore.presentation.btn')} primary />
                <ModePill value="interactive" label={t('explore.presentation.btnInteractive')} primary={false} />
                <div style={{ fontSize: 11, color: C.TEXT_MUTED, lineHeight: 1.6, marginTop: 4 }}>
                  {mode === "slide" ? t('explore.presentation.modeSlide') : t('explore.presentation.modeInteractive')}
                </div>
              </div>
            </div>

            {/* RIGHT — inline player. The 16:9 placeholder always reserves the
                same layout space; when fullscreen is on, the inner frame
                detaches via position:fixed so the same player instance keeps
                playing without remounting. */}
            <div>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                }}
                data-testid="player-placeholder"
              >
                <div
                  style={
                    fullscreen
                      ? {
                          position: "fixed",
                          inset: 0,
                          zIndex: 9999,
                          background: "rgba(5,5,12,0.97)",
                          backdropFilter: "blur(20px)",
                          display: "flex",
                          flexDirection: "column",
                          padding: mob ? 16 : 24,
                        }
                      : {
                          position: "absolute",
                          inset: 0,
                          borderRadius: 20,
                          overflow: "hidden",
                          border: `1px solid ${ACCENT}30`,
                          background: "#0B0B16",
                          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
                        }
                  }
                  data-testid={fullscreen ? "overlay-presentation-fullscreen" : "player-frame"}
                >
                  {fullscreen && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.3em" }}>
                        {(mode === "slide" ? t('explore.presentation.modeSlide') : t('explore.presentation.modeInteractive'))}
                      </div>
                      <button
                        onClick={() => setFullscreen(false)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.14)",
                          background: "rgba(255,255,255,0.04)",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={t('explore.presentation.exitFullscreen')}
                        data-testid="btn-fullscreen-close"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      position: "relative",
                      flex: fullscreen ? 1 : undefined,
                      minHeight: fullscreen ? 0 : undefined,
                      width: "100%",
                      height: fullscreen ? undefined : "100%",
                      borderRadius: fullscreen ? 16 : 0,
                      overflow: "hidden",
                      background: "#0B0B16",
                    }}
                  >
                    <InlinePlayerStage
                      mode={mode}
                      language={language}
                      onSofiaHandoff={handleSofiaFromPlayer}
                      onChoosePath={handleChoosePathFromPlayer}
                      onOpenHub={handleOpenHubFromPlayer}
                      presenterRef={presenterRef}
                      onNavStateChange={handleNavStateChange}
                    />
                    {!fullscreen && (
                      <button
                        onClick={() => setFullscreen(true)}
                        title={t('explore.presentation.fullscreen')}
                        aria-label={t('explore.presentation.fullscreen')}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.14)",
                          background: "rgba(0,0,0,0.5)",
                          backdropFilter: "blur(8px)",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "inherit",
                          zIndex: 5,
                        }}
                        data-testid="btn-fullscreen"
                      >
                        <Maximize2 size={14} />
                      </button>
                    )}
                  </div>
                  {fullscreen && mode === "slide" && (
                    <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                      <SlideNavBar canPrev={navState.canPrev} canNext={navState.canNext} onPrev={handlePrev} onNext={handleNext} C={C} />
                    </div>
                  )}
                </div>
              </div>
              {!fullscreen && mode === "slide" && (
                <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
                  <SlideNavBar canPrev={navState.canPrev} canNext={navState.canNext} onPrev={handlePrev} onNext={handleNext} C={C} />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DigitalHubSection() {
  const { t } = useLanguage();
  const mob = useIsMobile();
  const { C, theme } = useTheme();
  const bullets = [
    t('explore.hub.bullet1'),
    t('explore.hub.bullet2'),
    t('explore.hub.bullet3'),
    t('explore.hub.bullet4'),
  ];
  return (
    <section
      id="digital-hub"
      style={{ padding: mob ? "60px 20px" : "100px 56px", background: C.SECTION_STRIPE, borderTop: `1px solid ${C.BORDER}` }}
      data-testid="section-digital-hub"
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div style={{ marginBottom: mob ? 40 : 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: ACCENT }} />
                {t('explore.hub.label')}
              </div>
              <h2 style={{ fontSize: mob ? "clamp(28px, 7vw, 38px)" : "clamp(34px, 3.5vw, 48px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.15, color: C.TEXT, marginBottom: 16 }}>
                {t('explore.hub.title')}
              </h2>
              <p style={{ fontSize: mob ? 15 : 17, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, marginBottom: 12 }}>
                {t('explore.hub.subtitle')}
              </p>
            </div>
            <div>
              <p style={{ fontSize: mob ? 14 : 15, color: C.TEXT_SEC, lineHeight: 1.75, fontWeight: 300, marginBottom: 8 }}>
                {t('explore.hub.body1')}
              </p>
              <p style={{ fontSize: mob ? 14 : 15, color: C.TEXT, lineHeight: 1.75, fontWeight: 400, marginBottom: 24 }}>
                {t('explore.hub.body2')}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                {bullets.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT_LIGHT, flexShrink: 0, display: "block" }} />
                    <span style={{ fontSize: mob ? 14 : 15, color: C.TEXT_SEC, fontWeight: 300 }}>{b}</span>
                  </div>
                ))}
              </div>
              <motion.a
                href="https://jet-up.ai/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "inline-block",
                  padding: mob ? "14px 28px" : "16px 36px",
                  background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(13,13,26,0.07)",
                  border: `1px solid ${C.BORDER_STRONG}`,
                  borderRadius: 100, color: C.TEXT,
                  fontSize: mob ? 13 : 14, fontWeight: 600,
                  textDecoration: "none", fontFamily: "inherit", letterSpacing: "0.02em",
                  transition: "background 0.2s ease, box-shadow 0.2s ease",
                }}
                data-testid="btn-open-hub"
              >
                {t('explore.hub.btn')} ↗
              </motion.a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FloatingMariaButton({ onClick, isOpen, lang }: { onClick: () => void; isOpen: boolean; lang: string }) {
  const { C } = useTheme();
  const mob = useIsMobile();

  // "Active conversation" = the user has exchanged at least one message
  // beyond Sofia's initial greeting. We poll storage on mount and refresh
  // when SofiaPanel dispatches `sofia:chat-updated` / `sofia:reset-chat`.
  const [hasActiveChat, setHasActiveChat] = useState(false);
  useEffect(() => {
    function check() {
      try {
        const history = loadSharedChat(lang);
        setHasActiveChat(history.some((m) => m.role === "user"));
      } catch {
        setHasActiveChat(false);
      }
    }
    check();
    function onUpdated() { check(); }
    function onReset() { setHasActiveChat(false); }
    window.addEventListener("sofia:chat-updated", onUpdated);
    window.addEventListener("sofia:reset-chat", onReset);
    return () => {
      window.removeEventListener("sofia:chat-updated", onUpdated);
      window.removeEventListener("sofia:reset-chat", onReset);
    };
  }, [lang]);

  // Show the active-conversation pulse only when the panel is collapsed.
  const showPulse = !isOpen && hasActiveChat;

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 3, duration: 0.5, ease: EASE }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: "fixed", bottom: mob ? 16 : 28, right: mob ? 16 : 28, zIndex: 150,
        width: mob ? 52 : 64, height: mob ? 52 : 64, borderRadius: mob ? 16 : 20,
        background: isOpen ? C.SURFACE : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
        border: isOpen ? `2px solid ${ACCENT}` : "none",
        color: isOpen ? ACCENT : "#fff",
        boxShadow: `0 4px 28px ${ACCENT}55`,
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.3s ease, border 0.3s ease",
        flexDirection: "column",
        gap: 4,
      }}
      data-testid="floating-maria-btn"
      aria-label="Chat with Sofia AI"
    >
      {/* Active-conversation indicator — concentric pulses behind the FAB
          so the user can see that a Sofia chat is in progress while the
          panel is minimized. */}
      {showPulse && [0, 0.6].map((delay) => (
        <motion.span
          key={delay}
          initial={{ scale: 1, opacity: 0.55 }}
          animate={{ scale: 1.7, opacity: 0 }}
          transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: -2,
            borderRadius: "inherit",
            border: `2px solid ${ACCENT}`,
            pointerEvents: "none",
            zIndex: -1,
          }}
          aria-hidden
        />
      ))}
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.span
            key="close"
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex" }}
          >
            <X size={22} />
          </motion.span>
        ) : (
          <motion.div
            key="icons"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
          >
            <div style={{ display: "flex", gap: mob ? 4 : 6, alignItems: "center" }}>
              <MessageSquare size={mob ? 11 : 13} color="rgba(255,255,255,0.9)" />
              <Mic size={mob ? 11 : 13} color="rgba(255,255,255,0.9)" />
              <Video size={mob ? 11 : 13} color="rgba(255,255,255,0.9)" />
            </div>
            <span style={{ fontSize: mob ? 8 : 9, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "inherit" }}>
              Sofia AI
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function FloatingMariaPanel({ isOpen, onClose, lang }: { isOpen: boolean; onClose: () => void; lang: string; onPresentationRedirect?: () => void }) {
  const { C } = useTheme();
  const mob = useIsMobile();
  const voice = useSofiaVoice();

  // Sync panel-open state into the voice provider.
  useEffect(() => {
    voice.setPanelOpen(isOpen);
  }, [isOpen, voice]);

  // Sharp corners everywhere per spec.
  // Mobile: bottom sheet using dvh so the iOS browser chrome / keyboard
  //         don't leave the panel cut off or overflowing.
  // Desktop: floating card to the left of the FAB orb.
  const panelStyle: React.CSSProperties = mob
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 149,
        height: "min(80dvh, 600px)",
        maxHeight: "80dvh",
        borderRadius: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "fixed",
        bottom: 28,
        right: 100,
        zIndex: 149,
        width: 420,
        maxWidth: "calc(100vw - 140px)",
        height: "min(640px, calc(100vh - 120px))",
        maxHeight: "calc(100vh - 120px)",
        borderRadius: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      };

  // SofiaPanel itself is mounted at all times so that its event
  // listeners (sofia:inject-user-message, sofia:assistant-reply-done)
  // and the SSE → TTS pipeline survive the panel being collapsed.
  // Without this, live voice mode would stall the moment the panel
  // is minimized — STT segments would be dispatched but nobody would
  // listen for them. Visibility is controlled via animated transform
  // / opacity / pointer-events so the user still gets the slide-in /
  // slide-out feel, but the React tree never unmounts.
  const closedTransform = mob ? { y: "100%" } : { x: 80, opacity: 0 };
  const openTransform = mob ? { y: 0 } : { x: 0, opacity: 1 };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 148, background: "rgba(0,0,0,0.5)" }}
          />
        )}
      </AnimatePresence>
      <motion.div
        key="panel"
        initial={false}
        animate={isOpen ? openTransform : closedTransform}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        aria-hidden={!isOpen}
        style={{
          ...panelStyle,
          background: C.SURFACE,
          border: `1px solid ${C.BORDER_STRONG}`,
          boxShadow: `0 0 0 1px ${ACCENT}33`,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        data-testid="floating-maria-panel"
        data-panel-open={isOpen ? "true" : "false"}
      >
        <div style={{ flex: 1, minHeight: 0, display: "flex", position: "relative" }}>
          <SofiaPanel
            lang={lang}
            mob={mob}
            onClose={onClose}
          />
        </div>
      </motion.div>
    </>
  );
}

function ApplicationSection() {
  const { language } = useLanguage();
  const mob = useIsMobile();
  const { C, theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const texts = {
    en: {
      label: "CONTACT",
      title: "Ready to take the next step?",
      subtitle: "Fill out the form and we'll get back to you within 24 hours.",
      name: "Name", namePlaceholder: "What should we call you?",
      email: "Email", emailPlaceholder: "your@email.com",
      subject: "Subject", subjectPlaceholder: "What is this about?",
      message: "Message", messagePlaceholder: "Enter your message...",
      submit: "Send Message",
      success: "Thank you!",
      successMsg: "We'll get back to you shortly.",
      error: "An error occurred. Please try again.",
    },
    de: {
      label: "KONTAKT",
      title: "Bereit für den nächsten Schritt?",
      subtitle: "Fülle das Formular aus und wir melden uns innerhalb von 24 Stunden bei dir.",
      name: "Name", namePlaceholder: "Wie sollen wir dich nennen?",
      email: "E-Mail", emailPlaceholder: "deine@email.com",
      subject: "Betreff", subjectPlaceholder: "Worum geht es?",
      message: "Nachricht", messagePlaceholder: "Deine Nachricht...",
      submit: "Nachricht senden",
      success: "Danke!",
      successMsg: "Wir melden uns in Kürze.",
      error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
    },
    ru: {
      label: "КОНТАКТ",
      title: "Готовы сделать следующий шаг?",
      subtitle: "Заполните форму, и мы свяжемся с вами в течение 24 часов.",
      name: "Имя", namePlaceholder: "Как к вам обращаться?",
      email: "Email", emailPlaceholder: "ваш@email.com",
      subject: "Тема", subjectPlaceholder: "О чём хотите написать?",
      message: "Сообщение", messagePlaceholder: "Введите сообщение...",
      submit: "Отправить сообщение",
      success: "Спасибо!",
      successMsg: "Мы свяжемся с вами в ближайшее время.",
      error: "Произошла ошибка. Попробуйте ещё раз.",
    },
  };

  const tx = texts[language] || texts.de;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px",
    background: theme === "dark" ? "rgba(255,255,255,0.04)" : "#f9f9fc",
    border: `1px solid ${C.BORDER_STRONG}`,
    borderRadius: 10, color: C.TEXT,
    fontSize: 14, fontWeight: 300,
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s ease",
    appearance: "none" as const,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
    textTransform: "uppercase", color: C.TEXT_MUTED,
    marginBottom: 8, display: "block",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      alert(tx.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="application" style={{ padding: mob ? "60px 20px 80px" : "80px 56px 120px", background: C.SECTION_STRIPE, borderTop: `1px solid ${C.BORDER}` }} data-testid="section-application">
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <Reveal>
          <div style={{ display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
            <div style={{ marginBottom: mob ? 40 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: ACCENT_LIGHT, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
                {tx.label}
              </div>
              <h2 style={{ fontSize: mob ? "clamp(26px, 6vw, 34px)" : "clamp(30px, 3vw, 40px)", fontWeight: 300, lineHeight: 1.2, letterSpacing: "-0.02em", color: C.TEXT, marginBottom: 20 }}>
                {tx.title}
              </h2>
              <p style={{ fontSize: mob ? 14 : 16, color: C.TEXT_SEC, lineHeight: 1.7, fontWeight: 300, maxWidth: 380 }}>
                {tx.subtitle}
              </p>
            </div>

            <div style={{
              background: C.SURFACE,
              border: `1px solid ${C.BORDER_STRONG}`,
              borderTop: `3px solid ${ACCENT}`,
              borderRadius: 16,
              padding: mob ? 24 : 40,
              boxShadow: theme === "light"
                ? "0 4px 24px rgba(13,13,26,0.08), 0 24px 64px rgba(13,13,26,0.06)"
                : "none",
            }}>
              {!isSuccess ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }} data-testid="form-application">
                  <div>
                    <label style={labelStyle}>{tx.name}</label>
                    <input
                      type="text"
                      placeholder={tx.namePlaceholder}
                      value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      required
                      style={inputStyle}
                      data-testid="input-name"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{tx.email}</label>
                    <input
                      type="email"
                      placeholder={tx.emailPlaceholder}
                      value={formData.email}
                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                      required
                      style={inputStyle}
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{tx.subject}</label>
                    <input
                      type="text"
                      placeholder={tx.subjectPlaceholder}
                      value={formData.subject}
                      onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                      required
                      style={inputStyle}
                      data-testid="input-subject"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{tx.message}</label>
                    <textarea
                      placeholder={tx.messagePlaceholder}
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      required
                      rows={4}
                      style={{ ...inputStyle, resize: "vertical", minHeight: 110 }}
                      data-testid="input-message"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "16px 32px",
                      background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                      border: "none", borderRadius: 100,
                      color: "#fff", fontSize: 14, fontWeight: 600,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontFamily: "inherit", letterSpacing: "0.02em",
                      opacity: isSubmitting ? 0.7 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                    data-testid="btn-submit-application"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%" }}
                        />
                        {tx.submit}
                      </>
                    ) : tx.submit}
                  </motion.button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  style={{ textAlign: "center", padding: "40px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
                  data-testid="application-success"
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT_LIGHT}20)`,
                    border: `1px solid ${ACCENT}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={28} color={ACCENT_LIGHT} strokeWidth={2.5} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.TEXT }}>{tx.success}</div>
                  <div style={{ fontSize: 15, color: C.TEXT_SEC, fontWeight: 300 }}>{tx.successMsg}</div>
                </motion.div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TelegramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
  </svg>
);

const SOCIAL_LINKS = [
  { label: "Telegram", href: "https://t.me/jet_up_official", Icon: TelegramIcon },
  { label: "Instagram", href: "https://www.instagram.com/jetup.official?igsh=MjZwdXJpd2JsYmw1&utm_source=qr", Icon: InstagramIcon },
  { label: "YouTube", href: "https://www.youtube.com/@JetUP_official", Icon: YouTubeIcon },
];

type LegalModalType = 'terms' | 'privacy' | 'impressum';

function getLegalContent(type: LegalModalType, lang: Language): React.ReactNode {
  if (type === 'impressum') {
    return (
      <div>
        <p style={{ marginBottom: 16 }}><strong>JetUP LLC</strong></p>
        <p style={{ marginBottom: 8 }}>Registry No: 402155813</p>
        <p style={{ marginBottom: 8 }}>Georgia, Tbilisi, Didube district, Uznadze street, N111, flat N11, Building N2</p>
        <p style={{ marginBottom: 16 }}>Email: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        {lang === 'de' && <>
          <p style={{ marginBottom: 12 }}>JetUP unterhält kein EU-Büro. Finanztransaktionen werden über TagMarkets (unabhängiger regulierter Broker) abgewickelt.</p>
          <p style={{ marginBottom: 12 }}>JetUP bietet ausschließlich Informations- und Bildungsangebote — kein Broker- oder Finanzberatungsservice.</p>
          <p style={{ marginBottom: 12 }}>EU-Plattform für Online-Streitbeilegung: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT_LIGHT }}>https://ec.europa.eu/consumers/odr</a> — JetUP nimmt nicht an Verbraucherstreitbeilegungsverfahren teil.</p>
        </>}
        {lang === 'ru' && <>
          <p style={{ marginBottom: 12 }}>JetUP не имеет офиса в ЕС. Финансовые операции осуществляются через TagMarkets (независимый регулируемый брокер).</p>
          <p style={{ marginBottom: 12 }}>JetUP предоставляет исключительно информационные и образовательные материалы — не является брокером или финансовым консультантом.</p>
          <p style={{ marginBottom: 12 }}>Платформа ЕС для онлайн-урегулирования споров: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT_LIGHT }}>https://ec.europa.eu/consumers/odr</a> — JetUP не участвует в процедурах потребительского арбитража.</p>
        </>}
        {lang === 'en' && <>
          <p style={{ marginBottom: 12 }}>JetUP does not maintain an EU office. Financial transactions are conducted via TagMarkets (independent regulated broker).</p>
          <p style={{ marginBottom: 12 }}>JetUP is information and education only — not a broker or financial advisor.</p>
          <p style={{ marginBottom: 12 }}>EU ODR platform: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT_LIGHT }}>https://ec.europa.eu/consumers/odr</a> — JetUP does not participate in consumer arbitration.</p>
        </>}
        <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>Last Updated: April 17, 2026</p>
      </div>
    );
  }

  if (type === 'terms') {
    if (lang === 'de') return (
      <div>
        <p style={{ marginBottom: 16, color: '#aaa' }}><strong>Datum des Inkrafttretens:</strong> 17. April 2026</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>1. Was ist JetUP?</h3>
        <p style={{ marginBottom: 12 }}>JetUP ist ein informations- und bildungsorientierter digitaler Hub, der Folgendes bereitstellt: Lernmaterialien zu Trading und Strategien, Zugang zur Partner-Community, Webinare, Videoinhalte, Präsentationen sowie Informationen zur Partnerstruktur.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>2. Wichtiger Haftungsausschluss</h3>
        <p style={{ marginBottom: 8 }}><strong>JetUP ist kein Broker, keine Bank und kein Finanzberater.</strong></p>
        <p style={{ marginBottom: 8 }}>JetUP bietet keine Handelskonten an, verwaltet keine Kundengelder und gibt keine Anlageberatung. Alle Handelsaktivitäten, Kontoeröffnungen und Finanztransaktionen werden ausschließlich über den unabhängigen, regulierten Broker <strong>TagMarkets</strong> abgewickelt. Die Teilnahme am Partnerprogramm von TagMarkets erfolgt auf eigenes Risiko. Provisionen werden direkt von TagMarkets gezahlt, nicht von JetUP.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>3. Partnerprogramm</h3>
        <p style={{ marginBottom: 8 }}>JetUP LLC ist Partner von TagMarkets und erhält eine Provision von TagMarkets für vermittelte Kunden. Das Partnereinkommen besteht aus Empfehlungsprovisionen, die direkt von TagMarkets gezahlt werden. <strong>Es wird kein garantiertes Einkommen versprochen.</strong></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>4. Dennis Fast Start Promo</h3>
        <p style={{ marginBottom: 8 }}>Die „Dennis Fast Start Promo" ist ein <strong>Angebot von TagMarkets</strong>, nicht von JetUP. JetUP haftet nicht für Nichterfüllung durch TagMarkets.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>5. Risikohinweis</h3>
        <p style={{ marginBottom: 8 }}>Der Handel mit CFDs, Forex und anderen Derivaten ist mit erheblichen Risiken verbunden und kann zum Verlust des eingesetzten Kapitals führen. Vergangene Ergebnisse sind kein Indikator für zukünftige Ergebnisse. Handeln Sie nur mit Geld, das Sie sich leisten können zu verlieren.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>6. Geistiges Eigentum</h3>
        <p style={{ marginBottom: 8 }}>Alle Inhalte auf jet-up.ai sind Eigentum von JetUP LLC oder seinen Lizenzgebern und dürfen ohne ausdrückliche Genehmigung nicht reproduziert oder verbreitet werden.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>7. Änderungen</h3>
        <p style={{ marginBottom: 8 }}>JetUP behält sich das Recht vor, diese AGB jederzeit zu ändern. Änderungen werden auf der Website veröffentlicht.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>8. Anwendbares Recht</h3>
        <p style={{ marginBottom: 8 }}>Diese AGB unterliegen dem Recht Georgiens. Zuständig sind die Gerichte in Tiflis, Georgien.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>9. Kontakt</h3>
        <p style={{ marginBottom: 8 }}>Bei Fragen: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <p style={{ marginBottom: 4 }}>JetUP LLC · Registry No: 402155813 · Georgia, Tbilisi, Didube district, Uznadze street, N111, flat N11, Building N2</p>
      </div>
    );
    if (lang === 'ru') return (
      <div>
        <p style={{ marginBottom: 16, color: '#aaa' }}><strong>Дата вступления в силу:</strong> 17 апреля 2026 г.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>1. Что такое JetUP?</h3>
        <p style={{ marginBottom: 12 }}>JetUP — информационный и образовательный цифровой хаб, предоставляющий: учебные материалы по трейдингу и стратегиям, доступ к партнёрскому сообществу, вебинары, видеоконтент, презентации и информацию о структуре партнёрской программы.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>2. Важный отказ от ответственности</h3>
        <p style={{ marginBottom: 8 }}><strong>JetUP не является брокером, банком или финансовым консультантом.</strong></p>
        <p style={{ marginBottom: 8 }}>JetUP не открывает торговые счета, не управляет средствами клиентов и не предоставляет инвестиционных консультаций. Все торговые операции, открытие счетов и финансовые транзакции осуществляются исключительно через независимого регулируемого брокера <strong>TagMarkets</strong>. Участие в партнёрской программе TagMarkets осуществляется на ваш риск. Комиссионные выплачиваются напрямую TagMarkets, а не JetUP.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>3. Партнёрская программа</h3>
        <p style={{ marginBottom: 8 }}>JetUP LLC является партнёром TagMarkets и получает комиссию от TagMarkets за привлечённых клиентов. <strong>Гарантированный доход не обещается.</strong> Результаты зависят от индивидуальных факторов.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>4. Акция Dennis Fast Start</h3>
        <p style={{ marginBottom: 8 }}>«Dennis Fast Start Promo» — это <strong>предложение TagMarkets</strong>, а не JetUP. JetUP не несёт ответственности за неисполнение обязательств со стороны TagMarkets.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>5. Предупреждение о рисках</h3>
        <p style={{ marginBottom: 8 }}>Торговля CFD, Forex и другими производными инструментами сопряжена со значительными рисками и может привести к потере вложенного капитала. Прошлые результаты не являются показателем будущих. Торгуйте только теми деньгами, потерю которых вы можете себе позволить.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>6. Интеллектуальная собственность</h3>
        <p style={{ marginBottom: 8 }}>Весь контент на jet-up.ai является собственностью JetUP LLC или её лицензиаров и не может воспроизводиться или распространяться без явного разрешения.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>7. Изменения</h3>
        <p style={{ marginBottom: 8 }}>JetUP оставляет за собой право изменять настоящие Условия использования в любое время. Изменения публикуются на сайте.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>8. Применимое право</h3>
        <p style={{ marginBottom: 8 }}>Настоящие Условия регулируются законодательством Грузии. Споры рассматриваются судами Тбилиси, Грузия.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>9. Контакты</h3>
        <p style={{ marginBottom: 8 }}>По вопросам: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <p style={{ marginBottom: 4 }}>JetUP LLC · Registry No: 402155813 · Грузия, Тбилиси, район Дидубе, улица Узнадзе, N111, квартира N11, Здание N2</p>
      </div>
    );
    return (
      <div>
        <p style={{ marginBottom: 16, color: '#aaa' }}><strong>Effective Date:</strong> April 17, 2026</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>1. What JetUP Is</h3>
        <p style={{ marginBottom: 12 }}>JetUP is an information and education-oriented digital hub providing: learning materials on trading and strategies, access to a partner community, connections to webinars, video content, and presentations, and information about partner program structure.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>2. Important Disclaimer</h3>
        <p style={{ marginBottom: 8 }}><strong>JetUP is not a broker, a bank, or a financial advisor.</strong></p>
        <p style={{ marginBottom: 8 }}>JetUP does not offer trading accounts, does not manage client funds, and does not provide investment advice. All trading activities, account openings, and financial transactions are conducted exclusively through the independent, regulated broker <strong>TagMarkets</strong>. Participation in TagMarkets' partner program is at your own risk. Commissions are paid directly by TagMarkets, not by JetUP.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>3. Partner Program</h3>
        <p style={{ marginBottom: 8 }}>JetUP LLC is a partner of TagMarkets and receives a commission from TagMarkets for referred clients. A partner's income stream is derived from referral commissions paid directly by TagMarkets. <strong>No guaranteed income is promised.</strong> Results depend on individual factors.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>4. Dennis Fast Start Promo</h3>
        <p style={{ marginBottom: 8 }}>The "Dennis Fast Start Promo" is an <strong>offer from TagMarkets</strong>, not from JetUP. JetUP is not liable for non-performance by TagMarkets. Please review the Terms & Conditions of TagMarkets.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>5. Risk Warning</h3>
        <p style={{ marginBottom: 8 }}>Trading CFDs, Forex, and other derivative instruments involves significant risk and may result in the loss of your invested capital. This website does not provide investment advice. Past performance is not an indicator of future results. Trade only with money you can afford to lose.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>6. Intellectual Property</h3>
        <p style={{ marginBottom: 8 }}>All content on jet-up.ai (texts, videos, presentations, learning materials) is the property of JetUP LLC or its licensors and may not be reproduced or distributed without explicit permission.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>7. Changes to These Terms</h3>
        <p style={{ marginBottom: 8 }}>JetUP reserves the right to amend these Terms of Service at any time. Changes will be published on the website.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>8. Governing Law</h3>
        <p style={{ marginBottom: 8 }}>These Terms shall be governed by the laws of Georgia. The courts of Tbilisi, Georgia shall have jurisdiction, where permitted by applicable law.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>9. Contact</h3>
        <p style={{ marginBottom: 8 }}>For any questions: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <p style={{ marginBottom: 4 }}>JetUP LLC · Registry No: 402155813 · Georgia, Tbilisi, Didube district, Uznadze street, N111, flat N11, Building N2</p>
      </div>
    );
  }

  if (type === 'privacy') {
    if (lang === 'de') return (
      <div>
        <p style={{ marginBottom: 16 }}><strong>JetUP LLC</strong> („wir", „uns", „unser") ist der Betreiber von jet-up.ai.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>1. Verantwortliche Stelle</h3>
        <p style={{ marginBottom: 4 }}>JetUP LLC · Registry No: 402155813</p>
        <p style={{ marginBottom: 4 }}>Georgien, Tiflis, Didube-Bezirk, Uznadze-Straße, N111, Wohnung N11, Gebäude N2</p>
        <p style={{ marginBottom: 12 }}>E-Mail: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>2. Erhobene Daten</h3>
        <p style={{ marginBottom: 8 }}>Über Kontaktformulare auf jet-up.ai erheben wir: Vor- und Nachname, Kontaktinformationen (Telegram, WhatsApp, E-Mail) sowie den ausgewählten Interessenbereich (Trading, Partnerschaft usw.).</p>
        <p style={{ marginBottom: 8 }}>Wir speichern keine Zahlungsdaten, Zugangsdaten oder Passwörter. Alle Finanztransaktionen werden ausschließlich über den unabhängigen Broker TagMarkets abgewickelt.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>3. Zweck der Verarbeitung</h3>
        <p style={{ marginBottom: 8 }}>Wir verarbeiten Ihre Daten ausschließlich, um: Ihre Anfrage innerhalb von 24 Stunden zu beantworten, Sie über Lernmaterialien, Webinare und Updates zu informieren sowie Support durch unser Team bereitzustellen.</p>
        <p style={{ marginBottom: 8 }}><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>4. Weitergabe an Dritte</h3>
        <p style={{ marginBottom: 8 }}>Ihre Daten werden nicht verkauft oder vermietet. Daten können mit folgenden Dienstleistern geteilt werden: Telegram, Instagram, YouTube — als Kommunikationsplattformen, wenn Sie uns über diese Kanäle kontaktieren.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>5. Speicherdauer</h3>
        <p style={{ marginBottom: 8 }}>Wir speichern Ihre personenbezogenen Daten für maximal <strong>24 Monate</strong> ab dem letzten Kontakt oder bis Sie die Löschung beantragen.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>6. Ihre Rechte</h3>
        <p style={{ marginBottom: 8 }}>Sie haben das Recht auf: Auskunft, Berichtigung, Löschung (Recht auf Vergessenwerden), Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>7. Datenschutzanfragen</h3>
        <p style={{ marginBottom: 8 }}>Für alle datenschutzbezogenen Anfragen: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>8. Cookies und Analyse</h3>
        <p style={{ marginBottom: 8 }}>JetUP verwendet minimale Cookies ausschließlich für technische Zwecke (Sessions, Sprachauswahl). Es werden keine Drittanbieter-Tracking- oder Analysetools verwendet, sofern Sie nicht ausdrücklich zugestimmt haben.</p>
        <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>Zuletzt aktualisiert: 17. April 2026</p>
      </div>
    );
    if (lang === 'ru') return (
      <div>
        <p style={{ marginBottom: 16 }}><strong>JetUP LLC</strong> («мы», «нас», «наш») является оператором jet-up.ai.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>1. Контролёр данных</h3>
        <p style={{ marginBottom: 4 }}>JetUP LLC · Registry No: 402155813</p>
        <p style={{ marginBottom: 4 }}>Грузия, Тбилиси, район Дидубе, улица Узнадзе, N111, квартира N11, Здание N2</p>
        <p style={{ marginBottom: 12 }}>Email: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>2. Собираемые данные</h3>
        <p style={{ marginBottom: 8 }}>Через контактные формы на jet-up.ai мы собираем: имя и фамилию, контактные данные (Telegram, WhatsApp, Email) и выбранную область интереса (трейдинг, партнёрство и т. д.).</p>
        <p style={{ marginBottom: 8 }}>Мы не храним платёжные данные, учётные данные или пароли. Все финансовые операции осуществляются исключительно через независимого брокера TagMarkets.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>3. Цель обработки</h3>
        <p style={{ marginBottom: 8 }}>Мы обрабатываем ваши данные исключительно для: ответа на ваш запрос в течение 24 часов, информирования об учебных материалах, вебинарах и обновлениях, предоставления поддержки нашей командой.</p>
        <p style={{ marginBottom: 8 }}><strong>Правовое основание:</strong> ст. 6(1)(b) GDPR (договорная необходимость) и ст. 6(1)(f) GDPR (законный интерес).</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>4. Передача третьим лицам</h3>
        <p style={{ marginBottom: 8 }}>Ваши данные не продаются и не сдаются в аренду. Данные могут быть переданы следующим поставщикам услуг: Telegram, Instagram, YouTube — как коммуникационным платформам, если вы связываетесь с нами через эти каналы.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>5. Хранение данных</h3>
        <p style={{ marginBottom: 8 }}>Мы храним ваши персональные данные максимум <strong>24 месяца</strong> с момента последнего контакта или до получения запроса на удаление.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>6. Ваши права</h3>
        <p style={{ marginBottom: 8 }}>Вы имеете право на: доступ к данным, исправление, удаление (право на забвение), ограничение обработки, переносимость данных и возражение против обработки.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>7. Запросы по конфиденциальности</h3>
        <p style={{ marginBottom: 8 }}>По всем вопросам конфиденциальности: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>8. Файлы cookie и аналитика</h3>
        <p style={{ marginBottom: 8 }}>JetUP использует минимальное количество файлов cookie исключительно в технических целях (сессии, выбор языка). Сторонние инструменты отслеживания или аналитики не используются без вашего явного согласия.</p>
        <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>Последнее обновление: 17 апреля 2026 г.</p>
      </div>
    );
    return (
      <div>
        <p style={{ marginBottom: 16 }}><strong>JetUP LLC</strong> ("we", "us", "our") is the operator of jet-up.ai.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>1. Data Controller</h3>
        <p style={{ marginBottom: 4 }}>JetUP LLC · Registry No: 402155813</p>
        <p style={{ marginBottom: 4 }}>Georgia, Tbilisi, Didube district, Uznadze street, N111, flat N11, Building N2</p>
        <p style={{ marginBottom: 12 }}>Email: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>2. What Data We Collect</h3>
        <p style={{ marginBottom: 8 }}>Through contact forms on jet-up.ai, we collect: first and last name, contact information (Telegram, WhatsApp, Email), and selected area of interest (Trading, Partnership, etc.).</p>
        <p style={{ marginBottom: 8 }}>We do not store payment data, account credentials, or passwords. All financial transactions are conducted exclusively through the independent broker TagMarkets.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>3. Purpose of Processing</h3>
        <p style={{ marginBottom: 8 }}>We process your data solely to: respond to your inquiry within 24 hours, inform you about learning materials, webinars, and updates, and provide support through our team.</p>
        <p style={{ marginBottom: 8 }}><strong>Legal Basis:</strong> Art. 6(1)(b) GDPR (contractual necessity) and Art. 6(1)(f) GDPR (legitimate interest).</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>4. Data Sharing with Third Parties</h3>
        <p style={{ marginBottom: 8 }}>Your data is not sold or rented to third parties. Data may be shared with: Telegram, Instagram, YouTube — as communication platforms, if you contact us through these channels.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>5. Data Retention</h3>
        <p style={{ marginBottom: 8 }}>We retain your personal data for a maximum of <strong>24 months</strong> from the last contact or until you request deletion.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>6. Your Rights</h3>
        <p style={{ marginBottom: 8 }}>You have the right to: access your stored personal data, rectify inaccurate data, delete your data (Right to Erasure), restrict processing, data portability, and object to processing.</p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>7. Contact for Privacy Requests</h3>
        <p style={{ marginBottom: 8 }}>For all privacy-related requests: <a href="mailto:info@jet-up.ai" style={{ color: ACCENT_LIGHT }}>info@jet-up.ai</a></p>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, marginTop: 20 }}>8. Cookies and Analytics</h3>
        <p style={{ marginBottom: 8 }}>JetUP uses minimal cookies solely for technical purposes (sessions, language selection). No third-party tracking or analytics tools are used unless you have explicitly consented.</p>
        <p style={{ marginTop: 16, color: '#888', fontSize: 12 }}>Last Updated: April 17, 2026</p>
      </div>
    );
  }

  return null;
}

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

function LegalModal({ type, onClose }: LegalModalProps) {
  const { t, language } = useLanguage();
  const { C } = useTheme();

  const titleKey = `explore.legal.${type}.title`;
  const title = t(titleKey);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div
      data-testid={`legal-modal-backdrop-${type}`}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        data-testid={`legal-modal-${type}`}
        style={{
          background: C.SURFACE,
          border: `1px solid ${C.BORDER}`,
          borderRadius: 16,
          width: '100%', maxWidth: 680,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${C.BORDER}`, flexShrink: 0,
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.TEXT, margin: 0, letterSpacing: '0.02em' }}>
            {title}
          </h2>
          <button
            data-testid={`btn-close-legal-modal-${type}`}
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'transparent', border: `1px solid ${C.BORDER}`,
              color: C.TEXT_MUTED, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.SURFACE_ALT; e.currentTarget.style.color = C.TEXT; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.TEXT_MUTED; }}
            aria-label={t('explore.legal.close')}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{
          overflowY: 'auto', padding: '24px',
          fontSize: 14, lineHeight: 1.7, color: C.TEXT_SEC,
        }}>
          {getLegalContent(type, language)}
        </div>
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${C.BORDER}`, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            data-testid={`btn-close-legal-modal-bottom-${type}`}
            onClick={onClose}
            style={{
              padding: '10px 24px', borderRadius: 8,
              background: ACCENT, color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {t('explore.legal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { t } = useLanguage();
  const mob = useIsMobile();
  const { C } = useTheme();
  const [openModal, setOpenModal] = useState<LegalModalType | null>(null);
  return (
    <footer style={{ borderTop: `1px solid ${C.BORDER}` }} data-testid="explore-footer">
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: mob ? "32px 20px 48px" : "36px 56px 52px",
        display: "flex", flexDirection: mob ? "column" : "row",
        justifyContent: "space-between", alignItems: mob ? "flex-start" : "center",
        gap: mob ? 28 : 0,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.TEXT, letterSpacing: "0.05em", marginBottom: 6 }}>JETUP</div>
          <div style={{ fontSize: 12, color: C.TEXT_MUTED, fontWeight: 300 }}>{t('explore.footer.tagline')}</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              style={{
                width: 40, height: 40, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: C.TEXT_MUTED,
                border: `1px solid ${C.BORDER}`,
                background: "transparent",
                textDecoration: "none",
                transition: "color 0.2s ease, border-color 0.2s ease, background 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = ACCENT;
                e.currentTarget.style.borderColor = ACCENT + "60";
                e.currentTarget.style.background = ACCENT + "10";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = C.TEXT_MUTED;
                e.currentTarget.style.borderColor = C.BORDER;
                e.currentTarget.style.background = "transparent";
              }}
              data-testid={`footer-link-${label.toLowerCase()}`}
            >
              <Icon />
            </a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 24, fontSize: 12, color: C.TEXT_MUTED, alignItems: "center" }}>
          <span
            data-testid="footer-link-terms"
            style={{ cursor: "pointer", transition: "color 0.2s ease" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = C.TEXT_MUTED)}
            onClick={() => setOpenModal('terms')}
          >{t('explore.footer.terms')}</span>
          <span
            data-testid="footer-link-privacy"
            style={{ cursor: "pointer", transition: "color 0.2s ease" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = C.TEXT_MUTED)}
            onClick={() => setOpenModal('privacy')}
          >{t('explore.footer.privacy')}</span>
          <span
            data-testid="footer-link-impressum"
            style={{ cursor: "pointer", transition: "color 0.2s ease" }}
            onMouseEnter={e => (e.currentTarget.style.color = C.TEXT)}
            onMouseLeave={e => (e.currentTarget.style.color = C.TEXT_MUTED)}
            onClick={() => setOpenModal('impressum')}
          >{t('explore.legal.impressum.title')}</span>
        </div>
      </div>
      {openModal && <LegalModal type={openModal} onClose={() => setOpenModal(null)} />}
    </footer>
  );
}

export default function ExplorePage() {
  const { language: pageLang } = useLanguage();
  return (
    <SofiaVoiceProvider lang={pageLang}>
      <ExplorePageInner />
    </SofiaVoiceProvider>
  );
}

/**
 * Mounts the FAB orb XOR the persistent live-voice bottom bar based on
 * the panel-open state and the current voice mode.
 */
function SofiaFloatingChromeMounter({
  isPanelOpen,
  onTogglePanel,
  onOpenPanel,
  lang,
}: {
  isPanelOpen: boolean;
  onTogglePanel: () => void;
  onOpenPanel: () => void;
  lang: string;
}) {
  const voice = useSofiaVoice();
  const mob = useIsMobile();

  // Panel open — neither chrome element should mount.
  if (isPanelOpen) return null;

  // Panel closed + live voice on — render the persistent bar (it
  // owns its own stop button and an open-panel tap area).
  if (voice.voiceMode === "live") {
    return <SofiaVoiceBottomBar lang={lang} mob={mob} onOpen={onOpenPanel} />;
  }

  // Panel closed + voice off — default FAB orb.
  return <FloatingMariaButton onClick={onTogglePanel} isOpen={false} lang={lang} />;
}

function ExplorePageInner() {
  const [theme, setTheme] = useState<ExploreTheme>("dark");
  const [showPresentation, setShowPresentation] = useState(() =>
    new URLSearchParams(window.location.search).get("presentation") === "open"
  );
  const [showVideoPresentation, setShowVideoPresentation] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("presentation");
    return p === "interactive" || p === "test";
  });
  const [showMariaPanel, setShowMariaPanel] = useState(false);
  const [messages, setMessages] = useState<SharedMessage[]>([
    { id: 1, text: "Hi! I'm Sofia, your AI assistant. How can I help you today?", sender: "ai" },
  ]);
  const msgIdRef = useRef(2);
  const { language } = useLanguage();
  const sofia = useSofia();

  const C = theme === "dark" ? DARK : LIGHT;
  const toggle = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  const addMessage = useCallback((msg: Omit<SharedMessage, "id">) => {
    const id = msgIdRef.current++;
    setMessages((prev) => [...prev, { ...msg, id }]);
    return id;
  }, []);

  const updateMessage = useCallback((id: number, text: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text } : m))
    );
  }, []);

  useEffect(() => {
    if (showPresentation || showVideoPresentation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showPresentation, showVideoPresentation]);

  const handleOpenPresentation = useCallback(() => setShowPresentation(true), []);
  const handleClosePresentation = useCallback(() => {
    setShowPresentation(false);
  }, []);
  const handleOpenVideoPresentation = useCallback(() => setShowVideoPresentation(true), []);
  const handleCloseVideoPresentation = useCallback(() => {
    setShowVideoPresentation(false);
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("presentation")) {
        url.searchParams.delete("presentation");
        window.history.replaceState({}, "", url.pathname + (url.search ? url.search : "") + url.hash);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sofia control channel: open/close presentation via window events.
  useEffect(() => {
    const onOpen = () => {
      console.log("[sofia] open-presentation event received");
      setShowPresentation(true);
    };
    const onClose = () => {
      console.log("[sofia] close-presentation event received");
      setShowPresentation(false);
    };
    window.addEventListener("sofia:open-presentation", onOpen);
    window.addEventListener("sofia:close-presentation", onClose);
    return () => {
      window.removeEventListener("sofia:open-presentation", onOpen);
      window.removeEventListener("sofia:close-presentation", onClose);
    };
  }, []);

  // Sofia chat open channel: opens the floating Sofia panel directly in chat
  // mode. Optional `seedUserMessage` is auto-sent after the panel mounts.
  useEffect(() => {
    const onOpenChat = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      try { localStorage.setItem("sofia-panel-mode", "chat"); } catch {}
      setShowMariaPanel(true);
      const seed: string | undefined = detail.seedUserMessage;
      if (seed && typeof seed === "string" && seed.trim()) {
        // Wait for the panel + RecruitingChat to mount before injecting.
        window.setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("sofia:inject-user-message", { detail: { text: seed } }),
          );
        }, 300);
      }
    };
    window.addEventListener("sofia:open-chat", onOpenChat);
    return () => window.removeEventListener("sofia:open-chat", onOpenChat);
  }, []);

  // Sofia voice transcript channel: ElevenLabs voice mode dispatches
  // `sofia:voice-transcript` events with finalized user/agent utterances.
  // Append them to the shared message log so the chat surface stays in
  // sync regardless of which mode the visitor is using.
  useEffect(() => {
    const onTranscript = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const text = typeof detail.message === "string" ? detail.message.trim() : "";
      if (!text) return;
      const sender = detail.source === "ai" ? "ai" : "user";
      addMessage({ text, sender });
    };
    window.addEventListener("sofia:voice-transcript", onTranscript);
    return () => window.removeEventListener("sofia:voice-transcript", onTranscript);
  }, [addMessage]);

  const handleOpenMariaPanel = useCallback(() => setShowMariaPanel(true), []);
  const handleCloseMariaPanel = useCallback(() => setShowMariaPanel(false), []);
  const handleToggleMariaPanel = useCallback(() => setShowMariaPanel(v => !v), []);
  const mob = useIsMobile();

  return (
    <ThemeCtx.Provider value={{ theme, C, toggle }}>
      <div className="explore-scroll" style={{
        background: C.BG, color: C.TEXT,
        fontFamily: "'Montserrat', sans-serif",
        minHeight: "100vh", overflowX: "hidden",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        transition: "background 0.4s ease, color 0.4s ease",
      }}>
        <ExploreHeader />
        <HeroSection onOpenMaria={handleOpenMariaPanel} />
        <ContentSections />
        <PresentationSection />
        <VideoShowcaseSection />
        <DigitalHubSection />
        <ApplicationSection />
        <Footer />

        <FloatingMariaPanel isOpen={showMariaPanel} onClose={handleCloseMariaPanel} lang={language} onPresentationRedirect={handleOpenPresentation} />
        {/* FAB orb / live-voice bottom bar are mutually exclusive with
            each other AND with the open panel:
            - Panel open  → only the in-panel chrome is shown.
            - Panel closed + live voice off → render the orb FAB.
            - Panel closed + live voice on  → render the persistent bar
              (the bar's tap-area re-opens the panel without breaking
              the voice loop). */}
        <SofiaFloatingChromeMounter
          isPanelOpen={showMariaPanel}
          onTogglePanel={handleToggleMariaPanel}
          onOpenPanel={handleOpenMariaPanel}
          lang={language}
        />

        <AnimatePresence>
          {showPresentation && (language === "de" || language === "ru" || language === "en") && (
            <motion.div
              key="presentation-interactive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: "fixed", inset: 0, zIndex: 200 }}
              data-testid="overlay-presentation"
            >
              <InteractivePresentation onClose={handleClosePresentation} language={language as "de" | "ru" | "en"} />
            </motion.div>
          )}
          {showPresentation && language !== "de" && language !== "ru" && language !== "en" && (
            <motion.div
              key="presentation-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed", inset: 0, zIndex: 200,
                background: "rgba(0,0,0,0.85)",
              }}
              data-testid="overlay-presentation"
            >
              <PresentationOverlay
                onBackToChat={handleClosePresentation}
                onShowEcosystem={() => {}}
                messages={messages}
                addMessage={addMessage}
                updateMessage={updateMessage}
              />
              <button
                onClick={handleClosePresentation}
                style={{
                  position: "fixed", top: 20, right: 20, zIndex: 210,
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                data-testid="btn-close-presentation-overlay"
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
          {showVideoPresentation && (
            <motion.div
              key="presentation-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ position: "fixed", inset: 0, zIndex: 200 }}
              data-testid="overlay-presentation-video"
            >
              <VideoPresentationPlayer
                language={(language === "de" || language === "ru" || language === "en" ? language : "de") as "de" | "ru" | "en"}
                onClose={handleCloseVideoPresentation}
                onSofiaHandoff={() => {
                  handleCloseVideoPresentation();
                  window.setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("sofia:open-chat"));
                  }, 100);
                }}
                onContactInviter={() => {
                  handleCloseVideoPresentation();
                  window.setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("sofia:open-chat"));
                  }, 100);
                }}
                onOpenHub={() => {
                  handleCloseVideoPresentation();
                  window.location.href = "/partner";
                }}
                onChoosePath={(key) => {
                  const lang = language === "ru" || language === "en" ? language : "de";
                  const seeds: Record<string, Record<"investor" | "partner" | "both", string>> = {
                    de: {
                      investor: "Ich interessiere mich für den Investor-Weg. Erzähl mir mehr über die Denis Fast-Start Promo.",
                      partner: "Ich möchte als Partner starten — ohne Investment. Wie funktioniert das JetUP Partner-Programm?",
                      both: "Ich will beides: Investor und Partner. Wie kombiniere ich das?",
                    },
                    ru: {
                      investor: "Меня интересует путь инвестора. Расскажи подробнее про Denis Fast-Start Promo.",
                      partner: "Хочу стартовать как партнёр — без инвестиций. Как работает партнёрская программа JetUP?",
                      both: "Хочу и то, и другое: инвестор и партнёр. Как это совместить?",
                    },
                    en: {
                      investor: "I'm interested in the investor path. Tell me more about the Denis Fast-Start Promo.",
                      partner: "I want to start as a partner — without investment. How does the JetUP partner program work?",
                      both: "I want both: investor and partner. How do I combine them?",
                    },
                  };
                  const seedUserMessage = seeds[lang]?.[key] ?? seeds.de[key];
                  handleCloseVideoPresentation();
                  window.setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent("sofia:open-chat", { detail: { seedUserMessage } }),
                    );
                  }, 100);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ThemeCtx.Provider>
  );
}
