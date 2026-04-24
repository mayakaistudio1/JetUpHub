import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar, Clock, User, Globe, Loader2, ChevronLeft, ChevronRight,
  Send, Copy, Check, Share2, MessageCircle, Phone, Bell,
  Mail, Facebook, Instagram, Link2, Users, UserCheck, FileText, Sparkles,
  Eye, Star
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

interface Webinar {
  id: number; title: string; date: string; time: string; timezone: string;
  speaker: string; speakerPhoto: string | null; type: string; typeBadge: string;
  highlights: string[]; language: string;
  invitesSent: number; registeredCount: number;
}

interface InviteResult {
  inviteCode: string; inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

interface EventDetail {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  inviteCode: string; guestCount: number; clickedCount: number;
}

interface EventReport {
  event: { id: number; title: string; eventDate: string; eventTime: string; inviteCode: string };
  guests: Array<{
    id: number; name: string; email: string; phone: string | null;
    registeredAt: string; clickedZoom: boolean; attended: boolean;
    durationMinutes: number; questionsAsked: number; questionTexts: string[];
  }>;
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number };
}

const MESSAGE_TEMPLATES = [
  {
    id: "professional",
    label: "Professional",
    icon: "💼",
    generate: (event: { title: string; date: string; time: string; speaker: string }, url: string) =>
      `Ich möchte Sie herzlich zu unserem exklusiven Webinar einladen:\n\n📌 ${event.title}\n📅 ${event.date} um ${event.time}\n🎤 Speaker: ${event.speaker}\n\nMelden Sie sich jetzt an:\n${url}`,
  },
  {
    id: "friendly",
    label: "Friendly",
    icon: "😊",
    generate: (event: { title: string; date: string; time: string; speaker: string }, url: string) =>
      `Hey! Ich habe ein spannendes Webinar für dich:\n\n🎯 ${event.title}\n📅 ${event.date}, ${event.time}\n🎤 Mit ${event.speaker}\n\nSchau mal rein, es lohnt sich! 👇\n${url}`,
  },
  {
    id: "short",
    label: "Short & Direct",
    icon: "⚡",
    generate: (event: { title: string; date: string; time: string; speaker: string }, url: string) =>
      `${event.title} — ${event.date}, ${event.time}.\nJetzt anmelden: ${url}`,
  },
];

