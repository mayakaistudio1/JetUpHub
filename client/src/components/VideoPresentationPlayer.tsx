import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  MessageSquare,
  ExternalLink,
  Check,
  ArrowLeft,
  ArrowRight,
  Youtube,
  Instagram,
  Send,
  TrendingUp,
  Users,
  Sparkles,
} from "lucide-react";
import {
  PRESENTATION_GRAPH,
  PRESENTATION_START_SCENE,
  type PresentationLang,
} from "@shared/presentationGraph";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#E879F9";

// Dark palette — matches /explore dark mode (player background is always black).
const C = {
  BG: "#0a0a12",
  SURFACE: "#12121c",
  SURFACE_ALT: "#16162a",
  TEXT: "#ffffff",
  TEXT_SEC: "rgba(255,255,255,0.5)",
  TEXT_MUTED: "rgba(255,255,255,0.25)",
  BORDER: "rgba(255,255,255,0.06)",
  BORDER_STRONG: "rgba(255,255,255,0.12)",
};

function videoUrl(sceneId: string, lang: PresentationLang) {
  return `/api/presentation/scene/${sceneId}/video?lang=${lang}`;
}

export type EndScreenPathKey = "investor" | "partner" | "both";

interface Props {
  language: PresentationLang;
  onClose: () => void;
  onSofiaHandoff?: (sceneId: string) => void;
  onContactInviter?: (sceneId: string) => void;
  onOpenHub?: (sceneId: string) => void;
  onChoosePath?: (key: EndScreenPathKey, sceneId: string) => void;
  embedded?: boolean;
  /** Force a specific scene from the parent (used by chapter chips). */
  sceneOverride?: string;
}

// Chapter index (0..9) → scene id, for the inline-player chapter strip.
// Scenes that have no dedicated video are left undefined so the chip stays
// visible but inert.
export const VIDEO_CHAPTER_TO_SCENE: (string | undefined)[] = [
  "intro",
  "investor",
  "partner",
  "both",
  undefined, undefined, undefined, undefined, undefined, undefined,
];

