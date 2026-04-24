import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Loader2, UserCheck, Send, Bot, ChevronRight,
  Calendar, Mail, Phone, Filter, Clock, Star, MessageCircle,
  Copy, Check, X
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

type ContactStatus = "all" | "invited" | "registered" | "attended" | "no-show" | "follow-up";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: ContactStatus;
  webinarTitle: string;
  webinarDate: string;
  sourceType: "personal" | "social";
  attended: boolean;
  clickedZoom: boolean;
  goClickedAt?: string | null;
  registeredAt: string;
  durationMinutes: number | null;
  questionsAsked: number | null;
  isWalkIn?: boolean;
  guestTelegram?: string | null;
  reminderChannel?: string | null;
  hasChat?: boolean;
  telegramNotificationsEnabled?: boolean;
}

interface PartnerEvent {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number;
  guestCount: number; clickedCount: number; invitesSent: number;
  inviteEventIds?: number[];
}

interface Guest {
  id: number; name: string; email: string; phone: string | null;
  registeredAt: string; clickedZoom: boolean; goClickedAt?: string | null; attended: boolean;
  durationMinutes: number | null; questionsAsked: number | null;
  isWalkIn?: boolean;
  guestTelegram?: string | null;
  reminderChannel?: string | null;
  hasChat?: boolean;
  telegramNotificationsEnabled?: boolean;
}

function getContactStatus(g: Guest): ContactStatus {
  if (g.attended) return "attended";
  if (g.clickedZoom) return "registered";
  if (g.registeredAt) return "registered";
  return "invited";
}

const STATUS_FILTERS: { id: ContactStatus; labelKey: string; color: string; bg: string }[] = [
  { id: "all", labelKey: "pa.contacts.all", color: "text-gray-700", bg: "bg-gray-100" },
  { id: "attended", labelKey: "pa.contacts.attended", color: "text-emerald-700", bg: "bg-emerald-50" },
  { id: "registered", labelKey: "pa.contacts.registered", color: "text-blue-700", bg: "bg-blue-50" },
  { id: "no-show", labelKey: "pa.contacts.noShow", color: "text-amber-700", bg: "bg-amber-50" },
  { id: "follow-up", labelKey: "pa.contacts.followUp", color: "text-orange-700", bg: "bg-orange-50" },
];

function ReminderChannelIcon({ channel }: { channel: string }) {
  if (channel === "telegram") return <span className="text-[10px]">✈️</span>;
  if (channel === "whatsapp") return <span className="text-[10px]">💬</span>;
  if (channel === "email") return <Mail className="w-3 h-3" />;
  return null;
}

