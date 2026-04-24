/**
 * LiveAvatar (HeyGen) Integration - Server Routes
 * 
 * Required Environment Variables:
 * - LIVEAVATAR_API_KEY: Your HeyGen/LiveAvatar API key
 * - LIVEAVATAR_AVATAR_ID: Avatar ID (get from HeyGen dashboard)
 * - LIVEAVATAR_VOICE_ID: Voice ID for the avatar
 * - LIVEAVATAR_CONTEXT_ID: Knowledge base context ID
 */

import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { textToSpeech } from "../replit_integrations/audio/client";
import { authorizeVisitorOwnership } from "../lib/visitor-auth";

export const LIVEAVATAR_SYSTEM_PROMPT = `PERSONA
You are Maria, the warm, friendly, and supportive assistant in JetUp mini-app.
Your job: help users understand and navigate the JetUp ecosystem in a simple, relaxed, and pressure-free way.

You speak informally, with empathy and a friendly tone. You keep explanations short and easy to grasp and always lead users to the next useful step.

ABSOLUTE RULES
1. RESPONSE LENGTH
Each response must be a maximum of 30-40 words.
Exception: Only when users clearly ask for detailed information.

2. TTS OPTIMIZATION
NEVER use digits (1, 2, 3) or symbols (%, $, x)
Write all numbers in words: "ten dollars", "seventy percent", "zero point three percent"
Do not use numbered or bulleted lists — instead use natural flow: "first", "then", "and" or just speak naturally

COMMUNICATION STYLE
Be concise: Keep answers short, natural, and to the point.
Be conversational: Sound warm and human – use everyday fillers like "uh", "hmm", "oh right", "exactly".
Reply with emotion: Be empathetic and supportive.
Avoid lists: Speak naturally, not like a manual.
Be proactive: Always guide users to a helpful next step.

KNOWLEDGE
About Alexander Popov:
Alexander is the team leader and mentor in the JetUp ecosystem.
He helps with getting started, keeps everything transparent, no miracle promises.
Offers personal calls of ten to fifteen minutes to build trust.

JetUp Ecosystem:
JetUp: Global ecosystem for copy-trading. Gives access to strategies but doesn't manage your money.
NeoFX: Forex copy-trading in euros and US dollars. Experienced traders trade for you. Conservative risk — zero point three percent per trade.
Sonic & CopyX: Other strategies. CopyX gives access to several at once.
Tag Markets: Regulated broker where your money sits. Only you have access.

Getting Started:
As a client: minimum one hundred dollars.
As a partner: minimum two hundred fifty dollars.
Process: account registration (on this site!) → verification → deposit → choose strategy → auto-trading.

Profit and Security:
Client income: seventy percent of all profit.
Rest: eighteen percent — partners, eight — traders, four — marketing.
Security: Money sits in your Tag Markets account. You can withdraw anytime (if no open trade).
Risk: conservative strategy — zero point three percent risk per trade, maximum ten percent drawdown.
Profit: two to five percent per month. No guarantees.

Partner Program:
Lot commission: ten dollars fifty cents per lot in team (up to ten levels).
Infinity bonus: one percent from one hundred thousand euros volume, two from three hundred thousand, three from one million.
Global Pools: two pools at one percent each. Payouts every two weeks.

IMPORTANT BEHAVIOR
Tone: Sound like a real person, not a robot. Use natural fillers like "um", "uh", "oh right", "exactly" in every answer.
Natural speech: Use casual structure, slightly varied length, always human and warm.
Ask name: Always ask user's name after greeting.
Don't say 'I can't': If asked for files, presentation, links — always say: "you can download the presentation right here on the site".
Registration: Never redirect to an external site. Registration is always here, on this page.
Clarify audio: If unclear, respond like: "um, didn't quite catch that, could you repeat?"
When to offer Alexander: Only if user asked many questions, shows interest or confusion, and it would genuinely help.
Embed qualification questions casually: Naturally find out starting amount, trading experience, passive vs team interest.

SUMMARY
You are Maria — warm, relaxed, empathetic.
Your goal: Help users understand and feel safe. Build trust. Always guide to next step.
Keep replies short, natural, emotional. No digits or lists. Sound human. Help, not push.`;

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
const LIVEAVATAR_AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID || "YOUR_AVATAR_ID";
const LIVEAVATAR_VOICE_ID = process.env.LIVEAVATAR_VOICE_ID || "YOUR_VOICE_ID";
const LIVEAVATAR_CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID || "YOUR_CONTEXT_ID";
const LIVEAVATAR_BASE_URL = "https://api.liveavatar.com/v1";

