import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { inviteEvents, inviteGuests, zoomAttendance, scheduleEvents, speakers, personalInvites } from "@shared/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import OpenAI from "openai";
import crypto from "crypto";
import { z } from "zod";
import { notifyPartnerPersonalInviteRegistration } from "./integrations/partner-bot";
import { sendGuestConfirmationEmail } from "./integrations/resend-email";
import { syncZoomDataForEvent, isZoomConfigured } from "./integrations/zoom-api";

const WEBINAR_DURATION_MS = 60 * 60 * 1000;

function groupEventsByTranslationPartner(events: any[], lang: string): any[] {
  const grouped = new Map<string, any[]>();
  const seen = new Set<string>();
  const result: any[] = [];

  for (const event of events) {
    if (event.translationGroup) {
      const group = grouped.get(event.translationGroup) || [];
      group.push(event);
      grouped.set(event.translationGroup, group);
    }
  }

  for (const event of events) {
    if (!event.translationGroup) {
      result.push({ ...event, isMultiLang: false, allGroupIds: [event.id] });
    } else if (!seen.has(event.translationGroup)) {
      seen.add(event.translationGroup);
      const group = grouped.get(event.translationGroup)!;
      const isMultiLang = group.length > 1;
      const preferred = group.find((e: any) => e.language === lang) || group[0];
      const allGroupIds = group.map((e: any) => e.id);
      result.push({ ...preferred, isMultiLang, allGroupIds });
    }
  }

  return result;
}

function getTimezoneOffsetServer(tz: string, refDate?: Date): string {
  const tzToIana: Record<string, string> = {
    "CET": "Europe/Berlin", "CEST": "Europe/Berlin",
    "MET": "Europe/Berlin", "MEZ": "Europe/Berlin", "MESZ": "Europe/Berlin",
    "UTC": "UTC", "GMT": "UTC",
    "MSK": "Europe/Moscow", "Europe/Berlin": "Europe/Berlin", "Europe/Moscow": "Europe/Moscow",
    "GST": "Asia/Dubai", "EST": "America/New_York", "EDT": "America/New_York",
  };
  const ianaZone = tzToIana[tz] || "Europe/Berlin";
  try {
    const fmt = new Intl.DateTimeFormat("en", { timeZone: ianaZone, timeZoneName: "longOffset" });
    const parts = fmt.formatToParts(refDate || new Date());
    const tzPart = parts.find(p => p.type === "timeZoneName")?.value || "";
    const match = tzPart.match(/GMT([+-]\d{2}:\d{2})/);
    if (match) return match[1];
  } catch {}
  return "+01:00";
}

