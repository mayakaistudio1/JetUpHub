import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageCircle,
  Shield,
  Bot,
  Zap,
  Rocket,
  ListOrdered,
  HelpCircle,
  ArrowRight,
  Calendar,
  GraduationCap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAppNavigation } from "@/hooks/use-app-navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import SectionVideos from "@/components/SectionVideos";

const TradingHubPage: React.FC = () => {
  const [, setLocation] = useAppNavigation();
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-trading"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight">
          {t("trading.title")}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
            {t("trading.subtitle")}
          </p>

          <Accordion type="multiple" className="space-y-2.5">
            <AccordionItem
              value="tag-markets"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-tag-markets"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">{t("trading.tagMarkets")}</span>
                    <span className="text-[12px] text-gray-400 font-medium">{t("trading.tagMarketsSubtitle")}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.regulation")}</span>{" "}
                    {t("trading.regulationDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.conditions")}</span>{" "}
                    {t("trading.conditionsDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.payouts")}</span>{" "}
                    {t("trading.payoutsDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.scale")}</span>{" "}
                    {t("trading.scaleDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.security")}</span>{" "}
                    {t("trading.securityDesc")}
                  </p>
                  <SectionVideos topicTag="tag-markets" hubPath="/trading" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="copy-x"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-copy-x"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-fuchsia-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">{t("trading.copyX")}</span>
                    <span className="text-[12px] text-gray-400 font-medium">{t("trading.copyXSubtitle")}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    {t("trading.copyXDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.stats")}</span>{" "}
                    {t("trading.statsDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.control")}</span>{" "}
                    {t("trading.controlDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.risk")}</span>{" "}
                    {t("trading.riskDesc")}
                  </p>
                  <SectionVideos topicTag="copy-x" hubPath="/trading" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="vortex"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-vortex"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">{t("trading.vortex")}</span>
                    <span className="text-[12px] text-purple-500 font-semibold">{t("trading.vortexSubtitle")}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p className="text-purple-600 font-semibold">
                    {t("trading.vortexComing")}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="amplify"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-amplify"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">{t("trading.amplify")}</span>
                    <span className="text-[12px] text-gray-400 font-medium">{t("trading.amplifySubtitle")}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p>
                    {t("trading.amplifyDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.amplify12x")}</span>{" "}
                    {t("trading.amplify12xDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.liquidity")}</span>{" "}
                    {t("trading.liquidityDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.profit")}</span>{" "}
                    {t("trading.profitDesc")}
                  </p>
                  <p>
                    <span className="font-bold text-gray-800">{t("trading.noCredit")}</span>{" "}
                    {t("trading.noCreditDesc")}
                  </p>
                  <SectionVideos topicTag="amplify" hubPath="/trading" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="schnellstart"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-schnellstart"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <ListOrdered className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">{t("trading.start")}</span>
                    <span className="text-[12px] text-gray-400 font-medium">{t("trading.startSubtitle")}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-2.5 pb-2">
                  <p><span className="font-bold text-gray-800">{t("trading.startStep1")}</span> {t("trading.startStep1Desc")}</p>
                  <p><span className="font-bold text-gray-800">{t("trading.startStep2")}</span> {t("trading.startStep2Desc")}</p>
                  <p><span className="font-bold text-gray-800">{t("trading.startStep3")}</span> {t("trading.startStep3Desc")}</p>
                  <p><span className="font-bold text-gray-800">{t("trading.startStep4")}</span> {t("trading.startStep4Desc")}</p>
                  <p><span className="font-bold text-gray-800">{t("trading.startStep5")}</span> {t("trading.startStep5Desc")}</p>
                  <SectionVideos topicTag="getting-started" hubPath="/trading" />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="faq"
              className="border-none bg-white rounded-2xl px-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
              data-testid="accordion-faq-trading"
            >
              <AccordionTrigger className="hover:no-underline py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-bold text-gray-900 block">{t("trading.faq")}</span>
                    <span className="text-[12px] text-gray-400 font-medium">{t("trading.faqSubtitle")}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-[13px] text-gray-600 leading-relaxed space-y-3 pb-2">
                  <div>
                    <p className="font-bold text-gray-800">{t("trading.faqQ1")}</p>
                    <p>{t("trading.faqA1")}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t("trading.faqQ2")}</p>
                    <p>{t("trading.faqA2")}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t("trading.faqQ3")}</p>
                    <p>{t("trading.faqA3")}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{t("trading.faqQ4")}</p>
                    <p>{t("trading.faqA4")}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => setLocation("/schedule?filter=trading")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="link-trading-call"
            >
              <Calendar size={15} className="text-orange-500" />
              {t("home.schedule")}
            </button>
            <button
              onClick={() => setLocation("/tutorials?filter=trader")}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-[12px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="link-trading-tutorials"
            >
              <GraduationCap size={15} className="text-cyan-500" />
              {t("home.tutorials")}
            </button>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 active:scale-[0.97] transition-transform"
              data-testid="button-back-hub"
            >
              <ArrowLeft size={16} />
              {t("common.backToHub")}
            </button>
            <button
              onClick={() => setLocation("/maria")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl jetup-gradient-glow text-[13px] font-semibold text-white active:scale-[0.97] transition-transform"
              data-testid="button-frag-maria"
            >
              <MessageCircle size={16} />
              {t("common.askMaria")}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TradingHubPage;
