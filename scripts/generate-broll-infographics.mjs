import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'client', 'public', 'images', 'heygen-broll');

const WIDTH = 1080;
const HEIGHT = 1920;

const COLORS = {
  dark: {
    bg: '#0F0A1A',
    bgSecondary: '#1A1028',
    bgCard: 'rgba(124, 58, 237, 0.08)',
    bgCardBorder: 'rgba(124, 58, 237, 0.25)',
    text: '#F1F5F9',
    textSecondary: 'rgba(241, 245, 249, 0.6)',
    accent: '#A855F7',
    primary: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)',
    glowColor: 'rgba(168, 85, 247, 0.15)',
    barBg: 'rgba(124, 58, 237, 0.15)',
    barFill: 'linear-gradient(90deg, #7C3AED, #A855F7)',
    divider: 'rgba(124, 58, 237, 0.3)',
  },
  light: {
    bg: '#F8F8FA',
    bgSecondary: '#FFFFFF',
    bgCard: 'rgba(124, 58, 237, 0.06)',
    bgCardBorder: 'rgba(124, 58, 237, 0.15)',
    text: '#1F2937',
    textSecondary: 'rgba(31, 41, 55, 0.6)',
    accent: '#7C3AED',
    primary: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 50%, #A855F7 100%)',
    glowColor: 'rgba(124, 58, 237, 0.08)',
    barBg: 'rgba(124, 58, 237, 0.1)',
    barFill: 'linear-gradient(90deg, #7C3AED, #A855F7)',
    divider: 'rgba(124, 58, 237, 0.2)',
  }
};

