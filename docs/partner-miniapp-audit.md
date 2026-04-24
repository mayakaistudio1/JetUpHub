# Partner Mini App — Full Audit

> **Scope:** Technical and functional audit of the Partner Mini App subsystem.  
> **Out of scope:** Maria AI assistant, Trading screen, Dennis/PDH pages, other system docs.  
> **Source:** All content derived directly from code analysis of real source files.

---

## 1. System Overview

The Partner Mini App is a Telegram WebApp (Mini App) that gives JetUP partners a mobile-optimized workspace for inviting guests to webinars, tracking registrations and attendance, and running AI-assisted follow-up.

### Entry Points
| Path | Description |
|------|-------------|
| `/partner-app` | Main Mini App shell (React SPA) |
| `/personal-invite/:code` | Public guest-facing personal invite page |
| `/invite/:code` | Legacy public social invite redirect |

### System Boundaries

```
Partner (Telegram)
    │
    ▼
Telegram Bot (@jetup_partner_bot)
    │  inline_keyboard → web_app URL
    ▼
Telegram WebApp (Mini App)
    │  initData auth (X-Telegram-Id header)
    ▼
React SPA (/partner-app)
    │  REST API
    ▼
Express Server (partner-app-routes.ts)
    │
    ├── PostgreSQL (Drizzle ORM)
    ├── OpenAI (gpt-4o-mini)
    ├── Zoom API (participant sync)
    └── Resend (email confirmations)

Guest (any browser)
    │
    ▼
Personal Invite Page (/personal-invite/:code)
    │  REST API (no auth)
    ▼
Express Server
    └── Telegram Bot (guest registration notifications)
```

### Feature Flag
```
PARTNER_APP_ENABLED=true   (or NODE_ENV=development)
```
All `/api/partner-app/*` routes return 404 when disabled.

---

## 2. Authentication & Authorization

### Partner Authentication

1. **Telegram WebApp** (primary): `Telegram.WebApp.initData` is parsed client-side; `chatId` is extracted and sent as `X-Telegram-Id` header on all API requests.
2. **Manual entry** (fallback for non-Telegram browsers): Partner enters their Telegram ID in a form; stored in `sessionStorage` as `partnerTelegramId`.
3. **Demo mode** (dev only): `X-Telegram-Id: demo` returns first partner from DB.

### Session State (PartnerApp.tsx)

```
loading → needs-telegram-login → needs-registration → ready
```

- `needs-telegram-login`: No initData and no sessionStorage ID found
- `needs-registration`: Telegram ID found but no partner record in DB
- `ready`: Partner record exists; full app rendered

### Logout Behavior
- Sets `localStorage.partnerLoggedOut = "true"`
- Clears `sessionStorage.partnerTelegramId`
- Forces re-auth on next load

### Guest Authentication (Personal Invite Page)
- No authentication; access is by possession of the unique `inviteCode` (random hex)
- `isActive` flag can deactivate invites

### Admin Routes Authorization
Header: `X-Admin-Password: {ADMIN_PASSWORD env var}`  
Routes: `/api/admin/partners`, `/api/admin/zoom-sync/:eventId`, `/api/admin/zoom-test`, `/api/admin/zoom-credentials`, `/api/admin/zoom-attendance/:eventId`

---

## 3. Database Schema

**File:** `shared/schema.ts`

### Table: `partners`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `telegramChatId` | text | unique, not null |
| `telegramUsername` | text | nullable |
| `name` | text | not null |
| `cuNumber` | text | not null |
| `phone` | text | nullable |
| `email` | text | nullable |
| `status` | text | default `'active'` |
| `createdAt` | timestamp | default now() |

### Table: `inviteEvents`

Represents a social invite link created by a partner for a specific webinar.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `inviteCode` | text | unique |
| `partnerName` | text | |
| `partnerCu` | text | |
| `partnerId` | integer | FK → partners.id |
| `scheduleEventId` | integer | nullable, FK → scheduleEvents.id |
| `zoomLink` | text | nullable |
| `title` | text | |
| `eventDate` | text | |
| `eventTime` | text | |
| `guestCount` | integer | default 0 |
| `isActive` | boolean | default true |
| `createdAt` | timestamp | default now() |

