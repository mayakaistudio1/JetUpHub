import { storage } from "../storage";
import { syncZoomDataForEvent, isZoomConfigured } from "./zoom-api";

const POLL_INTERVAL_MS = 10 * 60 * 1000;
const WEBINAR_DURATION_MS = 60 * 60 * 1000;
let pollerInterval: ReturnType<typeof setInterval> | null = null;

function getTimezoneOffsetForDate(tz: string, refDate: Date): string {
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
    const parts = fmt.formatToParts(refDate);
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
    const roughDate = new Date(`${match[0]}T12:00:00Z`);
    const offset = getTimezoneOffsetForDate(timezone || "CET", roughDate);
    const dt = new Date(`${match[0]}T${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}:00${offset}`);
    if (isNaN(dt.getTime())) return null;
    return dt;
  } catch { return null; }
}

export async function checkAndAutoSyncZoom(): Promise<number> {
  if (!isZoomConfigured()) return 0;

  let syncedTotal = 0;

  try {
    const allScheduleEvents = await storage.getScheduleEvents();
    const now = new Date();

    for (const se of allScheduleEvents) {
      const eventStartDt = parseEventDateTime(se.date, se.time, se.timezone);
      if (!eventStartDt) continue;

      const eventEndDt = new Date(eventStartDt.getTime() + WEBINAR_DURATION_MS);
      const minSinceEnd = (now.getTime() - eventEndDt.getTime()) / (60 * 1000);

      if (minSinceEnd < 30 || minSinceEnd > 90) continue;

      const allInviteEvents = await storage.getInviteEventsByScheduleEventId(se.id);
      if (allInviteEvents.length === 0) continue;

      for (const ie of allInviteEvents) {
        const existingAttendance = await storage.getZoomAttendanceByEventId(ie.id);
        if (existingAttendance.length > 0) continue;

        try {
          const zoomUrl = ie.zoomLink || se.link;
          const result = await syncZoomDataForEvent(ie.id, zoomUrl, ie.eventDate);
          syncedTotal += result.synced;
          if (result.error) {
            console.warn(`[ZoomAutoSync] Error for inviteEvent ${ie.id}: ${result.error}`);
          } else {
            console.log(`[ZoomAutoSync] Synced inviteEvent ${ie.id} (event "${se.title}"): ${result.synced} participant(s)`);
          }
        } catch (err) {
          console.error(`[ZoomAutoSync] Failed for inviteEvent ${ie.id}:`, err);
        }
      }
    }

    if (syncedTotal > 0) {
      console.log(`[ZoomAutoSync] Total synced: ${syncedTotal} participant(s)`);
    }
  } catch (error) {
    console.error("[ZoomAutoSync] Scheduler error:", error);
  }

  return syncedTotal;
}

export function startZoomSyncScheduler(): void {
  if (pollerInterval) return;

  console.log(`Starting Zoom auto-sync scheduler (every ${POLL_INTERVAL_MS / 1000}s)`);

  pollerInterval = setInterval(() => {
    checkAndAutoSyncZoom().catch((err) =>
      console.error("[ZoomAutoSync] Cycle error:", err)
    );
  }, POLL_INTERVAL_MS);

  setTimeout(() => {
    checkAndAutoSyncZoom().catch((err) =>
      console.error("[ZoomAutoSync] Initial check error:", err)
    );
  }, 30000);
}

export function stopZoomSyncScheduler(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
    console.log("Zoom auto-sync scheduler stopped");
  }
}
