import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Volume2, VolumeX, ChevronDown, RotateCcw, Square } from "lucide-react";
import {
  loadSharedChat,
  saveSharedChat,
  sofiaFetch,
  getVisitorId,
  type SharedChatMsg,
  type SofiaMode,
} from "@/lib/sofiaVisitor";
import { useToast } from "@/hooks/use-toast";
import { useSofiaVoice, type LiveVoiceState } from "./SofiaVoiceProvider";
import SofiaOrb from "./SofiaOrb";
import VoiceWave from "./VoiceWave";

const BRAND = {
  bg: "#0F172A",
  bgElevated: "#1E293B",
  primary: "#7C3AED",
  accent: "#A855F7",
  textPrimary: "#FFFFFF",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#334155",
  liveGreen: "#10B981",
  liveGreenSoft: "rgba(16,185,129,0.12)",
} as const;

interface SofiaPanelProps {
  lang: string;
  mob: boolean;
  /** Optional minimize handler — renders the chevron-down button when provided. */
  onClose?: () => void;
}

interface PanelTexts {
  placeholder: string;
  initialGreeting: string;
  title: string;
  voiceOn: string;
  voiceOff: string;
  voiceOnToast: string;
  voiceOffToast: string;
  onboard: string;
  minimize: string;
  resetTitle: string;
  resetConfirm: string;
  liveStart: string;
  liveStop: string;
  liveStopWide: string;
  liveListening: string;
  liveSpeak: string;
  liveTranscribing: string;
  liveThinking: string;
  liveSofia: string;
  micDeniedToast: string;
}

const TXT: Record<string, PanelTexts> = {
  de: {
    placeholder: "Schreib oder sprich …",
    initialGreeting:
      "Hallo! Ich bin Sofia, deine persönliche Beraterin bei JetUP. Was interessiert dich mehr — passives Einkommen aufbauen oder ein eigenes Team führen?",
    title: "Sprich mit Sofia",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    voiceOnToast: "Sofia spricht jetzt vor",
    voiceOffToast: "Sofia spricht nicht mehr vor",
    onboard: "Du kannst die Stimme jederzeit ausschalten",
    minimize: "Minimieren",
    resetTitle: "Neuer Chat",
    resetConfirm: "Diesen Chat löschen und neu starten?",
    liveStart: "Stimme an",
    liveStop: "Stimme aus",
    liveStopWide: "Sprache aus",
    liveListening: "Höre zu …",
    liveSpeak: "Sprich …",
    liveTranscribing: "Verarbeite …",
    liveThinking: "Sofia denkt …",
    liveSofia: "Sofia spricht",
    micDeniedToast: "Mikrofon-Zugriff verweigert",
  },
  en: {
    placeholder: "Type or speak …",
    initialGreeting:
      "Hi! I'm Sofia, your personal JetUP consultant. What interests you more — building passive income or leading your own team?",
    title: "Talk to Sofia",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    voiceOnToast: "Sofia now speaks aloud",
    voiceOffToast: "Sofia is silent",
    onboard: "You can turn voice off any time",
    minimize: "Minimize",
    resetTitle: "New chat",
    resetConfirm: "Delete this chat and start fresh?",
    liveStart: "Voice on",
    liveStop: "Voice off",
    liveStopWide: "Stop voice",
    liveListening: "Listening …",
    liveSpeak: "Speak …",
    liveTranscribing: "Transcribing …",
    liveThinking: "Sofia is thinking …",
    liveSofia: "Sofia is speaking",
    micDeniedToast: "Microphone permission denied",
  },
  ru: {
    placeholder: "Напиши или скажи…",
    initialGreeting:
      "Привет! Я София, твой личный консультант JetUP. Что тебе интереснее — пассивный доход или построение своей команды?",
    title: "Поговори с Софией",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    voiceOnToast: "София теперь говорит вслух",
    voiceOffToast: "София больше не говорит вслух",
    onboard: "Можешь выключить голос в любой момент",
    minimize: "Свернуть",
    resetTitle: "Новый чат",
    resetConfirm: "Удалить этот разговор и начать заново?",
    liveStart: "Включить голос",
    liveStop: "Выключить голос",
    liveStopWide: "Выключить голос",
    liveListening: "Слушаю …",
    liveSpeak: "Говори …",
    liveTranscribing: "Распознаю …",
    liveThinking: "София думает …",
    liveSofia: "София отвечает",
    micDeniedToast: "Доступ к микрофону запрещён",
  },
};