### Table: `inviteGuests`

Guest who registered via a social invite link.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `inviteEventId` | integer | FK → inviteEvents.id |
| `name` | text | |
| `email` | text | |
| `phone` | text | nullable |
| `clickedZoom` | boolean | default false |
| `registeredAt` | timestamp | default now() |

### Table: `zoomAttendance`

Zoom participant data synced via Zoom API.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `inviteEventId` | integer | FK → inviteEvents.id |
| `name` | text | |
| `email` | text | |
| `joinTime` | text | |
| `leaveTime` | text | |
| `durationMinutes` | integer | |
| `attentiveScore` | text | nullable |

### Table: `personalInvites`

Individual AI-personalized invite created for a named prospect.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | PK |
| `inviteCode` | text | unique |
| `partnerId` | integer | FK → partners.id |
| `scheduleEventId` | integer | FK → scheduleEvents.id |
| `prospectName` | text | |
| `prospectType` | text | default `'Neutral'` |
| `discType` | text | nullable (D/I/S/C) |
| `motivationType` | text | nullable (CSV of MOTIVATION_TYPES) |
| `reactionType` | text | nullable (CSV of REACTION_TYPES) |
| `inviteStrategy` | text | nullable (Authority/Opportunity/Curiosity/Support) |
| `prospectNote` | text | nullable |
| `generatedMessages` | text | JSON array of strings |
| `chatHistory` | text | JSON array of {role, content} objects |
| `isActive` | boolean | default true |
| `viewedAt` | timestamp | nullable |
| `registeredAt` | timestamp | nullable |
| `guestName` | text | nullable |
| `guestEmail` | text | nullable |
| `guestTelegram` | text | nullable |
| `guestPhone` | text | nullable |
| `guestLanguage` | text | nullable |
| `reminderChannel` | text | nullable (telegram/whatsapp) |
| `reminderPreference` | text | nullable (1_hour/15_min/none) |
| `reminderSent` | boolean | default false |
| `createdAt` | timestamp | default now() |

### Table: `scheduleEvents`

Webinar/event definitions (read-only from partner app, managed separately).

| Column | Type | Notes |
|--------|------|-------|
| `id` | serial | PK |
| `title` | text | |
| `date` | text | format: YYYY-MM-DD or display string |
| `time` | text | e.g. "19:00" |
| `speaker` | text | nullable |
| `speakerPhoto` | text | nullable, URL |
| `link` | text | Zoom link |
| `banner` | text | nullable |
| `highlights` | text[] | array |
| `typeBadge` | text | nullable |
| `timezone` | text | default "CET" |
| `language` | text | default "de" |
| `isActive` | boolean | |

### Enum Types (TypeScript constants)

| Constant | Values |
|----------|--------|
| `PROSPECT_TYPES` | `Investor`, `MLM Leader`, `Entrepreneur`, `Beginner`, `Neutral` |
| `DISC_TYPES` | `D`, `I`, `S`, `C` |
| `MOTIVATION_TYPES` | `money_results`, `business_growth`, `technology_innovation`, `community_people`, `learning_curiosity` |
| `REACTION_TYPES` | `fast_decision`, `analytical`, `skeptical`, `needs_trust` |
| `INVITE_STRATEGIES` | `Authority`, `Opportunity`, `Curiosity`, `Support` |
| `RELATIONSHIP_TYPES` | `friend`, `business_contact`, `mlm_leader`, `investor`, `entrepreneur`, `cold_contact` |

---

## 4. API Endpoints

**File:** `server/partner-app-routes.ts`  
All `/api/partner-app/*` routes require `PARTNER_APP_ENABLED=true` and `X-Telegram-Id` header (unless noted).

### Partner Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/partner-app/register` | X-Telegram-Id | Register new partner (name + CU number) |
| `GET` | `/api/partner-app/profile` | X-Telegram-Id | Get partner profile + aggregate stats |

**Profile response stats:**
```json
{
  "partner": { "id", "name", "cuNumber", "status" },
  "stats": {
    "totalInvited", "totalAttended", "conversionRate", "totalEvents",
    "personalInvites", "personalRegistered", "personalViewed"
  }
}
```

