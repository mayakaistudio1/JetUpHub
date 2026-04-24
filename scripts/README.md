# scripts/

Utility scripts for generating, uploading, and assembling JetUp slide assets.

## Slide pipeline

1. **`generate-slides.ts`** – renders the slide PNGs/WebMs into
   `exports/slides/png/<lang>/<audience>/` and `exports/slides/video/`.
2. **`upload-to-heygen.ts`** – walks `exports/slides/` and uploads every
   PNG/WebM to HeyGen. Writes the returned asset IDs to
   `exports/slides/heygen-upload-manifest.json`.
3. **`build-heygen-videos.ts`** – reads the upload manifest, groups the
   uploaded assets by `<lang>/<audience>`, and submits one HeyGen
   video-generation request per group. Submitted video IDs (and any
   returned share URLs) are written to
   `exports/slides/heygen-video-manifest.json`.
4. **`poll-heygen-videos.ts`** – polls
   `GET /v1/video_status.get` for every entry in
   `exports/slides/heygen-video-manifest.json` and updates each entry
   in-place with the latest `status`, `videoUrl`, and `shareUrl`.
   Re-runnable; finished videos are skipped.
5. **`download-heygen-videos.ts`** – downloads every `completed`
   video's MP4 into `exports/slides/heygen/<lang>_<audience>.mp4` and
   records the resulting `localPath` back in the manifest.
   Re-runnable; existing files are skipped unless `--force`.

### Other helpers

- `generate-broll-infographics.mjs` – renders the broll backgrounds in
  `exports/slides/broll/`.
- `generate-logo-variants.mjs` – renders the logo variants.

## `generate-slides.ts`

```bash
# 1. Make sure the app is running locally on http://localhost:5000
npm run dev

# 2. In another shell, render PNGs + WebMs into exports/slides/
npx tsx scripts/generate-slides.ts
```

Outputs:
- `exports/slides/png/<lang>/<client|partner>/*.png`
- `exports/slides/video/<lang>_<client|partner>.webm`
- `exports/slides/broll/*.png`

## `upload-to-heygen.ts`

After `generate-slides.ts` finishes, push everything to your HeyGen
workspace in one shot:

```bash
# Requires the HEYGEN_API_KEY secret to be set.
HEYGEN_API_KEY=... npx tsx scripts/upload-to-heygen.ts
```

The script walks `exports/slides/` recursively, uploads every PNG / JPG /
WebM / MP4 to `https://upload.heygen.com/v1/asset` with the matching
`Content-Type`, and writes a manifest at
`exports/slides/heygen-upload-manifest.json` containing the returned asset
IDs and URLs for each file. The process exits with a non-zero status if any
upload failed.

## `build-heygen-videos.ts`

```
tsx scripts/build-heygen-videos.ts             # submit every group
tsx scripts/build-heygen-videos.ts en/client   # submit a single group
tsx scripts/build-heygen-videos.ts --dry-run   # log payloads without calling HeyGen
```

### Required env

| Variable | Purpose |
| --- | --- |
| `HEYGEN_API_KEY` | HeyGen REST API key |
| `HEYGEN_AVATAR_ID` | Avatar that narrates the slides |
| `HEYGEN_VOICE_ID` | Default voice id (used when no per-language override is set) |

### Optional env

| Variable | Purpose |
| --- | --- |
| `HEYGEN_VOICE_ID_EN` / `HEYGEN_VOICE_ID_RU` / `HEYGEN_VOICE_ID_DE` | Per-language voice overrides |

### Optional per-group narration

Drop a JSON file at `exports/slides/scripts/<lang>_<audience>.json` with
either an array of strings (one entry per slide, in slide order) or
`{ "slides": ["...", "..."] }`. If no script file exists, each scene
falls back to a `"..."` placeholder (HeyGen requires non-empty
`input_text`).

The repo ships with the real per-slide narration for both decks in EN,
RU and DE:

- `exports/slides/scripts/en_client.json`, `en_partner.json`
- `exports/slides/scripts/ru_client.json`, `ru_partner.json`
- `exports/slides/scripts/de_client.json`, `de_partner.json`

Each file is keyed `{ "title", "slides": [...] }` with one narration line
per slide, in the same order as the PNGs under
`exports/slides/png/<lang>/<audience>/`.

### Output

`exports/slides/heygen-video-manifest.json`:

```json
{
  "generatedAt": "2026-04-17T12:34:56.000Z",
  "videos": [
    {
      "group": "en/client",
      "lang": "en",
      "audience": "client",
      "slideCount": 10,
      "videoId": "abc123",
      "shareUrl": "https://...",
      "submittedAt": "2026-04-17T12:34:56.000Z",
      "status": "submitted"
    }
  ]
}
```

Failed groups are recorded with `status: "failed"` and an `error`
field; the script exits with code `2` if any submission failed so it
can be wired into CI.

## `poll-heygen-videos.ts`

After `build-heygen-videos.ts` has submitted the jobs, poll HeyGen
until each video is rendered and ready to share:

```bash
HEYGEN_API_KEY=... npx tsx scripts/poll-heygen-videos.ts             # one pass over every entry
HEYGEN_API_KEY=... npx tsx scripts/poll-heygen-videos.ts en/client   # filter by group(s)
HEYGEN_API_KEY=... npx tsx scripts/poll-heygen-videos.ts --watch     # loop until everything resolves
HEYGEN_API_KEY=... npx tsx scripts/poll-heygen-videos.ts --watch --interval=20
HEYGEN_API_KEY=... npx tsx scripts/poll-heygen-videos.ts --force     # also re-poll completed/failed entries
```

The script reads `exports/slides/heygen-video-manifest.json`, calls
`GET /v1/video_status.get` for every entry that still has a `videoId`
and is not yet in a terminal state, and writes the results back to the
same file. Each entry is updated in-place with:

- `status` – `processing` / `completed` / `failed` (plus `pending` /
  `waiting` when HeyGen reports them)
- `videoUrl` – final downloadable MP4 once `completed`
- `shareUrl` – HeyGen share link once available
- `thumbnailUrl`, `gifUrl`, `duration` – when returned by HeyGen
- `polledAt` – ISO timestamp of the last successful poll
- `error` – error message when `status === "failed"`

Re-running the script is safe: completed and failed entries are skipped
unless `--force` is passed. The script exits with code `2` if any entry
ended up in `failed`.

## `download-heygen-videos.ts`

Once `poll-heygen-videos.ts` has marked entries as `completed` and
recorded their `videoUrl`, pull the final MP4s down to local disk so
they survive HeyGen's CDN expiry and can be edited or re-uploaded
elsewhere:

```bash
npx tsx scripts/download-heygen-videos.ts             # download everything completed
npx tsx scripts/download-heygen-videos.ts en/client   # filter by group(s)
npx tsx scripts/download-heygen-videos.ts --force     # re-download even if file exists
```

Each completed entry is downloaded to
`exports/slides/heygen/<lang>_<audience>.mp4` and the manifest entry is
updated with:

- `localPath` – relative path to the downloaded MP4
- `downloadedAt` – ISO timestamp of the successful download

The script is safe to re-run: existing files (non-empty) are skipped
unless `--force` is passed. Entries that are not yet `completed` (or
have no `videoUrl`) are reported as "not ready" and left untouched.
The script exits with code `2` if any download failed.