export function liveStateLabel(state: LiveVoiceState, tx: PanelTexts): string {
  switch (state) {
    case "listening":
      return tx.liveListening;
    case "user-speaking":
      return tx.liveSpeak;
    case "transcribing":
      return tx.liveTranscribing;
    case "thinking":
      return tx.liveThinking;
    case "speaking":
      return tx.liveSofia;
    case "starting":
      return tx.liveListening;
    default:
      return tx.liveListening;
  }
}

interface ChatMsg extends SharedChatMsg {}

function chatHistoryEqual(a: ChatMsg[], b: ChatMsg[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    if (x.role !== y.role) return false;
    if (x.content !== y.content) return false;
  }
  return true;
}

const ONBOARD_KEY = "sofia_onboarded";

/**
 * Sofia chat panel — visual/UX refactor (task #187).
 *
 * Layout (top → bottom):
 *  1. Slim header — pulsing dot + "SOFIA AI" + title, Voice toggle, close X.
 *  2. Message stream — user gradient bubble right, Sofia plain text left;
 *     orb hero on the empty state.
 *  3. Composer — single textarea + manual mic button + send button.
 *
 * Sharp corners everywhere except the orb. Voice toggle controls TTS only;
 * the mic button records one user utterance at a time and routes the
 * transcript through the same chat pipeline as a typed message.
 */