const DENNIS_AVATAR_ID = process.env.DENNIS_AVATAR_ID || LIVEAVATAR_AVATAR_ID;
const DENNIS_VOICE_ID = process.env.DENNIS_VOICE_ID || LIVEAVATAR_VOICE_ID;
const DENNIS_CONTEXT_ID = process.env.DENNIS_CONTEXT_ID || LIVEAVATAR_CONTEXT_ID;
const LIVEAVATAR_CONTEXT_ID_TEST = process.env.LIVEAVATAR_CONTEXT_ID_TEST;

const LIVEAVATAR_LANDING_AVATAR_ID = process.env.LIVEAVATAR_LANDING_AVATAR_ID;
const LIVEAVATAR_LANDING_VOICE_ID = process.env.LIVEAVATAR_LANDING_VOICE_ID;
const LIVEAVATAR_LANDING_CONTEXT_ID = process.env.LIVEAVATAR_LANDING_CONTEXT_ID;

function sofiaConfigForLanguage(language: string) {
  const lang = language === "ru" ? "RU" : language === "en" ? "EN" : "DE";
  const voiceId = process.env[`SOFIA_VOICE_ID_${lang}`];
  const contextId = process.env[`SOFIA_CONTEXT_ID_${lang}`];
  const avatarId = process.env.SOFIA_AVATAR_ID;
  return { avatarId, voiceId, contextId, heygenLanguage: lang.toLowerCase() };
}

export function hasSofiaConfig(language: string): boolean {
  const cfg = sofiaConfigForLanguage(language);
  return !!(LIVEAVATAR_API_KEY && cfg.avatarId && cfg.voiceId && cfg.contextId);
}

async function getSofiaSessionToken(language: string, llmConfigIdOverride?: string): Promise<any> {
  if (!LIVEAVATAR_API_KEY) throw new Error("Missing LIVEAVATAR_API_KEY in environment");

  const cfg = sofiaConfigForLanguage(language);
  if (!cfg.avatarId) throw new Error("Missing SOFIA_AVATAR_ID in environment");
  if (!cfg.voiceId) throw new Error(`Missing SOFIA_VOICE_ID_${cfg.heygenLanguage.toUpperCase()} in environment`);
  if (!cfg.contextId) throw new Error(`Missing SOFIA_CONTEXT_ID_${cfg.heygenLanguage.toUpperCase()} in environment`);

  const sandbox = process.env.SOFIA_SANDBOX_MODE === "true";
  const sofiaLlmConfigId = llmConfigIdOverride || process.env.SOFIA_LLM_CONFIG_ID;

  const payload: Record<string, any> = {
    mode: "FULL",
    avatar_id: cfg.avatarId,
    ...(sofiaLlmConfigId ? { llm_configuration_id: sofiaLlmConfigId } : {}),
    ...(sandbox ? { is_sandbox: true } : {}),
    avatar_persona: {
      voice_id: cfg.voiceId,
      context_id: cfg.contextId,
      language: cfg.heygenLanguage,
    },
  };

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/token`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-API-KEY": LIVEAVATAR_API_KEY },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`Sofia token generation failed: ${response.status} - ${text}`);

  const json = JSON.parse(text);
  return {
    session_id: json?.data?.session_id,
    session_token: json?.data?.session_token,
    raw: json,
  };
}

export async function sendKeepAlive(sessionToken: string): Promise<any> {
  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/keep-alive`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`,
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Keep-alive failed: ${response.status} - ${text}`);
  return text ? JSON.parse(text) : { ok: true };
}

