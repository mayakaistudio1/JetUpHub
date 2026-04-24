import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useOptionalSofia } from "@/contexts/SofiaSessionContext";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & FLOW
═══════════════════════════════════════════════════════════════════════════ */

type ScreenId =
  | "cinema" | "s1" | "s2"
  | "path"
  | "c1" | "c2" | "c3" | "c4"
  | "p1" | "p2" | "p3" | "p4" | "promo"
  | "final";

type Path = "client" | "partner" | null;
type Lang = "de" | "ru" | "en";

const NEXT_MAP: Partial<Record<ScreenId, ScreenId>> = {
  cinema: "s1", s1: "s2", s2: "path",
  c1: "c2", c2: "c3", c3: "c4", c4: "final",
  p1: "p2", p2: "p3", p3: "p4", p4: "promo", promo: "final",
};

const PREV_MAP: Partial<Record<ScreenId, ScreenId>> = {
  s1: "cinema", s2: "s1", path: "s2",
  c1: "path", c2: "c1", c3: "c2", c4: "c3",
  p1: "path", p2: "p1", p3: "p2", p4: "p3", promo: "p4",
};

const CLIENT_PATH_LEN = 4;
const PARTNER_PATH_LEN = 5;
const PATH_PROGRESS: Record<string, { step: number; total: number }> = {
  c1: { step: 1, total: CLIENT_PATH_LEN },
  c2: { step: 2, total: CLIENT_PATH_LEN },
  c3: { step: 3, total: CLIENT_PATH_LEN },
  c4: { step: 4, total: CLIENT_PATH_LEN },
  p1: { step: 1, total: PARTNER_PATH_LEN },
  p2: { step: 2, total: PARTNER_PATH_LEN },
  p3: { step: 3, total: PARTNER_PATH_LEN },
  p4: { step: 4, total: PARTNER_PATH_LEN },
  promo: { step: 5, total: PARTNER_PATH_LEN },
};

/* ═══════════════════════════════════════════════════════════════════════════
   CONTENT — all languages
═══════════════════════════════════════════════════════════════════════════ */

interface LangContent {
  pathSwitcher: { client: string; partner: string };
  cinema: { txt: string; gold: boolean; delay: number }[];
  s1: { eyebrow: string; h1: string; h2: string; p: [string, string] };
  s2: { eyebrow: string; h1: string; h2: string; p: [string, string] };
  path: {
    eyebrow: string; h1: string; h2: string;
    choices: { id: "client" | "partner"; label: string; sub: string; accent: boolean }[];
    footer: string;
  };
  c1: { eyebrow: string; h1: string; h2: string; p: string };
  c2: { eyebrow: string; bullets: string[] };
  c3: { eyebrow: string; h1: string; h2: string; features: { label: string; sub: string }[] };
  c4: { eyebrow: string; h1: string; h2: string; pills: string[] };
  p1: { eyebrow: string; h1: string; h2: string; p: string };
  p2: { eyebrow: string; h1: string; h2: string; pills: string[] };
  p3: { eyebrow: string; h1: string; h2: string; rows: { l: string; s: string }[] };
  p4: { eyebrow: string; h1: string; h2: string; p: [string, string] };
  promo: { eyebrow: string; h1: string; h2: string; p: [string, string]; rules: string[]; note: string };
  final: { eyebrow: string; h1: string; h2: string; p: [string, string]; footer: string; replay: string };
}

