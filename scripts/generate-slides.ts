import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "exports/slides");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const W = 1920;
const H = 1080;
const SLIDE_DUR = 3;
const FADE_DUR = 0.6;

const LANGS = ["de", "ru", "en"] as const;
const PATHS = ["client", "partner"] as const;

type Lang = typeof LANGS[number];
type Path = typeof PATHS[number];

function screensFor(p: Path): string[] {
  const intro = ["cinema", "s1", "s2", "path"];
  const body = p === "client"
    ? ["c1", "c2", "c3", "c4", "c5"]
    : ["p1", "p2", "p3", "p4", "p5"];
  return [...intro, ...body, "final"];
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "inherit", "inherit"] });
    p.on("error", reject);
    p.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function generatePngs() {
  for (const lang of LANGS) {
    for (const p of PATHS) {
      const outDir = path.join(ROOT, "png", lang, p);
      ensureDir(outDir);
      const screens = screensFor(p);

      const browser = await chromium.launch();
      const context = await browser.newContext({
        viewport: { width: W, height: H },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      for (let i = 0; i < screens.length; i++) {
        const s = screens[i];
        const idx = String(i + 1).padStart(2, "0");
        const file = path.join(outDir, `${idx}_${s}.png`);
        if (fs.existsSync(file)) {
          console.log(`  · skip ${lang}/${p}/${idx}_${s}.png`);
          continue;
        }
        const url = `${BASE_URL}/export-slide?lang=${lang}&path=${p}&screen=${s}`;
        let lastErr: unknown = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            await page.goto(url, { waitUntil: "load", timeout: 30000 });
            await page.waitForTimeout(700);
            await page.screenshot({ path: file, type: "png", fullPage: false, clip: { x: 0, y: 0, width: W, height: H } });
            lastErr = null;
            break;
          } catch (e) {
            lastErr = e;
            const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
            console.log(`  ! retry ${lang}/${p}/${s} (${attempt + 1}/3): ${msg}`);
            await page.waitForTimeout(1000);
          }
        }
        if (lastErr) throw lastErr;
        console.log(`  ✓ ${lang}/${p}/${idx}_${s}.png`);
      }

      await browser.close();
    }
  }
}

async function generateVideos() {
  const videoDir = path.join(ROOT, "video");
  ensureDir(videoDir);

  for (const lang of LANGS) {
    for (const p of PATHS) {
      const pngDir = path.join(ROOT, "png", lang, p);
      const files = fs.readdirSync(pngDir).filter((f) => f.endsWith(".png")).sort();
      if (files.length === 0) continue;

      const out = path.join(videoDir, `${lang}_${p}.webm`);
      try {
        const stat = fs.statSync(out);
        if (stat.size > 0) {
          console.log(`  · skip ${lang}_${p}.webm`);
          continue;
        }
      } catch {
        // does not exist, proceed
      }
      const args: string[] = ["-y"];
      for (const f of files) {
        args.push("-loop", "1", "-t", String(SLIDE_DUR), "-i", path.join(pngDir, f));
      }

      const n = files.length;
      const filterParts: string[] = [];
      for (let i = 0; i < n; i++) {
        filterParts.push(`[${i}:v]scale=${W}:${H},setsar=1,fps=30,format=yuva420p[v${i}]`);
      }

      let prev = "v0";
      let acc = SLIDE_DUR;
      for (let i = 1; i < n; i++) {
        const offset = (acc - FADE_DUR).toFixed(3);
        const next = i === n - 1 ? "vout" : `vx${i}`;
        filterParts.push(`[${prev}][v${i}]xfade=transition=fade:duration=${FADE_DUR}:offset=${offset}[${next}]`);
        prev = next;
        acc += SLIDE_DUR - FADE_DUR;
      }

      const filterComplex = filterParts.join(";");
      const mapTarget = n === 1 ? "[v0]" : "[vout]";

      args.push(
        "-filter_complex", filterComplex,
        "-map", mapTarget,
        "-c:v", "libvpx-vp9",
        "-b:v", "0", "-crf", "32",
        "-pix_fmt", "yuva420p",
        "-r", "30",
        out,
      );

      console.log(`  → ${lang}_${p}.webm (${n} slides)`);
      await run("ffmpeg", args);
    }
  }
}

