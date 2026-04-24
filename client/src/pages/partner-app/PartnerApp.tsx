import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Users, BarChart3, Loader2, User, Hash, Phone, Mail, ArrowRight, LogIn, LogOut, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import UpcomingScreen from "./UpcomingScreen";
import PastScreen from "./PastScreen";
import ContactsScreen from "./ContactsScreen";
import StatisticsScreen from "./StatisticsScreen";
import { useLanguage, type Language } from "../../contexts/LanguageContext";
import { getPartnerAuthHeader, clearPartnerSession, getStoredTelegramId, hasPartnerSession } from "./partnerAuth";

const tabDefs = [
  { id: "upcoming", labelKey: "pa.nav.upcoming", icon: Calendar },
  { id: "past", labelKey: "pa.nav.past", icon: Clock },
  { id: "contacts", labelKey: "pa.nav.contacts", icon: Users },
  { id: "statistics", labelKey: "pa.nav.statistics", icon: BarChart3 },
] as const;

type TabId = (typeof tabDefs)[number]["id"];

interface PartnerProfile {
  partner: { id: number; name: string; cuNumber: string; status: string };
  stats: { totalInvited: number; totalAttended: number; conversionRate: number; totalEvents: number };
}

type AppState = "loading" | "needs-telegram-login" | "needs-registration" | "ready" | "error";
type ErrorKind = "server-error" | "feature-disabled";

function getInitialTab(): TabId {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab === "upcoming" || tab === "past" || tab === "contacts" || tab === "statistics") return tab;
  if (tab === "webinars" || tab === "dashboard") return "upcoming";
  if (tab === "reports" || tab === "ai") return "past";
  return "upcoming";
}

function getTelegramUsername(): string | null {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.username || null;
}

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const langs: Language[] = ["de", "en", "ru"];
  return (
    <div className="flex items-center gap-1" data-testid="language-selector">
      {langs.map(l => (
        <button key={l} onClick={() => setLanguage(l)}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${language === l ? "bg-blue-100 text-blue-700" : "text-gray-400 hover:bg-gray-100"}`}
          data-testid={`lang-${l}`}
        >{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

function TelegramLoginScreen() {
  const [botUsername, setBotUsername] = useState("JetUP_Partner_Bot");
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/partner-app/bot-config")
      .then(r => r.json())
      .then(data => { if (data.botUsername) setBotUsername(data.botUsername); })
      .catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-8 text-center" data-testid="telegram-login-screen">
      <div className="absolute top-4 right-4"><LanguageSelector /></div>
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
        <LogIn className="w-7 h-7 text-blue-600" />
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">{t("pa.login.title")}</h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">{t("pa.login.subtitle")}</p>

      <a
        href={`https://t.me/${botUsername}?start=open_app`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full max-w-xs px-5 py-3.5 rounded-xl text-white text-sm font-semibold transition-colors active:opacity-90"
        style={{ backgroundColor: "#0088cc" }}
        data-testid="button-open-telegram"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
        {t("pa.login.openTelegram")}
      </a>
      <p className="text-xs text-gray-400 mt-3 max-w-xs leading-relaxed">{t("pa.login.botHint")}</p>
    </div>
  );
}

function RegistrationScreen({
  telegramId,
  onRegistered,
  onAlreadyRegistered,
}: {
  telegramId: string;
  onRegistered: (profile: PartnerProfile) => void;
  onAlreadyRegistered: () => void;
}) {
  const [name, setName] = useState("");
  const [cuNumber, setCuNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  const telegramUsername = getTelegramUsername();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !cuNumber.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/partner-app/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getPartnerAuthHeader() },
        body: JSON.stringify({ name: name.trim(), cuNumber: cuNumber.trim(), phone: phone.trim() || null, email: email.trim() || null, telegramUsername }),
      });
      if (res.status === 409) {
        onAlreadyRegistered();
        return;
      }
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Registration failed"); }
      onRegistered(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative" style={{ WebkitOverflowScrolling: "touch" }} data-testid="registration-screen">
      <div className="absolute top-4 right-4 z-10"><LanguageSelector /></div>
      <div className="flex-1 px-6 py-10 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-5 mx-auto shadow-lg shadow-blue-200">
            <span className="text-2xl">🚀</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{t("pa.register.title")}</h1>
          <p className="text-sm text-gray-500 leading-relaxed">{t("pa.register.subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: t("pa.register.name"), icon: User, value: name, setter: setName, type: "text", inputMode: "text" as const, required: true, testId: "input-register-name", enterKey: "next" as const },
            { label: t("pa.register.cu"), icon: Hash, value: cuNumber, setter: setCuNumber, type: "text", inputMode: "text" as const, required: true, testId: "input-register-cu", enterKey: "next" as const },
            { label: t("pa.register.phone"), icon: Phone, value: phone, setter: setPhone, type: "tel", inputMode: "tel" as const, required: false, placeholder: "+49 123 456 7890", testId: "input-register-phone", enterKey: "next" as const },
            { label: t("pa.register.email"), icon: Mail, value: email, setter: setEmail, type: "email", inputMode: "email" as const, required: false, placeholder: "your@email.com", testId: "input-register-email", enterKey: "done" as const },
          ].map(f => (
            <div key={f.testId}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <f.icon size={14} /> {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} required={f.required}
                placeholder={"placeholder" in f ? f.placeholder : undefined}
                inputMode={f.inputMode}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint={f.enterKey}
                onTouchStart={e => { e.currentTarget.focus(); }}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ fontSize: "16px", WebkitTextSecurity: "none", WebkitUserSelect: "text", userSelect: "text", touchAction: "manipulation" } as React.CSSProperties}
                data-testid={f.testId}
              />
            </div>
          ))}
          {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600" data-testid="text-register-error">{error}</div>}
          <button type="submit" disabled={submitting || !name.trim() || !cuNumber.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 mt-6"
            data-testid="button-register-submit"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{t("pa.register.submit")}<ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

function ErrorScreen({ kind, onRetry }: { kind: ErrorKind; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white px-8 text-center" data-testid="error-screen">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        {kind === "server-error" ? (
          <WifiOff className="w-7 h-7 text-red-400" />
        ) : (
          <AlertCircle className="w-7 h-7 text-amber-400" />
        )}
      </div>
      <p className="text-sm text-gray-600 mb-6 max-w-xs leading-relaxed" data-testid="text-error-message">
        {kind === "server-error" ? t("pa.error.serverError") : t("pa.error.featureDisabled")}
      </p>
      {kind === "server-error" && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 active:opacity-90"
          data-testid="button-retry"
        >
          <RefreshCw size={15} /> {t("pa.error.retry")}
        </button>
      )}
    </div>
  );
}

