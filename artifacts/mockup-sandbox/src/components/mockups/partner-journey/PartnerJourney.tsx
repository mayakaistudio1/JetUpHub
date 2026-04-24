import { useState, useEffect, useRef } from "react";

const SCENES = [
  {
    id: 1,
    chapter: "ГЛАВА I",
    phase: "СОМНЕНИЕ",
    accent: "#ef4444",
    glow: "rgba(239,68,68,0.15)",
    orb: "rgba(239,68,68,0.08)",
    headline: "«Это не для меня»",
    subline: "Максим. 34 года. Финансовый аналитик.",
    quote: "Сетевой маркетинг? Пирамида? Я слышал это раньше. Лучше останусь там, где стабильно.",
    stats: [
      { label: "Свободного времени", value: "0 ч/нед" },
      { label: "Пассивного дохода", value: "$0" },
      { label: "Контроль над жизнью", value: "Минимальный" },
    ],
    symbol: "?",
    symbolSize: "18rem",
    bg: ["#0a0008", "#1a0010", "#0d000a"],
  },
  {
    id: 2,
    chapter: "ГЛАВА II",
    phase: "ПЕРВЫЙ КОНТАКТ",
    accent: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
    orb: "rgba(59,130,246,0.08)",
    headline: "«Подожди. Это другое.»",
    subline: "Вебинар JetUP. TAG Markets. Стратегия Sonic.",
    quote: "Myfxbook не врёт. 80% прибыльных месяцев. Регулируемый брокер. AI-ассистент. Это не просто слова.",
    stats: [
      { label: "Стратегия Sonic", value: "80%+ мес." },
      { label: "Регуляция", value: "LFSA" },
      { label: "Прозрачность", value: "Myfxbook" },
    ],
    symbol: "◎",
    symbolSize: "14rem",
    bg: ["#00080a", "#001525", "#000d1a"],
  },
  {
    id: 3,
    chapter: "ГЛАВА III",
    phase: "РЕШЕНИЕ",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    orb: "rgba(245,158,11,0.08)",
    headline: "«Я войду»",
    subline: "Dennis Fast Start Promo. Вход без барьеров.",
    quote: "100 USD депозит. +100 USD бонус. Итого — 4 800 USD на счёте MT5. Риск понятен. Логика прозрачна. Я начинаю.",
    stats: [
      { label: "Депозит", value: "$100" },
      { label: "Бонус", value: "+$100" },
      { label: "Аккаунт MT5", value: "$4 800" },
    ],
    symbol: "→",
    symbolSize: "16rem",
    bg: ["#0a0700", "#1a1000", "#0d0900"],
  },
  {
    id: 4,
    chapter: "ГЛАВА IV",
    phase: "ПЕРВЫЙ ДОХОД",
    accent: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    orb: "rgba(34,197,94,0.08)",
    headline: "«Деньги пришли.»",
    subline: "Lot Commissions. Profit Share. Месяц 1–3.",
    quote: "Я пригласил троих. Они активны. Пошли сделки — и я вижу комиссии. Доход не закончился. Он продолжается.",
    stats: [
      { label: "Lot Commissions", value: "С каждой сделки" },
      { label: "Profit Share", value: "Доля от прибыли" },
      { label: "Характер дохода", value: "Residual" },
    ],
    symbol: "↑",
    symbolSize: "16rem",
    bg: ["#000a02", "#001505", "#000d03"],
  },
  {
    id: 5,
    chapter: "ГЛАВА V",
    phase: "РОСТ СТРУКТУРЫ",
    accent: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    orb: "rgba(168,85,247,0.08)",
    headline: "«Система ожила.»",
    subline: "3 ветки. Infinity Bonus. AI работает за меня.",
    quote: "Я больше не работаю только сам. Структура дублирует действия. Доход идёт глубже меня. Это уже другое ощущение.",
    stats: [
      { label: "Infinity Bonus", value: "Глубина без лимита" },
      { label: "AI-аватар", value: "Вебинары за меня" },
      { label: "Тип дохода", value: "Organizational" },
    ],
    symbol: "⬡",
    symbolSize: "14rem",
    bg: ["#05000a", "#0d0018", "#07000f"],
  },
  {
    id: 6,
    chapter: "ГЛАВА VI",
    phase: "ПРОЦВЕТАНИЕ",
    accent: "#eab308",
    glow: "rgba(234,179,8,0.2)",
    orb: "rgba(234,179,8,0.1)",
    headline: "«Система работает на меня.»",
    subline: "Global Pool. Incentives. Финансовая свобода.",
    quote: "Я создал остаточный доход. Global Pool. Путешествия от компании. Теперь система живёт своей жизнью.",
    stats: [
      { label: "Global Pool", value: "Оборот компании" },
      { label: "Incentives", value: "Путешествия + бонусы" },
      { label: "Статус", value: "Финансовая свобода" },
    ],
    symbol: "✦",
    symbolSize: "14rem",
    bg: ["#0a0800", "#1a1200", "#0d0a00"],
  },
];

