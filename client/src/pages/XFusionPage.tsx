import React from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserPlus, ChevronLeft, Download, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const XFusionPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();

  const faqItems = {
    ru: [
      { q: "Что такое JetUP?", a: "JetUP — это платформа, которая объединяет проверенных провайдеров, инструменты и сервисы для финансовых рынков в структурированной, прозрачной и доступной среде." },
      { q: "С чего начать?", a: "Регистрация на JetUP IB Portal → подключение к TAG Markets → установка MetaTrader 5 → депозит → доступ к инструментам экосистемы." },
      { q: "Где находятся мои средства?", a: "Ваш капитал всегда находится на вашем личном счёте у лицензированного брокера TAG Markets. Только вы имеете к нему доступ." },
      { q: "Безопасно ли это?", a: "TAG Markets — лицензированный брокер (FSC Mauritius). JetUP не управляет вашим капиталом и не принимает решений за вас. Контроль всегда остаётся у клиента." },
      { q: "Какая минимальная сумма?", a: "Минимум для клиента — $100, для партнёра — $250 с активным трейдинговым счётом." },
    ],
    en: [
      { q: "What is JetUP?", a: "JetUP is a platform that brings together verified providers, tools, and services for the financial markets in a structured, transparent, and accessible environment." },
      { q: "How do I get started?", a: "Register on JetUP IB Portal → connect to TAG Markets → install MetaTrader 5 → deposit → access ecosystem tools." },
      { q: "Where are my funds?", a: "Your capital always stays in your personal account with the licensed broker TAG Markets. Only you have access to it." },
      { q: "Is it safe?", a: "TAG Markets is a licensed broker (FSC Mauritius). JetUP does not manage your capital or make decisions for you. Control always stays with the customer." },
      { q: "What's the minimum amount?", a: "Minimum for a client is $100, for a partner — $250 with an active trading account." },
    ],
    de: [
      { q: "Was ist JetUP?", a: "JetUP ist eine Plattform, die verifizierte Anbieter, Tools und Dienstleistungen für die Finanzmärkte in einer strukturierten, transparenten und zugänglichen Umgebung zusammenbringt." },
      { q: "Wie fange ich an?", a: "Registrierung auf dem JetUP IB Portal → Verbindung mit TAG Markets → MetaTrader 5 installieren → Einzahlung → Zugang zu Ökosystem-Tools." },
      { q: "Wo ist mein Kapital?", a: "Ihr Kapital befindet sich immer auf Ihrem persönlichen Konto beim lizenzierten Broker TAG Markets. Nur Sie haben Zugang dazu." },
      { q: "Ist es sicher?", a: "TAG Markets ist ein lizenzierter Broker (FSC Mauritius). JetUP verwaltet Ihr Kapital nicht und trifft keine Entscheidungen für Sie. Die Kontrolle bleibt immer beim Kunden." },
      { q: "Was ist der Mindestbetrag?", a: "Minimum für Kunden: 100 $, für Partner: 250 $ mit einem aktiven Handelskonto." },
    ],
  }[language];

  const pdfUrl = { ru: '/jetup-presentation-ru.pdf', en: '/jetup-presentation-en.pdf', de: '/jetup-presentation-de.pdf' }[language];
  const presentationLabel = { ru: 'Презентация JetUP', en: 'JetUP Presentation', de: 'JetUP Präsentation' }[language];
  const downloadLabel = { ru: 'Скачать PDF', en: 'Download PDF', de: 'PDF herunterladen' }[language];
  const registrationLabel = { ru: 'Регистрация', en: 'Registration', de: 'Registrierung' }[language];
  const faqLabel = { ru: 'Частые вопросы', en: 'FAQ', de: 'Häufige Fragen' }[language];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 p-4 pb-2 flex-shrink-0">
        <Link href="/">
          <button className="w-9 h-9 rounded-full bg-card flex items-center justify-center hover:bg-card/80 transition-colors shadow-sm">
            <ChevronLeft size={22} />
          </button>
        </Link>
        <div className="flex items-center gap-2.5">
          <img src="/jetup-logo.png" alt="JetUP" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold">{t('jetup.title')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-3 space-y-4">
        <p className="text-sm text-gray-500 leading-relaxed">
          {t('jetup.desc')}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <a href="https://jetup.ibportal.io" target="_blank" rel="noopener noreferrer" className="block">
            <Card className="p-3 border border-gray-100 hover:border-primary/30 transition-colors flex items-center gap-2.5 group rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs">{registrationLabel}</p>
                <p className="text-[10px] text-gray-500 truncate">IB Portal</p>
              </div>
            </Card>
          </a>
          <a href={pdfUrl} download className="block" data-testid="download-presentation">
            <Card className="p-3 border border-gray-100 hover:border-red-300 transition-colors flex items-center gap-2.5 group rounded-2xl">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs">{presentationLabel}</p>
                <p className="text-[10px] text-gray-500 truncate">{downloadLabel}</p>
              </div>
            </Card>
          </a>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-3">{faqLabel}</h2>
          <Accordion type="single" collapsible className="w-full space-y-2">
            {faqItems.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-none bg-card rounded-2xl px-3 shadow-sm">
                <AccordionTrigger className="hover:no-underline py-3 font-semibold text-left text-sm">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-3 text-sm">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <button
          onClick={() => setLocation('/maria')}
          className="w-full bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center gap-3.5 active:scale-[0.98] transition-transform text-left"
          data-testid="cta-live-consultant"
        >
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 flex items-center justify-center">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <div className="absolute -left-0.5 bottom-0 flex items-center gap-1 bg-white rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-semibold text-gray-600">
                {{ ru: 'онлайн', en: 'online', de: 'online' }[language]}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-gray-900">
              {{ ru: 'Live консультант', en: 'Live Consultant', de: 'Live-Beraterin' }[language]}
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              {{ ru: 'Нажмите для общения', en: 'Tap to start a conversation', de: 'Tippen Sie, um zu sprechen' }[language]}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <ArrowRight size={20} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default XFusionPage;
