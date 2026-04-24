# JetUP Architecture & Concept Summary

## 1. Vision & Concept
JetUP is a high-end **Telegram Mini App (TMA)** designed as a "Smart Linktree" and digital onboarding hub for a financial ecosystem. Its unique value proposition is the integration of a **Video AI Assistant (Maria)**, providing a human-like interactive experience for users.

### Key Pillars:
- **Structure**: Clear 3-level navigation (Hub → Category Hubs → Details).
- **Transparency**: Real-time event schedules and direct access to resources.
- **Control**: User-centric design optimized for the Telegram environment.

---

## 2. Technical Stack
### Frontend
- **Framework**: React 18 with TypeScript.
- **Build Tool**: Vite (optimized for fast HMR and small bundles).
- **Routing**: `wouter` (lightweight, perfect for Mini Apps).
- **Styling**: Tailwind CSS v4 (using modern CSS variables for Telegram theme syncing).
- **Animations**: Framer Motion (smooth page transitions).
- **State**: TanStack React Query (server state) + Context API (language/theme).

### Backend
- **Runtime**: Node.js with Express 5.
- **Database**: PostgreSQL with **Drizzle ORM**.
- **Auth**: Password-protected Admin Panel with session-based security.
- **API**: RESTful architecture.

---

## 3. AI Features (Maria)
Maria is a hybrid AI entity combining two cutting-edge technologies:
1.  **Visuals**: **HeyGen LiveAvatar** via LiveKit WebRTC. Provides real-time streaming video with lip-sync.
2.  **Intelligence**: **OpenAI GPT-4** (via Replit AI Integrations). Custom system prompts in DE/RU/EN containing the full JetUP knowledge base.
3.  **Integration**: Text-to-Video synchronization where GPT-4 responses are streamed to the HeyGen avatar.

---

## 4. App Structure
### Level 1: The Hub (Home)
- **Maria Live Card**: Direct entry point to AI interaction.
- **Pathway Cards**: Large visual buttons for "Trading Hub" and "Partner Hub".
- **Action Grid**: Quick access to Webinars and Tutorials.
- **Direct Links**: Social media and external registration links.

### Level 2: Hub Pages
- **Trading Hub**: Focus on TAG Markets, Copy-X, and Amplify 12x. Includes a "Quick Start" 5-step guide and FAQ.
- **Partner Hub**: Focus on commissions, Profit Share, and Lifestyle Rewards (Rolex, Real Estate).
- **Maria Page**: Full-screen video and text chat interface.

### Level 3: Dynamic Content
- **Schedule**: Filterable calendar of Zoom events with dual timezone support (CET/MSK).
- **Tutorials**: Tabbed interface for Trader and Partner education videos/guides.
- **Promotions**: Detail pages for active marketing offers with direct CTA links.

---

## 5. Admin Capabilities (Admin Panel)
A dedicated, secure area for content management:
- **Webinar Management**: Create/Edit events with an **Auto-Banner Generator**. Banners are rendered dynamically using a purple-lavender design template.
- **Promotion Management**: CRUD for marketing banners with visibility toggles.
- **Chat Intelligence**: Full history of Maria's conversations to understand user needs and improve the AI prompt.
- **Speaker Profiles**: Reusable profiles with photos for consistent branding across banners.

---

## 6. Database Schema (Drizzle/Postgres)
- `users`: Basic user tracking.
- `applications`: User requests for consultations.
- `chat_sessions` & `chat_messages`: Full persistence of AI interactions.
- `promotions`: Content for marketing offers.
- `schedule_events`: Calendar data including speaker associations.
- `speakers`: Database of experts with names, roles, and photos.

---

## 7. Multilingual Engine
- **Core**: `LanguageContext.tsx` handles state.
- **Languages**: German (Primary/Admin), Russian, English (Hidden).
- **Dynamic Content**: Events and Promotions support multiple languages within a single record to ensure all users see all relevant events with appropriate language badges.
