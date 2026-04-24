# Partner Mini App — File Map & Design System

## Directory Structure

```
client/src/pages/partner-app/
├── PartnerApp.tsx              # Root shell: auth state machine, tab bar, screen routing
├── DashboardScreen.tsx         # Tab 1 — Dashboard (stats, upcoming events)
├── WebinarsScreen.tsx          # Tab 2 — Webinars/Meetings + all invite flows
├── ReportsScreen.tsx           # Tab 3 — Statistics / event reports
└── AIAssistantScreen.tsx       # Tab 4 — AI Follow-up Assistant

client/src/pages/
└── PersonalInvitePage.tsx      # Public guest-facing personal invite page (/personal-invite/:code)

client/src/contexts/
└── LanguageContext.tsx         # i18n translations (DE/EN/RU), LanguageProvider, useLanguage hook

server/
├── partner-app-routes.ts       # All REST API routes for the Partner Mini App (1261 lines)
└── integrations/
    ├── partner-bot.ts          # Telegram bot logic, AI follow-up chat, bot webhook handler
    ├── reminder-scheduler.ts   # Cron-style scheduler (polls every 2 min), sends reminders
    ├── zoom-api.ts             # Zoom OAuth2, participant sync
    └── resend-email.ts         # Guest confirmation & reminder email sender

shared/
└── schema.ts                   # Drizzle ORM schema — all DB tables and insert/select types
```

## Key Source Files — Line Counts

| File | Lines | Purpose |
|------|-------|---------|
| `server/partner-app-routes.ts` | 1261 | All API endpoints |
| `client/src/pages/partner-app/WebinarsScreen.tsx` | 1435 | Invite flow UI |
| `client/src/contexts/LanguageContext.tsx` | 1561 | All i18n strings |
| `server/integrations/partner-bot.ts` | 863 | Telegram bot |
| `client/src/pages/PersonalInvitePage.tsx` | ~900 | Guest invite page |
| `client/src/pages/partner-app/ReportsScreen.tsx` | ~400 | Stats/reports |
| `client/src/pages/partner-app/DashboardScreen.tsx` | ~350 | Dashboard |
| `client/src/pages/partner-app/AIAssistantScreen.tsx` | ~300 | AI assistant |
| `server/integrations/reminder-scheduler.ts` | 283 | Reminder cron |

---

## Design System

### Tech Stack
- **Framework:** React 18 + TypeScript
- **Routing:** Wouter
- **Styling:** Tailwind CSS (utility-first, no component library)
- **Animation:** Framer Motion (`motion.div`, `AnimatePresence`)
- **Icons:** Lucide React
- **State:** React `useState` / `useEffect` (no global state manager)
- **i18n:** Custom `LanguageContext` with `useLanguage()` hook
- **HTTP:** Native `fetch` with `X-Telegram-Id` header for auth

### Visual Language

#### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Blue 600 | `#2563EB` | Primary CTA, active states, accent |
| Blue 50 | `#EFF6FF` | Soft highlight backgrounds |
| Gray 900 | `#111827` | Primary text |
| Gray 500 | `#6B7280` | Secondary text, labels |
| Gray 400 | `#9CA3AF` | Placeholder, timestamps |
| Gray 200 | `#E5E7EB` | Borders |
| Gray 50 / F5F5F7 | `#F5F5F7` | Page background, iOS-style bg |
| Emerald 500 | `#10B981` | Success states, copy confirmation |
| White | `#FFFFFF` | Card backgrounds |

#### Typography
- **Font:** System default (iOS/Android native feel)
- **Heading (card):** `text-base font-semibold` / `text-lg font-bold`
- **Body:** `text-sm` (14px)
- **Caption / label:** `text-xs` (12px), often `uppercase tracking-wide`
- **Micro:** `text-[10px]` / `text-[11px]`