### Webinars

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/partner-app/webinars` | X-Telegram-Id (optional) | Upcoming schedule events, enriched with invite stats per partner |

Returns filtered events where `date >= today` (or all events if date format is non-ISO).

### Invite Events (Social Invites)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/partner-app/create-invite` | X-Telegram-Id | Create social invite link for a webinar |
| `GET` | `/api/partner-app/events` | X-Telegram-Id | Get partner's invite events, grouped by scheduleEventId |
| `GET` | `/api/partner-app/events/:id/report` | X-Telegram-Id | Detailed report for one invite event |
| `POST` | `/api/partner-app/events/:id/zoom-sync` | X-Telegram-Id | Sync Zoom participant data for an event |

**Event report response:**
```json
{
  "event": { ... },
  "guests": [ { "name", "email", "phone", "clickedZoom", "registeredAt" } ],
  "attendance": [ { "name", "email", "durationMinutes", "joinTime", "leaveTime" } ],
  "stats": { "totalGuests", "totalAttended", "totalClicked", "conversionRate", "avgDuration" }
}
```

### Personal AI Invites

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/partner-app/personal-invites` | X-Telegram-Id | List all personal invites with stats |
| `POST` | `/api/partner-app/create-personal-invite` | X-Telegram-Id | Create a personal invite record |
| `POST` | `/api/partner-app/generate-invite-messages` | X-Telegram-Id | Generate 2 AI opening messages |

### AI Qualification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/partner-app/ai-qualify/questions` | X-Telegram-Id | Return QUALIFICATION_QUESTIONS array (4 steps) |
| `POST` | `/api/partner-app/ai-followup` | X-Telegram-Id | In-app AI follow-up assistant (single-turn) |

### Personal Invite Page (Guest-Facing, No Auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/personal-invite/:code` | Get invite details + chat history (marks as viewed) |
| `POST` | `/api/personal-invite/:code/init-chat` | Generate/return first AI message |
| `POST` | `/api/personal-invite/:code/chat` | Continue chat (appends to chatHistory, returns quickReplies) |
| `POST` | `/api/personal-invite/:code/register` | Register guest (name, email, telegram, phone, reminderChannel) |
| `POST` | `/api/personal-invite/:code/reminder` | Set reminder preference (1_hour / 15_min / none) |

### Admin Routes (X-Admin-Password header)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/partners` | List all partners |
| `POST` | `/api/admin/zoom-sync/:eventId` | Force Zoom sync for event |
| `GET` | `/api/admin/zoom-test` | Test Zoom API connectivity |
| `POST` | `/api/admin/zoom-credentials` | Set Zoom credentials at runtime |
| `GET` | `/api/admin/zoom-attendance/:eventId` | Get Zoom attendance records |

### Telegram Bot Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/partner-app/bot-config` | Returns `{ botUsername }` for client |
| `POST` | `/api/telegram-bot/webhook` | Telegram bot webhook receiver |
| `POST` | `/api/admin/bot/set-webhook` | Manually set webhook URL (admin) |

---

## 5. AI Features

### 5.1 Personal Invite Chat Bot

The centerpiece AI feature. Creates a 1:1 AI-chat page for a named prospect, branded as the partner's personal assistant.

**Flow:**
1. Partner runs 4-step qualification (relationship → motivation → reaction → optional note)
2. System infers `discType` and `inviteStrategy` from answers
3. `/generate-invite-messages` produces 2 opening chat messages (shown in preview)
4. Partner reviews/edits messages, confirms, system stores them in `personalInvite.generatedMessages`
5. Partner shares the invite link with the prospect
6. Guest opens `/personal-invite/:code`:
   - `init-chat` is called → first stored message becomes the greeting
   - Guest chats with AI (each message calls `/chat`)
   - AI uses `buildMasterSystemPrompt` with DISC tone + strategy + prospect context
   - Quick replies guide the conversation toward registration
7. Guest registers → `register` endpoint stores data, sends confirmation email, notifies partner via Telegram
8. Guest sets reminder preference → `reminder` endpoint stores preference, confirmation message added to chat

