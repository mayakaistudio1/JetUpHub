import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "exports/slides");
const UPLOAD_URL = "https://upload.heygen.com/v1/asset";

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
};

type UploadResult = {
  file: string;
  ok: boolean;
  assetId?: string;
  url?: string;
  error?: string;
};

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

async function uploadOne(apiKey: string, filePath: string): Promise<UploadResult> {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  const rel = path.relative(ROOT, filePath);
  if (!contentType) {
    return { file: rel, ok: false, error: `unsupported extension ${ext}` };
  }
  try {
    const body = fs.readFileSync(filePath);
    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": contentType,
      },
      body,
    });
    const text = await res.text();
    if (!res.ok) {
      return { file: rel, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { file: rel, ok: false, error: `non-JSON response: ${text.slice(0, 200)}` };
    }
    const root = isRecord(parsed) ? parsed : {};
    const data: Record<string, unknown> = isRecord(root.data) ? root.data : root;
    const assetId =
      pickString(data, "id") ??
      pickString(data, "asset_id") ??
      pickString(data, "image_key") ??
      pickString(data, "video_key");
    const url = pickString(data, "url") ?? pickString(data, "cdn_url");
    return { file: rel, ok: true, assetId, url };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { file: rel, ok: false, error: message };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

async function main() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    console.error("Missing HEYGEN_API_KEY environment variable.");
    process.exit(1);
  }
  if (!fs.existsSync(ROOT)) {
    console.error(`No exports directory at ${ROOT}. Run scripts/generate-slides.ts first.`);
    process.exit(1);
  }

  const allFiles = walk(ROOT).filter((f) => CONTENT_TYPES[path.extname(f).toLowerCase()]);
  if (allFiles.length === 0) {
    console.error(`No uploadable files found in ${ROOT}.`);
    process.exit(1);
  }

  console.log(`Uploading ${allFiles.length} files to HeyGen...\n`);

  const results: UploadResult[] = [];
  for (const file of allFiles) {
    process.stdout.write(`-> ${path.relative(ROOT, file)} ... `);
    const r = await uploadOne(apiKey, file);
    results.push(r);
    if (r.ok) {
      console.log(`OK${r.assetId ? ` (${r.assetId})` : ""}`);
    } else {
      console.log(`FAIL: ${r.error}`);
    }
  }

  const okCount = results.filter((r) => r.ok).length;
  const failCount = results.length - okCount;

  const manifestPath = path.join(ROOT, "heygen-upload-manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        uploadedAt: new Date().toISOString(),
        total: results.length,
        succeeded: okCount,
        failed: failCount,
        results,
      },
      null,
      2,
    ),
  );

  console.log(`\nDone. ${okCount} succeeded, ${failCount} failed.`);
  console.log(`Manifest: ${path.relative(process.cwd(), manifestPath)}`);

  if (failCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
