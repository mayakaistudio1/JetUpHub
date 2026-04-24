import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Users,
  FolderOpen,
  Send,
  Instagram,
  Youtube,
  Video,
  MessageCircle,
  Calendar,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import PromoCard from "@/components/PromoCard";

const HomePage: React.FC = () => {
  const [, setLocation] = useAppNavigation();
  const { language, setLanguage, t } = useLanguage();
  const promoRef = useRef<HTMLDivElement>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const promoOpen = urlParams.get("promo") === "open";

  useEffect(() => {
    if (promoOpen && promoRef.current) {
      setTimeout(() => {
        promoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [promoOpen]);

  const goToMaria = () => setLocation("/maria");
  const goToTrading = () => setLocation("/trading");
  const goToPartner = () => setLocation("/partner");
  const goToSchedule = () => setLocation("/schedule");
  const goToTutorials = () => setLocation("/tutorials");

  const directLinks = [
    {
      icon: FolderOpen,
      label: t("home.presentations"),
      subtitle: t("home.presentationsSubtitle"),
      href: "https://drive.google.com/drive/folders/156BMU0t-hniBTd13rQ_wofvV81ETE04R?usp=sharing",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: FolderOpen,
      label: t("home.instructions"),
      subtitle: t("home.instructionsSubtitle"),
      href: "https://drive.google.com/drive/u/3/folders/1rBkMYhyJpY-8V0yPFm4wP20faPSyAWWM",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const socialLinks = [
    {
      icon: Send,
      label: "Telegram",
      href: "https://t.me/jet_up_official",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/jetup.official?igsh=MjZwdXJpd2JsYmw1&utm_source=qr",
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      icon: Youtube,
      label: "YouTube",
      href: "https://www.youtube.com/@JetUP_official",
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="px-5 pt-3 pb-6 space-y-3 min-h-full">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="relative inline-flex items-center">
              <img
                src="/jetup-logo.png"
                alt="JetUP"
                className="w-12 h-12 object-contain mb-1"
                data-testid="img-logo"
              />
              <span className="absolute -top-1 -right-8 bg-purple-500 text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full tracking-wider" data-testid="badge-beta">
                beta
              </span>
            </div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gradient-purple mt-0.5">
              {t("home.tagline")}
            </p>
            <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed max-w-[320px] font-bold">{t("home.subtitle")}</p>
            <div className="flex items-center gap-1 mt-2" data-testid="language-switcher">
              {(["de", "ru", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  data-testid={`btn-lang-${lang}`}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase transition-all ${
                    language === lang
                      ? "jetup-gradient text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <button
              onClick={goToMaria}
              className="w-full bg-white rounded-2xl px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.06)] flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
              data-testid="cta-ask-maria"
            >
              <div className="relative flex-shrink-0">
                <img
                  src="/maria-avatar.png"
                  alt="Maria"
                  className="w-11 h-11 rounded-full object-cover shadow-[0_4px_16px_rgba(124,58,237,0.3)]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-gray-900">{t("home.mariaOnline")}</h3>
                  <div className="flex items-center gap-1 bg-green-50 rounded-full px-1.5 py-0.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-green-600">{t("home.online")}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-gray-50 rounded-md px-2 py-0.5">
                    <Video size={10} className="text-purple-500" /> {t("home.video")}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-gray-50 rounded-md px-2 py-0.5">
                    <MessageCircle size={10} className="text-purple-500" /> {t("home.chat")}
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full jetup-gradient flex items-center justify-center flex-shrink-0 shadow-[0_2px_12px_rgba(124,58,237,0.3)]">
                <ArrowRight size={14} className="text-white" />
              </div>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2.5"
          >
            <button
              onClick={goToTrading}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-[#7C3AED] to-[#A855F7] card-glow-strong"
              data-testid="card-trading-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-white leading-tight">
                    {t("home.trading")}
                  </h3>
                  <p className="text-[11px] font-normal text-white/70 mt-1 leading-snug">{t("home.tradingSubtitle")}</p>
                </div>
                <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
              </div>
            </button>

            <button
              onClick={goToPartner}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_24px_rgba(16,185,129,0.2)]"
              data-testid="card-partner-hub"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Users size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-white leading-tight">
                    {t("home.partner")}
                  </h3>
                  <p className="text-[11px] font-normal text-white/70 mt-1 leading-snug">{t("home.partnerSubtitle")}</p>
                </div>
                <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
              </div>
            </button>
          </motion.div>

          <div ref={promoRef} id="promo">
            <PromoCard autoExpand={promoOpen} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2.5"
          >
            <button
              onClick={() => setLocation("/promo")}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="button-aktionen"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Megaphone size={18} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 leading-tight">{t("home.promo")}</p>
                <p className="text-[11px] font-normal text-gray-500 mt-1 leading-snug">{t("home.promoSubtitle")}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={goToSchedule}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-schedule"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={18} className="text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 leading-tight">{t("home.scheduleNext")}</p>
                <p className="text-[11px] font-normal text-gray-500 mt-1 leading-snug">{t("home.scheduleSubtitle")}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>

            <button
              onClick={goToTutorials}
              className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
              data-testid="card-tutorials"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                <Video size={18} className="text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] font-bold text-gray-900">{t("home.tutorials")}</span>
                <p className="text-[11px] font-normal text-gray-500 mt-1 leading-snug">{t("home.tutorialsSubtitle")}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="space-y-2">
              {directLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
                  data-testid={`direct-link-${i}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${link.bg} flex items-center justify-center flex-shrink-0`}>
                    <link.icon size={19} className={link.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800 leading-tight">{link.label}</p>
                    <p className="text-[11px] font-normal text-gray-500 mt-1 leading-snug">{link.subtitle}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
                </a>
              ))}

              <div className="bg-white rounded-xl px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]" data-testid="social-subscribe-card">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {t("home.subscribe")}
                </p>
                <div className="flex items-center gap-3">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex flex-col items-center gap-1.5 active:scale-[0.95] transition-transform"
                      data-testid={`social-link-${s.label.toLowerCase()}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                        <s.icon size={22} className={s.color} />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
