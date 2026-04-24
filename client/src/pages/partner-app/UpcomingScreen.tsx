import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, Globe, Loader2, ChevronLeft,
  Send, Copy, Check, Share2, MessageCircle, Phone, Bell,
  Mail, Link2, Users, UserCheck, Sparkles, Video,
  ChevronRight, User, Eye, Star
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

interface Webinar {
  id: number; title: string; date: string; time: string; timezone: string;
  speaker: string; speakerPhoto: string | null; type: string; typeBadge: string;
  highlights: string[]; language: string;
  invitesSent: number; registeredCount: number;
  inviteEventIds?: number[];
}

interface ReportGuest {
  id: number; name: string; email: string;
  goClickedAt: string | null; clickedZoom: boolean;
  attended: boolean; registeredAt: string;
  sourceType: "social" | "personal";
}

interface DetailReport {
  guests: ReportGuest[];
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number };
  inviteCode?: string;
}

interface InviteResult {
  inviteCode: string; inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

interface PersonalInviteResult {
  inviteCode: string; inviteUrl: string;
  event: { title: string; date: string; time: string; speaker: string };
}

interface EventPersonalInvite {
  id: number;
  prospectName: string;
  guestName: string | null;
  guestTelegram: string | null;
  status: "sent" | "viewed" | "chatted" | "registered";
  viewedAt: string | null;
  registeredAt: string | null;
  goClickedAt: string | null;
  createdAt: string;
  inviteCode: string;
}

interface EventPersonalInviteStats {
  total: number;
  sent: number;
  viewed: number;
  registered: number;
}

const qualifyQuestionsEn = [
  { step: 1, multiSelect: true, aiText: "To create a strong personal invitation, I need to understand this person.\n\nWho is this person to you?", options: [{ label: "Friend / warm contact", value: "friend" }, { label: "Business contact", value: "business_contact" }, { label: "MLM Leader", value: "mlm_leader" }, { label: "Investor type", value: "investor" }, { label: "Entrepreneur", value: "entrepreneur" }, { label: "Cold contact", value: "cold_contact" }] },
  { step: 2, multiSelect: true, aiText: "What motivates this person most?", options: [{ label: "Money / Results", value: "money_results" }, { label: "Business growth", value: "business_growth" }, { label: "Technology / Innovation", value: "technology_innovation" }, { label: "Community / People", value: "community_people" }, { label: "Learning / Curiosity", value: "learning_curiosity" }] },
  { step: 3, multiSelect: true, aiText: "How does this person usually react to new opportunities?", options: [{ label: "Quick decision", value: "fast_decision" }, { label: "Analytical / many questions", value: "analytical" }, { label: "Skeptical", value: "skeptical" }, { label: "Needs trust first", value: "needs_trust" }] },
  { step: 4, multiSelect: false, aiText: "Anything else important I should know? (optional)", options: null },
];
const qualifyQuestionsDe = [
  { step: 1, multiSelect: true, aiText: "Um eine starke Einladung zu erstellen, muss ich die Person verstehen.\n\nWer ist diese Person für dich?", options: [{ label: "Freund / warmer Kontakt", value: "friend" }, { label: "Geschäftskontakt", value: "business_contact" }, { label: "MLM Leader", value: "mlm_leader" }, { label: "Investor-Typ", value: "investor" }, { label: "Unternehmer", value: "entrepreneur" }, { label: "Kalter Kontakt", value: "cold_contact" }] },
  { step: 2, multiSelect: true, aiText: "Was motiviert diese Person am meisten?", options: [{ label: "Geld / Ergebnisse", value: "money_results" }, { label: "Business-Wachstum", value: "business_growth" }, { label: "Technologie / Innovation", value: "technology_innovation" }, { label: "Community / Menschen", value: "community_people" }, { label: "Lernen / Neugier", value: "learning_curiosity" }] },
  { step: 3, multiSelect: true, aiText: "Wie reagiert diese Person auf neue Möglichkeiten?", options: [{ label: "Schnelle Entscheidung", value: "fast_decision" }, { label: "Analytisch / viele Fragen", value: "analytical" }, { label: "Skeptisch", value: "skeptical" }, { label: "Braucht erst Vertrauen", value: "needs_trust" }] },
  { step: 4, multiSelect: false, aiText: "Gibt es noch etwas Wichtiges? (optional)", options: null },
];
const qualifyQuestionsRu = [
  { step: 1, multiSelect: true, aiText: "Чтобы создать сильное приглашение, мне нужно понять этого человека.\n\nКто этот человек для вас?", options: [{ label: "Друг / тёплый контакт", value: "friend" }, { label: "Деловой контакт", value: "business_contact" }, { label: "MLM Лидер", value: "mlm_leader" }, { label: "Инвестор", value: "investor" }, { label: "Предприниматель", value: "entrepreneur" }, { label: "Холодный контакт", value: "cold_contact" }] },
  { step: 2, multiSelect: true, aiText: "Что больше всего мотивирует этого человека?", options: [{ label: "Деньги / Результаты", value: "money_results" }, { label: "Рост бизнеса", value: "business_growth" }, { label: "Технологии / Инновации", value: "technology_innovation" }, { label: "Сообщество / Люди", value: "community_people" }, { label: "Обучение / Любопытство", value: "learning_curiosity" }] },
  { step: 3, multiSelect: true, aiText: "Как этот человек реагирует на новые возможности?", options: [{ label: "Быстрое решение", value: "fast_decision" }, { label: "Аналитик / много вопросов", value: "analytical" }, { label: "Скептик", value: "skeptical" }, { label: "Сначала нужно доверие", value: "needs_trust" }] },
  { step: 4, multiSelect: false, aiText: "Есть ли что-то ещё важное? (необязательно)", options: null },
];

type Screen = "list" | "detail" | "invite-type" | "personal-form" | "personal-qualify" | "personal-preview" | "personal-share" | "invite-preview" | "social-share";

function isUpcoming(dateStr: string, timeStr: string): boolean {
  try {
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      const dt = new Date(`${isoDate}T${timeStr || "00:00"}:00`);
      return dt > new Date();
    }
    const dt = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
    return dt > new Date();
  } catch { return true; }
}

