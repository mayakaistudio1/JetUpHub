import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, TrendingUp, CalendarDays, UserCheck, BarChart3,
  Calendar, ChevronDown, ArrowUpRight, Loader2
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

type FilterPeriod = "7d" | "30d" | "all";

interface PartnerProfile {
  partner: { id: number; name: string; cuNumber: string };
  stats: { totalInvited: number; totalAttended: number; conversionRate: number; totalEvents: number };
}

interface PartnerEvent {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  guestCount: number; clickedCount: number; invitesSent: number;
}

function isPast(dateStr: string, timeStr: string): boolean {
  try {
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      const dt = new Date(`${isoDate}T${timeStr || "00:00"}:00`);
      return dt <= new Date();
    }
    const dt = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
    return dt <= new Date();
  } catch { return false; }
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 800 / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="tabular-nums">{count}{suffix}</span>;
}

export default function StatisticsScreen({ telegramId, profile }: { telegramId: string; profile: PartnerProfile }) {
  const { t } = useLanguage();
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<FilterPeriod>("all");

  useEffect(() => {
    fetch("/api/partner-app/events", { headers: { ...getPartnerAuthHeader() } })
      .then(r => r.json())
      .then(eventsData => {
        setEvents(eventsData || []);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [telegramId]);

  const now = new Date();
  const cutoff = period === "7d" ? new Date(now.getTime() - 7 * 86400000) : period === "30d" ? new Date(now.getTime() - 30 * 86400000) : null;

  const pastEvents = events.filter(e => isPast(e.eventDate, e.eventTime));
  const upcomingEvents = events.filter(e => !isPast(e.eventDate, e.eventTime));

  const filteredPast = cutoff
    ? pastEvents.filter(e => {
        try {
          const parts = e.eventDate.split(".");
          const isoDate = parts.length === 3 ? `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}` : e.eventDate;
          return new Date(isoDate) >= cutoff;
        } catch { return true; }
      })
    : pastEvents;

  const totalInvited = filteredPast.reduce((s, e) => s + (e.invitesSent || 0), 0);
  const totalRegistered = filteredPast.reduce((s, e) => s + (e.registeredCount || e.guestCount || 0), 0);
  const totalAttended = filteredPast.reduce((s, e) => s + (e.attendedCount || 0), 0);
  const convRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  const statCards = [
    { label: t("pa.totalInvited"), value: totalInvited || profile.stats.totalInvited, suffix: "", icon: Users, iconBg: "bg-blue-100", iconColor: "text-blue-600", accentBg: "bg-blue-50" },
    { label: t("pa.registered"), value: totalRegistered, suffix: "", icon: UserCheck, iconBg: "bg-violet-100", iconColor: "text-violet-600", accentBg: "bg-violet-50" },
    { label: t("pa.totalAttended"), value: totalAttended || profile.stats.totalAttended, suffix: "", icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", accentBg: "bg-emerald-50" },
    { label: t("pa.conversionRate"), value: convRate || profile.stats.conversionRate, suffix: "%", icon: BarChart3, iconBg: "bg-amber-100", iconColor: "text-amber-600", accentBg: "bg-amber-50" },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  return (
    <div className="px-5 pt-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{t("pa.nav.statistics")}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{t("pa.stats.subtitle")}</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-0.5">
          {(["7d", "30d", "all"] as FilterPeriod[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${period === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
              data-testid={`period-${p}`}
            >
              {p === "all" ? t("pa.stats.allTime") : p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-4 relative overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${card.accentBg} rounded-full -translate-y-1/2 translate-x-1/3 opacity-60`} />
            <div className="relative">
              <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <p className="text-[10px] text-gray-400 mb-0.5">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900" data-testid={`stats-card-${i}`}>
                <AnimatedCounter value={card.value} suffix={card.suffix} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-xs text-gray-500">{t("pa.stats.upcomingActive")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600" data-testid="stats-upcoming">{upcomingEvents.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <p className="text-xs text-gray-500">{t("pa.stats.pastEvents")}</p>
          </div>
          <p className="text-xl font-bold text-gray-700" data-testid="stats-past">{filteredPast.length}</p>
        </div>
      </div>

      {filteredPast.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("pa.past.subtitle")}</h3>
          <div className="space-y-2">
            {filteredPast.slice(0, 5).map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                className="bg-white rounded-xl p-3.5 flex items-center justify-between" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                data-testid={`stats-event-${event.id}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-blue-600">{event.registeredCount || event.guestCount}</p>
                    <p className="text-[9px] text-gray-400 uppercase">{t("pa.registered")}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-emerald-600">{event.attendedCount}</p>
                    <p className="text-[9px] text-gray-400 uppercase">{t("pa.attended")}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
