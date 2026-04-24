import { storage } from "../storage";
import type { InsertZoomAttendance, PersonalInvite, InviteGuest } from "@shared/schema";

export async function loadZoomCredentialsFromDb(): Promise<void> {
  try {
    const accountId = await storage.getSetting("zoom_account_id");
    const clientId = await storage.getSetting("zoom_client_id");
    const clientSecret = await storage.getSetting("zoom_client_secret");
    if (accountId && !process.env.ZOOM_ACCOUNT_ID) process.env.ZOOM_ACCOUNT_ID = accountId;
    if (clientId && !process.env.ZOOM_CLIENT_ID) process.env.ZOOM_CLIENT_ID = clientId;
    if (clientSecret && !process.env.ZOOM_CLIENT_SECRET) process.env.ZOOM_CLIENT_SECRET = clientSecret;
  } catch (e) {
    console.error("Failed to load Zoom credentials from DB:", e);
  }
}

export async function saveZoomCredentialsToDb(accountId: string, clientId: string, clientSecret: string): Promise<void> {
  await storage.setSetting("zoom_account_id", accountId);
  await storage.setSetting("zoom_client_id", clientId);
  await storage.setSetting("zoom_client_secret", clientSecret);
  cachedToken = null;
}

interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ZoomParticipant {
  id?: string;
  name: string;
  user_email: string;
  join_time: string;
  leave_time: string;
  duration: number;
  role?: string;
}

interface ZoomQAEntry {
  email: string;
  question: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isZoomConfigured(): boolean {
  return !!(
    process.env.ZOOM_ACCOUNT_ID &&
    process.env.ZOOM_CLIENT_ID &&
    process.env.ZOOM_CLIENT_SECRET
  );
}

async function getZoomAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID!;
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch("https://zoom.us/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=account_credentials&account_id=${accountId}`,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zoom OAuth failed: ${err}`);
  }

  const data: ZoomTokenResponse = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export async function testZoomConnection(): Promise<{ ok: boolean; error?: string }> {
  if (!isZoomConfigured()) {
    return { ok: false, error: "Zoom credentials not configured (ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET)" };
  }
  try {
    const token = await getZoomAccessToken();
    const res = await fetch("https://api.zoom.us/v2/users?page_size=1", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Zoom API returned ${res.status}: ${body}` };
    }
    await res.json();
    return { ok: true, error: undefined };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

export async function fetchZoomMeetingParticipants(meetingId: string): Promise<ZoomParticipant[]> {
  if (!isZoomConfigured()) return [];

  try {
    const token = await getZoomAccessToken();
    const cleanId = meetingId.replace(/\s/g, "");

    let res = await fetch(
      `https://api.zoom.us/v2/report/meetings/${cleanId}/participants?page_size=300`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson: any = null;
      try { errorJson = JSON.parse(errorText); } catch {}

      if (res.status === 400 && errorText.toLowerCase().includes("webinar")) {
        console.log("Detected webinar, trying webinar endpoint:", cleanId);
        res = await fetch(
          `https://api.zoom.us/v2/report/webinars/${cleanId}/participants?page_size=300`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          const webinarErrorText = await res.text();
          let webinarErrorJson: any = null;
          try { webinarErrorJson = JSON.parse(webinarErrorText); } catch {}

          if (webinarErrorJson?.code === 4711) {
            throw new Error("SCOPE_ERROR:report:read:list_webinar_participants:admin");
          }
          console.error("Zoom webinar participants API error:", res.status, webinarErrorText);
          throw new Error(`Zoom webinar API error (${res.status}): ${webinarErrorText}`);
        }
      } else if (errorJson?.code === 4711) {
        throw new Error("SCOPE_ERROR:report:read:list_participants:admin");
      } else if (res.status === 404) {
        console.log("Zoom meeting not found or not yet ended:", cleanId);
        throw new Error("Meeting not found or has not ended yet. Zoom data is available after the meeting ends.");
      } else if (res.status === 429) {
        console.error("Zoom API rate limit hit");
        throw new Error("Zoom API rate limit reached. Please try again in a few minutes.");
      } else {
        console.error("Zoom participants API error:", res.status, errorText);
        throw new Error(`Zoom API error (${res.status}): ${errorText}`);
      }
    }

    const data = await res.json();
    return data.participants || [];
  } catch (error: any) {
    console.error("Failed to fetch Zoom participants:", error);
    throw error;
  }
}

export async function fetchZoomMeetingQA(meetingId: string): Promise<ZoomQAEntry[]> {
  if (!isZoomConfigured()) return [];

  try {
    const token = await getZoomAccessToken();
    const cleanId = meetingId.replace(/\s/g, "");

    let res = await fetch(
      `https://api.zoom.us/v2/report/meetings/${cleanId}/qa`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 400 && errorText.toLowerCase().includes("webinar")) {
        console.log("Detected webinar Q&A, trying webinar endpoint:", cleanId);
        res = await fetch(
          `https://api.zoom.us/v2/report/webinars/${cleanId}/qa`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          return [];
        }
      } else {
        return [];
      }
    }

    const data = await res.json();
    const entries: ZoomQAEntry[] = [];
    for (const q of data.questions || []) {
      entries.push({ email: q.email || "", question: q.question_details?.[0]?.question || "" });
    }
    return entries;
  } catch {
    return [];
  }
}

