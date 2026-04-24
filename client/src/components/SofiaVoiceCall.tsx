/**
 * Sofia Voice Call — STT + our LLM + ElevenLabs TTS.
 *
 * Architecture:
 *   1. MediaRecorder captures the visitor's voice (auto-stop on silence).
 *   2. Audio is uploaded to `/api/sofia/voice/stt` for transcription.
 *   3. The transcript is appended to the *same* recruiting chat history
 *      stored under `sofia-recruit-chat-${lang}` (one source of truth for
 *      text + voice + avatar) and a `sofia:voice-transcript` event is
 *      dispatched so any mounted chat surface updates live.
 *   4. The full updated history is sent to `/api/maria/recruiting/chat` —
 *      i.e. the same Sofia LLM that powers text mode.
 *   5. Sofia's reply is appended to the same shared history, dispatched as
 *      a transcript event, and immediately spoken via `/api/sofia/voice/tts`.
 *
 * Why not the autonomous ElevenLabs Conversational AI agent?  Because it
 * runs its own LLM and its own state, which would force us to maintain
 * two divergent prompts and split the conversation log between modes.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  PhoneOff,
  Loader2,
  MessageCircle,
  AlertCircle,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVisitorId, appendSofiaJournal, sofiaFetch } from "@/lib/sofiaVisitor";

type Status =
  | "idle"
  | "requesting-mic"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "ended"
  | "error";

interface Props {
  language: "de" | "en" | "ru";
  onEnd?: () => void;
  onSwitchToChat?: () => void;
  contained?: boolean;
  /**
   * Notifies the parent whenever the voice session transitions between
   * idle and "live" (mic open / speaking / thinking). The panel uses
   * this to drive the "running in background" indicator on the tab bar.
   */
  onActiveChange?: (active: boolean) => void;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  mode?: "chat" | "voice" | "avatar";
  ts?: number;
}

function notifyChatUpdated(lang: "de" | "en" | "ru") {
  try {
    window.dispatchEvent(new CustomEvent("sofia:chat-updated", { detail: { lang } }));
  } catch {
    /* ignore */
  }
}

const LABELS = {
  de: {
    start: "Gespräch starten",
    end: "Beenden",
    listening: "Ich höre zu …",
    transcribing: "Verstehe …",
    thinking: "Sofia denkt …",
    speaking: "Sofia spricht …",
    requesting: "Mikrofon-Zugriff …",
    micDenied: "Mikrofon-Zugriff verweigert",
    notConfigured: "Sprachmodus ist noch nicht konfiguriert.",
    chatInstead: "Stattdessen chatten",
    failed: "Verbindung fehlgeschlagen",
    title: "Sofia — Sprachmodus",
    subtitle: "Sprich frei. Ich höre, denke und antworte mit Stimme.",
    mute: "Stummschalten",
    unmute: "Mikro einschalten",
  },
  en: {
    start: "Start conversation",
    end: "End",
    listening: "I'm listening …",
    transcribing: "Understanding …",
    thinking: "Sofia is thinking …",
    speaking: "Sofia is speaking …",
    requesting: "Requesting mic …",
    micDenied: "Microphone permission denied",
    notConfigured: "Voice mode is not configured yet.",
    chatInstead: "Chat instead",
    failed: "Connection failed",
    title: "Sofia — Voice mode",
    subtitle: "Speak freely. I listen, think and reply with voice.",
    mute: "Mute",
    unmute: "Unmute",
  },
  ru: {
    start: "Начать разговор",
    end: "Завершить",
    listening: "Слушаю …",
    transcribing: "Распознаю …",
    thinking: "София думает …",
    speaking: "София говорит …",
    requesting: "Запрос микрофона …",
    micDenied: "Доступ к микрофону запрещён",
    notConfigured: "Голосовой режим ещё не настроен.",
    chatInstead: "Перейти в чат",
    failed: "Не удалось подключиться",
    title: "София — голосовой режим",
    subtitle: "Говори свободно. Я слушаю, думаю и отвечаю голосом.",
    mute: "Выключить микро",
    unmute: "Включить микро",
  },
};

