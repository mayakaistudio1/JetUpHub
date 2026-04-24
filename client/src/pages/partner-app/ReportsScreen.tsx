import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight, Loader2, Users, UserCheck, Calendar, Clock, MessageCircle, RefreshCw, CheckCircle, AlertCircle, Layers } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader } from "./partnerAuth";

interface PartnerEvent {
  id: number; title: string; eventDate: string; eventTime: string;
  registeredCount: number; attendedCount: number; conversionRate: number;
  guestCount: number; clickedCount: number; invitesSent: number;
  inviteEventIds?: number[];
}

interface MethodBreakdownEntry {
  method: string;
  invited: number;
  attended: number;
  conversionRate: number;
}

interface EventReport {
  event: { id: number; title: string; eventDate: string; eventTime: string; inviteCode: string };
  guests: Array<{
    id: number; name: string; email: string; phone: string | null;
    registeredAt: string; clickedZoom: boolean; attended: boolean;
    durationMinutes: number | null; questionsAsked: number | null; questionTexts: string[];
    joinTime?: string | null; isWalkIn?: boolean; invitationMethod?: string | null;
  }>;
  funnel: { invited: number; registered: number; clickedZoom: number; attended: number; avgDurationMinutes?: number | null };
  walkInCount?: number;
  methodBreakdown: MethodBreakdownEntry[];
  inviteEventIds?: number[];
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
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

export default function ReportsScreen({ telegramId }: { telegramId: string }) {
  const [events, setEvents] = useState<PartnerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGuest, setExpandedGuest] = useState<number | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PartnerEvent | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [zoomSyncing, setZoomSyncing] = useState(false);
  const [zoomSyncResult, setZoomSyncResult] = useState<{ synced: number; skipped: number; total: number } | null>(null);
  const [zoomSyncError, setZoomSyncError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/partner-app/events", { headers: { ...getPartnerAuthHeader() } })
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [telegramId]);

  const loadReport = async (event: PartnerEvent) => {
    setReportLoading(true);
    setSelectedEvent(event);
    setZoomSyncResult(null);
    setZoomSyncError(null);
    try {
      const ids = event.inviteEventIds || [event.id];
      const reports = await Promise.all(
        ids.map((id) => fetch(`/api/partner-app/events/${id}/report`, { headers: { ...getPartnerAuthHeader() } }).then((r) => r.json()))
      );
      // Merge method breakdown across all sub-reports
      const mergedMethodMap: Record<string, { invited: number; attended: number }> = {};
      for (const r of reports) {
        for (const entry of (r.methodBreakdown ?? [])) {
          if (!mergedMethodMap[entry.method]) {
            mergedMethodMap[entry.method] = { invited: 0, attended: 0 };
          }
          mergedMethodMap[entry.method].invited += entry.invited;
          mergedMethodMap[entry.method].attended += entry.attended;
        }
      }
      const mergedMethodBreakdown: MethodBreakdownEntry[] = Object.entries(mergedMethodMap)
        .filter(([, s]) => s.invited > 0)
        .map(([method, s]) => ({
          method,
          invited: s.invited,
          attended: s.attended,
          conversionRate: s.invited > 0 ? Math.round((s.attended / s.invited) * 100) : 0,
        }));

      const combined: EventReport = {
        event: reports[0].event,
        guests: reports.flatMap((r: any) => r.guests),
        walkInCount: reports.reduce((s: number, r: any) => s + (r.walkInCount ?? 0), 0),
        funnel: {
          invited: reports.reduce((s: number, r: any) => s + r.funnel.invited, 0),
          registered: reports.reduce((s: number, r: any) => s + r.funnel.registered, 0),
          clickedZoom: reports.reduce((s: number, r: any) => s + r.funnel.clickedZoom, 0),
          attended: reports.reduce((s: number, r: any) => s + r.funnel.attended, 0),
        },
        methodBreakdown: mergedMethodBreakdown,
        inviteEventIds: ids,
      };
      setSelectedReport(combined);
    } catch (err) { console.error(err); }
    setReportLoading(false);
  };