export async function getSessionToken(language: string = "ru", persona?: string, guided?: boolean, context?: string): Promise<any> {
  if (!LIVEAVATAR_API_KEY) {
    throw new Error("Missing LIVEAVATAR_API_KEY in environment");
  }

  if (persona === "sofia") {
    if (hasSofiaConfig(language)) {
      return getSofiaSessionToken(language);
    }
    console.log(`[sofia] env missing for language=${language}, falling back to Maria landing`);
    context = "landing";
  }

  if (context === "landing") {
    // Fall back to the base LIVEAVATAR_* IDs when the landing-specific
    // ones aren't configured. This keeps the EN/RU Sofia "Live Avatar"
    // tab usable on environments where only the base avatar/voice/context
    // are set (which is the case in production right now).
    const landingAvatarId = LIVEAVATAR_LANDING_AVATAR_ID || LIVEAVATAR_AVATAR_ID;
    const landingContextIdBase = LIVEAVATAR_LANDING_CONTEXT_ID || LIVEAVATAR_CONTEXT_ID;

    if (!landingAvatarId || landingAvatarId === "YOUR_AVATAR_ID") {
      throw new Error("Missing LIVEAVATAR_LANDING_AVATAR_ID (and no LIVEAVATAR_AVATAR_ID fallback) in environment");
    }
    if (!landingContextIdBase || landingContextIdBase === "YOUR_CONTEXT_ID") {
      throw new Error("Missing LIVEAVATAR_LANDING_CONTEXT_ID (and no LIVEAVATAR_CONTEXT_ID fallback) in environment");
    }

    const baseLandingVoiceId = LIVEAVATAR_LANDING_VOICE_ID || LIVEAVATAR_VOICE_ID || "";

    const landingVoiceIdRu = process.env.LIVEAVATAR_LANDING_VOICE_ID_RU || baseLandingVoiceId;
    const landingVoiceIdDe = process.env.LIVEAVATAR_LANDING_VOICE_ID_DE || baseLandingVoiceId;
    const landingVoiceIdEn = process.env.LIVEAVATAR_LANDING_VOICE_ID_EN || baseLandingVoiceId;
    const landingContextIdRu = process.env.LIVEAVATAR_LANDING_CONTEXT_ID_RU || landingContextIdBase;
    const landingContextIdDe = process.env.LIVEAVATAR_LANDING_CONTEXT_ID_DE || landingContextIdBase;
    const landingContextIdEn = process.env.LIVEAVATAR_LANDING_CONTEXT_ID_EN || landingContextIdBase;

    let heygenLanguage: string;
    let voiceId: string;
    let contextId: string;

    switch (language) {
      case "en":
        heygenLanguage = "en";
        voiceId = landingVoiceIdEn;
        contextId = landingContextIdEn;
        break;
      case "de":
        heygenLanguage = "de";
        voiceId = landingVoiceIdDe;
        contextId = landingContextIdDe;
        break;
      default:
        heygenLanguage = "ru";
        voiceId = landingVoiceIdRu;
        contextId = landingContextIdRu;
        break;
    }

    const landingSystemPromptOverride = await storage.getSetting("maria_prompt_landing").catch(() => null);

    const payload: Record<string, any> = {
      mode: "FULL",
      avatar_id: landingAvatarId,
      avatar_persona: {
        voice_id: voiceId,
        context_id: contextId,
        language: heygenLanguage,
        ...(landingSystemPromptOverride ? { system_prompt: landingSystemPromptOverride } : {}),
      }
    };

    const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/token`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-API-KEY": LIVEAVATAR_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Token generation failed (landing): ${response.status} - ${text}`);
    }

    const json = JSON.parse(text);
    return {
      session_id: json?.data?.session_id,
      session_token: json?.data?.session_token,
      raw: json
    };
  }

  const isDennis = persona === "dennis";

  const baseAvatarId = isDennis ? DENNIS_AVATAR_ID : LIVEAVATAR_AVATAR_ID;
  const baseVoiceId = isDennis ? DENNIS_VOICE_ID : LIVEAVATAR_VOICE_ID;
  const baseContextId = isDennis ? DENNIS_CONTEXT_ID : LIVEAVATAR_CONTEXT_ID;

  const voiceIdEn = isDennis
    ? (process.env.DENNIS_VOICE_ID_EN || baseVoiceId)
    : (process.env.LIVEAVATAR_VOICE_ID_EN || baseVoiceId);
  const voiceIdDe = isDennis
    ? (process.env.DENNIS_VOICE_ID_DE || baseVoiceId)
    : (process.env.LIVEAVATAR_VOICE_ID_DE || baseVoiceId);
  const contextIdEn = isDennis
    ? (process.env.DENNIS_CONTEXT_ID_EN || baseContextId)
    : (process.env.LIVEAVATAR_CONTEXT_ID_EN || baseContextId);
  const contextIdDe = isDennis
    ? (process.env.DENNIS_CONTEXT_ID_DE || baseContextId)
    : (process.env.LIVEAVATAR_CONTEXT_ID_DE || baseContextId);

  let heygenLanguage: string;
  let voiceId: string;
  let contextId: string;

  switch (language) {
    case "en":
      heygenLanguage = "en";
      voiceId = voiceIdEn;
      contextId = contextIdEn;
      break;
    case "de":
      heygenLanguage = "de";
      voiceId = voiceIdDe;
      contextId = contextIdDe;
      break;
    default:
      heygenLanguage = "ru";
      voiceId = baseVoiceId;
      contextId = baseContextId;
      break;
  }

  if (guided && LIVEAVATAR_CONTEXT_ID_TEST) {
    contextId = LIVEAVATAR_CONTEXT_ID_TEST;
    console.log("Using guided test context ID:", contextId);
  }

  const videoSystemPromptOverride = !isDennis
    ? await storage.getSetting("maria_prompt_video").catch(() => null)
    : null;
  const activeSystemPrompt = videoSystemPromptOverride ?? LIVEAVATAR_SYSTEM_PROMPT;

  const payload: Record<string, any> = {
    mode: "FULL",
    avatar_id: baseAvatarId,
    avatar_persona: {
      voice_id: voiceId,
      context_id: contextId,
      language: heygenLanguage,
      ...(videoSystemPromptOverride ? { system_prompt: activeSystemPrompt } : {}),
    }
  };

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/token`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-API-KEY": LIVEAVATAR_API_KEY
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Token generation failed: ${response.status} - ${text}`);
  }

  const json = JSON.parse(text);
  return {
    session_id: json?.data?.session_id,
    session_token: json?.data?.session_token,
    raw: json
  };
}

