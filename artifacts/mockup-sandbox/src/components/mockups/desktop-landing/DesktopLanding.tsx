import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  Calendar,
  GraduationCap,
  Play,
  ArrowRight,
  MessageCircle,
  Video,
  ChevronRight,
  Send,
  Instagram,
  Youtube,
  Globe,
  ShieldCheck,
  Zap,
  BarChart2
} from "lucide-react";

const ACCENT = "#8b5cf6"; // Purple 500
const ACCENT_LIGHT = "#a78bfa"; // Purple 400
const ACCENT_DARK = "#6d28d9"; // Purple 600

function Particles({ count = 50 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf: number;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(animate);
    };

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

function Reveal({ children, delay = 0, y = 30 }: { children: React.ReactNode, delay?: number, y?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function DesktopLanding() {
  const [lang, setLang] = useState<"DE" | "RU" | "EN">("DE");
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  return (
    <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-4 bg-[#030014]/80 backdrop-blur-md border-b border-purple-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/jetup-logo.png" alt="JetUP" className="h-8 w-auto" />
          <span className="text-xs font-bold tracking-widest text-purple-400 uppercase">Hub</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#maria" className="hover:text-white transition-colors">Maria AI</a>
          <a href="#trading" className="hover:text-white transition-colors">Trading</a>
          <a href="#partner" className="hover:text-white transition-colors">Partner Program</a>
          <a href="#academy" className="hover:text-white transition-colors">Academy</a>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            {(["DE", "RU", "EN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${lang === l ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'text-gray-400 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button className="hidden md:flex bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors items-center gap-2">
            Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div style={{ y: yBg }} className="absolute inset-0">
            <img src="/__mockup/images/desktop-hero-bg.jpg" alt="Background" className="w-full h-full object-cover opacity-30 mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030014]/80 to-[#030014]" />
          </motion.div>
        </div>
        <Particles count={80} />
        
        <div className="relative z-10 max-w-5xl mx-auto px-8 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold mb-8 backdrop-blur-sm">
              <Zap size={16} className="text-purple-400" />
              <span>Das Smart Linktree der neuen Generation</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Struktur. Transparenz.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-600">
                Kontrolle.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Dein zentraler Hub für Copy-Trading, Signale und passives Einkommen. 
              Skaliere dein Business mit AI-gestützter Infrastruktur.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="h-14 px-8 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                Jetzt Starten <ArrowRight size={18} />
              </button>
              <button className="h-14 px-8 rounded-full bg-white/5 border border-white/10 font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
                <Play size={18} /> Video ansehen
              </button>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Scroll
          <ArrowRight size={16} className="rotate-90" />
        </div>
      </section>

      {/* Maria AI Section */}
      <section id="maria" className="relative py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -inset-10 bg-purple-500/20 blur-[100px] rounded-full" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#0a0520]">
                    <img src="/__mockup/images/maria-avatar.png" alt="Maria AI" className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0520] via-transparent to-transparent" />
                    
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-50" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">Maria ist Online</div>
                            <div className="text-xs text-gray-400">AI Video Assistent</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center hover:bg-purple-500 transition-colors">
                            <Video size={18} />
                          </button>
                          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                            <MessageCircle size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div>
                <div className="text-purple-400 font-bold tracking-widest text-sm uppercase mb-4">Dein Copilot</div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Triff Maria.<br />Deine AI-Partnerin.
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Vergiss manuelle Erklärungen. Maria übernimmt Onboarding, Präsentationen und FAQs. Sie spricht fließend Deutsch, Russisch und Englisch – 24/7 verfügbar.
                </p>
                <div className="space-y-4 mb-10">
                  {["Interaktive Video-Calls", "Automatisiertes Follow-up", "Personalisierte Partner-Einladungen"].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <ShieldCheck size={20} className="text-purple-400" />
                      </div>
                      <span className="text-lg font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <button className="h-12 px-6 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                  Chat starten <ChevronRight size={20} />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trading Hub */}
      <section id="trading" className="relative py-32 px-8 bg-black/40 border-y border-white/5 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
          <img src="/__mockup/images/desktop-trading-bg.jpg" alt="" className="w-full h-full object-cover mix-blend-screen mask-image-l" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black)' }} />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <Reveal>
            <div className="text-center mb-20">
              <div className="text-blue-400 font-bold tracking-widest text-sm uppercase mb-4">Trading Ecosystem</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Märkte erobern, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">automatisiert.</span></h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Vom Anfänger zum Profi: Nutze die Expertise von Top-Tradern und bewährte Algorithmen.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal delay={0.1}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Copy-X</h3>
                <p className="text-gray-400 mb-8">Kopiere die Strategien verifizierter Top-Trader 1:1 auf dein Konto. Volle Transparenz, keine versteckten Gebühren.</p>
                <button className="text-blue-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Erkunden <ArrowRight size={18} />
                </button>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/30 p-8 rounded-3xl backdrop-blur-sm hover:border-purple-500/60 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Premium</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                  <Globe size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">TAG Markets</h3>
                <p className="text-gray-300 mb-8">Unser exklusiver Broker-Partner. Spreads ab 0.0 Pips, blitzschnelle Ausführung und höchste Sicherheitsstandards.</p>
                <button className="text-purple-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Konto eröffnen <ArrowRight size={18} />
                </button>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 flex items-center justify-center mb-6 text-fuchsia-400 group-hover:scale-110 transition-transform">
                  <BarChart2 size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Trading Signale</h3>
                <p className="text-gray-400 mb-8">Erhalte präzise Setups unserer Analysten direkt auf dein Smartphone. Lerne durch professionelle Marktanalysen.</p>
                <button className="text-fuchsia-400 font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                  Zu den Signalen <ArrowRight size={18} />
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Partner Program */}
      <section id="partner" className="relative py-32 px-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-[80%] opacity-20 pointer-events-none">
          <img src="/__mockup/images/desktop-partner-bg.jpg" alt="" className="w-full h-full object-cover mix-blend-screen mask-image-r" style={{ WebkitMaskImage: 'linear-gradient(to left, transparent, black)' }} />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <Reveal>
              <div>
                <div className="text-emerald-400 font-bold tracking-widest text-sm uppercase mb-4">Business & Network</div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Baue dein Business.<br />Grenzenlos.
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Unser Multi-Level-Partnerprogramm belohnt nicht nur deine Leistung, sondern auch die deines Teams. Verdiene an Handelsvolumen, Abos und Profiten.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-emerald-900/20 border border-emerald-500/20 p-6 rounded-2xl">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">Bis zu 80%</div>
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Profit Share</div>
                  </div>
                  <div className="bg-emerald-900/20 border border-emerald-500/20 p-6 rounded-2xl">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">10 Ebenen</div>
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wide">Tiefen-Bonus</div>
                  </div>
                </div>
                
                <button className="h-12 px-8 rounded-full bg-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all">
                  Partner Werden
                </button>
              </div>
            </Reveal>
            
            <Reveal delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 blur-[80px] rounded-full" />
                <div className="relative bg-[#0a0520]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Users className="text-emerald-400" /> Leaderboard
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { rank: 1, name: "Alexander W.", vol: "$1.2M", team: 342, glow: "text-yellow-400" },
                      { rank: 2, name: "Michael K.", vol: "$850K", team: 189, glow: "text-gray-300" },
                      { rank: 3, name: "Sarah L.", vol: "$620K", team: 145, glow: "text-amber-600" },
                      { rank: 4, name: "David M.", vol: "$410K", team: 92, glow: "text-emerald-400" },
                    ].map((user, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold ${user.glow}`}>
                            {user.rank}
                          </div>
                          <div className="font-semibold">{user.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-emerald-400 font-bold">{user.vol}</div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">{user.team} Partner</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Grid of utility features */}
      <section className="py-20 px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <Reveal>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 h-full flex flex-col justify-between hover:bg-white/10 transition-colors group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-8 text-orange-400 group-hover:scale-110 transition-transform">
                  <Calendar size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Webinare & Calls</h3>
                <p className="text-gray-400 text-lg mb-8">Verpasse kein Event. Live-Trading, Marktanalysen und Partner-Trainings im übersichtlichen Kalender.</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="text-orange-400 font-bold text-sm mb-1">Heute, 19:00 Uhr</div>
                    <div className="font-semibold">Markt-Update & Ausblick</div>
                  </div>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-orange-400 transition-colors">
                    Teilnehmen
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-gray-500 font-bold text-sm mb-1">Morgen, 20:00 Uhr</div>
                    <div className="font-semibold">Partner Onboarding</div>
                  </div>
                  <button className="bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">
                    Erinnern
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10 h-full flex flex-col justify-between hover:bg-white/10 transition-colors group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-8 text-cyan-400 group-hover:scale-110 transition-transform">
                  <GraduationCap size={28} />
                </div>
                <h3 className="text-3xl font-bold mb-4">JetUP Academy</h3>
                <p className="text-gray-400 text-lg mb-8">Schritt-für-Schritt Anleitungen, Video-Tutorials und das gesamte Wissen für deinen Erfolg.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Trading Basics", count: "12 Videos", color: "bg-cyan-500/10" },
                  { title: "Broker Setup", count: "5 Videos", color: "bg-blue-500/10" },
                  { title: "Copy-Trading", count: "8 Videos", color: "bg-purple-500/10" },
                  { title: "Network Marketing", count: "15 Videos", color: "bg-emerald-500/10" }
                ].map((course, i) => (
                  <div key={i} className={`${course.color} rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-colors cursor-pointer`}>
                    <div className="font-bold mb-1">{course.title}</div>
                    <div className="text-xs text-gray-400">{course.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#030014] pt-20 pb-10 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
            <div className="flex items-center gap-4">
              <img src="/__mockup/images/jetup-logo.png" alt="JetUP" className="h-10 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
              <span className="text-2xl font-bold tracking-tighter">JetUP</span>
            </div>
            
            <div className="flex gap-4">
              <a href="#" className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all hover:scale-110">
                <Send size={24} />
              </a>
              <a href="#" className="w-14 h-14 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all hover:scale-110">
                <Instagram size={24} />
              </a>
              <a href="#" className="w-14 h-14 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all hover:scale-110">
                <Youtube size={24} />
              </a>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2024 JetUP Ecosystem. Alle Rechte vorbehalten.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Impressum</a>
              <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-white transition-colors">Risikohinweis</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DesktopLanding;
