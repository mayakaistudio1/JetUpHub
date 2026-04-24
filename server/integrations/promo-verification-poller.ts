import { pollPromoSheetForVerifications, syncAllPromoApplications } from "../googleSheets";
import { storage } from "../storage";
import { sendPromoVerificationEmail, sendPromoNoMoneyEmail } from "./resend-email";
import { sendTelegramNotification } from "./telegram-notify";

const POLL_INTERVAL_MS = 3 * 60 * 1000;
let pollerInterval: ReturnType<typeof setInterval> | null = null;

export async function checkAndProcessVerifications(): Promise<number> {
  let processedCount = 0;

  try {
    console.log('[Poller] Running verification check...');
    const { verified: verifiedInSheet, noMoney: noMoneyInSheet } = await pollPromoSheetForVerifications();
    console.log(`[Poller] Found ${verifiedInSheet.length} verified, ${noMoneyInSheet.length} no-money entries`);

    for (const entry of verifiedInSheet) {
      try {
        const app = await storage.getUnverifiedPromoApplicationByEmail(entry.email, entry.cuNumber);
        if (!app) continue;

        await storage.markPromoApplicationVerified(app.id);

        const emailSent = await sendPromoVerificationEmail(entry.email, entry.name || app.name);

        if (emailSent) {
          await storage.markPromoApplicationEmailSent(app.id);
        }

        const tgMessage = formatVerificationMessage({
          name: app.name,
          email: app.email,
          cuNumber: app.cuNumber,
          emailSent,
          isRetry: app.status === "retry",
        });
        sendTelegramNotification(tgMessage).catch((err) =>
          console.error("TG verification notify error:", err)
        );

        processedCount++;
      } catch (err) {
        console.error(`Error processing verification for ${entry.email}:`, err);
      }
    }

    for (const entry of noMoneyInSheet) {
      try {
        const app = await storage.getApplicationByEmailForNoMoney(entry.email, entry.cuNumber);
        if (!app) continue;

        const emailSent = await sendPromoNoMoneyEmail(entry.email, entry.name || app.name);

        if (emailSent) {
          await storage.markPromoApplicationNoMoney(app.id);
          processedCount++;
          console.log(`No-money email sent and recorded for ${entry.email}`);
          sendTelegramNotification(
            `💸 <b>No Money Email (Sheet Poller)</b>\n\n` +
            `👤 ${app.name}\n` +
            `📧 ${app.email}\n` +
            `🔢 ${app.cuNumber}\n` +
            `📨 Email: Sent\n` +
            `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`
          ).catch(err => console.error("TG no-money poller notify error:", err));
        } else {
          console.error(`Failed to send no-money email for ${entry.email}`);
        }
      } catch (err) {
        console.error(`Error processing no-money for ${entry.email}:`, err);
      }
    }

    if (processedCount > 0) {
      console.log(`Processed ${processedCount} new promo action(s)`);
    }
    try {
      await syncAllPromoApplications();
      console.log("Google Sheet synced");
    } catch (syncErr) {
      console.error("Failed to sync Google Sheet after poller:", syncErr);
    }
  } catch (error) {
    console.error("Verification polling error:", error);
  }

  return processedCount;
}

function formatVerificationMessage(app: {
  name: string;
  email: string;
  cuNumber: string;
  emailSent: boolean;
  isRetry?: boolean;
}): string {
  const lines = [
    `✅ <b>Promo Application Verified!</b>${app.isRetry ? ` ↩️` : ``}`,
    ``,
  ];
  if (app.isRetry) {
    lines.push(`🔄 <i>Retry nach Aufladung — Antrag wurde nach No-Money-Schritt bestätigt.</i>`, ``);
  }
  lines.push(
    `👤 <b>Name:</b> ${app.name}`,
    `📧 <b>E-Mail:</b> ${app.email}`,
    `🔢 <b>CU-Nummer:</b> ${app.cuNumber}`,
    ``,
    app.emailSent
      ? `📨 Confirmation email sent successfully`
      : `⚠️ Failed to send confirmation email`,
    ``,
    `⏰ ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}`,
  );
  return lines.join("\n");
}

export function startVerificationPoller(): void {
  if (pollerInterval) return;

  console.log(`Starting promo verification poller (every ${POLL_INTERVAL_MS / 1000}s)`);

  pollerInterval = setInterval(() => {
    checkAndProcessVerifications().catch((err) =>
      console.error("Verification poller cycle error:", err)
    );
  }, POLL_INTERVAL_MS);

  setTimeout(() => {
    checkAndProcessVerifications().catch((err) =>
      console.error("Initial verification check error:", err)
    );
  }, 10000);
}

export function stopVerificationPoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log("Promo verification poller stopped");
  }
}
