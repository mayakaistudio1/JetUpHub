import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minimize2, Video, Send, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";
import { useSofia } from "@/contexts/SofiaSessionContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ACCENT = "#7C3AED";
const ACCENT_LIGHT = "#E879F9";

const HIDDEN_ROUTES = ["/admin", "/promo-admin", "/broll-gallery", "/export-slide", "/promo-preview", "/promo-banner"];

function shouldHideOverlay(path: string): boolean {
  const base = path.split("?")[0];
  if (HIDDEN_ROUTES.some((r) => base === r)) return true;
  if (base.startsWith("/partner-app")) return true;
  return false;
}

export default function SofiaOverlay() {
  const {
    state,
    isAvatarTalking,
    error,
    videoRef,
    audioContainerRef,
    startSession,
    endSession,
    minimize,
    maximize,
    closeWelcome,
    sendTextMessage,
    messages,
  } = useSofia();
  const { language } = useLanguage();
  const [location] = useLocation();
  const hidden = shouldHideOverlay(location);

  // Always render audio container so audio element attachments survive re-renders
  return (
    <>
      <div ref={audioContainerRef} style={{ display: "none" }} aria-hidden />
      {!hidden && <SofiaUI
        state={state}
        isAvatarTalking={isAvatarTalking}
        error={error}
        videoRef={videoRef}
        language={language}
        onStart={startSession}
        onEnd={endSession}
        onMinimize={minimize}
        onMaximize={maximize}
        onCloseWelcome={closeWelcome}
        onSendText={sendTextMessage}
        messages={messages}
      />}
    </>
  );
}

interface SofiaUIProps {
  state: string;
  isAvatarTalking: boolean;
  error: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  language: string;
  onStart: () => void;
  onEnd: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onCloseWelcome: () => void;
  onSendText: (text: string) => Promise<void> | void;
  messages: { sender: "user" | "avatar"; text: string; timestamp: number }[];
}

