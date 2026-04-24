import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, CalendarDays, ArrowUpRight, ChevronRight, Calendar, Clock, Video, Send, UserCheck } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

interface Props {
  profile: {
    partner: { id: number; name: string; cuNumber: string };
    stats: { totalInvited: number; totalAttended: number; conversionRate: number; totalEvents: number };
  };
  telegramId: string;
  onNavigate: (tab: "dashboard" | "webinars" | "reports" | "ai") => void;
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="tabular-nums">{count}{suffix}</span>;
}

interface Webinar {
  id: number; title: string; date: string; time: string; timezone: string;
  speaker: string; speakerPhoto: string | null; type: string; typeBadge: string;
  highlights: string[]; language: string;
  invitesSent: number; registeredCount: number;
}

interface PartnerEvent {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  invitesSent: number;
}

export default function DashboardScreen({ profile, telegramId, onNavigate }: Props) {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [pastEvents, setPastEvents] = useState<PartnerEvent[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch(`/api/partner-app/webinars?lang=${language}`, { headers: { ...getPartnerAuthHeader() } })
      .then((r) => r.json())
      .then((data) => setWebinars(data.slice(0, 3)))
      .catch(() => {});

    fetch("/api/partner-app/events", { headers: { ...getPartnerAuthHeader() } })
      .then((r) => r.json())
      .then((data) => setPastEvents(data.slice(0, 3)))
      .catch(() => {});
  }, [telegramId, language]);

  const firstName = profile.partner.name.split(" ")[0];

  const stats = [
    {
      label: t('pa.totalAttendees'),
      value: profile.stats.totalAttended,
      suffix: "",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      accent: "bg-purple-50",
      hint: profile.stats.totalAttended > 0 ? `+${Math.min(profile.stats.totalAttended, 8)}%` : t('pa.noDataYet'),
    },
    {
      label: t('pa.attendanceRate'),
      value: profile.stats.conversionRate,
      suffix: "%",
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      accent: "bg-emerald-50",
      hint: profile.stats.conversionRate >= 40 ? t('pa.highEngagement') : t('pa.keepInviting'),
    },
    {
      label: t('pa.upcomingScheduled'),
      value: profile.stats.totalEvents,
      suffix: "",
      icon: CalendarDays,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      accent: "bg-amber-50",
      hint: t('pa.next7days'),
    },
  ];

  return (
    <div className="px-5 pt-6 pb-28">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{t('pa.welcomeBack')}</p>
        <h1 className="text-xl font-bold text-gray-900" data-testid="text-partner-welcome">{firstName}</h1>
      </motion.div>

      {webinars.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{t('pa.upcomingMeetings')}</h3>
            <button onClick={() => onNavigate("webinars")} className="text-xs text-blue-600 font-medium flex items-center gap-0.5" data-testid="link-all-webinars">
              {t('pa.seeAll')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {webinars.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onNavigate("webinars")}
                className="bg-white rounded-2xl p-4 active:bg-gray-50 transition-colors cursor-pointer"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                data-testid={`upcoming-webinar-${w.id}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{w.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" /> {w.date}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" /> {w.time}
                      </span>
                    </div>
                    {w.speaker && (
                      <p className="text-xs text-gray-400 mt-1">{w.speaker}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Send className="w-3 h-3 text-blue-400" />
                        <span className="font-semibold text-gray-700">{w.invitesSent}</span> {t('pa.sent')}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <UserCheck className="w-3 h-3 text-emerald-400" />
                        <span className="font-semibold text-gray-700">{w.registeredCount}</span> {t('pa.registered')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-4 mb-6">
        {stats.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="bg-white rounded-2xl p-5 relative overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.accent} rounded-full -translate-y-1/2 translate-x-1/3 opacity-60`} />
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900" data-testid={`stat-card-${i}`}>
                <AnimatedCounter value={card.value} suffix={card.suffix} />
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">{card.hint}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {pastEvents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{t('pa.pastEvents')}</h3>
            <button onClick={() => onNavigate("reports")} className="text-xs text-blue-600 font-medium flex items-center gap-0.5" data-testid="link-all-reports">
              {t('pa.seeAll')} <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {pastEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                onClick={() => onNavigate("reports")}
                className="bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                data-testid={`past-event-${event.id}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{event.eventDate} · {event.eventTime}</p>
                </div>
                <div className="flex items-center gap-4 ml-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">{event.registeredCount}</p>
                    <p className="text-[9px] text-gray-400 uppercase">{t('pa.registered')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-emerald-600">{event.attendedCount}</p>
                    <p className="text-[9px] text-gray-400 uppercase">{t('pa.attended')}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
