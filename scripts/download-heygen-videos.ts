/**
 * scripts/download-heygen-videos.ts
 *
 * Reads `exports/slides/heygen-video-manifest.json` (produced by
 * `scripts/build-heygen-videos.ts` and updated by
 * `scripts/poll-heygen-videos.ts`) and downloads every entry whose
 * `status === "completed"` and `videoUrl` is set into
 * `exports/slides/heygen/<lang>_<audience>.mp4`. Each downloaded entry
 * gets a `localPath` field written back to the manifest.
 *
 * The script is re-runnable: existing files are skipped unless
 * `--force` is passed.
 *
 * Usage:
 *   tsx scripts/download-heygen-videos.ts                # download all completed
 *   tsx scripts/download-heygen-videos.ts en/client      # filter by group(s)
 *   tsx scripts/download-heygen-videos.ts --force        # re-download even if file exists
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createWriteStream } from "node:fs";

const SLIDES_DIR = path.resolve("exports/slides");
const VIDEO_MANIFEST_PATH = path.join(SLIDES_DIR, "heygen-video-manifest.json");
const HEYGEN_DIR = path.join(SLIDES_DIR, "heygen");

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
  status: string;
  error?: string;
  localPath?: string;
  downloadedAt?: string;
}

interface VideoManifest {
  generatedAt: string;
  videos: ManifestVideo[];
}

async function readManifest(): Promise<VideoManifest> {
  let raw: string;
  try {
    raw = await fs.readFile(VIDEO_MANIFEST_PATH, "utf8");
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      throw new Error(
        `Video manifest not found at ${VIDEO_MANIFEST_PATH}. ` +
          `Run \`tsx scripts/build-heygen-videos.ts\` and ` +
          `\`tsx scripts/poll-heygen-videos.ts\` first.`,
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

async function fileExists(p: string): Promise<boolean> {
  try {
    const st = await fs.stat(p);
    return st.isFile() && st.size > 0;
  } catch {
    return false;
  }
}

async function downloadTo(url: string, dest: string): Promise<number> {
  const res = await fetch(url);
  if (!res.ok || !res.body) {
    throw new Error(`Download failed (${res.status} ${res.statusText}) for ${url}`);
  }
  const tmp = `${dest}.part`;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  const nodeStream = Readable.fromWeb(res.body as any);
  await pipeline(nodeStream, createWriteStream(tmp));
  await fs.rename(tmp, dest);
  const st = await fs.stat(dest);
  return st.size;
}

interface Summary {
  downloaded: number;
  skipped: number;
  failed: number;
  notReady: number;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const filters = new Set(args.filter((a) => !a.startsWith("--")));

  const manifest = await readManifest();
  if (!manifest.videos.length) {
    console.error("Video manifest contains no entries.");
    process.exitCode = 1;
    return;
  }

  await fs.mkdir(HEYGEN_DIR, { recursive: true });

  const summary: Summary = { downloaded: 0, skipped: 0, failed: 0, notReady: 0 };

  for (const entry of manifest.videos) {
    if (filters.size && !filters.has(entry.group)) {
      summary.skipped++;
      continue;
    }
    if (entry.status !== "completed" || !entry.videoUrl) {
      summary.notReady++;
      console.log(`[${entry.group}] not ready (status=${entry.status})`);
      continue;
    }

    const filename = `${entry.lang}_${entry.audience}.mp4`;
    const dest = path.join(HEYGEN_DIR, filename);
    const relPath = path.relative(process.cwd(), dest);

    if (!force && (await fileExists(dest))) {
      summary.skipped++;
      if (entry.localPath !== relPath) {
        entry.localPath = relPath;
      }
      console.log(`[${entry.group}] skip (exists) -> ${relPath}`);
      continue;
    }

    try {
      console.log(`[${entry.group}] downloading -> ${relPath}`);
      const size = await downloadTo(entry.videoUrl, dest);
      entry.localPath = relPath;
      entry.downloadedAt = new Date().toISOString();
      summary.downloaded++;
      console.log(`[${entry.group}] done (${size} bytes)`);
    } catch (e: any) {
      summary.failed++;
      const msg = e?.message || String(e);
      console.error(`[${entry.group}] !! ${msg}`);
    }

    await writeManifest(manifest);
  }

  await writeManifest(manifest);

  console.log(
    `Downloaded ${summary.downloaded}, skipped ${summary.skipped}, ` +
      `not-ready ${summary.notReady}, failed ${summary.failed}.`,
  );

  if (summary.failed > 0) process.exitCode = 2;
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
  process.exit(1);
});