const GREETINGS: Record<"de" | "en" | "ru", string> = {
  de: "Hallo! Ich bin Sofia, deine persönliche Beraterin bei JetUP. Was interessiert dich mehr — passives Einkommen aufbauen oder ein eigenes Team führen?",
  en: "Hi! I'm Sofia, your personal JetUP consultant. What interests you more — building passive income or leading your own team?",
  ru: "Привет! Я София, твой личный консультант JetUP. Что тебе интереснее — пассивный доход или построение своей команды?",
};

const CONTINUATIONS: Record<"de" | "en" | "ru", string> = {
  de: "Schön, dass du wieder da bist. Wo waren wir stehen geblieben — woran möchtest du weiterarbeiten?",
  en: "Good to hear you again. Let's pick up where we left off — what would you like to continue with?",
  ru: "Рада снова тебя слышать. Продолжим с того места, где остановились — о чём хочешь поговорить дальше?",
};

// Synthetic prompts the voice mode sends to the recruiting LLM at start
// when the visitor has prior turns. The LLM already has the full
// cross-mode history injected as priorContext on the server, so this
// just nudges it to produce a brief personalised "welcome back".
const CONTINUATION_PROMPTS: Record<"de" | "en" | "ru", string> = {
  de: "(Der Besucher hat den Sprachmodus erneut geöffnet. Begrüße ihn kurz und persönlich, knüpfe an unser bisheriges Gespräch an und stelle eine konkrete weiterführende Frage. Maximal zwei Sätze.)",
  en: "(The visitor just reopened the voice mode. Greet them briefly and personally, reference what we already discussed, and ask one concrete follow-up question. Max two sentences.)",
  ru: "(Пользователь снова открыл голосовой режим. Кратко и тепло поприветствуй его, сошлись на то, о чём мы уже говорили, и задай один конкретный уточняющий вопрос. Максимум два предложения.)",
};

const SILENCE_THRESHOLD = 0.018;
const SILENCE_HOLD_MS = 1100;
const MIN_SPEECH_MS = 350;
const MAX_SEGMENT_MS = 18000;

function emitTranscript(detail: {
  source: "user" | "ai";
  message: string;
  conversationId: string | null;
  language: "de" | "en" | "ru";
}) {
  try {
    window.dispatchEvent(new CustomEvent("sofia:voice-transcript", { detail }));
  } catch {
    /* ignore */
  }
}