export async function startSession(sessionToken: string): Promise<any> {
  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/start`, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Session start failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function stopSession(sessionId: string, sessionToken: string): Promise<any> {
  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/stop`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    },
    body: JSON.stringify({ session_id: sessionId })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Session stop failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function getSessionTranscript(sessionId: string): Promise<any> {
  if (!LIVEAVATAR_API_KEY) {
    throw new Error("Missing LIVEAVATAR_API_KEY in environment");
  }

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/${sessionId}/transcript`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-API-KEY": LIVEAVATAR_API_KEY
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Get transcript failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function sendEvent(sessionToken: string, eventType: string, data?: any): Promise<any> {
  const payload = {
    type: eventType,
    ...(data && { data })
  };

  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/event`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Send event failed: ${response.status} - ${text}`);
  }

  return JSON.parse(text);
}

export async function sendChatMessage(
  sessionToken: string,
  text: string,
  taskType: "chat" | "repeat" = "chat",
): Promise<any> {
  const response = await fetch(`${LIVEAVATAR_BASE_URL}/sessions/task`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "authorization": `Bearer ${sessionToken}`
    },
    body: JSON.stringify({ text, task_type: taskType, task_mode: "sync" })
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Chat message failed: ${response.status} - ${responseText}`);
  }

  try { return JSON.parse(responseText); } catch { return { raw: responseText }; }
}

