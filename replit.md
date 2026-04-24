# JetUP — Digital Hub & Partner Platform

## Overview

JetUP is a digital information hub and smart linktree for the JetUP financial ecosystem, serving as a central onboarding and navigation tool. It consolidates all ecosystem resources, services, and tools, allowing users to explore products, attend webinars, watch tutorials, and interact with an integrated AI assistant named Maria. The platform targets German-speaking and Russian-speaking users interested in trading, copy-trading, and partnership income.

**Key capabilities:**
- Centralized access to JetUP financial products (Copy-X Strategies, Trading Signals, JetUP Academy, Partner Program, etc.).
- Mobile-first, multilingual experience (DE/RU/EN).
- AI consultant (Maria) for real-time support — including a dedicated recruiting mode on `/explore`.
- **Sofia AI** (DE-only on `/explore`): persistent LiveAvatar overlay that replaces Maria branding for German users. The same LiveKit session persists across navigation (/explore → /presentation → /hub → /trading) via `SofiaSessionProvider` mounted at App root outside Routes. Backend `persona="sofia"` branch in `server/integrations/liveavatar.ts` uses `SOFIA_AVATAR_ID`, `SOFIA_VOICE_ID_{DE|EN|RU}`, `SOFIA_CONTEXT_ID_{DE|EN|RU}`, optional `SOFIA_LLM_CONFIG_ID`, `SOFIA_SANDBOX_MODE`. Graceful fallback: when env vars missing, Sofia disables itself (`/api/sofia/config` returns `enabled:false`) and the existing Maria-landing flow continues to serve users. Transcripts + page visits stored in `sofia_sessions` table. Keep-alive every 120s to avoid HeyGen 5-min timeout.
- Full Partner CRM: invite tracking, guest notifications, Zoom attendance attribution.
- `/explore` public recruitment funnel: Hero → Problem → Solution → Formula → Pillars → Transformation → Videothek → CTA → KI-Schicht Recruiting (unified Sofia chat+voice surface) → Application Form → Footer.
- **Sofia recruiting surface** (landing section + floating panel): single chat stream with text input, manual one-shot mic button and a "Voice on/off" toggle in the panel header. Voice toggle controls TTS only — when ON, every Sofia text reply is also spoken aloud via ElevenLabs TTS; when OFF, Sofia is silent. The mic button records one user utterance at a time (start → stop), POSTs to ElevenLabs Scribe STT and injects the transcript through the same `sofia:inject-user-message` event the typed composer uses, so both paths share one chat pipeline. Stack: OpenAI LLM (`/api/maria/recruiting/chat`) + ElevenLabs Scribe STT (`/api/sofia/voice/stt`) + ElevenLabs TTS (`/api/sofia/voice/tts`) — NOT ElevenLabs Conversational Agents. State lives in `SofiaVoiceProvider` (`speakerOn` persisted in `localStorage["sofia_voice_enabled"]`, default true). UI: sharp corners everywhere except the orb avatar, Montserrat font, brand tokens (#0F172A bg, #1E293B surface, #7C3AED primary, #A855F7 accent, #334155 border), animated 3-ring concentric ripples on the orb while Sofia is speaking, dismissible onboarding tooltip ("You can turn voice off any time", `localStorage["sofia_onboarded"]`), toast on toggle. There is no continuous voice mode and no separate floating voice dock — the legacy `FloatingVoiceDock` is a no-op stub. Visitor memory via `visitorId` + `sofia_dialog` journal. The DE-only LiveAvatar overlay (`SofiaSessionContext.openWelcome`) is unrelated and untouched.

**Business Vision:** "Struktur. Transparenz. Kontrolle." within the JetUP financial ecosystem.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 19 with TypeScript, Vite 7.
- **Routing**: Wouter.
- **Styling**: Tailwind CSS v4 with CSS variables, integrates Telegram theme.
- **UI Components**: shadcn/ui (new-york style) built on Radix UI.
- **Animations**: Framer Motion.
- **State Management**: TanStack React Query for server state, React useState for local state.
- **Icons**: Lucide React.
- **Multilingual**: German (de), Russian (ru), English (en).

### Backend
- **Runtime**: Node.js 20 with Express 5.
- **Language**: TypeScript.
- **API Pattern**: RESTful endpoints under `/api/*`.
- **Session Management**: Express sessions with PostgreSQL store.

### Database
- **Type**: PostgreSQL with Drizzle ORM.
- **Schema**: Defined in `shared/schema.ts` for entities like `partners`, `personal_invites`, `invite_events`, `invite_guests`, `zoom_attendance`, `tutorials`.
- **Migrations**: Applied on server startup using raw SQL `ALTER TABLE IF NOT EXISTS` statements.

### Build System
- **Development**: `npm run dev` (tsx + Vite).
- **Production**: `npm run build` (Vite + esbuild), then `npm start`.

### Partner Infrastructure
- **Partner Telegram Bot**: Manages `/start` commands (opens Mini App or handles `remind_CODE` deep links), `/invite`, `/events`, `/report` commands. Notifies partners of guest registrations and reminders. **Multilingual (DE/EN/RU)**: auto-detects partner language from Telegram `language_code`, persists to `partners.language` column, all bot messages served in partner's language via `server/integrations/partner-bot-texts.ts` translations file. AI follow-up assistant also responds in the partner's detected language.
- **Partner Mini App Auth**: Uses Telegram WebApp `initData` HMAC verification for primary authentication. Fallback to `x-partner-auth: id:<telegramChatId>` for development. Supports new partner registration.
- **Partner Mini App (4 Tabs)**:
    - **Upcoming Events**: Lists events with stats, personal invitations (with status), social share, and AI Personal Invite creation.
    - **Contacts**: Aggregates guest information, shows reminder channel status, `/go/` link click status, and attendance. Features AI follow-up generation.
    - **Statistics**: Displays lifetime totals for invites, registrations, and attendance.
    - **Profile**: Shows and allows editing of partner information.
- **Personal Invite Pipeline**:
    1. Partner creates invite (via Mini App prospect form, optional DISC qualification, AI message generation).
    2. Guest opens `personal-invite/:code` page, interacts with AI chat (GPT-4o-mini), and registers via inline form.
    3. Registration triggers confirmation email (via Resend) and partner Telegram DM.
    4. Success screen prompts Telegram subscription if `reminderChannel` is Telegram.
    5. Guest can subscribe on Telegram via deep link (`/start remind_CODE`).
    6. **Reminder Scheduler**: Polls for upcoming events, sends 24h and 1h reminders to partners and guests (email or Telegram).
    7. Guest joins via `/go/{guestToken}` link, which records click and redirects to Zoom.
- **Social Invite System**: Allows partners to share a single invite link for an event with multiple guests. Guests register via a public landing page.
- **Guest Attendance Attribution**: Integrates with Zoom API (Server-to-Server OAuth) to fetch participant data post-webinar, matching attendees by `inviteGuestId` or email to `zoom_attendance` records.

### Desktop Premium Landing — Explore Page
- **Route**: `/explore` (public, no DEV gate, full-width desktop)
- **File**: `client/src/pages/ExplorePage.tsx`
- **Purpose**: Cinematic 8-act desktop premium landing page presenting JetUP as a growth architecture platform. High-level storytelling without detailed commission tables.
- **Sections**: Hero (split layout with welcome video + statement), The Shift (scroll-driven chaos→system transformation), The Product (interactive spatial ecosystem map), The Difference (horizontal scroll-within-vertical comparison), Partner Model (layered architecture visualization), AI Advantage (Maria showcase with mode switcher), Toolkit (partner tool cards with hover-expand), Final CTA (dual buttons).
- **Visual Style**: Dark #0a0a12 background, #7C3AED/#A855F7 accents, Montserrat font, Apple×Stripe×Linear aesthetic, Framer Motion scroll-triggered animations.
- **Video**: Welcome video served from `/videos/jetup-intro.mp4` (muted autoplay, user-controllable).
- **Desktop-first**: Optimized for 1200px+ viewports, not mobile-optimized.

### AI Landing Page (Dev-only)
- **Route**: `/ai-landing` (gated behind `import.meta.env.DEV`, same as `/presentation`)
- **File**: `client/src/pages/AILandingPage.tsx`
- **Purpose**: Cinematic scroll-driven landing page presenting JetUP AI × Recruiting concept with premium visual impact.
- **Sections**: Hero (typewriter effect), Problem (pain points with destabilization animations), Before/After Shift (split-screen transformation), AI Infrastructure (architectural modules with interactive info cards), Maria Chat (simulated conversation with typing animation), Formula + CTA (cinematic reveal with glowing button).
- **Visual Style**: Deep dark background, purple/violet/magenta accents, white typography, glassmorphism, Framer Motion transitions, particle canvas, light beams.
- **Mobile**: Responsive, works in Telegram Mini App viewport.

### Other Core Features
- **Partner Digital Hub**: Personalized partner pages (`/dennis`, `/p/dennis`) with a state machine UI (HERO, CHAT_OVERLAY, PRESENTATION_OVERLAY, ECOSYSTEM_OVERLAY). Features multilingual AI chat (GPT-4o-mini, SSE) and interactive presentation slides with video backgrounds and ecosystem map.
- **Dennis Fast Start Promo**: Manages promotional campaigns from `dennis_promos` table, with admin CRUD, application management, and Telegram notifications.
- **Smart Linktree Navigation**: Centralized navigation for various hubs, schedules, Video Library, and promotions.
- **Video Library**: Educational video layer using YouTube Shorts embeds. Videos are managed via admin panel (`tutorials` table), filtered by language (DE/EN/RU), categorized (bonuses/strategies/partner-program/getting-started), and matched to Trading/Partner Hub sections via topic tags. Videos appear inline only when they exist for that topic + language.
- **Admin Panel**: Password-protected interface (`/admin`) for managing chat logs, promotions, events, speakers, promo applications, invite events, partners, and videos.
- **Maria AI**: Provides text-based chat (GPT-4o-mini, SSE) and a video avatar (HeyGen LiveAvatar via LiveKit WebRTC). Chat logs are analyzed via the admin panel.
- **HQ Read-Only API** (`/api/hq/*`): Bearer-token-protected (`HQ_READONLY_TOKEN`), GET-only API consumed by the external marketing HQ Repl. Exposes Sofia/Maria sessions + transcripts, current prompts (with override source), partners, promo applications, events + Zoom attendance, personal invites, content (tutorials/speakers/promos/translations), object storage files, and metrics overview. PII (emails, phones, telegram handles) is masked; rate-limited to 60 req/min/token. Public `GET /api/hq/_health` exposes liveness only. Contract: `docs/hq-api.md`.

## External Knowledge

- **`JETUP_BRAND_KNOWLEDGE.md`** (root): single source of truth for brand colors, voice/tone, Sofia persona, product glossary (CopyX, Amplify, Sonic AI, TAG Markets, IB Portal, 4 income streams), HeyGen asset env vars, content formats, DE voiceover style and 10 typical agent prompts. Used as starter context for the external HeyGen video-generation agent (separate Repl) and any freelancer working on JetUP brand assets. Update here first before propagating changes elsewhere.

## External Dependencies

- **PostgreSQL**: Main relational database.
- **OpenAI API**: Powers Maria AI chat, AI follow-ups, invite AI, and partner chat.
- **HeyGen / LiveKit**: Provides Maria's video avatar via WebRTC.
- **Replit Object Storage**: Stores media assets like speaker photos and banners.
- **Telegram Bot API**: Used for the Partner Bot and guest notifications.
- **Resend**: Handles transactional email sending (confirmations, reminders).
- **Zoom API**: Integrates for webinar attendance tracking (Server-to-Server OAuth).
- **Google Sheets**: Auto-syncs chat logs and promo applications.
- **Google Drive**: Stores presentations.