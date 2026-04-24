import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  ConnectionState,
} from "livekit-client";
import { PhoneOff, Mic, MicOff, Loader2, X, Volume2 } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "../../contexts/LanguageContext";

const allTexts = {
  ru: {
    connecting: "Подключение к Деннису...",
    speaking: "Деннис говорит...",
    micOn: "Ваш микрофон включён",
    endCall: "Завершить звонок",
    error: "Ошибка подключения",
    close: "Закрыть",
    retry: "Попробовать снова",
    ready: "Готов ответить на ваши вопросы",
    startCall: "Начать разговор",
    liveLabel: "Live Avatar",
  },
  de: {
    connecting: "Verbindung zu Dennis...",
    speaking: "Dennis spricht...",
    micOn: "Dein Mikrofon ist an",
    endCall: "Anruf beenden",
    error: "Verbindungsfehler",
    close: "Schließen",
    retry: "Erneut versuchen",
    ready: "Bereit, deine Fragen zu beantworten",
    startCall: "Gespräch starten",
    liveLabel: "Live Avatar",
  },
  en: {
    connecting: "Connecting to Dennis...",
    speaking: "Dennis is speaking...",
    micOn: "Your microphone is on",
    endCall: "End call",
    error: "Connection error",
    close: "Close",
    retry: "Try again",
    ready: "Ready to answer your questions",
    startCall: "Start conversation",
    liveLabel: "Live Avatar",
  },
};

