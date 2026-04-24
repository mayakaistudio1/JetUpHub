import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema, insertPromoApplicationSchema, insertDennisPromoSchema, insertInviteEventSchema, insertInviteGuestSchema, insertTutorialSchema, insertAmaQuestionSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { registerLiveAvatarRoutes } from "./integrations/liveavatar";
import { registerSofiaProxyRoutes, startSofiaBackgroundJobs } from "./integrations/sofia-proxy";
import { registerMariaChatRoutes } from "./integrations/maria-chat";
import { registerDennisChatRoutes } from "./integrations/dennis-chat";
import { db } from "./db";
import { chatSessions, chatMessages, scheduleEvents } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { objectStorageClient } from "./replit_integrations/object_storage";
import { syncAllChatSessions, appendPromoApplicationToSheet, syncAllPromoApplications, syncAllAmaQuestions } from "./googleSheets";
import { MARIA_SYSTEM_PROMPT_DE, MARIA_SYSTEM_PROMPT_EN, MARIA_SYSTEM_PROMPT_RU } from "./integrations/maria-chat";
import { LIVEAVATAR_SYSTEM_PROMPT } from "./integrations/liveavatar";
import OpenAI from "openai";
import { sendTelegramNotification, formatPromoApplicationMessage } from "./integrations/telegram-notify";
import { startVerificationPoller, checkAndProcessVerifications } from "./integrations/promo-verification-poller";
import { startReminderScheduler } from "./integrations/reminder-scheduler";
import { startZoomSyncScheduler } from "./integrations/zoom-sync-scheduler";
import { syncZoomDataForEvent } from "./integrations/zoom-api";
import { registerPartnerBotRoutes, notifyPartnerNewRegistration } from "./integrations/partner-bot";
import { registerPartnerAppRoutes } from "./partner-app-routes";
import { registerHqReadonlyRoutes } from "./integrations/hq-readonly";
import { registerPresentationVideoRoutes } from "./integrations/presentation-video";
import { registerElevenLabsVoiceRoutes } from "./integrations/elevenlabs-voice";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

function getUploadBucketName(): string {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").map(p => p.trim()).filter(Boolean);
  if (publicPaths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set");
  const parts = publicPaths[0].split("/").filter(Boolean);
  return parts[0];
}

function getUploadPrefix(): string {
  const publicPaths = (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "").split(",").map(p => p.trim()).filter(Boolean);
  if (publicPaths.length === 0) throw new Error("PUBLIC_OBJECT_SEARCH_PATHS not set");
  const parts = publicPaths[0].split("/").filter(Boolean);
  return parts.slice(1).join("/");
}

function requireAdmin(req: any, res: any): boolean {
  const password = req.headers['x-admin-password'] || req.body?.adminPassword;
  if (password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOGIN_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW = 15 * 60 * 1000;

function checkLoginRate(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.lastAttempt > LOGIN_RATE_WINDOW) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now });
    return true;
  }
  if (entry.count >= LOGIN_RATE_LIMIT) return false;
  entry.count++;
  entry.lastAttempt = now;
  return true;
}