interface PersonalInviteResult {
  inviteCode: string;
  inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

type Screen = "list" | "detail" | "invite-type" | "template-select" | "share" | "personal-form" | "personal-share" | "personal-preview" | "invite-preview";

const qualifyQuestionsEn = [
  {
    step: 1, multiSelect: true,
    aiText: "To create a strong personal invitation, I need to understand this person a bit.\n\nWho is this person to you? (you can select multiple)",
    options: [
      { label: "Friend / warm contact", value: "friend" },
      { label: "Business contact", value: "business_contact" },
      { label: "MLM Leader", value: "mlm_leader" },
      { label: "Investor type", value: "investor" },
      { label: "Entrepreneur", value: "entrepreneur" },
      { label: "Cold contact", value: "cold_contact" },
    ],
  },
  {
    step: 2, multiSelect: true,
    aiText: "Great! What motivates this person the most? (you can select multiple)",
    options: [
      { label: "Money / Results", value: "money_results" },
      { label: "Business growth", value: "business_growth" },
      { label: "Technology / Innovation", value: "technology_innovation" },
      { label: "Community / People", value: "community_people" },
      { label: "Learning / Curiosity", value: "learning_curiosity" },
    ],
  },
  {
    step: 3, multiSelect: true,
    aiText: "Got it! How does this person usually react to new opportunities? (you can select multiple)",
    options: [
      { label: "Quick decision", value: "fast_decision" },
      { label: "Analytical / many questions", value: "analytical" },
      { label: "Skeptical", value: "skeptical" },
      { label: "Needs trust first", value: "needs_trust" },
    ],
  },
  { step: 4, multiSelect: false, aiText: "Almost done! Is there anything else important about this person I should know? (optional)", options: null },
];

const qualifyQuestionsDe = [
  {
    step: 1, multiSelect: true,
    aiText: "Um eine starke persönliche Einladung zu erstellen, muss ich die Person ein wenig verstehen.\n\nWer ist diese Person für dich? (du kannst mehrere auswählen)",
    options: [
      { label: "Freund / warmer Kontakt", value: "friend" },
      { label: "Geschäftskontakt", value: "business_contact" },
      { label: "MLM Leader", value: "mlm_leader" },
      { label: "Investor-Typ", value: "investor" },
      { label: "Unternehmer", value: "entrepreneur" },
      { label: "Kalter Kontakt", value: "cold_contact" },
    ],
  },
  {
    step: 2, multiSelect: true,
    aiText: "Gut! Und was motiviert diese Person normalerweise am meisten? (du kannst mehrere auswählen)",
    options: [
      { label: "Geld / Ergebnisse", value: "money_results" },
      { label: "Business-Wachstum", value: "business_growth" },
      { label: "Technologie / Innovation", value: "technology_innovation" },
      { label: "Community / Menschen", value: "community_people" },
      { label: "Lernen / Neugier", value: "learning_curiosity" },
    ],
  },
  {
    step: 3, multiSelect: true,
    aiText: "Verstanden! Wie reagiert die Person normalerweise auf neue Möglichkeiten? (du kannst mehrere auswählen)",
    options: [
      { label: "Schnelle Entscheidung", value: "fast_decision" },
      { label: "Analytisch / viele Fragen", value: "analytical" },
      { label: "Skeptisch", value: "skeptical" },
      { label: "Braucht erst Vertrauen", value: "needs_trust" },
    ],
  },
  { step: 4, multiSelect: false, aiText: "Fast fertig! Gibt es noch etwas Wichtiges über die Person, das ich wissen sollte? (optional)", options: null },
];

const qualifyQuestionsRu = [
  {
    step: 1, multiSelect: true,
    aiText: "Чтобы создать сильное персональное приглашение, мне нужно немного понять этого человека.\n\nКто этот человек для вас? (можно выбрать несколько)",
    options: [
      { label: "Друг / тёплый контакт", value: "friend" },
      { label: "Деловой контакт", value: "business_contact" },
      { label: "MLM Лидер", value: "mlm_leader" },
      { label: "Инвестор", value: "investor" },
      { label: "Предприниматель", value: "entrepreneur" },
      { label: "Холодный контакт", value: "cold_contact" },
    ],
  },
  {
    step: 2, multiSelect: true,
    aiText: "Отлично! Что больше всего мотивирует этого человека? (можно выбрать несколько)",
    options: [
      { label: "Деньги / Результаты", value: "money_results" },
      { label: "Рост бизнеса", value: "business_growth" },
      { label: "Технологии / Инновации", value: "technology_innovation" },
      { label: "Сообщество / Люди", value: "community_people" },
      { label: "Обучение / Любопытство", value: "learning_curiosity" },
    ],
  },
  {
    step: 3, multiSelect: true,
    aiText: "Понял! Как этот человек обычно реагирует на новые возможности? (можно выбрать несколько)",
    options: [
      { label: "Быстрое решение", value: "fast_decision" },
      { label: "Аналитик / много вопросов", value: "analytical" },
      { label: "Скептик", value: "skeptical" },
      { label: "Сначала нужно доверие", value: "needs_trust" },
    ],
  },
  { step: 4, multiSelect: false, aiText: "Почти готово! Есть ли что-то ещё важное об этом человеке, что мне стоит знать? (необязательно)", options: null },
];

export default function WebinarsScreen({ telegramId }: { telegramId: string }) {
  const { t, language } = useLanguage();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedWebinar, setSelectedWebinar] = useState<Webinar | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES[0]);
  const [shareMode, setShareMode] = useState<"personal" | "social">("personal");
  const [eventDetails, setEventDetails] = useState<EventDetail[]>([]);
  const [eventReport, setEventReport] = useState<EventReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [personalInviteResult, setPersonalInviteResult] = useState<PersonalInviteResult | null>(null);
  const [personalCreating, setPersonalCreating] = useState(false);
  const [prospectForm, setProspectForm] = useState({ name: "", type: "Neutral", note: "" });

  const [qualifyStep, setQualifyStep] = useState(0);
  const [qualifyChatMessages, setQualifyChatMessages] = useState<Array<{ role: string; content: string; options?: Array<{ label: string; value: string }> | null; multiSelect?: boolean }>>([]);
  const [qualifyAnswers, setQualifyAnswers] = useState<{ relationship: string; motivation: string; reaction: string; contextNote: string }>({ relationship: "", motivation: "", reaction: "", contextNote: "" });
  const [qualifyContextInput, setQualifyContextInput] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState<{ messages: string[]; strategy: string; discType: string; prospectType: string; quickReplies: string[]; motivation: string; reaction: string } | null>(null);
  const [previewEditing, setPreviewEditing] = useState<number | null>(null);
  const [previewEditText, setPreviewEditText] = useState("");
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [qualifyStarted, setQualifyStarted] = useState(false);
  const [multiSelectValues, setMultiSelectValues] = useState<Array<{ value: string; label: string }>>([]);
  const [partnerDisplayName, setPartnerDisplayName] = useState("");
  const [personalInvites, setPersonalInvites] = useState<Array<{ id: number; inviteCode: string; prospectName: string; prospectType: string; discType: string; scheduleEventId: number; eventTitle: string | null; createdAt: string; viewedAt: string | null; registeredAt: string | null; guestName: string | null; guestEmail: string | null; isActive: boolean; reminderPreference?: string | null; reminderSent?: boolean }>>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/partner-app/webinars?lang=${language}`, { headers: { ...getPartnerAuthHeader() } }).then((r) => r.json()),
      fetch("/api/partner-app/events", { headers: { ...getPartnerAuthHeader() } }).then((r) => r.json()),
      fetch("/api/partner-app/profile", { headers: { ...getPartnerAuthHeader() } }).then((r) => r.json()).catch(() => null),
      fetch("/api/partner-app/personal-invites", { headers: { ...getPartnerAuthHeader() } }).then((r) => r.json()).catch(() => ({ invites: [] })),
    ])
      .then(([webinarData, eventsData, profileData, piData]) => {
        setWebinars(webinarData);
        setEventDetails(eventsData);
        if (profileData?.partner?.name) {
          setPartnerDisplayName(profileData.partner.name);
        }
        if (piData?.invites) setPersonalInvites(piData.invites);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [telegramId, language]);

  const createInvite = async () => {
    if (!selectedWebinar || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/partner-app/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ scheduleEventId: selectedWebinar.id }),
      });
      const data = await res.json();
      setInviteResult(data);
    } catch (err) { console.error(err); }
    setCreating(false);
  };

  const loadEventReport = async (eventId: number) => {
    setReportLoading(true);
    try {
      const res = await fetch(`/api/partner-app/events/${eventId}/report`, { headers: { ...getPartnerAuthHeader() } });
      setEventReport(await res.json());
    } catch (err) { console.error(err); }
    setReportLoading(false);
  };

  const qualifyQuestionSets: Record<string, typeof qualifyQuestionsEn> = { en: qualifyQuestionsEn, de: qualifyQuestionsDe, ru: qualifyQuestionsRu };
  const QUALIFY_QUESTIONS = qualifyQuestionSets[language] || qualifyQuestionsEn;

  const startAiQualification = () => {
    setQualifyStep(0);
    setQualifyAnswers({ relationship: "", motivation: "", reaction: "", contextNote: "" });
    setQualifyContextInput("");
    setGeneratedPreview(null);
    setQualifyStarted(true);
    setMultiSelectValues([]);
    const firstQ = QUALIFY_QUESTIONS[0];
    setQualifyChatMessages([{ role: "assistant", content: firstQ.aiText, options: firstQ.options, multiSelect: firstQ.multiSelect }]);
  };

  const toggleMultiSelectValue = (value: string, label: string) => {
    setMultiSelectValues((prev) => {
      const exists = prev.find((v) => v.value === value);
      if (exists) return prev.filter((v) => v.value !== value);
      return [...prev, { value, label }];
    });
  };

  const confirmMultiSelect = async () => {
    if (multiSelectValues.length === 0) return;
    const combinedValue = multiSelectValues.map((v) => v.value).join(",");
    const combinedLabel = multiSelectValues.map((v) => v.label).join(", ");
    setMultiSelectValues([]);
    await handleQualifyAnswer(combinedValue, combinedLabel);
  };

  const handleQualifyAnswer = async (value: string, label: string) => {
    const step = qualifyStep;
    const newMessages = [...qualifyChatMessages, { role: "user", content: label }];

    const newAnswers = { ...qualifyAnswers };
    if (step === 0) newAnswers.relationship = value;
    else if (step === 1) newAnswers.motivation = value;
    else if (step === 2) newAnswers.reaction = value;
    else if (step === 3) newAnswers.contextNote = value;
    setQualifyAnswers(newAnswers);

    const nextStep = step + 1;
    if (nextStep < QUALIFY_QUESTIONS.length) {
      const nextQ = QUALIFY_QUESTIONS[nextStep];
      newMessages.push({ role: "assistant", content: nextQ.aiText, options: nextQ.options, multiSelect: nextQ.multiSelect });
      setQualifyChatMessages(newMessages);
      setQualifyStep(nextStep);
    } else {
      const genMsg = language === "de" ? "Perfekt! Ich generiere jetzt deine personalisierte Einladung..." : language === "ru" ? "Отлично! Генерирую персональное приглашение..." : "Perfect! Generating your personalized invitation...";
      newMessages.push({ role: "assistant", content: genMsg });
      setQualifyChatMessages(newMessages);
      setQualifyStep(nextStep);
      await generatePreviewMessages(newAnswers);
    }
  };

  const handleContextSubmit = async () => {
    const skipLabel = language === "de" ? "Übersprungen" : language === "ru" ? "Пропущено" : "Skipped";
    const noInfo = language === "de" ? "keine zusätzlichen Infos" : language === "ru" ? "нет дополнительной информации" : "no additional info";
    const value = qualifyContextInput.trim() || noInfo;
    await handleQualifyAnswer(value, qualifyContextInput.trim() || skipLabel);
  };

  const generatePreviewMessages = async (answers?: typeof qualifyAnswers) => {
    if (!selectedWebinar) return;
    const ans = answers || qualifyAnswers;
    setGeneratingMessages(true);
    try {
      const res = await fetch("/api/partner-app/generate-invite-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({
          scheduleEventId: selectedWebinar.id,
          prospectName: prospectForm.name,
          partnerName: partnerDisplayName,
          relationship: ans.relationship,
          motivation: ans.motivation,
          reaction: ans.reaction,
          contextNote: ans.contextNote,
          language,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setGeneratedPreview(data);
      setScreen("personal-preview");
    } catch { alert(language === "de" ? "Fehler bei der Generierung. Bitte erneut versuchen." : language === "ru" ? "Ошибка генерации. Попробуйте снова." : "Generation failed. Please try again."); }
    setGeneratingMessages(false);
  };

  const confirmAndCreateInvite = async () => {
    if (!selectedWebinar || !generatedPreview || personalCreating) return;
    setPersonalCreating(true);
    try {
      const res = await fetch("/api/partner-app/create-personal-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({
          scheduleEventId: selectedWebinar.id,
          prospectName: prospectForm.name,
          prospectType: generatedPreview.prospectType,
          discType: generatedPreview.discType,
          motivationType: generatedPreview.motivation,
          reactionType: generatedPreview.reaction,
          inviteStrategy: generatedPreview.strategy,
          generatedMessages: JSON.stringify(generatedPreview.messages),
          prospectNote: qualifyAnswers.contextNote || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const fallback = language === "de" ? "Fehler beim Erstellen. Bitte erneut versuchen." : language === "ru" ? "Ошибка создания. Попробуйте снова." : "Creation failed. Please try again.";
        alert(errData.error || fallback);
        return;
      }
      const data = await res.json();
      setPersonalInviteResult(data);
      setScreen("personal-share");
      try {
        const piRes = await fetch("/api/partner-app/personal-invites", { headers: { ...getPartnerAuthHeader() } });
        const piData = await piRes.json();
        if (piData?.invites) setPersonalInvites(piData.invites);
      } catch {}
    } catch (err) { console.error(err); alert(language === "de" ? "Fehler beim Erstellen. Bitte erneut versuchen." : language === "ru" ? "Ошибка создания. Попробуйте снова." : "Creation failed. Please try again."); }
    setPersonalCreating(false);
  };

  const getPersonalInviteFullUrl = () => `${window.location.origin}${personalInviteResult?.inviteUrl || ""}`;

  const getFullUrl = () => `${window.location.origin}${inviteResult?.inviteUrl || ""}`;

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || getFullUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareText = () => {
    if (!inviteResult) return "";
    return selectedTemplate.generate(inviteResult.event, getFullUrl());
  };

  const shareVia = (platform: string) => {
    const text = encodeURIComponent(getShareText());
    const url = encodeURIComponent(getFullUrl());
    const tg = (window as any).Telegram?.WebApp;
    switch (platform) {
      case "telegram":
        if (tg?.openTelegramLink) tg.openTelegramLink(`https://t.me/share/url?url=${url}&text=${text}`);
        else window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
        break;
      case "whatsapp": window.open(`https://wa.me/?text=${text}`, "_blank"); break;
      case "facebook": window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank"); break;
      case "email": window.open(`mailto:?subject=${encodeURIComponent(inviteResult?.event.title || "")}&body=${text}`, "_blank"); break;
      case "instagram": handleCopy(getShareText()); break;
    }
  };

  const handleSelectWebinar = (w: Webinar) => {
    setSelectedWebinar(w);
    setInviteResult(null);
    setEventReport(null);
    setScreen("detail");
  };

  const handleStartInvite = () => {
    setScreen("invite-type");
  };

  const handleInviteType = (type: "personal" | "social") => {
    setShareMode(type);
    setScreen("template-select");
  };

  const handleTemplateSelected = async (template: typeof MESSAGE_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    if (!inviteResult) await createInvite();
    setScreen("share");
  };

  const goBack = () => {
    switch (screen) {
      case "share": setScreen("template-select"); break;
      case "template-select": setScreen("invite-type"); break;
      case "invite-type": setScreen("detail"); break;
      case "personal-share": setScreen("detail"); break;
      case "personal-preview": setScreen("personal-form"); break;
      case "personal-form": setQualifyStarted(false); setScreen("detail"); break;
      case "detail": setScreen("list"); setEventReport(null); break;
      default: setScreen("list"); break;
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  }

  if (screen === "share" && (creating || !inviteResult)) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
        <p className="text-sm text-gray-400">Creating invite link...</p>
      </div>
    );
  }

  if (screen === "share" && inviteResult) {
    const shareChannels = shareMode === "personal"
      ? [
          { id: "telegram", label: "Telegram", icon: Send, bg: "bg-blue-500" },
          { id: "whatsapp", label: "WhatsApp", icon: Phone, bg: "bg-green-500" },
          { id: "email", label: "E-Mail", icon: Mail, bg: "bg-gray-600" },
        ]
      : [
          { id: "telegram", label: "Telegram", icon: Send, bg: "bg-blue-500" },
          { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, bg: "bg-green-500" },
          { id: "facebook", label: "Facebook", icon: Facebook, bg: "bg-blue-600" },
          { id: "instagram", label: "Instagram", icon: Instagram, bg: "bg-gradient-to-r from-pink-500 to-purple-500" },
        ];

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-5">
          {shareMode === "personal" ? t('pa.personalInvite') : t('pa.socialShareTitle')}
        </h2>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{t('pa.yourLink')}</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono" data-testid="text-invite-url">{getFullUrl()}</p>
            <button onClick={() => handleCopy()} className="p-1.5 rounded-lg bg-white active:bg-gray-100" data-testid="button-copy-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{t('pa.messagePreview')}</p>
            <span className="text-[10px] text-blue-600 font-medium">{selectedTemplate.icon} {selectedTemplate.label}</span>
          </div>
          <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed" data-testid="text-share-message">{getShareText()}</p>
        </div>

        <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">{t('pa.sendVia')}</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {shareChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => shareVia(ch.id)}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl ${ch.bg} text-white active:opacity-90 transition-opacity`}
              data-testid={`share-${ch.id}`}
            >
              <ch.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{ch.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => handleCopy(getShareText())}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
          data-testid="button-copy-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-700">{copied ? t('pa.copied') : t('pa.copyMessageLink')}</span>
        </button>

        <p className="text-[11px] text-gray-400 text-center mt-4">
          {t('pa.allRegistrations')}
        </p>
      </div>
    );
  }

  if (screen === "template-select") {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <h2 className="text-base font-semibold text-gray-900 mb-1">{t('pa.chooseStyle')}</h2>
        <p className="text-xs text-gray-400 mb-5">{t('pa.chooseStyleDesc')}</p>

        <div className="space-y-3">
          {MESSAGE_TEMPLATES.map((tpl, i) => {
            const previewText = selectedWebinar
              ? tpl.generate(
                  { title: selectedWebinar.title, date: selectedWebinar.date, time: selectedWebinar.time, speaker: selectedWebinar.speaker },
                  "https://..."
                )
              : "";
            return (
              <motion.button
                key={tpl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleTemplateSelected(tpl)}
                className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                data-testid={`template-${tpl.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{tpl.icon}</span>
                    <span className="text-sm font-semibold text-gray-900">{tpl.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
                <p className="text-[11px] text-gray-400 whitespace-pre-line leading-relaxed line-clamp-3">{previewText}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === "personal-share" && personalInviteResult) {
    const personalShareChannels = [
      { id: "telegram", label: "Telegram", icon: Send, bg: "bg-blue-500" },
      { id: "whatsapp", label: "WhatsApp", icon: Phone, bg: "bg-green-500" },
      { id: "email", label: "E-Mail", icon: Mail, bg: "bg-gray-600" },
    ];

    const personalShareText = `Hey ${prospectForm.name}! I have a special invitation for you — check it out:\n${getPersonalInviteFullUrl()}`;

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <h2 className="text-lg font-bold text-gray-900 mb-1">{t('pa.inviteCreated')}</h2>
        <p className="text-xs text-gray-400 mb-5">{t('pa.aiWillInvite')} {prospectForm.name}</p>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{t('pa.personalLink')}</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 flex-1 font-mono break-all leading-relaxed" data-testid="text-personal-invite-url">{getPersonalInviteFullUrl()}</p>
            <button onClick={() => { navigator.clipboard.writeText(getPersonalInviteFullUrl()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-lg bg-white active:bg-gray-100" data-testid="button-copy-personal-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              {t('pa.aiWillUseMessages')} {prospectForm.name} {t('pa.opensLink')}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">{t('pa.sendVia')}</p>
        <div className="space-y-2 mb-5">
          {personalShareChannels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                const text = encodeURIComponent(personalShareText);
                const url = encodeURIComponent(getPersonalInviteFullUrl());
                switch (ch.id) {
                  case "telegram": window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank"); break;
                  case "whatsapp": window.open(`https://wa.me/?text=${text}`, "_blank"); break;
                  case "email": window.open(`mailto:?subject=Personal Invitation&body=${text}`, "_blank"); break;
                }
              }}
              className={`w-full flex items-center gap-2.5 p-3.5 rounded-xl ${ch.bg} text-white active:opacity-90 transition-opacity`}
              data-testid={`personal-share-${ch.id}`}
            >
              <ch.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{ch.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => { navigator.clipboard.writeText(personalShareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-white border border-gray-200 active:bg-gray-50"
          data-testid="button-copy-personal-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-700">{copied ? t('pa.copied') : t('pa.copyMessageLink')}</span>
        </button>

        <button
          onClick={() => setScreen("invite-preview")}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-50 border border-blue-200 active:bg-blue-100 mt-3"
          data-testid="button-preview-invite"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{t('pa.preview.title')}</span>
        </button>
      </div>
    );
  }

  if (screen === "invite-preview" && selectedWebinar && generatedPreview) {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={() => setScreen("personal-share")} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">{t('pa.preview.title')}</h2>
        </div>

        <div className="bg-[#F5F5F7] rounded-2xl overflow-hidden" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{selectedWebinar.title}</p>
              <p className="text-[10px] text-gray-400">{t('pa.preview.chatPreview')}</p>
            </div>
          </div>

          <div className="px-4 py-4 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
            {generatedPreview.messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md bg-white text-sm text-gray-700 leading-relaxed" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p className="whitespace-pre-wrap">{msg}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {generatedPreview.quickReplies.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {generatedPreview.quickReplies.map((qr) => (
                  <span key={qr} className="px-3 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600">{qr}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-3">{t('pa.preview.eventDetails')}</p>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-sm font-semibold text-gray-900 mb-2">{selectedWebinar.title}</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar className="w-3 h-3" /> {selectedWebinar.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" /> {selectedWebinar.time}
              </span>
            </div>
            {selectedWebinar.speaker && (
              <div className="flex items-center gap-2">
                {selectedWebinar.speakerPhoto ? (
                  <img src={selectedWebinar.speakerPhoto} alt={selectedWebinar.speaker} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <span className="text-xs text-gray-500">{selectedWebinar.speaker}</span>
              </div>
            )}
          </div>
        </div>

        {personalInviteResult && (
          <div className="mt-4 bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">{t('pa.personalLink')}</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
              <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <p className="text-xs text-gray-600 flex-1 font-mono break-all leading-relaxed" data-testid="text-preview-invite-url">{getPersonalInviteFullUrl()}</p>
              <button onClick={() => { navigator.clipboard.writeText(getPersonalInviteFullUrl()); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-lg bg-white active:bg-gray-100" data-testid="button-copy-preview-link">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setScreen("personal-share")}
          className="w-full mt-4 py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          data-testid="button-back-to-share"
        >
          <Share2 className="w-4 h-4" /> {t('pa.shareLink')}
        </button>
      </div>
    );
  }

  if (screen === "personal-form" && selectedWebinar) {
    if (!qualifyStarted) {
      return (
        <div className="px-5 pt-5 pb-28">
          <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
            <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
          </button>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">{t('pa.personalAI')}</h2>
          </div>
          <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xs text-gray-400 mb-1">{t('pa.upcomingMeetings')}</p>
            <p className="text-sm font-semibold text-gray-900">{selectedWebinar.title}</p>
            <p className="text-xs text-gray-400 mt-1">{selectedWebinar.date} · {selectedWebinar.time}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 space-y-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('pa.partnerName')} *</label>
              <input
                autoFocus
                placeholder={t('pa.partnerNamePlaceholder')}
                value={partnerDisplayName}
                onChange={(e) => setPartnerDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                data-testid="input-partner-display-name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">{t('pa.prospectName')} *</label>
              <input
                placeholder={t('pa.prospectNamePlaceholder')}
                value={prospectForm.name}
                onChange={(e) => setProspectForm({ ...prospectForm, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                data-testid="input-prospect-name"
                onKeyDown={(e) => { if (e.key === "Enter" && prospectForm.name.trim() && partnerDisplayName.trim()) startAiQualification(); }}
              />
            </div>
            <button
              onClick={startAiQualification}
              disabled={!prospectForm.name.trim() || !partnerDisplayName.trim()}
              className="w-full py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              data-testid="button-start-qualification"
            >
              <Sparkles className="w-4 h-4" />
              {t('pa.startAI')}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-[#F5F5F7]">
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => { setQualifyStarted(false); setProspectForm({ name: "", type: "Neutral", note: "" }); goBack(); }} className="text-gray-400 active:opacity-60" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">AI Invite Builder</p>
              <p className="text-[10px] text-gray-400">{prospectForm.name}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {qualifyChatMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.role === "assistant" ? "flex justify-start" : "flex justify-end"}
            >
              {msg.role === "assistant" ? (
                <div className="max-w-[85%]">
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 text-sm text-gray-800 whitespace-pre-line" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    {msg.content}
                  </div>
                  {msg.options && i === qualifyChatMessages.length - 1 && msg.multiSelect && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {msg.options.map((opt) => {
                          const isSelected = multiSelectValues.some((v) => v.value === opt.value);
                          return (
                            <button
                              key={opt.value}
                              onClick={() => toggleMultiSelectValue(opt.value, opt.label)}
                              className={`px-3.5 py-2 rounded-full border text-xs font-medium transition-colors ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600 text-white"
                                  : "bg-white border-blue-200 text-blue-600 active:bg-blue-50"
                              }`}
                              data-testid={`qualify-option-${opt.value}`}
                            >
                              {isSelected && <span className="mr-1">✓</span>}
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                      {multiSelectValues.length > 0 && (
                        <button
                          onClick={confirmMultiSelect}
                          className="mt-2 px-5 py-2 rounded-full bg-blue-600 text-xs font-semibold text-white active:bg-blue-700 transition-colors"
                          data-testid="button-confirm-multi-select"
                        >
                          {t('pa.continue')} ({multiSelectValues.length} {t('pa.selected')})
                        </button>
                      )}
                    </div>
                  )}
                  {msg.options && i === qualifyChatMessages.length - 1 && !msg.multiSelect && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleQualifyAnswer(opt.value, opt.label)}
                          className="px-3.5 py-2 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600 active:bg-blue-50 transition-colors"
                          data-testid={`qualify-option-${opt.value}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {!msg.options && msg.options === null && i === qualifyChatMessages.length - 1 && qualifyStep === 3 && (
                    <div className="flex gap-2 mt-2">
                      <input
                        value={qualifyContextInput}
                        onChange={(e) => setQualifyContextInput(e.target.value)}
                        placeholder="z.B. baut Teams, liebt Crypto..."
                        className="flex-1 px-3.5 py-2 rounded-full bg-white border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400"
                        data-testid="input-qualify-context"
                        onKeyDown={(e) => { if (e.key === "Enter") handleContextSubmit(); }}
                      />
                      <button
                        onClick={handleContextSubmit}
                        className="px-4 py-2 rounded-full bg-blue-600 text-xs font-medium text-white active:bg-blue-700"
                        data-testid="button-submit-context"
                      >
                        {qualifyContextInput.trim() ? (language === "de" ? "Senden" : language === "ru" ? "Отправить" : "Send") : t('pa.skip')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-[75%] bg-blue-600 rounded-2xl rounded-tr-md px-4 py-3 text-sm text-white">
                  {msg.content}
                </div>
              )}
            </motion.div>
          ))}
          {generatingMessages && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500">{t('pa.generating')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === "personal-preview" && selectedWebinar && generatedPreview) {
    const strategyLabelsMap: Record<string, Record<string, string>> = {
      en: { Authority: "Authority — for Leaders", Opportunity: "Opportunity — for Investors", Curiosity: "Curiosity — for the Curious", Support: "Support — for Beginners" },
      de: { Authority: "Authority — für Leader", Opportunity: "Opportunity — für Investoren", Curiosity: "Curiosity — für Neugierige", Support: "Support — für Einsteiger" },
      ru: { Authority: "Authority — для лидеров", Opportunity: "Opportunity — для инвесторов", Curiosity: "Curiosity — для любопытных", Support: "Support — для начинающих" },
    };
    const discLabelsMap: Record<string, Record<string, string>> = {
      en: { D: "D — Dominance", I: "I — Influence", S: "S — Steadiness", C: "C — Conscientiousness" },
      de: { D: "D — Dominanz", I: "I — Einfluss", S: "S — Stabilität", C: "C — Gewissenhaftigkeit" },
      ru: { D: "D — Доминирование", I: "I — Влияние", S: "S — Стабильность", C: "C — Добросовестность" },
    };
    const strategyLabels = strategyLabelsMap[language] || strategyLabelsMap.en;
    const discLabels = discLabelsMap[language] || discLabelsMap.en;
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">{t('pa.previewTitle')}</h2>
        </div>

        <div className="flex gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[10px] font-semibold text-blue-700" data-testid="badge-strategy">
            {strategyLabels[generatedPreview.strategy] || generatedPreview.strategy}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[10px] font-semibold text-purple-700" data-testid="badge-disc">
            DISC: {discLabels[generatedPreview.discType] || generatedPreview.discType}
          </span>
        </div>

        <div className="space-y-3 mb-5">
          {generatedPreview.messages.map((msg, i) => (
            <div key={i} className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-medium text-gray-400">{t('pa.message')} {i + 1}</span>
                <button
                  onClick={() => {
                    if (previewEditing === i) {
                      const newMsgs = [...generatedPreview.messages];
                      newMsgs[i] = previewEditText;
                      setGeneratedPreview({ ...generatedPreview, messages: newMsgs });
                      setPreviewEditing(null);
                    } else {
                      setPreviewEditing(i);
                      setPreviewEditText(msg);
                    }
                  }}
                  className="text-[10px] font-medium text-blue-600 active:opacity-60"
                  data-testid={`button-edit-message-${i}`}
                >
                  {previewEditing === i ? t('pa.save') : t('pa.edit')}
                </button>
              </div>
              {previewEditing === i ? (
                <textarea
                  value={previewEditText}
                  onChange={(e) => setPreviewEditText(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 outline-none focus:border-blue-400 resize-none"
                  data-testid={`textarea-edit-message-${i}`}
                />
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-line">{msg}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] font-medium text-gray-400 mb-2">{t('pa.quickRepliesFor')} {prospectForm.name}</p>
          <div className="flex flex-wrap gap-2">
            {generatedPreview.quickReplies.map((qr) => (
              <span key={qr} className="px-3 py-1.5 rounded-full bg-blue-50 text-xs font-medium text-blue-600">{qr}</span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => generatePreviewMessages()}
            disabled={generatingMessages}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 active:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="button-regenerate"
          >
            {generatingMessages ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> {t('pa.regenerate')}</>}
          </button>
          <button
            onClick={confirmAndCreateInvite}
            disabled={personalCreating}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="button-confirm-invite"
          >
            {personalCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> {t('pa.confirm')}</>}
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-4 leading-relaxed">
          {t('pa.aiWillUseMessages')} {prospectForm.name} {t('pa.opensLink')}
        </p>
      </div>
    );
  }

  if (screen === "invite-type") {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <h2 className="text-base font-semibold text-gray-900 mb-4">{t('pa.inviteType')}</h2>

        <div className="space-y-3">
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleInviteType("personal")}
            className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            data-testid="button-personal-invite"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('pa.personalAI')}</p>
                <p className="text-xs text-gray-400">{t('pa.personalAIDesc')}</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => handleInviteType("social")}
            className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            data-testid="button-social-share"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t('pa.socialShare')}</p>
                <p className="text-xs text-gray-400">{t('pa.socialShareDesc')}</p>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  if (screen === "detail" && selectedWebinar) {
    const relatedEvents = eventDetails.filter((e) => {
      return e.title === selectedWebinar.title || selectedWebinar.id === e.id;
    });

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">
              {selectedWebinar.typeBadge}
            </span>
            {selectedWebinar.language && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Globe className="w-2.5 h-2.5" /> {selectedWebinar.language.toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">{selectedWebinar.title}</h2>
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {selectedWebinar.date}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedWebinar.time}</span>
          </div>
          {selectedWebinar.speaker && (
            <div className="flex items-center gap-2">
              {selectedWebinar.speakerPhoto ? (
                <img src={selectedWebinar.speakerPhoto} alt={selectedWebinar.speaker} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                </div>
              )}
              <span className="text-sm text-gray-600">{selectedWebinar.speaker}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <Send className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{selectedWebinar.invitesSent}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium">{t('pa.sent')}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <UserCheck className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{selectedWebinar.registeredCount}</p>
            <p className="text-[10px] text-gray-400 uppercase font-medium">{t('pa.registered')}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-5">
          <button
            onClick={handleStartInvite}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors"
            data-testid="button-send-invite"
          >
            {t('pa.socialShare')}
          </button>
          <button
            onClick={() => { setQualifyStarted(false); setProspectForm({ name: "", type: "Neutral", note: "" }); setPersonalInviteResult(null); setScreen("personal-form"); }}
            className="flex-1 py-3 rounded-xl bg-white border border-blue-200 text-sm font-semibold text-blue-600 active:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
            data-testid="button-personal-ai-invite"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('pa.personalAI')}
          </button>
        </div>

        {(() => {
          const eventPI = personalInvites.filter((pi) => pi.scheduleEventId === selectedWebinar.id);
          if (eventPI.length === 0) return null;
          return (
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('pa.personalInvitesSent')}</h3>
              <div className="space-y-2">
                {eventPI.map((pi) => (
                  <div
                    key={pi.id}
                    className="bg-white rounded-xl p-3.5 flex items-center justify-between"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    data-testid={`personal-invite-${pi.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{pi.prospectName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">
                          {new Date(pi.createdAt).toLocaleDateString("de-DE")}
                        </span>
                        {pi.discType && (
                          <span className="text-[10px] text-gray-400 font-mono">DISC: {pi.discType}</span>
                        )}
                        {pi.reminderPreference && pi.reminderPreference !== "none" && (
                          <span className={`inline-flex items-center gap-0.5 text-[10px] ${pi.reminderSent ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <Bell className="w-2.5 h-2.5" />
                            {pi.reminderSent ? '✓' : (pi.reminderPreference === '1_hour' ? '1h' : '15m')}
                          </span>
                        )}
                      </div>
                    </div>
                    {pi.registeredAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold flex-shrink-0">
                        <UserCheck className="w-3 h-3" /> {t('pa.registered')}
                      </span>
                    ) : pi.viewedAt ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold flex-shrink-0">
                        <Eye className="w-3 h-3" /> {t('pa.viewed')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex-shrink-0">
                        <Send className="w-3 h-3" /> {t('pa.sent')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {relatedEvents.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('pa.invites')}</h3>
            <div className="space-y-2">
              {relatedEvents.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => loadEventReport(ev.id)}
                  className="w-full bg-white rounded-xl p-4 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  data-testid={`detail-event-${ev.id}`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 font-mono truncate">{ev.inviteCode}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500"><span className="font-semibold text-gray-700">{ev.registeredCount}</span> {t('pa.registered')}</span>
                      <span className="text-xs text-gray-500"><span className="font-semibold text-emerald-600">{ev.attendedCount}</span> {t('pa.attended')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {eventReport && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('pa.guestList')}</h3>
            <div className="space-y-2">
              {eventReport.guests.map((g, i) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-xl p-4"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  data-testid={`guest-detail-${g.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{g.name}</p>
                    {g.attended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                        ✓ {t('pa.attended')}
                      </span>
                    ) : g.clickedZoom ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">{t('pa.clicked')}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">{t('pa.noShow')}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400">{g.email}</p>
                  {g.attended && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-500">⏱ {g.durationMinutes} min</span>
                        {g.questionsAsked > 0 && <span className="text-[11px] text-gray-500">💬 {g.questionsAsked} {t('pa.questionsAsked')}</span>}
                      </div>
                      {g.questionTexts && g.questionTexts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {g.questionTexts.map((q, qi) => (
                            <div key={qi} className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                              <p className="text-[11px] text-gray-600">"{q}"</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
              {eventReport.guests.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">{t('pa.noGuests')}</p>
              )}
            </div>
          </motion.div>
        )}

        {reportLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-28">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{t('pa.upcomingMeetings')}</h2>

      {webinars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t('pa.noMeetings')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webinars.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`webinar-card-${w.id}`}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">
                  {w.typeBadge}
                </span>
                {w.language && (
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <Globe className="w-2.5 h-2.5" /> {w.language.toUpperCase()}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-semibold text-gray-900 mb-2">{w.title}</h3>

              <div className="flex items-center gap-3 mb-3">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" /> {w.date}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {w.time}
                </span>
              </div>

              {w.speaker && (
                <div className="flex items-center gap-2 mb-3">
                  {w.speakerPhoto ? (
                    <img src={w.speakerPhoto} alt={w.speaker} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                  <span className="text-xs text-gray-500">{w.speaker}</span>
                </div>
              )}

              <div className="flex items-center gap-4 mb-4 py-2 px-3 rounded-lg bg-gray-50">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Send className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold text-gray-700">{w.invitesSent}</span> {t('pa.sent')}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-gray-700">{w.registeredCount}</span> {t('pa.registered')}
                </span>
              </div>

              <button
                onClick={() => handleSelectWebinar(w)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 transition-colors"
                data-testid={`invite-webinar-${w.id}`}
              >
                {t('pa.viewInvite')}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {personalInvites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('pa.personalInvitesSent')}</h3>
          <div className="space-y-2">
            {personalInvites.map((pi) => (
              <motion.div
                key={pi.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-3.5"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                data-testid={`sent-invite-${pi.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0">{pi.prospectName}</p>
                  {pi.registeredAt ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold flex-shrink-0 ml-2">
                      <UserCheck className="w-3 h-3" /> {t('pa.registered')}
                    </span>
                  ) : pi.viewedAt ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold flex-shrink-0 ml-2">
                      <Eye className="w-3 h-3" /> {t('pa.viewed')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold flex-shrink-0 ml-2">
                      <Send className="w-3 h-3" /> {t('pa.sent')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  {pi.eventTitle && (
                    <span className="truncate max-w-[60%]">{pi.eventTitle}</span>
                  )}
                  <span>{new Date(pi.createdAt).toLocaleDateString("de-DE")}</span>
                  {pi.discType && <span className="font-mono">DISC: {pi.discType}</span>}
                  {pi.reminderPreference && pi.reminderPreference !== "none" && (
                    <span className={`inline-flex items-center gap-0.5 ${pi.reminderSent ? 'text-emerald-500' : 'text-amber-500'}`}>
                      <Bell className="w-2.5 h-2.5" />
                      {pi.reminderSent ? '✓' : (pi.reminderPreference === '1_hour' ? '1h' : '15m')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
