import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { getVisitorId, appendSofiaJournal, appendSharedChatTurn, sofiaFetch } from "@/lib/sofiaVisitor";
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  Participant,
} from "livekit-client";

export type SofiaState = "hidden" | "welcome" | "connecting" | "active" | "minimized" | "ending" | "finished" | "error";

interface TranscriptMessage {
  sender: "avatar" | "user";
  text: string;
  timestamp: number;
}

interface SofiaContextValue {
  state: SofiaState;
  sessionId: string | null;
  isAvatarTalking: boolean;
  isMuted: boolean;
  error: string | null;
  messages: TranscriptMessage[];
  enabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  audioContainerRef: React.RefObject<HTMLDivElement>;
  openWelcome: () => void;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
  minimize: () => void;
  maximize: () => void;
  toggleMute: () => Promise<void>;
  closeWelcome: () => void;
  sendTextMessage: (text: string) => Promise<void>;
  sendEvent: (name: string, params?: Record<string, string | number>) => Promise<void>;
  pauseForVideo: () => void;
  resumeFromVideo: (followUpText?: string) => Promise<void>;
}

const SofiaCtx = createContext<SofiaContextValue | null>(null);

export function useSofia(): SofiaContextValue {
  const ctx = useContext(SofiaCtx);
  if (!ctx) throw new Error("useSofia must be used inside SofiaSessionProvider");
  return ctx;
}

export function useOptionalSofia(): SofiaContextValue | null {
  return useContext(SofiaCtx);
}

const KEEPALIVE_INTERVAL_MS = 120_000;

