/**
 * Sofia Checkpoint B — Custom LLM proxy + actions SSE channel + per-session LLM configs.
 *
 * Flow:
 *   1. On Sofia session start, backend POSTs /v1/llm-configurations to HeyGen with
 *      base_url = <public_host>/api/sofia/llm-proxy/<sessionId>. The returned config
 *      id is embedded in the session_token as `llm_configuration_id`.
 *   2. During the conversation HeyGen calls our proxy as if it were OpenAI
 *      (POST /v1/chat/completions). We call real OpenAI with the Sofia DE prompt,
 *      parse JSON `{ speech, actions, internal_notes }`, return `speech` to HeyGen
 *      in OpenAI format, and push `actions` + `internal_notes` to the frontend over
 *      SSE (/api/sofia/actions/<sessionId>).
 *   3. On session end (or via hourly zombie cleanup) the per-session LLM config
 *      is DELETEd so they do not accumulate.
 */

import type { Express, Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import OpenAI from "openai";
import { storage } from "../storage";

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
const LIVEAVATAR_BASE_URL = "https://api.liveavatar.com/v1";
const SOFIA_OPENAI_SECRET_ID = process.env.SOFIA_OPENAI_SECRET_ID;
const SOFIA_PROXY_TOKEN = process.env.SOFIA_PROXY_TOKEN;
const SOFIA_LLM_MODEL = process.env.SOFIA_LLM_MODEL || "gpt-4.1";
const CONFIG_NAME_PREFIX = "sofia-session-";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Load Sofia DE system prompt from disk once. v2 by default; can be overridden by env.
const SOFIA_PROMPT_FILE =
  process.env.SOFIA_PROMPT_FILE || ".local/tasks/sofia-prompt-de-v3-draft.md";
let sofiaDePrompt = "";
try {
  sofiaDePrompt = fs.readFileSync(
    path.resolve(process.cwd(), SOFIA_PROMPT_FILE),
    "utf8",
  );
  console.log(
    `[sofia-proxy] prompt loaded: ${SOFIA_PROMPT_FILE} (${sofiaDePrompt.length} chars)`,
  );
} catch (e) {
  console.warn(
    `[sofia-proxy] could not load ${SOFIA_PROMPT_FILE}:`,
    (e as Error).message,
  );
}

type ActionEvent = {
  actions?: Array<{ type: string; params?: Record<string, any> }>;
  internal_notes?: {
    phase?: string;
    user_type?: string;
    energy_level?: string;
  };
};

type SessionEntry = {
  language: string;
  llmConfigId?: string;
  visitorId?: string;
  sseClients: Set<Response>;
  lastInternalNotes?: ActionEvent["internal_notes"];
  createdAt: number;
};

const sessions = new Map<string, SessionEntry>();

function getPublicBaseUrl(): string {
  const explicit = process.env.SOFIA_PUBLIC_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const dev = process.env.REPLIT_DEV_DOMAIN;
  if (dev) return `https://${dev}`;
  const list = (process.env.REPLIT_DOMAINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list[0]) return `https://${list[0]}`;
  return "";
}

function requireApiKey(): string {
  if (!LIVEAVATAR_API_KEY) throw new Error("Missing LIVEAVATAR_API_KEY");
  return LIVEAVATAR_API_KEY;
}

export async function createPerSessionLlmConfig(sessionId: string): Promise<string | undefined> {
  if (!SOFIA_OPENAI_SECRET_ID) {
    console.log("[sofia-proxy] SOFIA_OPENAI_SECRET_ID not set, skipping LLM config creation");
    return undefined;
  }
  const base = getPublicBaseUrl();
  if (!base) {
    console.warn("[sofia-proxy] cannot determine public base URL, skipping LLM config creation");
    return undefined;
  }
  try {
    const res = await fetch(`${LIVEAVATAR_BASE_URL}/llm-configurations`, {
      method: "POST",
      headers: { "content-type": "application/json", "X-API-KEY": requireApiKey() },
      body: JSON.stringify({
        display_name: `${CONFIG_NAME_PREFIX}${sessionId}`,
        model_name: SOFIA_LLM_MODEL,
        secret_id: SOFIA_OPENAI_SECRET_ID,
        base_url: `${base}/api/sofia/llm-proxy/${sessionId}`,
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error("[sofia-proxy] LLM config create failed:", res.status, text);
      return undefined;
    }
    const json = JSON.parse(text);
    const id = json?.data?.id || json?.data?.llm_configuration_id;
    if (id) console.log("[sofia-proxy] per-session LLM config created:", id);
    return id;
  } catch (e) {
    console.error("[sofia-proxy] LLM config create error:", e);
    return undefined;
  }
}

export async function deletePerSessionLlmConfig(configId: string): Promise<void> {
  try {
    const res = await fetch(`${LIVEAVATAR_BASE_URL}/llm-configurations/${configId}`, {
      method: "DELETE",
      headers: { "X-API-KEY": requireApiKey() },
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.warn("[sofia-proxy] LLM config delete non-200:", res.status, t);
    } else {
      console.log("[sofia-proxy] per-session LLM config deleted:", configId);
    }
  } catch (e) {
    console.error("[sofia-proxy] LLM config delete error:", e);
  }
}

export function registerSofiaSession(sessionId: string, language: string, llmConfigId?: string, visitorId?: string) {
  sessions.set(sessionId, {
    language,
    llmConfigId,
    visitorId,
    sseClients: new Set(),
    createdAt: Date.now(),
  });
}

export function getSofiaSessionVisitor(sessionId: string): string | undefined {
  return sessions.get(sessionId)?.visitorId;
}

export async function unregisterSofiaSession(sessionId: string) {
  const entry = sessions.get(sessionId);
  if (!entry) return;
  // Close SSE clients gracefully
  entry.sseClients.forEach((res) => {
    try { res.end(); } catch {}
  });
  entry.sseClients.clear();
  if (entry.llmConfigId) {
    await deletePerSessionLlmConfig(entry.llmConfigId);
  }
  // Persist final internal_notes into sofia_sessions row
  if (entry.lastInternalNotes) {
    try {
      await storage.updateSofiaSessionNotes(sessionId, {
        userType: entry.lastInternalNotes.user_type,
        finalPhase: entry.lastInternalNotes.phase,
        energyLevel: entry.lastInternalNotes.energy_level,
      });
    } catch (e) {
      console.warn("[sofia-proxy] failed to persist internal_notes:", (e as Error).message);
    }
  }
  sessions.delete(sessionId);
}

function pushActionsToSse(sessionId: string, payload: ActionEvent) {
  const entry = sessions.get(sessionId);
  if (!entry) return;
  if (payload.internal_notes) entry.lastInternalNotes = payload.internal_notes;
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  entry.sseClients.forEach((res) => {
    try { res.write(data); } catch {}
  });
}

/**
 * Parse model output to extract {speech, actions, internal_notes}.
 * Falls back to raw text as `speech` when JSON parsing fails.
 */
function parseSofiaResponse(raw: string): { speech: string; actions: any[]; internal_notes?: any } {
  const trimmed = raw.trim();
  // Strip optional ```json fences
  const stripped = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try {
    const parsed = JSON.parse(stripped);
    if (typeof parsed?.speech === "string") {
      return {
        speech: parsed.speech,
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        internal_notes: parsed.internal_notes,
      };
    }
  } catch {}
  // Try to extract first {...} block
  const match = stripped.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (typeof parsed?.speech === "string") {
        return {
          speech: parsed.speech,
          actions: Array.isArray(parsed.actions) ? parsed.actions : [],
          internal_notes: parsed.internal_notes,
        };
      }
    } catch {}
  }
  console.warn("[sofia-proxy] non-JSON reply, falling back to raw text");
  return { speech: stripped || "", actions: [] };
}

/**
 * Defensive fallback: if Sofia's speech promises to lead the user somewhere
 * but `actions` is empty, infer a navigate/open_presentation action from the
 * speech text. Keeps existing actions untouched if any are present.
 */
function ensureNavigationAction(speech: string, actions: any[]): any[] {
  if (Array.isArray(actions) && actions.length > 0) return actions;
  if (!speech || typeof speech !== "string") return actions || [];

  const s = speech.toLowerCase();
  // Trigger words that indicate Sofia is promising to take the user somewhere.
  // DE: führe/bringe/öffne/zeige/weitergeleitet/schauen Sie | EN: take you/show you/let me open | RU: веду/открою/покажу
  // Note: \b in JS regex is ASCII-only and would skip Cyrillic, so use simple substring checks.
  const promisesNav =
    /(führe sie|bringe sie|leite sie|öffne|zeige ihnen|weitergeleitet|schauen sie|ich bringe|ich öffne|ich zeige|ich führe|take you|let me (open|show|take)|i'?ll (open|show|take)|opening the|веду вас|приведу|открою|покажу|перенаправ)/i.test(
      s,
    );
  if (!promisesNav) return actions || [];

  // Map keywords in the speech to an explicit destination.
  let action: any | null = null;
  if (/präsentation|presentation|slides?|презентац/i.test(s)) {
    action = { type: "open_presentation" };
  } else if (/partner.?bereich|partner.?area|partner section|partner.?zone|партнёрск/i.test(s)) {
    action = { type: "navigate", params: { path: "/hub/partner" } };
  } else if (/webinar|schedule|termin|расписан|вебинар/i.test(s)) {
    action = { type: "navigate", params: { path: "/hub/schedule" } };
  } else if (/tutorial|anleitung|обуч/i.test(s)) {
    action = { type: "navigate", params: { path: "/hub/tutorials" } };
  } else if (/promo|aktion|акци/i.test(s)) {
    action = { type: "navigate", params: { path: "/hub/promo" } };
  } else if (/\bhub\b|digital.?hub|цифров/i.test(s)) {
    action = { type: "navigate", params: { path: "/hub" } };
  }

  if (!action) return actions || [];
  console.warn(
    `[sofia-proxy] navigation fallback inferred ${JSON.stringify(action)} from speech="${speech.slice(0, 100)}"`,
  );
  return [action];
}

async function hourlyZombieCleanup() {
  if (!LIVEAVATAR_API_KEY) return;
  try {
    const res = await fetch(`${LIVEAVATAR_BASE_URL}/llm-configurations`, {
      headers: { "X-API-KEY": LIVEAVATAR_API_KEY },
    });
    if (!res.ok) return;
    const json = await res.json();
    const list: any[] = json?.data || [];
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const activeIds = new Set(
      Array.from(sessions.values())
        .map((s) => s.llmConfigId)
        .filter(Boolean) as string[],
    );
    for (const cfg of list) {
      const name: string = cfg?.display_name || "";
      if (!name.startsWith(CONFIG_NAME_PREFIX)) continue;
      const id: string = cfg?.id || cfg?.llm_configuration_id;
      if (!id || activeIds.has(id)) continue;
      const created = Date.parse(cfg?.created_at || cfg?.createdAt || "") || 0;
      if (created && created > oneHourAgo) continue;
      console.log("[sofia-proxy] zombie cleanup deleting:", id, name);
      await deletePerSessionLlmConfig(id);
    }
  } catch (e) {
    console.warn("[sofia-proxy] zombie cleanup error:", (e as Error).message);
  }
}

export function startSofiaBackgroundJobs() {
  // Run on startup and hourly after
  hourlyZombieCleanup().catch(() => {});
  setInterval(() => { hourlyZombieCleanup().catch(() => {}); }, 60 * 60 * 1000);
}

export function registerSofiaProxyRoutes(app: Express) {
  // SSE stream of actions/internal_notes for a single Sofia session
  app.get("/api/sofia/actions/:sessionId", (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    const entry = sessions.get(sessionId);
    if (!entry) {
      return res.status(404).json({ error: "Unknown Sofia session" });
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();
    res.write(`: sofia-actions-open\n\n`);
    entry.sseClients.add(res);

    const hb = setInterval(() => {
      try { res.write(`: hb ${Date.now()}\n\n`); } catch {}
    }, 20_000);

    req.on("close", () => {
      clearInterval(hb);
      entry.sseClients.delete(res);
    });
  });

  // OpenAI-compatible Custom LLM endpoint.
  // HeyGen calls: POST /api/sofia/llm-proxy/:sessionId/chat/completions
  app.post("/api/sofia/llm-proxy/:sessionId/chat/completions", async (req: Request, res: Response) => {
    const sessionId = String(req.params.sessionId);
    const entry = sessions.get(sessionId);

    // Shared-auth check against SOFIA_PROXY_TOKEN stored as OpenAI key in HeyGen secret.
    if (SOFIA_PROXY_TOKEN) {
      const auth = String(req.header("authorization") || "");
      const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
      if (bearer !== SOFIA_PROXY_TOKEN) {
        return res.status(401).json({ error: { message: "invalid proxy token" } });
      }
    }

    try {
      const incoming = req.body || {};
      const heygenMessages: Array<{ role: string; content: string }> = Array.isArray(incoming.messages) ? incoming.messages : [];
      const wantsStream: boolean = Boolean(incoming.stream);
      const lastUser = [...heygenMessages].reverse().find((m) => m.role === "user");
      console.log(
        `[sofia-proxy] turn session=${sessionId} stream=${wantsStream} msgs=${heygenMessages.length} ` +
          `lastUser=${JSON.stringify(String(lastUser?.content || "").slice(0, 120))}`,
      );

      // Drop any system messages HeyGen injected (avatar context); we inject Sofia DE prompt ourselves.
      const history = heygenMessages.filter((m) => m.role !== "system");

      // Inject prior cross-mode context from the visitor journal (last ~20 turns).
      // This makes the avatar aware of the chat/voice conversation that happened
      // in other tabs of the same Sofia panel.
      let priorContext: Array<{ role: string; content: string }> = [];
      const visitorId = entry?.visitorId;
      if (visitorId) {
        try {
          const journal = await storage.listSofiaDialog(visitorId, entry?.language, 20);
          priorContext = journal.map((j) => ({
            role: j.role === "assistant" ? "assistant" : "user",
            content: `[${j.mode}] ${j.content}`,
          }));
        } catch (e) {
          console.warn("[sofia-proxy] failed to load journal:", (e as Error).message);
        }
      }
      const systemMsg = {
        role: "system" as const,
        content:
          sofiaDePrompt +
          "\n\nWICHTIG: Antworte IMMER mit gültigem JSON im Format " +
          `{"speech": "...", "actions": [...], "internal_notes": {"phase": "...", "user_type": "...", "energy_level": "..."}}. ` +
          "speech ist der einzige Text, den der Nutzer hört. Keine Prefix, kein Markdown, nur JSON.\n\n" +
          "NAVIGATIONS-REGEL (zwingend): Wenn dein `speech` andeutet, dass du den Nutzer irgendwohin führst, " +
          "bringst, weiterleitest oder etwas öffnest (z.B. \"ich führe Sie zu\", \"ich bringe Sie\", \"ich öffne\", " +
          "\"Sie werden weitergeleitet\", \"schauen Sie mal\", \"ich zeige Ihnen\"), MUSST du in `actions` den " +
          "passenden Eintrag hinzufügen. Mapping:\n" +
          "- Digital Hub / Hub-Übersicht → {\"type\":\"navigate\",\"params\":{\"path\":\"/hub\"}}\n" +
          "- Partner-Bereich → {\"type\":\"navigate\",\"params\":{\"path\":\"/hub/partner\"}}\n" +
          "- Webinare / Schedule / nächste Termine → {\"type\":\"navigate\",\"params\":{\"path\":\"/hub/schedule\"}}\n" +
          "- Tutorials / Anleitungen → {\"type\":\"navigate\",\"params\":{\"path\":\"/hub/tutorials\"}}\n" +
          "- Promo / Aktionen → {\"type\":\"navigate\",\"params\":{\"path\":\"/hub/promo\"}}\n" +
          "- Präsentation / Slides öffnen → {\"type\":\"open_presentation\"}\n" +
          "- Externer Link → {\"type\":\"open_url\",\"params\":{\"url\":\"https://...\"}}\n" +
          "Leeres `actions: []` ist NUR erlaubt, wenn du im speech nichts öffnest, wechselst oder weiterleitest.",
      };

      const completion = await openai.chat.completions.create({
        model: SOFIA_LLM_MODEL,
        temperature: 0.7,
        response_format: { type: "json_object" } as any,
        messages: [systemMsg, ...priorContext, ...history] as any,
      });

      const rawContent = completion.choices?.[0]?.message?.content || "";
      const { speech, actions, internal_notes } = parseSofiaResponse(rawContent);

      // Belt-and-suspenders: if speech promises navigation but the model forgot to emit
      // an action, infer one from the speech text. Logs a warning so we can iterate on
      // the prompt over time. Only triggers when actions array is empty.
      const finalActions = ensureNavigationAction(speech, actions);

      // Persist avatar message and push actions/internal_notes over SSE
      if (entry) {
        pushActionsToSse(sessionId, { actions: finalActions, internal_notes });
        if (speech) {
          try {
            await storage.appendSofiaMessages(sessionId, [
              { sender: "avatar", text: speech, timestamp: Date.now() },
            ]);
          } catch {}
        }
        // Mirror to cross-mode visitor journal
        if (entry.visitorId) {
          try {
            const userText = String(lastUser?.content || "").trim();
            if (userText) {
              await storage.appendSofiaDialog({
                visitorId: entry.visitorId,
                language: entry.language,
                mode: "avatar",
                role: "user",
                content: userText,
              });
            }
            if (speech) {
              await storage.appendSofiaDialog({
                visitorId: entry.visitorId,
                language: entry.language,
                mode: "avatar",
                role: "assistant",
                content: speech,
              });
            }
          } catch (e) {
            console.warn("[sofia-proxy] journal append failed:", (e as Error).message);
          }
        }
      }

      const completionId = completion.id || `sofia-${Date.now()}`;
      const createdAt = Math.floor(Date.now() / 1000);
      const modelName = completion.model || SOFIA_LLM_MODEL;

      if (wantsStream) {
        // Emit an OpenAI-compatible streaming SSE response containing only `speech`.
        // HeyGen's TTS reads deltas from this stream and speaks them as they arrive.
        res.status(200);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();

        const baseChunk = {
          id: completionId,
          object: "chat.completion.chunk",
          created: createdAt,
          model: modelName,
        };
        // Role chunk
        res.write(
          `data: ${JSON.stringify({
            ...baseChunk,
            choices: [{ index: 0, delta: { role: "assistant" }, finish_reason: null }],
          })}\n\n`,
        );
        // Emit speech in chunks of ~20 chars so HeyGen can start TTS early.
        const text = speech || "";
        const CHUNK = 20;
        for (let i = 0; i < text.length; i += CHUNK) {
          const delta = text.slice(i, i + CHUNK);
          res.write(
            `data: ${JSON.stringify({
              ...baseChunk,
              choices: [{ index: 0, delta: { content: delta }, finish_reason: null }],
            })}\n\n`,
          );
        }
        res.write(
          `data: ${JSON.stringify({
            ...baseChunk,
            choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
          })}\n\n`,
        );
        res.write(`data: [DONE]\n\n`);
        res.end();
        return;
      }

      // Non-streaming: return `speech` in the standard OpenAI completion shape.
      res.status(200).json({
        id: completionId,
        object: "chat.completion",
        created: createdAt,
        model: modelName,
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: speech },
            finish_reason: "stop",
          },
        ],
        usage: completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });
    } catch (e: any) {
      console.error("[sofia-proxy] llm-proxy error:", e?.message || e);
      res.status(500).json({ error: { message: e?.message || "proxy error" } });
    }
  });

  // Diagnostic: check proxy readiness and config
  app.get("/api/sofia/llm-proxy/_health", (_req: Request, res: Response) => {
    res.json({
      ok: true,
      has_openai: !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      has_secret_id: !!SOFIA_OPENAI_SECRET_ID,
      public_base: getPublicBaseUrl(),
      model: SOFIA_LLM_MODEL,
      prompt_loaded: sofiaDePrompt.length > 0,
      active_sessions: sessions.size,
    });
  });
}