function SofiaUI({
  state,
  isAvatarTalking,
  error,
  videoRef,
  language,
  onStart,
  onEnd,
  onMinimize,
  onMaximize,
  onCloseWelcome,
  onSendText,
  messages,
}: SofiaUIProps) {
  const labels = getLabels(language);
  const [textInput, setTextInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showChat && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, showChat]);

  const handleSend = async () => {
    const value = textInput.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      await onSendText(value);
      setTextInput("");
    } finally {
      setSending(false);
    }
  };

  // Lock body scroll during welcome modal
  useEffect(() => {
    if (state === "welcome") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [state]);

  return (
    <>
      <AnimatePresence>
        {state === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 500,
              background: "rgba(5,5,15,0.85)",
              backdropFilter: "blur(12px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            data-testid="sofia-welcome-modal"
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              style={{
                width: "100%",
                maxWidth: 440,
                borderRadius: 24,
                overflow: "hidden",
                background: "linear-gradient(160deg, rgba(124,58,237,0.08) 0%, #0a0a12 100%)",
                border: "none",
                borderLeft: `2px solid ${ACCENT_LIGHT}`,
                boxShadow: `0 28px 80px rgba(0,0,0,0.55), 0 0 60px ${ACCENT_LIGHT}22`,
                position: "relative",
              }}
            >
              <button
                onClick={onCloseWelcome}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  cursor: "pointer",
                  zIndex: 2,
                }}
                aria-label="Close"
                data-testid="button-sofia-welcome-close"
              >
                <X size={18} />
              </button>

              <div style={{ padding: "32px 28px 24px" }}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    boxShadow: `0 10px 32px ${ACCENT}55`,
                  }}
                >
                  <Video size={32} color="#fff" />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT_LIGHT, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>
                  SOFIA AI
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 10 }}>
                  {labels.welcomeTitle}
                </div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: 24 }}>
                  {labels.welcomeSubtitle}
                </div>
                <button
                  onClick={onStart}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    borderRadius: 14,
                    border: "none",
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    boxShadow: `0 10px 24px ${ACCENT}60`,
                  }}
                  data-testid="button-sofia-start"
                >
                  <Video size={18} />
                  {labels.startBtn}
                </button>
                <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
                  {labels.permissions}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(state === "connecting" || state === "active" || state === "minimized" || state === "ending" || state === "error") && (
          <motion.div
            key="sofia-live"
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              zIndex: 490,
              width: state === "minimized" ? 72 : 320,
              height: state === "minimized" ? 72 : 400,
              borderRadius: state === "minimized" ? 22 : 18,
              overflow: "hidden",
              background: "#0a0a12",
              border: `1px solid ${ACCENT}55`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${ACCENT_LIGHT}22`,
              cursor: state === "minimized" ? "pointer" : "default",
            }}
            onClick={state === "minimized" ? onMaximize : undefined}
            data-testid="sofia-overlay"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#05050d",
              }}
            />

            {state === "connecting" && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: "rgba(5,5,15,0.8)",
                color: "#fff", gap: 10,
              }}>
                <div style={{ width: 30, height: 30, border: `3px solid ${ACCENT}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{labels.connecting}</div>
              </div>
            )}

            {state === "error" && (
              <div style={{
                position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 20,
                background: "rgba(5,5,15,0.9)", color: "#fff", gap: 10, textAlign: "center",
              }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{error || labels.error}</div>
                <button
                  onClick={onEnd}
                  style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${ACCENT}`, background: "transparent", color: "#fff", fontSize: 12, cursor: "pointer" }}
                >
                  {labels.close}
                </button>
              </div>
            )}

            {state !== "minimized" && (state === "active") && (
              <>
                <div style={{
                  position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 10px", borderRadius: 999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: isAvatarTalking ? "#10b981" : "#a3a3a3",
                    boxShadow: isAvatarTalking ? "0 0 8px #10b981" : "none",
                  }} />
                  <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, letterSpacing: "0.08em" }}>
                    {isAvatarTalking ? labels.speaking : labels.listening}
                  </span>
                </div>

                <div style={{
                  position: "absolute", top: 8, right: 8, display: "flex", gap: 6,
                }}>
                  <button
                    onClick={() => setShowChat((v) => !v)}
                    style={{
                      ...overlayBtnStyle,
                      background: showChat ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})` : overlayBtnStyle.background,
                    }}
                    aria-label="Toggle chat"
                    data-testid="button-sofia-chat-toggle"
                  >
                    <MessageSquare size={14} />
                  </button>
                  <button
                    onClick={onMinimize}
                    style={overlayBtnStyle}
                    aria-label="Minimize"
                    data-testid="button-sofia-minimize"
                  >
                    <Minimize2 size={14} />
                  </button>
                  <button
                    onClick={onEnd}
                    style={{ ...overlayBtnStyle, background: "rgba(220,38,38,0.85)" }}
                    aria-label="End session"
                    data-testid="button-sofia-end"
                  >
                    <X size={14} />
                  </button>
                </div>

                {showChat && (
                  <div
                    style={{
                      position: "absolute",
                      top: 46,
                      left: 8,
                      right: 8,
                      bottom: 54,
                      borderRadius: 12,
                      background: "rgba(5,5,15,0.88)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                    }}
                    onClick={(e) => e.stopPropagation()}
                    data-testid="panel-sofia-chat"
                  >
                    <div
                      ref={chatScrollRef}
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "10px 10px 6px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      {messages.length === 0 && (
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", padding: "16px 8px" }}>
                          {labels.chatEmpty}
                        </div>
                      )}
                      {messages.map((m, i) => (
                        <div
                          key={`${m.timestamp}-${i}`}
                          style={{
                            alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                            maxWidth: "82%",
                            padding: "6px 10px",
                            borderRadius: 12,
                            background:
                              m.sender === "user"
                                ? `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`
                                : "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontSize: 12.5,
                            lineHeight: 1.35,
                            wordBreak: "break-word",
                          }}
                          data-testid={`message-sofia-${m.sender}-${i}`}
                        >
                          {m.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    right: 8,
                    bottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 4,
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={labels.textPlaceholder}
                    disabled={sending}
                    data-testid="input-sofia-text"
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: 13,
                      padding: "6px 8px",
                      minWidth: 0,
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !textInput.trim()}
                    aria-label="Send message"
                    data-testid="button-sofia-send-text"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: "none",
                      background:
                        sending || !textInput.trim()
                          ? "rgba(255,255,255,0.12)"
                          : `linear-gradient(135deg, ${ACCENT}, ${ACCENT_LIGHT})`,
                      color: "#fff",
                      cursor: sending || !textInput.trim() ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </>
            )}

            {state === "minimized" && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: `linear-gradient(135deg, ${ACCENT}20, ${ACCENT_LIGHT}20)`,
                pointerEvents: "none",
              }}>
                <div style={{
                  position: "absolute", top: 4, right: 4,
                  width: 18, height: 18, borderRadius: "50%",
                  background: isAvatarTalking ? "#10b981" : "#7C3AED",
                  boxShadow: isAvatarTalking ? "0 0 10px #10b981" : "none",
                  border: "2px solid #0a0a18",
                }} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

const overlayBtnStyle: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, border: "none",
  background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)",
  color: "#fff", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};

function getLabels(lang: string) {
  if (lang === "de") {
    return {
      welcomeTitle: "Hallo, ich bin Sofia.",
      welcomeSubtitle: "Ich bin deine persönliche AI-Beraterin. Lass uns kurz sprechen — ich beantworte dir alle Fragen zu JetUP.",
      startBtn: "Gespräch starten",
      permissions: "Wir nutzen dein Mikrofon",
      connecting: "Verbinde...",
      speaking: "SPRICHT",
      listening: "HÖRT ZU",
      error: "Verbindung fehlgeschlagen",
      close: "Schliessen",
      textPlaceholder: "Oder hier tippen...",
      chatEmpty: "Leg los — per Stimme oder Text.",
    };
  }
  if (lang === "ru") {
    return {
      welcomeTitle: "Привет, я София.",
      welcomeSubtitle: "Я твой персональный AI-консультант. Давай поговорим — отвечу на все вопросы о JetUp.",
      startBtn: "Начать разговор",
      permissions: "Будет использован микрофон",
      connecting: "Подключаемся...",
      speaking: "ГОВОРИТ",
      listening: "СЛУШАЕТ",
      error: "Не удалось подключиться",
      close: "Закрыть",
      textPlaceholder: "Или напишите здесь...",
      chatEmpty: "Начните разговор — голосом или текстом.",
    };
  }
  return {
    welcomeTitle: "Hi, I'm Sofia.",
    welcomeSubtitle: "I'm your personal AI advisor. Let's have a quick chat — I'll answer all your JetUp questions.",
    startBtn: "Start conversation",
    permissions: "Microphone will be used",
    connecting: "Connecting...",
    speaking: "SPEAKING",
    listening: "LISTENING",
    error: "Connection failed",
    close: "Close",
    textPlaceholder: "Or type here...",
    chatEmpty: "Start the conversation — by voice or text.",
  };
}