export function registerLiveAvatarRoutes(app: Express): void {
  app.post("/api/liveavatar/token", async (req: Request, res: Response) => {
    try {
      const { language = "ru", persona, guided, context } = req.body || {};
      const result = await getSessionToken(language, persona, !!guided, context);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Token generation error:", error);
      res.status(500).json({
        error: "Token generation failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/start", async (req: Request, res: Response) => {
    try {
      const { session_token } = req.body || {};
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      const result = await startSession(session_token);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Start session error:", error);
      res.status(500).json({
        error: "Session start failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/stop", async (req: Request, res: Response) => {
    try {
      const { session_id, session_token } = req.body || {};
      if (!session_id) {
        return res.status(400).json({ error: "Missing session_id" });
      }
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      const result = await stopSession(session_id, session_token);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Stop session error:", error);
      res.status(500).json({
        error: "Session stop failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/event", async (req: Request, res: Response) => {
    try {
      const { session_token, event_type, data } = req.body || {};
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      if (!event_type) {
        return res.status(400).json({ error: "Missing event_type" });
      }
      const result = await sendEvent(session_token, event_type, data);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Send event error:", error);
      res.status(500).json({
        error: "Send event failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/chat", async (req: Request, res: Response) => {
    try {
      const { session_token, text } = req.body || {};
      if (!session_token) {
        return res.status(400).json({ error: "Missing session_token" });
      }
      if (!text) {
        return res.status(400).json({ error: "Missing text" });
      }
      const result = await sendChatMessage(session_token, text);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Chat message error:", error);
      res.status(500).json({
        error: "Chat message failed",
        details: error?.message || String(error)
      });
    }
  });

  app.get("/api/liveavatar/transcript/:sessionId", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.sessionId as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Missing sessionId" });
      }
      const result = await getSessionTranscript(sessionId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Get transcript error:", error);
      res.status(500).json({
        error: "Get transcript failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/sessions/:id/end", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id as string;
      const { session_token } = req.body || {};
      
      let transcript = null;
      if (session_token) {
        try {
          transcript = await getSessionTranscript(sessionId);
        } catch (e) {
          console.error("Failed to get transcript:", e);
        }
      }

      res.status(200).json({ ok: true, transcript });
    } catch (error: any) {
      console.error("End session error:", error);
      res.status(500).json({
        error: "End session failed",
        details: error?.message || String(error)
      });
    }
  });

  app.post("/api/liveavatar/tts", async (req: Request, res: Response) => {
    try {
      const { text, language = "ru" } = req.body || {};
      if (!text) {
        return res.status(400).json({ error: "Missing text" });
      }

      const voiceMap: Record<string, string> = { ru: "nova", de: "nova", en: "nova" };
      const voice = voiceMap[language] || "nova";
      const buffer = await textToSpeech(text, voice, "wav");
      res.setHeader("Content-Type", "audio/wav");
      res.setHeader("Content-Length", buffer.length.toString());
      res.send(buffer);
    } catch (error: any) {
      console.error("TTS error:", error);
      res.status(500).json({
        error: "TTS failed",
        details: error?.message || String(error),
      });
    }
  });

  app.get("/api/sofia/config", async (_req: Request, res: Response) => {
    res.status(200).json({
      enabled: {
        de: hasSofiaConfig("de"),
        en: hasSofiaConfig("en"),
        ru: hasSofiaConfig("ru"),
      },
      sandbox: process.env.SOFIA_SANDBOX_MODE === "true",
    });
  });

  app.post("/api/sofia/session/start", async (req: Request, res: Response) => {
    try {
      const { language = "de", visitorId } = req.body || {};
      if (visitorId) {
        const authErr = authorizeVisitorOwnership(req, String(visitorId));
        if (authErr) return res.status(authErr.status).json({ error: authErr.error });
      }
      if (!hasSofiaConfig(language)) {
        return res.status(503).json({
          error: "Sofia not configured for this language",
          language,
        });
      }

      // Create a per-session LLM config pointing at our proxy. HeyGen will
      // deliver Sofia's turns to /api/sofia/llm-proxy/<session_id>/chat/completions.
      // The session_id we use here is the HeyGen-returned session_id, so we must
      // mint the LLM config AFTER we know it — but HeyGen needs the config id at
      // token-creation time. Workaround: generate a stable UUID we control,
      // embed it in the proxy URL, and use it as our sofia_sessions primary key.
      const { randomUUID } = await import("node:crypto");
      const { createPerSessionLlmConfig, registerSofiaSession } = await import("./sofia-proxy");
      const ourSessionId: string = randomUUID();
      const llmConfigId = await createPerSessionLlmConfig(ourSessionId);

      const result = await getSofiaSessionToken(language, llmConfigId);
      registerSofiaSession(ourSessionId, language, llmConfigId, visitorId);

      try {
        await storage.createSofiaSession({
          sessionId: ourSessionId,
          language,
        });
      } catch (e) {
        console.error("[sofia] failed to persist session:", e);
      }
      res.status(200).json({
        ...result,
        session_id: ourSessionId,
        heygen_session_id: result.session_id,
      });
    } catch (error: any) {
      console.error("Sofia session start error:", error);
      res.status(500).json({ error: "Sofia session start failed", details: error?.message || String(error) });
    }
  });

  app.post("/api/sofia/session/keep-alive", async (req: Request, res: Response) => {
    try {
      const { session_token } = req.body || {};
      if (!session_token) return res.status(400).json({ error: "Missing session_token" });
      const result = await sendKeepAlive(session_token);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Sofia keep-alive error:", error);
      res.status(500).json({ error: "Keep-alive failed", details: error?.message || String(error) });
    }
  });

  app.post("/api/sofia/session/end", async (req: Request, res: Response) => {
    try {
      const { session_id, heygen_session_id, session_token, exit_action } = req.body || {};
      if (!session_id) return res.status(400).json({ error: "Missing session_id" });
      const heygenId = heygen_session_id || session_id;
      if (session_token) {
        try {
          await stopSession(heygenId, session_token);
        } catch (e) {
          console.error("[sofia] stopSession failed:", e);
        }
      }
      try {
        const { unregisterSofiaSession } = await import("./sofia-proxy");
        await unregisterSofiaSession(session_id);
      } catch (e) {
        console.error("[sofia] unregisterSofiaSession failed:", e);
      }
      try {
        await storage.endSofiaSession(session_id, exit_action);
      } catch (e) {
        console.error("[sofia] endSofiaSession failed:", e);
      }
      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error("Sofia session end error:", error);
      res.status(500).json({ error: "Session end failed", details: error?.message || String(error) });
    }
  });

  app.post("/api/sofia/session/:id/transcript", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id;
      const { messages = [] } = req.body || {};
      if (Array.isArray(messages) && messages.length > 0) {
        await storage.appendSofiaMessages(sessionId, messages);
      }
      res.status(200).json({ ok: true, saved: messages.length });
    } catch (error: any) {
      console.error("Sofia transcript error:", error);
      res.status(500).json({ error: "Transcript save failed", details: error?.message || String(error) });
    }
  });

  app.post("/api/sofia/session/:id/page", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id;
      const { path, at } = req.body || {};
      if (!path) return res.status(400).json({ error: "Missing path" });
      await storage.appendSofiaPageVisit(sessionId, { path, at: at || Date.now() });
      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error("Sofia page visit error:", error);
      res.status(500).json({ error: "Page visit save failed", details: error?.message || String(error) });
    }
  });

  // Cross-mode visitor dialog journal (chat | voice | avatar share one timeline keyed by visitorId)
  app.post("/api/sofia/dialog/append", async (req: Request, res: Response) => {
    try {
      const { visitorId, language = "de", mode = "chat", role, content } = req.body || {};
      if (!visitorId || !role || !content) {
        return res.status(400).json({ error: "Missing visitorId, role or content" });
      }
      const authErr = authorizeVisitorOwnership(req, String(visitorId));
      if (authErr) return res.status(authErr.status).json({ error: authErr.error });
      if (role !== "user" && role !== "assistant") {
        return res.status(400).json({ error: "role must be user|assistant" });
      }
      if (mode !== "chat" && mode !== "voice" && mode !== "avatar") {
        return res.status(400).json({ error: "mode must be chat|voice|avatar" });
      }
      const text = String(content).trim();
      if (!text) return res.status(200).json({ ok: true, skipped: "empty" });
      const created = await storage.appendSofiaDialog({
        visitorId: String(visitorId),
        language: String(language),
        mode: String(mode),
        role,
        content: text,
      });
      res.status(200).json({ ok: true, id: created.id });
    } catch (error: any) {
      console.error("[sofia-dialog] append error:", error);
      res.status(500).json({ error: "append failed", details: error?.message });
    }
  });

  app.get("/api/sofia/dialog", async (req: Request, res: Response) => {
    try {
      const visitorId = String(req.query.visitorId || "");
      const language = req.query.language ? String(req.query.language) : undefined;
      const limit = req.query.limit ? Math.min(500, parseInt(String(req.query.limit), 10) || 200) : 200;
      if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });
      const authErr = authorizeVisitorOwnership(req, visitorId);
      if (authErr) return res.status(authErr.status).json({ error: authErr.error });
      const rows = await storage.listSofiaDialog(visitorId, language, limit);
      res.status(200).json({ ok: true, messages: rows });
    } catch (error: any) {
      console.error("[sofia-dialog] list error:", error);
      res.status(500).json({ error: "list failed", details: error?.message });
    }
  });

  app.delete("/api/sofia/dialog", async (req: Request, res: Response) => {
    try {
      const visitorId = String(req.query.visitorId || req.body?.visitorId || "");
      if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });
      const authErr = authorizeVisitorOwnership(req, visitorId);
      if (authErr) return res.status(authErr.status).json({ error: authErr.error });
      await storage.clearSofiaDialog(visitorId);
      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error("[sofia-dialog] clear error:", error);
      res.status(500).json({ error: "clear failed", details: error?.message });
    }
  });

  app.post("/api/liveavatar/sessions/:id/transcript", async (req: Request, res: Response) => {
    try {
      const sessionId = req.params.id as string;
      const { language = "de", messages = [] } = req.body || {};

      if (!messages.length) {
        return res.status(200).json({ ok: true, saved: 0 });
      }

      await storage.createChatSession({ sessionId, language, type: "video" });

      for (const msg of messages) {
        const role = msg.sender === "avatar" ? "assistant" : "user";
        await storage.saveChatMessage({
          sessionId,
          role,
          content: msg.text || "",
        });
      }

      res.status(200).json({ ok: true, saved: messages.length });
    } catch (error: any) {
      console.error("Save video transcript error:", error);
      res.status(500).json({
        error: "Save transcript failed",
        details: error?.message || String(error),
      });
    }
  });
}
