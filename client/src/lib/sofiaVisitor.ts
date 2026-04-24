const STORAGE_KEY = "sofia-visitor-id";

interface TelegramWebAppUser {
  id?: number | string;
}
interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: { user?: TelegramWebAppUser };
}
interface TelegramWindowExt {
  Telegram?: { WebApp?: TelegramWebApp };
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function getVisitorId(): string {
  try {
    if (typeof window !== "undefined") {
      const w = window as Window & TelegramWindowExt;
      const tg = w.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (tg) return `tg-${String(tg)}`;
    }
  } catch {
    /* ignore */
  }
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const fresh = makeId();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return makeId();
  }
}

/**
 * Returns Telegram WebApp `initData` (signed by the bot token) when running
 * inside the Telegram WebView. Server-side routes that read/write
 * visitor-scoped data verify this header for `tg-*` visitorIds.
 */
export function getTelegramInitData(): string {
  try {
    if (typeof window !== "undefined") {
      const w = window as Window & TelegramWindowExt;
      return w.Telegram?.WebApp?.initData || "";
    }
  } catch {
    /* ignore */
  }
  return "";
}

/**
 * fetch() wrapper that automatically attaches `x-telegram-init-data` so
 * server-side IDOR checks succeed for `tg-<id>` visitor IDs.
 */
export function sofiaFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const initData = getTelegramInitData();
  const headers = new Headers(init.headers || {});
  if (initData && !headers.has("x-telegram-init-data")) {
    headers.set("x-telegram-init-data", initData);
  }
  return fetch(input, { ...init, headers });
}

export async function appendSofiaJournal(opts: {
  language: string;
  mode: "chat" | "voice" | "avatar";
  role: "user" | "assistant";
  content: string;
}): Promise<void> {
  const text = String(opts.content || "").trim();
  if (!text) return;
  try {
    await sofiaFetch("/api/sofia/dialog/append", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: getVisitorId(),
        language: opts.language,
        mode: opts.mode,
        role: opts.role,
        content: text,
      }),
      keepalive: true,
    });
  } catch {
    /* swallow — journaling is best-effort */
  }
}

export type SofiaMode = "chat" | "voice" | "avatar";
export interface SharedChatMsg {
  role: "user" | "assistant";
  content: string;
  mode?: SofiaMode;
  ts?: number;
}

const CHAT_KEY = (lang: string) => `sofia-recruit-chat-${lang}`;

export function loadSharedChat(lang: string): SharedChatMsg[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY(lang));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is SharedChatMsg =>
        m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"),
    );
  } catch {
    return [];
  }
}

export function saveSharedChat(lang: string, history: SharedChatMsg[]): void {
  try {
    localStorage.setItem(CHAT_KEY(lang), JSON.stringify(history));
  } catch {
    /* ignore quota/etc */
  }
}

/**
 * Append a turn to the shared local chat history (the same key
 * `sofia-recruit-chat-${lang}` that RecruitingChat reads). De-duplicates
 * the turn against the most recent entry so a transcript event that
 * arrives twice is collapsed into a single message. Notifies any
 * RecruitingChat instance that may be listening so it re-reads even
 * when not the active tab.
 */
export function appendSharedChatTurn(
  lang: string,
  role: "user" | "assistant",
  content: string,
  mode: SofiaMode,
): void {
  const text = String(content || "").trim();
  if (!text) return;
  const history = loadSharedChat(lang);
  const last = history[history.length - 1];
  if (last && last.role === role && last.content.trim() === text) {
    return;
  }
  history.push({ role, content: text, mode, ts: Date.now() });
  // Keep last 200 to bound localStorage growth.
  const trimmed = history.length > 200 ? history.slice(history.length - 200) : history;
  saveSharedChat(lang, trimmed);
  try {
    window.dispatchEvent(new CustomEvent("sofia:chat-updated", { detail: { lang } }));
  } catch {
    /* ignore */
  }
}

export async function clearSofiaJournal(): Promise<void> {
  try {
    await sofiaFetch(`/api/sofia/dialog?visitorId=${encodeURIComponent(getVisitorId())}`, {
      method: "DELETE",
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}