function reportTelemetry(payload: {
  type: "start" | "end" | "error";
  lang: string;
  conversationId?: string | null;
  durationMs?: number;
  message?: string;
}) {
  try {
    fetch("/api/sofia/voice/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* ignore */
  }
}

function loadHistory(lang: "de" | "en" | "ru"): ChatMsg[] {
  try {
    const raw = localStorage.getItem(`sofia-recruit-chat-${lang}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.filter(
          (m): m is ChatMsg =>
            m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
        );
      }
    }
  } catch {
    /* ignore */
  }
  return [{ role: "assistant", content: GREETINGS[lang] }];
}

function saveHistory(lang: "de" | "en" | "ru", history: ChatMsg[]) {
  try {
    localStorage.setItem(`sofia-recruit-chat-${lang}`, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
}

export default function SofiaVoiceCall({
  language,
  onEnd,
  onSwitchToChat,
  contained = false,
  onActiveChange,
}: Props) {
  const t = LABELS[language] || LABELS.de;

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [muted, setMuted] = useState(false);

  const conversationIdRef = useRef<string>(`voice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const startedAtRef = useRef<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startSegmentRef = useRef<() => void>(() => {});
  const chunksRef = useRef<BlobPart[]>([]);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const sessionActiveRef = useRef(false);
  const cycleBusyRef = useRef(false);
  const speakingStartRef = useRef<number | null>(null);
  const lastVoiceRef = useRef<number>(0);
  const segmentStartRef = useRef<number>(0);
  const recorderMimeRef = useRef<string>("");
  const mutedRef = useRef(false);
  const statusRef = useRef<Status>("idle");

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const setSafeStatus = useCallback((s: Status) => {
    if (!sessionActiveRef.current && s !== "ended" && s !== "error" && s !== "idle") return;
    setStatus(s);
  }, []);

  // Probe whether the voice mode is configured for this language.
  useEffect(() => {
    let cancelled = false;
    setAvailable(null);
    fetch(`/api/sofia/voice/config?lang=${language}`)
      .then((r) => r.json())
      .then((cfg) => {
        if (!cancelled) setAvailable(!!cfg?.enabled);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const tearDown = useCallback(() => {
    if (sessionActiveRef.current) {
      onActiveChange?.(false);
    }
    sessionActiveRef.current = false;
    cycleBusyRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      recorderRef.current?.state !== "inactive" && recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    recorderRef.current = null;
    chunksRef.current = [];
    try {
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
    } catch {
      /* ignore */
    }
    streamRef.current = null;
    try {
      analyserRef.current?.disconnect();
    } catch {
      /* ignore */
    }
    analyserRef.current = null;
    try {
      audioCtxRef.current?.close();
    } catch {
      /* ignore */
    }
    audioCtxRef.current = null;
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.src = "";
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    }
  }, []);

  const playReply = useCallback(
    async (text: string): Promise<void> => {
      const r = await fetch("/api/sofia/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: language }),
      });
      if (!r.ok) {
        throw new Error(`tts ${r.status}`);
      }
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      playerRef.current = audio;
      setSafeStatus("speaking");
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
      if (playerRef.current === audio) playerRef.current = null;
    },
    [language, setSafeStatus],
  );

  const processSegment = useCallback(
    async (blob: Blob) => {
      if (!sessionActiveRef.current) return;
      cycleBusyRef.current = true;
      let fatal = false;
      try {
        setSafeStatus("transcribing");
        const fd = new FormData();
        fd.append("file", blob, `speech.${(blob.type.includes("mp4") ? "mp4" : "webm")}`);
        fd.append("lang", language);
        const r = await fetch("/api/sofia/voice/stt", { method: "POST", body: fd });
        if (!r.ok) throw new Error(`stt ${r.status}`);
        const { text } = (await r.json()) as { text: string };
        const userText = (text || "").trim();
        if (!userText) {
          cycleBusyRef.current = false;
          if (sessionActiveRef.current) setSafeStatus("listening");
          return;
        }

        // Append user turn to shared history + live event.
        const history = loadHistory(language);
        const next: ChatMsg[] = [...history, { role: "user", content: userText, mode: "voice", ts: Date.now() }];
        saveHistory(language, next);
        notifyChatUpdated(language);
        emitTranscript({
          source: "user",
          message: userText,
          conversationId: conversationIdRef.current,
          language,
        });

        // Ask our recruiting LLM (the same one used by text chat).
        setSafeStatus("thinking");
        const chatRes = await sofiaFetch("/api/maria/recruiting/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: next, language, visitorId: getVisitorId(), mode: "voice" }),
        });
        if (!chatRes.ok || !chatRes.body) {
          throw new Error(`chat ${chatRes.status}`);
        }
        const reader = chatRes.body.getReader();
        const dec = new TextDecoder();
        let full = "";
        let sseError: string | null = null;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const d = JSON.parse(line.slice(6)) as {
                content?: string;
                done?: boolean;
                error?: string;
              };
              if (d.error) sseError = d.error;
              if (d.content) full += d.content;
            } catch {
              /* ignore */
            }
          }
        }
        if (sseError) throw new Error(`chat sse: ${sseError}`);
        const reply = full.trim();
        if (!reply) {
          // Empty assistant turn = backend failure; surface to the user
          // instead of silently returning to listening.
          throw new Error("chat empty reply");
        }
        const finalHistory: ChatMsg[] = [...next, { role: "assistant", content: reply, mode: "voice", ts: Date.now() }];
        saveHistory(language, finalHistory);
        notifyChatUpdated(language);
        emitTranscript({
          source: "ai",
          message: reply,
          conversationId: conversationIdRef.current,
          language,
        });
        if (sessionActiveRef.current) {
          await playReply(reply);
        }
      } catch (err) {
        fatal = true;
        const technical = err instanceof Error ? err.message : String(err);
        console.error("[sofia-voice] cycle error:", technical);
        if (sessionActiveRef.current) {
          // Stop the session so the recorder cannot auto-restart, release
          // the microphone immediately, and show a localized error with
          // a chat-fallback CTA.
          sessionActiveRef.current = false;
          tearDown();
          setError(t.failed);
          setSafeStatus("error");
          reportTelemetry({
            type: "error",
            lang: language,
            conversationId: conversationIdRef.current,
            message: technical,
          });
        }
      } finally {
        cycleBusyRef.current = false;
        if (!fatal && sessionActiveRef.current) {
          setSafeStatus("listening");
          startSegmentRef.current();
        }
      }
    },
    [language, playReply, reportTelemetry, setSafeStatus, t.failed, tearDown],
  );

  const finalizeSegment = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec || rec.state === "inactive") return;
    rec.onstop = () => {
      const mime = recorderMimeRef.current || "audio/webm";
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      void processSegment(blob);
    };
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  }, [processSegment]);

  const startSegment = useCallback(() => {
    if (!sessionActiveRef.current || cycleBusyRef.current) return;
    const stream = streamRef.current;
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    if (!stream || !ctx || !analyser) return;

    chunksRef.current = [];
    const mime = recorderMimeRef.current;
    let rec: MediaRecorder;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch (err) {
      console.error("[sofia-voice] recorder init failed:", err);
      setError(t.failed);
      setSafeStatus("error");
      sessionActiveRef.current = false;
      return;
    }
    recorderRef.current = rec;
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    rec.start(250);

    speakingStartRef.current = null;
    lastVoiceRef.current = 0;
    segmentStartRef.current = performance.now();

    const buf = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (!sessionActiveRef.current || recorderRef.current !== rec) return;
      analyser.getByteTimeDomainData(buf);
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      const now = performance.now();
      const elapsed = now - segmentStartRef.current;

      const muted = mutedRef.current;
      if (!muted && rms > SILENCE_THRESHOLD) {
        if (speakingStartRef.current === null) speakingStartRef.current = now;
        lastVoiceRef.current = now;
      }

      const hadSpeech =
        speakingStartRef.current !== null &&
        now - speakingStartRef.current >= MIN_SPEECH_MS;
      const silenceLongEnough =
        lastVoiceRef.current > 0 && now - lastVoiceRef.current >= SILENCE_HOLD_MS;

      if (hadSpeech && silenceLongEnough) {
        finalizeSegment();
        return;
      }
      if (elapsed >= MAX_SEGMENT_MS && hadSpeech) {
        finalizeSegment();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [finalizeSegment, setSafeStatus, t.failed]);

  // Expose startSegment via a ref so processSegment (declared earlier)
  // can restart capture without a forward `useCallback` dependency.
  useEffect(() => {
    startSegmentRef.current = startSegment;
  }, [startSegment]);

  const start = useCallback(async () => {
    setError(null);
    setSafeStatus("requesting-mic");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (err) {
      console.warn("[sofia-voice] mic denied:", err);
      setError(t.micDenied);
      setStatus("error");
      reportTelemetry({ type: "error", lang: language, message: "mic-denied" });
      return;
    }
    streamRef.current = stream;
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      setError(t.failed);
      setStatus("error");
      return;
    }
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    analyserRef.current = analyser;
    recorderMimeRef.current = pickMimeType();

    sessionActiveRef.current = true;
    startedAtRef.current = Date.now();
    reportTelemetry({
      type: "start",
      lang: language,
      conversationId: conversationIdRef.current,
    });

    // Notify the panel that we now hold a live mic / network session,
    // so it can show the "running in background" indicator on the tab.
    onActiveChange?.(true);

    // Sofia speaks first. With no prior turns we simply play the static
    // greeting. With prior history we ask the recruiting LLM to produce
    // a natural continuation grounded in the cross-mode context the
    // server already injects via priorContext — so the visitor hears a
    // personalised "welcome back" rather than a hardcoded phrase.
    try {
      const history = loadHistory(language);
      const hasPriorTurns = history.some((m) => m.role === "user")
        || history.filter((m) => m.role === "assistant").length > 1;
      let opener: string | null = null;

      if (!hasPriorTurns) {
        opener = GREETINGS[language];
      } else {
        try {
          setSafeStatus("thinking");
          const synth = CONTINUATION_PROMPTS[language];
          const resp = await sofiaFetch("/api/maria/recruiting/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: [
                ...history.map((m) => ({ role: m.role, content: m.content })),
                { role: "user", content: synth },
              ],
              language,
              visitorId: getVisitorId(),
              mode: "voice",
              // Suppress server-side journaling for the opener call:
              // the synthetic CONTINUATION_PROMPTS user message must NOT
              // be persisted as a real visitor turn, and the assistant
              // opener is journaled exactly once below via appendSofiaJournal.
              journal: false,
            }),
          });
          if (resp.ok && resp.body) {
            const reader = resp.body.getReader();
            const dec = new TextDecoder();
            let full = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = dec.decode(value);
              for (const line of chunk.split("\n")) {
                if (!line.startsWith("data: ")) continue;
                try {
                  const d = JSON.parse(line.slice(6)) as { content?: string };
                  if (d.content) full += d.content;
                } catch {
                  /* ignore */
                }
              }
            }
            opener = full.trim() || CONTINUATIONS[language];
          } else {
            opener = CONTINUATIONS[language];
          }
        } catch (err) {
          console.warn("[sofia-voice] continuation generation failed:", err);
          opener = CONTINUATIONS[language];
        }
      }

      if (opener && sessionActiveRef.current) {
        const merged = loadHistory(language);
        merged.push({ role: "assistant", content: opener, mode: "voice", ts: Date.now() });
        saveHistory(language, merged);
        notifyChatUpdated(language);
        emitTranscript({
          source: "ai",
          message: opener,
          conversationId: conversationIdRef.current,
          language,
        });
        void appendSofiaJournal({
          language,
          mode: "voice",
          role: "assistant",
          content: opener,
        });
        try {
          await playReply(opener);
        } catch (err) {
          console.warn("[sofia-voice] opener tts failed:", err);
        }
      }
    } catch (err) {
      console.warn("[sofia-voice] opener skipped:", err);
    }

    if (!sessionActiveRef.current) return;
    setSafeStatus("listening");
    startSegment();
  }, [language, onActiveChange, playReply, setSafeStatus, startSegment, t.failed, t.micDenied]);

  const end = useCallback(() => {
    if (sessionActiveRef.current) {
      const durationMs = startedAtRef.current ? Date.now() - startedAtRef.current : undefined;
      reportTelemetry({
        type: "end",
        lang: language,
        conversationId: conversationIdRef.current,
        durationMs,
      });
    }
    tearDown();
    setStatus("ended");
    onEnd?.();
  }, [language, onEnd, tearDown]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      tearDown();
    };
  }, [tearDown]);

  // Toggle mute by enabling/disabling the mic track.
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      const stream = streamRef.current;
      if (stream) stream.getAudioTracks().forEach((tr) => (tr.enabled = !next));
      return next;
    });
  }, []);

  const isLive =
    status === "listening" ||
    status === "transcribing" ||
    status === "thinking" ||
    status === "speaking" ||
    status === "requesting-mic";

  const speakerState: "user" | "sofia" | "idle" =
    status === "speaking" || status === "thinking"
      ? "sofia"
      : status === "listening" || status === "transcribing"
        ? "user"
        : "idle";

  const wrapperStyle: React.CSSProperties = useMemo(
    () =>
      contained
        ? { padding: 0 }
        : {
            padding: 20,
            borderRadius: 16,
            border: "1px solid rgba(124,58,237,0.25)",
            background: "rgba(13,13,26,0.04)",
          },
    [contained],
  );

  if (available === false) {
    return (
      <div style={wrapperStyle} data-testid="sofia-voice-unavailable">
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            color: "#9ca3af",
            fontSize: 13,
          }}
        >
          <AlertCircle size={18} />
          <div>{t.notConfigured}</div>
        </div>
        {onSwitchToChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSwitchToChat}
            data-testid="button-sofia-voice-fallback-chat"
            style={{ marginTop: 12 }}
          >
            <MessageCircle size={14} style={{ marginRight: 6 }} />
            {t.chatInstead}
          </Button>
        )}
      </div>
    );
  }

  let statusLabel = "";
  if (status === "requesting-mic") statusLabel = t.requesting;
  else if (status === "listening") statusLabel = t.listening;
  else if (status === "transcribing") statusLabel = t.transcribing;
  else if (status === "thinking") statusLabel = t.thinking;
  else if (status === "speaking") statusLabel = t.speaking;

  return (
    <div
      style={wrapperStyle}
      data-testid="sofia-voice-call"
      data-status={status}
      data-speaker={speakerState}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "inherit", marginBottom: 2 }}>
          {t.title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{t.subtitle}</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 0",
        }}
      >
        <motion.div
          animate={
            speakerState === "sofia"
              ? { scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }
              : speakerState === "user"
                ? { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }
                : { scale: 1, opacity: 0.6 }
          }
          transition={{
            duration: speakerState === "sofia" ? 0.9 : 1.6,
            repeat: isLive ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background:
              speakerState === "sofia"
                ? "linear-gradient(135deg,#7C3AED,#E879F9)"
                : speakerState === "user"
                  ? "linear-gradient(135deg,#7C3AED55,#E879F955)"
                  : "rgba(124,58,237,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            boxShadow:
              speakerState === "sofia" ? "0 0 36px rgba(232,121,249,0.55)" : "none",
          }}
          data-testid="sofia-voice-indicator"
          data-state={speakerState === "sofia" ? "speaking" : status}
        >
          {status === "requesting-mic" || status === "transcribing" || status === "thinking" ? (
            <Loader2 size={32} className="animate-spin" />
          ) : speakerState === "sofia" ? (
            <Volume2 size={32} />
          ) : muted ? (
            <MicOff size={32} />
          ) : status === "listening" ? (
            <Mic size={32} />
          ) : (
            <MicOff size={32} />
          )}
        </motion.div>
      </div>

      <div
        style={{
          textAlign: "center",
          minHeight: 20,
          fontSize: 13,
          opacity: 0.85,
          marginBottom: 16,
        }}
        data-testid="sofia-voice-status"
      >
        {statusLabel}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
              fontSize: 12,
              marginBottom: 12,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
            data-testid="sofia-voice-error"
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {!isLive ? (
          <Button
            onClick={start}
            disabled={available === null}
            data-testid="button-sofia-voice-start"
            style={{
              background: "linear-gradient(135deg,#7C3AED,#E879F9)",
              color: "#fff",
              border: "none",
            }}
          >
            <Mic size={16} style={{ marginRight: 8 }} />
            {t.start}
          </Button>
        ) : (
          <>
            <Button
              onClick={toggleMute}
              variant="outline"
              data-testid="button-sofia-voice-mute"
              data-muted={muted ? "true" : "false"}
              aria-pressed={muted}
              title={muted ? t.unmute : t.mute}
            >
              {muted ? (
                <MicOff size={16} style={{ marginRight: 8 }} />
              ) : (
                <Mic size={16} style={{ marginRight: 8 }} />
              )}
              {muted ? t.unmute : t.mute}
            </Button>
            <Button
              onClick={end}
              variant="destructive"
              data-testid="button-sofia-voice-end"
            >
              <PhoneOff size={16} style={{ marginRight: 8 }} />
              {t.end}
            </Button>
          </>
        )}
        {onSwitchToChat && !isLive && (
          <Button
            variant="outline"
            onClick={onSwitchToChat}
            data-testid="button-sofia-voice-to-chat"
          >
            <MessageCircle size={16} style={{ marginRight: 8 }} />
            {t.chatInstead}
          </Button>
        )}
      </div>
    </div>
  );
}