function wrapHTML(bodyContent, theme) {
  const c = COLORS[theme];
  const bgGlow = theme === 'dark' 
    ? `<div style="position:absolute;top:15%;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(124,58,237,0.12) 0%,transparent 70%);border-radius:50%;pointer-events:none;"></div>`
    : '';
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width:${WIDTH}px; height:${HEIGHT}px;
  background:${c.bg};
  color:${c.text};
  font-family:'Montserrat',system-ui,sans-serif;
  overflow:hidden;
  position:relative;
}
.container {
  width:100%; height:100%;
  display:flex; flex-direction:column;
  padding:80px 60px;
  position:relative;
  z-index:1;
}
.video-badge {
  font-size:18px; font-weight:600;
  color:${c.accent};
  letter-spacing:3px;
  text-transform:uppercase;
  margin-bottom:24px;
}
.title {
  font-size:64px; font-weight:900;
  line-height:1.15;
  margin-bottom:16px;
  background:${c.gradient};
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.subtitle {
  font-size:24px; font-weight:500;
  color:${c.textSecondary};
  margin-bottom:60px;
  line-height:1.5;
}
.tier-row {
  display:flex; align-items:center;
  margin-bottom:28px;
  gap:20px;
}
.tier-bar {
  flex:1; height:56px;
  background:${c.barBg};
  border-radius:12px;
  position:relative;
  overflow:hidden;
}
.tier-bar-fill {
  height:100%;
  background:${c.barFill};
  border-radius:12px;
  display:flex; align-items:center;
  padding:0 20px;
  min-width:fit-content;
}
.tier-label {
  font-size:20px; font-weight:700;
  color:#fff;
  white-space:nowrap;
}
.tier-value {
  font-size:28px; font-weight:800;
  color:${c.text};
  min-width:120px;
  text-align:right;
}
.card {
  background:${c.bgCard};
  border:1px solid ${c.bgCardBorder};
  border-radius:20px;
  padding:36px;
  margin-bottom:20px;
}
.card-row {
  display:flex; justify-content:space-between;
  align-items:center;
  padding:16px 0;
  border-bottom:1px solid ${c.divider};
}
.card-row:last-child { border-bottom:none; }
.big-number {
  font-size:72px; font-weight:900;
  background:${c.gradient};
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.flow-step {
  display:flex; align-items:center;
  gap:24px;
  margin-bottom:32px;
}
.flow-icon {
  width:80px; height:80px;
  border-radius:20px;
  background:${c.gradient};
  display:flex; align-items:center; justify-content:center;
  font-size:36px; color:#fff; flex-shrink:0;
}
.flow-arrow {
  display:flex; align-items:center; justify-content:center;
  color:${c.accent}; font-size:32px;
  margin:0 auto; padding:8px 0;
}
.layer-card {
  background:${c.bgCard};
  border:1px solid ${c.bgCardBorder};
  border-radius:16px;
  padding:28px 32px;
  margin-bottom:16px;
  display:flex; align-items:center; gap:24px;
}
.layer-num {
  width:56px; height:56px;
  border-radius:14px;
  background:${c.gradient};
  display:flex; align-items:center; justify-content:center;
  font-size:24px; font-weight:800; color:#fff;
  flex-shrink:0;
}
.footer-line {
  margin-top:auto;
  padding-top:40px;
  border-top:1px solid ${c.divider};
  display:flex; align-items:center; gap:16px;
}
.footer-logo {
  font-size:22px; font-weight:800;
  background:${c.gradient};
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.footer-tagline {
  font-size:16px; color:${c.textSecondary};
}
.node {
  width:48px; height:48px;
  border-radius:50%;
  background:${c.gradient};
  display:flex; align-items:center; justify-content:center;
  font-size:16px; font-weight:700; color:#fff;
}
.node-small {
  width:36px; height:36px;
  border-radius:50%;
  background:${c.barBg};
  border:2px solid ${c.accent};
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:600; color:${c.accent};
}
.connector-line {
  width:2px; height:32px;
  background:${c.divider};
  margin:0 auto;
}
.split-container {
  display:flex; gap:20px;
  flex:1;
}
.split-panel {
  flex:1;
  background:${c.bgCard};
  border:1px solid ${c.bgCardBorder};
  border-radius:20px;
  padding:32px 24px;
  display:flex; flex-direction:column;
  align-items:center;
  text-align:center;
}
</style>
</head><body>${bgGlow}<div class="container">${bodyContent}</div></body></html>`;
}

function footer() {
  return `<div class="footer-line">
    <span class="footer-logo">JetUP</span>
    <span class="footer-tagline">Partner Program</span>
  </div>`;
}

const infographics = [
  {
    id: 'v1-s1-commission-scale',
    video: 1,
    title: 'Комиссия за лот',
    render: (theme) => {
      const c = COLORS[theme];
      const levels = [
        { level: 1, value: '$2.00', pct: 100 },
        { level: 2, value: '$1.00', pct: 70 },
        { level: 3, value: '$1.00', pct: 70 },
        { level: 4, value: '$1.00', pct: 70 },
        { level: 5, value: '$0.50', pct: 45 },
        { level: 6, value: '$1.00', pct: 70 },
        { level: 7, value: '$0.50', pct: 45 },
        { level: 8, value: '$0.50', pct: 45 },
        { level: 9, value: '$0.50', pct: 45 },
        { level: 10, value: '$0.50', pct: 45 },
      ];
      const rows = levels.map(l => `
        <div class="tier-row">
          <div style="font-size:18px;font-weight:700;color:${c.textSecondary};min-width:90px;">Level ${l.level}</div>
          <div class="tier-bar">
            <div class="tier-bar-fill" style="width:${l.pct}%">
              <span class="tier-label">${l.value}/лот</span>
            </div>
          </div>
        </div>
      `).join('');
      return wrapHTML(`
        <div class="video-badge">Video 1 • Scene 1</div>
        <div class="title">Комиссия<br>за лот</div>
        <div class="subtitle">10-уровневая шкала выплат за торговую активность</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">${rows}</div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v1-s2-unlock-logic',
    video: 1,
    title: 'Глубина структуры',
    render: (theme) => {
      const c = COLORS[theme];
      const unlocks = [
        { level: '1', req: 'Стартовый', desc: 'Автоматически' },
        { level: '2', req: '1 партнёр', desc: '1 прямой реферал' },
        { level: '3', req: '2 партнёра', desc: '2 прямых реферала' },
        { level: '4', req: '3 партнёра', desc: '3 прямых реферала' },
        { level: '5–10', req: '4 партнёра', desc: '4 прямых реферала' },
      ];
      const rows = unlocks.map((u, i) => `
        <div class="card" style="display:flex;align-items:center;gap:24px;padding:28px 32px;">
          <div class="layer-num">${u.level}</div>
          <div style="flex:1;">
            <div style="font-size:24px;font-weight:700;margin-bottom:4px;">${u.req}</div>
            <div style="font-size:16px;color:${c.textSecondary};">${u.desc}</div>
          </div>
          ${i < unlocks.length - 1 ? `<div style="font-size:28px;color:${c.accent};">→</div>` : `<div style="font-size:28px;color:${c.accent};">✓</div>`}
        </div>
      `).join('');
      return wrapHTML(`
        <div class="video-badge">Video 1 • Scene 2</div>
        <div class="title">Глубина<br>структуры</div>
        <div class="subtitle">Как открываются уровни комиссий</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:4px;">${rows}</div>
        <div style="text-align:center;padding:20px 0;">
          <div style="font-size:16px;color:${c.textSecondary};">Минимум для квалификации: <span style="color:${c.accent};font-weight:700;">250 USD</span> активный трейдинг</div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v1-s3-recurring-income',
    video: 1,
    title: 'Повторяющийся доход',
    render: (theme) => {
      const c = COLORS[theme];
      const steps = [
        { icon: '$', label: 'Сделка', desc: 'Клиент торгует' },
        { icon: 'V', label: 'Объём', desc: 'Генерируется лоты' },
        { icon: '%', label: 'Комиссия', desc: 'Выплата за каждый лот' },
        { icon: '↻', label: 'Повтор', desc: 'Каждая сделка = доход' },
      ];
      const cx = 480;
      const cy = 400;
      const r = 220;
      const nodeR = 60;
      const positions = [
        { x: cx, y: cy - r, labelX: cx - 100, labelY: cy - r - 100, align: 'center', lw: 200 },
        { x: cx + r, y: cy, labelX: cx + r + 80, labelY: cy - 30, align: 'left', lw: 200 },
        { x: cx, y: cy + r, labelX: cx - 100, labelY: cy + r + 80, align: 'center', lw: 200 },
        { x: cx - r, y: cy, labelX: cx - r - 280, labelY: cy - 30, align: 'right', lw: 200 },
      ];
      const nodesHtml = steps.map((s, i) => {
        const p = positions[i];
        return `
          <div style="position:absolute;left:${p.x - nodeR}px;top:${p.y - nodeR}px;width:${nodeR*2}px;height:${nodeR*2}px;border-radius:50%;background:${c.gradient};display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#fff;box-shadow:0 0 40px rgba(124,58,237,0.5);z-index:2;">
            ${s.icon}
          </div>
          <div style="position:absolute;left:${p.labelX}px;top:${p.labelY}px;width:${p.lw}px;text-align:${p.align};z-index:2;">
            <div style="font-size:24px;font-weight:800;margin-bottom:4px;">${s.label}</div>
            <div style="font-size:15px;color:${c.textSecondary};">${s.desc}</div>
          </div>
        `;
      }).join('');

      const arrowColor = c.accent;
      const arcR = r + 30;
      const svgW = cx * 2;
      const svgH = cy * 2;
      const svgArrows = `
        <svg style="position:absolute;left:0;top:0;width:${svgW}px;height:${svgH}px;z-index:1;" viewBox="0 0 ${svgW} ${svgH}">
          <defs>
            <marker id="ah-${theme}" markerWidth="14" markerHeight="10" refX="12" refY="5" orient="auto" fill="${arrowColor}">
              <polygon points="0 0, 14 5, 0 10" />
            </marker>
          </defs>
          <circle cx="${cx}" cy="${cy}" r="${arcR}" stroke="${arrowColor}" stroke-width="2" fill="none" opacity="0.15" stroke-dasharray="6,10" />
          <path d="M ${cx + 45} ${cy - arcR + 5} A ${arcR} ${arcR} 0 0 1 ${cx + arcR - 5} ${cy - 45}"
                stroke="${arrowColor}" stroke-width="3" fill="none" stroke-dasharray="8,6"
                marker-end="url(#ah-${theme})" opacity="0.6" />
          <path d="M ${cx + arcR - 5} ${cy + 45} A ${arcR} ${arcR} 0 0 1 ${cx + 45} ${cy + arcR - 5}"
                stroke="${arrowColor}" stroke-width="3" fill="none" stroke-dasharray="8,6"
                marker-end="url(#ah-${theme})" opacity="0.6" />
          <path d="M ${cx - 45} ${cy + arcR - 5} A ${arcR} ${arcR} 0 0 1 ${cx - arcR + 5} ${cy + 45}"
                stroke="${arrowColor}" stroke-width="3" fill="none" stroke-dasharray="8,6"
                marker-end="url(#ah-${theme})" opacity="0.6" />
          <path d="M ${cx - arcR + 5} ${cy - 45} A ${arcR} ${arcR} 0 0 1 ${cx - 45} ${cy - arcR + 5}"
                stroke="${arrowColor}" stroke-width="3" fill="none" stroke-dasharray="8,6"
                marker-end="url(#ah-${theme})" opacity="0.6" />
        </svg>
      `;

      return wrapHTML(`
        <div class="video-badge">Video 1 • Scene 3</div>
        <div class="title">Повторяющийся<br>доход</div>
        <div class="subtitle">Цикл: сделка → объём → комиссия</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="position:relative;width:${cx*2}px;height:${cy*2}px;">
            ${svgArrows}
            ${nodesHtml}
          </div>
        </div>
        <div style="text-align:center;padding:16px 0;">
          <div style="font-size:20px;font-weight:700;color:${c.accent};">Пока клиент торгует — вы зарабатываете</div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v1-s4-team-activity',
    video: 1,
    title: 'Доход с активности команды',
    render: (theme) => {
      const c = COLORS[theme];
      return wrapHTML(`
        <div class="video-badge">Video 1 • Scene 4</div>
        <div class="title">Доход<br>с активности<br>команды</div>
        <div class="subtitle">10 уровней глубины = доход с каждого</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="position:relative;width:100%;">
            ${[1,2,3,4,5,6,7,8,9,10].map((lvl, i) => {
              const w = 30 + i * 7;
              const opacity = 1 - i * 0.06;
              const val = [2.00,1.00,1.00,1.00,0.50,1.00,0.50,0.50,0.50,0.50][i];
              return `<div style="display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                <div style="width:${w}%;height:52px;background:${c.barBg};border-radius:12px;position:relative;overflow:hidden;border:1px solid ${c.bgCardBorder};">
                  <div style="position:absolute;inset:0;background:${c.barFill};opacity:${opacity};border-radius:12px;"></div>
                  <div style="position:relative;display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 20px;">
                    <span style="font-size:16px;font-weight:700;color:#fff;">Ур. ${lvl}</span>
                    <span style="font-size:18px;font-weight:800;color:#fff;">$${val.toFixed(2)}</span>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div style="text-align:center;padding:16px 0;">
          <div style="font-size:18px;color:${c.textSecondary};">Структура растёт → доход растёт</div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v2-s1-profit-share',
    video: 2,
    title: 'Profit Share',
    render: (theme) => {
      const c = COLORS[theme];
      const tiers = [
        { vol: '50K', ps: '4%', ib: '—', total: '4%' },
        { vol: '150K', ps: '3%', ib: '1%', total: '4%' },
        { vol: '500K', ps: '2%', ib: '2%', total: '4%' },
        { vol: '1M', ps: '1%', ib: '3%', total: '4%' },
        { vol: '2M', ps: '1%', ib: '3%', total: '4%' },
      ];
      const headerStyle = `font-size:16px;font-weight:700;color:${c.accent};padding:16px 0;text-align:center;`;
      const cellStyle = `font-size:22px;font-weight:600;padding:20px 0;text-align:center;border-top:1px solid ${c.divider};`;
      return wrapHTML(`
        <div class="video-badge">Video 2 • Scene 1</div>
        <div class="title">Profit Share</div>
        <div class="subtitle">Доля от прибыли по мере роста команды</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          <div class="card" style="padding:32px;">
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:0;">
              <div style="${headerStyle}">Объём</div>
              <div style="${headerStyle}">Profit Share</div>
              <div style="${headerStyle}">Infinity</div>
              <div style="${headerStyle}">Итого</div>
              ${tiers.map(t => `
                <div style="${cellStyle}color:${c.text};font-weight:700;">${t.vol}</div>
                <div style="${cellStyle}color:${c.text};">${t.ps}</div>
                <div style="${cellStyle}color:${c.text};">${t.ib}</div>
                <div style="${cellStyle}"><span style="background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;">${t.total}</span></div>
              `).join('')}
            </div>
          </div>
          <div style="text-align:center;margin-top:20px;">
            <div style="font-size:16px;color:${c.textSecondary};">Правило 50/50: не более 50% объёма с одной ветки</div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v2-s2-activity-vs-result',
    video: 2,
    title: 'Доход с результата',
    render: (theme) => {
      const c = COLORS[theme];
      return wrapHTML(`
        <div class="video-badge">Video 2 • Scene 2</div>
        <div class="title">Доход<br>с результата</div>
        <div class="subtitle">Активность vs Результат</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          <div class="split-container">
            <div class="split-panel">
              <div style="font-size:48px;margin-bottom:20px;">⚡</div>
              <div style="font-size:24px;font-weight:800;margin-bottom:12px;">Активность</div>
              <div style="font-size:18px;color:${c.textSecondary};margin-bottom:24px;">Lot Commissions</div>
              <div style="width:100%;height:4px;background:${c.barFill};border-radius:2px;margin-bottom:24px;"></div>
              <div style="font-size:16px;color:${c.textSecondary};line-height:1.6;">
                За каждую сделку<br>клиентов в структуре<br>
                <span style="font-size:20px;font-weight:700;color:${c.accent};">10 уровней</span>
              </div>
            </div>
            <div class="split-panel">
              <div style="font-size:48px;margin-bottom:20px;">📈</div>
              <div style="font-size:24px;font-weight:800;margin-bottom:12px;">Результат</div>
              <div style="font-size:18px;color:${c.textSecondary};margin-bottom:24px;">Profit Share</div>
              <div style="width:100%;height:4px;background:${c.barFill};border-radius:2px;margin-bottom:24px;"></div>
              <div style="font-size:16px;color:${c.textSecondary};line-height:1.6;">
                Доля от прибыли<br>всей команды<br>
                <span style="font-size:20px;font-weight:700;color:${c.accent};">до 4%</span>
              </div>
            </div>
          </div>
          <div style="text-align:center;margin-top:32px;">
            <div class="card" style="display:inline-block;padding:20px 40px;">
              <div style="font-size:18px;font-weight:600;">Два источника = стабильность</div>
            </div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v2-s3-residual-income',
    video: 2,
    title: 'Остаточный доход',
    render: (theme) => {
      const c = COLORS[theme];
      const stages = [
        { team: '10', income: '~$500', bar: 20 },
        { team: '50', income: '~$2,500', bar: 40 },
        { team: '200', income: '~$10,000', bar: 65 },
        { team: '500+', income: '~$25,000+', bar: 90 },
      ];
      return wrapHTML(`
        <div class="video-badge">Video 2 • Scene 3</div>
        <div class="title">Остаточный<br>доход</div>
        <div class="subtitle">Команда растёт → доход растёт</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          ${stages.map((s, i) => `
            <div class="card" style="display:flex;align-items:center;gap:24px;padding:28px 32px;margin-bottom:16px;">
              <div style="min-width:100px;">
                <div style="font-size:14px;color:${c.textSecondary};margin-bottom:4px;">Команда</div>
                <div style="font-size:28px;font-weight:800;color:${c.accent};">${s.team}</div>
              </div>
              <div style="flex:1;">
                <div style="height:40px;background:${c.barBg};border-radius:10px;overflow:hidden;">
                  <div style="height:100%;width:${s.bar}%;background:${c.barFill};border-radius:10px;"></div>
                </div>
              </div>
              <div style="min-width:120px;text-align:right;">
                <div style="font-size:14px;color:${c.textSecondary};margin-bottom:4px;">Доход/мес</div>
                <div style="font-size:24px;font-weight:800;">${s.income}</div>
              </div>
            </div>
          `).join('')}
          <div style="text-align:center;margin-top:24px;">
            <div style="font-size:18px;font-weight:600;color:${c.accent};">Profit Share начисляется каждый месяц</div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v3-s1-infinity-bonus',
    video: 3,
    title: 'Infinity Bonus',
    render: (theme) => {
      const c = COLORS[theme];
      const tiers = [
        { vol: '100K', pct: '+1%', bar: 20 },
        { vol: '300K', pct: '+2%', bar: 40 },
        { vol: '1M', pct: '+3%', bar: 60 },
        { vol: '5M', pct: '+4%', bar: 80 },
        { vol: '20M', pct: '+5%', bar: 100 },
      ];
      return wrapHTML(`
        <div class="video-badge">Video 3 • Scene 1</div>
        <div class="title">Infinity<br>Bonus</div>
        <div class="subtitle">Дополнительный бонус за глубину структуры</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:space-evenly;">
          ${tiers.reverse().map(t => `
            <div style="display:flex;align-items:center;gap:24px;">
              <div style="width:4px;height:60px;background:${c.barFill};border-radius:2px;"></div>
              <div>
                <div style="font-size:56px;font-weight:900;background:${c.gradient};-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${t.pct}</div>
                <div style="font-size:20px;color:${c.textSecondary};font-weight:600;">${t.vol}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v3-s2-depth-income',
    video: 3,
    title: 'Доход с глубины',
    render: (theme) => {
      const c = COLORS[theme];
      return wrapHTML(`
        <div class="video-badge">Video 3 • Scene 2</div>
        <div class="title">Доход<br>с глубины</div>
        <div class="subtitle">Структура работает на всех уровнях</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="width:100%;max-width:600px;">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <div class="node" style="width:72px;height:72px;font-size:20px;">ВЫ</div>
              <div class="connector-line" style="height:40px;"></div>
              <div style="display:flex;gap:80px;margin-bottom:0;">
                <div style="display:flex;flex-direction:column;align-items:center;">
                  <div class="node">P1</div>
                  <div class="connector-line"></div>
                  <div style="display:flex;gap:32px;">
                    <div style="display:flex;flex-direction:column;align-items:center;">
                      <div class="node-small">A</div>
                      <div class="connector-line" style="height:24px;"></div>
                      <div style="display:flex;gap:16px;">
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                      </div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;">
                      <div class="node-small">B</div>
                      <div class="connector-line" style="height:24px;"></div>
                      <div style="display:flex;gap:16px;">
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:center;">
                  <div class="node">P2</div>
                  <div class="connector-line"></div>
                  <div style="display:flex;gap:32px;">
                    <div style="display:flex;flex-direction:column;align-items:center;">
                      <div class="node-small">C</div>
                      <div class="connector-line" style="height:24px;"></div>
                      <div style="display:flex;gap:16px;">
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                      </div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;">
                      <div class="node-small">D</div>
                      <div class="connector-line" style="height:24px;"></div>
                      <div style="display:flex;gap:16px;">
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                        <div class="node-small" style="width:28px;height:28px;font-size:10px;">•</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style="margin-top:48px;text-align:center;">
              <div class="card" style="display:inline-block;padding:24px 40px;">
                <div style="font-size:20px;font-weight:700;">Infinity Bonus = доход<br>с <span style="color:${c.accent};">неограниченной</span> глубины</div>
              </div>
            </div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v3-s3-team-scale',
    video: 3,
    title: 'Масштаб команды',
    render: (theme) => {
      const c = COLORS[theme];
      const branches = [
        { label: 'Ветка 1', members: 50, vol: '100K' },
        { label: 'Ветка 2', members: 120, vol: '300K' },
        { label: 'Ветка 3', members: 300, vol: '1M' },
        { label: 'Ветка 4', members: 500, vol: '5M' },
      ];
      return wrapHTML(`
        <div class="video-badge">Video 3 • Scene 3</div>
        <div class="title">Масштаб<br>команды</div>
        <div class="subtitle">Дупликация: ветки множатся</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          ${branches.map((b, i) => `
            <div class="card" style="display:flex;align-items:center;gap:24px;padding:28px 32px;margin-bottom:16px;position:relative;overflow:hidden;">
              <div style="position:absolute;left:0;top:0;bottom:0;width:6px;background:${c.barFill};border-radius:3px 0 0 3px;"></div>
              <div style="padding-left:12px;flex:1;">
                <div style="font-size:22px;font-weight:700;margin-bottom:8px;">${b.label}</div>
                <div style="display:flex;gap:32px;">
                  <div>
                    <div style="font-size:14px;color:${c.textSecondary};">Участников</div>
                    <div style="font-size:28px;font-weight:800;color:${c.accent};">${b.members}</div>
                  </div>
                  <div>
                    <div style="font-size:14px;color:${c.textSecondary};">Объём</div>
                    <div style="font-size:28px;font-weight:800;">${b.vol}</div>
                  </div>
                </div>
              </div>
              <div style="font-size:36px;color:${c.accent};">×${i + 1}</div>
            </div>
          `).join('')}
          <div style="text-align:center;margin-top:24px;">
            <div style="font-size:18px;font-weight:600;color:${c.accent};">Каждая ветка дуплицирует систему</div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v4-s1-global-pool',
    video: 4,
    title: 'Global Pool',
    render: (theme) => {
      const c = COLORS[theme];
      return wrapHTML(`
        <div class="video-badge">Video 4 • Scene 1</div>
        <div class="title">Global Pool</div>
        <div class="subtitle">Бонусные пулы для лидеров</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:32px;">
          <div class="card" style="padding:48px 40px;text-align:center;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:6px;background:${c.barFill};"></div>
            <div style="font-size:20px;font-weight:600;color:${c.accent};margin-bottom:16px;letter-spacing:2px;">POOL 1</div>
            <div style="font-size:48px;font-weight:900;margin-bottom:16px;">300K</div>
            <div style="font-size:20px;color:${c.textSecondary};margin-bottom:8px;">Ежемесячный свежий капитал</div>
            <div style="width:60%;height:3px;background:${c.divider};margin:24px auto;"></div>
            <div style="display:flex;justify-content:center;gap:48px;">
              <div>
                <div style="font-size:16px;color:${c.textSecondary};">Мин. лоты</div>
                <div style="font-size:32px;font-weight:800;color:${c.accent};">1.0</div>
              </div>
              <div>
                <div style="font-size:16px;color:${c.textSecondary};">Статус</div>
                <div style="font-size:32px;font-weight:800;">Лидер</div>
              </div>
            </div>
          </div>
          <div class="card" style="padding:48px 40px;text-align:center;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#C9A96E,#E8D5A8);"></div>
            <div style="font-size:20px;font-weight:600;color:#C9A96E;margin-bottom:16px;letter-spacing:2px;">POOL 2</div>
            <div style="font-size:48px;font-weight:900;margin-bottom:16px;">1M</div>
            <div style="font-size:20px;color:${c.textSecondary};margin-bottom:8px;">Ежемесячный свежий капитал</div>
            <div style="width:60%;height:3px;background:${c.divider};margin:24px auto;"></div>
            <div style="display:flex;justify-content:center;gap:48px;">
              <div>
                <div style="font-size:16px;color:${c.textSecondary};">Мин. лоты</div>
                <div style="font-size:32px;font-weight:800;color:#C9A96E;">1.5</div>
              </div>
              <div>
                <div style="font-size:16px;color:${c.textSecondary};">Статус</div>
                <div style="font-size:32px;font-weight:800;">Топ-лидер</div>
              </div>
            </div>
          </div>
        </div>
        <div style="text-align:center;padding:16px 0;">
          <div style="font-size:16px;color:${c.textSecondary};">Ежемесячная реквалификация</div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v4-s2-bonus-economy',
    video: 4,
    title: 'Бонусная экономика',
    render: (theme) => {
      const c = COLORS[theme];
      return wrapHTML(`
        <div class="video-badge">Video 4 • Scene 2</div>
        <div class="title">Бонусная<br>экономика</div>
        <div class="subtitle">Как структура связана с пулом компании</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="width:100%;max-width:700px;">
            <div class="card" style="text-align:center;padding:36px;margin-bottom:16px;">
              <div style="font-size:20px;font-weight:700;margin-bottom:8px;">Ваша структура</div>
              <div style="font-size:16px;color:${c.textSecondary};">Партнёры → Клиенты → Объём</div>
            </div>
            <div class="flow-arrow" style="font-size:40px;">▼</div>
            <div class="card" style="text-align:center;padding:36px;margin-bottom:16px;">
              <div style="font-size:20px;font-weight:700;margin-bottom:8px;">Квалификация</div>
              <div style="display:flex;justify-content:center;gap:32px;margin-top:16px;">
                <div style="text-align:center;">
                  <div style="font-size:14px;color:${c.textSecondary};">Pool 1</div>
                  <div style="font-size:20px;font-weight:800;color:${c.accent};">300K + 1 лот</div>
                </div>
                <div style="text-align:center;">
                  <div style="font-size:14px;color:${c.textSecondary};">Pool 2</div>
                  <div style="font-size:20px;font-weight:800;color:#C9A96E;">1M + 1.5 лот</div>
                </div>
              </div>
            </div>
            <div class="flow-arrow" style="font-size:40px;">▼</div>
            <div class="card" style="text-align:center;padding:36px;background:${c.gradient};border:none;">
              <div style="font-size:24px;font-weight:800;color:#fff;">Global Pool Reward</div>
              <div style="font-size:16px;color:rgba(255,255,255,0.8);margin-top:8px;">Ежемесячная выплата из пула компании</div>
            </div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v4-s3-mature-layer',
    video: 4,
    title: 'Зрелый бонусный слой',
    render: (theme) => {
      const c = COLORS[theme];
      const layers = [
        { num: 1, name: 'Lot Commissions', desc: 'Комиссия за каждый лот', icon: '⚡' },
        { num: 2, name: 'Profit Share', desc: 'Доля от прибыли команды', icon: '📈' },
        { num: 3, name: 'Infinity Bonus', desc: 'Бонус за глубину', icon: '∞' },
        { num: 4, name: 'Global Pool', desc: 'Пул компании для лидеров', icon: '🌍' },
      ];
      return wrapHTML(`
        <div class="video-badge">Video 4 • Scene 3</div>
        <div class="title">Зрелый<br>бонусный<br>слой</div>
        <div class="subtitle">Многослойная архитектура дохода</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          ${layers.map((l, i) => `
            <div class="layer-card" style="position:relative;">
              <div class="layer-num">${l.icon}</div>
              <div style="flex:1;">
                <div style="font-size:14px;color:${c.textSecondary};margin-bottom:4px;">Слой ${l.num}</div>
                <div style="font-size:22px;font-weight:700;margin-bottom:4px;">${l.name}</div>
                <div style="font-size:16px;color:${c.textSecondary};">${l.desc}</div>
              </div>
            </div>
            ${i < layers.length - 1 ? `<div style="display:flex;align-items:center;justify-content:center;"><div style="width:2px;height:20px;background:${c.divider};"></div></div>` : ''}
          `).join('')}
          <div style="text-align:center;margin-top:32px;">
            <div style="font-size:18px;font-weight:700;color:${c.accent};">4 слоя = стабильный доход</div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v5-s1-partner-program',
    video: 5,
    title: 'Партнёрская программа JetUP',
    render: (theme) => {
      const c = COLORS[theme];
      const bonuses = [
        { name: 'Lot Commissions', pct: '$0.50–$2.00/лот', color: '#7C3AED', desc: '10 уровней глубины' },
        { name: 'Profit Share', pct: 'до 4%', color: '#9333EA', desc: 'от прибыли команды' },
        { name: 'Infinity Bonus', pct: 'до 5%', color: '#A855F7', desc: 'за глубину структуры' },
        { name: 'Global Pool', pct: 'Pool 1 & 2', color: '#C084FC', desc: 'для топ-лидеров' },
      ];
      return wrapHTML(`
        <div class="video-badge">Video 5 • Scene 1</div>
        <div class="title" style="font-size:52px;">Партнёрская<br>программа<br>JetUP</div>
        <div class="subtitle">4 бонуса. 1 система. Неограниченный потенциал.</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          ${bonuses.map((b, i) => `
            <div style="display:flex;align-items:center;gap:24px;margin-bottom:24px;">
              <div style="width:80px;height:80px;border-radius:20px;background:${b.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="font-size:28px;font-weight:900;color:#fff;">${i + 1}</span>
              </div>
              <div style="flex:1;">
                <div style="font-size:24px;font-weight:700;margin-bottom:4px;">${b.name}</div>
                <div style="font-size:16px;color:${c.textSecondary};">${b.desc}</div>
              </div>
              <div style="font-size:22px;font-weight:800;color:${c.accent};text-align:right;">${b.pct}</div>
            </div>
          `).join('')}
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v5-s2-multi-level',
    video: 5,
    title: 'Многоуровневая система дохода',
    render: (theme) => {
      const c = COLORS[theme];
      const steps = [
        { step: '01', title: 'Начни', desc: 'Присоединись к программе, стартовый уровень открыт', icon: '🚀' },
        { step: '02', title: 'Строй', desc: 'Привлекай партнёров, открывай уровни', icon: '🏗️' },
        { step: '03', title: 'Зарабатывай', desc: 'Lot Commissions + Profit Share', icon: '💰' },
        { step: '04', title: 'Масштабируй', desc: 'Infinity Bonus + Global Pool', icon: '📈' },
      ];
      return wrapHTML(`
        <div class="video-badge">Video 5 • Scene 2</div>
        <div class="title" style="font-size:48px;">Многоуровневая<br>система дохода</div>
        <div class="subtitle">Пошаговый путь к доходу</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;">
          ${steps.map((s, i) => `
            <div style="display:flex;gap:24px;margin-bottom:${i < steps.length - 1 ? '12px' : '0'};">
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="width:64px;height:64px;border-radius:50%;background:${c.gradient};display:flex;align-items:center;justify-content:center;font-size:28px;">${s.icon}</div>
                ${i < steps.length - 1 ? `<div style="width:3px;flex:1;background:${c.barFill};margin:8px 0;min-height:40px;border-radius:2px;"></div>` : ''}
              </div>
              <div style="flex:1;padding-top:8px;">
                <div style="font-size:16px;font-weight:600;color:${c.accent};margin-bottom:4px;">Шаг ${s.step}</div>
                <div style="font-size:26px;font-weight:800;margin-bottom:8px;">${s.title}</div>
                <div style="font-size:18px;color:${c.textSecondary};line-height:1.5;">${s.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ${footer()}
      `, theme);
    }
  },
  {
    id: 'v5-s3-ecosystem',
    video: 5,
    title: 'Долгосрочный партнёрский доход',
    render: (theme) => {
      const c = COLORS[theme];
      return wrapHTML(`
        <div class="video-badge">Video 5 • Scene 3</div>
        <div class="title" style="font-size:48px;">Долгосрочный<br>партнёрский<br>доход</div>
        <div class="subtitle">Единая экосистема — все слои связаны</div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <div style="width:100%;position:relative;">
            <div style="position:relative;width:100%;display:flex;flex-direction:column;align-items:center;">
              <div style="width:90%;padding:36px;border-radius:24px;background:rgba(124,58,237,0.06);border:1px solid ${c.bgCardBorder};text-align:center;margin-bottom:16px;">
                <div style="font-size:16px;color:${c.textSecondary};margin-bottom:4px;">Слой 4</div>
                <div style="font-size:22px;font-weight:700;">Global Pool</div>
                <div style="font-size:14px;color:${c.textSecondary};margin-top:4px;">300K–1M свежий капитал</div>
              </div>
              <div style="width:78%;padding:36px;border-radius:24px;background:rgba(124,58,237,0.10);border:1px solid ${c.bgCardBorder};text-align:center;margin-bottom:16px;">
                <div style="font-size:16px;color:${c.textSecondary};margin-bottom:4px;">Слой 3</div>
                <div style="font-size:22px;font-weight:700;">Infinity Bonus</div>
                <div style="font-size:14px;color:${c.textSecondary};margin-top:4px;">+1% → +5% за глубину</div>
              </div>
              <div style="width:66%;padding:36px;border-radius:24px;background:rgba(124,58,237,0.15);border:1px solid ${c.bgCardBorder};text-align:center;margin-bottom:16px;">
                <div style="font-size:16px;color:${c.textSecondary};margin-bottom:4px;">Слой 2</div>
                <div style="font-size:22px;font-weight:700;">Profit Share</div>
                <div style="font-size:14px;color:${c.textSecondary};margin-top:4px;">до 4% от прибыли</div>
              </div>
              <div style="width:54%;padding:36px;border-radius:24px;background:${c.gradient};text-align:center;">
                <div style="font-size:16px;color:rgba(255,255,255,0.7);margin-bottom:4px;">Слой 1</div>
                <div style="font-size:22px;font-weight:700;color:#fff;">Lot Commissions</div>
                <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">$0.50–$2.00 за лот</div>
              </div>
            </div>
          </div>
          <div style="margin-top:40px;text-align:center;">
            <div style="font-size:20px;font-weight:700;color:${c.accent};">JetUP Partner Program</div>
            <div style="font-size:16px;color:${c.textSecondary};margin-top:8px;">Одна система — четыре источника дохода</div>
          </div>
        </div>
        ${footer()}
      `, theme);
    }
  },
];

async function generateOne(info, theme) {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    const html = info.render(theme);
    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    
    const filename = `${info.id}-${theme}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    
    await page.screenshot({ path: filepath, type: 'png' });
    console.log(`  ✓ ${filename}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  const startIdx = parseInt(process.argv[2] || '0', 10);
  const count = parseInt(process.argv[3] || String(infographics.length), 10);
  const slice = infographics.slice(startIdx, startIdx + count);
  
  console.log(`Generating images ${startIdx} to ${startIdx + slice.length - 1} (${slice.length * 2} PNGs)...`);
  
  for (const info of slice) {
    for (const theme of ['dark', 'light']) {
      await generateOne(info, theme);
    }
  }
  
  console.log(`Done!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
