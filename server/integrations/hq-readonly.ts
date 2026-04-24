/**
 * HQ Read-Only API
 *
 * Bearer-token-protected, GET-only API for the external marketing HQ Repl.
 * All endpoints live under /api/hq/* and require Authorization: Bearer <HQ_READONLY_TOKEN>.
 * One unauthenticated /api/hq/_health endpoint exposes liveness only.
 *
 * PII (full email addresses, phone numbers, telegram chat IDs, etc.) is masked in responses.
 */

import type { Express, Request, Response, NextFunction } from "express";
import fs from "node:fs";
import path from "node:path";
import { storage } from "../storage";
import { db } from "../db";
import {
  chatSessions,
  chatMessages,
  scheduleEvents,
  promotions,
  dennisPromos,
  promoApplications,
  partners,
  personalInvites,
  inviteEvents,
  inviteGuests,
  zoomAttendance,
  tutorials,
  speakers,
  sofiaSessions,
} from "@shared/schema";
import { conversations, messages as mariaMessages } from "@shared/models/chat";
import { and, desc, eq, gte, lte, sql, count } from "drizzle-orm";
import { objectStorageClient } from "../replit_integrations/object_storage";
import {
  MARIA_SYSTEM_PROMPT_DE,
  MARIA_SYSTEM_PROMPT_EN,
  MARIA_SYSTEM_PROMPT_RU,
} from "./maria-chat";
import { LIVEAVATAR_SYSTEM_PROMPT } from "./liveavatar";

const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function checkRate(key: string): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function requireHqToken(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.HQ_READONLY_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: "HQ_READONLY_TOKEN not configured" });
  }
  const auth = String(req.header("authorization") || "");
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!bearer || bearer !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!checkRate(bearer)) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }
  next();
}