export default function VideoPresentationPlayer({
  language,
  onClose,
  onSofiaHandoff,
  onContactInviter,
  onOpenHub,
  onChoosePath,
  embedded = false,
  sceneOverride,
}: Props) {
  const [sceneId, setSceneId] = useState(sceneOverride ?? PRESENTATION_START_SCENE);
  const [showChoices, setShowChoices] = useState(false);
  const [showEndScreen, setShowEndScreen] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<number | null>(null);

  const scene = PRESENTATION_GRAPH[sceneId];

  // Reset overlay state and try to autoplay whenever scene changes
  // (but never auto-play while the intro card is still on screen).
  useEffect(() => {
    setShowChoices(false);
    setShowEndScreen(false);
    setProgress(0);
    setDuration(0);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      if (!showIntro) {
        v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [sceneId, showIntro]);

  const handleStartFromIntro = useCallback(() => {
    setShowIntro(false);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, []);

  // Parent-controlled scene override (from chapter chips).
  useEffect(() => {
    if (sceneOverride && sceneOverride !== sceneId && PRESENTATION_GRAPH[sceneOverride]) {
      setSceneId(sceneOverride);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneOverride]);

  // Preload sibling branches once intro is loaded.
  const preloadKeys = useMemo(() => {
    if (sceneId !== PRESENTATION_START_SCENE) return [];
    const choices = PRESENTATION_GRAPH[PRESENTATION_START_SCENE].choices || [];
    return choices.map((c) => c.next);
  }, [sceneId]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    if (scene.choices && scene.choices.length > 0) {
      setShowChoices(true);
    } else if (scene.next) {
      console.log("[presentation] auto_advance", { from: sceneId, to: scene.next, lang: language });
      setSceneId(scene.next);
    } else {
      setShowEndScreen(true);
    }
  }, [scene, sceneId, language]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = videoRef.current;
      if (!v || !duration) return;
      const pct = parseFloat(e.target.value);
      v.currentTime = (pct / 100) * duration;
      setProgress(pct);
    },
    [duration],
  );

  const handleChoice = useCallback(
    (nextId: string, choiceId: string) => {
      console.log("[presentation] branch_selected", { from: sceneId, to: nextId, choice: choiceId, lang: language });
      setSceneId(nextId);
    },
    [sceneId, language],
  );

  const handleReplay = useCallback(() => {
    console.log("[presentation] replay", { from: sceneId, lang: language });
    setSceneId(PRESENTATION_START_SCENE);
  }, [sceneId, language]);

  const handleSofia = useCallback(() => {
    console.log("[presentation] sofia_handoff", { from: sceneId, lang: language });
    if (onSofiaHandoff) onSofiaHandoff(sceneId);
  }, [sceneId, language, onSofiaHandoff]);

  const handleContactInviter = useCallback(() => {
    console.log("[presentation] contact_inviter", { from: sceneId, lang: language });
    if (onContactInviter) onContactInviter(sceneId);
  }, [sceneId, language, onContactInviter]);

  const handleOpenHub = useCallback(() => {
    console.log("[presentation] open_hub", { from: sceneId, lang: language });
    if (onOpenHub) onOpenHub(sceneId);
  }, [sceneId, language, onOpenHub]);

  // Auto-hide controls after 3s of inactivity.
  const showControlsBriefly = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    showControlsBriefly();
    return () => {
      if (controlsTimerRef.current) window.clearTimeout(controlsTimerRef.current);
    };
  }, [showControlsBriefly]);

  // ESC closes player.
  useEffect(() => {
    if (embedded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && !showEndScreen) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, togglePlay, showEndScreen, embedded]);

  const formatTime = (sec: number) => {
    if (!isFinite(sec) || sec < 0) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={showControlsBriefly}
      onTouchStart={showControlsBriefly}
      style={{
        position: embedded ? "absolute" : "fixed",
        inset: 0,
        background: "#000",
        zIndex: embedded ? 1 : 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
      data-testid="overlay-video-presentation"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700;800&display=swap');
      `}</style>

      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl(sceneId, language)}
        playsInline
        muted={isMuted}
        preload="auto"
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          const d = e.currentTarget.duration;
          setDuration(d || 0);
          setProgress(d ? (t / d) * 100 : 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onEnded={handleEnded}
        onClick={togglePlay}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          background: "#000",
          cursor: "pointer",
        }}
        data-testid="video-presentation-element"
      />

      {/* Hidden preloaders for branches (only on intro). */}
      <div aria-hidden style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", pointerEvents: "none" }}>
        {preloadKeys.map((k) => (
          <video key={k} src={videoUrl(k, language)} preload="auto" muted playsInline />
        ))}
      </div>

      {/* Top bar — close (hidden during end screen, end screen has its own close) */}
      <AnimatePresence>
        {(showControls || showChoices) && !showEndScreen && !embedded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "16px 20px",
              background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
              display: "flex",
              justifyContent: "flex-end",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <button
              onClick={onClose}
              style={{
                pointerEvents: "auto",
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              data-testid="btn-close-video-presentation"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <AnimatePresence>
        {showControls && !showEndScreen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "20px 24px 24px",
              background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              zIndex: 5,
            }}
            data-testid="controls-video-presentation"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#fff", fontSize: 12, minWidth: 42, fontVariantNumeric: "tabular-nums" }}>
                {formatTime((progress / 100) * duration)}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progress}
                onChange={handleSeek}
                style={{ flex: 1, accentColor: ACCENT_LIGHT, height: 4, cursor: "pointer" }}
                data-testid="input-video-scrubber"
                aria-label="Seek"
              />
              <span style={{ color: "#fff", fontSize: 12, minWidth: 42, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(duration)}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ControlBtn onClick={togglePlay} testId="btn-video-playpause" label={isPlaying ? "Pause" : "Play"}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </ControlBtn>
              <ControlBtn onClick={toggleMute} testId="btn-video-mute" label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </ControlBtn>
              <div style={{ flex: 1 }} />
              <ControlBtn onClick={toggleFullscreen} testId="btn-video-fullscreen" label="Fullscreen">
                <Maximize2 size={18} />
              </ControlBtn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Choice overlay (after intro ends) */}
      <AnimatePresence>
        {showChoices && scene.choices && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              gap: 16,
              zIndex: 6,
            }}
            data-testid="overlay-presentation-choices"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                color: "#fff",
                fontSize: 14,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {language === "ru" ? "Что вам ближе?" : language === "en" ? "What fits you?" : "Was passt zu dir?"}
            </motion.div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                justifyContent: "center",
                maxWidth: 720,
              }}
            >
              {scene.choices.map((c, idx) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${ACCENT}55` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleChoice(c.next, c.id)}
                  style={{
                    padding: "16px 32px",
                    minWidth: 180,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                    border: "none",
                    borderRadius: 100,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.02em",
                  }}
                  data-testid={`btn-choice-${c.id}`}
                >
                  {c.label[language] || c.label.de}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INTRO CARD — shown before the very first video plays. */}
      <AnimatePresence>
        {showIntro && (
          <IntroOverlay language={language} onStart={handleStartFromIntro} embedded={embedded} onClose={onClose} />
        )}
      </AnimatePresence>

      {/* RICH END SCREEN — universal post-video overlay (Dennis-Promo + inviter + Sofia + Hub + socials) */}
      <AnimatePresence>
        {showEndScreen && (
          <EndScreenOverlay
            language={language}
            onClose={onClose}
            onReplay={handleReplay}
            onSofia={handleSofia}
            onContactInviter={handleContactInviter}
            onOpenHub={handleOpenHub}
            onChoosePath={(key) => onChoosePath?.(key, sceneId)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------- Sub-components ----------------

function ControlBtn({
  onClick,
  children,
  testId,
  label,
}: {
  onClick: () => void;
  children: React.ReactNode;
  testId: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      data-testid={testId}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

// ---------------- End screen ----------------

const STRINGS = {
  de: {
    thanks: "Vielen Dank fürs Zuschauen",
    back: "Zurück",
    sofiaName: "Sofia",
    sofiaStatus: "online",
    sofiaMsg1: "Hey! Ich bin Sofia. Hast du Fragen zum Video?",
    sofiaMsg2: "Schreib mir direkt — ich helfe dir weiter.",
    eyebrow: "Dein nächster Schritt",
    headPart1: "Den Registrierungs-Link bekommst du",
    headPart2: "von der Person,",
    headHi: "die dich eingeladen hat",
    headEnd: ".",
    pathInvestorTag: "Investor",
    pathInvestorTitle: "Denis Fast-Start Promo",
    pathInvestorDesc: "100 + 100 USD",
    pathInvestorBadge: "4 800 USD Handelskapital*",
    pathPartnerTag: "Partner",
    pathPartnerTitle: "JetUP Partner-Programm",
    pathPartnerDesc: "Ohne Investment starten",
    pathPartnerBadge: "10× besser verkaufen",
    pathBothTag: "Beides",
    pathBothTitle: "Investor + Partner",
    pathBothDesc: "Kapital aufbauen & verdienen",
    pathBothBadge: "Sofort live starten",
    inviterHint: "Dein Inviter schaltet den passenden Weg für dich frei",
    disclaimer: "* Aktionsbedingungen über deinen Inviter. Vergangene Performance ist keine Garantie.",
    hubBtn: "Mehr erfahren — JetUP Digital Hub",
    socialsLabel: "Unser Netzwerk",
    close: "Schliessen",
    introEyebrow: "Interaktive Präsentation",
    introTitle: "Eine kurze Video-Serie über JetUP",
    introBody: "Gleich startet eine Reihe kurzer Videos, die dich Schritt für Schritt durch das JetUP-Ökosystem führt. Du kannst jederzeit pausieren oder am Ende mit Sofia weitersprechen.",
    introStart: "Jetzt starten",
  },
  ru: {
    thanks: "Спасибо за просмотр",
    back: "Назад",
    sofiaName: "София",
    sofiaStatus: "онлайн",
    sofiaMsg1: "Привет! Я София. Есть вопросы по видео?",
    sofiaMsg2: "Напишите мне — я помогу разобраться.",
    eyebrow: "Ваш следующий шаг",
    headPart1: "Ссылку на регистрацию вы получите",
    headPart2: "у того,",
    headHi: "кто вас пригласил",
    headEnd: ".",
    pathInvestorTag: "Инвестор",
    pathInvestorTitle: "Denis Fast-Start Promo",
    pathInvestorDesc: "100 + 100 USD",
    pathInvestorBadge: "4 800 USD торгового капитала*",
    pathPartnerTag: "Партнёр",
    pathPartnerTitle: "Партнёрская программа JetUP",
    pathPartnerDesc: "Старт без инвестиций",
    pathPartnerBadge: "Продавать в 10× лучше",
    pathBothTag: "И то, и то",
    pathBothTitle: "Инвестор + Партнёр",
    pathBothDesc: "Капитал и доход одновременно",
    pathBothBadge: "Сразу в эфир",
    inviterHint: "Пригласивший откроет нужный путь именно для вас",
    disclaimer: "* Условия акции уточняйте у пригласившего. Прошлые результаты не гарантируют будущих.",
    hubBtn: "Подробнее — JetUP Digital Hub",
    socialsLabel: "Наша сеть",
    close: "Закрыть",
    introEyebrow: "Интерактивная презентация",
    introTitle: "Короткая серия видео о JetUP",
    introBody: "Сейчас начнётся серия коротких видео, которые шаг за шагом проведут вас по экосистеме JetUP. Вы можете в любой момент поставить на паузу или в конце поговорить с Софией.",
    introStart: "Начать",
  },
  en: {
    thanks: "Thanks for watching",
    back: "Back",
    sofiaName: "Sofia",
    sofiaStatus: "online",
    sofiaMsg1: "Hey! I'm Sofia. Any questions about the video?",
    sofiaMsg2: "Message me directly — I'll help you out.",
    eyebrow: "Your next step",
    headPart1: "You'll get your registration link",
    headPart2: "from the person",
    headHi: "who invited you",
    headEnd: ".",
    pathInvestorTag: "Investor",
    pathInvestorTitle: "Denis Fast-Start Promo",
    pathInvestorDesc: "100 + 100 USD",
    pathInvestorBadge: "4,800 USD trading capital*",
    pathPartnerTag: "Partner",
    pathPartnerTitle: "JetUP Partner Program",
    pathPartnerDesc: "Start with zero investment",
    pathPartnerBadge: "Sell 10× better",
    pathBothTag: "Both",
    pathBothTitle: "Investor + Partner",
    pathBothDesc: "Build capital & earn",
    pathBothBadge: "Go live instantly",
    inviterHint: "Your inviter will unlock the right path for you",
    disclaimer: "* Promo terms via your inviter. Past performance is not a guarantee.",
    hubBtn: "Learn more — JetUP Digital Hub",
    socialsLabel: "Our network",
    close: "Close",
    introEyebrow: "Interactive presentation",
    introTitle: "A short video series about JetUP",
    introBody: "A short series of videos is about to start, walking you through the JetUP ecosystem step by step. You can pause anytime, or talk to Sofia at the end.",
    introStart: "Start now",
  },
} as const;

const SOCIALS = [
  { name: "YouTube", url: "https://www.youtube.com/@JetUP_official", Icon: Youtube },
  { name: "Instagram", url: "https://www.instagram.com/jetup.official?igsh=MjZwdXJpd2JsYmw1&utm_source=qr", Icon: Instagram },
  { name: "Telegram", url: "https://t.me/jet_up_official", Icon: Send },
] as const;

// ---------------- Intro overlay ----------------

interface IntroOverlayProps {
  language: PresentationLang;
  onStart: () => void;
  onClose: () => void;
  embedded: boolean;
}

function IntroOverlay({ language, onStart, onClose, embedded }: IntroOverlayProps) {
  const t = STRINGS[language] || STRINGS.de;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(8,8,18,0.96), rgba(20,12,40,0.96))",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 12,
      }}
      data-testid="overlay-presentation-intro"
    >
      {!embedded && (
        <button
          onClick={onClose}
          aria-label={t.close}
          data-testid="btn-close-intro"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>
      )}
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: ACCENT_LIGHT,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          {t.introEyebrow}
        </div>
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 30px)",
            fontWeight: 300,
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            margin: "0 0 14px",
          }}
        >
          {t.introTitle}
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.7)",
            margin: "0 0 26px",
            fontWeight: 300,
          }}
        >
          {t.introBody}
        </p>
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          data-testid="btn-intro-start"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 32px",
            borderRadius: 100,
            border: "none",
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.02em",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: `0 12px 32px ${ACCENT}55`,
          }}
        >
          <Play size={16} fill="currentColor" />
          {t.introStart}
        </motion.button>
      </div>
    </motion.div>
  );
}