#### Radius / Shadow
- **Cards:** `rounded-2xl` with `boxShadow: "0 1px 3px rgba(0,0,0,0.04)"`
- **Pills / tags:** `rounded-full`
- **Inputs:** `rounded-xl` with `bg-gray-50 border border-gray-200`
- **Buttons:** `rounded-xl` (full-width) or `rounded-full` (pill chips)

#### Spacing
- **Page padding:** `px-5 pt-5 pb-28` (bottom padding for tab bar)
- **Card padding:** `p-4` / `p-5`
- **Section gap:** `mb-4` / `mb-5` / `space-y-3`

#### Motion
All list items and chat bubbles use Framer Motion `opacity 0→1, y 8→0` with staggered `delay: i * 0.05–0.15`.

### Component Patterns

#### Cards
```tsx
<div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
  ...
</div>
```

#### Primary CTA Button
```tsx
<button className="w-full py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors">
  ...
</button>
```

#### Ghost / Secondary Button
```tsx
<button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50">
  ...
</button>
```

#### Input Field
```tsx
<input className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
```

#### Quick Reply Chip
```tsx
<button className="px-3.5 py-2 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600 active:bg-blue-50">
  ...
</button>
```

#### Tab Bar (PartnerApp.tsx)
Fixed bottom bar with 4 tabs. Active tab uses `text-blue-600`, inactive uses `text-gray-400`.
Tabs: Dashboard · Meetings · Statistics · AI

#### Chat Bubble — AI (assistant)
```tsx
<div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-800 whitespace-pre-line" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} />
```

#### Chat Bubble — User
```tsx
<div className="bg-blue-600 rounded-2xl rounded-tr-md px-4 py-3 text-sm text-white" />
```

### Screens & Navigation Model

```
App States (PartnerApp.tsx)
├── loading
├── needs-telegram-login        → Shows Telegram login + manual ID form
├── needs-registration          → Shows registration form (name, CU number)
└── ready                       → Shows tab bar + active screen

Tab Screens
├── DashboardScreen             → Stats cards + upcoming meetings list
├── WebinarsScreen              → Multi-screen invite flow (see below)
├── ReportsScreen               → Events list + per-event funnel
└── AIAssistantScreen           → Free-chat AI follow-up assistant

WebinarsScreen Internal Screens
├── list                        → Upcoming webinar list with invite stats
├── detail                      → Single webinar detail + invite button
├── invite-type                 → Choice: Personal AI Invite | Social Invite
├── template-select             → Choose social share template (Professional/Friendly/Short)
├── share                       → Social share channels + copy button
├── personal-form               → Partner/prospect name entry → AI qualify chat (4 steps)
├── personal-preview            → Preview generated messages + quick replies
├── personal-share              → Share personal invite link
└── invite-preview              → Preview what guest will see
```

### Authentication Flow
1. App reads `Telegram.WebApp.initData` (when in Telegram)
2. Falls back to `sessionStorage.getItem("partnerTelegramId")` (manual entry)
3. All API calls use `X-Telegram-Id` header
4. Logout sets `localStorage.setItem("partnerLoggedOut", "true")` and clears `sessionStorage`
5. Feature flag: `PARTNER_APP_ENABLED=true` (or `NODE_ENV=development`)

### Environment Variables Used
| Variable | Purpose |
|----------|---------|
| `PARTNER_APP_ENABLED` | Gates all partner-app routes |
| `TELEGRAM_PARTNER_BOT_TOKEN` | Bot token (dev) |
| `TELEGRAM_PARTNER_BOT_TOKEN_PROD` | Bot token (prod) |
| `TELEGRAM_PARTNER_BOT_USERNAME` | Bot @username |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI key for all AI calls |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL override |
| `ZOOM_ACCOUNT_ID` / `ZOOM_CLIENT_ID` / `ZOOM_CLIENT_SECRET` | Zoom integration |
| `PRODUCTION_URL` | Base URL for webhook/invite links |
| `ADMIN_PASSWORD` | Admin endpoint guard |
| `RESEND_API_KEY` | Email confirmation/reminders |
