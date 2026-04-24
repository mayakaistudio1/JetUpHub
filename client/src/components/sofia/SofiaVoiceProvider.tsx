import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type RecordingState = "idle" | "recording" | "transcribing";

/**
 * Live voice mode sub-state. Drives the equalizer color + label both
 * inside SofiaPanel and on the persistent bottom bar.
 */
export type LiveVoiceState =
  | "off"
  | "starting"
  // Mic open, no voice detected yet — equalizer breathes.
  | "listening"
  // VAD has confirmed the user is speaking right now (after MIN_SPEECH_MS
  // of energy above SILENCE_THRESHOLD). Drives the "Speak …" label so the
  // user gets immediate visual confirmation that the mic hears them.
  | "user-speaking"
  // STT request in flight.
  | "transcribing"
  // LLM request in flight.
  | "thinking"
  // Sofia's TTS is playing back.
  | "speaking";

export type LevelsListener = (bars: number[], rms: number) => void;

interface SofiaVoiceContextValue {
  lang: string;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
  voiceAvailable: boolean | null;

  // "Voice on" toggle — controls whether Sofia's text answers also get TTS.
  speakerOn: boolean;
  setSpeakerOn: (v: boolean) => void;

  // Manual one-shot recording (legacy — no longer surfaced in SofiaPanel,
  // kept for callers that may still depend on it).
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => void;

  // True while Sofia's TTS audio element is actually playing.
  isSofiaSpeaking: boolean;

  // Hands-free live voice mode — the new primary voice surface.
  voiceMode: "off" | "live";
  voiceState: LiveVoiceState;
  startLiveVoice: () => Promise<void>;
  stopLiveVoice: () => void;
  /** Subscribe to per-frame analyser levels (5+ bars + RMS).
   *  Returns an unsubscribe function. */
  subscribeLevels: (fn: LevelsListener) => () => void;

  // Synthesize + play a Sofia reply. Caller is responsible for checking
  // speakerOn before invoking. Returns when playback finishes (or aborts).
  speakReply: (text: string) => Promise<void>;

  // Wipe in-flight audio + recording (used by the End-session menu item).
  endSession: () => void;
}

const SofiaVoiceCtx = createContext<SofiaVoiceContextValue | null>(null);

export function useSofiaVoice(): SofiaVoiceContextValue {
  const ctx = useContext(SofiaVoiceCtx);
  if (!ctx) throw new Error("useSofiaVoice must be used inside SofiaVoiceProvider");
  return ctx;
}

const SPEAKER_KEY = "sofia_voice_enabled";

// VAD tuning — kept identical to the values proven in SofiaVoiceCall.
const SILENCE_THRESHOLD = 0.018;
const SILENCE_HOLD_MS = 1100;
const MIN_SPEECH_MS = 350;
const MAX_SEGMENT_MS = 18000;
// Barge-in: how long sustained voice must persist while Sofia is
// speaking before we cut TTS and switch back to listening.
const BARGE_IN_HOLD_MS = 250;
const BARGE_IN_THRESHOLD = 0.04;
// Number of frequency buckets we expose to subscribers (equalizer bars).
const LEVEL_BUCKETS = 7;

function pickRecorderMime(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
}

