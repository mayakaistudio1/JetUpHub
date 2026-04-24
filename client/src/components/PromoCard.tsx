import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Check, Loader2, ChevronDown, ChevronUp, ChevronRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DennisPromo {
  id: number;
  title: string;
  shortDesc: string;
  description: string;
  rules: string[];
  isActive: boolean;
  language: string;
}

interface PromoCardProps {
  autoExpand?: boolean;
}

const PromoCard: React.FC<PromoCardProps> = ({ autoExpand = false }) => {
  const { t, language } = useLanguage();
  const [promos, setPromos] = useState<DennisPromo[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rulesOpenId, setRulesOpenId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<number, { name: string; email: string; cuNumber: string }>>({});
  const [loading, setLoading] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/dennis-promos?language=${language}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromos(data);
          if (autoExpand && data[0]) {
            setExpandedId(data[0].id);
          }
        } else {
          setPromos([]);
        }
      })
      .catch(() => {});
  }, [language, autoExpand]);

  const getFormData = (id: number) => formData[id] || { name: "", email: "", cuNumber: "" };
  const updateFormData = (id: number, field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: { ...getFormData(id), [field]: value } }));
  };

  const isCuValid = (value: string) => {
    if (!value) return true;
    return value.toUpperCase().startsWith("CU");
  };

  const handleSubmit = async (e: React.FormEvent, promoId: number) => {
    e.preventDefault();
    setError("");
    const data = getFormData(promoId);
    if (!isCuValid(data.cuNumber)) {
      setError(t("dp.cuError"));
      return;
    }
    setLoading(promoId);
    try {
      const res = await fetch("/api/partner/promo-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, promoId }),
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Error");
      }
      setSuccessId(promoId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  if (promos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5" data-testid="promo-cards-container">
      {promos.map((promo) => {
        if (successId === promo.id) {
          return (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl px-4 py-3 bg-gradient-to-br from-emerald-600 to-teal-500 shadow-[0_4px_24px_rgba(16,185,129,0.25)]"
              data-testid={`promo-success-card-${promo.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Check size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-white leading-tight" data-testid="text-promo-success-title">
                    {t("dp.successTitle")}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-0.5 leading-relaxed" data-testid="text-promo-success-text">
                    {t("dp.successText")}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        }

        const isExpanded = expandedId === promo.id;
        const isRulesOpen = rulesOpenId === promo.id;
        const fd = getFormData(promo.id);

        return (
          <div key={promo.id} data-testid={`promo-card-${promo.id}`}>
            <button
              onClick={() => setExpandedId(isExpanded ? null : promo.id)}
              className="w-full rounded-2xl px-4 py-3 text-left active:scale-[0.98] transition-transform bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 shadow-[0_4px_24px_rgba(245,158,11,0.25)]"
              data-testid={`btn-promo-cta-${promo.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Gift size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-white leading-tight" data-testid={`text-promo-title-${promo.id}`}>
                    {promo.title}
                  </h3>
                  <p className="text-[11px] text-white/80 mt-0.5" data-testid={`text-promo-subtitle-${promo.id}`}>
                    {promo.shortDesc}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronRight size={18} className="text-white/80" />
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-2xl bg-white px-4 py-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
                    <p className="text-[12px] text-gray-600 leading-relaxed mb-3" data-testid={`text-promo-full-desc-${promo.id}`}>
                      {promo.description}
                    </p>

                    {promo.rules.length > 0 && (
                      <>
                        <button
                          onClick={() => setRulesOpenId(isRulesOpen ? null : promo.id)}
                          className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold mb-3 active:opacity-70"
                          data-testid={`btn-toggle-rules-${promo.id}`}
                        >
                          <AlertCircle size={12} />
                          {t("dp.rulesTitle")}
                          {isRulesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        <AnimatePresence>
                          {isRulesOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mb-3"
                            >
                              <div className="bg-orange-50 rounded-xl px-3 py-2.5 space-y-1.5">
                                {promo.rules.map((rule, i) => (
                                  <p key={i} className="text-[11px] text-gray-600 leading-relaxed flex gap-2" data-testid={`text-promo-rule-${promo.id}-${i}`}>
                                    <span className="text-orange-400 flex-shrink-0">•</span>
                                    {rule}
                                  </p>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}

                    <form onSubmit={(e) => handleSubmit(e, promo.id)} className="space-y-2.5">
                      <div>
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                          {t("dp.nameLabel")}
                        </label>
                        <input
                          type="text"
                          required
                          value={fd.name}
                          onChange={(e) => updateFormData(promo.id, "name", e.target.value)}
                          placeholder={t("dp.namePlaceholder")}
                          className="w-full bg-gray-50 text-gray-900 placeholder-gray-300 text-[13px] rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-300 border border-gray-100"
                          data-testid={`input-promo-name-${promo.id}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                          {t("dp.emailLabel")}
                        </label>
                        <input
                          type="email"
                          required
                          value={fd.email}
                          onChange={(e) => updateFormData(promo.id, "email", e.target.value)}
                          placeholder={t("dp.emailPlaceholder")}
                          className="w-full bg-gray-50 text-gray-900 placeholder-gray-300 text-[13px] rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-300 border border-gray-100"
                          data-testid={`input-promo-email-${promo.id}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-1">
                          {t("dp.cuLabel")}
                        </label>
                        <input
                          type="text"
                          required
                          value={fd.cuNumber}
                          onChange={(e) => updateFormData(promo.id, "cuNumber", e.target.value)}
                          placeholder={t("dp.cuPlaceholder")}
                          className={`w-full bg-gray-50 text-gray-900 placeholder-gray-300 text-[13px] rounded-lg px-3 py-2.5 outline-none focus:ring-2 border ${
                            fd.cuNumber && !isCuValid(fd.cuNumber)
                              ? "border-red-300 focus:ring-red-300"
                              : "border-gray-100 focus:ring-orange-300"
                          }`}
                          data-testid={`input-promo-cu-${promo.id}`}
                        />
                        {fd.cuNumber && !isCuValid(fd.cuNumber) && (
                          <p className="text-[10px] text-red-500 mt-1" data-testid={`text-cu-error-${promo.id}`}>
                            {t("dp.cuError")}
                          </p>
                        )}
                      </div>

                      {error && expandedId === promo.id && (
                        <p className="text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-1.5" data-testid="text-promo-error">
                          {error}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedId(null)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0"
                          data-testid={`btn-promo-cancel-${promo.id}`}
                        >
                          <X size={16} className="text-gray-400" />
                        </button>
                        <button
                          type="submit"
                          disabled={loading === promo.id || (!!fd.cuNumber && !isCuValid(fd.cuNumber))}
                          className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[13px] rounded-lg py-2.5 active:scale-[0.98] transition-transform shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                          data-testid={`btn-promo-submit-${promo.id}`}
                        >
                          {loading === promo.id && <Loader2 size={14} className="animate-spin" />}
                          {t("dp.submit")}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default PromoCard;
