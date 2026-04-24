import { storage } from "../storage";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { sendGuestReminderEmail } from "./resend-email";

const POLL_INTERVAL_MS = 2 * 60 * 1000;
let pollerInterval: ReturnType<typeof setInterval> | null = null;

function getPartnerBotToken(): string | undefined {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return process.env.TELEGRAM_PARTNER_BOT_TOKEN;
  return process.env.TELEGRAM_PARTNER_BOT_TOKEN_DEV || process.env.TELEGRAM_PARTNER_BOT_TOKEN;
}


async function sendPartnerBotMessage(chatId: string, text: string): Promise<boolean> {
  const token = getPartnerBotToken();
  if (!token) {
    console.warn("Reminder skipped: partner bot token not set");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Reminder send error:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Reminder send failed:", error);
    return false;
  }
}

function getTimezoneOffset(tz: string): string {
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
    const parts = fmt.formatToParts(new Date());
    const tzPart = parts.find(p => p.type === "timeZoneName")?.value || "";
    const match = tzPart.match(/GMT([+-]\d{2}:\d{2})/);
    if (match) return match[1];
  } catch {}
  return "+01:00";
}

function parseEventDateTime(dateStr: string, timeStr: string, timezone?: string): Date | null {
  try {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return null;
    const offset = getTimezoneOffset(timezone || "CET");
    const dt = new Date(`${match[0]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00${offset}`);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch {
    return null;
  }
}

async function sendReminderForInvite(
  invite: any,
  event: any,
  partner: any,
  isAdvance: boolean,
): Promise<boolean> {
  const guestName = invite.guestName || invite.prospectName;
  const guestLang = invite.guestLanguage || "de";
  const contactLines: string[] = [];
  if (invite.guestEmail) contactLines.push(`📧 ${invite.guestEmail}`);
  if (invite.guestPhone) contactLines.push(`📱 ${invite.guestPhone}`);
  if (invite.guestTelegram) contactLines.push(`💬 @${invite.guestTelegram.replace('@', '')}`);

  const channelLabel = invite.reminderChannel === "whatsapp" ? "WhatsApp"
    : invite.reminderChannel === "telegram" ? "Telegram"
    : invite.reminderChannel === "email" ? "Email"
    : null;

  const timeLabelDe = isAdvance ? "24 Stunden" : "1 Stunde";
  const eventTimeStr = `${event.date} ${event.time}`;

  const partnerMsg =
    `⏰ <b>Erinnerung senden!</b>\n\n` +
    `Dein Gast <b>${guestName}</b> hat in ${timeLabelDe} ein Webinar.\n\n` +
    `📋 <b>Event:</b> ${event.title}\n` +
    `🕐 <b>Wann:</b> ${eventTimeStr}\n` +
    `${channelLabel ? `📨 <b>Kanal:</b> ${channelLabel}\n` : ''}` +
    `${contactLines.length > 0 ? `\n<b>Kontakt:</b>\n${contactLines.join('\n')}\n` : ''}` +
    `\n💡 <i>Sende deinem Gast eine Erinnerung${channelLabel ? ` über ${channelLabel}` : ''}!</i>`;

  const partnerSent = await sendPartnerBotMessage(partner.telegramChatId, partnerMsg);
  if (!partnerSent) {
    console.warn(`Partner reminder failed for invite ${invite.id}; will retry next cycle`);
    return false;
  }

  const timeLabel = isAdvance ? "24 hours" : "1 hour";
  const timeLabelRu = isAdvance ? "24 часа" : "1 час";
  const timeLabelDeFull = isAdvance ? "24 Stunden" : "1 Stunde";

  const guestToken = invite.guestToken;
  if (!guestToken) {
    console.warn(`Invite ${invite.id} has no guestToken — skipping guest notification, partner already notified`);
    return true;
  }

  const baseUrl = process.env.NODE_ENV === "production"
    ? (process.env.PRODUCTION_URL || "https://jet-up.ai")
    : (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://jet-up.ai");

  const goLink = `${baseUrl}/go/${guestToken}`;
  const selectedChannel = invite.reminderChannel || invite.preferredChannel || "email";

  if (selectedChannel === "email" && invite.guestEmail) {
    const emailSent = await sendGuestReminderEmail({
      to: invite.guestEmail,
      name: guestName,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      timezone: event.timezone || "CET",
      speaker: event.speaker,
      zoomLink: event.link,
      goLink,
      language: guestLang,
    }).catch((err) => {
      console.error(`[Reminder] Failed to send guest reminder email to ${invite.guestEmail}:`, err);
      return false;
    });
    return emailSent;
  }

  if (selectedChannel === "telegram") {
    const isNumericChatId = invite.telegramChatId && /^-?\d+$/.test(invite.telegramChatId);
    if (isNumericChatId) {
      const safeTitle = event.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const safeSpeaker = event.speaker.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const reminderTexts: Record<string, string> = {
        en: `🎥 <b>Reminder!</b> The webinar "<b>${safeTitle}</b>" starts in ${timeLabel}!\n\n📅 ${event.date} | 🕐 ${event.time} ${event.timezone || "CET"}\n🎙 ${safeSpeaker}\n\n🔗 <b>Join now:</b> ${goLink}`,
        de: `🎥 <b>Erinnerung!</b> Das Webinar "<b>${safeTitle}</b>" beginnt in ${timeLabelDeFull}!\n\n📅 ${event.date} | 🕐 ${event.time} ${event.timezone || "CET"}\n🎙 ${safeSpeaker}\n\n🔗 <b>Jetzt teilnehmen:</b> ${goLink}`,
        ru: `🎥 <b>Напоминание!</b> Вебинар "<b>${safeTitle}</b>" начнётся через ${timeLabelRu}!\n\n📅 ${event.date} | 🕐 ${event.time} ${event.timezone || "CET"}\n🎙 ${safeSpeaker}\n\n🔗 <b>Войти сейчас:</b> ${goLink}`,
      };
      const tgMsg = reminderTexts[guestLang] || reminderTexts.de;

      const tgSent = await sendPartnerBotMessage(invite.telegramChatId, tgMsg);
      if (tgSent) {
        console.log(`[Reminder] Telegram guest reminder delivered to chat_id=${invite.telegramChatId} for invite#${invite.id}`);
      } else {
        console.warn(`[Reminder] Telegram guest reminder FAILED for chat_id=${invite.telegramChatId} invite#${invite.id}`);
      }
      return tgSent;
    } else {
      console.log(`[Reminder] Telegram reminder skipped for invite#${invite.id}: no numeric chat_id (username-only: ${invite.guestTelegram || 'none'})`);
      return false;
    }
  }

  return true;
}

export async function checkAndSendReminders(): Promise<number> {
  let sentCount = 0;

  try {
    const pendingInvites = await storage.getPersonalInvitesPendingAutoReminder();
    console.log(`[Reminder] Cycle start: ${pendingInvites.length} pending invite(s) to check`);
    if (pendingInvites.length === 0) return 0;

    const now = new Date();
    let skippedEventPassed = 0;
    let skippedNoPartner = 0;
    let skippedOutsideWindow = 0;
    for (const invite of pendingInvites) {
      try {
        const event = await storage.getScheduleEvent(invite.scheduleEventId);
        if (!event) {
          await storage.markPersonalInviteReminderSent(invite.id);
          console.log(`[Reminder] invite#${invite.id}: event not found, marking as sent`);
          continue;
        }

        const eventTime = parseEventDateTime(event.date, event.time, event.timezone);
        if (!eventTime) {
          console.warn(`[Reminder] invite#${invite.id}: cannot parse event date/time for event ${event.id}: ${event.date} ${event.time}`);
          continue;
        }

        const msUntilEvent = eventTime.getTime() - now.getTime();

        if (msUntilEvent < 0) {
          await storage.markPersonalInviteReminderSent(invite.id);
          skippedEventPassed++;
          continue;
        }

        const h24Ms = 24 * 60 * 60 * 1000;
        const h1Ms = 60 * 60 * 1000;
        const invite24hSent = !!(invite as any).reminder24hSent;

        const partner = await storage.getPartnerById(invite.partnerId);
        if (!partner) {
          await storage.markPersonalInviteReminderSent(invite.id);
          skippedNoPartner++;
          continue;
        }

        if (!invite24hSent && msUntilEvent <= h24Ms && msUntilEvent > h1Ms) {
          const ok = await sendReminderForInvite(invite, event, partner, true);
          if (ok) {
            await storage.markPersonalInviteReminder24hSent(invite.id);
            sentCount++;
            console.log(`[Reminder] 24h reminder SENT for invite#${invite.id} guest="${invite.guestName || invite.prospectName}" channel=${invite.reminderChannel || 'default'}`);
          } else {
            console.log(`[Reminder] 24h reminder FAILED for invite#${invite.id} guest="${invite.guestName || invite.prospectName}"`);
          }
          continue;
        }

        if (msUntilEvent <= h1Ms) {
          const ok = await sendReminderForInvite(invite, event, partner, false);
          if (ok) {
            await storage.markPersonalInviteReminderSent(invite.id);
            sentCount++;
            console.log(`[Reminder] 1h reminder SENT for invite#${invite.id} guest="${invite.guestName || invite.prospectName}" channel=${invite.reminderChannel || 'default'}`);
          } else {
            console.log(`[Reminder] 1h reminder FAILED for invite#${invite.id} guest="${invite.guestName || invite.prospectName}"`);
          }
        } else {
          skippedOutsideWindow++;
        }
      } catch (err) {
        console.error(`[Reminder] Error processing invite#${invite.id}:`, err);
      }
    }

    console.log(`[Reminder] Cycle complete: ${sentCount} sent, ${skippedEventPassed} event-passed, ${skippedNoPartner} no-partner, ${skippedOutsideWindow} outside-window`);
  } catch (error) {
    console.error("[Reminder] Scheduler error:", error);
  }

  return sentCount;
}

async function ensureReminderColumn(): Promise<void> {
  try {
    await db.execute(sql`ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN NOT NULL DEFAULT false`);
  } catch (err) {
    console.warn("reminder_sent column migration skipped:", err);
  }
  try {
    await db.execute(sql`ALTER TABLE personal_invites ADD COLUMN IF NOT EXISTS guest_language TEXT`);
  } catch (err) {
    console.warn("guest_language column migration skipped:", err);
  }
}

export function startReminderScheduler(): void {
  if (pollerInterval) return;

  console.log(`Starting reminder scheduler (every ${POLL_INTERVAL_MS / 1000}s)`);

  ensureReminderColumn().then(() => {
    pollerInterval = setInterval(() => {
      checkAndSendReminders().catch((err) =>
        console.error("Reminder scheduler cycle error:", err)
      );
    }, POLL_INTERVAL_MS);

    setTimeout(() => {
      checkAndSendReminders().catch((err) =>
        console.error("Initial reminder check error:", err)
      );
    }, 15000);
  }).catch((err) => {
    console.error("Failed to start reminder scheduler:", err);
  });
}

export function stopReminderScheduler(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log("Reminder scheduler stopped");
  }
}