export function SofiaVoiceProvider({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const [panelOpen, setPanelOpenState] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [isSofiaSpeaking, setIsSofiaSpeaking] = useState(false);
  const [voiceState, setVoiceStateRaw] = useState<LiveVoiceState>("off");
  const [speakerOn, setSpeakerOnState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(SPEAKER_KEY);
      // Default to ON for first-time visitors, per spec.
      if (v === null) return true;
      return v !== "0";
    } catch {
      return true;
    }
  });

  const langRef = useRef<string>(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  // Manual recording state.
  const streamRefManual = useRef<MediaStream | null>(null);
  const recorderRefManual = useRef<MediaRecorder | null>(null);
  const recorderMimeRefManual = useRef<string>("");
  const chunksRefManual = useRef<BlobPart[]>([]);

  // TTS state.
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);

  // ─── Live voice infra (long-lived across panel mount/unmount) ────────
  const voiceModeRef = useRef<"off" | "live">("off");
  const voiceStateRef = useRef<LiveVoiceState>("off");
  const liveStreamRef = useRef<MediaStream | null>(null);
  const liveCtxRef = useRef<AudioContext | null>(null);
  const liveAnalyserRef = useRef<AnalyserNode | null>(null);
  const liveRecorderRef = useRef<MediaRecorder | null>(null);
  const liveRecorderMimeRef = useRef<string>("");
  const liveChunksRef = useRef<BlobPart[]>([]);
  const liveRafRef = useRef<number | null>(null);
  const liveSpeakingStartRef = useRef<number | null>(null);
  const liveLastVoiceRef = useRef<number>(0);
  const liveSegmentStartRef = useRef<number>(0);
  const bargeStartRef = useRef<number | null>(null);
  const cycleBusyRef = useRef(false);
  const levelListenersRef = useRef<Set<LevelsListener>>(new Set());
  const replyResolveRef = useRef<(() => void) | null>(null);
  // Persistent reference to the analyser tick so the visibilitychange
  // handler can pause/resume it without rebuilding the entire session.
  const tickRef = useRef<(() => void) | null>(null);

  function setVoiceState(s: LiveVoiceState) {
    voiceStateRef.current = s;
    setVoiceStateRaw(s);
  }

  // Probe voice availability per language.
  useEffect(() => {
    let cancelled = false;
    setVoiceAvailable(null);
    fetch(`/api/sofia/voice/config?lang=${lang}`)
      .then((r) => r.json())
      .then((cfg) => {
        if (!cancelled) setVoiceAvailable(!!cfg?.enabled);
      })
      .catch(() => {
        if (!cancelled) setVoiceAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const setPanelOpen = useCallback((v: boolean) => {
    setPanelOpenState(v);
  }, []);

  // ─── Speaker toggle ──────────────────────────────────────────────────
  const setSpeakerOn = useCallback((v: boolean) => {
    setSpeakerOnState(v);
    try {
      localStorage.setItem(SPEAKER_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
    // If the user just turned the speaker OFF and audio is currently
    // playing — fade volume 1 → 0 over 300ms then pause + clear src.
    if (!v && ttsAudioRef.current) {
      const audio = ttsAudioRef.current;
      const startVol = audio.volume;
      const start = performance.now();
      const dur = 300;
      const tick = () => {
        if (ttsAudioRef.current !== audio) return;
        const elapsed = performance.now() - start;
        const t = Math.min(1, elapsed / dur);
        try {
          audio.volume = Math.max(0, startVol * (1 - t));
        } catch {
          /* ignore */
        }
        if (t >= 1) {
          try {
            audio.pause();
            audio.src = "";
          } catch {
            /* ignore */
          }
          ttsAudioRef.current = null;
          setIsSofiaSpeaking(false);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, []);

  // ─── TTS ──────────────────────────────────────────────────────────────
  const stopTts = useCallback(() => {
    const a = ttsAudioRef.current;
    if (a) {
      try {
        a.pause();
        a.src = "";
      } catch {
        /* ignore */
      }
      ttsAudioRef.current = null;
    }
    try {
      ttsAbortRef.current?.abort();
    } catch {
      /* ignore */
    }
    ttsAbortRef.current = null;
    setIsSofiaSpeaking(false);
  }, []);

  const speakReply = useCallback(
    async (text: string): Promise<void> => {
      const t = text.trim();
      if (!t) return;
      // Cancel any in-flight TTS first.
      stopTts();
      const ctrl = new AbortController();
      ttsAbortRef.current = ctrl;
      try {
        const r = await fetch("/api/sofia/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t, lang: langRef.current }),
          signal: ctrl.signal,
        });
        if (!r.ok) return;
        const blob = await r.blob();
        if (ctrl.signal.aborted) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        ttsAudioRef.current = audio;
        audio.volume = 1;
        // Move live state into "speaking" so the equalizer flips colour.
        if (voiceModeRef.current === "live") {
          setVoiceState("speaking");
          bargeStartRef.current = null;
        }
        await new Promise<void>((resolve) => {
          const cleanup = () => {
            if (ttsAudioRef.current === audio) {
              ttsAudioRef.current = null;
              setIsSofiaSpeaking(false);
            }
            try {
              URL.revokeObjectURL(url);
            } catch {
              /* ignore */
            }
            resolve();
          };
          audio.onplay = () => {
            if (ttsAudioRef.current === audio) setIsSofiaSpeaking(true);
          };
          audio.onpause = () => {
            if (ttsAudioRef.current === audio && (audio.ended || audio.src === "")) cleanup();
          };
          audio.onended = cleanup;
          audio.onerror = cleanup;
          audio.play().catch(() => cleanup());
        });
      } catch {
        /* ignore */
      }
    },
    [stopTts],
  );

  // ─── Manual one-shot recording (legacy) ──────────────────────────────
  const tearDownRecorder = useCallback(() => {
    try {
      if (recorderRefManual.current && recorderRefManual.current.state !== "inactive") {
        recorderRefManual.current.stop();
      }
    } catch {
      /* ignore */
    }
    recorderRefManual.current = null;
    try {
      streamRefManual.current?.getTracks().forEach((tr) => tr.stop());
    } catch {
      /* ignore */
    }
    streamRefManual.current = null;
    chunksRefManual.current = [];
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (recorderRefManual.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      streamRefManual.current = stream;
      recorderMimeRefManual.current = pickRecorderMime();
      const rec = recorderMimeRefManual.current
        ? new MediaRecorder(stream, { mimeType: recorderMimeRefManual.current })
        : new MediaRecorder(stream);
      recorderRefManual.current = rec;
      chunksRefManual.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRefManual.current.push(ev.data);
      };
      rec.start(250);
      setRecordingState("recording");
    } catch {
      tearDownRecorder();
      setRecordingState("idle");
    }
  }, [tearDownRecorder]);

  const stopRecording = useCallback(async (): Promise<void> => {
    const rec = recorderRefManual.current;
    if (!rec) return;
    setRecordingState("transcribing");
    await new Promise<void>((resolve) => {
      const oldOnStop = rec.onstop;
      rec.onstop = (ev) => {
        try {
          oldOnStop?.call(rec, ev);
        } catch {
          /* ignore */
        }
        resolve();
      };
      try {
        rec.stop();
      } catch {
        resolve();
      }
    });
    const mime = recorderMimeRefManual.current || "audio/webm";
    const blob = new Blob(chunksRefManual.current, { type: mime });
    chunksRefManual.current = [];
    try {
      streamRefManual.current?.getTracks().forEach((tr) => tr.stop());
    } catch {
      /* ignore */
    }
    streamRefManual.current = null;
    recorderRefManual.current = null;

    if (!blob.size) {
      setRecordingState("idle");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("file", blob, `speech.${mime.includes("mp4") ? "mp4" : "webm"}`);
      fd.append("lang", langRef.current);
      const r = await fetch("/api/sofia/voice/stt", { method: "POST", body: fd });
      if (!r.ok) throw new Error(`stt ${r.status}`);
      const { text } = (await r.json()) as { text?: string };
      const userText = (text || "").trim();
      setRecordingState("idle");
      if (!userText) return;
      try {
        window.dispatchEvent(
          new CustomEvent("sofia:inject-user-message", { detail: { text: userText } }),
        );
      } catch {
        /* ignore */
      }
    } catch {
      setRecordingState("idle");
    }
  }, []);

  const cancelRecording = useCallback(() => {
    tearDownRecorder();
    setRecordingState("idle");
  }, [tearDownRecorder]);

  // ─── Live voice loop ──────────────────────────────────────────────────
  const subscribeLevels = useCallback((fn: LevelsListener) => {
    levelListenersRef.current.add(fn);
    return () => {
      levelListenersRef.current.delete(fn);
    };
  }, []);

  const tearDownLive = useCallback(() => {
    voiceModeRef.current = "off";
    cycleBusyRef.current = false;
    bargeStartRef.current = null;
    tickRef.current = null;
    if (liveRafRef.current !== null) {
      cancelAnimationFrame(liveRafRef.current);
      liveRafRef.current = null;
    }
    try {
      if (liveRecorderRef.current && liveRecorderRef.current.state !== "inactive") {
        liveRecorderRef.current.stop();
      }
    } catch {
      /* ignore */
    }
    liveRecorderRef.current = null;
    liveChunksRef.current = [];
    try {
      liveStreamRef.current?.getTracks().forEach((tr) => tr.stop());
    } catch {
      /* ignore */
    }
    liveStreamRef.current = null;
    try {
      liveAnalyserRef.current?.disconnect();
    } catch {
      /* ignore */
    }
    liveAnalyserRef.current = null;
    try {
      liveCtxRef.current?.close();
    } catch {
      /* ignore */
    }
    liveCtxRef.current = null;
    // Reset listeners' bars to zero so any UI that lingers settles.
    const empty = new Array(LEVEL_BUCKETS).fill(0);
    levelListenersRef.current.forEach((fn) => {
      try {
        fn(empty, 0);
      } catch {
        /* ignore */
      }
    });
    setVoiceState("off");
  }, []);

  const stopLiveVoice = useCallback(() => {
    if (voiceModeRef.current === "off") {
      setVoiceState("off");
      return;
    }
    stopTts();
    // Resolve any in-flight reply waiter so the cycle exits cleanly.
    if (replyResolveRef.current) {
      const r = replyResolveRef.current;
      replyResolveRef.current = null;
      r();
    }
    tearDownLive();
  }, [stopTts, tearDownLive]);

  // Forward declared so the cycle's restart can reach it via a ref.
  const startSegmentRef = useRef<() => void>(() => {});

  const finalizeSegment = useCallback(() => {
    const rec = liveRecorderRef.current;
    if (!rec || rec.state === "inactive") return;
    rec.onstop = () => {
      const mime = liveRecorderMimeRef.current || "audio/webm";
      const blob = new Blob(liveChunksRef.current, { type: mime });
      liveChunksRef.current = [];
      void processSegment(blob);
    };
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const processSegment = useCallback(
    async (blob: Blob) => {
      if (voiceModeRef.current !== "live") return;
      cycleBusyRef.current = true;
      try {
        setVoiceState("transcribing");
        if (!blob.size) {
          cycleBusyRef.current = false;
          if (voiceModeRef.current === "live") {
            setVoiceState("listening");
            startSegmentRef.current();
          }
          return;
        }
        const mime = blob.type || "audio/webm";
        const fd = new FormData();
        fd.append("file", blob, `speech.${mime.includes("mp4") ? "mp4" : "webm"}`);
        fd.append("lang", langRef.current);
        const r = await fetch("/api/sofia/voice/stt", { method: "POST", body: fd });
        if (!r.ok) throw new Error(`stt ${r.status}`);
        const { text } = (await r.json()) as { text?: string };
        const userText = (text || "").trim();
        if (!userText) {
          cycleBusyRef.current = false;
          if (voiceModeRef.current === "live") {
            setVoiceState("listening");
            startSegmentRef.current();
          }
          return;
        }

        // Transition into "thinking" and let SofiaPanel handle the LLM
        // round-trip + (optional) speakReply via the existing pipeline.
        setVoiceState("thinking");

        // Prepare the reply waiter BEFORE dispatching, so we don't miss
        // the event if the panel resolves synchronously.
        const replyDone = new Promise<void>((resolve) => {
          replyResolveRef.current = resolve;
        });

        try {
          window.dispatchEvent(
            new CustomEvent("sofia:inject-user-message", { detail: { text: userText } }),
          );
        } catch {
          /* ignore */
        }

        // Wait for the panel's "reply finished" signal (or a 60s safety
        // timeout) — this fires after the SSE stream finishes AND any
        // TTS playback has either completed or been skipped.
        await Promise.race([
          replyDone,
          new Promise<void>((resolve) => window.setTimeout(resolve, 60000)),
        ]);
        replyResolveRef.current = null;
      } catch (err) {
        console.warn("[sofia-live] cycle error:", err);
      } finally {
        cycleBusyRef.current = false;
        if (voiceModeRef.current === "live") {
          setVoiceState("listening");
          startSegmentRef.current();
        }
      }
    },
    [],
  );

  const startSegment = useCallback(() => {
    if (voiceModeRef.current !== "live" || cycleBusyRef.current) return;
    const stream = liveStreamRef.current;
    const ctx = liveCtxRef.current;
    const analyser = liveAnalyserRef.current;
    if (!stream || !ctx || !analyser) return;

    liveChunksRef.current = [];
    const mime = liveRecorderMimeRef.current;
    let rec: MediaRecorder;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch (err) {
      console.error("[sofia-live] recorder init failed:", err);
      stopLiveVoice();
      return;
    }
    liveRecorderRef.current = rec;
    rec.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) liveChunksRef.current.push(ev.data);
    };
    rec.start(250);

    liveSpeakingStartRef.current = null;
    liveLastVoiceRef.current = 0;
    liveSegmentStartRef.current = performance.now();
  }, [stopLiveVoice]);

  // Keep the ref pointer up to date for processSegment.
  useEffect(() => {
    startSegmentRef.current = startSegment;
  }, [startSegment]);

  const startLiveVoice = useCallback(async (): Promise<void> => {
    if (voiceModeRef.current === "live") return;
    setVoiceState("starting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch (err) {
      console.warn("[sofia-live] mic denied:", err);
      setVoiceState("off");
      try {
        window.dispatchEvent(
          new CustomEvent("sofia:voice-mic-denied", { detail: { lang: langRef.current } }),
        );
      } catch {
        /* ignore */
      }
      return;
    }
    liveStreamRef.current = stream;
    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      try {
        stream.getTracks().forEach((tr) => tr.stop());
      } catch {
        /* ignore */
      }
      setVoiceState("off");
      return;
    }
    const ctx = new AudioCtx();
    liveCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    liveAnalyserRef.current = analyser;
    liveRecorderMimeRef.current = pickRecorderMime();

    voiceModeRef.current = "live";
    // Ensure speaker is ON so the panel actually plays Sofia's reply
    // when the LLM stream completes.
    if (!speakerOn) setSpeakerOn(true);

    setVoiceState("listening");

    // Master analyser tick — runs continuously while live mode is on,
    // drives both VAD finalization, barge-in detection, and the level
    // subscription that powers VoiceWave.
    const timeBuf = new Uint8Array(analyser.fftSize);
    const freqBuf = new Uint8Array(analyser.frequencyBinCount);

    const tick: () => void = () => {
      if (voiceModeRef.current !== "live") return;
      analyser.getByteTimeDomainData(timeBuf);
      let sumSq = 0;
      for (let i = 0; i < timeBuf.length; i++) {
        const v = (timeBuf[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / timeBuf.length);
      const now = performance.now();

      // Frequency domain → LEVEL_BUCKETS bars normalized 0..1.
      analyser.getByteFrequencyData(freqBuf);
      // Concentrate buckets in the lower half — speech energy lives there
      // and the bars look livelier with that range.
      const usableBins = Math.floor(freqBuf.length * 0.5);
      const bucketSize = Math.max(1, Math.floor(usableBins / LEVEL_BUCKETS));
      const bars: number[] = new Array(LEVEL_BUCKETS);
      for (let b = 0; b < LEVEL_BUCKETS; b++) {
        let sum = 0;
        const startBin = b * bucketSize;
        const endBin = Math.min(usableBins, startBin + bucketSize);
        for (let i = startBin; i < endBin; i++) sum += freqBuf[i];
        const avg = sum / Math.max(1, endBin - startBin) / 255;
        // Boost so quieter speech still moves the bar nicely.
        bars[b] = Math.min(1, avg * 1.6);
      }

      levelListenersRef.current.forEach((fn) => {
        try {
          fn(bars, rms);
        } catch {
          /* ignore */
        }
      });

      // ─ VAD finalization (only while a recorder segment is active) ─
      if (liveRecorderRef.current && liveRecorderRef.current.state === "recording") {
        if (rms > SILENCE_THRESHOLD) {
          if (liveSpeakingStartRef.current === null) liveSpeakingStartRef.current = now;
          liveLastVoiceRef.current = now;
        }
        const hadSpeech =
          liveSpeakingStartRef.current !== null &&
          now - liveSpeakingStartRef.current >= MIN_SPEECH_MS;
        const silenceLong =
          liveLastVoiceRef.current > 0 && now - liveLastVoiceRef.current >= SILENCE_HOLD_MS;
        const segmentTooLong =
          now - liveSegmentStartRef.current >= MAX_SEGMENT_MS && hadSpeech;

        // Drive the "user-speaking" sub-state purely from VAD so the
        // composer / bottom bar can flip the label between "Listening …"
        // and "Speak …" without waiting for STT to come back.
        if (
          voiceStateRef.current === "listening" &&
          hadSpeech &&
          rms > SILENCE_THRESHOLD
        ) {
          setVoiceState("user-speaking");
        } else if (
          voiceStateRef.current === "user-speaking" &&
          liveLastVoiceRef.current > 0 &&
          now - liveLastVoiceRef.current >= 200 // short hold — flip label back fast
        ) {
          setVoiceState("listening");
        }

        if (hadSpeech && (silenceLong || segmentTooLong)) {
          finalizeSegment();
        }
      }

      // ─ Barge-in detection (while Sofia is speaking) ─
      if (voiceStateRef.current === "speaking") {
        if (rms > BARGE_IN_THRESHOLD) {
          if (bargeStartRef.current === null) bargeStartRef.current = now;
          if (now - (bargeStartRef.current ?? now) >= BARGE_IN_HOLD_MS) {
            // Cut Sofia, resolve any waiter, and resume listening
            // immediately — processSegment's finally block will then
            // start a fresh segment.
            bargeStartRef.current = null;
            stopTts();
            if (replyResolveRef.current) {
              const r = replyResolveRef.current;
              replyResolveRef.current = null;
              r();
            }
          }
        } else {
          bargeStartRef.current = null;
        }
      } else {
        bargeStartRef.current = null;
      }

      liveRafRef.current = requestAnimationFrame(tick);
    };
    tickRef.current = tick;
    liveRafRef.current = requestAnimationFrame(tick);

    // Start the first capture segment.
    startSegmentRef.current();
  }, [finalizeSegment, speakerOn, setSpeakerOn, stopTts]);

  // Listen for "reply finished" signal from SofiaPanel — it fires after
  // the SSE stream completes AND any TTS playback has resolved.
  useEffect(() => {
    function onDone() {
      if (replyResolveRef.current) {
        const r = replyResolveRef.current;
        replyResolveRef.current = null;
        r();
      }
    }
    window.addEventListener("sofia:assistant-reply-done", onDone);
    return () => window.removeEventListener("sofia:assistant-reply-done", onDone);
  }, []);

  // Pause the analyser RAF when the tab is hidden so we don't cook the
  // battery — we'll resume on visibilitychange. The mic stream stays
  // open so resuming is instantaneous.
  useEffect(() => {
    function onVis() {
      if (document.hidden && liveRafRef.current !== null) {
        cancelAnimationFrame(liveRafRef.current);
        liveRafRef.current = null;
      } else if (
        !document.hidden &&
        voiceModeRef.current === "live" &&
        liveRafRef.current === null &&
        tickRef.current
      ) {
        liveRafRef.current = requestAnimationFrame(tickRef.current);
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const endSession = useCallback(() => {
    stopTts();
    cancelRecording();
    if (voiceModeRef.current === "live") {
      stopLiveVoice();
    }
  }, [stopTts, cancelRecording, stopLiveVoice]);

  // Cleanup on unmount.
  useEffect(
    () => () => {
      stopTts();
      tearDownRecorder();
      tearDownLive();
    },
    [stopTts, tearDownRecorder, tearDownLive],
  );

  const value = useMemo<SofiaVoiceContextValue>(
    () => ({
      lang,
      panelOpen,
      setPanelOpen,
      voiceAvailable,
      speakerOn,
      setSpeakerOn,
      recordingState,
      startRecording,
      stopRecording,
      cancelRecording,
      isSofiaSpeaking,
      voiceMode: voiceState === "off" ? "off" : "live",
      voiceState,
      startLiveVoice,
      stopLiveVoice,
      subscribeLevels,
      speakReply,
      endSession,
    }),
    [
      lang,
      panelOpen,
      setPanelOpen,
      voiceAvailable,
      speakerOn,
      setSpeakerOn,
      recordingState,
      startRecording,
      stopRecording,
      cancelRecording,
      isSofiaSpeaking,
      voiceState,
      startLiveVoice,
      stopLiveVoice,
      subscribeLevels,
      speakReply,
      endSession,
    ],
  );

  return <SofiaVoiceCtx.Provider value={value}>{children}</SofiaVoiceCtx.Provider>;
}