**Model config:** `gpt-4o-mini`, temperature 0.7 (chat) / 0.8 (generation), max_tokens 300/200

### 5.2 In-App AI Follow-up Assistant

Simple single-turn chat assistant available in the AI tab.

- Partner asks questions about follow-up strategy
- Can pass `guestContext` (name, attended status, duration, questions asked)
- Responds in partner's message language
- No conversation history stored

**Model config:** `gpt-4o-mini`, temperature 0.7, max_tokens 500

### 5.3 Telegram Bot Follow-up AI

Triggered by "Follow-up" inline button in Telegram bot after an event.

- Loads guest list with engagement data
- Maintains conversation in `aiConversations` Map (in-memory, non-persistent)
- Session expires on `/exit` or any `/` command
- Max 20 messages (trimmed to last 10 + system prompt on overflow)
- Always responds in German

**Model config:** `gpt-4o-mini`, temperature 0.7, max_tokens 1000

### 5.4 DISC Inference Logic

From qualification answers → DISC type:

| Condition | Result |
|-----------|--------|
| fast_decision + (money_results or business_growth) | D |
| community_people or (fast_decision + technology_innovation) | I |
| needs_trust or community_people | S |
| analytical or skeptical | C |
| default | I |

### 5.5 Strategy Selection Logic

From qualification answers → invite strategy:

| Priority | Condition | Strategy |
|----------|-----------|----------|
| 1 | mlm_leader/entrepreneur + fast_decision/analytical | Authority |
| 2 | investor or money_results | Opportunity |
| 3 | cold_contact or learning_curiosity/technology_innovation | Curiosity |
| 4 | needs_trust or community_people | Support |
| 5 | business_contact | Opportunity |
| 6 | friend | Curiosity |
| default | — | Curiosity |

---

## 6. Notification & Reminder System

### 6.1 Guest Confirmation Email

**Trigger:** After guest registers via personal invite AND has email  
**File:** `server/integrations/resend-email.ts`  
**Provider:** Resend  
**Languages:** DE / EN / RU (based on `guestLanguage`)  
**Content:** Event title, date, time, timezone, speaker name, Zoom link

### 6.2 Partner Telegram Notifications

**File:** `server/integrations/partner-bot.ts`

| Event | Message |
|-------|---------|
| Social invite registration | `🎟 Neue Registrierung!` + guest details |
| Personal invite registration | `🎯 Neue Registrierung (persönliche Einladung)!` + guest details + inviteCode |

### 6.3 Reminder Scheduler

**File:** `server/integrations/reminder-scheduler.ts`  
**Polling interval:** Every 2 minutes  
**Logic:**
1. Fetches all personal invites where `registeredAt IS NOT NULL` AND `reminderSent = false` AND `reminderPreference != 'none'`
2. Fetches associated schedule event
3. Calculates reminder time: `eventTime - 1 hour` or `eventTime - 15 minutes`
4. If `now >= reminderTime`, sends reminder via:
   - Email (Resend) — if guest has email
   - Telegram — if `reminderChannel = 'telegram'` and guest has `guestTelegram`
   - (WhatsApp channel listed in UI but not fully implemented server-side)
5. Sets `reminderSent = true`

---

## 7. Screens & User Flows

### 7.1 Tab 1: Dashboard

**File:** `client/src/pages/partner-app/DashboardScreen.tsx`

**Content:**
- Welcome message with partner name
- 4 stat cards: Total Invited · Attended · Conversion Rate · Events
- "Next 7 days" upcoming meetings list (max 3, "See all" button)
- "Past Events" section with quick report access

### 7.2 Tab 2: Webinars (Meetings)

**File:** `client/src/pages/partner-app/WebinarsScreen.tsx`

This is the most complex screen with an internal multi-screen navigation stack:

```
list → detail → invite-type
                    ├── template-select → share
                    └── personal-form → personal-preview → personal-share → invite-preview
```

**List screen:** Upcoming webinars with per-webinar invite stats (invitesSent, registeredCount).

**Detail screen:** Full webinar info, speaker, highlights, "Invite" CTA.