export function SofiaSessionProvider({ children, language }: { children: React.ReactNode; language: string }) {
  const [state, setState] = useState<SofiaState>("hidden");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAvatarTalking, setIsAvatarTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [enabled, setEnabled] = useState<boolean>(false);

  const roomRef = useRef<Room | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const heygenSessionIdRef = useRef<string | null>(null);
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesRef = useRef<TranscriptMessage[]>([]);
  const languageRef = useRef<"de" | "en" | "ru">(language === "ru" ? "ru" : language === "en" ? "en" : "de");
  useEffect(() => {
    languageRef.current = language === "ru" ? "ru" : language === "en" ? "en" : "de";
  }, [language]);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const actionsEsRef = useRef<EventSource | null>(null);
  const endSessionRef = useRef<(() => Promise<void>) | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);

  const [location, setLocation] = useLocation();

  // Detect sofia availability for current language
  useEffect(() => {
    let cancelled = false;
    fetch("/api/sofia/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cancelled) return;
        const langKey = language === "ru" ? "ru" : language === "en" ? "en" : "de";
        setEnabled(Boolean(cfg?.enabled?.[langKey]));
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const cleanup = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    if (actionsEsRef.current) {
      try { actionsEsRef.current.close(); } catch {}
      actionsEsRef.current = null;
    }
    audioElementsRef.current.forEach((el) => el.remove());
    audioElementsRef.current.clear();
    if (roomRef.current) {
      try {
        roomRef.current.disconnect();
      } catch {}
      roomRef.current = null;
    }
  }, []);

  const sendPageVisit = useCallback(async (path: string) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    try {
      await fetch(`/api/sofia/session/${sid}/page`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, at: Date.now() }),
      });
    } catch {}
    const room = roomRef.current;
    if (room && room.localParticipant) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: "page_changed", path, at: Date.now() }));
        await room.localParticipant.publishData(payload, { reliable: true, topic: "agent-control" });
      } catch {}
    }
  }, []);

  // Track navigation & push page_changed
  useEffect(() => {
    if (state === "active" || state === "minimized") {
      sendPageVisit(location);
    }
  }, [location, state, sendPageVisit]);

  const attachAudio = useCallback((track: RemoteTrack, participant: RemoteParticipant) => {
    if (!audioContainerRef.current) return;
    // Play ALL remote audio tracks. A previous attempt to mute "agent-*" tracks
    // assumed HeyGen split TTS ("heygen") from echo ("agent-*"), but HeyGen
    // publishes the avatar TTS itself under an "agent-*" identity — so that
    // filter silenced Sofia entirely. Echo prevention is handled by muting the
    // local mic while the avatar is speaking (see ActiveSpeakersChanged).
    const trackId = `${participant.identity}-${track.sid}`;
    let audioEl = audioElementsRef.current.get(trackId);
    if (!audioEl) {
      audioEl = document.createElement("audio");
      audioEl.autoplay = true;
      audioEl.setAttribute("playsinline", "true");
      audioEl.volume = 1.0;
      audioEl.id = trackId;
      audioEl.addEventListener("playing", () => console.log("[sofia] ▶ audio PLAYING:", trackId));
      audioEl.addEventListener("pause", () => console.log("[sofia] ⏸ audio PAUSED:", trackId));
      audioContainerRef.current.appendChild(audioEl);
      audioElementsRef.current.set(trackId, audioEl);
    }
    track.attach(audioEl);
    audioEl.muted = false;
    audioEl.volume = 1.0;
    audioEl.play().catch((e) => console.log("[sofia] autoplay blocked:", trackId, e?.message));
    console.log("[sofia] audio track attached:", trackId, "from:", participant.identity);
  }, []);

  const setupRoomHandlers = useCallback((room: Room) => {
    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log("[sofia] TrackSubscribed:", track.kind, "from:", participant.identity);
      if (track.kind === Track.Kind.Video && videoRef.current) {
        track.attach(videoRef.current);
      } else if (track.kind === Track.Kind.Audio) {
        attachAudio(track, participant);
      }
    });

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, _pub, participant?: RemoteParticipant) => {
      console.log("[sofia] TrackUnsubscribed:", track.kind);
      track.detach();
      if (track.kind === Track.Kind.Audio && participant && track.sid) {
        const trackId = `${participant.identity}-${track.sid}`;
        const el = audioElementsRef.current.get(trackId);
        if (el) {
          el.remove();
          audioElementsRef.current.delete(trackId);
        }
      }
    });

    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log("[sofia] ParticipantConnected:", participant.identity);
      participant.trackPublications.forEach((pub) => {
        if (pub.track && pub.isSubscribed) {
          if (pub.track.kind === Track.Kind.Video && videoRef.current) {
            pub.track.attach(videoRef.current);
          } else if (pub.track.kind === Track.Kind.Audio) {
            attachAudio(pub.track, participant);
          }
        }
      });
    });

    room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      const canPlay = room.canPlaybackAudio;
      console.log("[sofia] AudioPlaybackStatusChanged, canPlaybackAudio:", canPlay);
      if (!canPlay) {
        room.startAudio().catch((e) => console.warn("[sofia] startAudio retry failed", e));
      }
    });

    room.on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
      if (!roomRef.current) return;
      const localIdentity = roomRef.current.localParticipant.identity;
      const avatarSpeaking = speakers.some((s) => s.identity !== localIdentity);
      setIsAvatarTalking((prev) => {
        if (avatarSpeaking && !prev) {
          roomRef.current?.localParticipant.setMicrophoneEnabled(false);
          setIsMuted(true);
          return true;
        }
        if (!avatarSpeaking && prev) {
          roomRef.current?.localParticipant.setMicrophoneEnabled(true);
          setIsMuted(false);
          return false;
        }
        return prev;
      });
    });

    room.on(RoomEvent.DataReceived, (payload: Uint8Array) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        if (data.event_type === "avatar.transcription" && data.text) {
          const msg: TranscriptMessage = { sender: "avatar", text: data.text, timestamp: Date.now() };
          messagesRef.current = [...messagesRef.current, msg];
          setMessages((prev) => [...prev, msg]);
          try {
            window.dispatchEvent(new CustomEvent("sofia:voice-transcript", {
              detail: { source: "ai", message: String(data.text), language: languageRef.current, mode: "avatar" },
            }));
          } catch {}
          // NOTE: do not call appendSofiaJournal here — the Sofia LLM proxy
          // already journals both user and assistant turns server-side
          // (see sofia-proxy.ts), and a second client-side append would
          // double-write the avatar turn into sofia_dialog. Keep only the
          // shared-chat local cache so the chat tab UI sees the turn even
          // when not currently mounted.
          appendSharedChatTurn(languageRef.current, "assistant", String(data.text), "avatar");
        } else if (data.event_type === "user.transcription" && data.text) {
          const msg: TranscriptMessage = { sender: "user", text: data.text, timestamp: Date.now() };
          messagesRef.current = [...messagesRef.current, msg];
          setMessages((prev) => [...prev, msg]);
          try {
            window.dispatchEvent(new CustomEvent("sofia:voice-transcript", {
              detail: { source: "user", message: String(data.text), language: languageRef.current, mode: "avatar" },
            }));
          } catch {}
          // See note above — proxy already journals user turns server-side.
          appendSharedChatTurn(languageRef.current, "user", String(data.text), "avatar");
        } else if (data.type === "avatar_start_talking" || data.type === "agent_start_talking") {
          setIsAvatarTalking(true);
          roomRef.current?.localParticipant.setMicrophoneEnabled(false);
          setIsMuted(true);
        } else if (data.type === "avatar_stop_talking" || data.type === "agent_stop_talking") {
          setIsAvatarTalking(false);
          roomRef.current?.localParticipant.setMicrophoneEnabled(true);
          setIsMuted(false);
        }
      } catch {}
    });
  }, []);

  const startSession = useCallback(async () => {
    if (state === "connecting" || state === "active" || state === "minimized") return;
    setError(null);
    setMessages([]);
    messagesRef.current = [];
    setState("connecting");

    try {
      const tokenRes = await sofiaFetch("/api/sofia/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, visitorId: getVisitorId() }),
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Sofia not available");
      }
      const { session_id, heygen_session_id, session_token } = await tokenRes.json();
      if (!session_id || !session_token) throw new Error("Invalid token response");

      setSessionId(session_id);
      sessionIdRef.current = session_id;
      heygenSessionIdRef.current = heygen_session_id || session_id;
      sessionTokenRef.current = session_token;

      const startRes = await fetch("/api/liveavatar/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_token }),
      });
      if (!startRes.ok) {
        const err = await startRes.json().catch(() => ({}));
        throw new Error(err?.details || err?.error || "Start session failed");
      }
      const startData = await startRes.json();
      const livekitUrl = startData?.data?.livekit_url;
      const livekitToken = startData?.data?.livekit_client_token;
      if (!livekitUrl || !livekitToken) throw new Error("Missing LiveKit connection data");

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;
      setupRoomHandlers(room);

      await room.connect(livekitUrl, livekitToken);
      // Unlock autoplay within the user-gesture scope (Start button click).
      // Without this, later-subscribed audio tracks can be blocked by the
      // browser's autoplay policy → avatar "moves mouth" but no sound.
      try {
        await room.startAudio();
      } catch (e) {
        console.warn("[sofia] startAudio failed", e);
      }
      await room.localParticipant.setMicrophoneEnabled(true);
      setIsMuted(false);

      // keep-alive
      keepAliveTimerRef.current = setInterval(() => {
        const tok = sessionTokenRef.current;
        if (!tok) return;
        fetch("/api/sofia/session/keep-alive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_token: tok }),
        }).catch((e) => console.warn("[sofia] keep-alive failed", e));
      }, KEEPALIVE_INTERVAL_MS);

      // Subscribe to Sofia actions channel (navigate / minimize / end_session / open_url)
      try {
        const es = new EventSource(`/api/sofia/actions/${session_id}`);
        actionsEsRef.current = es;
        es.onmessage = (ev) => {
          if (!ev?.data) return;
          try {
            const payload = JSON.parse(ev.data) as { actions?: Array<{ type: string; params?: any }> };
            (payload?.actions || []).forEach((action) => {
              if (!action || typeof action.type !== "string") return;
              const params = action.params || {};
              console.log("[sofia] action:", action.type, params);
              switch (action.type) {
                case "navigate": {
                  const target = params.path ?? params.to ?? params.route ?? params.url;
                  if (target) setLocation(String(target));
                  break;
                }
                case "open_url":
                  if (params.url) {
                    try { window.open(String(params.url), params.target || "_blank", "noopener,noreferrer"); } catch {}
                  }
                  break;
                case "minimize":
                  setState("minimized");
                  break;
                case "maximize":
                  setState("active");
                  break;
                case "open_presentation":
                  try {
                    window.dispatchEvent(new CustomEvent("sofia:open-presentation"));
                  } catch {}
                  setState("minimized");
                  break;
                case "close_presentation":
                  try {
                    window.dispatchEvent(new CustomEvent("sofia:close-presentation"));
                  } catch {}
                  setState("active");
                  break;
                case "play_intro_video":
                  // Episode 2 video has been removed from the slide deck.
                  // Fall back to opening the slide presentation so Sofia's intent ("show the video")
                  // still produces something useful instead of a silent no-op.
                  try {
                    window.dispatchEvent(new CustomEvent("sofia:open-presentation"));
                  } catch {}
                  setState("minimized");
                  break;
                case "share_to_partner":
                  console.log("[sofia] share_to_partner — not yet wired (v2 SaaS)");
                  break;
                case "slide_goto":
                  try {
                    const screen = params.screen ?? params.screenId ?? params.slide;
                    if (screen) {
                      window.dispatchEvent(
                        new CustomEvent("sofia:slide-goto", { detail: { screen: String(screen) } }),
                      );
                    }
                  } catch {}
                  break;
                case "scroll_to": {
                  const section = params.section ?? params.target ?? params.id;
                  if (section) {
                    try {
                      const el =
                        document.querySelector(`[data-testid="section-${section}"]`) ||
                        document.querySelector(`#${CSS.escape(String(section))}`) ||
                        document.querySelector(`[data-section="${section}"]`);
                      if (el && "scrollIntoView" in el) {
                        (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
                      } else {
                        window.dispatchEvent(
                          new CustomEvent("sofia:scroll-to", { detail: { section: String(section) } }),
                        );
                      }
                    } catch {}
                  }
                  break;
                }
                case "highlight": {
                  const section = params.section ?? params.target ?? params.id;
                  const duration = Number(params.duration_ms ?? params.durationMs ?? 2000);
                  if (section) {
                    try {
                      const el =
                        (document.querySelector(`[data-testid="section-${section}"]`) as HTMLElement | null) ||
                        (document.querySelector(`#${CSS.escape(String(section))}`) as HTMLElement | null) ||
                        (document.querySelector(`[data-section="${section}"]`) as HTMLElement | null);
                      if (el) {
                        el.style.transition = "outline 0.3s, box-shadow 0.3s";
                        el.style.outline = "3px solid #E879F9";
                        el.style.boxShadow = "0 0 24px rgba(232,121,249,0.6)";
                        window.setTimeout(() => {
                          el.style.outline = "";
                          el.style.boxShadow = "";
                        }, duration);
                      }
                    } catch {}
                  }
                  break;
                }
                case "end_session":
                  void endSessionRef.current?.();
                  break;
                case "pause":
                  // no-op; avatar auto-manages mic via ActiveSpeakersChanged
                  break;
                default:
                  console.log("[sofia] unknown action:", action.type);
              }
            });
          } catch (e) {
            console.warn("[sofia] bad action event", e);
          }
        };
        es.onerror = (e) => {
          console.warn("[sofia] actions SSE error", e);
        };
      } catch (e) {
        console.warn("[sofia] actions SSE open failed", e);
      }

      setState("active");
      sendPageVisit(location);
    } catch (e: any) {
      console.error("[sofia] start error:", e);
      setError(e?.message || "Verbindung fehlgeschlagen");
      setState("error");
      cleanup();
    }
  }, [state, language, setupRoomHandlers, cleanup, location, sendPageVisit]);

  const endSession = useCallback(async () => {
    const sid = sessionIdRef.current;
    const tok = sessionTokenRef.current;
    setState("ending");

    try {
      if (messagesRef.current.length > 0 && sid) {
        try {
          await fetch(`/api/sofia/session/${sid}/transcript`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: messagesRef.current }),
          });
        } catch {}
      }
      if (sid) {
        await fetch("/api/sofia/session/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sid,
            heygen_session_id: heygenSessionIdRef.current,
            session_token: tok,
            exit_action: "user_closed",
          }),
        }).catch(() => {});
      }
    } finally {
      cleanup();
      sessionTokenRef.current = null;
      sessionIdRef.current = null;
      heygenSessionIdRef.current = null;
      setSessionId(null);
      setState("hidden");
    }
  }, [cleanup]);

  useEffect(() => {
    endSessionRef.current = endSession;
  }, [endSession]);

  const minimize = useCallback(() => {
    setState((s) => (s === "active" ? "minimized" : s));
  }, []);

  const maximize = useCallback(() => {
    setState((s) => (s === "minimized" ? "active" : s));
  }, []);

  const openWelcome = useCallback(() => {
    setError(null);
    setState((s) => (s === "hidden" || s === "finished" || s === "error" ? "welcome" : s));
  }, []);

  const closeWelcome = useCallback(() => {
    setState((s) => (s === "welcome" ? "hidden" : s));
  }, []);

  const publishToAgent = useCallback(async (text: string, eventIdPrefix: string) => {
    const room = roomRef.current;
    if (!room) {
      console.warn(`[sofia] ${eventIdPrefix}: no active LiveKit room`);
      return false;
    }
    try {
      const payload = {
        type: "avatar.speak_response",
        event_id: `${eventIdPrefix}-${Date.now()}`,
        data: { text },
      };
      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      await room.localParticipant.publishData(encoded, {
        reliable: true,
        topic: "agent-control",
      });
      return true;
    } catch (e) {
      console.warn(`[sofia] ${eventIdPrefix} publish error:`, e);
      return false;
    }
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;
    const entry: TranscriptMessage = {
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    messagesRef.current.push(entry);
    setMessages((prev) => [...prev, entry]);
    await publishToAgent(trimmed, "text");
  }, [publishToAgent]);

  const sendEvent = useCallback(async (name: string, params?: Record<string, string | number>) => {
    if (!name) return;
    const paramStr = params
      ? " " + Object.entries(params).map(([k, v]) => `${k}=${v}`).join(" ")
      : "";
    console.log("[sofia] event (local only):", `[event: ${name}${paramStr}]`);
  }, []);

  const pauseForVideo = useCallback(() => {
    console.log("[sofia] pauseForVideo: muting audio + minimizing");
    audioElementsRef.current.forEach((el) => { el.muted = true; });
    setState((s) => (s === "active" ? "minimized" : s));
  }, []);

  const resumeFromVideo = useCallback(async (followUpText?: string) => {
    console.log("[sofia] resumeFromVideo: unmuting + maximizing", { followUpText });
    audioElementsRef.current.forEach((el) => {
      el.muted = false;
      el.volume = 1.0;
      el.play().catch(() => {});
    });
    setState((s) => (s === "minimized" ? "active" : s));
    if (followUpText) {
      await publishToAgent(followUpText, "followup");
    }
  }, [publishToAgent]);

  const toggleMute = useCallback(async () => {
    if (isAvatarTalking) return;
    const room = roomRef.current;
    if (!room) return;
    // Re-unlock audio playback on every user gesture (mic click).
    try {
      if (!room.canPlaybackAudio) await room.startAudio();
    } catch {}
    audioElementsRef.current.forEach((el) => {
      el.muted = false;
      el.volume = 1.0;
      el.play().catch(() => {});
    });
    const next = !isMuted;
    await room.localParticipant.setMicrophoneEnabled(!next);
    setIsMuted(next);
  }, [isMuted, isAvatarTalking]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const value: SofiaContextValue = useMemo(
    () => ({
      state,
      sessionId,
      isAvatarTalking,
      isMuted,
      error,
      messages,
      enabled,
      videoRef,
      audioContainerRef,
      openWelcome,
      startSession,
      endSession,
      minimize,
      maximize,
      toggleMute,
      closeWelcome,
      sendTextMessage,
      sendEvent,
      pauseForVideo,
      resumeFromVideo,
    }),
    [state, sessionId, isAvatarTalking, isMuted, error, messages, enabled, openWelcome, startSession, endSession, minimize, maximize, toggleMute, closeWelcome, sendTextMessage, sendEvent, pauseForVideo, resumeFromVideo],
  );

  return <SofiaCtx.Provider value={value}>{children}</SofiaCtx.Provider>;
}