const LiveCallScreen: React.FC = () => {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const texts = allTexts[language] || allTexts.ru;

  const [status, setStatus] = useState<"idle" | "connecting" | "active" | "finished">("idle");
  const [isMuted, setIsMuted] = useState(true);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const roomRef = useRef<Room | null>(null);
  const speakerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<{ sender: string; text: string; timestamp: number }[]>([]);

  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
      } else if (track.kind === Track.Kind.Audio && audioContainerRef.current) {
        const trackId = `${participant.identity}-${track.sid}`;
        let audioEl = audioElementsRef.current.get(trackId);
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.setAttribute("playsinline", "true");
          audioEl.id = trackId;
          audioContainerRef.current.appendChild(audioEl);
          audioElementsRef.current.set(trackId, audioEl);
        }
        track.attach(audioEl);
        audioEl.play().catch(() => {});
      }
    },
    []
  );

  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack, publication?: RemoteTrackPublication, participant?: RemoteParticipant) => {
      track.detach();
      if (track.kind === Track.Kind.Audio && participant && track.sid) {
        const trackId = `${participant.identity}-${track.sid}`;
        const audioEl = audioElementsRef.current.get(trackId);
        if (audioEl) {
          audioEl.remove();
          audioElementsRef.current.delete(trackId);
        }
      }
    },
    []
  );

  const enableUserMic = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);
    }
    setIsAvatarTalking(false);
  }, []);

  const disableUserMic = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.localParticipant.setMicrophoneEnabled(false);
      setIsMuted(true);
    }
    setIsAvatarTalking(true);
  }, []);

  const handleActiveSpeakersChanged = useCallback(
    (speakers: any[]) => {
      if (!roomRef.current) return;
      const localIdentity = roomRef.current.localParticipant.identity;
      const avatarIsSpeaking = speakers.some(
        (s) => s.identity !== localIdentity && s.identity !== "client"
      );

      if (speakerTimeoutRef.current) {
        clearTimeout(speakerTimeoutRef.current);
        speakerTimeoutRef.current = null;
      }

      if (avatarIsSpeaking) {
        disableUserMic();
      } else {
        speakerTimeoutRef.current = setTimeout(() => {
          enableUserMic();
        }, 1000);
      }
    },
    [enableUserMic, disableUserMic]
  );

  const handleDataReceived = useCallback(
    (payload: Uint8Array) => {
      try {
        const message = new TextDecoder().decode(payload);
        let data: any;
        try {
          data = JSON.parse(message);
        } catch {
          return;
        }

        const eventType = data?.type || data?.event || data?.action;

        if (data.event_type === "avatar.transcription" && data.text) {
          transcriptRef.current.push({ sender: "avatar", text: data.text, timestamp: Date.now() });
        } else if (data.event_type === "user.transcription" && data.text) {
          transcriptRef.current.push({ sender: "user", text: data.text, timestamp: Date.now() });
        }

        if (
          eventType === "avatar_start_talking" ||
          eventType === "agent_start_talking" ||
          eventType === "start_talking" ||
          eventType === "speaking_started"
        ) {
          if (speakerTimeoutRef.current) {
            clearTimeout(speakerTimeoutRef.current);
            speakerTimeoutRef.current = null;
          }
          disableUserMic();
        } else if (
          eventType === "avatar_stop_talking" ||
          eventType === "agent_stop_talking" ||
          eventType === "stop_talking" ||
          eventType === "speaking_ended"
        ) {
          speakerTimeoutRef.current = setTimeout(() => {
            enableUserMic();
          }, 500);
        }
      } catch {}
    },
    [enableUserMic, disableUserMic]
  );

  const startSession = async () => {
    try {
      setStatus("connecting");
      setError(null);
      transcriptRef.current = [];

      const tokenResponse = await fetch("/api/liveavatar/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, persona: "dennis" }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        throw new Error(`Failed to get token: ${errText}`);
      }

      const tokenData = await tokenResponse.json();
      const { session_id, session_token } = tokenData;

      if (!session_token) {
        throw new Error("No session token received");
      }

      setSessionId(session_id);
      setSessionToken(session_token);

      const startResponse = await fetch("/api/liveavatar/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_token }),
      });

      if (!startResponse.ok) {
        const errText = await startResponse.text();
        throw new Error(`Failed to start session: ${errText}`);
      }

      const startData = await startResponse.json();
      const url = startData?.data?.livekit_url;
      const accessToken = startData?.data?.livekit_client_token;

      if (!url || !accessToken) {
        throw new Error("Missing LiveKit connection data");
      }

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
      room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
      room.on(RoomEvent.ActiveSpeakersChanged, handleActiveSpeakersChanged);
      room.on(RoomEvent.DataReceived, handleDataReceived);
      room.on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Connected) {
          setStatus("active");
        } else if (state === ConnectionState.Disconnected) {
          setStatus("finished");
        }
      });

      await room.connect(url, accessToken);
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);
      setIsAvatarTalking(false);
      setStatus("active");
    } catch (err: any) {
      console.error("Dennis live session error:", err);
      setError(err.message || "Failed to start video call");
      setStatus("idle");
    }
  };

  const endSession = async () => {
    try {
      if (speakerTimeoutRef.current) {
        clearTimeout(speakerTimeoutRef.current);
        speakerTimeoutRef.current = null;
      }
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }

      if (sessionId && sessionToken) {
        await fetch("/api/liveavatar/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, session_token: sessionToken }),
        });

        if (transcriptRef.current.length > 0) {
          try {
            await fetch(`/api/liveavatar/sessions/${sessionId}/transcript`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ language, messages: transcriptRef.current }),
            });
          } catch {}
        }
      }
    } catch (err) {
      console.error("End session error:", err);
    } finally {
      transcriptRef.current = [];
      setStatus("idle");
      setSessionId(null);
      setSessionToken(null);
      setLocation("/dennis");
    }
  };

  useEffect(() => {
    return () => {
      if (speakerTimeoutRef.current) clearTimeout(speakerTimeoutRef.current);
      if (roomRef.current) roomRef.current.disconnect();
    };
  }, []);

  if (status === "idle" && !error) {
    return (
      <div className="ph-live-root">
        <div className="ph-live-content">
          <div className="ph-live-avatar-wrap">
            <img src="/dennis-photo.png" alt="Dennis" className="ph-live-avatar" />
            <div className="ph-live-ring-anim" />
            <div className="ph-live-ring-anim ph-live-ring-2" />
          </div>

          <h2 className="ph-live-name">Dennis</h2>
          <p className="ph-live-status">
            <span className="ph-live-pulse" />
            {texts.liveLabel}
          </p>

          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textAlign: "center", marginBottom: 24 }}>
            {texts.ready}
          </p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="ph-btn-primary"
            onClick={startSession}
            data-testid="btn-start-live"
            style={{ width: "100%", maxWidth: 280, padding: "14px 24px", fontSize: 16 }}
          >
            <Mic size={18} />
            {texts.startCall}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="ph-live-end"
            onClick={() => setLocation("/dennis")}
            data-testid="btn-back"
            style={{ marginTop: 16 }}
          >
            <X size={18} />
            {texts.close}
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="ph-live-root" style={{ background: "#000" }}>
      {status === "connecting" && (
        <div className="ph-live-content">
          <div className="ph-live-avatar-wrap">
            <img src="/dennis-photo.png" alt="Dennis" className="ph-live-avatar" />
            <div className="ph-live-ring-anim" />
          </div>
          <Loader2 size={32} className="animate-spin" style={{ color: "#7C3AED", marginTop: 16 }} />
          <p style={{ color: "#fff", marginTop: 12, fontSize: 16 }}>{texts.connecting}</p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: status === "active" ? "block" : "none",
        }}
      />

      <div ref={audioContainerRef} style={{ display: "none" }} />

      {status === "active" && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            zIndex: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 999,
              backdropFilter: "blur(12px)",
              fontSize: 14,
              fontWeight: 500,
              background: isAvatarTalking ? "rgba(124,58,237,0.2)" : "rgba(34,197,94,0.2)",
              color: isAvatarTalking ? "#A855F7" : "#4ADE80",
              border: `1px solid ${isAvatarTalking ? "rgba(124,58,237,0.3)" : "rgba(34,197,94,0.3)"}`,
            }}
          >
            {isAvatarTalking ? (
              <>
                <Volume2 size={18} className="animate-pulse" />
                <span>{texts.speaking}</span>
              </>
            ) : (
              <>
                <Mic size={18} />
                <span>{texts.micOn}</span>
              </>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={endSession}
            data-testid="btn-end-call"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 999,
              background: "#DC2626",
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(220,38,38,0.3)",
            }}
          >
            <PhoneOff size={22} />
            {texts.endCall}
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ph-live-content"
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 30 }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(239,68,68,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <X size={32} style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{texts.error}</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24, textAlign: "center", maxWidth: 280 }}>
              {error}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setError(null); setLocation("/dennis"); }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                {texts.close}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => { setError(null); startSession(); }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 12,
                  background: "#7C3AED",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {texts.retry}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveCallScreen;
