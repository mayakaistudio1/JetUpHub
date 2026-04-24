import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, ChevronLeft, ChevronRight, Loader2, Users, UserCheck,
  Calendar, Clock, MessageCircle,
  Bot, Send, Target, Star, Sparkles
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

interface PartnerEvent {
  id: number; title: string; eventDate: string; eventTime: string;
  timezone?: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  guestCount: number; clickedCount: number; invitesSent: number;
  inviteEventIds?: number[];
}

interface Guest {
  id: number; name: string; email: string; phone: string | null;
  registeredAt: string; clickedZoom: boolean; attended: boolean;
  durationMinutes: number | null; questionsAsked: number | null; questionTexts: string[];
  joinTime?: string | null; isWalkIn?: boolean;
}

interface EventReport {
  event: { id: number; title: string; eventDate: string; eventTime: string; inviteCode: string };
  guests: Guest[];
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number };
  inviteEventIds?: number[];
}

const WEBINAR_DURATION_MS = 60 * 60 * 1000;

function getTimezoneOffsetForDate(tz: string, refDate: Date): string {
  const tzMap: Record<string, string> = {
    "CET": "Europe/Berlin", "CEST": "Europe/Berlin", "MET": "Europe/Berlin",
    "MEZ": "Europe/Berlin", "MESZ": "Europe/Berlin", "UTC": "UTC", "GMT": "UTC",
    "MSK": "Europe/Moscow", "Europe/Berlin": "Europe/Berlin", "Europe/Moscow": "Europe/Moscow",
  };
  const ianaZone = tzMap[tz] || "Europe/Berlin";
  try {
    const fmt = new Intl.DateTimeFormat("en", { timeZone: ianaZone, timeZoneName: "longOffset" });
    const parts = fmt.formatToParts(refDate);
    const tzPart = parts.find(p => p.type === "timeZoneName")?.value || "";
    const match = tzPart.match(/GMT([+-]\d{2}:\d{2})/);
    if (match) return match[1];
  } catch {}
  return "+01:00";
}

function isPast(dateStr: string, timeStr: string, timezone?: string): boolean {
  try {
    let isoDate = dateStr;
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
    const roughDate = new Date(`${isoDate}T12:00:00Z`);
    const offset = getTimezoneOffsetForDate(timezone || "CET", roughDate);
    const startDt = new Date(`${isoDate}T${timeStr || "00:00"}:00${offset}`);
    const endDt = new Date(startDt.getTime() + WEBINAR_DURATION_MS);
    return endDt <= new Date();
  } catch { return false; }
}

function FunnelBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-900">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }} className={`h-full rounded-full ${color}`} />
      </div>
    </div>
  );
}

type Screen = "list" | "report" | "ai-followup";

interface AIMessage { role: "user" | "assistant"; content: string; }

