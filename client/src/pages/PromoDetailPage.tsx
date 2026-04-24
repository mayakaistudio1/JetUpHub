import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ExternalLink, Zap, Clock, Loader2, ChevronDown } from "lucide-react";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareMenu, { SHARE_ORIGIN } from "@/components/ShareMenu";

export interface PromoItem {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  banner: string;
  highlights: string[];
  ctaText: string;
  ctaLink: string;
  deadline?: string | null;
  gradient: string;
  badgeColor: string;
}

const PromoDetailPage: React.FC = () => {
  const [, setLocation] = useAppNavigation();
  const { t, language } = useLanguage();
  const [promoItems, setPromoItems] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/promotions?language=${language}`)
      .then(r => r.json())
      .then(data => {
        setPromoItems(data);
        if (data.length > 0) setExpandedId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const toggleCard = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-promo"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          {t("promo.title")}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-purple-500" />
          </div>
        ) : (<div className="space-y-4 pt-2">
          {promoItems.map((promo, idx) => {
            const isExpanded = expandedId === promo.id;
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="w-full text-left cursor-pointer active:bg-gray-50 transition-colors"
                  onClick={() => toggleCard(promo.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCard(promo.id); } }}
                  aria-expanded={isExpanded}
                  aria-controls={`promo-content-${promo.id}`}
                  data-testid={`button-toggle-promo-${promo.id}`}
                >
                  <img
                    src={promo.banner}
                    alt={promo.title}
                    className="w-full h-auto object-cover"
                    data-testid={`img-promo-${promo.id}`}
                  />

                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${promo.badgeColor} text-white flex items-center gap-1`}>
                        <Zap size={8} />
                        {promo.badge}
                      </span>
                      <div className="ml-auto flex items-center gap-1">
                        <div onClick={(e) => e.stopPropagation()}>
                          <ShareMenu
                            title={promo.title}
                            shareBody={`🔥 JetUP\n\n${promo.title}\n\n${promo.subtitle}`}
                            shareUrl={`${SHARE_ORIGIN}/promo/${promo.id}`}
                            testId={`button-share-promo-${promo.id}`}
                          />
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
                        >
                          <ChevronDown size={14} className="text-gray-500" />
                        </motion.div>
                      </div>
                    </div>

                    <h3 id={`promo-title-${promo.id}`} className="text-[16px] font-extrabold text-gray-900 leading-tight" data-testid={`text-promo-title-${promo.id}`}>
                      {promo.title}
                    </h3>

                    {!isExpanded && promo.subtitle && (
                      <p className="text-[13px] text-gray-500 leading-relaxed font-medium mt-1.5 line-clamp-2">
                        {promo.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`promo-content-${promo.id}`}
                      role="region"
                      aria-labelledby={`promo-title-${promo.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                          {promo.subtitle}
                        </p>

                        {promo.highlights && promo.highlights.length > 0 && promo.highlights.some(h => h.trim()) && (
                          <p className="text-[12px] text-gray-600 font-medium leading-relaxed whitespace-pre-line">
                            {promo.highlights.join("\n")}
                          </p>
                        )}

                        {promo.deadline && (
                          <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2">
                            <Clock size={14} className="text-orange-500 flex-shrink-0" />
                            <p className="text-[11px] text-orange-700 font-semibold">
                              {promo.deadline}
                            </p>
                          </div>
                        )}

                        {promo.ctaLink && promo.ctaText && (
                          <a
                            href={promo.ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl jetup-gradient text-white text-[13px] font-bold active:scale-[0.97] transition-transform shadow-[0_2px_12px_rgba(124,58,237,0.3)]"
                            data-testid={`button-promo-cta-${promo.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                            {promo.ctaText}
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {promoItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[14px] text-gray-400 font-medium">{t("promo.noPromos")}</p>
            </div>
          )}
        </div>)}
      </div>
    </div>
  );
};

export default PromoDetailPage;