export default function UpcomingScreen({ telegramId }: { telegramId: string }) {
  const { t, language } = useLanguage();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [selected, setSelected] = useState<Webinar | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [personalResult, setPersonalResult] = useState<PersonalInviteResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prospectName, setProspectName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [qualifyStep, setQualifyStep] = useState(0);
  const [qualifyMessages, setQualifyMessages] = useState<Array<{ role: string; content: string; options?: any; multiSelect?: boolean }>>([]);
  const [qualifyAnswers, setQualifyAnswers] = useState({ relationship: "", motivation: "", reaction: "", contextNote: "" });
  const [multiSelectVals, setMultiSelectVals] = useState<Array<{ value: string; label: string }>>([]);
  const [contextInput, setContextInput] = useState("");
  const [generatedPreview, setGeneratedPreview] = useState<{ messages: string[]; strategy: string; discType: string; prospectType: string; quickReplies: string[]; motivation: string; reaction: string } | null>(null);
  const [generatingMsgs, setGeneratingMsgs] = useState(false);
  const [personalCreating, setPersonalCreating] = useState(false);
  const [detailReport, setDetailReport] = useState<DetailReport | null>(null);
  const [detailReportLoading, setDetailReportLoading] = useState(false);
  const [eventPersonalInvites, setEventPersonalInvites] = useState<EventPersonalInvite[]>([]);
  const [eventPersonalInviteStats, setEventPersonalInviteStats] = useState<EventPersonalInviteStats | null>(null);
  const [eventPersonalInvitesLoading, setEventPersonalInvitesLoading] = useState(false);
  const [copiedInviteId, setCopiedInviteId] = useState<number | null>(null);

  const QUALIFY = language === "de" ? qualifyQuestionsDe : language === "ru" ? qualifyQuestionsRu : qualifyQuestionsEn;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/partner-app/webinars?lang=${language}`, { headers: { ...getPartnerAuthHeader() } }).then(r => r.json()),
      fetch("/api/partner-app/profile", { headers: { ...getPartnerAuthHeader() } }).then(r => r.json()).catch(() => null),
    ]).then(([webinarData, profileData]) => {
      const upcoming = (webinarData || []).filter((w: Webinar) => isUpcoming(w.date, w.time));
      setWebinars(upcoming);
      if (profileData?.partner?.name) setPartnerName(profileData.partner.name);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [telegramId, language]);

  useEffect(() => {
    if (screen !== "detail" || !selected) { setDetailReport(null); return; }
    const eventIds: number[] = selected.inviteEventIds || [];
    setDetailReportLoading(true);
    Promise.all([
      eventIds.length > 0
        ? Promise.all(
            eventIds.map(id =>
              fetch(`/api/partner-app/events/${id}/report`, { headers: { ...getPartnerAuthHeader() } })
                .then(r => r.json() as Promise<{ event: { inviteCode: string }; guests: ReportGuest[]; funnel: DetailReport["funnel"] }>)
                .catch(() => null)
            )
          )
        : Promise.resolve([]),
      fetch(`/api/partner-app/personal-invites`, { headers: { ...getPartnerAuthHeader() } })
        .then(r => r.json() as Promise<{ invites: Array<{ id: number; prospectName: string; guestName: string | null; guestEmail: string | null; goClickedAt: string | null; registeredAt: string | null; scheduleEventId: number | null }> }>)
        .catch(() => null),
    ]).then(([eventReports, personalData]) => {
      const validReports = (eventReports as Array<{ event: { inviteCode: string }; guests: ReportGuest[]; funnel: DetailReport["funnel"] } | null>)
        .filter((r): r is { event: { inviteCode: string }; guests: ReportGuest[]; funnel: DetailReport["funnel"] } => r !== null);
      const firstInviteCode = validReports[0]?.event?.inviteCode;
      const socialGuests: ReportGuest[] = validReports.flatMap(r =>
        (r.guests || []).map(g => ({ ...g, sourceType: "social" as const }))
      );
      const funnel = validReports.reduce<DetailReport["funnel"]>((acc, r) => {
        if (r.funnel) {
          acc.invited += r.funnel.invited || 0;
          acc.registered += r.funnel.registered || r.funnel.invited || 0;
          acc.clickedZoom += r.funnel.clickedZoom || 0;
          acc.attended += r.funnel.attended || 0;
        }
        return acc;
      }, { invited: 0, registered: 0, clickedZoom: 0, attended: 0 });

      const scheduleId = selected.id;
      const personalGuests: ReportGuest[] = (personalData?.invites || [])
        .filter(pi => pi.scheduleEventId === scheduleId && (pi.registeredAt || pi.goClickedAt))
        .map(pi => ({
          id: -(pi.id),
          name: pi.guestName || pi.prospectName,
          email: pi.guestEmail || "",
          goClickedAt: pi.goClickedAt,
          clickedZoom: false,
          attended: false,
          registeredAt: pi.registeredAt || "",
          sourceType: "personal" as const,
        }));

      const socialEmails = new Set(socialGuests.map(g => g.email.toLowerCase()));
      const uniquePersonalGuests = personalGuests.filter(g => !socialEmails.has(g.email.toLowerCase()));
      funnel.invited += uniquePersonalGuests.length;
      funnel.registered += uniquePersonalGuests.filter(g => g.registeredAt).length;
      funnel.clickedZoom += uniquePersonalGuests.filter(g => g.goClickedAt).length;

      setDetailReport({ guests: [...socialGuests, ...uniquePersonalGuests], funnel, inviteCode: firstInviteCode });
    }).finally(() => setDetailReportLoading(false));
  }, [screen, selected]);

  useEffect(() => {
    if (screen !== "detail" || !selected) { setEventPersonalInvites([]); setEventPersonalInviteStats(null); return; }
    setEventPersonalInvitesLoading(true);
    fetch(`/api/partner-app/events/${selected.id}/personal-invites`, { headers: { ...getPartnerAuthHeader() } })
      .then(r => r.json())
      .then(data => {
        setEventPersonalInvites(data?.invites || []);
        setEventPersonalInviteStats(data?.stats ?? null);
      })
      .catch(() => { setEventPersonalInvites([]); setEventPersonalInviteStats(null); })
      .finally(() => setEventPersonalInvitesLoading(false));
  }, [screen, selected]);

  const createSocialInvite = async (): Promise<InviteResult | null> => {
    if (!selected || creating) return null;
    setCreating(true);
    try {
      const res = await fetch("/api/partner-app/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ scheduleEventId: selected.id }),
      });
      const data: InviteResult = await res.json();
      setInviteResult(data);
      setCreating(false);
      return data;
    } catch {}
    setCreating(false);
    return null;
  };

  const getFullUrl = () => `${window.location.origin}${inviteResult?.inviteUrl || ""}`;
  const getPersonalUrl = () => `${window.location.origin}${personalResult?.inviteUrl || ""}`;

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || getFullUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string, url: string, message?: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedMsg = encodeURIComponent(message || url);
    const tg = (window as any).Telegram?.WebApp;
    switch (platform) {
      case "telegram":
        if (tg?.openTelegramLink) tg.openTelegramLink(`https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`);
        else window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedMsg}`, "_blank");
        break;
      case "whatsapp": window.open(`https://wa.me/?text=${encodedMsg}`, "_blank"); break;
      case "email": window.open(`mailto:?subject=${encodeURIComponent(selected?.title || "")}&body=${encodedMsg}`, "_blank"); break;
    }
  };

  const startPersonalQualify = () => {
    setQualifyStep(0);
    setQualifyAnswers({ relationship: "", motivation: "", reaction: "", contextNote: "" });
    setContextInput("");
    setGeneratedPreview(null);
    setMultiSelectVals([]);
    const first = QUALIFY[0];
    setQualifyMessages([{ role: "assistant", content: first.aiText, options: first.options, multiSelect: first.multiSelect }]);
    setScreen("personal-qualify");
  };

  const toggleMulti = (value: string, label: string) => {
    setMultiSelectVals(prev => prev.find(v => v.value === value) ? prev.filter(v => v.value !== value) : [...prev, { value, label }]);
  };

  const confirmMulti = async () => {
    if (multiSelectVals.length === 0) return;
    const val = multiSelectVals.map(v => v.value).join(",");
    const lbl = multiSelectVals.map(v => v.label).join(", ");
    setMultiSelectVals([]);
    await handleQualifyAnswer(val, lbl);
  };

  const handleQualifyAnswer = async (value: string, label: string) => {
    const step = qualifyStep;
    const msgs = [...qualifyMessages, { role: "user", content: label }];
    const ans = { ...qualifyAnswers };
    if (step === 0) ans.relationship = value;
    else if (step === 1) ans.motivation = value;
    else if (step === 2) ans.reaction = value;
    else if (step === 3) ans.contextNote = value;
    setQualifyAnswers(ans);
    const next = step + 1;
    if (next < QUALIFY.length) {
      const q = QUALIFY[next];
      msgs.push({ role: "assistant", content: q.aiText, options: q.options, multiSelect: q.multiSelect });
      setQualifyMessages(msgs);
      setQualifyStep(next);
    } else {
      const genMsg = language === "de" ? "Generiere deine personalisierte Einladung..." : language === "ru" ? "Генерирую персональное приглашение..." : "Generating your personalized invitation...";
      msgs.push({ role: "assistant", content: genMsg });
      setQualifyMessages(msgs);
      setQualifyStep(next);
      await generatePreview(ans);
    }
  };

  const generatePreview = async (ans: typeof qualifyAnswers) => {
    if (!selected) return;
    setGeneratingMsgs(true);
    try {
      const res = await fetch("/api/partner-app/generate-invite-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ scheduleEventId: selected.id, prospectName, partnerName, relationship: ans.relationship, motivation: ans.motivation, reaction: ans.reaction, contextNote: ans.contextNote, language }),
      });
      if (!res.ok) throw new Error();
      setGeneratedPreview(await res.json());
      setScreen("personal-preview");
    } catch {
      alert(language === "de" ? "Fehler. Bitte erneut versuchen." : language === "ru" ? "Ошибка. Попробуйте снова." : "Error. Please try again.");
    }
    setGeneratingMsgs(false);
  };

  const confirmPersonalInvite = async () => {
    if (!selected || !generatedPreview || personalCreating) return;
    setPersonalCreating(true);
    try {
      const res = await fetch("/api/partner-app/create-personal-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ scheduleEventId: selected.id, prospectName, prospectType: generatedPreview.prospectType, discType: generatedPreview.discType, motivationType: generatedPreview.motivation, reactionType: generatedPreview.reaction, inviteStrategy: generatedPreview.strategy, generatedMessages: JSON.stringify(generatedPreview.messages), prospectNote: qualifyAnswers.contextNote || undefined }),
      });
      if (!res.ok) throw new Error();
      setPersonalResult(await res.json());
      setScreen("personal-share");
    } catch {
      alert(language === "de" ? "Fehler. Bitte erneut versuchen." : language === "ru" ? "Ошибка. Попробуйте снова." : "Error. Please try again.");
    }
    setPersonalCreating(false);
  };

  const getStatusLabel = (status: EventPersonalInvite["status"]) => {
    switch (status) {
      case "registered": return t("pa.upcoming.statusRegistered");
      case "chatted": return t("pa.upcoming.statusChatted");
      case "viewed": return t("pa.upcoming.statusViewed");
      default: return t("pa.upcoming.statusSent");
    }
  };

  const getStatusBg = (status: EventPersonalInvite["status"]) => {
    switch (status) {
      case "registered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "chatted": return "bg-violet-50 text-violet-700 border-violet-200";
      case "viewed": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  const copyInviteLink = (inv: EventPersonalInvite) => {
    const url = `${window.location.origin}/personal-invite/${inv.inviteCode}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedInviteId(inv.id);
        setTimeout(() => setCopiedInviteId(null), 2000);
      }).catch(() => {
        fallbackCopy(url, inv.id);
      });
    } else {
      fallbackCopy(url, inv.id);
    }
  };

  const fallbackCopy = (text: string, invId: number) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); setCopiedInviteId(invId); setTimeout(() => setCopiedInviteId(null), 2000); } catch {}
    document.body.removeChild(ta);
  };

  const formatInviteDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(language === "de" ? "de-DE" : language === "ru" ? "ru-RU" : "en-GB", { day: "numeric", month: "short" });
    } catch { return ""; }
  };

  const handleFollowUp = (inv: EventPersonalInvite) => {
    if (!selected) return;
    const name = inv.guestName || inv.prospectName;
    const eventDate = selected.date;
    const eventTitle = selected.title;
    const msg = language === "ru"
      ? `Привет, ${name}! Хотел напомнить о вебинаре "${eventTitle}" — он состоится ${eventDate}. Ты уже зарегистрировался? 🙂`
      : language === "de"
      ? `Hey ${name}! Wollte dich kurz an das Webinar "${eventTitle}" am ${eventDate} erinnern. Hast du dich schon angemeldet? 🙂`
      : `Hey ${name}! Just a reminder about the webinar "${eventTitle}" on ${eventDate}. Have you registered yet? 🙂`;
    const tg = (window as any).Telegram?.WebApp;
    if (inv.guestTelegram) {
      const username = inv.guestTelegram.replace("@", "");
      const url = `https://t.me/${username}`;
      if (tg?.openTelegramLink) tg.openTelegramLink(url);
      else window.open(url, "_blank");
    } else {
      const encoded = encodeURIComponent(msg);
      const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encoded}`;
      if (tg?.openTelegramLink) tg.openTelegramLink(url);
      else window.open(url, "_blank");
    }
  };

  const goBack = () => {
    switch (screen) {
      case "invite-preview": setScreen("personal-share"); break;
      case "personal-share": setScreen("list"); break;
      case "personal-preview": setScreen("personal-qualify"); break;
      case "personal-qualify": setScreen("personal-form"); break;
      case "personal-form": setScreen("invite-type"); break;
      case "social-share": setScreen("invite-type"); break;
      case "invite-type": setScreen("detail"); break;
      case "detail": setScreen("list"); break;
      default: setScreen("list");
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  if (screen === "social-share") {
    if (creating || !inviteResult) {
      return (
        <div className="h-full flex flex-col items-center justify-center px-6">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-3" />
          <p className="text-sm text-gray-400">{t("pa.upcoming.creatingLink")}</p>
        </div>
      );
    }
    const url = getFullUrl();
    const msg = `${selected?.title}\n📅 ${selected?.date} ${selected?.time}\n🎤 ${selected?.speaker}\n\n${url}`;
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <h2 className="text-base font-bold text-gray-900 mb-4">{t("pa.socialShareTitle")}</h2>
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{t("pa.yourLink")}</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono" data-testid="text-invite-url">{url}</p>
            <button onClick={() => handleCopy(url)} className="p-1.5 rounded-lg bg-white" data-testid="button-copy-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{t("pa.sendVia")}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "telegram", label: "Telegram", bg: "bg-blue-500", icon: Send },
              { id: "whatsapp", label: "WhatsApp", bg: "bg-green-500", icon: MessageCircle },
              { id: "email", label: "Email", bg: "bg-gray-600", icon: Mail },
            ].map(ch => (
              <button key={ch.id} onClick={() => shareVia(ch.id, url, msg)} className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl ${ch.bg} text-white active:opacity-80 transition-opacity`} data-testid={`share-${ch.id}`}>
                <ch.icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold">{ch.label}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => handleCopy(msg)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 active:bg-gray-50" data-testid="button-copy-message">
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          {t("pa.copyMessageLink")}
        </button>
      </div>
    );
  }

  if (screen === "personal-share") {
    const url = getPersonalUrl();
    const shareText = `${language === "de" ? "Hey" : language === "ru" ? "Привет" : "Hey"} ${prospectName}! ${language === "de" ? "Ich habe eine persönliche Einladung für dich:" : language === "ru" ? "Я подготовил специальное приглашение для тебя:" : "I have a special invitation for you:"}\n${url}`;
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-4 text-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">{t("pa.inviteCreated")}</h2>
          <p className="text-xs text-gray-500">{t("pa.aiWillInvite")} {prospectName}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 mb-4 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 leading-relaxed">
            {t("pa.aiWillUseMessages")} {prospectName} {t("pa.opensLink")}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">{t("pa.personalLink")}</p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50">
            <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <p className="text-xs text-gray-600 truncate flex-1 font-mono" data-testid="text-personal-invite-url">{url}</p>
            <button onClick={() => handleCopy(url)} className="p-1.5 rounded-lg bg-white" data-testid="button-copy-personal-link">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">{t("pa.sendVia")}</p>
        <div className="space-y-2 mb-4">
          {[
            { id: "telegram", label: "Telegram", bg: "bg-blue-500", icon: Send },
            { id: "whatsapp", label: "WhatsApp", bg: "bg-green-500", icon: MessageCircle },
            { id: "email", label: "Email", bg: "bg-gray-600", icon: Mail },
          ].map(ch => (
            <button key={ch.id} onClick={() => shareVia(ch.id, url, shareText)} className={`w-full flex items-center gap-2.5 py-3.5 px-4 rounded-xl ${ch.bg} text-white active:opacity-80`} data-testid={`share-personal-${ch.id}`}>
              <ch.icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{ch.label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => handleCopy(shareText)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 active:bg-gray-50 mb-3" data-testid="button-copy-personal-message">
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          {copied ? t("pa.copied") : t("pa.copyMessageLink")}
        </button>
        {generatedPreview && (
          <button onClick={() => setScreen("invite-preview")} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700 active:bg-blue-100 mb-4" data-testid="button-preview-invite">
            <Eye className="w-4 h-4 text-blue-600" />
            {t("pa.preview.title")}
          </button>
        )}
        <button onClick={() => setScreen("list")} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gray-900 text-white text-sm font-semibold active:opacity-80" data-testid="button-done-back-to-list">
          {language === "de" ? "Fertig — zurück zur Liste" : language === "ru" ? "Готово — к списку вебинаров" : "Done — back to webinars"}
        </button>
      </div>
    );
  }

  if (screen === "invite-preview" && selected && generatedPreview) {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">{t("pa.preview.title")}</h2>
        </div>
        <div className="bg-[#F5F5F7] rounded-2xl overflow-hidden mb-4" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-gray-900 truncate">{selected.title}</p>
              <p className="text-[10px] text-gray-400">{t("pa.preview.chatPreview")}</p>
            </div>
          </div>
          <div className="px-4 py-4 space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
            {generatedPreview.messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md bg-white text-sm text-gray-700 leading-relaxed" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <p className="whitespace-pre-wrap" data-testid={`preview-chat-msg-${i}`}>{msg}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {generatedPreview.quickReplies.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {generatedPreview.quickReplies.map(qr => (
                  <span key={qr} className="px-3 py-1.5 rounded-full bg-white border border-blue-200 text-xs font-medium text-blue-600">{qr}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mb-4">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-3">{t("pa.preview.eventDetails")}</p>
          <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-sm font-semibold text-gray-900 mb-2">{selected.title}</p>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" /> {selected.date}</span>
              <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {selected.time}</span>
            </div>
            {selected.speaker && (
              <div className="flex items-center gap-2">
                {selected.speakerPhoto ? <img src={selected.speakerPhoto} alt={selected.speaker} className="w-6 h-6 rounded-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"><User className="w-3 h-3 text-gray-400" /></div>}
                <span className="text-xs text-gray-500">{selected.speaker}</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setScreen("personal-share")} className="w-full py-3.5 rounded-xl bg-blue-600 text-sm font-semibold text-white active:bg-blue-700 flex items-center justify-center gap-2" data-testid="button-back-to-share">
          <Share2 className="w-4 h-4" /> {t("pa.shareLink")}
        </button>
      </div>
    );
  }

  if (screen === "personal-preview" && generatedPreview) {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-4 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <h2 className="text-base font-bold text-gray-900 mb-1">{t("pa.upcoming.previewTitle")}</h2>
        <p className="text-xs text-gray-400 mb-4">{t("pa.upcoming.previewSubtitle")}</p>
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">{t("pa.upcoming.strategy")}</p>
          <p className="text-xs text-gray-600 leading-relaxed">{generatedPreview.strategy}</p>
        </div>
        <div className="space-y-2 mb-5">
          {generatedPreview.messages.map((msg, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap" data-testid={`preview-msg-${i}`}>{msg}</p>
            </div>
          ))}
        </div>
        <button
          onClick={confirmPersonalInvite}
          disabled={personalCreating}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          data-testid="button-confirm-personal-invite"
        >
          {personalCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> {t("pa.upcoming.sendInvite")}</>}
        </button>
      </div>
    );
  }

  if (screen === "personal-qualify") {
    const currentQ = QUALIFY[qualifyStep];
    const isLastStep = qualifyStep >= QUALIFY.length;
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-4 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <div className="flex items-center gap-2 mb-4">
          {QUALIFY.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= qualifyStep ? "bg-blue-500" : "bg-gray-200"}`} />
          ))}
        </div>
        <div className="space-y-3 mb-4">
          {qualifyMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}`} style={msg.role === "assistant" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" } : {}}>
                {msg.content}
              </div>
            </div>
          ))}
          {generatingMsgs && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            </div>
          )}
        </div>
        {!isLastStep && !generatingMsgs && currentQ && (
          currentQ.multiSelect && currentQ.options ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-3">
                {currentQ.options.map(opt => (
                  <button key={opt.value} onClick={() => toggleMulti(opt.value, opt.label)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${multiSelectVals.find(v => v.value === opt.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200"}`}
                    data-testid={`qualify-opt-${opt.value}`}
                  >{opt.label}</button>
                ))}
              </div>
              <button onClick={confirmMulti} disabled={multiSelectVals.length === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
                data-testid="button-qualify-confirm"
              >{t("pa.continue")} ({multiSelectVals.length} {t("pa.selected")})</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={contextInput} onChange={e => setContextInput(e.target.value)}
                placeholder={language === "de" ? "Optional..." : language === "ru" ? "Необязательно..." : "Optional..."}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="input-context"
              />
              <button onClick={async () => { const v = contextInput.trim() || (language === "de" ? "keine Infos" : language === "ru" ? "нет инфо" : "no info"); await handleQualifyAnswer(v, contextInput.trim() || (language === "de" ? "Übersprungen" : language === "ru" ? "Пропущено" : "Skipped")); setContextInput(""); }}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                data-testid="button-context-submit"
              >{t("pa.continue")}</button>
            </div>
          )
        )}
      </div>
    );
  }

  if (screen === "personal-form") {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-4 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">{t("pa.personalAI")}</h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{t("pa.personalAIDesc")}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-2"><User className="w-3.5 h-3.5" /> {t("pa.prospectName")}</label>
          <input value={prospectName} onChange={e => setProspectName(e.target.value)} placeholder={t("pa.prospectNamePlaceholder")} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" data-testid="input-prospect-name" />
        </div>
        <button onClick={startPersonalQualify} disabled={!prospectName.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
          data-testid="button-start-qualify"
        >
          <Sparkles className="w-4 h-4" /> {t("pa.startAI")}
        </button>
      </div>
    );
  }

  if (screen === "invite-type") {
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <h2 className="text-base font-bold text-gray-900 mb-1">{t("pa.inviteType")}</h2>
        <p className="text-xs text-gray-400 mb-5">{selected?.title}</p>
        <div className="space-y-3">
          <button onClick={() => setScreen("personal-form")} className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors border border-blue-100" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} data-testid="button-personal-ai-invite">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{t("pa.personalAI")}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t("pa.personalAIDesc")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
            </div>
          </button>
          <button onClick={async () => { setScreen("social-share"); await createSocialInvite(); }} className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} data-testid="button-social-invite">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{t("pa.socialShare")}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t("pa.socialShareDesc")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "detail" && selected) {
    const existingInviteCode = inviteResult?.inviteCode || detailReport?.inviteCode;
    const inviteUrl = existingInviteCode
      ? `${window.location.origin}/invite/${existingInviteCode}`
      : null;
    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={goBack} className="flex items-center gap-1 text-sm text-gray-500 mb-4 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <div className="bg-white rounded-2xl p-5 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h2 className="text-base font-bold text-gray-900 mb-1">{selected.title}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" /> {selected.date}</span>
            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> {selected.time}</span>
            {selected.language && <span className="flex items-center gap-1 text-xs text-gray-400"><Globe className="w-3 h-3" /> {selected.language}</span>}
          </div>
          {selected.speaker && <p className="text-xs text-gray-500 mt-1.5">{selected.speaker}</p>}
        </div>
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">{t("pa.upcoming.preEventStats")}</p>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900" data-testid="stat-sent">{selected.invitesSent}</p>
              <p className="text-[10px] text-gray-400">{t("pa.sent")}</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600" data-testid="stat-registered">{selected.registeredCount}</p>
              <p className="text-[10px] text-gray-400">{t("pa.registered")}</p>
            </div>
            {detailReport && (
              <div className="text-center" data-testid="stat-clicked-link">
                <p className="text-xl font-bold text-emerald-600">{detailReport.funnel.clickedZoom}</p>
                <p className="text-[10px] text-gray-400">{t("pa.contacts.goLinkClicked")}</p>
              </div>
            )}
          </div>
        </div>
        {detailReport && detailReport.guests.length > 0 && (
          <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">{t("pa.upcoming.guestLinkStatus")}</p>
            <div className="space-y-2">
              {detailReport.guests.map((g) => (
                <div key={g.id} className="flex items-center justify-between gap-2" data-testid={`upcoming-guest-link-${g.id}`}>
                  <span className="flex items-center gap-1 min-w-0">
                    <span className="text-xs text-gray-700 truncate">{g.name}</span>
                    {g.sourceType === "personal" && (
                      <span className="flex-shrink-0 text-[9px] px-1 py-0.5 bg-violet-50 text-violet-500 rounded-full">{t("pa.upcoming.personal")}</span>
                    )}
                  </span>
                  {g.goClickedAt ? (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
                      <span>✅</span>
                      <span>{new Date(g.goClickedAt).toLocaleDateString(language === "de" ? "de-DE" : language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300">⏳ {t("pa.contacts.goLinkPending")}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {detailReportLoading && (
          <div className="flex justify-center py-2 mb-3">
            <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
          </div>
        )}
        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t("pa.upcoming.myInvites")}</p>
            <span className="text-[10px] text-gray-400">
              {eventPersonalInviteStats?.total ?? eventPersonalInvites.length} {t("pa.upcoming.personalCount")}
              {` · ${Math.max(0, selected.invitesSent - (eventPersonalInviteStats?.total ?? eventPersonalInvites.length))} ${t("pa.upcoming.socialCount")}`}
            </span>
          </div>
          {eventPersonalInvitesLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 text-gray-300 animate-spin" />
            </div>
          ) : eventPersonalInvites.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">{t("pa.upcoming.myInvitesEmpty")}</p>
          ) : (
            <div className="space-y-3">
              {eventPersonalInvites.map((inv) => (
                <div key={inv.id} className="border border-gray-100 rounded-xl p-3" data-testid={`personal-invite-card-${inv.id}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate" data-testid={`text-invite-name-${inv.id}`}>{inv.guestName || inv.prospectName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatInviteDate(inv.createdAt)}</p>
                    </div>
                    <span className={`flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${getStatusBg(inv.status)}`} data-testid={`status-badge-${inv.id}`}>
                      {getStatusLabel(inv.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex-1 min-w-0 bg-gray-50 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                      <Link2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <p className="text-[10px] text-gray-500 truncate" data-testid={`text-invite-url-${inv.id}`}>
                        {window.location.origin}/personal-invite/{inv.inviteCode}
                      </p>
                    </div>
                    <button
                      onClick={() => copyInviteLink(inv)}
                      className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${copiedInviteId === inv.id ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500 active:bg-gray-100"}`}
                      data-testid={`button-copy-invite-${inv.id}`}
                    >
                      {copiedInviteId === inv.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => handleFollowUp(inv)}
                    className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold active:bg-blue-100"
                    data-testid={`button-followup-${inv.id}`}
                  >
                    <Bell className="w-3 h-3" />
                    {t("pa.upcoming.followUp")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setScreen("invite-type")} className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold mb-3 active:bg-blue-700" data-testid="button-invite">
          <Send className="w-4 h-4" /> {t("pa.upcoming.invite")}
        </button>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={async () => {
            let url = inviteUrl;
            if (!url) { const r = await createSocialInvite(); url = r ? `${window.location.origin}${r.inviteUrl}` : null; }
            if (!url) return;
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.openLink) tg.openLink(url); else window.open(url, "_blank");
          }}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 active:bg-gray-50"
            data-testid="button-open-event"
          >
            <Video className="w-4 h-4 text-gray-400" /> {t("pa.upcoming.open")}
          </button>
          <button onClick={async () => {
            let url = inviteUrl;
            if (!url) { const r = await createSocialInvite(); url = r ? `${window.location.origin}${r.inviteUrl}` : null; }
            if (!url) return;
            navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000);
          }}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 active:bg-gray-50"
            data-testid="button-copy-event-link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
            {t("pa.upcoming.copyLink")}
          </button>
          <button onClick={async () => {
            let url = inviteUrl;
            if (!url) { const r = await createSocialInvite(); url = r ? `${window.location.origin}${r.inviteUrl}` : null; }
            if (!url) return;
            const tg = (window as any).Telegram?.WebApp;
            const encodedUrl = encodeURIComponent(url);
            if (tg?.openTelegramLink) tg.openTelegramLink(`https://t.me/share/url?url=${encodedUrl}`);
            else window.open(`https://t.me/share/url?url=${encodedUrl}`, "_blank");
          }}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 active:bg-gray-50"
            data-testid="button-share-telegram"
          >
            <Send className="w-4 h-4 text-[#0088cc]" /> Telegram
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">{t("pa.nav.upcoming")}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{t("pa.upcoming.subtitle")}</p>
      </div>
      {webinars.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t("pa.noMeetings")}</p>
          <p className="text-xs text-gray-400 mt-1">{t("pa.upcoming.noWebinarsHint")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webinars.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-4 active:bg-gray-50 transition-colors"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`upcoming-card-${w.id}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Video className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-0.5 leading-snug">{w.title}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="w-3 h-3" /> {w.date}</span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock className="w-3 h-3" /> {w.time}</span>
                    {w.language && <span className="flex items-center gap-1 text-[11px] text-gray-400"><Globe className="w-3 h-3" /> {w.language}</span>}
                  </div>
                  {w.speaker && <p className="text-[11px] text-gray-400 mt-0.5">{w.speaker}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 py-2.5 border-t border-gray-100 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Send className="w-3 h-3 text-blue-400" />
                  <span className="font-semibold text-gray-700">{w.invitesSent}</span> {t("pa.sent")}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span className="font-semibold text-gray-700">{w.registeredCount}</span> {t("pa.registered")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setSelected(w); setInviteResult(null); setPersonalResult(null); setScreen("invite-type"); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold active:bg-blue-700"
                  data-testid={`button-invite-${w.id}`}
                >
                  <Send className="w-3.5 h-3.5" /> {t("pa.upcoming.invite")}
                </button>
                <button onClick={() => { setSelected(w); setInviteResult(null); setPersonalResult(null); setScreen("detail"); }}
                  className="flex items-center justify-center gap-1.5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold active:bg-gray-50"
                  data-testid={`button-open-${w.id}`}
                >
                  <ChevronRight className="w-3.5 h-3.5" /> {t("pa.upcoming.open")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