async function fetchZoomHostEmail(meetingId: string): Promise<string | null> {
  if (!isZoomConfigured()) return null;
  try {
    const token = await getZoomAccessToken();

    const meetingRes = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (meetingRes.ok) {
      const data = await meetingRes.json();
      if (data.host_email) return data.host_email;
    }

    const pastRes = await fetch(`https://api.zoom.us/v2/past_meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (pastRes.ok) {
      const data = await pastRes.json();
      if (data.host_email) return data.host_email;
    }

    const userRes = await fetch(`https://api.zoom.us/v2/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (userRes.ok) {
      const data = await userRes.json();
      if (data.email) return data.email;
    }

    return null;
  } catch {
    return null;
  }
}

export function extractMeetingId(zoomUrl: string): string | null {
  const match = zoomUrl.match(/\/j\/(\d+)/);
  return match ? match[1] : null;
}

function fuzzyNameMatch(zoomName: string, guestName: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-zа-яёäöüß\s]/gi, "").trim();
  const a = normalize(zoomName);
  const b = normalize(guestName);
  if (!a || !b) return false;
  if (a === b) return true;
  const aParts = a.split(/\s+/).filter(Boolean);
  const bParts = b.split(/\s+/).filter(Boolean);
  const matchCount = aParts.filter(p => bParts.includes(p)).length;
  return matchCount >= Math.min(2, Math.min(aParts.length, bParts.length));
}