function groupEventsByTranslation(events: any[], lang: string): any[] {
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
      result.push({ ...event, isMultiLang: false });
    } else if (!seen.has(event.translationGroup)) {
      seen.add(event.translationGroup);
      const group = grouped.get(event.translationGroup)!;
      const isMultiLang = group.length > 1;
      const preferred = group.find((e: any) => e.language === lang) || group[0];
      result.push({ ...preferred, isMultiLang });
    }
  }

  return result;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  registerLiveAvatarRoutes(app);
  registerSofiaProxyRoutes(app);
  startSofiaBackgroundJobs();
  registerMariaChatRoutes(app);
  registerDennisChatRoutes(app);
  registerPartnerBotRoutes(app);
  registerPartnerAppRoutes(app);
  registerHqReadonlyRoutes(app);
  registerPresentationVideoRoutes(app);
  registerElevenLabsVoiceRoutes(app);

  const objectStorage = new (await import("./replit_integrations/object_storage")).ObjectStorageService();
  app.get("/uploads/:filename", async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const file = await objectStorage.searchPublicObject(`uploads/${filename}`);
      if (!file) {
        return next();
      }
      await objectStorage.downloadObject(file, res, 86400);
    } catch (error) {
      console.error("Error serving upload:", error);
      if (!res.headersSent) {
        next(error);
      }
    }
  });

  app.get("/assets/:filename", async (req, res, next) => {
    try {
      const filename = req.params.filename;
      const file = await objectStorage.searchPublicObject(filename);
      if (!file) {
        return next();
      }
      await objectStorage.downloadObject(file, res, 86400);
    } catch (error) {
      console.error("Error serving asset:", error);
      if (!res.headersSent) {
        next(error);
      }
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/applications", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/partner/promo-apply", async (req, res) => {
    try {
      const validatedData = insertPromoApplicationSchema.parse(req.body);

      if (!validatedData.cuNumber.toUpperCase().startsWith("CU")) {
        return res.status(400).json({ error: "CU-Nummer muss mit 'CU' beginnen" });
      }

      // findDuplicatePromoApplication excludes no_money records — so a user whose only prior
      // record is no_money is NOT considered a duplicate and can resubmit after topping up.
      // If a pending/verified/rejected record already exists, it is still caught as a duplicate.
      const existing = await storage.findDuplicatePromoApplication(validatedData.email, validatedData.cuNumber);
      const isDuplicate = !!existing;

      // Detect retry-after-topup: submission is not a duplicate, but a prior no_money record exists.
      // This means the user topped up and is resubmitting — signal this to admin via Telegram/Sheets.
      const priorNoMoney = !isDuplicate
        ? await storage.findNoMoneyApplication(validatedData.email, validatedData.cuNumber)
        : undefined;
      const isRetryAfterTopup = !!priorNoMoney;

      const application = await storage.createPromoApplication({
        ...validatedData,
        ...(isDuplicate ? { status: "duplicate" } : isRetryAfterTopup ? { status: "retry" } : {}),
      });

      let promoTitle: string | undefined;
      if (validatedData.promoId) {
        const promo = await storage.getDennisPromo(validatedData.promoId);
        promoTitle = promo?.title;
      }
      const tgMessage = formatPromoApplicationMessage({
        name: validatedData.name,
        email: validatedData.email,
        cuNumber: validatedData.cuNumber,
        promoTitle,
        isDuplicate,
        isRetryAfterTopup,
      });
      sendTelegramNotification(tgMessage).catch((err) =>
        console.error("TG notify error:", err)
      );

      const sheetStatus = isDuplicate ? "duplicate" : isRetryAfterTopup ? "retry" : "pending";
      appendPromoApplicationToSheet({
        name: validatedData.name,
        email: validatedData.email,
        cuNumber: validatedData.cuNumber,
        promoTitle,
        status: sheetStatus,
        createdAt: application.createdAt,
      }).catch((err) => console.error("Sheets append error:", err));

      res.status(201).json(application);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating promo application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/promo-applications", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const applications = await storage.getPromoApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching promo applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/promo-applications/:id/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      let updated;
      if (status === "approved") {
        const allApps = await storage.getPromoApplications();
        const application = allApps.find(a => a.id === id);
        if (!application) return res.status(404).json({ error: "Application not found" });
        if (application.emailSentAt) return res.status(400).json({ error: "Verification email already sent" });

        updated = await storage.markPromoApplicationVerified(id);

        if (application) {
          const { sendPromoVerificationEmail } = await import("./integrations/resend-email");
          const emailSent = await sendPromoVerificationEmail(application.email, application.name);
          if (emailSent) {
            await storage.markPromoApplicationEmailSent(id);
          }

          const { sendTelegramNotification } = await import("./integrations/telegram-notify");
          const isRetryApp = application.status === "retry";
          sendTelegramNotification(
            `✅ <b>Promo Approved (Main Admin)</b>${isRetryApp ? ` ↩️` : ``}\n\n` +
            (isRetryApp ? `🔄 <i>Retry nach Aufladung — Antrag wurde nach No-Money-Schritt bestätigt.</i>\n\n` : ``) +
            `👤 ${application.name}\n` +
            `📧 ${application.email}\n` +
            `🔢 ${application.cuNumber}\n` +
            `📨 Email: ${emailSent ? "Sent" : "Failed"}\n` +
            `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
          ).catch(err => console.error("TG notify error:", err));

          try {
            const { syncAllPromoApplications } = await import("./googleSheets");
            await syncAllPromoApplications();
          } catch (err) {
            console.error("Google Sheet sync error:", err);
          }
        }
      } else {
        updated = await storage.updatePromoApplicationStatus(id, status);
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating promo application status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/admin/promo-applications/:id/no-money", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const allApps = await storage.getPromoApplications();
      const application = allApps.find(a => a.id === id);
      if (!application) return res.status(404).json({ error: "Application not found" });
      if (application.noMoneyEmailSentAt) return res.status(400).json({ error: "No-money email already sent" });

      const { sendPromoNoMoneyEmail } = await import("./integrations/resend-email");
      const emailSent = await sendPromoNoMoneyEmail(application.email, application.name);

      if (emailSent) {
        await storage.markPromoApplicationNoMoney(id);
      }

      const { sendTelegramNotification } = await import("./integrations/telegram-notify");
      sendTelegramNotification(
        `💸 <b>No Money Email (Main Admin)</b>\n\n` +
        `👤 ${application.name}\n` +
        `📧 ${application.email}\n` +
        `🔢 ${application.cuNumber}\n` +
        `📨 Email: ${emailSent ? "Sent" : "Failed"}\n` +
        `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
      ).catch(err => console.error("TG notify error:", err));

      try {
        const { syncAllPromoApplications } = await import("./googleSheets");
        await syncAllPromoApplications();
      } catch (err) {
        console.error("Google Sheet sync error after no-money:", err);
      }

      res.json({ success: true, emailSent });
    } catch (error) {
      console.error("Error sending no-money email:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  function requirePromoAdmin(req: any, res: any): boolean {
    const password = req.headers['x-promo-password'] || req.body?.password;
    if (!password || password !== (process.env.PROMO_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }
    return true;
  }

  app.post("/api/promo-admin/login", async (req, res) => {
    const ip = req.ip || "unknown";
    if (!checkLoginRate(ip)) {
      return res.status(429).json({ error: "Too many login attempts" });
    }
    const { password } = req.body;
    const validPassword = process.env.PROMO_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
    if (password === validPassword) {
      return res.json({ success: true });
    }
    return res.status(401).json({ error: "Invalid password" });
  });

  app.get("/api/promo-admin/applications", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const applications = await storage.getPromoApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching promo applications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/promo-admin/applications/:id/verify", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const app = await storage.getPromoApplications();
      const application = app.find(a => a.id === id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (application.status === "approved" || application.status === "verified" || application.emailSentAt) {
        return res.status(400).json({ error: "Already approved" });
      }

      const updated = await storage.markPromoApplicationVerified(id);

      const { sendPromoVerificationEmail } = await import("./integrations/resend-email");
      const emailSent = await sendPromoVerificationEmail(application.email, application.name);

      if (emailSent) {
        await storage.markPromoApplicationEmailSent(id);
      }

      const { sendTelegramNotification } = await import("./integrations/telegram-notify");
      const isRetry = application.status === "retry";
      sendTelegramNotification(
        `✅ <b>Promo Verified (Admin Panel)</b>${isRetry ? ` ↩️` : ``}\n\n` +
        (isRetry ? `🔄 <i>Retry nach Aufladung — Antrag wurde nach No-Money-Schritt bestätigt.</i>\n\n` : ``) +
        `👤 ${application.name}\n` +
        `📧 ${application.email}\n` +
        `🔢 ${application.cuNumber}\n` +
        `📨 Email: ${emailSent ? "Sent" : "Failed"}\n` +
        `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
      ).catch(err => console.error("TG notify error:", err));

      try {
        const { syncAllPromoApplications } = await import("./googleSheets");
        await syncAllPromoApplications();
      } catch (err) {
        console.error("Google Sheet sync error:", err);
      }

      res.json({ ...updated, emailSent });
    } catch (error) {
      console.error("Error verifying promo application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/promo-admin/applications/:id/reject", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updatePromoApplicationStatus(id, "rejected");
      res.json(updated);
    } catch (error) {
      console.error("Error rejecting promo application:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/promo-admin/applications/:id/no-money", async (req, res) => {
    if (!requirePromoAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const apps = await storage.getPromoApplications();
      const application = apps.find(a => a.id === id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      if (application.noMoneyEmailSentAt) {
        return res.status(400).json({ error: "No-money email already sent" });
      }

      const { sendPromoNoMoneyEmail } = await import("./integrations/resend-email");
      const emailSent = await sendPromoNoMoneyEmail(application.email, application.name);

      let updated = application;
      if (emailSent) {
        updated = await storage.markPromoApplicationNoMoney(id);
      }

      try {
        const { syncAllPromoApplications } = await import("./googleSheets");
        await syncAllPromoApplications();
      } catch (err) {
        console.error("Google Sheet sync error after no-money:", err);
      }

      res.json({ ...updated, noMoneyEmailSent: emailSent });
    } catch (error) {
      console.error("Error sending no-money email:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dennis-promos", async (req, res) => {
    try {
      const language = req.query.language as string | undefined;
      const promos = await storage.getDennisPromos(true, language);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching dennis promos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/dennis-promos", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const promos = await storage.getDennisPromos(false);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching dennis promos:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/dennis-promos", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const promo = await storage.createDennisPromo(req.body);
      res.status(201).json(promo);
    } catch (error) {
      console.error("Error creating dennis promo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/dennis-promos/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const { id: _, createdAt, ...data } = req.body;
      const promo = await storage.updateDennisPromo(id, data);
      if (!promo) return res.status(404).json({ error: "Not found" });
      res.json(promo);
    } catch (error) {
      console.error("Error updating dennis promo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/dennis-promos/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDennisPromo(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dennis promo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || "unknown";
      if (!checkLoginRate(ip)) {
        return res.status(429).json({ error: "Zu viele Versuche. Bitte warten Sie 15 Minuten." });
      }
      const { password } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Invalid password" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/upload", upload.single("file"), async (req: any, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${crypto.randomBytes(8).toString("hex")}${ext}`;
      const bucketName = getUploadBucketName();
      const prefix = getUploadPrefix();
      const objectName = prefix ? `${prefix}/uploads/${filename}` : `uploads/${filename}`;
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      await file.save(req.file.buffer, {
        contentType: req.file.mimetype,
        metadata: { contentType: req.file.mimetype },
      });
      const filePath = `/uploads/${filename}`;
      res.json({ url: filePath });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.get("/api/speakers", async (req, res) => {
    try {
      const speakersList = await storage.getSpeakers(true);
      res.json(speakersList);
    } catch (error) {
      console.error("Error fetching speakers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/speakers", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const speakersList = await storage.getSpeakers(false);
      res.json(speakersList);
    } catch (error) {
      console.error("Error fetching speakers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/speakers", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const speaker = await storage.createSpeaker(req.body);
      res.status(201).json(speaker);
    } catch (error) {
      console.error("Error creating speaker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/speakers/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const speaker = await storage.updateSpeaker(id, req.body);
      if (!speaker) return res.status(404).json({ error: "Speaker not found" });
      res.json(speaker);
    } catch (error) {
      console.error("Error updating speaker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/speakers/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSpeaker(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting speaker:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions/export", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const sessions = await db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
      const allMessages = await db.select().from(chatMessages).orderBy(chatMessages.timestamp);

      const sessionMap = new Map<string, typeof sessions[0]>();
      for (const s of sessions) {
        sessionMap.set(s.sessionId, s);
      }

      let csv = "session_id,type,language,created_at,role,content,message_timestamp\n";
      for (const msg of allMessages) {
        const session = sessionMap.get(msg.sessionId);
        const escapedContent = `"${(msg.content || "").replace(/"/g, '""')}"`;
        csv += `${msg.sessionId},${session?.type || ""},${session?.language || ""},${session?.createdAt?.toISOString() || ""},${msg.role},${escapedContent},${msg.timestamp?.toISOString() || ""}\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=chat-sessions-export.csv");
      res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions/:sessionId/messages", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const messages = await storage.getChatSessionMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions/:sessionId/export", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getChatSessionMessages(sessionId);

      let csv = "session_id,role,content,timestamp\n";
      for (const msg of messages) {
        const escapedContent = `"${(msg.content || "").replace(/"/g, '""')}"`;
        csv += `${sessionId},${msg.role},${escapedContent},${msg.timestamp?.toISOString() || ""}\n`;
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=chat-${sessionId.substring(0, 8)}.csv`);
      res.send(csv);
    } catch (error) {
      console.error("Export session error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/chat-sessions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const filters = {
        type: req.query.type as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      };
      const sessions = await storage.getChatSessions(filters);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/promotions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const promo = await storage.getPromotion(id);
      if (!promo) return res.status(404).json({ error: "Not found" });
      res.json(promo);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/schedule-events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getScheduleEvent(id);
      if (!event) return res.status(404).json({ error: "Not found" });
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/promotions", async (req, res) => {
    try {
      const language = req.query.language as string | undefined;
      const promos = await storage.getPromotions(true, language);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/promotions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const promos = await storage.getPromotions(false);
      res.json(promos);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/promotions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { autoTranslate, ...promoData } = req.body;
      const promo = await storage.createPromotion(promoData);
      res.status(201).json(promo);
    } catch (error) {
      console.error("Error creating promotion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/promotions/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const promo = await storage.updatePromotion(id, req.body);
      if (!promo) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json(promo);
    } catch (error) {
      console.error("Error updating promotion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/promotions/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deletePromotion(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/schedule-events", async (req, res) => {
    try {
      const lang = (req.query.lang as string) || "de";
      const events = await storage.getScheduleEvents(true);
      const today = new Date().toISOString().split("T")[0];
      const filtered = events.filter((e: any) => {
        if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return false;
        return e.date >= today;
      });

      const grouped = groupEventsByTranslation(filtered, lang);
      res.json(grouped);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/schedule-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const events = await storage.getScheduleEvents(false);
      res.json(events);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/schedule-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { autoTranslate, languages, ...eventData } = req.body;

      const VALID_LANGS = ["de", "en", "ru"];
      if (Array.isArray(languages)) {
        const filtered = [...new Set(languages)].filter((l: string) => VALID_LANGS.includes(l));
        if (filtered.length === 0) {
          return res.status(400).json({ error: "At least one valid language (de, en, ru) is required" });
        }
      }

      const validLangs = Array.isArray(languages)
        ? [...new Set(languages)].filter((l: string) => VALID_LANGS.includes(l))
        : [];

      if (validLangs.length > 1) {
        const translationGroup = crypto.randomUUID();
        const created = await db.transaction(async (tx) => {
          const results = [];
          for (const lang of validLangs) {
            const [ev] = await tx.insert(scheduleEvents).values({
              ...eventData,
              language: lang,
              translationGroup,
            }).returning();
            results.push(ev);
          }
          return results;
        });
        res.status(201).json({ multiLang: true, count: created.length, languages: validLangs, events: created });
      } else {
        const lang = validLangs.length === 1 ? validLangs[0] : (eventData.language || "de");
        const event = await storage.createScheduleEvent({ ...eventData, language: lang });
        res.status(201).json(event);
      }
    } catch (error) {
      console.error("Error creating schedule event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/schedule-events/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const event = await storage.updateScheduleEvent(id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Schedule event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error updating schedule event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/schedule-events/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScheduleEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/analyze-maria", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { language, chatType, reportLanguage } = req.body || {};
      const langFilter = language && language !== "all" ? language : undefined;
      const typeFilter = chatType === "video" ? "video" : "text";
      const reportLang = reportLanguage === "ru" ? "Russian" : "German";

      const allSessions = await storage.getChatSessions({});
      const filtered = allSessions.filter((s: any) => {
        if (s.type !== typeFilter) return false;
        if (langFilter && s.language !== langFilter) return false;
        return true;
      });
      const limitedSessions = filtered.slice(0, 50);

      if (limitedSessions.length === 0) {
        const noDataMsg = reportLanguage === "ru"
          ? "Не найдено сессий для выбранных фильтров."
          : "Keine Sitzungen für die gewählten Filter gefunden.";
        return res.json({
          summary: noDataMsg,
          sections: [],
          sessionsAnalyzed: 0,
        });
      }

      const dialogues: string[] = [];
      for (const session of limitedSessions) {
        const msgs = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.sessionId))
          .orderBy(chatMessages.timestamp);
        if (msgs.length === 0) continue;
        const lines = msgs.map((m) => `${m.role === "user" ? "User" : "Maria"}: ${m.content}`);
        dialogues.push(
          `--- Session ${session.sessionId.substring(0, 8)} (${session.language}, ${session.type}) ---\n${lines.join("\n")}`
        );
      }

      if (dialogues.length === 0) {
        const noMsgText = reportLanguage === "ru"
          ? "Не найдено сообщений в сессиях."
          : "Keine Nachrichten in den Sitzungen gefunden.";
        return res.json({
          summary: noMsgText,
          sections: [],
          sessionsAnalyzed: 0,
        });
      }

      let mariaPrompt: string;
      let modeLabel: string;
      if (typeFilter === "video") {
        const videoPromptOverride = await storage.getSetting("maria_prompt_video");
        mariaPrompt = videoPromptOverride ?? LIVEAVATAR_SYSTEM_PROMPT;
        modeLabel = "Live Avatar (Video Call)";
      } else {
        const textLang = langFilter === "en" ? "en" : langFilter === "ru" ? "ru" : "de";
        const textPromptOverride = await storage.getSetting(`maria_prompt_text_${textLang}`);
        const defaultTextPrompt = langFilter === "en" ? MARIA_SYSTEM_PROMPT_EN : langFilter === "ru" ? MARIA_SYSTEM_PROMPT_RU : MARIA_SYSTEM_PROMPT_DE;
        mariaPrompt = textPromptOverride ?? defaultTextPrompt;
        modeLabel = "Text Chat";
      }

      const analysisSystemPrompt = `You are an expert AI assistant analyst. You will analyze chat dialogues between users and an AI assistant named Maria in ${modeLabel} mode.

Below is Maria's current system prompt for ${modeLabel} (her instructions):
=== MARIA SYSTEM PROMPT START ===
${mariaPrompt}
=== MARIA SYSTEM PROMPT END ===

CRITICAL INSTRUCTION: You MUST write the ENTIRE report exclusively in ${reportLang}. Every word of the output — including section titles, summaries, bullet points, and all text — must be in ${reportLang}. Do NOT use any other language. Do NOT default to English.

Analyze ALL the dialogues below and produce a detailed report IN ${reportLang} language with exactly these 5 sections (write section titles also in ${reportLang}):

1. Top user questions — The most frequent topics/questions users ask (list each with approximate count)
2. Problematic answers — Cases where Maria answered poorly: too long, inaccurate, off-topic, violated her prompt rules (cite specific examples with session IDs)
3. Drop-off points — Topics or moments where users leave the conversation or Maria cannot help (patterns)
4. Conversion analysis — How many dialogues lead to a registration/application/next step vs. users leaving without action
5. Prompt improvement recommendations — Specific, actionable suggestions for improving Maria's system prompt (with exact wording changes where possible)

Return ONLY valid JSON in this format (all text values must be in ${reportLang}):
{
  "summary": "Brief 2-3 sentence executive summary IN ${reportLang}",
  "sections": [
    { "title": "Section title IN ${reportLang}", "items": ["item 1 in ${reportLang}", "item 2 in ${reportLang}", ...] }
  ]
}`;

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: analysisSystemPrompt },
          { role: "user", content: `Here are ${dialogues.length} dialogues to analyze:\n\n${dialogues.join("\n\n")}` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      });

      const raw = completion.choices[0]?.message?.content || "{}";
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

      res.json({
        summary: parsed.summary || "Analysis complete",
        sections: parsed.sections || [],
        sessionsAnalyzed: dialogues.length,
      });
    } catch (error: any) {
      console.error("Maria analysis error:", error);
      res.status(500).json({ error: error.message || "Analysis failed" });
    }
  });

  app.get("/api/admin/export-dialogues", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const language = req.query.language as string | undefined;
      const chatType = req.query.chatType as string | undefined;
      const langFilter = language && language !== "all" ? language : undefined;
      const typeFilter = chatType === "video" ? "video" : "text";

      const allSessions = await storage.getChatSessions({});
      const filtered = allSessions.filter((s: any) => {
        if (s.type !== typeFilter) return false;
        if (langFilter && s.language !== langFilter) return false;
        return true;
      });
      const limitedSessions = filtered.slice(0, 50);

      const lines: string[] = [];
      for (const session of limitedSessions) {
        const msgs = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.sessionId))
          .orderBy(chatMessages.timestamp);
        if (msgs.length === 0) continue;
        lines.push(`=== Session ${session.sessionId.substring(0, 8)} | lang:${session.language} | type:${session.type} ===`);
        for (const m of msgs) {
          lines.push(`${m.role === "user" ? "User" : "Maria"}: ${m.content}`);
        }
        lines.push("");
      }

      const content = lines.join("\n");
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="dialogues-${typeFilter}-${langFilter || "all"}.txt"`);
      res.send(content);
    } catch (error: any) {
      console.error("Export dialogues error:", error);
      res.status(500).json({ error: error.message || "Export failed" });
    }
  });

  app.get("/api/admin/maria-prompt", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const mode = (req.query.mode as string) || "text";
      const language = (req.query.language as string) || "de";
      const key = mode === "video" ? "maria_prompt_video" : `maria_prompt_text_${language}`;
      const override = await storage.getSetting(key);
      let defaultPrompt: string;
      if (mode === "video") {
        defaultPrompt = LIVEAVATAR_SYSTEM_PROMPT;
      } else {
        defaultPrompt = language === "en" ? MARIA_SYSTEM_PROMPT_EN : language === "ru" ? MARIA_SYSTEM_PROMPT_RU : MARIA_SYSTEM_PROMPT_DE;
      }
      res.json({ prompt: override ?? defaultPrompt, isOverride: override !== null });
    } catch (error: any) {
      console.error("Get maria prompt error:", error);
      res.status(500).json({ error: error.message || "Failed to get prompt" });
    }
  });

  app.post("/api/admin/maria-prompt", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { mode, language, prompt } = req.body || {};
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "prompt is required" });
      }
      const resolvedMode = mode || "text";
      const key = resolvedMode === "video" ? "maria_prompt_video" : `maria_prompt_text_${language || "de"}`;
      await storage.setSetting(key, prompt);
      res.json({ ok: true });
    } catch (error: any) {
      console.error("Save maria prompt error:", error);
      res.status(500).json({ error: error.message || "Failed to save prompt" });
    }
  });

  app.post("/api/admin/sync-sheets", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const result = await syncAllChatSessions();
      res.json({
        success: true,
        sessionCount: result.sessionCount,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      });
    } catch (error: any) {
      console.error("Google Sheets sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync with Google Sheets" });
    }
  });

  app.post("/api/admin/sync-promo-sheets", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const result = await syncAllPromoApplications();
      res.json({
        success: true,
        count: result.count,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      });
    } catch (error: any) {
      console.error("Promo Sheets sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync promo applications" });
    }
  });

  app.post("/api/admin/sync-ama-sheets", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const result = await syncAllAmaQuestions();
      res.json({
        success: true,
        count: result.count,
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}`,
      });
    } catch (error: unknown) {
      console.error("AMA Sheets sync error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to sync AMA questions" });
    }
  });

  app.post("/api/admin/check-promo-verifications", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const count = await checkAndProcessVerifications();
      res.json({ success: true, processedCount: count });
    } catch (error: any) {
      console.error("Manual verification check error:", error);
      res.status(500).json({ error: error.message || "Failed to check verifications" });
    }
  });

  startVerificationPoller();
  startReminderScheduler();
  startZoomSyncScheduler();

  app.get("/api/invite/:code", async (req, res) => {
    try {
      const event = await storage.getInviteEventByCode(req.params.code);
      if (!event || !event.isActive) {
        return res.status(404).json({ error: "Event not found" });
      }
      const { zoomLink, ...publicEvent } = event;

      let scheduleEventData = null;
      if (event.scheduleEventId) {
        const se = await storage.getScheduleEvent(event.scheduleEventId);
        if (se) {
          scheduleEventData = {
            speaker: se.speaker,
            speakerPhoto: se.speakerPhoto,
            banner: se.banner,
            highlights: se.highlights,
            type: se.type,
            typeBadge: se.typeBadge,
            timezone: se.timezone,
            day: se.day,
            language: se.language,
          };
        }
      }

      res.json({ ...publicEvent, scheduleEvent: scheduleEventData });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invite/:code/register", async (req, res) => {
    try {
      const event = await storage.getInviteEventByCode(req.params.code);
      if (!event || !event.isActive) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Reject registrations for past events (timezone-aware)
      const eventDateIso = (() => {
        const d = event.eventDate;
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) {
          const [dd, mm, yyyy] = d.split(".");
          return `${yyyy}-${mm}-${dd}`;
        }
        return d;
      })();
      if (/^\d{4}-\d{2}-\d{2}$/.test(eventDateIso)) {
        let timezone = "Europe/Berlin";
        if (event.scheduleEventId) {
          const se = await storage.getScheduleEvent(event.scheduleEventId);
          if (se?.timezone) {
            const tzMap: Record<string, string> = {
              "CET": "Europe/Berlin", "CEST": "Europe/Berlin", "MEZ": "Europe/Berlin", "MESZ": "Europe/Berlin",
              "MSK": "Europe/Moscow", "GST": "Asia/Dubai",
              "EST": "America/New_York", "EDT": "America/New_York",
              "UTC": "UTC", "GMT": "UTC",
            };
            timezone = tzMap[se.timezone] ?? se.timezone;
          }
        }
        try {
          const eventDateTimeStr = `${eventDateIso}T${event.eventTime || "00:00"}:00`;
          const formatter = new Intl.DateTimeFormat("en", { timeZone: timezone, hour12: false,
            year: "numeric", month: "2-digit", day: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit" });
          const nowParts = formatter.formatToParts(new Date());
          const p = (type: string) => nowParts.find(x => x.type === type)?.value ?? "00";
          const nowInTz = new Date(`${p("year")}-${p("month")}-${p("day")}T${p("hour")}:${p("minute")}:${p("second")}`);
          const eventLocal = new Date(eventDateTimeStr);
          if (!isNaN(eventLocal.getTime()) && eventLocal < nowInTz) {
            return res.status(400).json({ message: "Dieses Event hat bereits stattgefunden." });
          }
        } catch {
          const eventDateTime = new Date(`${eventDateIso}T${event.eventTime || "00:00"}:00`);
          if (!isNaN(eventDateTime.getTime()) && eventDateTime < new Date()) {
            return res.status(400).json({ message: "Dieses Event hat bereits stattgefunden." });
          }
        }
      }

      // Reject duplicate email registrations for the same invite event
      const email = (req.body.email || "").trim().toLowerCase();
      if (email) {
        const existingGuests = await storage.getGuestsByEventId(event.id);
        const duplicate = existingGuests.find(g => g.email.trim().toLowerCase() === email);
        if (duplicate) {
          return res.status(400).json({ message: "Du bist bereits für dieses Event registriert." });
        }
      }

      const parsed = insertInviteGuestSchema.safeParse({
        ...req.body,
        inviteEventId: event.id,
        invitationMethod: "bulk_link",
      });
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const guest = await storage.addInviteGuest(parsed.data);
      notifyPartnerNewRegistration(event, guest).catch(err =>
        console.error("Partner notification error:", err)
      );

      if (event.scheduleEventId && email) {
        const se = await storage.getScheduleEvent(event.scheduleEventId);
        if (se) {
          const guestToken = guest.guestToken;
          const goLink = guestToken ? `https://jet-up.ai/go/${guestToken}` : undefined;
          const { sendGuestConfirmationEmail } = await import("./integrations/resend-email");
          const guestName = (req.body.name || "").trim();
          const lang = (req.body.language as string) || "de";
          sendGuestConfirmationEmail({
            to: email,
            name: guestName,
            eventTitle: se.title,
            eventDate: se.date,
            eventTime: se.time,
            timezone: se.timezone || "CET",
            speaker: se.speaker,
            zoomLink: se.link,
            goLink,
            language: lang,
          }).catch(err => console.error("Failed to send guest confirmation email:", err));
        }
      }

      res.json({ success: true, guestId: guest.id, guestToken: guest.guestToken });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invite/:code/click", async (req, res) => {
    try {
      const event = await storage.getInviteEventByCode(req.params.code);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      const { guestId } = req.body;
      if (guestId) {
        await storage.markGuestClickedZoom(guestId);
      }

      let zoomLink = event.zoomLink || "";
      if (zoomLink && !zoomLink.startsWith("http")) {
        const urlMatch = zoomLink.match(/https?:\/\/[^\s]+zoom\.us\/j\/\d+[^\s]*/i);
        if (urlMatch) {
          zoomLink = urlMatch[0];
        }
      }

      res.json({ zoomLink });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/go/:token", async (req, res) => {
    try {
      const { token } = req.params;

      let zoomLink: string | null = null;

      const guest = await storage.getInviteGuestByToken(token);
      if (guest) {
        await storage.markGuestGoClicked(guest.id);
        const event = await storage.getInviteEventById(guest.inviteEventId);
        zoomLink = event?.zoomLink || null;
      } else {
        const personalInvite = await storage.getPersonalInviteByGuestToken(token);
        if (personalInvite) {
          await storage.markPersonalInviteGoClicked(personalInvite.id);
          if (personalInvite.scheduleEventId) {
            const se = await storage.getScheduleEvent(personalInvite.scheduleEventId);
            zoomLink = se?.link || null;
          }
          if (personalInvite.guestEmail && personalInvite.scheduleEventId && personalInvite.partnerId) {
            try {
              const partnerInviteEvents = await storage.getInviteEventsByPartnerId(personalInvite.partnerId);
              const siblingEvents = partnerInviteEvents.filter(ie => ie.scheduleEventId === personalInvite.scheduleEventId);
              for (const ie of siblingEvents) {
                const linkedGuest = await storage.findInviteGuestByEmailAndEvent(personalInvite.guestEmail, ie.id);
                if (linkedGuest) {
                  await storage.markGuestGoClicked(linkedGuest.id);
                  console.log(`[/go] Propagated go_clicked_at from personal_invite#${personalInvite.id} to invite_guest#${linkedGuest.id} (partner#${personalInvite.partnerId})`);
                  break;
                }
              }
            } catch (err) {
              console.error("[/go] Error propagating go_clicked_at to invite_guest:", err);
            }
          }
        }
      }

      if (!zoomLink) {
        return res.status(404).send(`<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><title>Link ungültig</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa}
.box{text-align:center;padding:2rem;max-width:400px}.icon{font-size:3rem;margin-bottom:1rem}
h1{font-size:1.25rem;color:#1a1a1a;margin:0 0 .5rem}p{color:#666;font-size:.9rem}</style></head>
<body><div class="box"><div class="icon">🔗</div>
<h1>Link ist nicht mehr gültig</h1>
<p>Dieser Einladungslink wurde nicht gefunden oder ist abgelaufen. Bitte wende dich an deinen Partner.</p>
</div></body></html>`);
      }

      let cleanZoomLink = zoomLink.trim();
      if (!cleanZoomLink.startsWith("http")) {
        const urlMatch = cleanZoomLink.match(/https?:\/\/[^\s]+zoom\.us\/j\/\d+[^\s]*/i);
        if (urlMatch) cleanZoomLink = urlMatch[0];
      }

      res.redirect(302, cleanZoomLink);
    } catch (error: any) {
      console.error("[/go] Error:", error);
      res.status(500).send("Interner Fehler. Bitte versuche es später erneut.");
    }
  });

  app.post("/api/admin/invite-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const parsed = insertInviteEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const event = await storage.createInviteEvent(parsed.data);
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/invite-events", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const events = await storage.getAllInviteEvents();
      const zoomCounts = await storage.getZoomAttendanceCounts();
      const enriched = events.map(e => ({
        ...e,
        zoomSyncedCount: zoomCounts[e.id] || 0,
      }));
      res.json(enriched);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/invite-events/:id/report", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const event = await storage.getInviteEventById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Event not found" });
      const guests = await storage.getGuestsByEventId(event.id);
      const attendance = await storage.getZoomAttendanceByEventId(event.id);

      const attendanceMap = new Map<string, typeof attendance[0]>();
      for (const a of attendance) {
        attendanceMap.set(a.participantEmail.toLowerCase(), a);
      }

      const matchedEmails = new Set<string>();

      const guestsWithAttendance = guests.map(g => {
        const att = attendanceMap.get(g.email.toLowerCase());
        if (att) matchedEmails.add(g.email.toLowerCase());
        return {
          ...g,
          attended: !!att,
          durationMinutes: att ? (att.durationMinutes ?? null) : null,
          questionsAsked: att ? (att.questionsAsked ?? null) : null,
          joinTime: att?.joinTime ?? null,
          isWalkIn: false,
        };
      });

      const walkIns = attendance
        .filter(a => !matchedEmails.has(a.participantEmail.toLowerCase()))
        .map(a => ({
          id: -(a.id),
          name: a.participantName || a.participantEmail,
          email: a.participantEmail,
          phone: null,
          registeredAt: a.fetchedAt,
          clickedZoom: false,
          clickedAt: null,
          attended: true,
          durationMinutes: a.durationMinutes ?? null,
          questionsAsked: a.questionsAsked ?? null,
          joinTime: a.joinTime ?? null,
          isWalkIn: true,
        }));

      const allGuests = [...guestsWithAttendance, ...walkIns];
      const clicked = guestsWithAttendance.filter(g => g.clickedZoom);
      const notClicked = guestsWithAttendance.filter(g => !g.clickedZoom);
      const attended = guestsWithAttendance.filter(g => g.attended);

      res.json({
        event,
        guests: allGuests,
        stats: {
          totalRegistered: guests.length,
          totalClicked: clicked.length,
          totalNotClicked: notClicked.length,
          totalAttended: attended.length + walkIns.length,
          totalWalkIns: walkIns.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/invite-events/:id/send-report", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const event = await storage.getInviteEventById(Number(req.params.id));
      if (!event) return res.status(404).json({ error: "Event not found" });
      const guests = await storage.getGuestsByEventId(event.id);
      const clicked = guests.filter(g => g.clickedZoom);
      const notClicked = guests.filter(g => !g.clickedZoom);

      let msg = `📊 <b>Event-Bericht: ${event.title}</b>\n`;
      msg += `📅 ${event.eventDate} ${event.eventTime}\n`;
      msg += `👤 Partner: ${event.partnerName} (${event.partnerCu})\n\n`;
      msg += `📝 Registriert: ${guests.length} Gäste\n`;
      msg += `✅ Zoom beigetreten: ${clicked.length}\n`;
      msg += `❌ Nicht beigetreten: ${notClicked.length}\n`;

      if (clicked.length > 0) {
        msg += `\n<b>✅ Beigetreten:</b>\n`;
        clicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
      }
      if (notClicked.length > 0) {
        msg += `\n<b>❌ Nicht beigetreten:</b>\n`;
        notClicked.forEach(g => { msg += `  • ${g.name} (${g.email})\n`; });
      }

      await sendTelegramNotification(msg);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/partners", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const partnersList = await storage.getAllPartners();
      res.json(partnersList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/admin/partners/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      await storage.deletePartner(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/invites-grouped", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allScheduleEvents = await storage.getScheduleEvents();
      const allInviteEvents = await storage.getAllInviteEvents();
      const zoomCounts = await storage.getZoomAttendanceCounts();
      const allPartners = await storage.getAllPartners();
      const partnerMap = new Map(allPartners.map(p => [p.id, p]));

      const grouped = [];

      for (const se of allScheduleEvents) {
        const relatedInvites = allInviteEvents.filter(ie => ie.scheduleEventId === se.id);
        if (relatedInvites.length === 0) continue;

        let totalInvited = 0;
        let totalRegistered = 0;
        let totalAttended = 0;

        const partnerBreakdown = [];

        for (const ie of relatedInvites) {
          const guests = await storage.getGuestsByEventId(ie.id);
          const attendance = await storage.getZoomAttendanceByEventId(ie.id);
          const attendedByGuestId = new Set(attendance.filter(a => a.inviteGuestId).map(a => a.inviteGuestId));
          const attendedByEmail = new Map(attendance.map(a => [a.participantEmail.toLowerCase(), a]));

          const registered = guests.length;
          const attended = guests.filter(g =>
            attendedByGuestId.has(g.id) || attendedByEmail.has(g.email.toLowerCase())
          ).length;
          const matchedGuestIds = new Set(guests.filter(g =>
            attendedByGuestId.has(g.id) || attendedByEmail.has(g.email.toLowerCase())
          ).map(g => g.id));
          const walkIns = attendance.filter(a =>
            !a.inviteGuestId && !guests.some(g => g.email.toLowerCase() === a.participantEmail.toLowerCase())
          ).length;
          const zoomSynced = zoomCounts[ie.id] || 0;

          totalRegistered += registered;
          totalAttended += attended + walkIns;

          const partner = ie.partnerId ? partnerMap.get(ie.partnerId) : null;

          partnerBreakdown.push({
            inviteEventId: ie.id,
            partnerId: ie.partnerId,
            partnerName: ie.partnerName,
            partnerCu: ie.partnerCu,
            inviteCode: ie.inviteCode,
            isActive: ie.isActive,
            registered,
            clicked: ie.clickedCount || 0,
            attended: attended + walkIns,
            walkIns,
            zoomSynced,
            guests: guests.map(g => ({
              id: g.id,
              name: g.name,
              email: g.email,
              phone: g.phone,
              registeredAt: g.registeredAt,
              clickedZoom: g.clickedZoom,
              goClickedAt: g.goClickedAt,
              invitationMethod: g.invitationMethod,
              attended: attendedByGuestId.has(g.id) || attendedByEmail.has(g.email.toLowerCase()),
              durationMinutes: (attendance.find(a => a.inviteGuestId === g.id) || attendedByEmail.get(g.email.toLowerCase()))?.durationMinutes ?? null,
              questionsAsked: (attendance.find(a => a.inviteGuestId === g.id) || attendedByEmail.get(g.email.toLowerCase()))?.questionsAsked ?? null,
              joinTime: (attendance.find(a => a.inviteGuestId === g.id) || attendedByEmail.get(g.email.toLowerCase()))?.joinTime ?? null,
            })),
          });
        }

        const personalInvites = await storage.getPersonalInvitesByScheduleEventId(se.id);
        const unregisteredPi = personalInvites.filter(pi => !pi.registeredAt).length;
        totalInvited = unregisteredPi + totalRegistered;

        grouped.push({
          scheduleEvent: {
            id: se.id,
            title: se.title,
            date: se.date,
            time: se.time,
            timezone: se.timezone,
            speaker: se.speaker,
            link: se.link,
            isActive: se.isActive,
          },
          stats: {
            totalPartners: relatedInvites.length,
            totalInvited,
            totalRegistered,
            totalAttended,
          },
          partners: partnerBreakdown,
        });
      }

      grouped.sort((a, b) => b.scheduleEvent.date.localeCompare(a.scheduleEvent.date));
      res.json(grouped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/zoom-resync-all", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const allScheduleEvents = await storage.getScheduleEvents();
      let totalSynced = 0;
      let totalErrors = 0;
      const results: Array<{ eventId: number; title: string; synced: number; error?: string }> = [];

      for (const se of allScheduleEvents) {
        if (!se.link) continue;
        const inviteEventsForSe = await storage.getInviteEventsByScheduleEventId(se.id);

        for (const ie of inviteEventsForSe) {
          try {
            await storage.deleteZoomAttendanceByEventId(ie.id);
            const zoomUrl = ie.zoomLink || se.link;
            const result = await syncZoomDataForEvent(ie.id, zoomUrl, ie.eventDate ?? undefined);
            totalSynced += result.synced;
            results.push({ eventId: ie.id, title: se.title, synced: result.synced, error: result.error });
            if (result.error) totalErrors++;
          } catch (err: any) {
            totalErrors++;
            results.push({ eventId: ie.id, title: se.title, synced: 0, error: err.message });
          }
        }
      }

      console.log(`[ZoomResyncAll] Complete: ${totalSynced} total synced, ${totalErrors} errors`);
      res.json({ totalSynced, totalErrors, results });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tutorials", async (req, res) => {
    try {
      const language = req.query.language as string | undefined;
      const category = req.query.category as string | undefined;
      const topicTag = req.query.topicTag as string | undefined;
      const tuts = await storage.getTutorials(true, language, category, topicTag);
      res.json(tuts);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/youtube-meta", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const videoId = req.query.videoId as string;
      if (!videoId) return res.status(400).json({ error: "videoId required" });

      let title = "";
      let description = "";

      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`;
        const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          const data = await response.json();
          title = data.title || "";
        }
      } catch {}

      try {
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, {
          signal: AbortSignal.timeout(5000),
          headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          if (!title) {
            const titleMatch = html.match(/<title>(.+?)\s*-\s*YouTube<\/title>/);
            if (titleMatch) {
              title = titleMatch[1].trim();
            }
          }
          const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
          if (descMatch) {
            description = descMatch[1]
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\");
          }
        }
      } catch {}

      res.json({ title, description });
    } catch (error) {
      console.error("Error fetching YouTube metadata:", error);
      res.json({ title: "", description: "" });
    }
  });

  app.get("/api/admin/tutorials", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const tuts = await storage.getTutorials(false);
      res.json(tuts);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/tutorials", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const parsed = insertTutorialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const tutorial = await storage.createTutorial(parsed.data);
      res.status(201).json(tutorial);
    } catch (error) {
      console.error("Error creating tutorial:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/tutorials/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      const { id: _, createdAt, ...data } = req.body;
      const existing = await storage.getTutorial(id);
      if (!existing) return res.status(404).json({ error: "Not found" });
      const parsed = insertTutorialSchema.partial().safeParse(data);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const tutorial = await storage.updateTutorial(id, parsed.data);
      res.json(tutorial);
    } catch (error) {
      console.error("Error updating tutorial:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/tutorials/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTutorial(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const LANDING_DEFAULTS: Record<string, number[]> = {
    de: [15, 16, 26],
    ru: [25, 17, 21, 23],
    en: [13, 18, 20, 24],
  };

  async function getLandingSettings() {
    const result: Record<string, number[]> = {};
    for (const lang of ["de", "ru", "en"]) {
      const raw = await storage.getSetting(`landing_pinned_${lang}`);
      result[lang] = raw ? JSON.parse(raw) : LANDING_DEFAULTS[lang];
    }
    return result;
  }

  app.get("/api/landing-settings", async (_req, res) => {
    try {
      res.json(await getLandingSettings());
    } catch (error) {
      console.error("Error fetching landing settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/landing-settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      res.json(await getLandingSettings());
    } catch (error) {
      console.error("Error fetching admin landing settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/landing-settings", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const { de, ru, en } = req.body as { de?: number[]; ru?: number[]; en?: number[] };
      if (de !== undefined) await storage.setSetting("landing_pinned_de", JSON.stringify(de));
      if (ru !== undefined) await storage.setSetting("landing_pinned_ru", JSON.stringify(ru));
      if (en !== undefined) await storage.setSetting("landing_pinned_en", JSON.stringify(en));
      res.json(await getLandingSettings());
    } catch (error) {
      console.error("Error updating landing settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/ama/questions", async (req, res) => {
    try {
      const parsed = insertAmaQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }
      const question = await storage.createAmaQuestion(parsed.data);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating AMA question:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ama/questions", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const questions = await storage.getAmaQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching AMA questions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/ama/questions/:id/status", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid question ID" });
      }
      const { status } = req.body;
      if (!["pending", "selected", "answered"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be pending, selected, or answered." });
      }
      const updated = await storage.updateAmaQuestionStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating AMA question status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
