# HQ Read-Only API

Read-only JSON API for the external **marketing headquarters** Repl. Lets the HQ
project read everything it needs from this app — Sofia/Maria conversations,
prompts, partners, promo applications, events, attendance, content, files, and
metrics — without ever writing anything back.

All routes are mounted under `/api/hq/*`. **Only `GET` is supported.** Any other
method returns `404`.

## Authentication

All routes (except `/api/hq/_health`) require a bearer token:

```
Authorization: Bearer <HQ_READONLY_TOKEN>
```

The expected value comes from the `HQ_READONLY_TOKEN` environment variable
(stored in Replit Secrets). If the variable is not configured, every protected
route returns `503 { "error": "HQ_READONLY_TOKEN not configured" }`.

Wrong or missing token ⇒ `401 { "error": "Unauthorized" }`.

## Rate limiting

A simple in-memory limiter caps each token at **60 requests per minute**.
Exceeding it returns `429 { "error": "Rate limit exceeded" }`.

## PII masking

The following fields are always masked in responses:

| Field            | Masking                                |
| ---------------- | -------------------------------------- |
| Email            | `j***@example.com`                     |
| Phone            | `+49***1234`                           |
| Telegram handle  | `de***ev`                              |

Telegram chat IDs, raw guest tokens, and invite codes (`inviteCode`,
`personalInvites.inviteCode`) are **never** returned — invite codes are
auth-like since anyone with the code can register as a guest on the public
landing page. For partners we expose `hasTelegram: boolean` instead of the
chat ID.

## Pagination

List endpoints accept `limit` (default 50, max 200; files endpoint default 100,
max 500) and `offset` query parameters and return:

```json
{ "items": [...], "total": 123, "limit": 50, "offset": 0 }
```

Date filters (where supported) accept ISO timestamps via `from` and `to`.

---

## Endpoints

### Health

- `GET /api/hq/_health` — **public**.
  ```json
  { "ok": true, "tokenConfigured": true, "time": "2026-04-19T02:51:25.087Z" }
  ```

### Sofia chats (landing voice avatar)

- `GET /api/hq/sofia/sessions?language=de&from=...&to=...&limit=&offset=`
  Returns session summaries (no transcripts), newest first.
- `GET /api/hq/sofia/sessions/:sessionId`
  Full session including `messages[]` and `pagesVisited[]`.

### Maria chats (text + video)

Maria conversations live in two stores:

1. `chat_sessions` / `chat_messages` (current Maria text chat + LiveAvatar
   transcripts).
2. Legacy `conversations` / `messages` table from `shared/models/chat`.

Endpoints:

- `GET /api/hq/maria/sessions?type=text|video&language=de&from=&to=&limit=&offset=`
- `GET /api/hq/maria/sessions/:sessionId`
- `GET /api/hq/maria/conversations?limit=&offset=`
- `GET /api/hq/maria/conversations/:id`

### Prompts

Returns the **currently active** prompt for each AI persona, with its source
(`override` from `app_settings`, `default` baked into code, or `default-file`
loaded from disk for Sofia DE).

- `GET /api/hq/prompts/sofia` → `{ de, en, ru }`
- `GET /api/hq/prompts/maria` → `{ text: { de, en, ru }, video }`

Each entry has the shape:

```json
{
  "language": "de",
  "source": "override" | "default" | "default-file" | "missing",
  "settingKey": "maria_prompt_text_de",   // when applicable
  "file": ".local/tasks/sofia-prompt-de-v3-draft.md", // Sofia DE only
  "content": "..."
}
```

### Partners

- `GET /api/hq/partners?limit=&offset=`
  Returns partners with email/phone/telegram masked. Telegram chat IDs are
  replaced by `hasTelegram: boolean`.

### Promo applications

- `GET /api/hq/promo/applications?status=approved|no_money|pending&limit=&offset=`

### Events

- `GET /api/hq/events?includeAttendance=true&includeGuests=true&limit=&offset=`
  Returns each schedule event with related invite events, guests, and Zoom
  attendance. Guest emails/phones are masked.

### Personal invites

- `GET /api/hq/personal-invites?limit=&offset=`
  Includes prospect profile (DISC/motivation/reaction), guest registration
  status, click-through tracking — all PII masked.

### Content

- `GET /api/hq/content/tutorials?language=de&limit=&offset=`
- `GET /api/hq/content/speakers?limit=&offset=`
- `GET /api/hq/content/promos?language=de&limit=&offset=`
  Returns paginated `dennisPromos` plus the full set of `promotionBanners` for
  convenience.
- `GET /api/hq/content/translations`
  Cross-language groups for schedule events, promo banners, and Dennis promos
  — keyed by `translation_group` so HQ can reconcile multilingual variants.

### Files (object storage)

- `GET /api/hq/files?prefix=tutorials/&limit=&offset=`
  Lists objects under `PUBLIC_OBJECT_SEARCH_PATHS[0]`. Each item:
  ```json
  {
    "name": "uploads/abc.png",
    "fullName": "public/uploads/abc.png",
    "contentType": "image/png",
    "size": 12345,
    "updated": "2026-04-18T...",
    "created": "2026-04-18T...",
    "publicUrl": "/uploads/abc.png"
  }
  ```

### Metrics overview

- `GET /api/hq/metrics/overview?period=day|week|month` (default `week`)

```json
{
  "period": "week",
  "since": "2026-04-12T...",
  "now": "2026-04-19T...",
  "sofia":  { "total": 1234, "inPeriod": 87 },
  "maria":  { "total": 456,  "inPeriod": 23 },
  "partners": { "total": 42 },
  "promo":  { "total": 100, "approved": 60, "noMoney": 25, "conversion": 0.6 },
  "events": { "total": 12, "guestsTotal": 340, "attendanceTotal": 210 },
  "personalInvites": { "total": 80, "registered": 35, "conversion": 0.4375 }
}
```

---

## Error responses

All errors are JSON: `{ "error": "<message>" }` with a meaningful HTTP status
(`400`, `401`, `404`, `429`, `500`, `503`).

## Out of scope

This API is intentionally **read-only**. There are no write/update/delete
endpoints, no approval queue actions, no token rotation endpoint, and no
webhooks. Those flows remain inside the main app's admin UI.