async function generateBroll() {
  const dir = path.join(ROOT, "broll");
  ensureDir(dir);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  const scenes: { name: string; html: string }[] = [
    {
      name: "01_dark_city_bokeh.png",
      html: `<div style="position:fixed;inset:0;background:#040214;overflow:hidden">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 70%, rgba(232,200,74,0.10) 0%, transparent 45%), radial-gradient(ellipse at 70% 30%, rgba(102,80,200,0.08) 0%, transparent 45%)"></div>
        ${Array.from({ length: 60 }).map(() => {
          const x = Math.random() * 100, y = Math.random() * 100;
          const s = 2 + Math.random() * 14;
          const o = 0.05 + Math.random() * 0.35;
          const blur = 4 + Math.random() * 12;
          return `<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:rgba(232,200,74,${o});filter:blur(${blur}px);box-shadow:0 0 ${blur*2}px rgba(232,200,74,${o})"></div>`;
        }).join("")}
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(4,2,16,0.7) 100%)"></div>
      </div>`,
    },
    {
      name: "02_gold_particles.png",
      html: `<div style="position:fixed;inset:0;background:#02010a;overflow:hidden">
        ${Array.from({ length: 200 }).map(() => {
          const x = Math.random() * 100, y = Math.random() * 100;
          const s = 1 + Math.random() * 4;
          const o = 0.1 + Math.random() * 0.7;
          const gold = Math.random() > 0.3;
          const c = gold ? `rgba(245,166,35,${o})` : `rgba(232,200,74,${o})`;
          return `<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:${c};box-shadow:0 0 ${s*4}px ${c}"></div>`;
        }).join("")}
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 60% at 50% 50%, rgba(232,200,74,0.06) 0%, transparent 70%)"></div>
      </div>`,
    },
    {
      name: "03_gradient_sweep.png",
      html: `<div style="position:fixed;inset:0;background:linear-gradient(135deg, #050210 0%, #0a0625 35%, #1a0a30 55%, #2a0e20 75%, #050210 100%)">
        <div style="position:absolute;inset:0;background:linear-gradient(115deg, transparent 30%, rgba(232,200,74,0.18) 50%, transparent 70%);mix-blend-mode:screen"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 100% 60% at 50% 100%, rgba(245,166,35,0.10) 0%, transparent 60%)"></div>
      </div>`,
    },
    {
      name: "04_jetup_wordmark.png",
      html: `<div style="position:fixed;inset:0;background:#000;display:flex;align-items:center;justify-content:center;font-family:'Montserrat','Inter',sans-serif">
        <div style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 50% at 50% 50%, rgba(232,200,74,0.15) 0%, transparent 60%)"></div>
        <h1 style="font-size:280px;font-weight:900;letter-spacing:-0.05em;margin:0;background:linear-gradient(135deg, #E8C84A 0%, #F5A623 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 60px rgba(232,200,74,0.4))">JetUP</h1>
      </div>`,
    },
    {
      name: "05_dark_atmosphere.png",
      html: `<div style="position:fixed;inset:0;background:#030108;overflow:hidden">
        <div style="position:absolute;top:-20%;left:-10%;width:80%;height:80%;background:radial-gradient(circle, rgba(102,80,200,0.18) 0%, transparent 60%);filter:blur(40px)"></div>
        <div style="position:absolute;bottom:-20%;right:-10%;width:90%;height:90%;background:radial-gradient(circle, rgba(232,200,74,0.12) 0%, transparent 60%);filter:blur(50px)"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)"></div>
        ${Array.from({ length: 30 }).map(() => {
          const x = Math.random() * 100, y = Math.random() * 100;
          const s = 1 + Math.random() * 3;
          return `<div style="position:absolute;left:${x}%;top:${y}%;width:${s}px;height:${s}px;border-radius:50%;background:rgba(255,255,255,${0.2 + Math.random() * 0.4})"></div>`;
        }).join("")}
      </div>`,
    },
  ];

  for (const sc of scenes) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:${W}px;height:${H}px;background:#000}</style></head><body>${sc.html}</body></html>`;
    await page.setContent(html, { waitUntil: "load" });
    await page.waitForTimeout(200);
    const out = path.join(dir, sc.name);
    await page.screenshot({ path: out, type: "png", clip: { x: 0, y: 0, width: W, height: H } });
    console.log(`  ✓ broll/${sc.name}`);
  }

  await browser.close();
}

async function main() {
  ensureDir(ROOT);
  console.log("→ Step 1/3: Rendering PNG slides...");
  await generatePngs();
  console.log("→ Step 2/3: Encoding WebM videos...");
  await generateVideos();
  console.log("→ Step 3/3: Rendering b-roll backgrounds...");
  await generateBroll();
  console.log(`✔ Done. Output: ${ROOT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
