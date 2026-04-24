import type { Request } from "express";
import crypto from "node:crypto";

/**
 * IDOR guard for endpoints that read or write visitor-scoped data
 * (Sofia journal, recruiting chat history, session start). visitorIds
 * of the form `tg-<telegramId>` are predictable (anyone can guess
 * another user's Telegram numeric id), so for those we require a
 * Telegram WebApp `initData` payload (header `x-telegram-init-data`)
 * signed by our bot token, AND the user.id inside it must match.
 *
 * Random uuid visitorIds (anonymous landing visitors) are unguessable
 * client-generated identifiers and are accepted as-is.
 *
 * Returns null when authorized, or an {error, status} object to send.
 */
export function authorizeVisitorOwnership(
  req: Request,
  visitorId: string,
): { error: string; status: number } | null {
  if (!visitorId.startsWith("tg-")) return null;
  const expectedId = visitorId.slice(3);
  const initData = String(req.header("x-telegram-init-data") || "");
  if (!initData) return { error: "Auth required for tg-* visitorId", status: 401 };
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.PARTNER_BOT_TOKEN || "";
  if (!botToken) return { error: "Bot not configured", status: 503 };
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return { error: "Missing initData hash", status: 401 };
    params.delete("hash");
    const entries: Array<[string, string]> = [];
    params.forEach((v, k) => { entries.push([k, v]); });
    const dataCheckString = entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const expectedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    if (
      expectedHash.length !== hash.length ||
      !crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(hash))
    ) return { error: "Invalid initData signature", status: 401 };
    const authDateStr = params.get("auth_date");
    if (authDateStr) {
      const now = Math.floor(Date.now() / 1000);
      if (now - parseInt(authDateStr, 10) > 86400) return { error: "initData expired", status: 401 };
    }
    const userJson = params.get("user");
    if (!userJson) return { error: "No user in initData", status: 401 };
    const user = JSON.parse(userJson);
    if (String(user?.id || "") !== expectedId) return { error: "visitorId/user mismatch", status: 403 };
    return null;
  } catch {
    return { error: "initData validation failed", status: 401 };
  }
}