  const handleZoomSync = async () => {
    if (!selectedEvent || !selectedReport) return;
    setZoomSyncing(true);
    setZoomSyncResult(null);
    setZoomSyncError(null);

    const ids = selectedReport.inviteEventIds || [selectedReport.event.id];
    let totalSynced = 0;
    let totalSkipped = 0;
    let totalParticipants = 0;
    let lastError: string | null = null;

    for (const id of ids) {
      try {
        const res = await fetch(`/api/partner-app/events/${id}/zoom-sync`, {
          method: "POST",
          headers: { ...getPartnerAuthHeader() },
        });
        const data = await res.json();
        if (!res.ok) {
          lastError = data.error || "Sync failed";
        } else {
          totalSynced += data.synced || 0;
          totalSkipped += data.skipped || 0;
          totalParticipants += data.total || 0;
        }
      } catch {
        lastError = "Network error";
      }
    }

    setZoomSyncing(false);

    if (lastError && totalSynced === 0) {
      setZoomSyncError(lastError);
    } else {
      setZoomSyncResult({ synced: totalSynced, skipped: totalSkipped, total: totalParticipants });
      await loadReport(selectedEvent);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;

  if (selectedReport) {
    const f = selectedReport.funnel;
    const maxFunnel = Math.max(f.registered, f.clickedZoom, f.attended, 1);
    const hasZoomData = selectedReport.guests.some(g => g.attended);
    const todayStr = new Date().toISOString().slice(0, 10);
    const isFutureEvent = selectedReport.event.eventDate > todayStr;

    return (
      <div className="px-5 pt-5 pb-28">
        <button onClick={() => { setSelectedReport(null); setSelectedEvent(null); }} className="flex items-center gap-1 text-sm text-gray-500 mb-5 active:opacity-60" data-testid="button-back-reports">
          <ChevronLeft className="w-4 h-4" /> {t('pa.back')}
        </button>

        <div className="mb-5">
          <h2 className="text-base font-bold text-gray-900">{selectedReport.event.title}</h2>
          <p className="text-xs text-gray-400 mt-1">{selectedReport.event.eventDate} · {selectedReport.event.eventTime}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> {t('pa.conversionFunnel')}
          </h3>
          <div className="space-y-4">
            <FunnelBar label={t('pa.registered')} value={f.registered} maxValue={maxFunnel} color="bg-blue-500" />
            <FunnelBar label={t('pa.clickedZoom')} value={f.clickedZoom} maxValue={maxFunnel} color="bg-purple-500" />
            <FunnelBar label={t('pa.attended')} value={f.attended} maxValue={maxFunnel} color="bg-emerald-500" />
          </div>
          {f.registered > 0 && (
            <div className="pt-3 mt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {t('pa.conversionRateLabel')}: <span className="font-semibold text-gray-900">{Math.round((f.attended / f.registered) * 100)}%</span>
              </p>
            </div>
          )}
        </div>

        {selectedReport.methodBreakdown && selectedReport.methodBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-500" /> {t('pa.invitationBreakdown')}
            </h3>
            <div className="space-y-2">
              {selectedReport.methodBreakdown.map((entry) => {
                const isExpanded = expandedMethod === entry.method;
                const methodLabel = t(`pa.method.${entry.method}`);
                const filteredGuests = selectedReport.guests.filter(
                  (g) => !g.isWalkIn && (g.invitationMethod ?? "unknown") === entry.method
                );
                return (
                  <div key={entry.method} className="rounded-xl overflow-hidden border border-gray-100" data-testid={`method-row-${entry.method}`}>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 active:bg-gray-100 transition-colors"
                      onClick={() => setExpandedMethod(isExpanded ? null : entry.method)}
                      data-testid={`button-method-expand-${entry.method}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">{methodLabel}</span>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{entry.invited} {t('pa.invited')} · {entry.attended} {t('pa.attended')}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${entry.conversionRate >= 50 ? "bg-emerald-50 text-emerald-600" : entry.conversionRate >= 20 ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}
                          data-testid={`badge-conversion-${entry.method}`}
                        >
                          {entry.conversionRate}%
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-300 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </div>
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="border-t border-gray-100"
                      >
                        {filteredGuests.length === 0 ? (
                          <p className="text-xs text-gray-400 px-4 py-3 italic">{t('pa.noGuests')}</p>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {filteredGuests.map((g) => (
                              <div key={g.id} className="px-4 py-2.5 flex items-center justify-between" data-testid={`method-guest-${entry.method}-${g.id}`}>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-800 truncate">{g.name}</p>
                                  <p className="text-[11px] text-gray-400 truncate">{g.email}</p>
                                </div>
                                <div className="ml-3 flex-shrink-0">
                                  {g.attended ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                                      ✓ {g.durationMinutes != null ? `${g.durationMinutes}m` : "—"}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">{t('pa.noShow')}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-5">
          {isFutureEvent ? (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3" data-testid="zoom-sync-future-notice">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-600">{t('pa.zoomSync.futureEvent')}</p>
            </div>
          ) : (
            <>
              {zoomSyncResult && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-3"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">
                    Zoom sync: {zoomSyncResult.synced} {t('pa.zoomSync.new')}{zoomSyncResult.skipped > 0 ? `, ${zoomSyncResult.skipped} ${t('pa.zoomSync.alreadyPresent')}` : ""}
                    {zoomSyncResult.total === 0 && ` ${t('pa.zoomSync.noParticipants')}`}
                  </p>
                </motion.div>
              )}
              {zoomSyncError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      {zoomSyncError === "FUTURE_EVENT" ? (
                        <p className="text-xs text-red-700 font-medium">{t('pa.zoomSync.futureEvent')}</p>
                      ) : zoomSyncError === "Zoom not configured" ? (
                        <p className="text-xs text-red-700 font-medium">{t('pa.zoomSync.notConfigured')}</p>
                      ) : zoomSyncError.startsWith("SCOPE_ERROR:") ? (
                        <>
                          <p className="text-xs text-red-700 font-semibold mb-1">{t('pa.zoomSync.missingScope')}</p>
                          <p className="text-xs text-red-600 leading-relaxed">
                            {t('pa.zoomSync.scopeDesc')} <span className="font-mono bg-red-100 px-1 rounded">{zoomSyncError.replace("SCOPE_ERROR:", "")}</span>.
                          </p>
                          <p className="text-xs text-red-500 mt-1.5 leading-relaxed">
                            {t('pa.zoomSync.adminHint')}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-red-700 font-medium">{t('pa.zoomSync.error')} {zoomSyncError}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                onClick={handleZoomSync}
                disabled={zoomSyncing}
                data-testid="button-zoom-sync"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 active:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                {zoomSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-blue-600">{t('pa.zoomSync.loading')}</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                    <span>{t('pa.zoomSync.button')}</span>
                  </>
                )}
              </button>

              {!hasZoomData && !zoomSyncResult && (
                <p className="text-[11px] text-gray-400 text-center mt-2">
                  {t('pa.zoomSync.hint')}
                </p>
              )}
            </>
          )}
        </div>

        {(selectedReport.walkInCount ?? 0) > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4" data-testid="walk-in-banner">
            <Users className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700">{selectedReport.walkInCount} Walk-ins — nicht über deinen Link</p>
          </div>
        )}

        <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('pa.guests')} ({selectedReport.guests.length})</h3>
        <div className="space-y-2">
          {selectedReport.guests.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`guest-row-${g.id}`}
            >
              <button
                className="w-full p-4 flex items-center justify-between text-left active:bg-gray-50 transition-colors"
                onClick={() => setExpandedGuest(expandedGuest === g.id ? null : g.id)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-gray-900 truncate">{g.name}</p>
                    {g.isWalkIn && <span className="flex-shrink-0 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">Walk-in</span>}
                    {!g.isWalkIn && (() => {
                      const m = g.invitationMethod ?? "unknown";
                      if (m === "personal_ai") return <span className="flex-shrink-0 text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-semibold" data-testid={`tag-method-${g.id}`}>{t('pa.method.personal_ai')}</span>;
                      if (m === "bulk_link") return <span className="flex-shrink-0 text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold" data-testid={`tag-method-${g.id}`}>{t('pa.method.bulk_link')}</span>;
                      return <span className="flex-shrink-0 text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-semibold" data-testid={`tag-method-${g.id}`}>{t('pa.method.unknown')}</span>;
                    })()}
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">{g.email}</p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {g.attended ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
                      ✓ {g.durationMinutes != null ? `${g.durationMinutes}m` : "—"}
                      {(g.questionsAsked ?? 0) > 0 && ` · ${g.questionsAsked}Q`}
                    </span>
                  ) : g.clickedZoom ? (
                    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold">{t('pa.clicked')}</span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">{t('pa.noShow')}</span>
                  )}
                </div>
              </button>
              {expandedGuest === g.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-4 pb-4 border-t border-gray-50"
                >
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {g.attended && g.durationMinutes != null && <span>⏱ {g.durationMinutes} min</span>}
                      {g.attended && g.joinTime && <span>🕐 {new Date(g.joinTime).toLocaleTimeString()}</span>}
                      {g.phone && <span>📞 {g.phone}</span>}
                      {g.clickedZoom && <span className="text-blue-500">🔗 {t('pa.clickedZoom')}</span>}
                    </div>
                    {g.questionTexts && g.questionTexts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {t('pa.questionsAsked')}:
                        </p>
                        <div className="space-y-1.5">
                          {g.questionTexts.map((q, qi) => (
                            <div key={qi} className="bg-gray-50 rounded-lg px-3 py-2">
                              <p className="text-xs text-gray-700">{q}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!g.questionTexts || g.questionTexts.length === 0) && g.attended && (
                      <p className="text-[11px] text-gray-400 italic">{t('pa.noQuestions')}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-28">
      <h2 className="text-lg font-bold text-gray-900 mb-5">{t('pa.statistics')}</h2>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">{t('pa.noEventsYet')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('pa.createFirstInvite')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => loadReport(event)}
              className="w-full bg-white rounded-2xl p-5 text-left active:bg-gray-50 transition-colors"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              data-testid={`report-event-${event.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{event.title}</h3>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 ml-2" />
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.eventDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.eventTime}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-700">{event.registeredCount || event.guestCount}</span>
                  <span className="text-[10px] text-gray-400">{t('pa.registered')}</span>
                </div>
                {event.clickedCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-semibold text-gray-700">{event.clickedCount}</span>
                    <span className="text-[10px] text-gray-400">{t('pa.clickedZoom')}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-700">{event.attendedCount}</span>
                  <span className="text-[10px] text-gray-400">{t('pa.attended')}</span>
                </div>
              </div>
            </motion.button>
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