function Particles({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `float-${i % 3} ${4 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  );
}

function GlowOrb({
  accent,
  glow,
  symbol,
  symbolSize,
}: {
  accent: string;
  glow: string;
  symbol: string;
  symbolSize: string;
}) {
  return (
    <div className="relative flex items-center justify-center" style={{ height: "200px" }}>
      <div
        className="absolute rounded-full"
        style={{
          width: "320px",
          height: "320px",
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          animation: "pulse-glow 3s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: "180px",
          height: "180px",
          background: `radial-gradient(circle, ${glow} 0%, transparent 60%)`,
          animation: "pulse-glow 2s ease-in-out infinite reverse",
        }}
      />
      <div
        style={{
          fontSize: symbolSize,
          color: accent,
          opacity: 0.12,
          position: "absolute",
          fontWeight: 900,
          lineHeight: 1,
          userSelect: "none",
          filter: `drop-shadow(0 0 40px ${accent})`,
          animation: "symbol-breathe 4s ease-in-out infinite",
        }}
      >
        {symbol}
      </div>
    </div>
  );
}

export function PartnerJourney() {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scene = SCENES[current];

  const navigate = (next: number) => {
    if (phase === "out") return;
    setPhase("out");
    setTimeout(() => {
      setCurrent(next);
      setProgress(0);
      setPhase("in");
    }, 600);
  };

  const handleNext = () => {
    if (current < SCENES.length - 1) navigate(current + 1);
    else navigate(0);
  };
  const handlePrev = () => {
    if (current > 0) navigate(current - 1);
  };

  useEffect(() => {
    if (!autoPlay) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          handleNext();
          return 0;
        }
        return p + 1;
      });
    }, 60);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, current]);

  const isIn = phase === "in";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.7; }
        }
        @keyframes symbol-breathe {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(3deg); }
        }
        @keyframes float-0 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-15px) translateX(10px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(-8px); }
          66% { transform: translateY(-20px) translateX(5px); }
        }
        @keyframes scan-line {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes noise {
          0% { background-position: 0 0; }
          10% { background-position: -5% -10%; }
          20% { background-position: -15% 5%; }
          30% { background-position: 7% -25%; }
          40% { background-position: 20% 25%; }
          50% { background-position: -25% 10%; }
          60% { background-position: 15% 5%; }
          70% { background-position: 0 15%; }
          80% { background-position: 25% 35%; }
          90% { background-position: -10% 10%; }
          100% { background-position: 0 0; }
        }
        @keyframes stat-in {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes quote-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes headline-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          fontFamily: "'Inter', sans-serif",
          background: `radial-gradient(ellipse at 30% 20%, ${scene.bg[1]} 0%, ${scene.bg[0]} 50%, ${scene.bg[2]} 100%)`,
          position: "relative",
          overflow: "hidden",
          transition: "background 0.8s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Film grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            animation: "noise 0.5s steps(2) infinite",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${scene.accent}22, transparent)`,
            animation: "scan-line 8s linear infinite",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Particles */}
        <Particles color={scene.accent} />

        {/* Progress bar top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "rgba(255,255,255,0.05)", zIndex: 10 }}>
          <div
            style={{
              height: "100%",
              width: `${((current) / (SCENES.length - 1)) * 100}%`,
              background: `linear-gradient(90deg, ${scene.accent}88, ${scene.accent})`,
              transition: "width 0.6s ease, background 0.6s ease",
              boxShadow: `0 0 8px ${scene.accent}`,
            }}
          />
          {autoPlay && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${(current / (SCENES.length - 1)) * 100}%`,
                width: `${(1 / (SCENES.length - 1)) * progress}%`,
                height: "100%",
                background: scene.accent,
                opacity: 0.5,
              }}
            />
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            position: "relative",
            zIndex: 5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "36px 28px 24px",
            opacity: isIn ? 1 : 0,
            transform: isIn ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Chapter + scene dots */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <div style={{ color: scene.accent, fontSize: "10px", letterSpacing: "0.25em", fontWeight: 700, opacity: 0.9 }}>
                {scene.chapter}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", letterSpacing: "0.2em", marginTop: "2px" }}>
                {scene.phase}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              {SCENES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => navigate(i)}
                  style={{
                    width: i === current ? "24px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background: i === current ? scene.accent : "rgba(255,255,255,0.2)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: i === current ? `0 0 8px ${scene.accent}` : "none",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Glow orb visual */}
          <GlowOrb accent={scene.accent} glow={scene.glow} symbol={scene.symbol} symbolSize={scene.symbolSize} />

          {/* Headline */}
          <div style={{ marginTop: "8px" }}>
            <h1
              style={{
                fontSize: "2.2rem",
                fontWeight: 900,
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                animation: isIn ? "headline-in 0.7s ease forwards" : "none",
                marginBottom: "6px",
              }}
            >
              {scene.headline}
            </h1>
            <p
              style={{
                color: scene.accent,
                fontSize: "12px",
                fontWeight: 500,
                letterSpacing: "0.05em",
                opacity: 0.85,
                animation: isIn ? "headline-in 0.7s 0.1s ease both" : "none",
              }}
            >
              {scene.subline}
            </p>
          </div>

          {/* Divider */}
          <div
            style={{
              margin: "20px 0",
              height: "1px",
              background: `linear-gradient(90deg, ${scene.accent}60, transparent)`,
            }}
          />

          {/* Quote */}
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
              lineHeight: 1.7,
              fontStyle: "italic",
              fontWeight: 300,
              animation: isIn ? "quote-in 0.8s 0.2s ease both" : "none",
              borderLeft: `2px solid ${scene.accent}60`,
              paddingLeft: "14px",
            }}
          >
            {scene.quote}
          </p>

          {/* Stats */}
          <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {scene.stats.map((stat, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: `linear-gradient(135deg, ${scene.orb}, rgba(255,255,255,0.02))`,
                  border: `1px solid ${scene.accent}20`,
                  animation: isIn ? `stat-in 0.5s ${0.3 + i * 0.1}s ease both` : "none",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: 500 }}>
                  {stat.label}
                </span>
                <span
                  style={{
                    color: scene.accent,
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Controls */}
          <div style={{ marginTop: "28px", display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={handlePrev}
              disabled={phase === "out"}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
            >
              ←
            </button>

            <button
              onClick={() => { setAutoPlay((a) => !a); setProgress(0); }}
              style={{
                padding: "14px 20px",
                borderRadius: "12px",
                background: autoPlay ? `${scene.accent}22` : scene.accent,
                border: `1px solid ${scene.accent}`,
                color: autoPlay ? scene.accent : "#000",
                fontSize: "12px",
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.05em",
                transition: "all 0.3s ease",
                boxShadow: autoPlay ? "none" : `0 0 20px ${scene.accent}44`,
              }}
            >
              {autoPlay ? "ПАУЗА" : "▶ СТАРТ"}
            </button>

            <button
              onClick={handleNext}
              disabled={phase === "out"}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "12px",
                background: `${scene.accent}15`,
                border: `1px solid ${scene.accent}30`,
                color: scene.accent,
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
                boxShadow: `0 0 12px ${scene.accent}22`,
              }}
            >
              →
            </button>
          </div>

          {/* Scene counter */}
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px", letterSpacing: "0.2em" }}>
              {String(current + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
