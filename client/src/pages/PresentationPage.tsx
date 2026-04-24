import React, { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";

interface TextOverlay {
  text: string;
  startTime: number;
  endTime: number;
}

interface SubBlock {
  title: string;
  image: string;
  content: string;
  accentColor?: string;
}

interface SceneConfig {
  id: string;
  label: string;
  part: "intro" | "presentation";
  texts: TextOverlay[];
  duration: number;
  overlayStyle?: string;
  heroImage?: string;
  subBlocks?: SubBlock[];
  cardTitle?: string;
  cardSubtitle?: string;
  cardImage?: string;
  available: boolean;
}

const scenes: SceneConfig[] = [
  {
    id: "s1", label: "Хаос", part: "intro",
    overlayStyle: "rgba(0,0,0,0.35)",
    heroImage: "/images/presentation/hero_chaos.png",
    texts: [
      { text: "Финансовый мир полон обещаний…", startTime: 1, endTime: 5.5 },
      { text: "которые никто не держит.", startTime: 3.5, endTime: 6.5 },
    ],
    duration: 7, available: true,
  },
  {
    id: "s2", label: "Мечта", part: "intro",
    overlayStyle: "rgba(0,0,0,0.3)",
    heroImage: "/images/presentation/hero_dream.png",
    texts: [
      { text: "Безопасность", startTime: 0.5, endTime: 2 },
      { text: "Гибкость", startTime: 2, endTime: 3.5 },
      { text: "Доходность", startTime: 3.5, endTime: 5 },
      { text: "И чтобы всё работало за тебя.", startTime: 5, endTime: 7 },
    ],
    duration: 7, available: true,
  },
  {
    id: "s3", label: "Реальность", part: "intro",
    overlayStyle: "rgba(40,0,0,0.3)",
    heroImage: "/images/presentation/hero_reality.png",
    texts: [
      { text: "Рынки растут.", startTime: 0.5, endTime: 2 },
      { text: "90% людей теряют.", startTime: 2, endTime: 4 },
      { text: "Те же схемы. Те же провалы.", startTime: 4, endTime: 6.5 },
    ],
    duration: 7, available: true,
  },
  {
    id: "s4", label: "Осознание", part: "intro",
    overlayStyle: "rgba(0,0,0,0.3)",
    heroImage: "/images/presentation/hero_realization.png",
    texts: [
      { text: "А что если есть другой путь?", startTime: 1, endTime: 3 },
      { text: "Не продукт. Не схема.", startTime: 3, endTime: 5 },
      { text: "А целая инфраструктура.", startTime: 5, endTime: 7 },
    ],
    duration: 7, available: true,
  },
  {
    id: "s5", label: "JetUP", part: "presentation",
    heroImage: "/images/presentation/hero_discovery.png",
    cardTitle: "JetUP",
    cardSubtitle: "Цифровая инфраструктура для трейдинга и партнёрства",
    cardImage: "/images/presentation/jetup_brand.png",
    texts: [], duration: 8, available: true,
  },
  {
    id: "s6", label: "Инструменты", part: "presentation",
    cardTitle: "Инструменты",
    cardSubtitle: "Не просто трейдинг. Умные инструменты.",
    texts: [], duration: 15,
    subBlocks: [
      { title: "Maria — AI-ассистент", image: "/images/presentation/maria_ai.png", accentColor: "#a78bfa", content: "Отвечает на вопросы 24/7. Текстовый чат + видео-звонок с аватаром. 3 языка: DE / RU / EN. Помогает разобраться новичку за 5 минут." },
      { title: "Платформа jet-up.ai", image: "/images/presentation/platform.png", accentColor: "#60a5fa", content: "Регистрация, верификация, выбор стратегии — всё в одном месте. Мобильная версия + Telegram Mini App." },
      { title: "AI-аналитика", image: "/images/presentation/ai_analytics.png", accentColor: "#34d399", content: "Автоматический анализ диалогов. Рекомендации по улучшению. Прозрачность: всё видно, всё понятно." },
      { title: "Автоматизация", image: "/images/presentation/automation.png", accentColor: "#fbbf24", content: "Copy-trading: опытные трейдеры торгуют за вас. Стратегии: NeoFX, Copy-X, Bit1. Подключил — работает." },
    ],
    available: true,
  },
  {
    id: "s7", label: "Три кита", part: "presentation",
    cardTitle: "Три кита",
    texts: [], duration: 12,
    subBlocks: [
      { title: "Безопасность", image: "/images/presentation/safety.png", accentColor: "#3b82f6", content: "Деньги на ВАШЕМ счёте Tag Markets. Только вы имеете доступ. Вывод в любой момент. Регулируемый брокер." },
      { title: "Гибкость", image: "/images/presentation/flexibility.png", accentColor: "#06b6d4", content: "Старт от $100 (клиент) или $250 (партнёр). Выбор и переключение стратегий. Полный контроль." },
      { title: "Рентабельность", image: "/images/presentation/profitability.png", accentColor: "#f59e0b", content: "2-5% в месяц. 70% прибыли — клиенту. Консервативный риск: 0,3% на сделку, макс. 10% просадка." },
    ],
    available: true,
  },
  {
    id: "s8", label: "Партнёрка", part: "presentation",
    cardTitle: "Партнёрская программа",
    cardSubtitle: "Система растёт. Ты растёшь вместе с ней.",
    cardImage: "/images/presentation/partner_network.png",
    texts: [], duration: 12,
    subBlocks: [
      { title: "Лот-комиссия", image: "/images/presentation/partner_network.png", accentColor: "#f59e0b", content: "$10.50 за каждый лот в команде. До 10 уровней глубины. Пассивный доход от активности команды." },
      { title: "Infinity Bonus", image: "/images/presentation/partner_network.png", accentColor: "#a78bfa", content: "1% от объёма €100K. 2% от €300K. 3% от €1M. Растёт с командой." },
      { title: "Global Pools", image: "/images/presentation/partner_network.png", accentColor: "#34d399", content: "2 пула по 1% от общего оборота. Выплаты каждые 2 недели. Для ТОП-партнёров." },
    ],
    available: true,
  },
  {
    id: "s9", label: "Масштаб", part: "intro",
    overlayStyle: "rgba(0,0,0,0.3)",
    heroImage: "/images/presentation/hero_scale.png",
    texts: [
      { text: "Это не проект.", startTime: 1, endTime: 3.5 },
      { text: "Это экосистема.", startTime: 3.5, endTime: 6.5 },
    ],
    duration: 7, available: true,
  },
  {
    id: "s10", label: "Финал", part: "intro",
    overlayStyle: "rgba(0,0,0,0.4)",
    heroImage: "/images/presentation/hero_scale.png",
    texts: [
      { text: "Вопрос не в том, работает ли система.", startTime: 1, endTime: 3 },
      { text: "Вопрос — ты внутри неё", startTime: 3, endTime: 5 },
      { text: "или наблюдаешь со стороны?", startTime: 5, endTime: 8 },
    ],
    duration: 10, available: true,
  },
];

function Timeline({ currentIndex, onSelect }: { currentIndex: number; onSelect: (i: number) => void }) {
  return (
    <div className="absolute top-0 left-0 right-0 z-40 px-3 pt-4 pb-2" data-testid="timeline">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        <div className="absolute top-[9px] left-0 right-0 h-[2px] bg-white/10" />
        <div
          className="absolute top-[9px] left-0 h-[2px] transition-all duration-700"
          style={{
            width: `${(currentIndex / Math.max(scenes.length - 1, 1)) * 100}%`,
            background: "linear-gradient(90deg, #FFD700, #FFA500)",
          }}
        />
        {scenes.map((scene, i) => {
          const isActive = i <= currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={scene.id}
              onClick={() => onSelect(i)}
              className="relative flex flex-col items-center z-10"
              style={{ cursor: "pointer" }}
              data-testid={`timeline-dot-${i}`}
            >
              <div
                className="w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center"
                style={{
                  borderColor: isActive ? "#FFD700" : "rgba(255,255,255,0.15)",
                  backgroundColor: isCurrent ? "#FFD700" : isActive ? "rgba(255,215,0,0.25)" : "transparent",
                  transform: isCurrent ? "scale(1.3)" : "scale(1)",
                  boxShadow: isCurrent ? "0 0 10px rgba(255,215,0,0.4)" : "none",
                }}
              >
                {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
              </div>
              <span
                className="mt-1.5 transition-all duration-300 whitespace-nowrap"
                style={{
                  color: isActive ? "#FFD700" : "rgba(255,255,255,0.25)",
                  fontSize: "9px",
                  fontWeight: isCurrent ? 600 : 400,
                }}
              >
                {scene.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Subtitles({ texts, currentTime }: { texts: TextOverlay[]; currentTime: number }) {
  const activeTexts = texts.filter((t) => currentTime >= t.startTime && currentTime <= t.endTime);
  if (activeTexts.length === 0) return null;
  return (
    <div className="absolute left-0 right-0 z-20 flex flex-col items-center gap-1 px-6" style={{ bottom: "10%" }} data-testid="subtitles">
      {activeTexts.map((t, i) => (
        <p
          key={`${t.text}-${i}`}
          className="text-center font-bold animate-subtitle-in"
          style={{
            color: "#FFD700",
            fontSize: "clamp(1.6rem, 5vw, 3.5rem)",
            lineHeight: 1.3,
            textShadow: "0 2px 8px rgba(0,0,0,0.95), 0 0 40px rgba(0,0,0,0.7), 0 0 80px rgba(0,0,0,0.4)",
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          }}
          data-testid={`subtitle-${i}`}
        >
          {t.text}
        </p>
      ))}
    </div>
  );
}

function PremiumCard({ scene, onNext }: { scene: SceneConfig; onNext: () => void }) {
  const [openBlock, setOpenBlock] = useState<number | null>(null);
  const hasBlocks = scene.subBlocks && scene.subBlocks.length > 0;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center px-4 py-16" data-testid="presentation-card">
      <div className="w-full max-w-xl animate-card-in overflow-y-auto max-h-[80vh] no-scrollbar" style={{ scrollbarWidth: "none" }}>
        <div
          className="rounded-3xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, rgba(10,10,30,0.9) 0%, rgba(20,15,40,0.9) 100%)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,215,0,0.1)",
            boxShadow: "0 0 80px rgba(0,0,0,0.6), 0 0 30px rgba(255,215,0,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {scene.cardImage && !hasBlocks && (
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={scene.cardImage}
                  alt={scene.cardTitle || ""}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover"
                  style={{
                    boxShadow: "0 0 30px rgba(255,215,0,0.15), 0 8px 32px rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,215,0,0.15)",
                  }}
                  data-testid="card-image"
                />
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.05), transparent)" }}
                />
              </div>
            </div>
          )}

          {scene.cardTitle && (
            <h2
              className="text-center font-bold mb-1"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
                letterSpacing: "0.02em",
                filter: "drop-shadow(0 0 12px rgba(255,215,0,0.2))",
              }}
              data-testid="card-title"
            >
              {scene.cardTitle}
            </h2>
          )}
          {scene.cardSubtitle && (
            <p className="text-center text-white/50 text-sm md:text-base mb-6 font-light tracking-wide" data-testid="card-subtitle">
              {scene.cardSubtitle}
            </p>
          )}

          {hasBlocks && (
            <div className="flex flex-col gap-3">
              {scene.subBlocks!.map((block, i) => {
                const isOpen = openBlock === i;
                return (
                  <div key={i} className="group">
                    <button
                      onClick={() => setOpenBlock(isOpen ? null : i)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-400 text-left"
                      style={{
                        background: isOpen
                          ? `linear-gradient(135deg, ${block.accentColor}15, ${block.accentColor}08)`
                          : "rgba(255,255,255,0.03)",
                        border: isOpen
                          ? `1px solid ${block.accentColor}40`
                          : "1px solid rgba(255,255,255,0.06)",
                        boxShadow: isOpen ? `0 0 20px ${block.accentColor}10` : "none",
                      }}
                      data-testid={`block-${i}`}
                    >
                      <img
                        src={block.image}
                        alt={block.title}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0 transition-all duration-400"
                        style={{
                          boxShadow: isOpen
                            ? `0 0 16px ${block.accentColor}30`
                            : "0 4px 12px rgba(0,0,0,0.3)",
                          border: `1px solid ${isOpen ? block.accentColor + "50" : "rgba(255,255,255,0.08)"}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className="font-semibold text-sm md:text-base block transition-colors duration-300"
                          style={{ color: isOpen ? block.accentColor : "#fff" }}
                        >
                          {block.title}
                        </span>
                        {!isOpen && (
                          <span className="text-white/30 text-xs">Нажмите для деталей</span>
                        )}
                      </div>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                        style={{
                          background: isOpen ? block.accentColor + "20" : "rgba(255,255,255,0.05)",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke={isOpen ? block.accentColor : "rgba(255,255,255,0.3)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                    {isOpen && (
                      <div
                        className="px-4 pt-3 pb-1 animate-block-expand"
                        data-testid={`block-content-${i}`}
                      >
                        <p className="text-white/60 text-sm leading-relaxed font-light pl-[4.5rem]">
                          {block.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!hasBlocks && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onNext}
                className="px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  color: "#000",
                  boxShadow: "0 0 20px rgba(255,215,0,0.2), 0 4px 16px rgba(0,0,0,0.3)",
                }}
                data-testid="button-next"
              >
                Далее →
              </button>
            </div>
          )}

          {hasBlocks && (
            <div className="flex justify-center mt-5">
              <button
                onClick={onNext}
                className="px-6 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                data-testid="button-next-scene"
              >
                Следующая сцена →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PresentationPage() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const scene = scenes[sceneIndex];

  const goTo = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= scenes.length || transitioning) return;
      setTransitioning(true);
      setTimeout(() => {
        setSceneIndex(idx);
        setCurrentTime(0);
        setFinished(false);
        startRef.current = performance.now();
        setTimeout(() => setTransitioning(false), 100);
      }, 600);
    },
    [transitioning]
  );

  const handleNext = useCallback(() => {
    if (sceneIndex < scenes.length - 1) {
      goTo(sceneIndex + 1);
    } else {
      setFinished(true);
    }
  }, [sceneIndex, goTo]);

  useEffect(() => {
    if (scene.part === "presentation") return;

    startRef.current = performance.now();
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setCurrentTime(t);
      if (t >= scene.duration) {
        handleNext();
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(timerRef.current);
  }, [scene.id, scene.duration, scene.part, handleNext]);

  const handleReplay = () => {
    setTransitioning(true);
    setTimeout(() => {
      setSceneIndex(0);
      setCurrentTime(0);
      setFinished(false);
      startRef.current = performance.now();
      setTimeout(() => setTransitioning(false), 100);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" data-testid="presentation-page">
      <style>{`
        @keyframes subtitleIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-subtitle-in { animation: subtitleIn 0.6s ease-out forwards; }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-card-in { animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes blockExpand {
          from { opacity: 0; max-height: 0; padding-top: 0; }
          to { opacity: 1; max-height: 200px; padding-top: 12px; }
        }
        .animate-block-expand { animation: blockExpand 0.35s ease-out forwards; overflow: hidden; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <video
        src="/videos/city_night_panorama.mp4"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "saturate(0.5) brightness(0.45)" }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        data-testid="bg-video"
      />

      {scene.heroImage && (
        <div
          className="absolute inset-0 transition-opacity duration-[800ms]"
          style={{ opacity: transitioning ? 0 : 1 }}
        >
          <img
            src={scene.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "saturate(0.7) brightness(0.75)" }}
            data-testid="hero-image"
          />
        </div>
      )}

      <div
        className="absolute inset-0 transition-all duration-[600ms] pointer-events-none"
        style={{ backgroundColor: scene.overlayStyle || "rgba(0,0,0,0.5)" }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 15%, transparent 70%, rgba(0,0,0,0.7) 100%)" }}
      />

      <div
        className="absolute inset-0 transition-opacity duration-[600ms]"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {scene.part === "intro" && <Subtitles texts={scene.texts} currentTime={currentTime} />}
        {scene.part === "presentation" && (
          <PremiumCard key={scene.id} scene={scene} onNext={handleNext} />
        )}
      </div>

      <Timeline currentIndex={sceneIndex} onSelect={goTo} />

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-5 left-3 z-50 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all"
        style={{
          background: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        data-testid="button-mute-toggle"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {finished && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center animate-card-in" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}>
          <img
            src="/images/presentation/jetup_brand.png"
            alt="JetUP"
            className="w-24 h-24 rounded-2xl mb-6"
            style={{ boxShadow: "0 0 40px rgba(255,215,0,0.2)" }}
          />
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 16px rgba(255,215,0,0.3))",
            }}
          >
            JetUP
          </h2>
          <p className="text-white/40 text-sm mb-8">Финансовая экосистема будущего</p>
          <div className="flex gap-4">
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
              data-testid="button-replay"
            >
              <RotateCcw size={14} />
              Сначала
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#000",
                boxShadow: "0 0 20px rgba(255,215,0,0.2)",
              }}
              data-testid="button-start"
            >
              Начать →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