export async function syncZoomDataForEvent(inviteEventId: number, zoomMeetingUrl: string, eventDate?: string): Promise<{
  participants: ZoomParticipant[];
  synced: number;
  skipped: number;
  error?: string;
}> {
  if (!isZoomConfigured()) {
    return { participants: [], synced: 0, skipped: 0, error: "Zoom not configured" };
  }

  const meetingId = extractMeetingId(zoomMeetingUrl);
  if (!meetingId) {
    return { participants: [], synced: 0, skipped: 0, error: "Invalid Zoom URL — could not extract meeting ID" };
  }

  let participants: ZoomParticipant[];
  try {
    participants = await fetchZoomMeetingParticipants(meetingId);
  } catch (error: any) {
    return { participants: [], synced: 0, skipped: 0, error: error.message };
  }
  if (participants.length === 0) {
    return { participants: [], synced: 0, skipped: 0 };
  }

  if (eventDate && /^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    const eventMidnightUtc = new Date(`${eventDate}T00:00:00Z`).getTime();
    const windowMs = 12 * 60 * 60 * 1000;
    const windowStart = eventMidnightUtc - windowMs;
    const windowEnd = eventMidnightUtc + 24 * 60 * 60 * 1000 + windowMs;
    const before = participants.length;
    participants = participants.filter((p) => {
      const joinMs = new Date(p.join_time).getTime();
      return joinMs >= windowStart && joinMs <= windowEnd;
    });
    const filtered = before - participants.length;
    if (filtered > 0) {
      console.log(`[ZoomSync] Filtered out ${filtered} participant(s) from other occurrences (eventDate=${eventDate})`);
    }
  }

  const hasRoles = participants.some(p => p.role);
  let hostEmail: string | null = process.env.ZOOM_HOST_EMAIL || null;
  if (!hasRoles && !hostEmail) {
    hostEmail = await fetchZoomHostEmail(meetingId);
  }
  if (hostEmail) {
    console.log(`[ZoomSync] Host email for filtering: ${hostEmail}`);
  }

  const beforeHostFilter = participants.length;
  participants = participants.filter(p => {
    if (hasRoles) {
      const role = (p.role || "").toLowerCase();
      return role !== "host" && role !== "panelist";
    }
    if (hostEmail && p.user_email && p.user_email.toLowerCase() === hostEmail.toLowerCase()) {
      return false;
    }
    return true;
  });
  const hostFiltered = beforeHostFilter - participants.length;
  if (hostFiltered > 0) {
    console.log(`[ZoomSync] Filtered out ${hostFiltered} host/panelist participant(s)`);
  }

  const qaData = await fetchZoomMeetingQA(meetingId);
  const guests = await storage.getGuestsByEventId(inviteEventId);
  const existingAttendance = await storage.getZoomAttendanceByEventId(inviteEventId);
  const existingEmails = new Set(existingAttendance.map(a => a.participantEmail.toLowerCase()));

  const inviteEvent = await storage.getInviteEventById(inviteEventId);
  let personalInvitesForEvent: PersonalInvite[] = [];
  if (inviteEvent?.scheduleEventId && inviteEvent.partnerId) {
    const allPiForEvent = await storage.getPersonalInvitesByScheduleEventId(inviteEvent.scheduleEventId);
    personalInvitesForEvent = allPiForEvent.filter(pi => pi.partnerId === inviteEvent.partnerId);
  }

  let synced = 0;
  let skipped = 0;

  const TIME_PROXIMITY_MS = 10 * 60 * 1000;

  for (const participant of participants) {
    const email = participant.user_email?.toLowerCase() || "";
    if (existingEmails.has(email)) {
      skipped++;
      continue;
    }

    const joinTime = new Date(participant.join_time);

    let matchedGuestId: number | null = null;

    const directMatch = guests.find((g) => g.email.toLowerCase() === email);
    if (directMatch) {
      matchedGuestId = directMatch.id;
    }

    if (!matchedGuestId) {
      const timeMatch = guests.find((g) => {
        const goClickedAt = g.goClickedAt;
        if (!goClickedAt) return false;
        const diff = Math.abs(new Date(goClickedAt).getTime() - joinTime.getTime());
        return diff <= TIME_PROXIMITY_MS;
      });
      if (timeMatch) {
        matchedGuestId = timeMatch.id;
        console.log(`[ZoomSync] Time-proximity match (invite_guests): ${participant.user_email} ↔ guest#${timeMatch.id}`);
      }
    }

    if (!matchedGuestId && personalInvitesForEvent.length > 0) {
      const piEmailMatch = personalInvitesForEvent.find(
        (pi) => pi.guestEmail && pi.guestEmail.toLowerCase() === email && pi.registeredAt
      );
      if (piEmailMatch) {
        const linkedGuest = findLinkedGuestInSameEvent(piEmailMatch, guests);
        if (linkedGuest) {
          matchedGuestId = linkedGuest.id;
          console.log(`[ZoomSync] Email match via personal_invite: ${email} ↔ guest#${linkedGuest.id} (pi#${piEmailMatch.id})`);
        }
      }

      if (!matchedGuestId) {
        const piTimeMatch = personalInvitesForEvent.find((pi) => {
          if (!pi.goClickedAt) return false;
          const diff = Math.abs(new Date(pi.goClickedAt).getTime() - joinTime.getTime());
          return diff <= TIME_PROXIMITY_MS;
        });
        if (piTimeMatch) {
          const linkedGuest = findLinkedGuestInSameEvent(piTimeMatch, guests);
          if (linkedGuest) {
            matchedGuestId = linkedGuest.id;
            console.log(`[ZoomSync] Time-proximity match via personal_invite: ${participant.user_email} ↔ guest#${linkedGuest.id} (pi#${piTimeMatch.id})`);
          }
        }
      }

      if (!matchedGuestId && (!email || email === "unknown" || email === "")) {
        const pName = participant.name || "";
        const piNameMatch = personalInvitesForEvent.find((pi) => {
          const gName = pi.guestName || pi.prospectName || "";
          return gName && fuzzyNameMatch(pName, gName);
        });
        if (piNameMatch) {
          const linkedGuest = findLinkedGuestInSameEvent(piNameMatch, guests);
          if (linkedGuest) {
            matchedGuestId = linkedGuest.id;
            console.log(`[ZoomSync] Fuzzy name match via personal_invite: "${pName}" ↔ guest#${linkedGuest.id} (pi#${piNameMatch.id})`);
          }
        }
      }
    }

    const questionsCount = qaData.filter(
      (q) => q.email.toLowerCase() === email
    ).length;

    const attendanceData: InsertZoomAttendance = {
      inviteGuestId: matchedGuestId,
      inviteEventId,
      participantEmail: participant.user_email || "unknown",
      participantName: participant.name,
      joinTime,
      leaveTime: new Date(participant.leave_time),
      durationMinutes: Math.round(participant.duration / 60),
      questionsAsked: questionsCount,
    };

    await storage.createZoomAttendance(attendanceData);
    existingEmails.add(email);
    synced++;
    console.log(`[ZoomSync] Persisted attendance: ${participant.user_email} — ${Math.round(participant.duration / 60)}min (eventId=${inviteEventId}, guestId=${matchedGuestId || 'NULL'})`);
  }

  console.log(`[ZoomSync] Complete for eventId=${inviteEventId}: ${synced} synced, ${skipped} skipped, ${participants.length} total participants`);
  return { participants, synced, skipped };
}

function findLinkedGuestInSameEvent(
  personalInvite: PersonalInvite,
  guestsInThisEvent: InviteGuest[]
): InviteGuest | null {
  if (!personalInvite.guestEmail) return null;
  return guestsInThisEvent.find(
    (g) => g.email.toLowerCase() === personalInvite.guestEmail!.toLowerCase()
  ) ?? null;
}
