/**
 * scripts/build-heygen-videos.ts
 *
 * Reads `exports/slides/heygen-upload-manifest.json` (produced by
 * `scripts/upload-to-heygen.ts`), groups the previously-uploaded slide
 * assets by `<lang>/<audience>`, and submits one HeyGen video-generation
 * request per group. The returned video IDs (and any share URLs) are
 * written back to `exports/slides/heygen-video-manifest.json` so the user
 * can track / poll them.
 *
 * Required env:
 *   HEYGEN_API_KEY            – HeyGen REST API key
 *   HEYGEN_AVATAR_ID          – Avatar that will narrate the slides
 *   HEYGEN_VOICE_ID           – Default voice id (overridable per language)
 *   HEYGEN_VOICE_ID_EN/_RU/_DE (optional) – per-language voice overrides
 *
 * Optional per-group narration:
 *   exports/slides/scripts/<lang>_<audience>.json
 *     -> string[]   (one entry per slide, in slide order)
 *     -> { slides: string[], title?: string }
 *
 * Usage:
 *   tsx scripts/build-heygen-videos.ts            # submit all groups
 *   tsx scripts/build-heygen-videos.ts en/client  # submit a single group
 *   tsx scripts/build-heygen-videos.ts --dry-run  # log payloads only
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const HEYGEN_BASE_URL = "https://api.heygen.com";

const SLIDES_DIR = path.resolve("exports/slides");
const UPLOAD_MANIFEST_PATH = path.join(SLIDES_DIR, "heygen-upload-manifest.json");
const VIDEO_MANIFEST_PATH = path.join(SLIDES_DIR, "heygen-video-manifest.json");
const SCRIPTS_DIR = path.join(SLIDES_DIR, "scripts");

type AssetType = "image" | "video";

interface UploadedAsset {
  path: string;
  lang: string;
  audience: string;
  slide?: number;
  type?: AssetType;
  assetId: string;
  url?: string;
}

interface UploadManifest {
  uploadedAt?: string;
  assets: UploadedAsset[];
}

interface SubmittedVideo {
  group: string;
  lang: string;
  audience: string;
  slideCount: number;
  videoId: string;
  shareUrl?: string;
  submittedAt: string;
  status: "submitted" | "failed";
  error?: string;
}

interface VideoManifest {
  generatedAt: string;
  videos: SubmittedVideo[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function voiceForLang(lang: string, fallback: string): string {
  const upper = lang.toUpperCase();
  return process.env[`HEYGEN_VOICE_ID_${upper}`] || fallback;
}

function inferLangAudience(p: string): { lang: string; audience: string } | null {
  const norm = p.replace(/\\/g, "/");
  const m = norm.match(/exports\/slides\/(?:png|video|webm)\/?([^/]+)?\/?([^/]+)?/);
  if (!m) return null;
  if (m[1] && m[2]) return { lang: m[1], audience: m[2] };
  const flat = norm.match(/([a-z]{2})_(client|partner)\.(webm|mp4|mov)$/i);
  if (flat) return { lang: flat[1].toLowerCase(), audience: flat[2].toLowerCase() };
  return null;
}

function inferSlideIndex(p: string): number {
  const base = path.basename(p);
  const m = base.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 9999;
}

function inferType(p: string): AssetType {
  return /\.(webm|mp4|mov)$/i.test(p) ? "video" : "image";
}

async function readUploadManifest(): Promise<UploadManifest> {
  let raw: string;
  try {
    raw = await fs.readFile(UPLOAD_MANIFEST_PATH, "utf8");
  } catch (e: any) {
    if (e?.code === "ENOENT") {
      throw new Error(
        `Upload manifest not found at ${UPLOAD_MANIFEST_PATH}. ` +
          `Run \`tsx scripts/upload-to-heygen.ts\` first.`,
      );
    }
    throw e;
  }
  const parsed = JSON.parse(raw);
  const assetsRaw: any[] = Array.isArray(parsed) ? parsed : parsed.assets || [];
  const assets: UploadedAsset[] = assetsRaw
    .map((a) => {
      const assetId = a.assetId || a.asset_id || a.id;
      if (!assetId) return null;
      const filePath = a.path || a.file || a.source || "";
      const inferred = inferLangAudience(filePath) || { lang: a.lang, audience: a.audience };
      if (!inferred?.lang || !inferred?.audience) return null;
      return {
        path: filePath,
        lang: String(inferred.lang).toLowerCase(),
        audience: String(inferred.audience).toLowerCase(),
        slide: a.slide ?? a.slideIndex ?? inferSlideIndex(filePath),
        type: (a.type as AssetType) || inferType(filePath),
        assetId,
        url: a.url,
      } as UploadedAsset;
    })
    .filter((a): a is UploadedAsset => !!a);
  return { uploadedAt: parsed.uploadedAt, assets };
}

function groupAssets(
  assets: UploadedAsset[],
): Map<string, UploadedAsset[]> {
  const groups = new Map<string, UploadedAsset[]>();
  for (const a of assets) {
    const key = `${a.lang}/${a.audience}`;
    const list = groups.get(key) || [];
    list.push(a);
    groups.set(key, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => (a.slide ?? 0) - (b.slide ?? 0));
  }
  return groups;
}

async function loadScript(lang: string, audience: string): Promise<string[]> {
  const file = path.join(SCRIPTS_DIR, `${lang}_${audience}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (Array.isArray(parsed?.slides)) return parsed.slides.map(String);
    return [];
  } catch {
    return [];
  }
}

function buildVideoInputs(
  group: UploadedAsset[],
  scriptLines: string[],
  voiceId: string,
  avatarId: string,
) {
  return group.map((asset, i) => {
    const text = (scriptLines[i] || "").trim() || "...";
    const background =
      asset.type === "video"
        ? { type: "video", video_asset_id: asset.assetId, play_style: "loop" as const }
        : { type: "image", image_asset_id: asset.assetId, fit: "cover" as const };
    return {
      character: {
        type: "avatar",
        avatar_id: avatarId,
        avatar_style: "normal",
      },
      voice: {
        type: "text",
        input_text: text,
        voice_id: voiceId,
      },
      background,
    };
  });
}

async function submitVideo(payload: unknown, apiKey: string): Promise<{ videoId: string; raw: any }> {
  const res = await fetch(`${HEYGEN_BASE_URL}/v2/video/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HeyGen video.generate failed (${res.status}): ${text}`);
  }
  const json = JSON.parse(text);
  const videoId = json?.data?.video_id || json?.video_id;
  if (!videoId) {
    throw new Error(`HeyGen response missing video_id: ${text}`);
  }
  return { videoId, raw: json };
}

async function fetchShareUrl(videoId: string, apiKey: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${HEYGEN_BASE_URL}/v1/video_status.get?video_id=${videoId}`, {
      headers: { "X-Api-Key": apiKey },
    });
    if (!res.ok) return undefined;
    const json = await res.json();
    return json?.data?.share_url || json?.data?.video_url || undefined;
  } catch {
    return undefined;
  }
}

async function writeVideoManifest(videos: SubmittedVideo[]): Promise<void> {
  const manifest: VideoManifest = {
    generatedAt: new Date().toISOString(),
    videos,
  };
  await fs.mkdir(path.dirname(VIDEO_MANIFEST_PATH), { recursive: true });
  await fs.writeFile(VIDEO_MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const filters = args.filter((a) => !a.startsWith("--"));

  const upload = await readUploadManifest();
  if (!upload.assets.length) {
    console.error("Upload manifest contains no usable assets.");
    process.exitCode = 1;
    return;
  }

  const groups = groupAssets(upload.assets);
  const targets = filters.length
    ? new Map([...groups].filter(([k]) => filters.includes(k)))
    : groups;

  if (!targets.size) {
    console.error(`No matching groups. Available: ${[...groups.keys()].join(", ")}`);
    process.exitCode = 1;
    return;
  }

  const apiKey = dryRun ? "" : requireEnv("HEYGEN_API_KEY");
  const avatarId = dryRun
    ? process.env.HEYGEN_AVATAR_ID || "<HEYGEN_AVATAR_ID>"
    : requireEnv("HEYGEN_AVATAR_ID");
  const defaultVoice = dryRun
    ? process.env.HEYGEN_VOICE_ID || "<HEYGEN_VOICE_ID>"
    : requireEnv("HEYGEN_VOICE_ID");

  const submitted: SubmittedVideo[] = [];

  for (const [group, assets] of targets) {
    const [lang, audience] = group.split("/");
    const voiceId = voiceForLang(lang, defaultVoice);
    const scriptLines = await loadScript(lang, audience);
    const videoInputs = buildVideoInputs(assets, scriptLines, voiceId, avatarId);
    const payload = {
      caption: false,
      dimension: { width: 1920, height: 1080 },
      title: `JetUp slides – ${lang.toUpperCase()} / ${audience}`,
      video_inputs: videoInputs,
    };

    console.log(`\n[${group}] ${assets.length} slide(s), voice=${voiceId}`);

    if (dryRun) {
      console.log(JSON.stringify(payload, null, 2));
      continue;
    }

    try {
      const { videoId } = await submitVideo(payload, apiKey);
      const shareUrl = await fetchShareUrl(videoId, apiKey);
      submitted.push({
        group,
        lang,
        audience,
        slideCount: assets.length,
        videoId,
        shareUrl,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      });
      console.log(`  -> submitted video_id=${videoId}${shareUrl ? ` share=${shareUrl}` : ""}`);
    } catch (e: any) {
      const message = e?.message || String(e);
      submitted.push({
        group,
        lang,
        audience,
        slideCount: assets.length,
        videoId: "",
        submittedAt: new Date().toISOString(),
        status: "failed",
        error: message,
      });
      console.error(`  !! failed: ${message}`);
    }
  }

  if (!dryRun) {
    await writeVideoManifest(submitted);
    console.log(`\nWrote ${submitted.length} entries to ${path.relative(process.cwd(), VIDEO_MANIFEST_PATH)}`);
  }

  if (submitted.some((v) => v.status === "failed")) {
    process.exitCode = 2;
  }
}

main().catch((e) => {
  console.error(e?.stack || e?.message || e);
  process.exit(1);
});