// ---------- PII masking ----------
function maskEmail(email?: string | null): string | null {
  if (!email) return email ?? null;
  const at = email.indexOf("@");
  if (at < 1) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(2, local.length - 1))}@${domain}`;
}

function maskPhone(phone?: string | null): string | null {
  if (!phone) return phone ?? null;
  const digits = phone.replace(/\D+/g, "");
  if (digits.length <= 4) return "***";
  const prefix = phone.startsWith("+") ? "+" : "";
  const head = digits.slice(0, Math.min(2, digits.length - 4));
  const tail = digits.slice(-4);
  return `${prefix}${head}${"*".repeat(Math.max(3, digits.length - head.length - tail.length))}${tail}`;
}

function maskTelegram(value?: string | null): string | null {
  if (!value) return value ?? null;
  if (value.length <= 4) return "***";
  return `${value.slice(0, 2)}***${value.slice(-2)}`;
}

// ---------- Pagination ----------
function parsePaging(req: Request, defaultLimit = 50, maxLimit = 200) {
  const limit = Math.max(1, Math.min(maxLimit, parseInt(String(req.query.limit ?? defaultLimit), 10) || defaultLimit));
  const offset = Math.max(0, parseInt(String(req.query.offset ?? 0), 10) || 0);
  return { limit, offset };
}

function paginate<T>(items: T[], limit: number, offset: number) {
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    limit,
    offset,
  };
}

// ---------- Date filters ----------
function parseDateFilters(req: Request): { from?: Date; to?: Date } {
  const out: { from?: Date; to?: Date } = {};
  const from = req.query.from ? new Date(String(req.query.from)) : null;
  const to = req.query.to ? new Date(String(req.query.to)) : null;
  if (from && !isNaN(from.getTime())) out.from = from;
  if (to && !isNaN(to.getTime())) out.to = to;
  return out;
}

// ---------- Sofia prompt loading ----------
function loadSofiaPromptFromDisk(): { content: string | null; file: string } {
  const file = process.env.SOFIA_PROMPT_FILE || ".local/tasks/sofia-prompt-de-v3-draft.md";
  try {
    const content = fs.readFileSync(path.resolve(process.cwd(), file), "utf8");
    return { content, file };
  } catch {
    return { content: null, file };
  }
}

async function getSofiaPromptForLang(lang: "de" | "en" | "ru") {
  const overrideKey = `sofia_prompt_${lang}`;
  const override = await storage.getSetting(overrideKey).catch(() => null);
  if (override) {
    return { language: lang, source: "override" as const, settingKey: overrideKey, content: override };
  }
  if (lang === "de") {
    const disk = loadSofiaPromptFromDisk();
    return {
      language: lang,
      source: disk.content ? ("default-file" as const) : ("missing" as const),
      file: disk.file,
      content: disk.content,
    };
  }
  return { language: lang, source: "missing" as const, content: null };
}

async function getMariaPrompt(mode: "text" | "video", lang?: "de" | "en" | "ru") {
  if (mode === "video") {
    const override = await storage.getSetting("maria_prompt_video").catch(() => null);
    return {
      mode,
      source: override ? ("override" as const) : ("default" as const),
      settingKey: "maria_prompt_video",
      content: override ?? LIVEAVATAR_SYSTEM_PROMPT,
    };
  }
  const language = lang || "de";
  const key = `maria_prompt_text_${language}`;
  const override = await storage.getSetting(key).catch(() => null);
  const def = language === "en" ? MARIA_SYSTEM_PROMPT_EN : language === "ru" ? MARIA_SYSTEM_PROMPT_RU : MARIA_SYSTEM_PROMPT_DE;
  return {
    mode,
    language,
    source: override ? ("override" as const) : ("default" as const),
    settingKey: key,
    content: override ?? def,
  };
}

// ---------- Object storage listing ----------
function getUploadBucketName(): string {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (publicPaths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set");
  const parts = publicPaths[0].split("/").filter(Boolean);
  return parts[0];
}

function getUploadPrefix(): string {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (publicPaths.length === 0) return "";
  const parts = publicPaths[0].split("/").filter(Boolean);
  return parts.slice(1).join("/");
}

async function listPublicObjects(prefixFilter?: string, limit = 200) {
  const bucketName = getUploadBucketName();
  const prefixBase = getUploadPrefix();
  const prefix = prefixFilter
    ? prefixBase
      ? `${prefixBase}/${prefixFilter}`
      : prefixFilter
    : prefixBase
    ? `${prefixBase}/`
    : "";
  const bucket = objectStorageClient.bucket(bucketName);
  const [files] = await bucket.getFiles({ prefix, maxResults: limit });
  return files.map((f: any) => {
    const md = f.metadata || {};
    const name: string = f.name;
    const relName = prefixBase && name.startsWith(prefixBase + "/") ? name.slice(prefixBase.length + 1) : name;
    const publicUrl = `/${relName}`;
    return {
      name: relName,
      fullName: name,
      contentType: md.contentType || null,
      size: md.size ? parseInt(String(md.size), 10) : null,
      updated: md.updated || null,
      created: md.timeCreated || null,
      publicUrl,
    };
  });
}

// ---------- Routes ----------
export function registerHqReadonlyRoutes(app: Express) {
  // Public health
  app.get("/api/hq/_health", (_req, res) => {
    res.json({
      ok: true,
      tokenConfigured: !!process.env.HQ_READONLY_TOKEN,
      time: new Date().toISOString(),
    });
  });

  // All other HQ routes require token + rate limit
  app.use("/api/hq", (req, res, next) => {
    if (req.path === "/_health") return next();
    if (req.method !== "GET") return res.status(404).json({ error: "Not found" });
    return requireHqToken(req, res, next);
  });

  // ===== Sofia chats =====
  app.get("/api/hq/sofia/sessions", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const lang = req.query.language ? String(req.query.language) : null;
      const { from, to } = parseDateFilters(req);

      let rows = await storage.getSofiaSessions();
      if (lang) rows = rows.filter((r) => r.language === lang);
      if (from) rows = rows.filter((r) => r.startedAt && new Date(r.startedAt) >= from);
      if (to) rows = rows.filter((r) => r.startedAt && new Date(r.startedAt) <= to);

      const items = rows.map((r) => {
        const msgs = Array.isArray(r.messages) ? (r.messages as any[]) : [];
        const pages = Array.isArray(r.pagesVisited) ? (r.pagesVisited as any[]) : [];
        return {
          sessionId: r.sessionId,
          language: r.language,
          startedAt: r.startedAt,
          endedAt: r.endedAt,
          messageCount: msgs.length,
          pageCount: pages.length,
          userType: r.userType,
          finalPhase: r.finalPhase,
          energyLevel: r.energyLevel,
          exitAction: r.exitAction,
        };
      });
      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/sofia/sessions/:sessionId", async (req, res) => {
    try {
      const row = await storage.getSofiaSession(String(req.params.sessionId));
      if (!row) return res.status(404).json({ error: "Not found" });
      res.json({
        sessionId: row.sessionId,
        language: row.language,
        startedAt: row.startedAt,
        endedAt: row.endedAt,
        userType: row.userType,
        finalPhase: row.finalPhase,
        energyLevel: row.energyLevel,
        exitAction: row.exitAction,
        pagesVisited: Array.isArray(row.pagesVisited) ? row.pagesVisited : [],
        messages: Array.isArray(row.messages) ? row.messages : [],
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Maria chats (text + video both stored in chat_sessions) =====
  app.get("/api/hq/maria/sessions", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const type = req.query.type ? String(req.query.type) : undefined;
      const lang = req.query.language ? String(req.query.language) : null;
      const { from, to } = parseDateFilters(req);

      const filters: { type?: string; dateFrom?: string; dateTo?: string } = {};
      if (type) filters.type = type;
      if (from) filters.dateFrom = from.toISOString();
      if (to) filters.dateTo = to.toISOString();

      let rows = await storage.getChatSessions(filters);
      if (lang) rows = rows.filter((r: any) => r.language === lang);

      res.json(paginate(rows, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/maria/sessions/:sessionId", async (req, res) => {
    try {
      const sessionId = String(req.params.sessionId);
      const [session] = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
      if (!session) return res.status(404).json({ error: "Not found" });
      const msgs = await storage.getChatSessionMessages(sessionId);
      res.json({
        sessionId: session.sessionId,
        language: session.language,
        type: session.type,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: msgs.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // Legacy Maria conversations table (shared/models/chat)
  app.get("/api/hq/maria/conversations", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const rows = await db.select().from(conversations).orderBy(desc(conversations.createdAt));
      res.json(paginate(rows, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/maria/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv) return res.status(404).json({ error: "Not found" });
      const msgs = await db.select().from(mariaMessages).where(eq(mariaMessages.conversationId, id)).orderBy(mariaMessages.createdAt);
      res.json({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        messages: msgs.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Prompts =====
  app.get("/api/hq/prompts/sofia", async (_req, res) => {
    try {
      const [de, en, ru] = await Promise.all([
        getSofiaPromptForLang("de"),
        getSofiaPromptForLang("en"),
        getSofiaPromptForLang("ru"),
      ]);
      res.json({ de, en, ru });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/prompts/maria", async (_req, res) => {
    try {
      const [textDe, textEn, textRu, video] = await Promise.all([
        getMariaPrompt("text", "de"),
        getMariaPrompt("text", "en"),
        getMariaPrompt("text", "ru"),
        getMariaPrompt("video"),
      ]);
      res.json({ text: { de: textDe, en: textEn, ru: textRu }, video });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Partners (PII-stripped) =====
  app.get("/api/hq/partners", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const all = await storage.getAllPartners();
      const items = all.map((p) => ({
        id: p.id,
        cuNumber: p.cuNumber,
        name: p.name,
        language: p.language,
        status: p.status,
        email: maskEmail(p.email),
        phone: maskPhone(p.phone),
        telegramUsername: maskTelegram(p.telegramUsername),
        hasTelegram: !!p.telegramChatId,
        createdAt: p.createdAt,
      }));
      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Promo applications =====
  app.get("/api/hq/promo/applications", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const status = req.query.status ? String(req.query.status) : null;
      const all = await storage.getPromoApplications();
      let rows = all;
      if (status) rows = rows.filter((r) => r.status === status);
      const items = rows.map((r) => ({
        id: r.id,
        promoId: r.promoId,
        name: r.name,
        email: maskEmail(r.email),
        cuNumber: r.cuNumber,
        status: r.status,
        verifiedAt: r.verifiedAt,
        emailSentAt: r.emailSentAt,
        noMoneyEmailSentAt: r.noMoneyEmailSentAt,
        createdAt: r.createdAt,
      }));
      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Events (schedule + invite events + zoom attendance) =====
  app.get("/api/hq/events", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const includeAttendance = String(req.query.includeAttendance ?? "true") === "true";
      const includeGuests = String(req.query.includeGuests ?? "true") === "true";
      const events = await storage.getScheduleEvents(false);

      const items = await Promise.all(
        events.map(async (ev: any) => {
          const inviteEvts = await storage.getInviteEventsByScheduleEventId(ev.id);
          let guestsList: any[] = [];
          let attendance: any[] = [];
          for (const ie of inviteEvts) {
            if (includeGuests) {
              const gs = await storage.getGuestsByEventId(ie.id);
              guestsList = guestsList.concat(
                gs.map((g) => ({
                  inviteEventId: ie.id,
                  partnerCu: ie.partnerCu,
                  name: g.name,
                  email: maskEmail(g.email),
                  phone: maskPhone(g.phone),
                  registeredAt: g.registeredAt,
                  clickedZoom: g.clickedZoom,
                  clickedAt: g.clickedAt,
                  invitationMethod: g.invitationMethod,
                })),
              );
            }
            if (includeAttendance) {
              const att = await storage.getZoomAttendanceByEventId(ie.id);
              attendance = attendance.concat(
                att.map((a) => ({
                  inviteEventId: ie.id,
                  participantName: a.participantName,
                  participantEmail: maskEmail(a.participantEmail),
                  joinTime: a.joinTime,
                  leaveTime: a.leaveTime,
                  durationMinutes: a.durationMinutes,
                  questionsAsked: a.questionsAsked,
                })),
              );
            }
          }
          return {
            id: ev.id,
            day: ev.day,
            date: ev.date,
            time: ev.time,
            timezone: ev.timezone,
            title: ev.title,
            speaker: ev.speaker,
            speakerId: ev.speakerId,
            type: ev.type,
            typeBadge: ev.typeBadge,
            highlights: ev.highlights,
            isActive: ev.isActive,
            language: ev.language,
            translationGroup: ev.translationGroup,
            inviteEventCount: inviteEvts.length,
            guests: guestsList,
            attendance,
          };
        }),
      );

      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Personal invites =====
  app.get("/api/hq/personal-invites", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const all = await db.select().from(personalInvites).orderBy(desc(personalInvites.createdAt));
      const items = all.map((p) => ({
        id: p.id,
        partnerId: p.partnerId,
        scheduleEventId: p.scheduleEventId,
        prospectName: p.prospectName,
        prospectType: p.prospectType,
        discType: p.discType,
        motivationType: p.motivationType,
        reactionType: p.reactionType,
        inviteStrategy: p.inviteStrategy,
        guestName: p.guestName,
        guestEmail: maskEmail(p.guestEmail),
        guestPhone: maskPhone(p.guestPhone),
        guestTelegram: maskTelegram(p.guestTelegram),
        guestLanguage: p.guestLanguage,
        registeredAt: p.registeredAt,
        viewedAt: p.viewedAt,
        goClickedAt: p.goClickedAt,
        reminderSent: p.reminderSent,
        reminder24hSent: p.reminder24hSent,
        isActive: p.isActive,
        createdAt: p.createdAt,
      }));
      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Content =====
  app.get("/api/hq/content/tutorials", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const language = req.query.language ? String(req.query.language) : undefined;
      const items = await storage.getTutorials(false, language);
      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/content/speakers", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const items = await storage.getSpeakers(false);
      res.json(paginate(items, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/content/promos", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req);
      const language = req.query.language ? String(req.query.language) : undefined;
      const dennis = await storage.getDennisPromos(false, language);
      const banners = await storage.getPromotions(false, language);
      const items = {
        dennisPromos: dennis,
        promotionBanners: banners,
      };
      // paginate dennis only by convention; banners returned as-is
      const paged = paginate(dennis, limit, offset);
      res.json({ ...paged, promotionBanners: banners });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  app.get("/api/hq/content/translations", async (_req, res) => {
    try {
      // Group translatable rows by translation_group across schedule_events, promotions, dennis_promos.
      const [evts, promos, dennis] = await Promise.all([
        db.select().from(scheduleEvents),
        db.select().from(promotions),
        db.select().from(dennisPromos),
      ]);
      const collect = (rows: any[], type: string) => {
        const groups = new Map<string, any[]>();
        for (const r of rows) {
          const g = r.translationGroup;
          if (!g) continue;
          const arr = groups.get(g) || [];
          arr.push({ id: r.id, language: r.language, title: r.title || r.badge || null });
          groups.set(g, arr);
        }
        return Array.from(groups.entries()).map(([group, items]) => ({
          type,
          translationGroup: group,
          languages: items.map((i) => i.language),
          items,
        }));
      };
      res.json({
        scheduleEvents: collect(evts, "scheduleEvent"),
        promotionBanners: collect(promos, "promotion"),
        dennisPromos: collect(dennis, "dennisPromo"),
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Files =====
  app.get("/api/hq/files", async (req, res) => {
    try {
      const { limit, offset } = parsePaging(req, 100, 500);
      const prefix = req.query.prefix ? String(req.query.prefix) : undefined;
      const files = await listPublicObjects(prefix, offset + limit);
      res.json(paginate(files, limit, offset));
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });

  // ===== Metrics overview =====
  app.get("/api/hq/metrics/overview", async (req, res) => {
    try {
      const period = String(req.query.period || "week");
      const now = new Date();
      const since = new Date(now);
      if (period === "day") since.setDate(now.getDate() - 1);
      else if (period === "month") since.setMonth(now.getMonth() - 1);
      else since.setDate(now.getDate() - 7);

      const [
        sofiaTotal,
        sofiaInPeriod,
        mariaTotal,
        mariaInPeriod,
        partnersTotal,
        promoApps,
        promoApproved,
        promoNoMoney,
        eventsTotal,
        guestsTotal,
        attendanceTotal,
        personalInvitesTotal,
        personalInvitesRegistered,
      ] = await Promise.all([
        db.select({ c: count() }).from(sofiaSessions).then((r) => r[0]?.c ?? 0),
        db
          .select({ c: count() })
          .from(sofiaSessions)
          .where(gte(sofiaSessions.startedAt, since))
          .then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(chatSessions).then((r) => r[0]?.c ?? 0),
        db
          .select({ c: count() })
          .from(chatSessions)
          .where(gte(chatSessions.createdAt, since))
          .then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(partners).then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(promoApplications).then((r) => r[0]?.c ?? 0),
        db
          .select({ c: count() })
          .from(promoApplications)
          .where(eq(promoApplications.status, "approved"))
          .then((r) => r[0]?.c ?? 0),
        db
          .select({ c: count() })
          .from(promoApplications)
          .where(eq(promoApplications.status, "no_money"))
          .then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(scheduleEvents).then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(inviteGuests).then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(zoomAttendance).then((r) => r[0]?.c ?? 0),
        db.select({ c: count() }).from(personalInvites).then((r) => r[0]?.c ?? 0),
        db
          .select({ c: count() })
          .from(personalInvites)
          .where(sql`${personalInvites.registeredAt} IS NOT NULL`)
          .then((r) => r[0]?.c ?? 0),
      ]);

      const promoConversion = promoApps > 0 ? Number((promoApproved / promoApps).toFixed(4)) : 0;
      const inviteConversion =
        personalInvitesTotal > 0
          ? Number((personalInvitesRegistered / personalInvitesTotal).toFixed(4))
          : 0;

      res.json({
        period,
        since: since.toISOString(),
        now: now.toISOString(),
        sofia: { total: sofiaTotal, inPeriod: sofiaInPeriod },
        maria: { total: mariaTotal, inPeriod: mariaInPeriod },
        partners: { total: partnersTotal },
        promo: {
          total: promoApps,
          approved: promoApproved,
          noMoney: promoNoMoney,
          conversion: promoConversion,
        },
        events: {
          total: eventsTotal,
          guestsTotal,
          attendanceTotal,
        },
        personalInvites: {
          total: personalInvitesTotal,
          registered: personalInvitesRegistered,
          conversion: inviteConversion,
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: e?.message || "Internal error" });
    }
  });
}