**Invite-type screen:** Choice between "Personal AI Invite" or "Social Invite".

**Social invite path:**
1. `create-invite` API call → generates inviteCode
2. Template selection (Professional / Friendly / Short — all German templates)
3. Share screen with channels: WhatsApp, Telegram, Twitter, Copy

**Personal AI invite path:**
1. Partner name + prospect name form
2. 4-step qualification chat (relationship → motivation → reaction → context note)
3. System infers DISC + strategy, calls `generate-invite-messages`
4. Preview screen: shows 2 messages + quick replies, strategy/DISC badge
5. Partner can edit messages, regenerate, or confirm
6. `create-personal-invite` API call → stores invite in DB
7. Share screen with Telegram / WhatsApp / Email + copy buttons
8. Optional invite preview (shows what guest will see)

### 7.3 Tab 3: Statistics (Reports)

**File:** `client/src/pages/partner-app/ReportsScreen.tsx`

**Content:**
- Events list grouped by scheduleEventId
- Per-event stats: invites sent · guests · attended
- Funnel view: Invited → Clicked Zoom → Attended
- Guest list table with attendance data
- AI Invites section: total sent · viewed · registered
- Zoom Sync button (triggers `/events/:id/zoom-sync`)

**Known hardcoded strings (not in i18n):**
- Zoom sync success/error messages in German

### 7.4 Tab 4: AI Assistant

**File:** `client/src/pages/partner-app/AIAssistantScreen.tsx`

**Content:**
- Single-turn chat with AI follow-up assistant
- Quick action chips for common requests
- Optional guest context (from events list)
- Entirely hardcoded in English (not in i18n)

### 7.5 Guest Personal Invite Page

**File:** `client/src/pages/PersonalInvitePage.tsx`  
**Route:** `/personal-invite/:code`

**Screens:**
1. **Landing:** Partner name, webinar info, "Open Invitation" CTA
2. **Chat:** AI chat with quick replies, language detection
3. **Registration form:** Name, email, Telegram (optional), reminder channel
4. **Post-registration:** Zoom link display + reminder preference

Language is auto-detected from browser `navigator.language` or inherited from invite record.

---

## 8. Telegram Bot

**File:** `server/integrations/partner-bot.ts`

### Bot Behavior

| Command/Trigger | Handler | Response |
|----------------|---------|----------|
| `/start` (new user) | `handleStart` | Registration prompt (asks for name) |
| `/start` (registered) | `handleStart` | Welcome + stats + Partner App button |
| `/help` | `handleHelp` | Commands list + Partner App button |
| Registration in progress | `handleRegistration` | Multi-step name → CU number flow |
| "Follow-up" inline button | `handleFollowup` | Starts AI follow-up mode |
| "Report" inline button | `handleReport` | Shows event guest summary |
| "Zoom Sync" inline button | `handleZoomSync` | Triggers Zoom data sync |
| Unknown text (registered) | default | Partner App button |
| Unknown text (unregistered) | default | `/start` hint |
| Any text in follow-up mode | `handleAIMessage` | AI response |
| `/exit` in follow-up mode | — | Ends follow-up session |

### Bot Registration Flow (new partners via bot — legacy path)

1. Send `/start`
2. Bot asks for full name
3. Partner sends name → bot asks for CU number
4. Partner sends CU number → bot creates partner record, sends confirmation

> Note: Primary registration is now done via the Mini App's registration form. Bot registration is a legacy path.

### Webhook Auto-setup
On server start, `autoSetWebhook()` is called which sets the Telegram webhook URL automatically based on `PRODUCTION_URL` or `REPLIT_DEV_DOMAIN`.

### Dual-token Setup

| Env Variable | Usage |
|---|---|
| `TELEGRAM_PARTNER_BOT_TOKEN` | Dev environment |
| `TELEGRAM_PARTNER_BOT_TOKEN_PROD` | Production environment |
| `TELEGRAM_PARTNER_BOT_USERNAME` | Bot @username for Mini App deep link |

---

## 9. Zoom Integration

**File:** `server/integrations/zoom-api.ts`

