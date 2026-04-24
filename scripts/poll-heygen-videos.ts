/**
 * scripts/poll-heygen-videos.ts
 *
 * Reads `exports/slides/heygen-video-manifest.json` (produced by
 * `scripts/build-heygen-videos.ts`) and polls HeyGen
 * `GET /v1/video_status.get` for every entry that still has a `videoId`
 * and is not yet `completed` / `failed`. Each entry is updated in-place
 * with the latest `status` (`processing` / `completed` / `failed`),
 * `videoUrl`, `shareUrl`, and a `polledAt` timestamp. The script can be
 * re-run safely; finished videos are skipped.
 *
 * Required env:
 *   HEYGEN_API_KEY  – HeyGen REST API key
 *
 * Usage:
 *   tsx scripts/poll-heygen-videos.ts                 # one pass
 *   tsx scripts/poll-heygen-videos.ts en/client       # filter by group(s)
 *   tsx scripts/poll-heygen-videos.ts --watch         # loop until everything resolves
 *   tsx scripts/poll-heygen-videos.ts --watch --interval=20
 *   tsx scripts/poll-heygen-videos.ts --force         # re-poll completed/failed entries too
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const HEYGEN_BASE_URL = "https://api.heygen.com";
const SLIDES_DIR = path.resolve("exports/slides");
const VIDEO_MANIFEST_PATH = path.join(SLIDES_DIR, "heygen-video-manifest.json");

type VideoStatus =
  | "submitted"
  | "pending"
  | "processing"
  | "waiting"
  | "completed"
  | "failed";

interface ManifestVideo {
  group: string;
  lang: string;
  audience: string;
  slideCount: number;
  videoId: string;
  shareUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  gifUrl?: string;
  duration?: number;
  submittedAt: string;
  polledAt?: string;
  status: VideoStatus;
  error?: string;
}

interface VideoManifest {
  generatedAt: string;
  videos: ManifestVideo[];
}

const TERMINAL: ReadonlySet<VideoStatus> = new Set(["completed", "failed"]);

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function parseIntervalArg(args: string[]): number {
  const a = args.find((x) => x.startsWith("--interval"));
  if (!a) return 15;
  const eq = a.split("=")[1];
  const n = parseInt(eq ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 15;
}

async function readManifest(): Promise<VideoManifest> {
  let raw: string;
  try {
    raw = await fs.readFile(VIDEO_MANIFEST_PATH, "utf8");
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      throw new Error(
        `Video manifest not found at ${VIDEO_MANIFEST_PATH}. ` +
          `Run \`tsx scripts/build-heygen-videos.ts\` first.`,
      );
    }
    throw e;
  }
  const parsed = JSON.parse(raw);
  const videos: ManifestVideo[] = Array.isArray(parsed?.videos) ? parsed.videos : [];
  return {
    generatedAt: parsed?.generatedAt || new Date().toISOString(),
    videos,
  };
}

async function writeManifest(manifest: VideoManifest): Promise<void> {
  await fs.mkdir(path.dirname(VIDEO_MANIFEST_PATH), { recursive: true });
  await fs.writeFile(
    VIDEO_MANIFEST_PATH,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );
}

interface StatusResult {
  status: VideoStatus;
  videoUrl?: string;
  shareUrl?: string;
  thumbnailUrl?: string;
  gifUrl?: string;
  duration?: number;
  error?: string;
}

function normalizeStatus(s: unknown): VideoStatus {
  const v = String(s || "").toLowerCase();
  if (v === "completed" || v === "complete" || v === "done" || v === "succeeded") {
    return "completed";
  }
  if (v === "failed" || v === "error") return "failed";
  if (v === "pending") return "pending";
  if (v === "waiting") return "waiting";
  if (v === "processing" || v === "in_progress" || v === "generating") {
    return "processing";
  }
  return "processing";
}

async function fetchStatus(videoId: string, apiKey: string): Promise<StatusResult> {
  const res = await fetch(
    `${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
    { headers: { "X-Api-Key": apiKey } },
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HeyGen video_status.get failed (${res.status}): ${text}`);
  }
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HeyGen video_status.get returned non-JSON: ${text}`);
  }
  const data = json?.data ?? json ?? {};
  const status = normalizeStatus(data.status);
  const errorObj = data.error;
  const errorMsg =
    typeof errorObj === "string"
      ? errorObj
      : errorObj?.message || errorObj?.detail || undefined;
  return {
    status,
    videoUrl: data.video_url || data.video_url_caption || undefined,
    shareUrl: data.share_url || undefined,
    thumbnailUrl: data.thumbnail_url || undefined,
    gifUrl: data.gif_url || undefined,
    duration: typeof data.duration === "number" ? data.duration : undefined,
    error: status === "failed" ? errorMsg || "HeyGen reported failed status" : undefined,
  };
}

interface PassSummary {
  polled: number;
  completed: number;
  failed: number;
  pending: number;
  skipped: number;
}

async function pollOnce(
  manifest: VideoManifest,
  apiKey: string,
  filters: Set<string>,
  force: boolean,
): Promise<PassSummary> {
  const summary: PassSummary = {
    polled: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
  };

  for (const entry of manifest.videos) {
    if (filters.size && !filters.has(entry.group)) {
      summary.skipped++;
      continue;
    }
    if (!entry.videoId) {
      summary.skipped++;
      continue;
    }
    if (!force && TERMINAL.has(entry.status)) {
      summary.skipped++;
      if (entry.status === "completed") summary.completed++;
      if (entry.status === "failed") summary.failed++;
      continue;
    }

    summary.polled++;
    try {
      const result = await fetchStatus(entry.videoId, apiKey);
      entry.status = result.status;
      entry.polledAt = new Date().toISOString();
      if (result.videoUrl) entry.videoUrl = result.videoUrl;
      if (result.shareUrl) entry.shareUrl = result.shareUrl;
      if (result.thumbnailUrl) entry.thumbnailUrl = result.thumbnailUrl;
      if (result.gifUrl) entry.gifUrl = result.gifUrl;
      if (typeof result.duration === "number") entry.duration = result.duration;
      if (result.status === "failed") {
        entry.error = result.error || entry.error || "HeyGen reported failed status";
      } else {
        delete entry.error;
      }

      if (result.status === "completed") summary.completed++;
      else if (result.status === "failed") summary.failed++;
      else summary.pending++;

      const extra =
        result.status === "completed"
          ? ` url=${entry.videoUrl ?? "(none)"}${entry.shareUrl ? ` share=${entry.shareUrl}` : ""}`
          : result.status === "failed"
          ? ` error=${entry.error}`
          : "";
      console.log(`[${entry.group}] ${entry.videoId} -> ${result.status}${extra}`);
    } catch (e: any) {
      summary.pending++;
      const message = e?.message || String(e);
      console.error(`[${entry.group}] ${entry.videoId} !! ${message}`);
    }
  }

  return summary;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");
  const force = args.includes("--force");
  const interval = parseIntervalArg(args);
  const filters = new Set(args.filter((a) => !a.startsWith("--")));

  const apiKey = requireEnv("HEYGEN_API_KEY");
  const manifest = await readManifest();

  if (!manifest.videos.length) {
    console.error("Video manifest contains no entries.");
    process.exitCode = 1;
    return;
  }

  let pass = 0;
  while (true) {
    pass++;
    if (watch) console.log(`\n--- pass #${pass} ---`);
    const summary = await pollOnce(manifest, apiKey, filters, force);
    await writeManifest(manifest);

    console.log(
      `Polled ${summary.polled}, completed ${summary.completed}, ` +
        `failed ${summary.failed}, still pending ${summary.pending}, ` +
        `skipped ${summary.skipped}.`,
    );

    if (!watch) break;
    if (summary.pending === 0) {
      console.log("All videos in terminal state, exiting watch loop.");
      break;
    }
    await sleep(interval * 1000);
  }

  const anyFailed = manifest.videos.some((v) => v.status === "failed");
  if (anyFailed) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
  process.exit(1);
});