async function initMiniAppSession(): Promise<"ok" | "not-registered" | "error"> {
  const tg = (window as any).Telegram?.WebApp;
  if (!tg?.initData) return "error";

  if (process.env.NODE_ENV === "development" && !tg.initData) return "error";

  try {
    const res = await fetch("/api/partner-app/validate-init-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData }),
    });
    const data = await res.json();

    if (res.status === 404 && data.regToken) {
      localStorage.setItem("partnerWebToken", data.regToken);
      localStorage.setItem("partnerTelegramId", data.telegramId);
      sessionStorage.removeItem("partnerLoggedOut");
      return "not-registered";
    }
    if (!res.ok) return "error";

    localStorage.setItem("partnerWebToken", data.partnerToken);
    localStorage.setItem("partnerTelegramId", data.telegramId);
    sessionStorage.removeItem("partnerLoggedOut");
    return "ok";
  } catch {
    return "error";
  }
}

export default function PartnerApp() {
  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [appState, setAppState] = useState<AppState>("loading");
  const [errorKind, setErrorKind] = useState<ErrorKind>("server-error");
  const { t } = useLanguage();

  const telegramId = getStoredTelegramId();

  const loadProfile = useCallback(async () => {
    setAppState("loading");
    const authHeaders = getPartnerAuthHeader();
    if (!authHeaders["x-partner-token"] && !authHeaders["x-telegram-id"]) {
      setAppState("needs-telegram-login");
      return;
    }
    try {
      const r = await fetch("/api/partner-app/profile", { headers: authHeaders });
      if (r.status === 401) { setAppState("needs-registration"); return; }
      if (r.status === 404) { setErrorKind("feature-disabled"); setAppState("error"); return; }
      if (!r.ok) { setErrorKind("server-error"); setAppState("error"); return; }
      setProfile(await r.json());
      setAppState("ready");
    } catch {
      setErrorKind("server-error");
      setAppState("error");
    }
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("partnerLoggedOut") === "true") {
      setAppState("needs-telegram-login");
      return;
    }

    const tg = (window as any).Telegram?.WebApp;

    if (tg?.initData) {
      initMiniAppSession().then(result => {
        if (result === "not-registered") {
          setAppState("needs-registration");
        } else if (result === "ok") {
          loadProfile();
        } else {
          setErrorKind("server-error");
          setAppState("error");
        }
      });
      return;
    }

    if (hasPartnerSession()) {
      loadProfile();
      return;
    }

    setAppState("needs-telegram-login");
  }, [loadProfile]);

  const handleLogout = useCallback(() => {
    clearPartnerSession();
    setProfile(null);
    setAppState("needs-telegram-login");
  }, []);

  const handleRetry = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  if (appState === "loading") return <div className="h-full flex flex-col items-center justify-center bg-white"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>;
  if (appState === "needs-telegram-login") return <TelegramLoginScreen />;
  if (appState === "error") return <ErrorScreen kind={errorKind} onRetry={handleRetry} />;
  if (appState === "needs-registration" && telegramId) return (
    <RegistrationScreen
      telegramId={telegramId}
      onRegistered={p => { setProfile(p); setAppState("ready"); }}
      onAlreadyRegistered={loadProfile}
    />
  );
  if (!profile) return <div className="h-full flex flex-col items-center justify-center bg-white"><Loader2 className="w-6 h-6 text-gray-400 animate-spin" /></div>;

  const isTelegramContext = !!(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;

  return (
    <div className="h-full flex flex-col bg-[#F5F5F7] overflow-hidden partner-app-shell">
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={14} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-700" data-testid="text-partner-name">{profile.partner.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          {!isTelegramContext && (
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 active:bg-gray-200"
              data-testid="button-logout"
            >
              <LogOut size={14} /> {t("pa.logout")}
            </button>
          )}
        </div>
      </div>

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="h-full overflow-y-auto no-scrollbar"
          >
            {activeTab === "upcoming" && <UpcomingScreen telegramId={telegramId ?? "demo"} />}
            {activeTab === "past" && <PastScreen telegramId={telegramId ?? "demo"} />}
            {activeTab === "contacts" && <ContactsScreen telegramId={telegramId ?? "demo"} />}
            {activeTab === "statistics" && <StatisticsScreen telegramId={telegramId ?? "demo"} profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="flex-shrink-0 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-4 pt-2 pb-1">
          {tabDefs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center py-1.5 gap-1 min-w-[56px] transition-all active:scale-95"
                data-testid={`partner-tab-${tab.id}`}
              >
                <tab.icon size={20} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-blue-600" : "text-gray-400"} />
                <span className={`text-[10px] leading-none ${isActive ? "font-semibold text-blue-600" : "font-medium text-gray-400"}`}>
                  {t(tab.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