export default function SofiaPanel({ lang, mob, onClose }: SofiaPanelProps) {
  const tx = TXT[lang] || TXT.de;
  const voice = useSofiaVoice();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    const stored = loadSharedChat(lang) as ChatMsg[];
    if (stored.length) return stored;
    return [{ role: "assistant", content: tx.initialGreeting, mode: "chat" }];
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef(messages);
  const speakerOnRef = useRef(voice.speakerOn);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    speakerOnRef.current = voice.speakerOn;
  }, [voice.speakerOn]);

  // Persist chat history.
  useEffect(() => {
    saveSharedChat(lang, messages as SharedChatMsg[]);
  }, [messages, lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  // Cross-tab / cross-component shared chat updates.
  useEffect(() => {
    function onUpdated(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      if (detail.lang && detail.lang !== lang) return;
      const stored = loadSharedChat(lang) as ChatMsg[];
      if (!stored.length) return;
      if (chatHistoryEqual(stored, messagesRef.current)) return;
      setMessages(stored);
    }
    window.addEventListener("sofia:chat-updated", onUpdated);
    return () => window.removeEventListener("sofia:chat-updated", onUpdated);
  }, [lang]);

  // Reset event from the End-session menu item in FloatingMariaPanel.
  useEffect(() => {
    function onReset() {
      setMessages([{ role: "assistant", content: tx.initialGreeting, mode: "chat" }]);
      setStreaming("");
      setChatLoading(false);
      setInput("");
    }
    window.addEventListener("sofia:reset-chat", onReset);
    return () => window.removeEventListener("sofia:reset-chat", onReset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // External text injection — used by page CTAs and by the mic transcript.
  useEffect(() => {
    function onInject(e: Event) {
      const detail = (e as CustomEvent).detail || {};
      const text: string = String(detail.text || "").trim();
      if (!text || chatLoading) return;
      void sendChat(text);
    }
    window.addEventListener("sofia:inject-user-message", onInject);
    return () => window.removeEventListener("sofia:inject-user-message", onInject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLoading]);

  // Onboarding tooltip — show once, 1.5s after first mount.
  useEffect(() => {
    let onboarded = "1";
    try {
      onboarded = localStorage.getItem(ONBOARD_KEY) || "";
    } catch {
      /* ignore */
    }
    if (onboarded === "1") return;
    const showT = window.setTimeout(() => setShowOnboard(true), 1500);
    const hideT = window.setTimeout(() => {
      setShowOnboard(false);
      try {
        localStorage.setItem(ONBOARD_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 1500 + 5000);
    return () => {
      window.clearTimeout(showT);
      window.clearTimeout(hideT);
    };
  }, []);

  // Foreign type compatibility — sofiaVisitor's SofiaMode is currently
  // "chat" | "voice" | "avatar"; we emit "chat" everywhere from the new UI.
  const _modeChat: SofiaMode = "chat";

  async function sendChat(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: text, mode: _modeChat };
    const newHistory = [...messagesRef.current, userMsg];
    setMessages(newHistory);
    if (overrideText === undefined) setInput("");
    setChatLoading(true);
    setStreaming("");

    try {
      const resp = await sofiaFetch("/api/maria/recruiting/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          language: lang,
          visitorId: getVisitorId(),
          mode: "chat",
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
              if (d.content) {
                full += d.content;
                setStreaming(full);
              }
              if (d.done) {
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: full, mode: _modeChat },
                ]);
                setStreaming("");
                setChatLoading(false);
                // TTS the reply if the speaker toggle is currently ON
                // OR if the live voice mode is active (it forces speaker
                // on but we double-check here so the live loop never
                // hangs waiting for audio that never plays). Once TTS
                // resolves (or is skipped), signal the live loop that
                // it can resume listening.
                const shouldSpeak =
                  full.trim() &&
                  (speakerOnRef.current || voice.voiceMode === "live");
                if (shouldSpeak) {
                  void voice.speakReply(full).finally(() => {
                    try {
                      window.dispatchEvent(new CustomEvent("sofia:assistant-reply-done"));
                    } catch {
                      /* ignore */
                    }
                  });
                } else {
                  try {
                    window.dispatchEvent(new CustomEvent("sofia:assistant-reply-done"));
                  } catch {
                    /* ignore */
                  }
                }
              }
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch {
      setChatLoading(false);
    }
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function dismissOnboard() {
    if (!showOnboard) return;
    setShowOnboard(false);
    try {
      localStorage.setItem(ONBOARD_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function handleVoiceToggle() {
    dismissOnboard();
    const next = !voice.speakerOn;
    voice.setSpeakerOn(next);
    toast({
      description: next ? tx.voiceOnToast : tx.voiceOffToast,
      duration: 2000,
    });
  }

  async function handleLiveToggle() {
    dismissOnboard();
    if (voice.voiceMode === "live") {
      voice.stopLiveVoice();
      return;
    }
    await voice.startLiveVoice();
  }

  // Mic-permission denied — surface a localized toast and bail.
  useEffect(() => {
    function onDenied() {
      toast({
        description: tx.micDeniedToast,
        duration: 2400,
      });
    }
    window.addEventListener("sofia:voice-mic-denied", onDenied);
    return () => window.removeEventListener("sofia:voice-mic-denied", onDenied);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Auto-resize textarea up to 4 rows.
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const max = 24 * 4 + 16; // ~4 rows
    ta.style.height = `${Math.min(max, ta.scrollHeight)}px`;
  }, [input]);

  const showHero =
    !chatLoading && !streaming && messages.length === 1 && messages[0]?.role === "assistant";

  const sendDisabled =
    chatLoading || voice.recordingState === "transcribing" || !input.trim();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        background: BRAND.bg,
        overflow: "hidden",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
      data-testid="sofia-panel"
    >
      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: mob ? 8 : 12,
          padding: mob ? "12px 12px" : "14px 16px",
          background: BRAND.bg,
          borderBottom: `1px solid ${BRAND.border}`,
          flexShrink: 0,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: mob ? 8 : 10, minWidth: 0, flex: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: BRAND.accent,
              flexShrink: 0,
            }}
            data-testid="sofia-pulse-dot"
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
            <div
              style={{
                fontSize: mob ? 10 : 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: BRAND.accent,
              }}
            >
              SOFIA AI
            </div>
            <div
              style={{
                fontSize: mob ? 14 : 16,
                fontWeight: 400,
                color: BRAND.textPrimary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tx.title}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: mob ? 4 : 8,
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Voice toggle — icon-only on mobile, icon + label on desktop */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: mob ? 0 : 6,
              padding: mob ? 0 : "8px 12px",
              width: mob ? 36 : undefined,
              height: mob ? 36 : undefined,
              background: "transparent",
              border: `2px solid ${voice.speakerOn ? BRAND.accent : BRAND.border}`,
              boxShadow: voice.speakerOn ? `inset 0 -2px 0 0 ${BRAND.accent}` : "none",
              color: voice.speakerOn ? BRAND.accent : BRAND.textMuted,
              fontFamily: "inherit",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: 0,
              transition: "color 200ms ease, border-color 200ms ease",
            }}
            data-testid="sofia-voice-toggle"
            aria-pressed={voice.speakerOn}
            aria-label={voice.speakerOn ? tx.voiceOn : tx.voiceOff}
            title={voice.speakerOn ? tx.voiceOn : tx.voiceOff}
          >
            {voice.speakerOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {!mob && <span>{voice.speakerOn ? tx.voiceOn : tx.voiceOff}</span>}
          </button>

          {/* Onboarding tooltip — anchored above the voice toggle. */}
          <AnimatePresence>
            {showOnboard && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 12px)",
                  right: onClose ? 44 : 0,
                  background: BRAND.bgElevated,
                  borderBottom: `2px solid ${BRAND.accent}`,
                  padding: "10px 14px",
                  color: BRAND.textPrimary,
                  fontSize: 13,
                  fontWeight: 400,
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                  borderRadius: 0,
                  zIndex: 30,
                  pointerEvents: "none",
                }}
                data-testid="sofia-onboard-tip"
              >
                {tx.onboard}
                <div
                  style={{
                    position: "absolute",
                    bottom: -6,
                    right: 28,
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: `6px solid ${BRAND.bgElevated}`,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* "New chat" reset — appears only after the user has actually
              sent a message, so the empty greeting state stays minimal.
              Confirms before wiping history, then dispatches the same
              reset event that End-session used to use. */}
          {messages.some((m) => m.role === "user") && (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined" && !window.confirm(tx.resetConfirm)) return;
                try {
                  saveSharedChat(lang, []);
                } catch { /* ignore */ }
                window.dispatchEvent(new CustomEvent("sofia:reset-chat"));
                window.dispatchEvent(new CustomEvent("sofia:chat-updated"));
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 10,
                background: "transparent",
                border: "none",
                color: BRAND.textMuted,
                cursor: "pointer",
                borderRadius: 0,
              }}
              data-testid="sofia-reset-chat"
              aria-label={tx.resetTitle}
              title={tx.resetTitle}
              onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.textPrimary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.textMuted)}
            >
              <RotateCcw size={18} />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 10,
                background: "transparent",
                border: "none",
                color: BRAND.textMuted,
                cursor: "pointer",
                borderRadius: 0,
              }}
              data-testid="sofia-minimize"
              aria-label={tx.minimize}
              title={tx.minimize}
              onMouseEnter={(e) => (e.currentTarget.style.color = BRAND.textPrimary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = BRAND.textMuted)}
            >
              <ChevronDown size={20} />
            </button>
          )}
        </div>
      </div>

      {/* ─── BODY ───────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          padding: "12px 16px 0",
        }}
      >
        {showHero ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              padding: "12px",
              textAlign: "center",
            }}
            data-testid="sofia-hero"
          >
            <SofiaOrb
              size={mob ? 96 : 120}
              color={BRAND.primary}
              colorAlt={BRAND.accent}
              speaking={voice.isSofiaSpeaking}
            />
            <div
              style={{
                fontSize: mob ? 14 : 15,
                color: BRAND.textPrimary,
                lineHeight: 1.5,
                maxWidth: 320,
                fontFamily: "inherit",
                fontWeight: 400,
              }}
            >
              {messages[0]?.content}
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              padding: "8px 0 12px",
            }}
            data-testid="sofia-message-list"
          >
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              if (isUser) {
                return (
                  <div
                    key={i}
                    style={{ display: "flex", justifyContent: "flex-end" }}
                  >
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "10px 16px",
                        background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`,
                        color: "#fff",
                        fontSize: 15,
                        lineHeight: 1.5,
                        fontWeight: 400,
                        fontFamily: "inherit",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        borderRadius: 0,
                      }}
                      data-testid={`sofia-msg-${i}`}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={i}
                  style={{ display: "flex", justifyContent: "flex-start" }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 0",
                      color: BRAND.textPrimary,
                      fontSize: 15,
                      lineHeight: 1.5,
                      fontWeight: 400,
                      fontFamily: "inherit",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                    data-testid={`sofia-msg-${i}`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            {(streaming || chatLoading) && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 0",
                    color: BRAND.textPrimary,
                    fontSize: 15,
                    lineHeight: 1.5,
                    fontFamily: "inherit",
                  }}
                >
                  {streaming || (
                    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                      <Dot delay="0s" />
                      <Dot delay="0.15s" />
                      <Dot delay="0.3s" />
                    </span>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ─── COMPOSER ──────────────────────────────────────────────────────
          Single layout in BOTH text and live modes so the round
          on/off toggle stays in exactly the same position and just
          flips its visual state (purple Mic ↔ emerald Stop+wave).
          When live is ON the textarea swaps to a centered status
          panel + a wide secondary stop CTA; the round toggle still
          functions as the canonical on/off control. */}
      <div
        style={{
          background: BRAND.bgElevated,
          borderTop:
            voice.voiceMode === "live"
              ? `2px solid ${BRAND.liveGreen}`
              : `1px solid ${BRAND.border}`,
          padding: mob ? "10px 12px" : "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: voice.voiceMode === "live" ? 12 : 0,
          flexShrink: 0,
        }}
        data-testid="sofia-composer"
        data-mode={voice.voiceMode}
      >
        <div
          style={{
            display: "flex",
            alignItems: voice.voiceMode === "live" ? "center" : "flex-end",
            gap: mob ? 8 : 12,
            minHeight: mob ? 44 : 40,
          }}
        >
          {voice.voiceMode === "live" ? (
            <LiveVoiceComposerSurface
              mob={mob}
              state={voice.voiceState}
              tx={tx}
            />
          ) : (
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sendDisabled) void sendChat();
                }
              }}
              placeholder={tx.placeholder}
              disabled={chatLoading}
              style={{
                flex: 1,
                minWidth: 0,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: BRAND.textPrimary,
                fontFamily: "inherit",
                fontSize: mob ? 16 : 15,
                fontWeight: 400,
                lineHeight: 1.4,
                padding: "8px 0",
                maxHeight: 120,
                opacity: chatLoading ? 0.6 : 1,
              }}
              data-testid="sofia-chat-input"
            />
          )}

          {voice.voiceAvailable !== false && (
            <LiveVoiceToggleButton
              mob={mob}
              voiceMode={voice.voiceMode}
              state={voice.voiceState}
              onToggle={() => void handleLiveToggle()}
              labelOff={tx.liveStart}
              labelOn={tx.liveStop}
            />
          )}
        </div>

        {voice.voiceMode === "live" && (
          <button
            type="button"
            onClick={() => voice.stopLiveVoice()}
            style={{
              width: "100%",
              padding: mob ? "12px 16px" : "11px 16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: BRAND.liveGreen,
              border: "none",
              color: "#fff",
              cursor: "pointer",
              borderRadius: 12,
              fontFamily: "inherit",
              fontSize: mob ? 15 : 14,
              fontWeight: 600,
              letterSpacing: "0.02em",
              boxShadow: `0 4px 18px rgba(16,185,129,0.35)`,
            }}
            data-testid="sofia-live-stop"
            aria-label={tx.liveStop}
          >
            <Square size={16} fill="#fff" />
            <span>{tx.liveStopWide}</span>
          </button>
        )}
      </div>

      <style>{`
        @keyframes sofia-dot-pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.7); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: BRAND.accent,
        animation: `sofia-dot-pulse 1s ease-in-out ${delay} infinite`,
      }}
    />
  );
}

/**
 * Replaces the textarea while live voice is on — shows the equalizer
 * + the current sub-state label inside the same composer row, so the
 * round on/off toggle to the right keeps its position.
 */
function LiveVoiceComposerSurface({
  mob,
  state,
  tx,
}: {
  mob: boolean;
  state: LiveVoiceState;
  tx: PanelTexts;
}) {
  const isSofiaSpeaking = state === "speaking";
  const isTranscribing = state === "transcribing" || state === "thinking";
  const waveColor = isSofiaSpeaking ? BRAND.accent : BRAND.liveGreen;
  const labelColor = isSofiaSpeaking ? BRAND.accent : BRAND.liveGreen;
  const labelText = liveStateLabel(state, tx);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
      data-testid="sofia-live-composer"
      data-state={state}
    >
      <VoiceWave
        color={waveColor}
        bars={7}
        barWidth={4}
        barGap={4}
        height={mob ? 32 : 28}
        breathing={isSofiaSpeaking}
        testid="sofia-live-wave"
      />
      <span
        style={{
          fontSize: mob ? 13 : 13,
          fontWeight: 600,
          letterSpacing: "0.04em",
          color: labelColor,
          textTransform: "uppercase",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        data-testid="sofia-live-status"
      >
        {labelText}
      </span>
      {isTranscribing && (
        <Loader2
          size={14}
          color={BRAND.liveGreen}
          style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
        />
      )}
    </div>
  );
}

/**
 * Round toggle button — the canonical voice on/off control. Renders
 * exactly the same DOM node in both states so screen readers and
 * keyboard focus survive the transition. OFF: purple outline + Mic
 * glyph. ON: emerald fill + Square (stop) glyph + tiny rotating
 * waveform inside the ring to advertise that voice is currently
 * active even at a glance.
 */
function LiveVoiceToggleButton({
  mob,
  voiceMode,
  state,
  onToggle,
  labelOff,
  labelOn,
}: {
  mob: boolean;
  voiceMode: "off" | "live";
  state: LiveVoiceState;
  onToggle: () => void;
  labelOff: string;
  labelOn: string;
}) {
  const isOn = voiceMode === "live";
  const size = mob ? 44 : 40;
  const color = isOn ? "#fff" : BRAND.accent;
  const bg = isOn ? BRAND.liveGreen : "transparent";
  const border = isOn ? `2px solid ${BRAND.liveGreen}` : `2px solid ${BRAND.accent}`;
  const shadow = isOn ? `0 4px 14px rgba(16,185,129,0.45)` : "none";

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
        border,
        color,
        cursor: "pointer",
        borderRadius: "50%",
        flexShrink: 0,
        transition: "background 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
        boxShadow: shadow,
      }}
      data-testid="sofia-live-toggle"
      data-state={isOn ? "on" : "off"}
      aria-pressed={isOn}
      aria-label={isOn ? labelOn : labelOff}
      title={isOn ? labelOn : labelOff}
    >
      {isOn ? (
        <>
          <Square size={mob ? 16 : 14} fill="#fff" />
          {/* tiny inline mini-wave overlay so the ON state reads as
              "active voice" not just "stop pressed once". */}
          <span
            style={{
              position: "absolute",
              bottom: -2,
              left: "50%",
              transform: "translateX(-50%)",
              pointerEvents: "none",
            }}
            aria-hidden
          >
            <VoiceWave
              color="#fff"
              bars={3}
              barWidth={2}
              barGap={2}
              height={8}
              breathing={state === "speaking"}
              testid="sofia-live-toggle-wave"
            />
          </span>
        </>
      ) : (
        <Mic size={mob ? 18 : 16} />
      )}
    </button>
  );
}

interface BottomBarTexts {
  liveListening: string;
  liveSpeak: string;
  liveTranscribing: string;
  liveThinking: string;
  liveSofia: string;
  liveStop: string;
}

const BOTTOM_BAR_TXT: Record<string, BottomBarTexts> = {
  de: { liveListening: TXT.de.liveListening, liveSpeak: TXT.de.liveSpeak, liveTranscribing: TXT.de.liveTranscribing, liveThinking: TXT.de.liveThinking, liveSofia: TXT.de.liveSofia, liveStop: TXT.de.liveStop },
  en: { liveListening: TXT.en.liveListening, liveSpeak: TXT.en.liveSpeak, liveTranscribing: TXT.en.liveTranscribing, liveThinking: TXT.en.liveThinking, liveSofia: TXT.en.liveSofia, liveStop: TXT.en.liveStop },
  ru: { liveListening: TXT.ru.liveListening, liveSpeak: TXT.ru.liveSpeak, liveTranscribing: TXT.ru.liveTranscribing, liveThinking: TXT.ru.liveThinking, liveSofia: TXT.ru.liveSofia, liveStop: TXT.ru.liveStop },
};

/**
 * Persistent bottom bar shown when live voice is active AND the panel
 * is minimized. Tapping anywhere except the stop button re-opens the
 * panel without interrupting the voice loop.
 */
export function SofiaVoiceBottomBar({
  lang,
  mob,
  onOpen,
}: {
  lang: string;
  mob: boolean;
  onOpen: () => void;
}) {
  const voice = useSofiaVoice();
  const tx = BOTTOM_BAR_TXT[lang] || BOTTOM_BAR_TXT.de;
  if (voice.voiceMode !== "live") return null;

  const state = voice.voiceState;
  const isSofiaSpeaking = state === "speaking";
  const waveColor = isSofiaSpeaking ? BRAND.accent : BRAND.liveGreen;
  const labelColor = isSofiaSpeaking ? BRAND.accent : BRAND.liveGreen;
  let label = tx.liveListening;
  if (state === "user-speaking") label = tx.liveSpeak;
  else if (state === "transcribing") label = tx.liveTranscribing;
  else if (state === "thinking") label = tx.liveThinking;
  else if (state === "speaking") label = tx.liveSofia;

  const height = mob ? 64 : 56;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 150,
        height,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: BRAND.bg,
        borderTop: `2px solid ${BRAND.liveGreen}`,
        display: "flex",
        alignItems: "stretch",
        boxShadow: "0 -8px 28px rgba(0,0,0,0.45)",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
      data-testid="sofia-voice-bottom-bar"
      data-state={state}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: mob ? 12 : 14,
          padding: mob ? "0 14px" : "0 18px",
          background: "transparent",
          border: "none",
          color: BRAND.textPrimary,
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
        data-testid="sofia-voice-bottom-bar-open"
        aria-label="Sofia"
      >
        <VoiceWave
          color={waveColor}
          bars={5}
          barWidth={3}
          barGap={3}
          height={mob ? 26 : 24}
          breathing={isSofiaSpeaking}
          testid="sofia-voice-bottom-wave"
        />
        <span
          style={{
            fontSize: mob ? 13 : 13,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: labelColor,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          data-testid="sofia-voice-bottom-status"
        >
          {label}
        </span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          voice.stopLiveVoice();
        }}
        style={{
          width: mob ? 56 : 60,
          height: mob ? 44 : 40,
          alignSelf: "center",
          marginRight: mob ? 10 : 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.liveGreen,
          border: "none",
          color: "#fff",
          cursor: "pointer",
          borderRadius: 999,
          flexShrink: 0,
          boxShadow: `0 4px 14px rgba(16,185,129,0.45)`,
        }}
        data-testid="sofia-voice-bottom-stop"
        aria-label={tx.liveStop}
        title={tx.liveStop}
      >
        <Square size={18} fill="#fff" />
      </button>
    </div>
  );
}