function parseEventDateTimeServer(dateStr: string, timeStr: string, timezone?: string): Date | null {
  try {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;
    const roughDate = new Date(`${match[0]}T12:00:00Z`);
    const offset = getTimezoneOffsetServer(timezone || "CET", roughDate);
    const dt = new Date(`${match[0]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00${offset}`);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch { return null; }
}

function getPartnerBotToken(): string | undefined {
  if (process.env.NODE_ENV === "production") return process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  return process.env.TELEGRAM_PARTNER_BOT_TOKEN_DEV || process.env.TELEGRAM_PARTNER_BOT_TOKEN;
}

const PROSPECT_TYPES = ["Investor", "MLM Leader", "Entrepreneur", "Beginner", "Neutral"] as const;
const DISC_TYPES = ["D", "I", "S", "C"] as const;
const MOTIVATION_TYPES = ["money_results", "business_growth", "technology_innovation", "community_people", "learning_curiosity"] as const;
const REACTION_TYPES = ["fast_decision", "analytical", "skeptical", "needs_trust"] as const;
const INVITE_STRATEGIES = ["Authority", "Opportunity", "Curiosity", "Support"] as const;
const RELATIONSHIP_TYPES = ["friend", "business_contact", "mlm_leader", "investor", "entrepreneur", "cold_contact"] as const;

const csvEnum = (allowed: readonly string[]) =>
  z.string().optional().refine(
    (val) => !val || val.split(",").every((v) => allowed.includes(v.trim())),
    (val) => ({ message: `Invalid value(s) in: ${val}` })
  );

const createPersonalInviteSchema = z.object({
  scheduleEventId: z.number({ required_error: "scheduleEventId is required" }),
  prospectName: z.string().min(1, "prospectName is required").max(200),
  prospectType: z.string().default("Neutral"),
  discType: z.enum(DISC_TYPES).optional(),
  motivationType: csvEnum(MOTIVATION_TYPES),
  reactionType: csvEnum(REACTION_TYPES),
  inviteStrategy: z.enum(INVITE_STRATEGIES).optional(),
  prospectNote: z.string().max(1000).optional(),
  generatedMessages: z.string().optional(),
});

const registerPersonalInviteSchema = z.object({
  name: z.string().min(1, "name is required").max(200),
  email: z.string().email("valid email is required"),
  telegram: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  reminderChannel: z.enum(["telegram", "whatsapp", "email"]).optional(),
});

function hasAny(csv: string, values: string[]): boolean {
  const parts = csv.split(",");
  return values.some((v) => parts.includes(v));
}

function selectInviteStrategy(relationship: string, motivation: string, reaction: string): string {
  if (hasAny(relationship, ["mlm_leader", "entrepreneur"]) && hasAny(reaction, ["fast_decision", "analytical"])) return "Authority";
  if (hasAny(relationship, ["investor"]) || hasAny(motivation, ["money_results"])) return "Opportunity";
  if (hasAny(relationship, ["cold_contact"]) || hasAny(motivation, ["learning_curiosity", "technology_innovation"])) return "Curiosity";
  if (hasAny(reaction, ["needs_trust"]) || hasAny(motivation, ["community_people"])) return "Support";
  if (hasAny(relationship, ["business_contact"])) return "Opportunity";
  if (hasAny(relationship, ["friend"])) return "Curiosity";
  return "Curiosity";
}

function inferDiscFromAnswers(motivation: string, reaction: string): string {
  if (hasAny(reaction, ["fast_decision"]) && hasAny(motivation, ["money_results", "business_growth"])) return "D";
  if (hasAny(motivation, ["community_people"]) || (hasAny(reaction, ["fast_decision"]) && hasAny(motivation, ["technology_innovation"]))) return "I";
  if (hasAny(reaction, ["needs_trust"]) || hasAny(motivation, ["community_people"])) return "S";
  if (hasAny(reaction, ["analytical", "skeptical"])) return "C";
  return "I";
}

function getDiscQuickReplies(discType: string, isRegistered: boolean, lang: string = "de"): string[] {
  const reminderMap: Record<string, string[]> = {
    en: ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"],
    de: ["Erinnerung 1 Stunde vorher", "Erinnerung 15 Min. vorher", "Keine Erinnerung nötig"],
    ru: ["Напомни за 1 час", "Напомни за 15 минут", "Напоминание не нужно"],
  };
  if (isRegistered) return reminderMap[lang] || reminderMap.en;

  const qrMap: Record<string, Record<string, string[]>> = {
    en: {
      D: ["Yes, interested", "Get to the point", "Register me"],
      I: ["Sounds exciting!", "Tell me more", "Yes, I want in!"],
      S: ["Can you tell me more?", "Maybe", "Yes, register me"],
      C: ["What exactly will be shown?", "Show me details", "Yes, register me"],
      default: ["Yes, register me", "Tell me more", "Not sure yet"],
    },
    de: {
      D: ["Ja, interessiert", "Zur Sache", "Registriere mich"],
      I: ["Klingt spannend!", "Erzähl mir mehr", "Ja, ich will!"],
      S: ["Kannst du mehr erzählen?", "Vielleicht", "Ja, registriere mich"],
      C: ["Was genau wird gezeigt?", "Zeig mir Details", "Ja, registriere mich"],
      default: ["Ja, registriere mich", "Erzähl mir mehr", "Bin mir unsicher"],
    },
    ru: {
      D: ["Да, интересно", "К делу", "Зарегистрируй меня"],
      I: ["Звучит круто!", "Расскажи ещё", "Да, хочу!"],
      S: ["Расскажи подробнее?", "Может быть", "Да, зарегистрируй"],
      C: ["Что именно покажут?", "Покажи детали", "Да, зарегистрируй"],
      default: ["Да, зарегистрируй", "Расскажи ещё", "Пока не уверен"],
    },
  };
  const langQr = qrMap[lang] || qrMap.en;
  return langQr[discType] || langQr.default;
}

function buildMasterSystemPrompt(partnerName: string, invite: any, scheduleEvent: any): string {
  const discType = invite.discType || "I";
  const strategy = invite.inviteStrategy || "Curiosity";
  const prospectType = invite.prospectType || "Neutral";

  const highlightsText = scheduleEvent?.highlights?.length
    ? scheduleEvent.highlights.map((h: string) => `• ${h}`).join("\n")
    : "";

  let discToneGuide = "";
  switch (discType) {
    case "D":
      discToneGuide = `DISC Type D — Dominance:
- Tone: direct, confident, no fluff
- Keywords: growth, scale, control, speed, strong system, leverage
- Keep it short and powerful
- Focus on results and impact`;
      break;
    case "I":
      discToneGuide = `DISC Type I — Influence:
- Tone: energetic, warm, light, inspiring
- Keywords: interesting format, live meeting, new, people, community, wow
- Be enthusiastic and engaging
- Focus on excitement and novelty`;
      break;
    case "S":
      discToneGuide = `DISC Type S — Steadiness:
- Tone: soft, respectful, calm
- Keywords: calmly, no rush, if it resonates, clear format, just take a look
- No pressure at all
- Focus on trust and safety`;
      break;
    case "C":
      discToneGuide = `DISC Type C — Conscientiousness:
- Tone: clear, rational, no hype
- Keywords: structure, logic, model, tools, specifics
- Be factual and precise
- Focus on data and concrete details`;
      break;
  }

  let strategyGuide = "";
  switch (strategy) {
    case "Authority":
      strategyGuide = `Strategy: AUTHORITY (for leaders)
- Frame: respect, strong positioning, no persuasion, equal-level conversation
- Use "closed/private meeting" and "limited group" framing
- Focus: duplication, recruitment, team, scaling, leverage`;
      break;
    case "Opportunity":
      strategyGuide = `Strategy: OPPORTUNITY (for investors)
- Frame: opportunity, new model, early access
- Use "exclusive" and "limited seats" framing
- Focus: opportunities, numbers, control, logic, risk/reward, financial model`;
      break;
    case "Curiosity":
      strategyGuide = `Strategy: CURIOSITY (for neutral/cold contacts)
- Frame: intrigue, lightness, interest
- Do NOT use "exclusive" or "limited" framing
- Focus: unusual perspective, interesting idea, curiosity`;
      break;
    case "Support":
      strategyGuide = `Strategy: SUPPORT (for beginners)
- Frame: safety, no pressure, try it out
- Do NOT use "exclusive" or "limited" framing
- Focus: simple entry, clarity, support, extra income, no overwhelm`;
      break;
  }

  let roleGuide = "";
  switch (prospectType) {
    case "MLM Leader":
      roleGuide = "Role focus: duplication, recruiting, team growth, retention, follow-up, leverage, structure";
      break;
    case "Investor":
      roleGuide = "Role focus: opportunities, capital logic, control, financial model, risk/reward";
      break;
    case "Entrepreneur":
      roleGuide = "Role focus: system, growth, tools, efficiency, competitive advantage";
      break;
    case "Beginner":
      roleGuide = "Role focus: simple entry, clarity, support, extra income, step-by-step, no overwhelm";
      break;
    default:
      roleGuide = "Role focus: general interest, curiosity, exploring options";
  }

  return `You are a personal AI invitation assistant for ${partnerName}.

Your job is to have a short, personal conversation with ${invite.prospectName} who was invited to a private webinar.

WEBINAR DETAILS:
- Title: ${scheduleEvent?.title || "Webinar"}
- Date: ${scheduleEvent?.date || "TBD"}
- Time: ${scheduleEvent?.time || "TBD"}
- Speaker: ${scheduleEvent?.speaker || "Expert"}
${highlightsText ? `- Key topics:\n${highlightsText}` : ""}

PROSPECT INFO:
- Name: ${invite.prospectName}
- Type: ${invite.prospectType}
${invite.prospectNote ? `- Context from ${partnerName}: ${invite.prospectNote}` : ""}

${discToneGuide}

${strategyGuide}

${roleGuide}

REGISTRATION STATUS: ${invite.registeredAt ? "Already registered" : "Not yet registered"}

CRITICAL RULES:
- You speak as the personal assistant of ${partnerName}, NOT as JetUP
- Keep EVERY message SHORT: 2-4 sentences max
- Use natural chat style, no long paragraphs
- NEVER say "I hope this message finds you well"
- NEVER use generic corporate language
- NEVER overexplain the whole webinar
- NEVER sound like an email or sales page
- The goal is: curiosity + relevance → registration
- If they want to register, tell them to click the "Register" button
- If they ask for more info, share 1-2 relevant highlights
- If unsure, gently encourage with the right tone for their type
- After registration, congratulate and offer reminder
- Respond in ${(invite as any)._lang === "en" ? "English" : (invite as any)._lang === "ru" ? "Russian" : "German"} (the prospect speaks ${(invite as any)._lang === "en" ? "English" : (invite as any)._lang === "ru" ? "Russian" : "German"})
- Never make up information not provided above`;
}

const QUALIFICATION_QUESTIONS = [
  {
    step: 1,
    question: "Wer ist diese Person für dich?",
    aiText: "Um eine starke persönliche Einladung zu erstellen, muss ich die Person ein wenig verstehen.\n\nWer ist diese Person für dich?",
    options: [
      { label: "Freund / warmer Kontakt", value: "friend" },
      { label: "Geschäftskontakt", value: "business_contact" },
      { label: "MLM Leader", value: "mlm_leader" },
      { label: "Investor-Typ", value: "investor" },
      { label: "Unternehmer", value: "entrepreneur" },
      { label: "Kalter Kontakt", value: "cold_contact" },
    ],
  },
  {
    step: 2,
    question: "Was motiviert diese Person am meisten?",
    aiText: "Gut! Und was motiviert diese Person normalerweise am meisten?",
    options: [
      { label: "Geld / Ergebnisse", value: "money_results" },
      { label: "Business-Wachstum", value: "business_growth" },
      { label: "Technologie / Innovation", value: "technology_innovation" },
      { label: "Community / Menschen", value: "community_people" },
      { label: "Lernen / Neugier", value: "learning_curiosity" },
    ],
  },
  {
    step: 3,
    question: "Wie reagiert die Person normalerweise auf neue Möglichkeiten?",
    aiText: "Verstanden! Wie reagiert die Person normalerweise auf neue Möglichkeiten?",
    options: [
      { label: "Schnelle Entscheidung", value: "fast_decision" },
      { label: "Analytisch / viele Fragen", value: "analytical" },
      { label: "Skeptisch", value: "skeptical" },
      { label: "Braucht erst Vertrauen", value: "needs_trust" },
    ],
  },
  {
    step: 4,
    question: "Gibt es etwas Wichtiges, das ich wissen sollte? (optional)",
    aiText: "Fast fertig! Gibt es noch etwas Wichtiges über die Person, das ich wissen sollte?",
    options: null,
  },
];

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

function isPartnerAppEnabled(): boolean {
  return process.env.PARTNER_APP_ENABLED === "true" || process.env.NODE_ENV === "development";
}

function partnerAppGuard(req: any, res: any): boolean {
  if (!isPartnerAppEnabled()) {
    res.status(404).json({ error: "Not found" });
    return false;
  }
  return true;
}

function signPartnerToken(telegramId: string): string {
  const botToken = getPartnerBotToken();
  if (!botToken) throw new Error("Bot token not configured");
  const expiry = Date.now() + 30 * 24 * 3600 * 1000;
  const payload = Buffer.from(`${telegramId}.${expiry}`).toString("base64url");
  const sig = crypto.createHmac("sha256", botToken).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyPartnerToken(token: string): string | null {
  try {
    const botToken = getPartnerBotToken();
    if (!botToken) return null;
    const lastDot = token.lastIndexOf(".");
    if (lastDot < 0) return null;
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expectedSig = crypto.createHmac("sha256", botToken).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
    const decoded = Buffer.from(payload, "base64url").toString();
    const lastDot2 = decoded.lastIndexOf(".");
    const telegramId = decoded.slice(0, lastDot2);
    const expiry = parseInt(decoded.slice(lastDot2 + 1), 10);
    if (Date.now() > expiry) return null;
    return telegramId;
  } catch {
    return null;
  }
}

function getTelegramIdFromRequest(req: any): string | null {
  const partnerToken = req.headers["x-partner-token"] as string;
  if (partnerToken) return verifyPartnerToken(partnerToken);
  if (process.env.NODE_ENV === "development") {
    const telegramId = req.headers["x-telegram-id"] as string;
    if (telegramId && telegramId !== "demo") return telegramId;
  }
  return null;
}

async function getPartnerFromRequest(req: any): Promise<any | null> {
  const partnerToken = req.headers["x-partner-token"] as string;
  if (partnerToken) {
    const telegramId = verifyPartnerToken(partnerToken);
    if (!telegramId) return null;
    return storage.getPartnerByTelegramChatId(telegramId);
  }

  if (process.env.NODE_ENV === "development") {
    const telegramId = req.headers["x-telegram-id"] as string;
    if (telegramId === "demo") {
      const allPartners = await storage.getAllPartners();
      if (allPartners.length > 0) return allPartners[0];
      return {
        id: 0,
        telegramChatId: "demo",
        name: "Demo Partner",
        cuNumber: "CU00000",
        phone: null,
        email: null,
        status: "active",
        createdAt: new Date(),
      };
    }
  }

  return null;
}

export function registerPartnerAppRoutes(app: Express) {

  app.post("/api/partner-app/register", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const telegramId = getTelegramIdFromRequest(req);
      if (!telegramId || telegramId === "demo") {
        return res.status(400).json({ error: "Telegram ID required" });
      }

      const existing = await storage.getPartnerByTelegramChatId(telegramId);
      if (existing) {
        return res.status(409).json({ error: "Partner already registered" });
      }

      const { name, cuNumber, phone, email, telegramUsername } = req.body;
      if (!name || !cuNumber) {
        return res.status(400).json({ error: "Name and CU number are required" });
      }

      const partner = await storage.createPartner({
        telegramChatId: telegramId,
        telegramUsername: telegramUsername || null,
        name: name.trim(),
        cuNumber: cuNumber.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        status: "active",
      });

      console.log(`Partner registered via Mini App: ${partner.name} (CU: ${partner.cuNumber})`);

      res.json({
        partner: {
          id: partner.id,
          name: partner.name,
          cuNumber: partner.cuNumber,
          status: partner.status,
        },
        stats: {
          totalInvited: 0,
          totalAttended: 0,
          conversionRate: 0,
          totalEvents: 0,
        },
      });
    } catch (error: any) {
      console.error("Partner registration error:", error);
      if (error.message?.includes("unique")) {
        return res.status(409).json({ error: "Partner already registered" });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/partner-app/telegram-login", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;
      if (!id || !auth_date || !hash) {
        return res.status(400).json({ error: "Missing required Telegram auth fields" });
      }

      const botToken = getPartnerBotToken();
      if (!botToken) return res.status(503).json({ error: "Bot not configured" });

      const authFields: Record<string, string> = { id: String(id), auth_date: String(auth_date) };
      if (first_name) authFields.first_name = first_name;
      if (last_name) authFields.last_name = last_name;
      if (username) authFields.username = username;
      if (photo_url) authFields.photo_url = photo_url;

      const dataCheckString = Object.entries(authFields)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("\n");

      const secretKey = crypto.createHash("sha256").update(botToken).digest();
      const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))) {
        return res.status(401).json({ error: "Invalid Telegram auth signature" });
      }

      const now = Math.floor(Date.now() / 1000);
      if (now - parseInt(String(auth_date), 10) > 86400) {
        return res.status(401).json({ error: "Auth data expired" });
      }

      const telegramId = String(id);
      const partner = await storage.getPartnerByTelegramChatId(telegramId);
      const partnerToken = signPartnerToken(telegramId);
      if (!partner) {
        return res.status(404).json({ error: "Partner not registered", telegramId, regToken: partnerToken });
      }

      return res.json({ partnerToken, telegramId });
    } catch (error) {
      console.error("Telegram login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/partner-app/validate-init-data", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const { initData } = req.body;
      if (!initData) return res.status(400).json({ error: "initData required" });

      const botToken = getPartnerBotToken();
      if (!botToken) return res.status(503).json({ error: "Bot not configured" });

      const params = new URLSearchParams(initData);
      const hash = params.get("hash");
      if (!hash) return res.status(400).json({ error: "Missing hash in initData" });

      params.delete("hash");
      const dataCheckString = [...params.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("\n");

      const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
      const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))) {
        return res.status(401).json({ error: "Invalid initData signature" });
      }

      const authDateStr = params.get("auth_date");
      if (authDateStr) {
        const now = Math.floor(Date.now() / 1000);
        if (now - parseInt(authDateStr, 10) > 86400) {
          return res.status(401).json({ error: "initData expired" });
        }
      }

      const userJson = params.get("user");
      if (!userJson) return res.status(400).json({ error: "No user data in initData" });

      let user: any;
      try { user = JSON.parse(userJson); } catch {
        return res.status(400).json({ error: "Invalid user data in initData" });
      }

      const telegramId = String(user.id);
      const partner = await storage.getPartnerByTelegramChatId(telegramId);

      const partnerToken = signPartnerToken(telegramId);

      if (!partner) {
        return res.status(404).json({ error: "Partner not registered", telegramId, regToken: partnerToken });
      }

      return res.json({ partnerToken, telegramId });
    } catch (error) {
      console.error("validate-init-data error:", error);
      res.status(500).json({ error: "Validation failed" });
    }
  });

  app.get("/api/partner-app/profile", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const events = await storage.getInviteEventsByPartnerId(partner.id);
      let totalInvited = 0;
      let totalAttended = 0;

      for (const event of events) {
        totalInvited += event.guestCount;
        const attendance = await storage.getZoomAttendanceByEventId(event.id);
        const partnerAttended = attendance.filter((a: any) => a.inviteGuestId != null);
        totalAttended += partnerAttended.length;
      }

      const personalInvites = await storage.getPersonalInvitesByPartnerId(partner.id);
      const piTotal = personalInvites.length;
      const piRegistered = personalInvites.filter((pi) => pi.registeredAt).length;
      const piViewed = personalInvites.filter((pi) => pi.viewedAt).length;

      totalInvited += piRegistered;

      const conversionRate = totalInvited > 0 ? Math.round((totalAttended / totalInvited) * 100) : 0;

      res.json({
        partner: {
          id: partner.id,
          name: partner.name,
          cuNumber: partner.cuNumber,
          status: partner.status,
        },
        stats: {
          totalInvited,
          totalAttended,
          conversionRate,
          totalEvents: events.length,
          personalInvites: piTotal,
          personalRegistered: piRegistered,
          personalViewed: piViewed,
        },
      });
    } catch (error: any) {
      console.error("Partner app profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/webinars", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const lang = (req.query.lang as string) || "de";
      const partner = await getPartnerFromRequest(req);
      const allEvents = await storage.getScheduleEvents(true);

      const now = new Date();
      const filtered = allEvents.filter((e: any) => {
        const dateStr = e.date;
        if (!/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return false;
        const eventDt = parseEventDateTimeServer(dateStr, e.time || "00:00", e.timezone);
        if (!eventDt) return dateStr >= now.toISOString().slice(0, 10);
        const eventEndTime = eventDt.getTime() + WEBINAR_DURATION_MS;
        return eventEndTime > now.getTime();
      });

      const events = groupEventsByTranslationPartner(filtered, lang);

      if (partner) {
        const partnerEvents = await storage.getInviteEventsByPartnerId(partner.id);
        const pInvites = await storage.getPersonalInvitesByPartnerId(partner.id);
        const enriched = await Promise.all(events.map(async (se: any) => {
          const groupIds: number[] = se.allGroupIds || [se.id];
          const related = partnerEvents.filter((ie: any) => groupIds.includes(ie.scheduleEventId));
          let invitesSent = 0;
          let registeredCount = 0;
          for (const ie of related) {
            invitesSent++;
            const guests = await storage.getGuestsByEventId(ie.id);
            registeredCount += guests.length;
          }
          const relatedPi = pInvites.filter((pi) => groupIds.includes(pi.scheduleEventId!));
          invitesSent += relatedPi.length;
          registeredCount += relatedPi.filter((pi) => pi.registeredAt).length;
          const { allGroupIds, ...eventData } = se;
          return { ...eventData, invitesSent, registeredCount, inviteEventIds: related.map((ie: any) => ie.id) };
        }));
        return res.json(enriched);
      }

      res.json(events.map((e: any) => { const { allGroupIds, ...rest } = e; return { ...rest, invitesSent: 0, registeredCount: 0 }; }));
    } catch (error: any) {
      console.error("Partner app webinars error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/events", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const events = await storage.getInviteEventsByPartnerId(partner.id);

      const scheduleEventIds = [...new Set(events.filter(e => e.scheduleEventId).map(e => e.scheduleEventId!))];
      const scheduleEventsMap = new Map<number, { timezone: string }>();
      if (scheduleEventIds.length > 0) {
        const allSe = await storage.getScheduleEvents();
        for (const seId of scheduleEventIds) {
          const se = allSe.find((s: any) => s.id === seId);
          if (se) scheduleEventsMap.set(seId, { timezone: se.timezone || "CET" });
        }
      }

      const grouped = new Map<string, {
        title: string; eventDate: string; eventTime: string; scheduleEventId: number | null;
        timezone: string;
        inviteEvents: typeof events;
        totalGuests: number; totalAttended: number; totalClicked: number; invitesSent: number;
      }>();

      for (const event of events) {
        const key = event.scheduleEventId?.toString() || event.title;
        if (!grouped.has(key)) {
          const tz = event.scheduleEventId ? (scheduleEventsMap.get(event.scheduleEventId)?.timezone || "CET") : "CET";
          grouped.set(key, {
            title: event.title, eventDate: event.eventDate, eventTime: event.eventTime,
            scheduleEventId: event.scheduleEventId, timezone: tz,
            inviteEvents: [], totalGuests: 0, totalAttended: 0, totalClicked: 0, invitesSent: 0,
          });
        }
        const group = grouped.get(key)!;
        group.inviteEvents.push(event);
        group.invitesSent++;

        const guests = await storage.getGuestsByEventId(event.id);
        const attendance = await storage.getZoomAttendanceByEventId(event.id);
        const partnerAttendedCount = attendance.filter((a: any) => a.inviteGuestId != null).length;
        group.totalGuests += guests.length;
        group.totalAttended += partnerAttendedCount;
        group.totalClicked += guests.filter((g: any) => g.clickedZoom).length;
      }

      const enriched = Array.from(grouped.values()).map((g) => ({
        id: g.inviteEvents[0].id,
        title: g.title,
        eventDate: g.eventDate,
        eventTime: g.eventTime,
        timezone: g.timezone,
        scheduleEventId: g.scheduleEventId,
        invitesSent: g.invitesSent,
        registeredCount: g.totalGuests,
        attendedCount: g.totalAttended,
        clickedCount: g.totalClicked,
        guestCount: g.totalGuests,
        conversionRate: g.totalGuests > 0 ? Math.round((g.totalAttended / g.totalGuests) * 100) : 0,
        inviteEventIds: g.inviteEvents.map((e: any) => e.id),
      }));

      res.json(enriched);
    } catch (error: any) {
      console.error("Partner app events error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/events/:id/report", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const event = await storage.getInviteEventById(Number(req.params.id));
      if (!event || event.partnerId !== partner.id) {
        return res.status(404).json({ error: "Event not found" });
      }

      const guests = await storage.getGuestsByEventId(event.id);
      const attendance = await storage.getZoomAttendanceByEventId(event.id);

      const attendanceMap = new Map<string, typeof attendance[0]>();
      const attendanceByGuestId = new Map<number, typeof attendance[0]>();
      for (const a of attendance) {
        attendanceMap.set(a.participantEmail.toLowerCase(), a);
        if (a.inviteGuestId != null) {
          attendanceByGuestId.set(a.inviteGuestId, a);
        }
      }

      const personalInvitesList = await storage.getPersonalInvitesByPartnerId(partner.id);
      const personalInvitesByEmail = new Map<string, typeof personalInvitesList[0]>();
      for (const pi of personalInvitesList) {
        if (pi.guestEmail) {
          const key = pi.guestEmail.toLowerCase();
          const existing = personalInvitesByEmail.get(key);
          const sameEvent = event.scheduleEventId && pi.scheduleEventId === event.scheduleEventId;
          const existingSameEvent = existing && event.scheduleEventId && existing.scheduleEventId === event.scheduleEventId;
          if (!existing || (sameEvent && !existingSameEvent)) {
            personalInvitesByEmail.set(key, pi);
          }
        }
      }

      const guestsWithStatus = guests.map((g) => {
        const att = attendanceByGuestId.get(g.id) ?? attendanceMap.get(g.email.toLowerCase());
        const rawDuration = att ? (att.durationMinutes ?? null) : null;
        const durationMinutes = rawDuration != null && rawDuration > 480 ? null : rawDuration;
        const pi = personalInvitesByEmail.get(g.email.toLowerCase());
        let chatHistory: any[] = [];
        try {
          chatHistory = pi?.chatHistory ? JSON.parse(pi.chatHistory) : [];
        } catch {}
        const hasChat = Array.isArray(chatHistory) && chatHistory.length > 0;
        return {
          id: g.id,
          name: g.name,
          email: g.email,
          phone: g.phone,
          registeredAt: g.registeredAt,
          clickedZoom: g.clickedZoom,
          goClickedAt: g.goClickedAt ?? pi?.goClickedAt ?? null,
          attended: !!att,
          durationMinutes,
          questionsAsked: att ? (att.questionsAsked ?? null) : null,
          questionTexts: att?.questionTexts ?? [],
          joinTime: att?.joinTime ?? null,
          isWalkIn: false,
          invitationMethod: g.invitationMethod ?? null,
          guestTelegram: pi?.guestTelegram ?? null,
          reminderChannel: pi?.reminderChannel ?? null,
          hasChat,
          telegramNotificationsEnabled: pi?.telegramNotificationsEnabled ?? false,
        };
      });

      const partnerAttended = guestsWithStatus.filter((g) => g.attended);
      const validDurations = partnerAttended.map((g) => g.durationMinutes).filter((d): d is number => d != null);
      const avgDurationMinutes = validDurations.length > 0
        ? Math.round(validDurations.reduce((s, d) => s + d, 0) / validDurations.length)
        : null;

      // Compute method breakdown — only from registered guests (not walk-ins)
      // Guests with null invitation_method are historical; group under "unknown" (Other / Link)
      const methodGroups: Record<string, { invited: number; attended: number }> = {};
      for (const g of guestsWithStatus) {
        const method = g.invitationMethod ?? "unknown";
        if (!methodGroups[method]) {
          methodGroups[method] = { invited: 0, attended: 0 };
        }
        methodGroups[method].invited += 1;
        if (g.attended) methodGroups[method].attended += 1;
      }
      const methodBreakdown = Object.entries(methodGroups)
        .filter(([, stats]) => stats.invited > 0)
        .map(([method, stats]) => ({
          method,
          invited: stats.invited,
          attended: stats.attended,
          conversionRate: stats.invited > 0 ? Math.round((stats.attended / stats.invited) * 100) : 0,
        }));

      res.json({
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          eventTime: event.eventTime,
          inviteCode: event.inviteCode,
        },
        guests: guestsWithStatus,
        funnel: {
          invited: guests.length,
          registered: guests.length,
          clickedZoom: guests.filter((g) => !!g.goClickedAt || g.clickedZoom).length,
          attended: partnerAttended.length,
          avgDurationMinutes,
        },
        methodBreakdown,
      });
    } catch (error: any) {
      console.error("Partner app event report error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/events/:id/personal-invites", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const scheduleEventId = parseInt(req.params.id, 10);
      if (isNaN(scheduleEventId)) {
        return res.status(400).json({ error: "Invalid event id" });
      }

      const allInvites = await storage.getPersonalInvitesByPartnerId(partner.id);
      const invites = allInvites.filter((i) => i.scheduleEventId === scheduleEventId);

      const result = invites.map((inv) => {
        let status: "sent" | "viewed" | "chatted" | "registered" = "sent";
        if (inv.registeredAt) {
          status = "registered";
        } else if (inv.chatHistory && inv.chatHistory !== "[]") {
          try {
            const chat = JSON.parse(inv.chatHistory);
            if (Array.isArray(chat) && chat.length > 1) status = "chatted";
            else if (inv.viewedAt) status = "viewed";
          } catch {
            if (inv.viewedAt) status = "viewed";
          }
        } else if (inv.viewedAt) {
          status = "viewed";
        }
        return {
          id: inv.id,
          prospectName: inv.prospectName,
          guestName: inv.guestName,
          guestTelegram: inv.guestTelegram,
          status,
          viewedAt: inv.viewedAt ?? null,
          registeredAt: inv.registeredAt ?? null,
          goClickedAt: inv.goClickedAt ?? null,
          createdAt: inv.createdAt,
          inviteCode: inv.inviteCode,
        };
      });

      const stats = {
        total: invites.length,
        sent: invites.length,
        viewed: invites.filter((i) => i.viewedAt).length,
        registered: invites.filter((i) => i.registeredAt).length,
      };

      res.json({ invites: result, stats });
    } catch (error: any) {
      console.error("Partner app event personal invites error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/personal-invites", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const invites = await storage.getPersonalInvitesByPartnerId(partner.id);

      const eventIds = [...new Set(invites.map((i) => i.scheduleEventId).filter(Boolean))];
      const eventTitleMap: Record<number, string> = {};
      for (const eid of eventIds) {
        try {
          const ev = await storage.getScheduleEvent(eid);
          if (ev) eventTitleMap[eid] = ev.title;
        } catch {}
      }

      const result = invites.map((inv) => ({
        id: inv.id,
        inviteCode: inv.inviteCode,
        prospectName: inv.prospectName,
        prospectType: inv.prospectType,
        discType: inv.discType,
        inviteStrategy: inv.inviteStrategy,
        scheduleEventId: inv.scheduleEventId,
        eventTitle: eventTitleMap[inv.scheduleEventId] || null,
        createdAt: inv.createdAt,
        viewedAt: inv.viewedAt,
        registeredAt: inv.registeredAt,
        guestName: inv.guestName,
        guestEmail: inv.guestEmail,
        goClickedAt: inv.goClickedAt ?? null,
        isActive: inv.isActive,
        reminderPreference: inv.reminderPreference,
        reminderSent: inv.reminderSent,
      }));

      const stats = {
        total: invites.length,
        viewed: invites.filter((i) => i.viewedAt).length,
        registered: invites.filter((i) => i.registeredAt).length,
      };

      res.json({ invites: result, stats });
    } catch (error: any) {
      console.error("Partner app personal invites error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner-app/create-invite", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const { scheduleEventId } = req.body;
      if (!scheduleEventId) {
        return res.status(400).json({ error: "scheduleEventId is required" });
      }

      const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
      if (!scheduleEvent) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const inviteEvent = await storage.createInviteEvent({
        partnerName: partner.name,
        partnerCu: partner.cuNumber,
        partnerId: partner.id,
        scheduleEventId: scheduleEvent.id,
        zoomLink: scheduleEvent.link,
        title: scheduleEvent.title,
        eventDate: scheduleEvent.date,
        eventTime: scheduleEvent.time,
        isActive: true,
      });

      res.json({
        inviteCode: inviteEvent.inviteCode,
        inviteUrl: `/invite/${inviteEvent.inviteCode}`,
        event: {
          title: scheduleEvent.title,
          date: scheduleEvent.date,
          time: scheduleEvent.time,
          speaker: scheduleEvent.speaker,
        },
      });
    } catch (error: any) {
      console.error("Partner app create invite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner-app/ai-followup", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const { message, guestContext } = req.body;
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const openai = getOpenAIClient();

      let contextInfo = "";
      if (guestContext) {
        contextInfo = `\nGuest info: Name: ${guestContext.name || "unknown"}, Status: ${guestContext.attended ? "attended" : "did not attend"}, Duration: ${guestContext.durationMinutes || 0} min, Questions asked: ${guestContext.questionsAsked || 0}.`;
      }

      const systemPrompt = `You are an AI recruiting assistant for JetUP partners. You help partners follow up with webinar guests and prospects.
You are professional, supportive, and focused on helping the partner convert leads into team members or clients.
Respond in the same language as the partner's message (German, Russian, or English).
Keep messages concise and action-oriented.
${contextInfo}`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const reply = completion.choices[0]?.message?.content || "I couldn't generate a response.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Partner app AI followup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/partner-app/ai-qualify/questions", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    res.json({ questions: QUALIFICATION_QUESTIONS });
  });

  app.post("/api/partner-app/generate-invite-messages", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const { scheduleEventId, prospectName, partnerName: overrideName, relationship, motivation, reaction, contextNote, language: reqLang } = req.body;
      const lang = reqLang || "de";
      if (!scheduleEventId || !prospectName || !relationship || !motivation || !reaction) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
      if (!scheduleEvent) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const displayPartnerName = overrideName?.trim() || partner.name;

      const strategy = selectInviteStrategy(relationship, motivation, reaction);
      const discType = inferDiscFromAnswers(motivation, reaction);

      const relationshipLabels: Record<string, string> = {
        friend: "Neutral", business_contact: "Entrepreneur", mlm_leader: "MLM Leader",
        investor: "Investor", entrepreneur: "Entrepreneur", cold_contact: "Neutral",
      };
      const primaryRelationship = relationship.split(",")[0];
      const prospectType = relationshipLabels[primaryRelationship] || "Neutral";

      const openai = getOpenAIClient();

      let strategyPromptPart = "";
      switch (strategy) {
        case "Authority":
          strategyPromptPart = "Use Authority framing: respect, strong positioning, closed/private meeting, limited group. Talk as equals.";
          break;
        case "Opportunity":
          strategyPromptPart = "Use Opportunity framing: new model, early access, exclusive event. Focus on potential and numbers.";
          break;
        case "Curiosity":
          strategyPromptPart = "Use Curiosity framing: intrigue, lightness, unusual perspective. Do NOT say exclusive or limited.";
          break;
        case "Support":
          strategyPromptPart = "Use Support framing: safety, no pressure, simple entry, step by step. Do NOT say exclusive or limited.";
          break;
      }

      let discTonePart = "";
      switch (discType) {
        case "D": discTonePart = "Tone for D-type: direct, confident, no fluff. Focus on results, scale, speed."; break;
        case "I": discTonePart = "Tone for I-type: energetic, warm, inspiring. Focus on novelty, people, excitement."; break;
        case "S": discTonePart = "Tone for S-type: soft, respectful, calm. Focus on trust, safety, clarity."; break;
        case "C": discTonePart = "Tone for C-type: clear, rational, factual. Focus on structure, logic, specifics."; break;
      }

      const relationshipDescription = relationship.includes(",")
        ? `Multiple: ${relationship.split(",").join(", ")}`
        : relationship;
      const motivationDescription = motivation.includes(",")
        ? `Multiple: ${motivation.split(",").join(", ")}`
        : motivation;
      const reactionDescription = reaction.includes(",")
        ? `Multiple: ${reaction.split(",").join(", ")}`
        : reaction;

      const langName = lang === "en" ? "English" : lang === "ru" ? "Russian" : "German";
      const generatePrompt = `Generate exactly 2 short invitation messages in ${langName} for a webinar invitation.

CONTEXT:
- You are the personal assistant of ${displayPartnerName}
- Prospect name: ${prospectName}
- Prospect type: ${prospectType}
- Relationship to prospect: ${relationshipDescription}
- Prospect motivation: ${motivationDescription}
- Prospect reaction style: ${reactionDescription}
${contextNote ? `- Partner's note about prospect: "${contextNote}"` : ""}
- Webinar: "${scheduleEvent.title}" on ${scheduleEvent.date} at ${scheduleEvent.time} with ${scheduleEvent.speaker}

STRATEGY: ${strategy}
${strategyPromptPart}

DISC TONE:
${discTonePart}

RULES:
- Message 1: Greet by first name, introduce as assistant of ${displayPartnerName}, mention personal invitation, reference one relevant detail. 2-3 sentences max.
- Message 2: Mention webinar date/time shortly, frame relevance, ask one engagement question. 2-3 sentences max.
- Use natural chat style, NOT email format
- No "I hope this message finds you well"
- No corporate language
- No overexplaining
- Write in ${langName}

Return ONLY a JSON array with 2 message strings. Example: ["Message 1 text", "Message 2 text"]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: generatePrompt }],
        temperature: 0.8,
        max_tokens: 500,
      });

      const rawResponse = completion.choices[0]?.message?.content || "[]";
      let messages: string[] = [];
      try {
        const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          messages = JSON.parse(jsonMatch[0]);
        }
      } catch {
        messages = [rawResponse];
      }

      if (messages.length === 0) {
        if (lang === "en") {
          messages = [
            `${prospectName}, hi!\nI'm the assistant of ${partner.name}.\nThey wanted to personally invite you to a webinar.`,
            `On ${scheduleEvent.date} at ${scheduleEvent.time} there's an exciting webinar.\nAre you interested?`,
          ];
        } else if (lang === "ru") {
          messages = [
            `${prospectName}, привет!\nЯ ассистент ${partner.name}.\nОн хотел лично пригласить тебя на вебинар.`,
            `${scheduleEvent.date} в ${scheduleEvent.time} состоится интересный вебинар.\nТебе интересно?`,
          ];
        } else {
          messages = [
            `${prospectName}, hi!\nIch bin der Assistent von ${partner.name}.\nEr wollte dich persönlich zu einem Webinar einladen.`,
            `Am ${scheduleEvent.date} um ${scheduleEvent.time} findet ein spannendes Webinar statt.\nHast du Interesse?`,
          ];
        }
      }

      const quickReplies = getDiscQuickReplies(discType, false, lang);

      res.json({
        messages,
        strategy,
        discType,
        prospectType,
        quickReplies,
        motivation,
        reaction,
      });
    } catch (error: any) {
      console.error("Generate invite messages error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner-app/create-personal-invite", async (req, res) => {
    if (!partnerAppGuard(req, res)) return;
    try {
      const partner = await getPartnerFromRequest(req);
      if (!partner) {
        return res.status(401).json({ error: "Partner not found" });
      }

      const parsed = createPersonalInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { scheduleEventId, prospectName, prospectType, discType, motivationType, reactionType, inviteStrategy, prospectNote, generatedMessages } = parsed.data;

      const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
      if (!scheduleEvent) {
        return res.status(404).json({ error: "Webinar not found" });
      }

      const invite = await storage.createPersonalInvite({
        partnerId: partner.id,
        scheduleEventId: scheduleEvent.id,
        prospectName,
        prospectType,
        discType: discType || null,
        motivationType: motivationType || null,
        reactionType: reactionType || null,
        inviteStrategy: inviteStrategy || null,
        generatedMessages: generatedMessages || "[]",
        prospectNote: prospectNote || null,
        chatHistory: "[]",
        isActive: true,
      });

      res.json({
        inviteCode: invite.inviteCode,
        inviteUrl: `/personal-invite/${invite.inviteCode}`,
        event: {
          title: scheduleEvent.title,
          date: scheduleEvent.date,
          time: scheduleEvent.time,
          speaker: scheduleEvent.speaker,
        },
      });
    } catch (error: any) {
      console.error("Partner app create personal invite error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/personal-invite/:code", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      if (!invite.viewedAt) {
        await storage.markPersonalInviteViewed(invite.id);
      }

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);
      const partner = await storage.getPartnerById(invite.partnerId);

      res.json({
        inviteCode: invite.inviteCode,
        prospectName: invite.prospectName,
        partnerName: partner?.name || "Partner",
        isRegistered: !!invite.registeredAt,
        discType: invite.discType || null,
        inviteStrategy: invite.inviteStrategy || null,
        language: invite.guestLanguage || scheduleEvent?.language || "de",
        event: scheduleEvent ? {
          title: scheduleEvent.title,
          date: scheduleEvent.date,
          time: scheduleEvent.time,
          speaker: scheduleEvent.speaker,
          speakerPhoto: scheduleEvent.speakerPhoto || null,
          banner: scheduleEvent.banner || null,
          highlights: scheduleEvent.highlights || [],
          typeBadge: scheduleEvent.typeBadge || "",
          timezone: scheduleEvent.timezone || "CET",
        } : null,
        chatHistory: JSON.parse(invite.chatHistory || "[]"),
        zoomLink: invite.registeredAt ? (scheduleEvent?.link || null) : null,
        guestToken: invite.registeredAt ? ((invite as any).guestToken || null) : null,
        reminderChannel: invite.registeredAt ? (invite.reminderChannel || null) : null,
      });
    } catch (error: any) {
      console.error("Personal invite fetch error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/chat", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const { message, language } = req.body;
      if (!message) {
        return res.status(400).json({ error: "message is required" });
      }

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);
      const partner = await storage.getPartnerById(invite.partnerId);
      const partnerName = partner?.name || "Partner";

      const chatHistory: Array<{ role: string; content: string }> = JSON.parse(invite.chatHistory || "[]");
      chatHistory.push({ role: "user", content: message });

      const inviteWithLang = { ...invite, _lang: language || "de" } as any;
      const systemPrompt = buildMasterSystemPrompt(partnerName, inviteWithLang, scheduleEvent);

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      const reply = completion.choices[0]?.message?.content || "Ich helfe dir gerne! Möchtest du dich für das Webinar registrieren?";

      chatHistory.push({ role: "assistant", content: reply });
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      const discType = invite.discType || "I";
      let quickReplies: string[] = [];
      if (!invite.registeredAt) {
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("registrier") || lowerMsg.includes("register") || lowerMsg.includes("sign up") || lowerMsg.includes("ja") || lowerMsg.includes("зарегистрируй") || lowerMsg.includes("хочу")) {
          quickReplies = [];
        } else {
          quickReplies = getDiscQuickReplies(discType, false, language || "de");
        }
      } else if (!invite.reminderPreference) {
        quickReplies = getDiscQuickReplies(discType, true, language || "de");
      }

      res.json({ reply, quickReplies, isRegistered: !!invite.registeredAt });
    } catch (error: any) {
      console.error("Personal invite chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/init-chat", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const discType = invite.discType || "I";
      const lang = req.body?.language || "de";

      const existingHistory: Array<{ role: string; content: string }> = JSON.parse(invite.chatHistory || "[]");
      if (existingHistory.length > 0) {
        const quickReplies = !invite.registeredAt
          ? getDiscQuickReplies(discType, false, lang)
          : !invite.reminderPreference
            ? getDiscQuickReplies(discType, true, lang)
            : [];
        return res.json({ reply: existingHistory[0].content, chatHistory: existingHistory, quickReplies, isRegistered: !!invite.registeredAt });
      }

      const generatedMessages: string[] = JSON.parse(invite.generatedMessages || "[]");
      if (generatedMessages.length > 0) {
        const chatHistory = generatedMessages.map((msg) => ({ role: "assistant" as const, content: msg }));
        await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

        return res.json({
          reply: generatedMessages[0],
          chatHistory,
          quickReplies: getDiscQuickReplies(discType, false, lang),
          isRegistered: false,
        });
      }

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);
      const partner = await storage.getPartnerById(invite.partnerId);
      const partnerName = partner?.name || "Partner";
      const inviteWithLang = { ...invite, _lang: lang } as any;
      const systemPrompt = buildMasterSystemPrompt(partnerName, inviteWithLang, scheduleEvent);
      const langName = lang === "en" ? "English" : lang === "ru" ? "Russian" : "German";

      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate your first greeting message for ${invite.prospectName}. Remember: short, personal, conversational. In ${langName}.` },
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const firstMessage = completion.choices[0]?.message?.content ||
        `${invite.prospectName}, hi!\nIch bin der Assistent von ${partnerName}.\nEr möchte dich persönlich zu einem Webinar einladen.`;

      const chatHistory = [{ role: "assistant", content: firstMessage }];
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      res.json({
        reply: firstMessage,
        chatHistory,
        quickReplies: getDiscQuickReplies(discType, false, lang),
        isRegistered: false,
      });
    } catch (error: any) {
      console.error("Personal invite init-chat error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/register", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      if (invite.registeredAt) {
        return res.status(400).json({ error: "Already registered" });
      }

      const parsed = registerPersonalInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message || "Invalid input" });
      }
      const { name, email, telegram, phone, reminderChannel } = parsed.data;
      const lang = (req.body.language as string) || "en";

      const updated = await storage.updatePersonalInviteRegistration(invite.id, {
        guestName: name,
        guestEmail: email,
        guestTelegram: telegram,
        guestPhone: phone,
        reminderChannel: reminderChannel,
        preferredChannel: reminderChannel,
        guestLanguage: lang,
      });

      const regSuccessMessages: Record<string, string> = {
        en: `Great news, ${name}! You're now registered for the webinar! 🎉 Would you like me to set a reminder for you?`,
        de: `Tolle Neuigkeiten, ${name}! Sie sind jetzt für das Webinar registriert! 🎉 Möchten Sie eine Erinnerung einrichten?`,
        ru: `Отличные новости, ${name}! Вы зарегистрированы на вебинар! 🎉 Хотите, чтобы я напомнил вам?`,
      };
      const reminderQuickReplies: Record<string, string[]> = {
        en: ["Remind me 1 hour before", "Remind me 15 min before", "No reminder needed"],
        de: ["Erinnerung 1 Stunde vorher", "Erinnerung 15 Min. vorher", "Keine Erinnerung nötig"],
        ru: ["Напомни за 1 час", "Напомни за 15 минут", "Напоминание не нужно"],
      };

      const scheduleEvent = await storage.getScheduleEvent(invite.scheduleEventId);

      const chatHistory: Array<{ role: string; content: string }> = JSON.parse(updated.chatHistory || "[]");
      chatHistory.push({ role: "assistant", content: regSuccessMessages[lang] || regSuccessMessages.en });
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      // Sync registration into invite_guests for unified statistics and Zoom matching
      try {
        if (invite.partnerId && invite.scheduleEventId) {
          const partnerInviteEvents = await storage.getInviteEventsByPartnerId(invite.partnerId);
          const siblings = partnerInviteEvents.filter(
            (ie) => ie.scheduleEventId === invite.scheduleEventId
          );

          // Check for duplicate email across all sibling invite events for this webinar
          let alreadyInGuests = false;
          for (const ie of siblings) {
            const existing = await storage.getGuestsByEventId(ie.id);
            if (existing.some((g) => g.email.toLowerCase() === email.toLowerCase())) {
              alreadyInGuests = true;
              break;
            }
          }

          if (!alreadyInGuests) {
            // Use existing invite event or create one for this partner + webinar
            let targetEventId: number | null = siblings.length > 0 ? siblings[0].id : null;

            if (targetEventId === null && scheduleEvent) {
              const partner = await storage.getPartnerById(invite.partnerId);
              if (partner) {
                const created = await storage.createInviteEvent({
                  partnerId: partner.id,
                  partnerName: partner.name,
                  partnerCu: partner.cuNumber,
                  scheduleEventId: invite.scheduleEventId,
                  zoomLink: scheduleEvent.link || "",
                  title: scheduleEvent.title,
                  eventDate: scheduleEvent.date,
                  eventTime: scheduleEvent.time,
                  isActive: true,
                });
                targetEventId = created.id;
              }
            }

            if (targetEventId !== null) {
              await storage.addInviteGuest({
                inviteEventId: targetEventId,
                name,
                email,
                phone: phone || null,
                invitationMethod: "personal_ai",
              });
            }
          }
        }
      } catch (guestSyncErr) {
        console.error("Failed to sync personal invite guest to statistics:", guestSyncErr);
      }

      try {
        await notifyPartnerPersonalInviteRegistration(invite, name, email, phone);
      } catch (notifErr) {
        console.error("Failed to notify partner about personal invite registration:", notifErr);
      }

      if (scheduleEvent && email) {
        const guestToken = updated.guestToken;
        const goLink = guestToken ? `https://jet-up.ai/go/${guestToken}` : undefined;
        sendGuestConfirmationEmail({
          to: email,
          name,
          eventTitle: scheduleEvent.title,
          eventDate: scheduleEvent.date,
          eventTime: scheduleEvent.time,
          timezone: scheduleEvent.timezone || "CET",
          speaker: scheduleEvent.speaker,
          zoomLink: scheduleEvent.link,
          goLink,
          language: lang,
        }).catch((err) => console.error("Failed to send guest confirmation email:", err));
      }

      res.json({
        success: true,
        message: "Registration successful",
        chatHistory,
        quickReplies: reminderQuickReplies[lang] || reminderQuickReplies.en,
        zoomLink: scheduleEvent?.link || null,
        guestToken: (updated as any).guestToken || null,
        reminderChannel: reminderChannel || null,
        inviteCode: invite.inviteCode,
      });
    } catch (error: any) {
      console.error("Personal invite register error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner-app/events/:id/zoom-sync", async (req, res) => {
    try {
      const telegramId = req.headers["x-telegram-id"] as string;
      if (!telegramId) return res.status(401).json({ error: "Unauthorized" });

      const partner = await storage.getPartnerByTelegramChatId(telegramId);
      if (!partner) return res.status(401).json({ error: "Partner not found" });

      if (!isZoomConfigured()) {
        return res.status(503).json({ error: "Zoom not configured", zoomNotConfigured: true });
      }

      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) return res.status(400).json({ error: "Invalid event ID" });

      const event = await storage.getInviteEventById(eventId);
      if (!event) return res.status(404).json({ error: "Event not found" });
      if (event.partnerId !== partner.id) return res.status(403).json({ error: "Not your event" });
      if (!event.zoomLink) return res.status(400).json({ error: "No Zoom link for this event" });

      if (event.eventDate) {
        const todayStr = new Date().toISOString().slice(0, 10);
        if (event.eventDate > todayStr) {
          return res.status(400).json({ error: "FUTURE_EVENT", message: "Zoom sync is not available for future events" });
        }
      }

      let zoomUrl = event.zoomLink;
      if (!zoomUrl && event.scheduleEventId) {
        const se = await storage.getScheduleEvent(event.scheduleEventId);
        if (se) zoomUrl = se.link;
      }
      const result = await syncZoomDataForEvent(event.id, zoomUrl, event.eventDate ?? undefined);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        synced: result.synced,
        skipped: result.skipped,
        total: result.participants.length,
      });
    } catch (error: any) {
      console.error("Partner app zoom sync error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/personal-invite/:code/reminder", async (req, res) => {
    try {
      const invite = await storage.getPersonalInviteByCode(req.params.code);
      if (!invite || !invite.isActive) {
        return res.status(404).json({ error: "Invite not found" });
      }

      const REMINDER_OPTIONS = ["1_hour", "15_min", "none"] as const;
      const { preference } = req.body;
      if (!preference || !REMINDER_OPTIONS.includes(preference)) {
        return res.status(400).json({ error: "preference must be one of: 1_hour, 15_min, none" });
      }

      await storage.updatePersonalInviteReminder(invite.id, preference);
      const lang = (req.body.language as string) || "en";

      const chatHistory: Array<{ role: string; content: string }> = JSON.parse(invite.chatHistory || "[]");
      const reminderMessages: Record<string, Record<string, string>> = {
        en: { "1_hour": "Perfect! I'll remind you 1 hour before. See you at the webinar! 🙌", "15_min": "Perfect! I'll remind you 15 minutes before. See you at the webinar! 🙌", "none": "No problem! See you at the webinar! 🙌" },
        de: { "1_hour": "Perfekt! Ich erinnere Sie 1 Stunde vorher. Bis zum Webinar! 🙌", "15_min": "Perfekt! Ich erinnere Sie 15 Minuten vorher. Bis zum Webinar! 🙌", "none": "Kein Problem! Bis zum Webinar! 🙌" },
        ru: { "1_hour": "Отлично! Напомню за 1 час до начала. До встречи на вебинаре! 🙌", "15_min": "Отлично! Напомню за 15 минут до начала. До встречи на вебинаре! 🙌", "none": "Хорошо! До встречи на вебинаре! 🙌" },
      };
      const langMsgs = reminderMessages[lang] || reminderMessages.en;
      const reminderMsg = langMsgs[preference] || langMsgs.none;
      chatHistory.push({ role: "assistant", content: reminderMsg });
      await storage.updatePersonalInviteChatHistory(invite.id, JSON.stringify(chatHistory));

      res.json({ success: true, chatHistory });
    } catch (error: any) {
      console.error("Personal invite reminder error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}