const CONTENT: Record<Lang, LangContent> = {
  de: {
    pathSwitcher: { client: "Kunde", partner: "Partner" },
    cinema: [
      { txt: "Die meisten Systeme", gold: false, delay: 0.4 },
      { txt: "versprechen viel.", gold: false, delay: 1.2 },
      { txt: "JetUP liefert.", gold: true, delay: 3.2 },
    ],
    s1: { eyebrow: "JetUP", h1: "Kein Angebot.", h2: "Ein System.", p: ["Produkt. Partnermodell. KI.", "In einer Logik."] },
    s2: { eyebrow: "Dein Weg", h1: "Eins hat sich geändert.", h2: "Alles greift ineinander.", p: ["Jeder Schritt baut auf dem nächsten auf.", "Du startest — das System trägt weiter."] },
    path: {
      eyebrow: "Deine Wahl", h1: "Wie willst du", h2: "JetUP nutzen?",
      choices: [
        { id: "client", label: "Als Kunde starten", sub: "Investiere in dein Kapital. Ohne Komplexität.", accent: false },
        { id: "partner", label: "Als Partner aufbauen", sub: "Baue ein System. Nicht alleine.", accent: true },
      ],
      footer: "Keine Entscheidung für immer. Du kannst jederzeit zurück.",
    },
    c1: { eyebrow: "Für den Kunden · 1", h1: "Du willst starten,", h2: "ohne alles selbst zu verstehen.", p: "Genau dafür ist JetUP gebaut worden." },
    c2: { eyebrow: "Für den Kunden · 2", bullets: ["Professionelle Strategien.", "Automatisch. Einfach.", "Kein Trading-Wissen erforderlich."] },
    c3: {
      eyebrow: "Für den Kunden · 3", h1: "Dein Geld", h2: "bleibt bei dir.",
      features: [
        { label: "Eigenes Konto", sub: "Direkt bei TAG Markets" },
        { label: "Volle Kontrolle", sub: "Jederzeit Zugriff" },
        { label: "Kein Risikotransfer", sub: "Kapital bleibt geschützt" },
      ],
    },
    c4: { eyebrow: "Für den Kunden · 4", h1: "Du bist", h2: "nicht allein.", pills: ["System", "KI-Begleitung", "Unterstützung 24/7"] },
    p1: { eyebrow: "Für den Partner · 1", h1: "Du willst nicht alles", h2: "selbst erklären.", p: "Das System übernimmt den ersten Schritt für dich." },
    p2: { eyebrow: "Für den Partner · 2", h1: "Du brauchst", h2: "ein System.", pills: ["Tools", "Präsentation", "KI"] },
    p3: {
      eyebrow: "Für den Partner · 3", h1: "Dein Einkommen", h2: "wächst mit dem Team.",
      rows: [
        { l: "Lot Commission", s: "$2–10 pro Lot" },
        { l: "Profit Share", s: "bis zu 4% monatlich" },
        { l: "Infinity Bonus", s: "1–3% Teamtiefe" },
        { l: "Global Pool", s: "2×1% Plattformumsatz" },
      ],
    },
    p4: { eyebrow: "Für den Partner · 4", h1: "Kein eigenes", h2: "Kapital nötig.", p: ["Du baust auf dem auf, was andere aufgebaut haben.", "Das System skaliert mit dir."] },
    promo: {
      eyebrow: "Dennis Fast Start Promo",
      h1: "+100 USD",
      h2: "Bonus.",
      p: [
        "Zahle 100 USD ein und erhalte 100 USD als Bonus.",
        "200 USD werden mit 24× Amplify zu einem 4.800 USD MT5-Konto — verbunden mit der Sonic-Strategie.",
      ],
      rules: [
        "Nur für neue Partner",
        "Einmal pro Partner",
        "Profits jederzeit auszahlbar",
      ],
      note: "Eigenes Kapital nach 30 Tagen verfügbar · Promo-Bonus nach 12 Monaten.",
    },
    final: {
      eyebrow: "Dein nächster Schritt",
      h1: "Registrieren.",
      h2: "",
      p: [
        "Link bekommst Du von der Person,",
        "die Dich eingeladen hat.",
      ],
      footer: "Mehr Infos auf unserem Digital Hub.",
      replay: "Von vorne ansehen ↺",
    },
  },

  ru: {
    pathSwitcher: { client: "Клиент", partner: "Партнёр" },
    cinema: [
      { txt: "Большинство систем", gold: false, delay: 0.4 },
      { txt: "обещают многое.", gold: false, delay: 1.2 },
      { txt: "JetUP делает.", gold: true, delay: 3.2 },
    ],
    s1: { eyebrow: "JetUP", h1: "Не предложение.", h2: "Система.", p: ["Продукт. Партнёрская модель. ИИ.", "В единой логике."] },
    s2: { eyebrow: "Твой путь", h1: "Одно изменилось.", h2: "Всё связано.", p: ["Каждый шаг строится на следующем.", "Ты начинаешь — система движется дальше."] },
    path: {
      eyebrow: "Твой выбор", h1: "Как ты хочешь", h2: "использовать JetUP?",
      choices: [
        { id: "client", label: "Начать как клиент", sub: "Инвестируй в свой капитал. Без сложностей.", accent: false },
        { id: "partner", label: "Строить как партнёр", sub: "Создай систему. Не в одиночку.", accent: true },
      ],
      footer: "Это не навсегда. Ты можешь вернуться в любой момент.",
    },
    c1: { eyebrow: "Для клиента · 1", h1: "Ты хочешь начать,", h2: "не разбираясь во всём.", p: "Именно для этого создан JetUP." },
    c2: { eyebrow: "Для клиента · 2", bullets: ["Профессиональные стратегии.", "Автоматически. Просто.", "Торговый опыт не нужен."] },
    c3: {
      eyebrow: "Для клиента · 3", h1: "Твои деньги", h2: "остаются у тебя.",
      features: [
        { label: "Собственный счёт", sub: "Напрямую в TAG Markets" },
        { label: "Полный контроль", sub: "Доступ в любой момент" },
        { label: "Без риск-передачи", sub: "Капитал под защитой" },
      ],
    },
    c4: { eyebrow: "Для клиента · 4", h1: "Ты", h2: "не один.", pills: ["Система", "ИИ-поддержка", "Помощь 24/7"] },
    p1: { eyebrow: "Для партнёра · 1", h1: "Тебе не нужно", h2: "объяснять всё самому.", p: "Система берёт на себя первый шаг за тебя." },
    p2: { eyebrow: "Для партнёра · 2", h1: "Тебе нужна", h2: "система.", pills: ["Инструменты", "Презентация", "ИИ"] },
    p3: {
      eyebrow: "Для партнёра · 3", h1: "Твой доход", h2: "растёт с командой.",
      rows: [
        { l: "Лот Комиссия", s: "$2–10 за лот" },
        { l: "Профит Шер", s: "до 4% в месяц" },
        { l: "Infinity Bonus", s: "1–3% в глубину" },
        { l: "Global Pool", s: "2×1% оборот платформы" },
      ],
    },
    p4: { eyebrow: "Для партнёра · 4", h1: "Собственный капитал", h2: "не нужен.", p: ["Ты строишь на том, что создали другие.", "Система масштабируется вместе с тобой."] },
    promo: {
      eyebrow: "Dennis Fast Start Promo",
      h1: "+100 USD",
      h2: "бонус.",
      p: [
        "Внеси 100 USD и получи 100 USD бонусом.",
        "200 USD c 24× Amplify превращаются в счёт MT5 на 4 800 USD — подключённый к стратегии Sonic.",
      ],
      rules: [
        "Только для новых партнёров",
        "Один раз на партнёра",
        "Прибыль выводится в любой момент",
      ],
      note: "Свой капитал доступен через 30 дней · промо-бонус через 12 месяцев.",
    },
    final: {
      eyebrow: "Твой следующий шаг",
      h1: "Регистрация.",
      h2: "",
      p: [
        "Ссылку ты получишь от человека,",
        "который тебя пригласил.",
      ],
      footer: "Больше информации в нашем Digital Hub.",
      replay: "Посмотреть сначала ↺",
    },
  },

  en: {
    pathSwitcher: { client: "Client", partner: "Partner" },
    cinema: [
      { txt: "Most systems", gold: false, delay: 0.4 },
      { txt: "promise a lot.", gold: false, delay: 1.2 },
      { txt: "JetUP delivers.", gold: true, delay: 3.2 },
    ],
    s1: { eyebrow: "JetUP", h1: "Not a product.", h2: "A system.", p: ["Product. Partnership model. AI.", "In one unified logic."] },
    s2: { eyebrow: "Your path", h1: "One thing changed.", h2: "Everything connects.", p: ["Each step builds on the next.", "You start — the system keeps moving."] },
    path: {
      eyebrow: "Your choice", h1: "How do you want to", h2: "use JetUP?",
      choices: [
        { id: "client", label: "Start as a client", sub: "Invest in your capital. Without the complexity.", accent: false },
        { id: "partner", label: "Build as a partner", sub: "Build a system. Not alone.", accent: true },
      ],
      footer: "This is not permanent. You can switch at any time.",
    },
    c1: { eyebrow: "For clients · 1", h1: "You want to start,", h2: "without understanding everything.", p: "That's exactly what JetUP is built for." },
    c2: { eyebrow: "For clients · 2", bullets: ["Professional strategies.", "Automatically. Simply.", "No trading experience needed."] },
    c3: {
      eyebrow: "For clients · 3", h1: "Your money", h2: "stays with you.",
      features: [
        { label: "Your own account", sub: "Directly with TAG Markets" },
        { label: "Full control", sub: "Access at any time" },
        { label: "No risk transfer", sub: "Capital protected" },
      ],
    },
    c4: { eyebrow: "For clients · 4", h1: "You're", h2: "not alone.", pills: ["System", "AI support", "24/7 help"] },
    p1: { eyebrow: "For partners · 1", h1: "You don't need to", h2: "explain everything yourself.", p: "The system takes the first step for you." },
    p2: { eyebrow: "For partners · 2", h1: "You need", h2: "a system.", pills: ["Tools", "Presentation", "AI"] },
    p3: {
      eyebrow: "For partners · 3", h1: "Your income", h2: "grows with the team.",
      rows: [
        { l: "Lot Commission", s: "$2–10 per lot" },
        { l: "Profit Share", s: "up to 4% per month" },
        { l: "Infinity Bonus", s: "1–3% depth" },
        { l: "Global Pool", s: "2×1% platform volume" },
      ],
    },
    p4: { eyebrow: "For partners · 4", h1: "No own capital", h2: "needed.", p: ["You build on what others created.", "The system scales with you."] },
    promo: {
      eyebrow: "Dennis Fast Start Promo",
      h1: "+100 USD",
      h2: "bonus.",
      p: [
        "Deposit 100 USD and get 100 USD as a bonus.",
        "200 USD with 24× Amplify becomes a 4,800 USD MT5 account — connected to the Sonic strategy.",
      ],
      rules: [
        "New partners only",
        "Once per partner",
        "Profits withdrawable any time",
      ],
      note: "Own capital available after 30 days · promo bonus after 12 months.",
    },
    final: {
      eyebrow: "Your next step",
      h1: "Register.",
      h2: "",
      p: [
        "You'll get the link from the person",
        "who invited you.",
      ],
      footer: "More info on our Digital Hub.",
      replay: "Watch again ↺",
    },
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED ATOMS
═══════════════════════════════════════════════════════════════════════════ */

const BRAND_GRADIENT = "linear-gradient(135deg, #7C3AED 0%, #E879F9 100%)";
const BRAND_VIOLET = "#7C3AED";
const BRAND_MAGENTA = "#E879F9";

function Gold({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ background: BRAND_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", ...style }}>
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.26em", textTransform: "uppercase", color: "rgba(232,121,249,0.6)", marginBottom: "1.6rem", animation: "fadeUp 0.5s ease-out 0.05s both" }}>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROGRESS — dot track for path screens
═══════════════════════════════════════════════════════════════════════════ */

function PathProgress({ current, path }: { current: ScreenId; path: Path }) {
  const info = PATH_PROGRESS[current];
  if (!info || !path) return null;
  return (
    <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 40 }}>
      {Array.from({ length: info.total }, (_, i) => i + 1).map((n) => (
        <div key={n} style={{
          width: n === info.step ? 20 : 6, height: 6, borderRadius: 99,
          background: n === info.step ? BRAND_VIOLET : "rgba(255,255,255,0.12)",
          transition: "all 0.4s ease",
        }} />
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   TOP BAR — global progress line
═══════════════════════════════════════════════════════════════════════════ */

function TopBar({ screen, path }: { screen: ScreenId; path: Path }) {
  const introIds: ScreenId[] = ["cinema", "s1", "s2", "path"];
  const clientIds: ScreenId[] = ["c1", "c2", "c3", "c4"];
  const partnerIds: ScreenId[] = ["p1", "p2", "p3", "p4", "promo"];

  let w = 0;
  if (introIds.includes(screen)) {
    w = ((introIds.indexOf(screen) + 1) / (introIds.length)) * 30;
  } else if (path === "client" && clientIds.includes(screen)) {
    w = 30 + ((clientIds.indexOf(screen) + 1) / clientIds.length) * 65;
  } else if (path === "partner" && partnerIds.includes(screen)) {
    w = 30 + ((partnerIds.indexOf(screen) + 1) / partnerIds.length) * 65;
  } else if (screen === "final") {
    w = 100;
  }

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.05)", zIndex: 50 }}>
      <div style={{ height: "100%", width: `${w}%`, background: BRAND_GRADIENT, boxShadow: `0 0 8px ${BRAND_VIOLET}55`, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PATH SWITCHER — always visible once path is chosen
═══════════════════════════════════════════════════════════════════════════ */

function PathSwitcher({ path, onSwitch, labels }: { screen: ScreenId; path: Path; onSwitch: (p: "client" | "partner") => void; labels: { client: string; partner: string } }) {
  if (!path) return null;
  return (
    <div style={{
      position: "absolute", top: 16, right: 60, zIndex: 60,
      display: "flex", gap: 0,
      background: "rgba(8,5,24,0.7)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 999, padding: 4,
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {(["client", "partner"] as const).map((p) => {
        const active = path === p;
        return (
          <button key={p} onClick={() => !active && onSwitch(p)}
            style={{
              background: active ? BRAND_GRADIENT : "transparent",
              border: "none", borderRadius: 999,
              padding: "9px 20px",
              fontSize: "12px", fontWeight: 700,
              color: active ? "#FFFFFF" : "rgba(255,255,255,0.38)",
              cursor: active ? "default" : "pointer",
              letterSpacing: "0.05em", textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow: active ? `0 0 20px ${BRAND_VIOLET}40` : "none",
            }}
            onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.38)"; }}
          >
            {p === "client" ? labels.client : labels.partner}
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NAV ARROWS
═══════════════════════════════════════════════════════════════════════════ */

function NavArrows({ screen, hasPrev, hasNext, onPrev, onNext }: {
  screen: ScreenId; hasPrev: boolean; hasNext: boolean;
  onPrev: () => void; onNext: () => void;
}) {
  if (screen === "path") return null;

  const btn = (active: boolean, onClick: () => void, dir: "←" | "→", side: "left" | "right"): React.ReactElement => (
    <button onClick={onClick} disabled={!active}
      style={{
        position: "absolute", top: "50%", transform: "translateY(-50%)",
        [side]: 20, width: 50, height: 50, borderRadius: "50%", zIndex: 50,
        backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.03)", cursor: active ? "pointer" : "default",
        fontSize: 18, color: active ? BRAND_VIOLET : "rgba(255,255,255,0.1)",
        opacity: active ? 0.6 : 0.15, transition: "all 0.2s ease", display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onMouseEnter={(e) => { if (active) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
      onMouseLeave={(e) => { if (active) (e.currentTarget as HTMLElement).style.opacity = "0.6"; }}
    >
      {dir}
    </button>
  );

  return (
    <>
      {btn(hasPrev, onPrev, "←", "left")}
      {btn(hasNext, onNext, "→", "right")}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCREEN BUILDERS — accept content as param
═══════════════════════════════════════════════════════════════════════════ */

function CinemaScreen({ t, lines }: { t: number; lines: { txt: string; gold: boolean; delay: number }[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "0 10% 12%" }}>
      {lines.filter((l) => t >= l.delay).map((l, i) => (
        <p key={i} style={{
          fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-0.04em", marginBottom: "0.05em",
          background: l.gold ? BRAND_GRADIENT : "none",
          WebkitBackgroundClip: l.gold ? "text" : undefined,
          WebkitTextFillColor: l.gold ? "transparent" : undefined,
          color: l.gold ? undefined : "rgba(255,255,255,0.88)",
          textShadow: l.gold ? "none" : "0 2px 24px rgba(0,0,0,0.9)",
          filter: l.gold ? `drop-shadow(0 0 28px ${BRAND_VIOLET}44)` : "none",
          animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both",
        }}>
          {l.txt}
        </p>
      ))}
    </div>
  );
}

function ScreenS1({ c }: { c: LangContent["s1"] }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        {c.h1}
      </h1>
      <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}>
        <Gold>{c.h2}</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.8, maxWidth: "30ch", animation: "fadeUp 0.65s ease 0.55s both" }}>
        {c.p[0]}<br />{c.p[1]}
      </p>
    </div>
  );
}

function ScreenS2({ c }: { c: LangContent["s2"] }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.08em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
        {c.h1}
      </h1>
      <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.32s both" }}>
        <Gold>{c.h2}</Gold>
      </h2>
      <p style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.8, maxWidth: "32ch", animation: "fadeUp 0.65s ease 0.52s both" }}>
        {c.p[0]}<br />{c.p[1]}
      </p>
    </div>
  );
}

function PathSelect({ c, onChoose }: { c: LangContent["path"]; onChoose: (p: "client" | "partner") => void }) {
  const [hover, setHover] = useState<"client" | "partner" | null>(null);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <h1 style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "rgba(255,255,255,0.88)", marginBottom: "0.12em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
        {c.h1}
      </h1>
      <h2 style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: "3.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}>
        <Gold>{c.h2}</Gold>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 540, animation: "fadeUp 0.7s ease 0.4s both" }}>
        {c.choices.map((ch) => {
          const isHovered = hover === ch.id;
          return (
            <button key={ch.id} onClick={() => onChoose(ch.id)}
              onMouseEnter={() => setHover(ch.id)} onMouseLeave={() => setHover(null)}
              style={{
                all: "unset", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "22px 0",
                borderTop: ch.accent ? `1.5px solid ${BRAND_VIOLET}50` : "1px solid rgba(255,255,255,0.1)",
                borderBottom: ch.accent ? `1.5px solid ${BRAND_VIOLET}50` : "1px solid rgba(255,255,255,0.1)",
                marginTop: ch.accent ? -1 : 0,
                transform: isHovered ? "translateX(8px)" : "translateX(0)",
                transition: "transform 0.3s ease",
              }}
            >
              <div>
                <div style={{
                  fontSize: "clamp(1.3rem, 2.8vw, 2rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em",
                  background: isHovered || ch.accent ? BRAND_GRADIENT : "none",
                  WebkitBackgroundClip: (isHovered || ch.accent) ? "text" : undefined,
                  WebkitTextFillColor: (isHovered || ch.accent) ? "transparent" : undefined,
                  color: (isHovered || ch.accent) ? undefined : "rgba(255,255,255,0.82)",
                  transition: "all 0.3s ease",
                }}>
                  {ch.label}
                </div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginTop: 5, fontWeight: 400 }}>
                  {ch.sub}
                </div>
              </div>
              <div style={{ fontSize: 22, color: isHovered ? BRAND_VIOLET : "rgba(255,255,255,0.2)", marginLeft: 20, transition: "color 0.3s ease, transform 0.3s ease", transform: isHovered ? "translateX(4px)" : "translateX(0)" }}>
                →
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.16)", marginTop: "2.5rem", letterSpacing: "0.02em", animation: "fadeUp 0.6s ease 0.65s both" }}>
        {c.footer}
      </p>
    </div>
  );
}

function buildClientScreens(c: LangContent): Record<string, React.ReactElement> {
  const ctaStyle = (primary: boolean): React.CSSProperties => primary
    ? { display: "block", textDecoration: "none", background: BRAND_GRADIENT, borderRadius: 999, padding: "18px 36px", fontSize: "15px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "0.01em", boxShadow: `0 0 48px ${BRAND_MAGENTA}55, 0 4px 20px rgba(0,0,0,0.4)`, transition: "transform 0.2s ease, box-shadow 0.2s ease" }
    : { display: "block", textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 999, padding: "16px 32px", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.45)", transition: "color 0.2s ease, border-color 0.2s ease" };

  return {
    c1: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.c1.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.c1.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both", marginBottom: "2rem" }}>
          <Gold>{c.c1.h2}</Gold>
        </h2>
        <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.85, animation: "fadeUp 0.65s ease 0.5s both" }}>
          {c.c1.p}
        </p>
      </div>
    ),

    c2: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.c2.eyebrow}</Eyebrow>
        <div style={{ fontSize: "clamp(5rem, 16vw, 12rem)", fontWeight: 900, lineHeight: 0.88, letterSpacing: "-0.05em", color: "rgba(255,255,255,0.92)", animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both", marginBottom: "1.2rem" }}>
          Copy<Gold>X</Gold>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeUp 0.65s ease 0.4s both", maxWidth: 400 }}>
          {c.c2.bullets.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: BRAND_VIOLET, flexShrink: 0 }} />
              <span style={{ fontSize: "clamp(1rem, 1.8vw, 1.25rem)", color: "rgba(255,255,255,0.6)", fontWeight: 400 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    c3: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.c3.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.c3.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <Gold>{c.c3.h2}</Gold>
        </h2>
        <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
          {c.c3.features.map((f, i) => (
            <div key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 12 }}>
              <div style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em" }}>{f.label}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{f.sub}</div>
            </div>
          ))}
        </div>
      </div>
    ),

    c4: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.c4.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.c4.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <Gold>{c.c4.h2}</Gold>
        </h2>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
          {c.c4.pills.map((item, i) => (
            <div key={i} style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(232,121,249,0.30)", background: "rgba(124,58,237,0.08)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),

  };
}

function buildPartnerScreens(c: LangContent): Record<string, React.ReactElement> {
  return {
    p1: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.p1.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.p1.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <Gold>{c.p1.h2}</Gold>
        </h2>
        <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.85, animation: "fadeUp 0.65s ease 0.5s both" }}>
          {c.p1.p}
        </p>
      </div>
    ),

    p2: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.p2.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.08em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.p2.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <Gold>{c.p2.h2}</Gold>
        </h2>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", animation: "fadeUp 0.65s ease 0.5s both" }}>
          {c.p2.pills.map((item, i) => (
            <div key={i} style={{ padding: "12px 24px", borderRadius: 999, border: "1px solid rgba(232,121,249,0.28)", background: "rgba(124,58,237,0.08)", fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),

    p3: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.p3.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", color: "rgba(255,255,255,0.88)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.p3.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(2.8rem, 7.5vw, 7rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <Gold>{c.p3.h2}</Gold>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeUp 0.65s ease 0.5s both", maxWidth: 440 }}>
          {c.p3.rows.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: 10 }}>
              <span style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)", color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{r.l}</span>
              <span style={{ fontSize: "12px", color: BRAND_VIOLET, fontWeight: 700, letterSpacing: "0.02em" }}>{r.s}</span>
            </div>
          ))}
        </div>
      </div>
    ),

    p4: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.p4.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.9)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both" }}>
          {c.p4.h1}
        </h1>
        <h2 style={{ fontSize: "clamp(3rem, 8.5vw, 8rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "2.5rem", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
          <Gold>{c.p4.h2}</Gold>
        </h2>
        <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.28)", fontWeight: 300, lineHeight: 1.85, animation: "fadeUp 0.65s ease 0.5s both", maxWidth: "30ch" }}>
          {c.p4.p[0]}<br />{c.p4.p[1]}
        </p>
      </div>
    ),

    promo: (
      <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
        <Eyebrow>{c.promo.eyebrow}</Eyebrow>
        <h1 style={{ fontSize: "clamp(3rem, 9vw, 8.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", color: "rgba(255,255,255,0.92)", marginBottom: "0.06em", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
          <Gold>{c.promo.h1}</Gold>
        </h1>
        <h2 style={{ fontSize: "clamp(3rem, 9vw, 8.5rem)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.045em", marginBottom: "1.6rem", color: "rgba(255,255,255,0.92)", animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.22s both" }}>
          {c.promo.h2}
        </h2>
        <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", color: "rgba(255,255,255,0.5)", fontWeight: 400, marginBottom: "1.6rem", lineHeight: 1.7, animation: "fadeUp 0.6s ease 0.38s both", maxWidth: "44ch" }}>
          {c.promo.p[0]}<br />{c.promo.p[1]}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: "1.4rem", animation: "fadeUp 0.6s ease 0.5s both" }}>
          {c.promo.rules.map((r, i) => (
            <div key={i} style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid rgba(232,121,249,0.28)", background: "rgba(124,58,237,0.10)", fontSize: "12px", color: "rgba(255,255,255,0.72)", fontWeight: 600, letterSpacing: "0.01em" }}>
              {r}
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.32)", fontWeight: 400, lineHeight: 1.7, animation: "fadeUp 0.55s ease 0.62s both", maxWidth: "52ch", margin: 0 }}>
          {c.promo.note}
        </p>
      </div>
    ),
  };
}

function FinalScreen({ c, onReplay }: { c: LangContent["final"]; onReplay: () => void }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 10%" }}>
      {/* TIER 0 — eyebrow */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: "2.6rem",
        animation: "fadeUp 0.6s ease 0.05s both",
      }}>
        <div style={{ height: 1, width: 40, background: BRAND_GRADIENT }} />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.32em",
          textTransform: "uppercase", color: BRAND_MAGENTA,
        }}>
          {c.eyebrow}
        </span>
      </div>

      {/* TIER 1 — primary message */}
      <h1 style={{
        fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
        fontWeight: 900,
        lineHeight: 1.0,
        letterSpacing: "-0.04em",
        marginBottom: "2rem",
        animation: "fadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.15s both",
      }}>
        <Gold>{c.h1}</Gold>
      </h1>

      {/* TIER 2 — supporting context */}
      <div style={{
        paddingLeft: 22,
        borderLeft: "2px solid rgba(255,255,255,0.10)",
        marginBottom: "2.4rem",
        maxWidth: "44ch",
        animation: "fadeUp 0.6s ease 0.32s both",
      }}>
        <p style={{
          margin: 0,
          fontSize: "clamp(1rem, 1.55vw, 1.2rem)",
          color: "rgba(255,255,255,0.6)",
          fontWeight: 300,
          lineHeight: 1.6,
        }}>
          {c.p[0]}<br />{c.p[1]}
        </p>
      </div>

      {/* TIER 3 — footer note (Digital Hub) */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 14, maxWidth: 520,
        animation: "fadeUp 0.6s ease 0.46s both",
      }}>
        <div style={{
          flexShrink: 0,
          width: 28, height: 28, borderRadius: "50%",
          background: "rgba(124,58,237,0.18)",
          border: "1px solid rgba(232,121,249,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 700, color: "#F0ABFC",
        }}>
          i
        </div>
        <p style={{
          margin: 0,
          fontSize: "clamp(0.95rem, 1.35vw, 1.05rem)",
          color: "rgba(255,255,255,0.78)",
          fontWeight: 500,
          lineHeight: 1.5,
        }}>
          {c.footer}
        </p>
      </div>

      {/* TIER 4 — meta replay */}
      <button onClick={onReplay} style={{
        background: "none", border: "none",
        fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.22)",
        cursor: "pointer", marginTop: "3rem",
        animation: "fadeUp 0.6s ease 0.62s both",
        textAlign: "left", padding: 0,
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.22)"; }}
      >
        {c.replay}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

interface InteractivePresentationProps {
  onClose: () => void;
  language?: Lang;
  initialScreen?: ScreenId;
  initialPath?: Path;
  staticMode?: boolean;
  embedded?: boolean;
  chapterIndex?: number;
  onChapterChange?: (idx: number) => void;
  onNavStateChange?: (state: { canPrev: boolean; canNext: boolean }) => void;
}

export interface InteractivePresentationHandle {
  next: () => void;
  prev: () => void;
}

// Chapter index (0..9) -> screen id used by the inline player on /explore.
export const CHAPTER_TO_SCREEN: ScreenId[] = [
  "cinema",
  "s1",
  "s2",
  "path",
  "p1",
  "p2",
  "p3",
  "p4",
  "promo",
  "final",
];

const SCREEN_TO_CHAPTER: Partial<Record<ScreenId, number>> = CHAPTER_TO_SCREEN.reduce(
  (acc, id, i) => { acc[id] = i; return acc; },
  {} as Record<string, number>,
);

function InteractivePresentationInner({ onClose, language = "de", initialScreen, initialPath, staticMode = false, embedded = false, chapterIndex, onChapterChange, onNavStateChange }: InteractivePresentationProps, ref: React.Ref<InteractivePresentationHandle>) {
  const sofia = useOptionalSofia();
  useEffect(() => {
    if (staticMode || embedded || !sofia) return;
    sofia.sendEvent("presentation_opened");
    return () => { sofia.sendEvent("presentation_closed"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [screen, setScreen] = useState<ScreenId>(initialScreen ?? "cinema");
  const [path, setPath] = useState<Path>(initialPath ?? (embedded ? "partner" : null));
  const [t, setT] = useState(staticMode ? 999 : 0);
  const [transitioning, setTransitioning] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const isCinema = screen === "cinema";
  const CINEMA_DUR = 8;

  const c = CONTENT[language];
  const CLIENT_SCREENS = buildClientScreens(c);
  const PARTNER_SCREENS = buildPartnerScreens(c);

  const goTo = useCallback((id: ScreenId) => {
    if (transitioning) return;
    setTransitioning(true);
    cancelAnimationFrame(rafRef.current);
    setTimeout(() => {
      setScreen(id);
      setT(0);
      startRef.current = performance.now();
      setTimeout(() => setTransitioning(false), 80);
    }, 400);
  }, [transitioning]);

  const choosePath = useCallback((p: "client" | "partner") => {
    setPath(p);
    goTo(p === "client" ? "c1" : "p1");
  }, [goTo]);

  const switchPath = useCallback((p: "client" | "partner") => {
    setPath(p);
    goTo(p === "client" ? "c1" : "p1");
  }, [goTo]);

  const nextId = NEXT_MAP[screen as ScreenId];
  const prevId = PREV_MAP[screen as ScreenId];

  const next = useCallback(() => { if (nextId) goTo(nextId); }, [goTo, nextId]);
  const prev = useCallback(() => { if (prevId) goTo(prevId); }, [goTo, prevId]);

  useImperativeHandle(ref, () => ({ next, prev }), [next, prev]);

  useEffect(() => {
    onNavStateChange?.({ canPrev: !!prevId, canNext: !!nextId });
  }, [prevId, nextId, onNavStateChange]);

  useEffect(() => {
    if (!isCinema || staticMode) return;
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      setT(elapsed);
      if (elapsed >= CINEMA_DUR) { next(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isCinema, next]);

  useEffect(() => {
    if (embedded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onClose, embedded]);

  // Controlled chapter index → jump to the mapped screen.
  useEffect(() => {
    if (chapterIndex == null) return;
    const target = CHAPTER_TO_SCREEN[chapterIndex];
    if (target && target !== screen) {
      setScreen(target);
      setT(0);
      startRef.current = performance.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterIndex]);

  // Report screen changes back as a chapter index when one is mapped.
  useEffect(() => {
    if (!onChapterChange) return;
    const idx = SCREEN_TO_CHAPTER[screen];
    if (idx != null) onChapterChange(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  const renderContent = () => {
    switch (screen) {
      case "cinema": return <CinemaScreen t={t} lines={c.cinema} />;
      case "s1": return <ScreenS1 c={c.s1} />;
      case "s2": return <ScreenS2 c={c.s2} />;
      case "path": return <PathSelect c={c.path} onChoose={choosePath} />;
      case "c1": return CLIENT_SCREENS.c1;
      case "c2": return CLIENT_SCREENS.c2;
      case "c3": return CLIENT_SCREENS.c3;
      case "c4": return CLIENT_SCREENS.c4;
      case "p1": return PARTNER_SCREENS.p1;
      case "p2": return PARTNER_SCREENS.p2;
      case "p3": return PARTNER_SCREENS.p3;
      case "p4": return PARTNER_SCREENS.p4;
      case "promo": return PARTNER_SCREENS.promo;
      case "final": return <FinalScreen c={c.final} onReplay={() => goTo("cinema")} />;
      default: return null;
    }
  };

  return (
    <div className={staticMode ? "ip-static" : ""} style={{ position: embedded ? "absolute" : "fixed", inset: 0, overflow: "hidden", background: "#050210", fontFamily: "'Montserrat', 'Inter', -apple-system, sans-serif", zIndex: embedded ? 1 : 1000 }}>
      <style>{`
        .ip-bg-vid { filter: saturate(0.22) brightness(0.28); }
        .ip-vignette { background: radial-gradient(ellipse 80% 80% at 52% 50%, transparent 28%, rgba(4,2,16,0.72) 100%), linear-gradient(to bottom, rgba(4,2,16,0.52) 0%, transparent 18%, transparent 70%, rgba(4,2,16,0.9) 100%); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .ip-static * { animation-duration: 0s !important; animation-delay: 0s !important; transition: none !important; }
        @media (max-width: 600px) {
          .ip-chapter-label, .ip-strip-divider { display: none !important; }
        }
      `}</style>

      {staticMode ? (
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, #0a0625 0%, #050210 60%, #020108 100%)" }} />
      ) : (
        <video src="/videos/city_night_panorama.mp4" className="ip-bg-vid" autoPlay muted loop playsInline
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      <div className="ip-vignette" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <TopBar screen={screen} path={path} />

      <div key={screen} style={{ opacity: transitioning ? 0 : 1, transition: "opacity 0.4s ease", position: "absolute", inset: 0 }}>
        {renderContent()}
      </div>

      {!staticMode && !(["cinema", "s1", "s2", "path"] as ScreenId[]).includes(screen) && <PathSwitcher screen={screen} path={path} onSwitch={switchPath} labels={c.pathSwitcher} />}
      {!staticMode && <PathProgress current={screen} path={path} />}
      {!staticMode && <NavArrows screen={screen} hasPrev={!!prevId} hasNext={!!nextId} onPrev={prev} onNext={next} />}

      {!staticMode && !embedded && <button
        onClick={onClose}
        title="Esc"
        style={{
          position: "absolute", top: 16, right: 16, zIndex: 70,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)", cursor: "pointer",
          color: "rgba(255,255,255,0.5)", fontSize: 18, lineHeight: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 0.2s ease, color 0.2s ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.14)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
      >
        ✕
      </button>}
    </div>
  );
}

const InteractivePresentation = forwardRef<InteractivePresentationHandle, InteractivePresentationProps>(InteractivePresentationInner);
InteractivePresentation.displayName = "InteractivePresentation";
export default InteractivePresentation;
