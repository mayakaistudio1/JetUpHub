import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', '.canvas', 'assets');

const WIDTH = 1200;
const HEIGHT = 960;

function logoHTML({ bg, textColor, label }) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:${WIDTH}px; height:${HEIGHT}px;
  background:${bg};
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  font-family:'Montserrat',sans-serif;
  overflow:hidden;
  position:relative;
}
.logo-container {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:30px;
}
.icon-wrapper {
  width:220px; height:220px;
  display:flex; align-items:center; justify-content:center;
  position:relative;
}
.rocket-icon svg { width:200px; height:200px; }
.text-jetup {
  font-size:120px;
  font-weight:900;
  font-style:italic;
  color:${textColor};
  letter-spacing:-2px;
  line-height:1;
}
.label {
  position:absolute;
  bottom:30px;
  left:50%;
  transform:translateX(-50%);
  font-size:16px;
  font-weight:600;
  color:${textColor};
  opacity:0.4;
  letter-spacing:2px;
  text-transform:uppercase;
  white-space:nowrap;
}
</style>
</head><body>
<div class="logo-container">
  <div class="icon-wrapper">
    <div class="rocket-icon">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="60" y1="160" x2="140" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED"/>
            <stop offset="50%" stop-color="#9333EA"/>
            <stop offset="100%" stop-color="#E879F9"/>
          </linearGradient>
        </defs>
        <circle cx="130" cy="60" r="55" fill="url(#g1)"/>
        <rect x="55" y="65" width="90" height="14" rx="7" fill="url(#g1)" transform="rotate(-40 100 72)"/>
        <rect x="45" y="85" width="80" height="14" rx="7" fill="url(#g1)" transform="rotate(-40 85 92)"/>
        <rect x="35" y="105" width="70" height="14" rx="7" fill="url(#g1)" transform="rotate(-40 70 112)"/>
        <rect x="50" y="125" width="55" height="12" rx="6" fill="url(#g1)" transform="rotate(-40 77 131)"/>
        <rect x="65" y="140" width="40" height="10" rx="5" fill="url(#g1)" transform="rotate(-40 85 145)"/>
      </svg>
    </div>
  </div>
  <div class="text-jetup">JetUP</div>
</div>
<div class="label">${label}</div>
</body></html>`;
}

const variants = [
  {
    id: 'logo-on-black',
    bg: '#000000',
    textColor: '#FFFFFF',
    label: 'White text — for dark / black backgrounds',
  },
  {
    id: 'logo-on-dark-purple',
    bg: '#0F0A1A',
    textColor: '#FFFFFF',
    label: 'White text — for JetUP dark theme background',
  },
  {
    id: 'logo-on-white',
    bg: '#FFFFFF',
    textColor: '#1F2937',
    label: 'Dark text — for white / light backgrounds',
  },
  {
    id: 'logo-on-light-grey',
    bg: '#F8F8FA',
    textColor: '#1F2937',
    label: 'Dark text — for JetUP light theme background',
  },
  {
    id: 'logo-gradient-text-dark',
    bg: '#0F0A1A',
    textColor: '#FFFFFF',
    label: 'Gradient text — premium dark variant',
    gradientText: true,
  },
  {
    id: 'logo-gradient-text-light',
    bg: '#FFFFFF',
    textColor: '#1F2937',
    label: 'Gradient text — premium light variant',
    gradientText: true,
  },
];

function logoHTMLGradientText({ bg, label }) {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:${WIDTH}px; height:${HEIGHT}px;
  background:${bg};
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  font-family:'Montserrat',sans-serif;
  overflow:hidden;
  position:relative;
}
.logo-container {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  gap:30px;
}
.icon-wrapper {
  width:220px; height:220px;
  display:flex; align-items:center; justify-content:center;
}
.rocket-icon svg { width:200px; height:200px; }
.text-jetup {
  font-size:120px;
  font-weight:900;
  font-style:italic;
  letter-spacing:-2px;
  line-height:1;
  background:linear-gradient(135deg, #7C3AED 0%, #9333EA 40%, #E879F9 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.label {
  position:absolute;
  bottom:30px;
  left:50%;
  transform:translateX(-50%);
  font-size:16px;
  font-weight:600;
  color:${bg === '#FFFFFF' ? '#1F2937' : '#FFFFFF'};
  opacity:0.4;
  letter-spacing:2px;
  text-transform:uppercase;
  white-space:nowrap;
}
</style>
</head><body>
<div class="logo-container">
  <div class="icon-wrapper">
    <div class="rocket-icon">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="60" y1="160" x2="140" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#7C3AED"/>
            <stop offset="50%" stop-color="#9333EA"/>
            <stop offset="100%" stop-color="#E879F9"/>
          </linearGradient>
        </defs>
        <circle cx="130" cy="60" r="55" fill="url(#g1)"/>
        <rect x="55" y="65" width="90" height="14" rx="7" fill="url(#g1)" transform="rotate(-40 100 72)"/>
        <rect x="45" y="85" width="80" height="14" rx="7" fill="url(#g1)" transform="rotate(-40 85 92)"/>
        <rect x="35" y="105" width="70" height="14" rx="7" fill="url(#g1)" transform="rotate(-40 70 112)"/>
        <rect x="50" y="125" width="55" height="12" rx="6" fill="url(#g1)" transform="rotate(-40 77 131)"/>
        <rect x="65" y="140" width="40" height="10" rx="5" fill="url(#g1)" transform="rotate(-40 85 145)"/>
      </svg>
    </div>
  </div>
  <div class="text-jetup">JetUP</div>
</div>
<div class="label">${label}</div>
</body></html>`;
}

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });

  for (const v of variants) {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    const html = v.gradientText
      ? logoHTMLGradientText({ bg: v.bg, label: v.label })
      : logoHTML({ bg: v.bg, textColor: v.textColor, label: v.label });
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const filepath = path.join(OUTPUT_DIR, `${v.id}.png`);
    await page.screenshot({ path: filepath, type: 'png' });
    console.log(`  ✓ ${v.id}.png`);
    await page.close();
  }

  await browser.close();
  console.log('Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
