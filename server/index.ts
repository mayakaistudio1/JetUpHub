import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname_ = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      await client.query("ALTER TABLE invite_guests ADD COLUMN IF NOT EXISTS invitation_method text");
      await client.query("ALTER TABLE invite_guests ADD COLUMN IF NOT EXISTS guest_token text UNIQUE");
      await client.query("ALTER TABLE invite_guests ADD COLUMN IF NOT EXISTS go_clicked_at timestamptz");
      await client.query("ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS guest_token text UNIQUE");
      await client.query("ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS go_clicked_at timestamptz");
      await client.query("ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS telegram_chat_id text");
      await client.query("ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS preferred_channel text");
      await client.query("ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS telegram_notifications_enabled boolean DEFAULT false");
      await client.query("ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS reminder24h_sent boolean DEFAULT false");
      await client.query("ALTER TABLE partners ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'en'");
      await client.query(`CREATE TABLE IF NOT EXISTS ama_questions (
        id SERIAL PRIMARY KEY,
        name text NOT NULL,
        contact text NOT NULL,
        question text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        created_at timestamptz NOT NULL DEFAULT NOW()
      )`);
      await client.query("ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS action_url text");
      await client.query("ALTER TABLE schedule_events ADD COLUMN IF NOT EXISTS action_label text");
      await client.query(`CREATE TABLE IF NOT EXISTS tutorials (
        id SERIAL PRIMARY KEY,
        youtube_url text NOT NULL,
        youtube_id text NOT NULL,
        title text NOT NULL,
        description text,
        category text NOT NULL DEFAULT 'getting-started',
        topic_tags text[] NOT NULL DEFAULT '{}',
        language text NOT NULL DEFAULT 'en',
        sort_order integer NOT NULL DEFAULT 0,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT NOW()
      )`);
      log("Database migrations applied", "db");
    } finally {
      client.release();
      await pool.end();
    }
  } catch (e) {
    console.error("Migration error:", e);
  }

  const { seedDatabase } = await import("./seed");
  try {
    await seedDatabase();
  } catch (e) {
    console.error("Seed error:", e);
  }

  const { loadZoomCredentialsFromDb } = await import("./integrations/zoom-api");
  await loadZoomCredentialsFromDb();

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  const { buildCrawlerHtml, injectOgTags } = await import("./og-inject");
  const BOT_UA = /TelegramBot|WhatsApp|Twitterbot|facebookexternalhit|LinkedInBot|Slackbot|Discordbot/i;
  app.get(["/event/:id", "/promo/:id"], async (req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    if (!BOT_UA.test(ua)) return next();
    try {
      const protocol = req.headers["x-forwarded-proto"] || "https";
      const host = req.headers.host || "";
      const baseUrl = `${protocol}://${host}`;
      const html = await buildCrawlerHtml(req.path, baseUrl);
      if (html) {
        return res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(html);
      }
    } catch (e) {
      console.error("Crawler OG error:", e);
    }
    next();
  });

  app.use((req, res, next) => {
    const originalPath = req.path;
    const eventMatch = originalPath.match(/^\/event\/(\d+)$/);
    const promoMatch = originalPath.match(/^\/promo\/(\d+)$/);
    if (!eventMatch && !promoMatch) return next();

    const originalEnd = res.end.bind(res);
    res.end = function (chunk?: any, ...args: any[]) {
      const ct = res.getHeader("content-type")?.toString() || "";
      if (chunk && ct.includes("text/html")) {
        const html = typeof chunk === "string" ? chunk : Buffer.isBuffer(chunk) ? chunk.toString("utf-8") : String(chunk);
        const protocol = req.headers["x-forwarded-proto"] || "https";
        const host = req.headers.host || "";
        const baseUrl = `${protocol}://${host}`;
        injectOgTags(originalPath, html, baseUrl).then((modified) => {
          res.setHeader("content-length", Buffer.byteLength(modified, "utf-8"));
          originalEnd(modified, "utf-8");
        }).catch(() => {
          originalEnd(chunk, ...args);
        });
        return res;
      }
      return originalEnd(chunk, ...args);
    } as any;
    next();
  });

  app.use(express.static(path.resolve(__dirname_, "..", "public")));

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