export default function PastScreen({ telegramId }: { telegramId: string }) {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("list");
  const [selectedEvent, setSelectedEvent] = useState<PartnerEvent | null>(null);
  const [report, setReport] = useState<EventReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [expandedGuest, setExpandedGuest] = useState<number | null>(null);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiSending, setAiSending] = useState(false);

  useEffect(() => {
    fetch("/api/partner-app/events", { headers: { ...getPartnerAuthHeader() } })
      .then(r => r.json())
      .then(data => {
        const past = (data || []).filter((e: PartnerEvent) => isPast(e.eventDate, e.eventTime, e.timezone));
        setEvents(past);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [telegramId]);

  const loadReport = async (event: PartnerEvent) => {
    setReportLoading(true);
    setSelectedEvent(event);
    setExpandedGuest(null);
    try {
      const ids = event.inviteEventIds || [event.id];
      const reports = await Promise.all(
        ids.map(id => fetch(`/api/partner-app/events/${id}/report`, { headers: { ...getPartnerAuthHeader() } }).then(r => r.json()))
      );
      const combined: EventReport = {
        event: reports[0].event,
        guests: reports.flatMap((r: any) => r.guests),
        funnel: {
          invited: reports.reduce((s: number, r: any) => s + r.funnel.invited, 0),
          registered: reports.reduce((s: number, r: any) => s + r.funnel.registered, 0),
          clickedZoom: reports.reduce((s: number, r: any) => s + r.funnel.clickedZoom, 0),
          attended: reports.reduce((s: number, r: any) => s + r.funnel.attended, 0),
        },
        inviteEventIds: ids,
      };
      setReport(combined);
      setScreen("report");
    } catch {}
    setReportLoading(false);
  };

  const sendAiMessage = async (text: string) => {
    if (!text.trim() || aiSending) return;
    setAiMessages(prev => [...prev, { role: "user", content: text }]);
    setAiInput("");
    setAiSending(true);
    try {
      const res = await fetch("/api/partner-app/ai-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setAiMessages(prev => [...prev, { role: "assistant", content: t("pa.ai.error") }]);
    }
    setAiSending(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  if (screen === "ai-followup") {
    const quickActions = [
      { id: "attendees", label: t("pa.past.ai.attendees"), prompt: language === "de" ? "Erstelle eine Follow-up Nachricht für Teilnehmer des letzten Webinars." : language === "ru" ? "Создай письмо для участников последнего вебинара." : "Create a follow-up message for webinar attendees." },
      { id: "noshow", label: t("pa.past.ai.noshow"), prompt: language === "de" ? "Erstelle eine Nachricht für registrierte Nicht-Teilnehmer." : language === "ru" ? "Создай сообщение для зарегистрированных, но не пришедших." : "Create a message for registered no-shows." },
      { id: "registered", label: t("pa.past.ai.registered"), prompt: language === "de" ? "Erstelle eine Follow-up für registrierte aber abwesende Teilnehmer." : language === "ru" ? "Создай фоллоу-ап для зарегистрированных но отсутствующих." : "Create follow-up for registered but absent guests." },
      { id: "engaged", label: t("pa.past.ai.engaged"), prompt: language === "de" ? "Erstelle eine spezielle Nachricht für hoch engagierte Teilnehmer." : language === "ru" ? "Создай сообщение для активных гостей, задававших вопросы." : "Create a message for highly engaged guests who asked questions." },
    ];
    return (
      <div className="h-full flex flex-col">
        <div className="px-5 pt-5 pb-3 bg-white flex-shrink-0 border-b border-gray-100">
          <button onClick={() => { setScreen("report"); setAiMessages([]); }} className="flex items-center gap-1 text-sm text-gray-500 mb-3 active:opacity-60" data-testid="button-back"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">{t("pa.past.aiFollowup")}</h2>
              <p className="text-[11px] text-gray-400">{report?.event.title}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-3 bg-[#F5F5F7]">
          {aiMessages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {language === "de" ? "Hallo! Ich helfe dir mit Follow-up Nachrichten für deine Webinar-Teilnehmer. Wähle eine Aktion:" : language === "ru" ? "Привет! Помогу с фоллоу-ап сообщениями для участников вебинара. Выбери действие:" : "Hi! I'll help you create follow-up messages for your webinar guests. Choose an action:"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((a, i) => (
                  <motion.button key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}
                    onClick={() => sendAiMessage(a.prompt)}
                    className="bg-white rounded-xl p-3 text-left active:bg-gray-50"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    data-testid={`ai-followup-action-${a.id}`}
                  >
                    <Sparkles className="w-4 h-4 text-orange-500 mb-1.5" />
                    <p className="text-[11px] font-medium text-gray-700 leading-tight">{a.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {aiMessages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white text-gray-800 rounded-bl-sm"}`} style={msg.role === "assistant" ? { boxShadow: "0 1px 3px rgba(0,0,0,0.06)" } : {}}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {aiSending && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              </div>
            </div>
          )}
        </div>
        <form onSubmit={e => { e.preventDefault(); sendAiMessage(aiInput); }} className="flex-shrink-0 px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder={language === "de" ? "Nachricht schreiben..." : language === "ru" ? "Написать сообщение..." : "Type a message..."} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" data-testid="input-ai-message" />
          <button type="submit" disabled={!aiInput.trim() || aiSending} className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center disabled:opacity-40" data-testid="button-ai-send">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  if (screen === "report" && report) {
    const f = report.funnel;
    const maxFunnel = Math.max(f.registered, f.clickedZoom, f.attended, 1);
    const attended = report.guests.filter(g => g.attended);
    const noShow = report.guests.filter(g => !g.attended);
    const avgDuration = attended.length > 0 ? Math.round(attended.reduce((s, g) => s + (g.durationMinutes || 0), 0) / attended.length) : 0;
    const walkIns = attended.filter(g => g.isWalkIn);
    const partnerAttended = attended.filter(g => !g.isWalkIn);
    const conversion = f.registered > 0 ? Math.round((f.attended / f.registered) * 100) : 0;

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={() => { setScreen("list"); setReport(null); setSelectedEvent(null); }} className="flex items-center gap-1 text-sm text-gray-500 mb-4 active:opacity-60" data-testid="button-back-reports"><ChevronLeft className="w-4 h-4" /> {t("pa.back")}</button>
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900">{report.event.title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{report.event.eventDate} · {report.event.eventTime}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: t("pa.invited"), value: f.invited, color: "text-gray-900" },
            { label: t("pa.registered"), value: f.registered, color: "text-blue-600" },
            { label: t("pa.attended"), value: f.attended, color: "text-emerald-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className={`text-xl font-bold ${s.color}`} data-testid={`report-stat-${i}`}>{s.value}</p>
              <p className="text-[9px] text-gray-400 uppercase mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <p className="text-xl font-bold text-purple-600" data-testid="report-conversion">{conversion}%</p>
            <p className="text-[9px] text-gray-400 uppercase mt-0.5">{t("pa.conversionRate")}</p>
          </div>
          {avgDuration > 0 && (
            <div className="bg-white rounded-xl p-3 text-center" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-xl font-bold text-amber-600" data-testid="report-duration">{avgDuration} min</p>
              <p className="text-[9px] text-gray-400 uppercase mt-0.5">{t("pa.past.avgDuration")}</p>
            </div>
          )}
        </div>

        {walkIns.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">{walkIns.length} walk-in{walkIns.length !== 1 ? "s" : ""} — {t("pa.past.walkInNote")}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-500" /> {t("pa.conversionFunnel")}</h3>
          <div className="space-y-4">
            <FunnelBar label={t("pa.registered")} value={f.registered} maxValue={maxFunnel} color="bg-blue-500" />
            <FunnelBar label={t("pa.clickedZoom")} value={f.clickedZoom} maxValue={maxFunnel} color="bg-purple-500" />
            <FunnelBar label={t("pa.attended")} value={f.attended} maxValue={maxFunnel} color="bg-emerald-500" />
          </div>
        </div>

        <button onClick={() => { setAiMessages([]); setScreen("ai-followup"); }} className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white rounded-xl text-sm font-semibold mb-5 active:bg-orange-600" data-testid="button-ai-followup">
          <Bot className="w-4 h-4" /> {t("pa.past.aiFollowup")}
        </button>

        {attended.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> {t("pa.past.attended")} ({attended.length})
              {partnerAttended.length !== attended.length && <span className="text-[10px] text-gray-400">({partnerAttended.length} {t("pa.past.partnerDirect")})</span>}
            </h3>
            <div className="space-y-2">
              {attended.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} data-testid={`attended-guest-${g.id}`}>
                  <button className="w-full p-3.5 flex items-center justify-between text-left active:bg-gray-50" onClick={() => setExpandedGuest(expandedGuest === g.id ? null : g.id)}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                        {g.isWalkIn && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0">Walk-in</span>}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">{g.email}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold ml-2 flex-shrink-0">
                      ✓ {g.durationMinutes != null ? `${g.durationMinutes}m` : "—"}{(g.questionsAsked ?? 0) > 0 ? ` · ${g.questionsAsked}Q` : ""}
                    </span>
                  </button>
                  {expandedGuest === g.id && (
                    <div className="px-4 pb-3 border-t border-gray-50">
                      <div className="pt-2.5 space-y-1.5 text-xs text-gray-500">
                        {g.durationMinutes != null && <span className="mr-3">⏱ {g.durationMinutes} min</span>}
                        {g.joinTime && <span className="mr-3">🕐 {new Date(g.joinTime).toLocaleTimeString()}</span>}
                        {g.phone && <span>📞 {g.phone}</span>}
                      </div>
                      {g.questionTexts && g.questionTexts.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {t("pa.questionsAsked")}:</p>
                          <div className="space-y-1">{g.questionTexts.map((q, qi) => <div key={qi} className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-700">{q}</p></div>)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {noShow.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" /> {t("pa.past.noShows")} ({noShow.length})
            </h3>
            <div className="space-y-2">
              {noShow.map((g, i) => (
                <div key={g.id} className="bg-white rounded-xl p-3.5 flex items-center justify-between" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }} data-testid={`noshow-guest-${g.id}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{g.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ml-2 flex-shrink-0 ${g.clickedZoom ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                    {g.clickedZoom ? t("pa.clicked") : t("pa.noShow")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">{t("pa.nav.past")}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{t("pa.past.subtitle")}</p>
      </div>
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t("pa.noEventsYet")}</p>
          <p className="text-xs text-gray-400 mt-1">{t("pa.createFirstInvite")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`past-card-${event.id}`}
            >
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.eventTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-5 pb-3 border-b border-gray-100 mb-3">
                <div>
                  <p className="text-sm font-bold text-blue-600">{event.registeredCount || event.guestCount}</p>
                  <p className="text-[9px] text-gray-400 uppercase">{t("pa.registered")}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600">{event.attendedCount}</p>
                  <p className="text-[9px] text-gray-400 uppercase">{t("pa.attended")}</p>
                </div>
                {event.conversionRate > 0 && (
                  <div>
                    <p className="text-sm font-bold text-purple-600">{event.conversionRate}%</p>
                    <p className="text-[9px] text-gray-400 uppercase">{t("pa.conversionRate")}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => loadReport(event)} className="flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold active:bg-blue-700" data-testid={`button-report-${event.id}`}>
                  <BarChart3 className="w-3.5 h-3.5" /> {t("pa.past.report")}
                </button>
                <button onClick={async () => { await loadReport(event); setScreen("ai-followup"); setAiMessages([]); }} className="flex items-center justify-center gap-1.5 py-2.5 bg-orange-100 text-orange-700 rounded-xl text-xs font-semibold active:bg-orange-200" data-testid={`button-ai-${event.id}`}>
                  <Bot className="w-3.5 h-3.5" /> {t("pa.past.aiFollowup")}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {reportLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}
