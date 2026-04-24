import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot, Link2, Globe, Bell, Video, BarChart3, Sparkles,
  ArrowDown, Clock, ChevronDown, ChevronUp, ExternalLink,
  MessageSquare, Users, Phone, AtSign, Calendar, Zap, Eye
} from "lucide-react";

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{children}</h3>
    </div>
  );
}

function FlowCard({
  step,
  title,
  description,
  icon: Icon,
  color = "purple",
  details,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
  color?: string;
  details?: string[];
}) {
  const [expanded, setExpanded] = useState(false);
  const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", iconBg: "bg-purple-100" },
    blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600", iconBg: "bg-blue-100" },
    green: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", iconBg: "bg-emerald-100" },
    orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", iconBg: "bg-orange-100" },
    pink: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-600", iconBg: "bg-pink-100" },
    cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-600", iconBg: "bg-cyan-100" },
    yellow: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", iconBg: "bg-amber-100" },
  };
  const c = colors[color] || colors.purple;

  return (
    <div
      className={`relative rounded-xl ${c.bg} border ${c.border} p-4 cursor-pointer transition-all hover:shadow-md`}
      onClick={() => details && setExpanded(!expanded)}
      data-testid={`flow-card-step-${step}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-[10px] font-bold ${c.text} uppercase tracking-wider`}>Step {step}</span>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-0.5">{title}</h4>
          <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
        {details && (
          <div className={`${c.text} flex-shrink-0 mt-1`}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      {expanded && details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-3 pt-3 border-t border-gray-200 space-y-1.5"
        >
          {details.map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className={`${c.text} mt-0.5 flex-shrink-0`}>&#8226;</span>
              <span>{d}</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="flex flex-col items-center">
        <div className="w-px h-3 bg-gradient-to-b from-purple-300 to-purple-200" />
        <ArrowDown className="w-3.5 h-3.5 text-purple-300" />
      </div>
    </div>
  );
}

function TelegramMessage({ title, content, buttons }: { title: string; content: string; buttons?: string[] }) {
  return (
    <div className="rounded-xl bg-[#1e2c3f] border border-[#2d4058] p-4" data-testid={`tg-msg-${title.replace(/\s/g, "-").toLowerCase()}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <span className="text-xs font-semibold text-blue-300">JetUP Partner Bot</span>
      </div>
      <div className="text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">{title}</div>
      <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed font-mono">{content}</div>
      {buttons && buttons.length > 0 && (
        <div className="mt-2 space-y-1">
          {buttons.map((btn, i) => (
            <div key={i} className="text-center py-1.5 rounded-md bg-[#2a3a56] text-blue-300 text-[10px] font-medium border border-[#3a4a66]">
              {btn}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InvitePageMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-[#0a0a1a] max-w-[280px] mx-auto shadow-lg" data-testid="invite-page-mockup">
      <div className="bg-gradient-to-br from-purple-900/30 via-[#0a0a1a] to-indigo-900/30 p-4 space-y-3">
        <div className="flex justify-center">
          <div className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[8px] font-medium flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Persönliche Einladung
          </div>
        </div>

        <div className="rounded-lg overflow-hidden bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/20 p-3 text-center">
          <div className="text-[8px] uppercase text-gray-500 font-bold tracking-wider mb-0.5">Webinar Banner</div>
          <div className="text-xs font-bold text-white">Investment Strategien 2026</div>
        </div>

        <div className="text-center space-y-0.5">
          <h3 className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-300">
            Investment Strategien 2026
          </h3>
          <p className="text-[10px] text-gray-400">
            Вас приглашает: <span className="text-purple-300 font-semibold">Max Mustermann</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-white/5 border border-white/10">
            <Calendar className="w-3 h-3 text-purple-400" />
            <div>
              <div className="text-[7px] text-gray-500 uppercase font-bold">Datum</div>
              <div className="text-[10px] text-white font-medium">15.03.2026</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-md bg-white/5 border border-white/10">
            <Clock className="w-3 h-3 text-purple-400" />
            <div>
              <div className="text-[7px] text-gray-500 uppercase font-bold">Uhrzeit</div>
              <div className="text-[10px] text-white font-medium">19:00 CET</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1">
          {[
            { label: "Tage", value: "03" },
            { label: "Std", value: "14" },
            { label: "Min", value: "27" },
            { label: "Sek", value: "42" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center p-1 rounded-md bg-purple-500/15 border border-purple-500/20">
              <span className="text-xs font-bold text-white">{item.value}</span>
              <span className="text-[6px] uppercase text-purple-300 font-semibold">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 p-3 rounded-lg bg-white/[0.05] border border-white/10">
          <h4 className="text-center text-[10px] font-bold text-white">Jetzt kostenlos registrieren</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/5 border border-white/10">
              <Users className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-[9px] text-gray-500">Vollständiger Name</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/5 border border-white/10">
              <AtSign className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-[9px] text-gray-500">E-Mail-Adresse</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-white/5 border border-white/10">
              <Phone className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-[9px] text-gray-500">Telefon (optional)</span>
            </div>
          </div>
          <div className="py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-center text-[10px] font-bold text-white">
            Kostenlos registrieren
          </div>
        </div>

        <div className="space-y-2 text-center">
          <div className="p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-semibold text-emerald-400">Registrierung erfolgreich!</p>
            <p className="text-[8px] text-emerald-500/70 mt-0.5">Du bist für das Event angemeldet.</p>
          </div>
          <div className="py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-[10px] font-bold text-white flex items-center justify-center gap-1">
            Zoom Meeting beitreten
            <ExternalLink className="w-2.5 h-2.5" />
          </div>
        </div>

        <div className="text-center">
          <span className="text-[7px] text-gray-600">Powered by JetUP</span>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowTab() {
  const [activeSection, setActiveSection] = useState<string | null>("overview");

  const sections = [
    { id: "overview", label: "System Overview", icon: Eye },
    { id: "invite", label: "Invite Page", icon: Globe },
    { id: "telegram", label: "TG Messages", icon: MessageSquare },
  ];

  return (
    <div className="space-y-6" data-testid="workflow-tab">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900" data-testid="text-page-title">Partner Bot Workflow</h2>
            <p className="text-xs text-gray-500">Visual diagram of the full partner workflow</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              const el = document.getElementById(`section-${s.id}`);
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
              setActiveSection(s.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              activeSection === s.id
                ? "bg-purple-100 text-purple-700 border border-purple-200"
                : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
            }`}
            data-testid={`nav-${s.id}`}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        <section id="section-overview" data-testid="section-overview">
          <SectionTitle icon={Eye}>System Overview — Full Workflow</SectionTitle>
          <p className="text-xs text-gray-500 mb-4">
            The complete partner workflow from registration through webinars to AI-powered follow-up.
            Click any card to expand details.
          </p>

          <div className="space-y-0 max-w-2xl">
            <FlowCard
              step={1}
              title="Partner Registration (Telegram Bot)"
              description="Partner sends /start to the bot, provides name, CU-number, phone (optional), email (optional)."
              icon={Bot}
              color="purple"
              details={[
                "Bot: @JetUPPartnerBot",
                "Registration flow: /start → Name → CU-Number → Phone (/skip) → Email (/skip)",
                "Data stored in partners table (telegramChatId, name, cuNumber, phone, email)",
                "Partner gets list of available commands after registration",
              ]}
            />
            <FlowConnector />

            <FlowCard
              step={2}
              title="Create Invite Link (/invite)"
              description="Partner selects a webinar from schedule → system generates a unique personal invite link."
              icon={Link2}
              color="blue"
              details={[
                "Bot shows inline keyboard with upcoming events from scheduleEvents table",
                "On selection: creates inviteEvent record with unique inviteCode",
                "Partner receives full link: https://jet-up.ai/invite/{code}",
                "Link includes event title, date, time, speaker info",
              ]}
            />
            <FlowConnector />

            <FlowCard
              step={3}
              title="Guest Opens Registration Page"
              description="Guest clicks the link → sees branded page with event details, countdown, and registration form."
              icon={Globe}
              color="green"
              details={[
                "InvitePage.tsx renders: banner, title, speaker, date/time, countdown timer",
                "Form fields: Full Name (required), Email (required), Phone (optional)",
                "Shows partner name: 'Вас приглашает: [Partner Name]'",
                "Dark theme with purple gradient, mobile-optimized",
              ]}
            />
            <FlowConnector />

            <FlowCard
              step={4}
              title="Guest Registers → Partner Gets Notified"
              description="Guest submits form → saved to DB → partner receives instant Telegram notification."
              icon={Bell}
              color="orange"
              details={[
                "POST /api/invite/{code}/register — saves to inviteGuests table",
                "After registration: success message + 'Zoom Meeting beitreten' button",
                "Bot sends notification to partner with guest name, email, phone",
                "Event guestCount is incremented automatically",
              ]}
            />
            <FlowConnector />

            <FlowCard
              step={5}
              title="Zoom Webinar + Data Sync"
              description="Webinar happens → system syncs attendance data from Zoom API (join/leave times, duration, Q&A)."
              icon={Video}
              color="cyan"
              details={[
                "Zoom API: Server-to-Server OAuth (Account ID, Client ID, Client Secret)",
                "Fetches participants via /v2/report/meetings/{id}/participants",
                "Fetches Q&A data via /v2/report/meetings/{id}/qa",
                "Matches Zoom participants to registered guests by email",
                "Stores in zoomAttendance table: joinTime, leaveTime, durationMinutes, questionsAsked",
              ]}
            />
            <FlowConnector />

            <FlowCard
              step={6}
              title="Partner Requests Report (/report)"
              description="Partner gets full event statistics: registrations, attendance, no-shows, anomalies."
              icon={BarChart3}
              color="pink"
              details={[
                "Report includes: total registered, Zoom joined, not joined",
                "Per-participant: email, join/leave times, duration, questions asked",
                "Highlights anomalies: registered but not on Zoom, on Zoom but not registered",
                "Average duration calculated across all Zoom participants",
              ]}
            />
            <FlowConnector />

            <FlowCard
              step={7}
              title="AI Follow-up (/followup)"
              description="Partner starts AI assistant → gets personalized follow-up messages for each guest based on their engagement."
              icon={Sparkles}
              color="yellow"
              details={[
                "OpenAI GPT generates personalized messages based on guest data",
                "Context includes: attendance duration, questions asked, click status",
                "Interactive chat: partner can ask for adjustments",
                "Messages in German, professional and friendly tone",
              ]}
            />
          </div>
        </section>

        <section id="section-invite" data-testid="section-invite">
          <SectionTitle icon={Globe}>Invite Page Mockup</SectionTitle>
          <p className="text-xs text-gray-500 mb-4">
            How the guest registration page looks when someone opens a partner's invite link.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <InvitePageMockup />
            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-600" />
                  Page Structure
                </h4>
                <div className="space-y-1.5 text-xs text-gray-600">
                  {[
                    { label: "Header", desc: "JetUP logo + 'Persönliche Einladung' badge" },
                    { label: "Banner", desc: "Event banner image from scheduleEvent" },
                    { label: "Title", desc: "Event title with gradient text" },
                    { label: "Invitation", desc: "'Вас приглашает: [Partner Name]'" },
                    { label: "Speaker", desc: "Speaker photo + name (from scheduleEvent)" },
                    { label: "Date/Time", desc: "Two-column grid with calendar and clock icons" },
                    { label: "Countdown", desc: "Live countdown timer (days/hours/min/sec)" },
                    { label: "Form", desc: "Name, Email, Phone (optional) inputs" },
                    { label: "Post-reg", desc: "Success message + 'Zoom Meeting beitreten' button" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2">
                      <span className="text-purple-600 font-semibold text-[11px] w-16 flex-shrink-0">{item.label}:</span>
                      <span className="text-gray-500 text-[11px]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-2">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  Technical Details
                </h4>
                <div className="space-y-1 text-[11px] text-gray-500">
                  <p>File: <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">client/src/pages/InvitePage.tsx</code></p>
                  <p>Route: <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">/invite/:code</code></p>
                  <p>API: <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">GET /api/invite/:code</code> + <code className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">POST /api/invite/:code/register</code></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="section-telegram" data-testid="section-telegram">
          <SectionTitle icon={MessageSquare}>Telegram Bot Messages</SectionTitle>
          <p className="text-xs text-gray-500 mb-4">
            Real message formats sent by the JetUP Partner Bot at each stage of the workflow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TelegramMessage
              title="Invite Link Created"
              content={`✅ Einladungslink erstellt!

📋 Event: Investment Strategien 2026
📅 15.03.2026 | 🕐 19:00
🎙 Speaker: Dennis Petrov

🔗 Dein Link:
https://jet-up.ai/invite/abc123

Teile diesen Link mit deinen Kontakten.
Du erhältst eine Benachrichtigung,
wenn sich jemand registriert!`}
            />

            <TelegramMessage
              title="New Registration Notification"
              content={`🎉 Neue Registrierung!

📋 Event: Investment Strategien 2026

👤 Name: Anna Schmidt
📧 E-Mail: anna@example.com
📱 Tel: +49 170 1234567

📊 Gesamt registriert: 5`}
            />

            <TelegramMessage
              title="/report Output"
              content={`📊 Event-Bericht: Investment Strategien 2026
📅 15.03.2026 | 🕐 19:00

📝 Registriert: 8 Gäste
✅ Zoom beigetreten: 6
❌ Nicht beigetreten: 2

📹 Zoom-Teilnehmer (API): 6
⏱ Ø 42 Min. | 💬 3 Fragen

  ✅ Anna Schmidt
     📧 anna@example.com
     ⏱ 19:01–20:15 (74 Min.) | 💬 2

  ❓ Unknown User
     📧 unknown@example.com
     ⏱ 19:30–19:45 (15 Min.)

⚠️ Registriert, aber nicht auf Zoom (2):
  • John Doe (john@example.com)
  • Lisa Müller (lisa@example.com)

🔍 Auf Zoom, aber nicht registriert (1):
  • Unknown User`}
              buttons={["🤖 KI Follow-up starten", "🔄 Zoom-Daten aktualisieren"]}
            />

            <TelegramMessage
              title="AI Follow-up Suggestion"
              content={`🤖 KI Follow-up Vorschläge

1. Anna Schmidt (74 Min., 2 Fragen)
"Hallo Anna! Vielen Dank für deine
aktive Teilnahme am Webinar. Deine
Fragen waren sehr relevant..."

2. Max Weber (65 Min., keine Fragen)
"Hallo Max! Schön, dass du dabei
warst. Falls du noch Fragen hast..."

3. John Doe (nicht teilgenommen)
"Hallo John! Leider konntest du nicht
dabei sein. Hier ist die Aufzeichnung..."`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