export default function ContactsScreen({ telegramId }: { telegramId: string }) {
  const { t, language } = useLanguage();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ContactStatus>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [aiSheet, setAiSheet] = useState<{ contact: Contact } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const aiAbortRef = React.useRef<AbortController | null>(null);

  useEffect(() => {
    fetch("/api/partner-app/events", { headers: { ...getPartnerAuthHeader() } })
      .then(r => r.json())
      .then(async (events: PartnerEvent[]) => {
        const all: Contact[] = [];
        await Promise.all(
          events.map(async event => {
            try {
              const ids = event.inviteEventIds || [event.id];
              const reports = await Promise.all(
                ids.map(id => fetch(`/api/partner-app/events/${id}/report`, { headers: { ...getPartnerAuthHeader() } }).then(r => r.json()))
              );
              const guests: Guest[] = reports.flatMap((r: any) => r.guests || []);
              guests.forEach(g => {
                all.push({
                  id: g.id,
                  name: g.name,
                  email: g.email,
                  phone: g.phone,
                  status: getContactStatus(g),
                  webinarTitle: event.title,
                  webinarDate: event.eventDate,
                  sourceType: "social",
                  attended: g.attended,
                  clickedZoom: g.clickedZoom,
                  goClickedAt: g.goClickedAt,
                  registeredAt: g.registeredAt,
                  durationMinutes: g.durationMinutes,
                  questionsAsked: g.questionsAsked,
                  isWalkIn: g.isWalkIn,
                  guestTelegram: g.guestTelegram,
                  reminderChannel: g.reminderChannel,
                  hasChat: g.hasChat,
                  telegramNotificationsEnabled: g.telegramNotificationsEnabled,
                });
              });
            } catch {}
          })
        );
        const unique = Array.from(new Map(all.map(c => [c.id, c])).values());
        unique.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
        setContacts(unique);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [telegramId]);

  const filtered = useMemo(() => {
    let list = contacts;
    if (filter !== "all") {
      if (filter === "attended") list = list.filter(c => c.attended);
      else if (filter === "no-show") list = list.filter(c => !c.attended && c.registeredAt);
      else if (filter === "registered") list = list.filter(c => c.registeredAt && !c.attended);
      else if (filter === "follow-up") list = list.filter(c => !c.attended && c.registeredAt);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        c.webinarTitle.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, filter, search]);

  const statusBadge = (c: Contact) => {
    if (c.attended) return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-semibold">✓ {t("pa.attended")}</span>;
    if (c.clickedZoom) return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-semibold">{t("pa.clicked")}</span>;
    if (c.registeredAt) return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-semibold">{t("pa.registered")}</span>;
    if (c.hasChat) return <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[9px] font-semibold">💬 {t("pa.contacts.inChat")}</span>;
    return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[9px] font-semibold">{t("pa.invited")}</span>;
  };

  const nextAction = (c: Contact) => {
    if (!c.attended && c.registeredAt) return t("pa.contacts.actionFollowUp");
    if (c.attended && (c.questionsAsked ?? 0) > 0) return t("pa.contacts.actionEngaged");
    if (c.attended) return t("pa.contacts.actionInviteNext");
    return t("pa.contacts.actionResend");
  };

  const openAiFollowup = async (c: Contact) => {
    if (aiAbortRef.current) {
      aiAbortRef.current.abort();
    }
    const controller = new AbortController();
    aiAbortRef.current = controller;

    setAiSheet({ contact: c });
    setAiText(null);
    setAiLoading(true);
    setCopied(false);
    const promptByLang: Record<string, string> = {
      ru: `Напиши короткое follow-up сообщение для ${c.name}. ${c.attended ? `Гость присутствовал на вебинаре ${c.durationMinutes ? `(${c.durationMinutes} мин)` : ""}` : "Гость зарегистрировался, но не пришёл"}. ${c.questionsAsked ? `Задал ${c.questionsAsked} вопроса(ов).` : ""} Напиши текст для отправки в мессенджере.`,
      de: `Schreibe eine kurze Follow-up-Nachricht für ${c.name}. ${c.attended ? `Der Gast hat am Webinar teilgenommen ${c.durationMinutes ? `(${c.durationMinutes} min)` : ""}` : "Der Gast hat sich registriert, aber nicht teilgenommen"}. ${c.questionsAsked ? `Hat ${c.questionsAsked} Frage(n) gestellt.` : ""} Formuliere eine Messenger-Nachricht.`,
      en: `Write a short follow-up message for ${c.name}. ${c.attended ? `Guest attended the webinar ${c.durationMinutes ? `(${c.durationMinutes} min)` : ""}` : "Guest registered but did not attend"}. ${c.questionsAsked ? `Asked ${c.questionsAsked} question(s).` : ""} Write a messenger message.`,
    };
    const message = promptByLang[language] || promptByLang["en"];
    try {
      const res = await fetch("/api/partner-app/ai-followup", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({
          message,
          guestContext: {
            name: c.name,
            attended: c.attended,
            durationMinutes: c.durationMinutes,
            questionsAsked: c.questionsAsked,
          },
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setAiText(errData.error || null);
        return;
      }
      const data = await res.json();
      setAiText(data.reply || null);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setAiText(null);
      }
    } finally {
      if (aiAbortRef.current === controller) {
        setAiLoading(false);
      }
    }
  };

  const handleCopy = () => {
    if (aiText) {
      navigator.clipboard.writeText(aiText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{t("pa.nav.contacts")}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{t("pa.contacts.subtitle")}</p>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("pa.contacts.searchPlaceholder")}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          data-testid="input-contacts-search"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        {STATUS_FILTERS.map(sf => {
          const count = sf.id === "all" ? contacts.length : contacts.filter(c => {
            if (sf.id === "attended") return c.attended;
            if (sf.id === "no-show") return !c.attended && c.registeredAt;
            if (sf.id === "registered") return c.registeredAt && !c.attended;
            if (sf.id === "follow-up") return !c.attended && c.registeredAt;
            return true;
          }).length;
          return (
            <button
              key={sf.id}
              onClick={() => setFilter(sf.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === sf.id ? `${sf.bg} ${sf.color} ring-1 ring-current/20` : "bg-white text-gray-500 border border-gray-200"}`}
              data-testid={`filter-${sf.id}`}
            >
              {t(sf.labelKey)} <span className={`text-[10px] ${filter === sf.id ? "opacity-70" : "text-gray-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{search ? t("pa.contacts.noResults") : t("pa.contacts.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.div
              key={`${c.id}-${i}`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`contact-row-${c.id}`}
            >
              <button
                className="w-full p-4 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    {c.isWalkIn && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">Walk-in</span>}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{c.webinarTitle}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">{c.webinarDate}</p>
                </div>
                <div className="ml-2 flex-shrink-0 flex flex-col items-end gap-1">
                  {statusBadge(c)}
                  {c.attended && c.durationMinutes && (
                    <span className="text-[9px] text-gray-400">{c.durationMinutes}m</span>
                  )}
                </div>
              </button>
              {expandedId === c.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4 border-t border-gray-50">
                  <div className="pt-3 space-y-2">
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                      {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>}
                      {c.guestTelegram && (
                        <span className="flex items-center gap-1 text-blue-500" data-testid={`contact-telegram-${c.id}`}>
                          <span className="text-[12px]">✈️</span> @{c.guestTelegram.replace(/^@/, "")}
                        </span>
                      )}
                      {c.reminderChannel === "telegram" && (
                        <span
                          className={`flex items-center gap-1 text-[10px] font-medium ${c.telegramNotificationsEnabled ? "text-emerald-600" : "text-amber-500"}`}
                          data-testid={`contact-tg-status-${c.id}`}
                        >
                          <ReminderChannelIcon channel="telegram" />
                          {c.telegramNotificationsEnabled ? t("pa.contacts.tgSubscribed") : t("pa.contacts.tgNotSubscribed")}
                        </span>
                      )}
                      {c.reminderChannel === "whatsapp" && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-medium text-emerald-600"
                          data-testid={`contact-channel-${c.id}`}
                        >
                          <ReminderChannelIcon channel="whatsapp" />
                          {t("pa.contacts.channelWhatsapp")}
                        </span>
                      )}
                      {(c.reminderChannel === "email" || !c.reminderChannel) && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-medium text-blue-500"
                          data-testid={`contact-channel-${c.id}`}
                        >
                          <Mail className="w-3 h-3" />
                          {t("pa.contacts.channelEmail")}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] flex items-center gap-1" data-testid={`contact-go-link-${c.id}`}>
                      {c.goClickedAt ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <span>✅</span>
                          <span>{t("pa.contacts.goLinkClicked")} {new Date(c.goClickedAt).toLocaleDateString(language === "de" ? "de-DE" : language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                      ) : (
                        <span className="text-gray-300 flex items-center gap-1">
                          <span>⏳</span>
                          <span>{t("pa.contacts.goLinkPending")}</span>
                        </span>
                      )}
                    </p>
                    {c.hasChat && !c.registeredAt && (
                      <p className="text-[11px] text-purple-500 flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" /> {t("pa.contacts.chatted")}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400" />
                      {t("pa.contacts.nextAction")}: <span className="font-medium text-gray-600">{nextAction(c)}</span>
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => {
                          const msg = language === "de" ? `Hallo ${c.name}, ich wollte mich melden...` : language === "ru" ? `Привет ${c.name}, хотел написать...` : `Hi ${c.name}, I wanted to follow up...`;
                          const tg = (window as any).Telegram?.WebApp;
                          if (tg?.openTelegramLink) tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(msg)}`);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold active:bg-blue-100"
                        data-testid={`contact-action-telegram-${c.id}`}
                      >
                        <Send className="w-3 h-3" /> {t("pa.contacts.actionResend")}
                      </button>
                      <button
                        onClick={() => openAiFollowup(c)}
                        disabled={aiLoading && aiSheet?.contact.id === c.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-semibold active:bg-orange-100 disabled:opacity-60 disabled:cursor-not-allowed"
                        data-testid={`contact-action-ai-${c.id}`}
                      >
                        {aiLoading && aiSheet?.contact.id === c.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Bot className="w-3 h-3" />
                        }
                        {t("pa.contacts.actionAI")}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {aiSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end" onClick={() => setAiSheet(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-t-2xl px-5 pt-4 pb-8 max-h-[75vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">{t("pa.contacts.aiFollowupTitle")}</span>
              </div>
              <button onClick={() => setAiSheet(null)} className="p-1 rounded-lg hover:bg-gray-100" data-testid="button-ai-sheet-close">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">{aiSheet.contact.name}</p>

            {aiLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">{t("pa.contacts.aiGenerating")}</span>
              </div>
            ) : aiText ? (
              <>
                <div
                  className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-4"
                  data-testid="text-ai-followup-result"
                >
                  {aiText}
                </div>
                <button
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 text-white text-sm font-semibold active:bg-orange-600"
                  data-testid="button-ai-followup-copy"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? t("pa.contacts.aiCopied") : t("pa.contacts.aiCopy")}
                </button>
              </>
            ) : (
              <p className="text-xs text-red-400 text-center py-6">{t("pa.contacts.aiError")}</p>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