### Authentication
Zoom Server-to-Server OAuth 2.0  
Required env vars: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET`

These can also be stored in the DB and loaded at runtime (settable via `/api/admin/zoom-credentials`).

### Sync Process (`syncZoomDataForEvent`)

1. Extracts Zoom meeting ID from Zoom link (supports `zoom.us/j/XXXXXXXXXX` and `zoom.us/rec/` formats)
2. Fetches meeting participants from Zoom API
3. For each participant: creates/updates `zoomAttendance` record (skip duplicates by email)
4. Returns `{ synced, skipped, participants, error }`

### Trigger Points
- **In-app:** Partner taps "Zoom Sync" button in Reports screen
- **Via Telegram bot:** "Zoom Sync" inline button in event notification
- **Admin API:** `POST /api/admin/zoom-sync/:eventId`

---

## 10. Social Share Templates

**File:** `client/src/pages/partner-app/WebinarsScreen.tsx` (MESSAGE_TEMPLATES array)

Three templates for social invite sharing, all content hardcoded in German:

### Professional (id: `professional`, icon: `💼`, label: `Professional`)
```
Ich möchte Sie herzlich zu unserem exklusiven Webinar einladen:

📌 {title}
📅 {date} um {time}
🎤 Speaker: {speaker}

Melden Sie sich jetzt an:
{url}
```

### Friendly (id: `friendly`, icon: `😊`, label: `Friendly`)
```
Hey! Ich habe ein spannendes Webinar für dich:

🎯 {title}
📅 {date}, {time}
🎤 Mit {speaker}

Schau mal rein, es lohnt sich! 👇
{url}
```

### Short & Direct (id: `short`, icon: `⚡`, label: `Short & Direct`)
```
{title} — {date}, {time}.
Jetzt anmelden: {url}
```

**Share channels available:**
- WhatsApp (`wa.me/?text=...`)
- Telegram (`t.me/share/url?...`)
- Twitter/X (`twitter.com/intent/tweet?...`)
- Copy to clipboard

---

## 11. Known Issues & Technical Debt

### i18n Coverage Gaps

| Location | Issue |
|----------|-------|
| `AIAssistantScreen.tsx` | Entirely hardcoded in English; not using `useLanguage()` hook |
| `ReportsScreen.tsx` | Zoom sync status messages hardcoded in German |
| `WebinarsScreen.tsx` — social templates | Template message text hardcoded in German (template labels are translated) |
| `WebinarsScreen.tsx` — AI qualify context input | Placeholder `"z.B. baut Teams, liebt Crypto..."` hardcoded in German |
| `WebinarsScreen.tsx` — AI qualify send/skip button | Inline ternary for DE/RU/EN but bypasses i18n system |
| `WebinarsScreen.tsx` — "AI Invite Builder" header | Hardcoded in English |
| Personal share text | `Hey {name}! I have a special invitation for you — check it out:` hardcoded in English |

### DISC / Strategy Inference Ambiguity

- `community_people` can trigger both `I` and `S` DISC types; order of conditions determines result (currently `I` takes precedence)
- Strategy `Opportunity` is returned for both `investor` relationship and `money_results` motivation independently, which may conflict with the DISC inference giving `I` type (which would use warm tone) rather than `D`

### Reminder Scheduler Limitations

- WhatsApp is listed as a reminder channel option in the UI but is not implemented server-side (only Telegram and email are handled)
- Scheduler is in-memory (every 2 min polling); not persistent across server restarts if reminders are missed
- No deduplication guard beyond the `reminderSent` boolean flag

### Bot Follow-up Session Persistence

- AI conversation state stored in `aiConversations` Map (in-memory); sessions lost on server restart

### Zoom Link Parsing

- Zoom link extraction is regex-based; may fail for non-standard Zoom link formats (e.g., vanity URLs, regional subdomains)

### Social Invite Registration Page

- `/invite/:code` (social invite guest page) is referenced in `create-invite` response as `inviteUrl` but the corresponding frontend page is not visible in the audited files — likely exists outside the partner-app scope

### Template Localization Priority

Social share templates should be localized per partner's UI language setting, but currently generate German text regardless of selected language.