interface EndScreenProps {
  language: PresentationLang;
  onClose: () => void;
  onReplay: () => void;
  onSofia: () => void;
  onContactInviter: () => void;
  onOpenHub: () => void;
  onChoosePath?: (key: EndScreenPathKey) => void;
}

function EndScreenOverlay({ language, onClose, onSofia, onOpenHub, onChoosePath }: EndScreenProps) {
  const t = STRINGS[language] || STRINGS.de;

  const paths: Array<{ Icon: typeof TrendingUp; tag: string; title: string; desc: string; badge: string; key: EndScreenPathKey }> = [
    { Icon: TrendingUp, tag: t.pathInvestorTag, title: t.pathInvestorTitle, desc: t.pathInvestorDesc, badge: t.pathInvestorBadge, key: "investor" },
    { Icon: Users, tag: t.pathPartnerTag, title: t.pathPartnerTitle, desc: t.pathPartnerDesc, badge: t.pathPartnerBadge, key: "partner" },
    { Icon: Sparkles, tag: t.pathBothTag, title: t.pathBothTitle, desc: t.pathBothDesc, badge: t.pathBothBadge, key: "both" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        position: "absolute",
        inset: 0,
        background: C.BG,
        zIndex: 10,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        display: "flex",
        flexDirection: "column",
      }}
      data-testid="overlay-presentation-end"
    >
      <style>{`
        @keyframes endScreenPulse { 0%,100% { opacity: 0.85; transform: scale(1);} 50% { opacity: 1; transform: scale(1.06);} }
        @keyframes endScreenTyping { 0%,60%,100% { opacity: 0.3;} 30% { opacity: 1;} }
      `}</style>

      {/* Atmospheric glow */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 700,
          background: `radial-gradient(circle, ${ACCENT}18 0%, transparent 65%)`,
          filter: "blur(70px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* TOP BAR */}
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
        <button
          onClick={onClose}
          data-testid="btn-end-back"
          aria-label={t.back}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.BORDER}`,
            borderRadius: 100,
            color: C.TEXT_SEC,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ArrowLeft size={13} />
          {t.back}
        </button>

        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {t.thanks}
        </div>

        <button
          onClick={onClose}
          data-testid="btn-end-close"
          aria-label={t.close}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.BORDER}`,
            color: C.TEXT_SEC,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </header>

      {/* SOFIA CHAT INVITE */}
      <section
        style={{
          padding: "12px 24px 0",
          position: "relative",
          zIndex: 2,
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <motion.button
          whileHover={{ borderColor: `${ACCENT}66`, background: "rgba(255,255,255,0.06)" }}
          whileTap={{ scale: 0.99 }}
          onClick={onSofia}
          data-testid="btn-end-sofia"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.BORDER}`,
            borderRadius: 20,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            textAlign: "left",
            color: "inherit",
            fontFamily: "inherit",
            cursor: "pointer",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Sofia photo */}
          <div style={{ position: "relative", flexShrink: 0, width: 56, height: 56 }}>
            <img
              src="/images/sofia-avatar.png"
              alt={t.sofiaName}
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${ACCENT}55`,
                display: "block",
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#22c55e",
                border: `2px solid ${C.BG}`,
                animation: "endScreenPulse 1.8s ease-in-out infinite",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.TEXT }}>{t.sofiaName}</div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#22c55e",
                }}
              >
                {t.sofiaStatus}
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 400, color: C.TEXT_SEC, lineHeight: 1.45 }}>
              {t.sofiaMsg1}
              <br />
              <span style={{ color: ACCENT_LIGHT, fontWeight: 500 }}>{t.sofiaMsg2}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
              {[0, 0.2, 0.4].map((d, i) => (
                <span
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.4)",
                    animation: `endScreenTyping 1.4s ease-in-out infinite`,
                    animationDelay: `${d}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <ArrowRight size={18} color={ACCENT_LIGHT} style={{ flexShrink: 0 }} />
        </motion.button>
      </section>

      {/* MAIN — instruction + 3 path cards */}
      <main
        style={{
          flex: 1,
          padding: "28px 24px 20px",
          position: "relative",
          zIndex: 1,
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: ACCENT_LIGHT,
              marginBottom: 12,
            }}
          >
            {t.eyebrow}
          </div>
          <div
            style={{
              fontSize: "clamp(20px, 2.6vw, 28px)",
              fontWeight: 300,
              lineHeight: 1.35,
              letterSpacing: "-0.01em",
              color: C.TEXT,
              maxWidth: 580,
              margin: "0 auto",
            }}
            data-testid="text-end-headline"
          >
            {t.headPart1}
            <br />
            {t.headPart2}{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${ACCENT_LIGHT}, ${ACCENT})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 500,
              }}
            >
              {t.headHi}
            </span>
            {t.headEnd}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            maxWidth: 580,
            width: "100%",
            margin: "0 auto",
          }}
        >
          {paths.map((p) => (
            <PathCard
              key={p.key}
              icon={<p.Icon size={18} />}
              tag={p.tag}
              title={p.title}
              desc={p.desc}
              badge={p.badge}
              testId={`card-path-${p.key}`}
              onClick={() => (onChoosePath ? onChoosePath(p.key) : onSofia())}
            />
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.04em",
          }}
        >
          {t.inviterHint}
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 6,
            fontSize: 10,
            fontWeight: 400,
            color: "rgba(255,255,255,0.28)",
            letterSpacing: "0.02em",
            maxWidth: 580,
            margin: "6px auto 0",
            lineHeight: 1.5,
          }}
          data-testid="text-end-screen-disclaimer"
        >
          {t.disclaimer}
        </div>
      </main>

      {/* FOOTER — Hub + socials */}
      <footer
        style={{
          padding: "16px 24px 22px",
          borderTop: `1px solid ${C.BORDER}`,
          background: "rgba(10,10,18,0.55)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <motion.button
          whileHover={{ background: "rgba(255,255,255,0.07)" }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenHub}
          data-testid="btn-end-hub"
          style={{
            width: "100%",
            maxWidth: 580,
            margin: "0 auto",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 20px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${C.BORDER}`,
            borderRadius: 100,
            color: C.TEXT,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          <ExternalLink size={14} color={ACCENT_LIGHT} />
          {t.hubBtn}
          <ArrowRight size={13} color="rgba(255,255,255,0.4)" />
        </motion.button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {t.socialsLabel}
          </span>
          <span style={{ width: 24, height: 1, background: C.BORDER }} />
          <div style={{ display: "flex", gap: 8 }}>
            {SOCIALS.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                title={s.name}
                data-testid={`link-social-${s.name.toLowerCase()}`}
                style={{
                  width: 38,
                  height: 38,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${C.BORDER}`,
                  borderRadius: "50%",
                  color: C.TEXT_SEC,
                  cursor: "pointer",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <s.Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

function PathCard({
  icon,
  tag,
  title,
  desc,
  badge,
  testId,
  onClick,
}: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  desc: string;
  badge: string;
  testId: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2, borderColor: `${ACCENT}55`, background: "rgba(255,255,255,0.07)" }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      data-testid={testId}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${C.BORDER}`,
        borderRadius: 14,
        backdropFilter: "blur(20px)",
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        fontFamily: "inherit",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${ACCENT}33, ${ACCENT_LIGHT}22)`,
          border: `1px solid ${ACCENT}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: ACCENT_LIGHT,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 2,
          }}
        >
          {tag}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: C.TEXT,
            lineHeight: 1.3,
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
          {desc}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          background: `${ACCENT}1f`,
          border: `1px solid ${ACCENT}44`,
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 600,
          color: ACCENT_LIGHT,
          flexShrink: 0,
          letterSpacing: "0.01em",
          whiteSpace: "nowrap",
        }}
      >
        <Check size={11} />
        {badge}
      </div>
    </motion.button>
  );
}
