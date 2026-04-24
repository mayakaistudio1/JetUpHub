import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ArrowRight, PlayCircle, Zap, Shield, ChevronDown } from "lucide-react";

export function HeroEntry() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [lang, setLang] = useState<"DE" | "RU" | "EN">("RU");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const content = {
    RU: {
      headline: "JetUP адаптируется под тебя",
      subheadline: "Struktur. Transparenz. Kontrolle.",
      description: "Добро пожаловать в новую финансовую экосистему. Выберите путь, который лучше всего соответствует вашим целям.",
      cards: [
        {
          id: 1,
          title: "Смотреть презентацию",
          subtitle: "Погружение в экосистему",
          description: "Идеально для новых пользователей. Узнайте, как мы объединяем копитрейдинг и мощный партнерский доход.",
          cta: "Начать просмотр"
        },
        {
          id: 2,
          title: "Быстрый доступ",
          subtitle: "Основные ссылки",
          description: "Прямой переход к ключевым ресурсам: торговым сигналам, инструкциям и инструментам партнера.",
          cta: "Открыть ссылки"
        },
        {
          id: 3,
          title: "Войти в систему",
          subtitle: "Для партнеров",
          description: "Полный контроль над вашей структурой, аналитика и управление финансами в реальном времени.",
          cta: "Авторизоваться"
        }
      ]
    },
    EN: {
      headline: "JetUP adapts to you",
      subheadline: "Structure. Transparency. Control.",
      description: "Welcome to a new financial ecosystem. Choose the path that best aligns with your goals.",
      cards: [
        {
          id: 1,
          title: "Watch Presentation",
          subtitle: "Ecosystem deep dive",
          description: "Perfect for newcomers. Discover how we combine copy-trading with powerful partner income.",
          cta: "Start watching"
        },
        {
          id: 2,
          title: "Quick Access",
          subtitle: "Essential links",
          description: "Direct access to key resources: trading signals, guides, and partner tools.",
          cta: "Open links"
        },
        {
          id: 3,
          title: "Enter the System",
          subtitle: "For partners",
          description: "Full control over your structure, real-time analytics, and financial management.",
          cta: "Log in"
        }
      ]
    },
    DE: {
      headline: "JetUP passt sich dir an",
      subheadline: "Struktur. Transparenz. Kontrolle.",
      description: "Willkommen in einem neuen Finanzökosystem. Wähle den Weg, der am besten zu deinen Zielen passt.",
      cards: [
        {
          id: 1,
          title: "Präsentation ansehen",
          subtitle: "Eintauchen ins Ökosystem",
          description: "Perfekt für Neueinsteiger. Entdecken Sie, wie wir Copy-Trading mit starkem Partnereinkommen kombinieren.",
          cta: "Jetzt ansehen"
        },
        {
          id: 2,
          title: "Schneller Zugriff",
          subtitle: "Wichtige Links",
          description: "Direkter Zugang zu wichtigen Ressourcen: Handelssignale, Anleitungen und Partner-Tools.",
          cta: "Links öffnen"
        },
        {
          id: 3,
          title: "Ins System einloggen",
          subtitle: "Für Partner",
          description: "Volle Kontrolle über Ihre Struktur, Echtzeit-Analysen und Finanzmanagement.",
          cta: "Einloggen"
        }
      ]
    }
  };

  const currentContent = content[lang];

  const cardsData = [
    {
      id: 1,
      icon: PlayCircle,
      image: "/__mockup/images/jetup-hero-presentation.png",
      gradient: "from-[#8a6d46]/40",
      accent: "#c4a47c"
    },
    {
      id: 2,
      icon: Zap,
      image: "/__mockup/images/jetup-hero-quickaccess.png",
      gradient: "from-[#4a4640]/50",
      accent: "#e0d9d0"
    },
    {
      id: 3,
      icon: Shield,
      image: "/__mockup/images/jetup-hero-system.png",
      gradient: "from-[#2a2826]/80",
      accent: "#a39b8e"
    }
  ];

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0ebe1] font-sans overflow-hidden relative selection:bg-[#c4a47c]/30 selection:text-white">
      {/* Dynamic Background Noise & Gradients */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.15] transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(196, 164, 124, 0.15), transparent 100%)`
        }}
      />
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#c4a47c]/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#8a6d46]/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-8 md:px-12 max-w-[1600px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/__mockup/images/jetup-logo.png" alt="JetUP" className="h-7 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex items-center"
        >
          <div className="group relative flex items-center gap-1.5 cursor-pointer text-sm font-medium text-[#a39b8e] hover:text-[#f0ebe1] transition-colors py-2 px-3 rounded-md hover:bg-white/5">
            <Globe className="w-4 h-4" />
            <span>{lang}</span>
            <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-transform duration-300 group-hover:rotate-180" />
            
            {/* Language Dropdown */}
            <div className="absolute top-full right-0 mt-2 w-32 rounded-xl border border-white/10 bg-[#121110]/95 backdrop-blur-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden">
              {(['EN', 'DE', 'RU'] as const).map((l) => (
                <div 
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-5 py-3 text-sm hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between
                    ${lang === l ? 'text-[#c4a47c] bg-white/[0.02]' : 'text-[#a39b8e]'}`}
                >
                  {l}
                  {lang === l && <div className="w-1.5 h-1.5 rounded-full bg-[#c4a47c]" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 pb-24">
        <div className="max-w-[1400px] w-full mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-center mb-16 md:mb-24 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-[#c4a47c] mb-8 tracking-[0.2em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c4a47c] animate-pulse shadow-[0_0_10px_rgba(196,164,124,0.5)]" />
              {currentContent.subheadline}
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="block"
                >
                  {currentContent.headline}
                </motion.span>
              </AnimatePresence>
            </h1>
            
            <p className="text-[#a39b8e] text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              <AnimatePresence mode="wait">
                <motion.span
                  key={lang}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="block"
                >
                  {currentContent.description}
                </motion.span>
              </AnimatePresence>
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            {currentContent.cards.map((card, index) => {
              const visual = cardsData.find(c => c.id === card.id)!;
              const isHovered = hoveredCard === card.id;
              
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 + index * 0.1 }}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative h-[450px] md:h-[520px] rounded-3xl overflow-hidden cursor-pointer isolate flex flex-col justify-end p-8 md:p-10 border border-white/[0.08] hover:border-white/20 transition-colors duration-700 bg-[#121110]"
                >
                  {/* Background Image & Overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-40 group-hover:opacity-60 mix-blend-luminosity"
                    style={{ backgroundImage: `url(${visual.image})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${visual.gradient} to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 transform transition-transform duration-700 ease-[0.16,1,0.3,1] group-hover:-translate-y-4">
                    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-700 ease-out shadow-2xl">
                      <visual.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    
                    <div 
                      className="text-xs font-semibold tracking-[0.2em] uppercase mb-4 transition-colors duration-500"
                      style={{ color: isHovered ? visual.accent : 'rgba(163, 155, 142, 0.8)' }}
                    >
                      {card.subtitle}
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-light text-white mb-5 tracking-tight">
                      {card.title}
                    </h3>
                    
                    <p className="text-[#a39b8e] text-base leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity duration-700 line-clamp-3 font-light">
                      {card.description}
                    </p>

                    <div className="flex items-center gap-3 text-sm font-medium text-white/60 group-hover:text-white transition-colors duration-500">
                      <span className="tracking-wide relative overflow-hidden">
                        {card.cta}
                        <span 
                          className="absolute bottom-0 left-0 w-full h-[1px] transform origin-left transition-transform duration-500 ease-out"
                          style={{ 
                            backgroundColor: visual.accent,
                            scaleX: isHovered ? 1 : 0 
                          }}
                        />
                      </span>
                      <ArrowRight 
                        className="w-4 h-4 transform transition-all duration-500 ease-out" 
                        style={{ 
                          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                          color: isHovered ? visual.accent : 'currentColor'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Subtle Glow on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-1000 ease-out"
                    style={{
                      background: `radial-gradient(circle at 50% 120%, ${visual.accent}15 0%, transparent 60%)`
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

        </div>
      </main>
    </div>
  );
}
