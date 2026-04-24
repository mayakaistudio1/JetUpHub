/**
 * Sofia Voice Mode — ElevenLabs STT + our LLM + ElevenLabs TTS.
 *
 * Architecture (deliberate):
 *   The visitor's mic → ElevenLabs `/v1/speech-to-text` (Scribe) → our own
 *   recruiting LLM endpoint (`/api/maria/recruiting/chat`) → ElevenLabs
 *   `/v1/text-to-speech/{voice_id}` (multilingual v2). The ElevenLabs
 *   *Conversational AI* agent is intentionally NOT used: keeping the LLM
 *   on our side means the same Sofia system prompt and the same chat
 *   history power text mode, voice mode, and the avatar overlay — so the
 *   visitor sees a single unified conversation when switching modes.
 *
 * Configuration (env vars):
 *   ELEVENLABS_VOICE_ID            (required — Sofia voice id)
 *   ELEVENLABS_VOICE_ID_DE/EN/RU   (optional per-language overrides)
 *   ELEVENLABS_STT_MODEL           (default: scribe_v1)
 *   ELEVENLABS_TTS_MODEL           (default: eleven_multilingual_v2)
 *   The ElevenLabs API key is provided by the Replit `elevenlabs`
 *   connector and is never read directly here.
 *
 * Endpoints:
 *   GET  /api/sofia/voice/config?lang
 *        → { enabled, lang, voiceId, sttModel, ttsModel }
 *   POST /api/sofia/voice/stt
 *        multipart: file=<audio/webm|wav>, lang?
 *        → { text, language }
 *   POST /api/sofia/voice/tts
 *        json: { text, lang }
 *        → audio/mpeg stream
 *   POST /api/sofia/voice/event
 *        json: { type:"start"|"end"|"error", lang, conversationId?, durationMs?, message? }
 *        → { ok:true } — telemetry only, no transcript content stored.
 */

import type { Express, Request, Response } from "express";
import { ReplitConnectors } from "@replit/connectors-sdk";
import multer from "multer";

const connectors = new ReplitConnectors();

type Lang = "de" | "en" | "ru";

const DEFAULT_STT_MODEL = "scribe_v1";
const DEFAULT_TTS_MODEL = "eleven_multilingual_v2";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // ElevenLabs STT cap
});

function normalizeLang(input: unknown): Lang {
  const v = String(input || "").toLowerCase();
  if (v === "en" || v === "ru") return v;
  return "de";
}

function pickVoiceId(lang: Lang): string | undefined {
  const key = lang === "ru" ? "RU" : lang === "en" ? "EN" : "DE";
  return (
    process.env[`ELEVENLABS_VOICE_ID_${key}`] ||
    process.env.ELEVENLABS_VOICE_ID ||
    undefined
  );
}

function sttModel(): string {
  return process.env.ELEVENLABS_STT_MODEL || DEFAULT_STT_MODEL;
}
function ttsModel(): string {
  return process.env.ELEVENLABS_TTS_MODEL || DEFAULT_TTS_MODEL;
}

interface VoiceEventBody {
  type?: "start" | "end" | "error";
  lang?: string;
  conversationId?: string;
  durationMs?: number;
  message?: string;
}

export function registerElevenLabsVoiceRoutes(app: Express): void {
  app.get("/api/sofia/voice/config", (req: Request, res: Response) => {
    const lang = normalizeLang(req.query.lang);
    const voiceId = pickVoiceId(lang);
    res.json({
      enabled: !!voiceId,
      lang,
      voiceId: voiceId || null,
      sttModel: sttModel(),
      ttsModel: ttsModel(),
    });
  });

  // ---- Speech to text ------------------------------------------------------
  app.post(
    "/api/sofia/voice/stt",
    upload.single("file"),
    async (req: Request, res: Response) => {
      const lang = normalizeLang(req.body?.lang);
      const file = (req as Request & { file?: Express.Multer.File }).file;
      if (!file) {
        return res.status(400).json({ error: "missing audio file" });
      }
      try {
        const form = new FormData();
        const blob = new Blob([new Uint8Array(file.buffer)], {
          type: file.mimetype || "audio/webm",
        });
        form.append("file", blob, file.originalname || "speech.webm");
        form.append("model_id", sttModel());
        form.append("language_code", lang);

        const response = await connectors.proxy(
          "elevenlabs",
          "/v1/speech-to-text",
          { method: "POST", body: form },
        );
        const text = await response.text();
        if (!response.ok) {
          console.error("[sofia-voice][stt] failed:", response.status, text);
          return res
            .status(502)
            .json({ error: "STT failed", status: response.status, details: text });
        }
        const json = JSON.parse(text);
        res.json({
          text: typeof json?.text === "string" ? json.text : "",
          language: json?.language_code || lang,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[sofia-voice][stt] error:", msg);
        res.status(500).json({ error: "stt internal error", details: msg });
      }
    },
  );

  // ---- Text to speech ------------------------------------------------------
  app.post("/api/sofia/voice/tts", async (req: Request, res: Response) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const lang = normalizeLang(req.body?.lang);
    const voiceId = pickVoiceId(lang);
    if (!text) return res.status(400).json({ error: "missing text" });
    if (!voiceId) {
      return res.status(503).json({ error: "voice id not configured", lang });
    }
    try {
      const path = `/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`;
      const response = await connectors.proxy("elevenlabs", path, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          text,
          model_id: ttsModel(),
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.75,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.error("[sofia-voice][tts] failed:", response.status, detail);
        return res
          .status(502)
          .json({ error: "TTS failed", status: response.status, details: detail });
      }

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "no-store");
      const buf = Buffer.from(await response.arrayBuffer());
      res.send(buf);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[sofia-voice][tts] error:", msg);
      res.status(500).json({ error: "tts internal error", details: msg });
    }
  });

  // ---- Telemetry (no transcript content) -----------------------------------
  app.post("/api/sofia/voice/event", (req: Request, res: Response) => {
    const body = (req.body || {}) as VoiceEventBody;
    const type = body.type;
    if (type !== "start" && type !== "end" && type !== "error") {
      return res.status(400).json({ error: "invalid event type" });
    }
    const lang = normalizeLang(body.lang);
    const conversationId =
      typeof body.conversationId === "string"
        ? body.conversationId.slice(0, 64)
        : undefined;
    const durationMs =
      typeof body.durationMs === "number" && Number.isFinite(body.durationMs)
        ? Math.max(0, Math.round(body.durationMs))
        : undefined;
    const message =
      typeof body.message === "string" ? body.message.slice(0, 240) : undefined;

    console.log(
      `[sofia-voice][telemetry] type=${type} lang=${lang}` +
        (conversationId ? ` conv=${conversationId}` : "") +
        (durationMs !== undefined ? ` durationMs=${durationMs}` : "") +
        (type === "error" && message ? ` error="${message}"` : ""),
    );
    res.json({ ok: true });
  });
}
