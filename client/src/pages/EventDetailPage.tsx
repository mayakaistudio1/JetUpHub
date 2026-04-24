import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Clock, Mic, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import ShareMenu, { SHARE_ORIGIN } from "@/components/ShareMenu";

interface ScheduleEvent {
  id: number;
  day: string;
  date: string;
  time: string;
  timezone?: string;
  title: string;
  speaker: string;
  speakerId?: number | null;
  speakerPhoto?: string | null;
  type: "trading" | "partner";
  typeBadge: string;
  banner: string;
  highlights: string[];
  link: string;
  language?: string;
}

function getDynamicUtcOffset(ianaZone: string): number {
  const fmt = new Intl.DateTimeFormat("en", { timeZone: ianaZone, timeZoneName: "shortOffset" });
  const tzPart = fmt.formatToParts(new Date()).find(p => p.type === "timeZoneName")?.value || "";
  const match = tzPart.match(/GMT([+-]\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

const TZ_TO_IANA: Record<string, string> = {
  CET: "Europe/Berlin", CEST: "Europe/Berlin", MEZ: "Europe/Berlin", MESZ: "Europe/Berlin",
  MSK: "Europe/Moscow", GST: "Asia/Dubai", EST: "America/New_York", EDT: "America/New_York",
  PST: "America/Los_Angeles", PDT: "America/Los_Angeles", UTC: "UTC",
};

const EVENT_LABELS: Record<string, { expect: string; joinZoom: string; motto: [string, string, string] }> = {
  de: { expect: "Das erwartet dich:", joinZoom: "Zum Zoom‑Call", motto: ["STRUKTUR", "TRANSPARENZ", "KONTROLLE"] },
  en: { expect: "What to expect:", joinZoom: "Join Zoom Call", motto: ["STRUCTURE", "TRANSPARENCY", "CONTROL"] },
  ru: { expect: "Что вас ждёт:", joinZoom: "Перейти в Zoom", motto: ["СТРУКТУРА", "ПРОЗРАЧНОСТЬ", "КОНТРОЛЬ"] },
};

function convertTripleTime(time: string, fromTz: string): string {
  const [h, m] = time.split(":").map(Number);
  const fromIana = TZ_TO_IANA[fromTz] || "Europe/Berlin";
  const fromOffset = getDynamicUtcOffset(fromIana);
  const berlinOffset = getDynamicUtcOffset("Europe/Berlin");
  const mskOffset = getDynamicUtcOffset("Europe/Moscow");
  const dubaiOffset = getDynamicUtcOffset("Asia/Dubai");
  const getZonedTime = (offset: number) => {
    let newH = h + (offset - fromOffset);
    if (newH >= 24) newH -= 24;
    if (newH < 0) newH += 24;
    return `${String(newH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
  };
  return `${getZonedTime(berlinOffset)} BER | ${getZonedTime(mskOffset)} MSK | ${getZonedTime(dubaiOffset)} DXB`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  }
  return dateStr;
}

function BannerGridPattern() {
  const rows = 5;
  const cols = 8;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <div key={`${r}-${c}`} className="bg-[#f3f4f6] rounded-[3px]" style={{ opacity: 0.18 }} />
      );
    }
  }
  return (
    <div className="absolute inset-0 p-2 grid gap-1 pointer-events-none"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
      {cells}
    </div>
  );
}

function EventBanner({ event, speakerPhoto }: { event: ScheduleEvent; speakerPhoto?: string }) {
  const { language } = useLanguage();
  if (event.banner) {
    return <img src={event.banner} alt={event.title} className="w-full h-auto object-cover" data-testid={`banner-${event.id}`} />;
  }

  const tz = event.timezone || "CET";
  const tripleTime = event.time ? convertTripleTime(event.time, tz) : "";
  const titleLen = event.title?.length || 0;
  const titleSize = titleLen > 40 ? "3cqw" : titleLen > 25 ? "3.5cqw" : "4cqw";

  return (
    <div className="relative w-full overflow-hidden" data-testid={`banner-${event.id}`}
      style={{ background: "linear-gradient(-29deg, rgb(182, 139, 255) 0%, rgb(255, 255, 255) 69%)", containerType: "inline-size" }}>
      <div className="pt-[55%]" />
      <BannerGridPattern />

      <div className="absolute inset-0 flex">
        <div className="flex-1 flex flex-col justify-between py-[4%] px-[4%] z-10" style={{ maxWidth: "62%" }}>
          <img src="/jetup-logo-banner.png" alt="JetUP" className="h-[14%] w-auto object-contain self-start" />

          <div className="space-y-[1%]">
            <p className="text-[#1a1a1a] font-bold leading-tight" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.7cqw" }}>
              Zoom‑Call
            </p>
            <h3 className="text-[#7C3AED] font-extrabold leading-[1.1] uppercase break-words" style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: titleSize,
              letterSpacing: "-0.02em"
            }}>
              &ldquo;{event.title}&rdquo;
            </h3>
          </div>

          <div className="flex flex-col gap-[1%]">
            <div className="flex items-center gap-[1.5%] flex-wrap">
              <img src="/calendar-icon-banner.png" alt="" style={{ height: "2.2cqw" }} className="w-auto opacity-80" />
              <span className="text-[#1a1a1a] font-bold" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.5cqw" }}>
                {[formatDate(event.date), event.day].filter(Boolean).join(" · ")}
              </span>
            </div>
            {tripleTime && (
              <span className="text-[#9ca3af] font-medium" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2cqw" }}>
                ({tripleTime})
              </span>
            )}
          </div>

          <div className="flex items-center gap-[2%]">
            {(() => {
              const motto = (EVENT_LABELS[language] || EVENT_LABELS.de).motto;
              return motto.map((word, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="bg-[#a855f7] rounded-full" style={{ width: "0.7cqw", height: "0.7cqw" }} />}
                  <span className="font-bold text-[#111827] uppercase" style={{ fontFamily: "Montserrat, sans-serif", fontSize: "1.5cqw", letterSpacing: "0.3cqw" }}>
                    {word}
                  </span>
                </React.Fragment>
              ));
            })()}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 pr-[3%]">
          {speakerPhoto ? (
            <div className="flex flex-col items-center w-full">
              <div className="relative w-[70%] aspect-square">
                <div className="absolute -inset-[4%] rounded-full border-[3px] border-[#C084FC]/40" />
                <img src={speakerPhoto} alt={event.speaker}
                  className="w-full h-full rounded-full object-cover object-top" />
              </div>
              <div className="mt-[4%] bg-white rounded px-[6%] py-[2%] shadow-sm w-fit max-w-[90%] overflow-hidden">
                <p className="font-semibold text-black text-center truncate" style={{ fontFamily: "Inter, sans-serif", fontSize: "2.2cqw" }}>
                  Speaker: {event.speaker}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-[50%] aspect-square rounded-full bg-gradient-to-br from-[#C084FC] to-[#7C3AED] flex items-center justify-center shadow-lg">
              <Mic className="text-white" style={{ width: "30%", height: "30%" }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/event/:id");
  const { language } = useLanguage();
  const [event, setEvent] = useState<ScheduleEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/schedule-events/${params.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setEvent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params?.id]);

  const labels = EVENT_LABELS[language] || EVENT_LABELS.de;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-purple-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500 text-[14px]">Event not found</p>
        <button onClick={() => setLocation("/schedule")} className="text-purple-600 font-medium text-[13px]">
          ← Back to Schedule
        </button>
      </div>
    );
  }

  const tripleTime = event.time ? convertTripleTime(event.time, event.timezone || "CET") : "";
  const shareUrl = `${SHARE_ORIGIN}/event/${event.id}`;
  const shareBody = `🎯 JetUP Webinar\n\n«${event.title}»\n\n🎙 ${event.speaker}\n📅 ${formatDate(event.date)}, ${event.day}\n🕐 ${tripleTime}`;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="purple-top-bar" />
      <div className="flex items-center gap-3 px-5 pt-4 pb-2 flex-shrink-0">
        <button
          onClick={() => setLocation("/schedule")}
          className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          data-testid="button-back-event"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900 flex-1 tracking-tight truncate">
          {event.title}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.06)] mt-2"
        >
          <EventBanner event={event} speakerPhoto={event.speakerPhoto || undefined} />

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              {event.typeBadge && (
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  event.type === "trading" ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                }`}>
                  {event.typeBadge}
                </span>
              )}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                Zoom‑Call
              </span>
              {event.language && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  event.language === "de" ? "bg-yellow-100 text-yellow-700" :
                  event.language === "en" ? "bg-blue-100 text-blue-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {event.language === "de" ? "DE" : event.language === "en" ? "EN" : "RU"}
                </span>
              )}
              <div className="ml-auto">
                <ShareMenu
                  shareBody={shareBody}
                  shareUrl={shareUrl}
                  title={event.title}
                  testId={`button-share-event-${event.id}`}
                />
              </div>
            </div>

            <h3 className="text-[15px] font-bold text-gray-900 leading-tight">
              "{event.title}"
            </h3>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-gray-400" />
                <span className="text-[12px] text-gray-500 font-medium">
                  {[formatDate(event.date), event.day].filter(Boolean).join(", ")}{event.time ? `, ${tripleTime}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mic size={13} className="text-gray-400" />
                <span className="text-[12px] text-gray-500 font-medium">
                  {event.speaker}
                </span>
              </div>
            </div>

            {event.highlights && event.highlights.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{labels.expect}</p>
                {event.highlights.map((h, i) => (
                  <p key={i} className="text-[12px] text-gray-600 font-medium leading-snug">
                    {h}
                  </p>
                ))}
              </div>
            )}

            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl jetup-gradient-glow text-white text-[13px] font-bold active:scale-[0.97] transition-transform"
              data-testid={`zoom-link-${event.id}`}
            >
              <ExternalLink size={15} />
              {labels.joinZoom}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
