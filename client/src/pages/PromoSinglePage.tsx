import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Zap, Clock, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareMenu, { SHARE_ORIGIN } from "@/components/ShareMenu";

interface PromoItem {
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

export default function PromoSinglePage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/promo/:id");
  const { t } = useLanguage();
  const [promo, setPromo] = useState<PromoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/promotions/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setPromo(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!promo) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500 text-[14px]">Promotion not found</p>
        <button onClick={() => setLocation("/promo")} className="text-purple-600 font-medium text-[13px]">
          ← Back to Promotions
        </button>
      </div>
    );
  }

  const shareUrl = `${SHARE_ORIGIN}/promo/${promo.id}`;
  const shareBody = `🔥 JetUP\n\n${promo.title}\n\n${promo.subtitle}`;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/promo")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-promo-single"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight truncate">
          {promo.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] mt-2"
        >
          <img
            src={promo.banner}
            alt={promo.title}
            className="w-full h-auto object-cover"
            data-testid={`img-promo-single-${promo.id}`}
          />

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${promo.badgeColor} text-white flex items-center gap-1`}>
                <Zap size={8} />
                {promo.badge}
              </span>
              <div className="ml-auto">
                <ShareMenu
                  shareBody={shareBody}
                  shareUrl={shareUrl}
                  title={promo.title}
                  testId={`button-share-promo-single-${promo.id}`}
                />
              </div>
            </div>

            <h3 className="text-[16px] font-extrabold text-gray-900 leading-tight" data-testid={`text-promo-title-${promo.id}`}>
              {promo.title}
            </h3>

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
              >
                <ExternalLink size={14} />
                {promo.ctaText}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
