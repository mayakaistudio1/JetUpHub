import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { initTelegram } from "@/lib/telegram";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { SofiaSessionProvider } from "@/contexts/SofiaSessionContext";
import SofiaOverlay from "@/components/SofiaOverlay";

import HomePage from "@/pages/HomePage";
import MariaPage from "@/pages/MariaPage";
import TradingHubPage from "@/pages/TradingHubPage";
import PartnerHubPage from "@/pages/PartnerHubPage";
import SchedulePage from "@/pages/SchedulePage";
import TutorialsPage from "@/pages/TutorialsPage";
import PromoDetailPage from "@/pages/PromoDetailPage";
import TabBar from "@/components/TabBar";
import AdminPage from "@/pages/AdminPage";
import TurkeyPromoPreview from "@/pages/TurkeyPromoPreview";
import EventDetailPage from "@/pages/EventDetailPage";
import PromoSinglePage from "@/pages/PromoSinglePage";
import PartnerDigitalHub from "@/pages/PartnerDigitalHub";
import LiveCallScreen from "@/pages/partner/LiveCallScreen";
import PromoBanner from "@/components/PromoBanner";
import InvitePage from "@/pages/InvitePage";
import PersonalInvitePage from "@/pages/PersonalInvitePage";
import PromoAdminPage from "@/pages/PromoAdminPage";
import PartnerApp from "@/pages/partner-app/PartnerApp";
import BrollGalleryPage from "@/pages/BrollGalleryPage";
import AmaPage from "@/pages/AmaPage";
import InteractivePresentation from "@/pages/partner/InteractivePresentation";

const PresentationPage = React.lazy(() => import("@/pages/PresentationPage"));
const AILandingPage = React.lazy(() => import("@/pages/AILandingPage"));
const ExplorePage = React.lazy(() => import("@/pages/ExplorePage"));

function AppContent() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    initTelegram();
  }, []);

  const basePath = location.split("?")[0];

  if (basePath === "/admin") {
    return <AdminPage />;
  }

  if (basePath === "/promo-admin") {
    return <PromoAdminPage />;
  }

  if (basePath === "/broll-gallery") {
    return <BrollGalleryPage />;
  }

  if (basePath === "/export-slide" && import.meta.env.DEV) {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    const ALLOWED_LANGS = ["de", "ru", "en"] as const;
    const ALLOWED_SCREENS = [
      "cinema", "s1", "s2", "path",
      "c1", "c2", "c3", "c4",
      "p1", "p2", "p3", "p4", "promo",
      "final",
    ] as const;
    const langParam = params.get("lang") ?? "de";
    const screenParam = params.get("screen") ?? "cinema";
    const pathParam = params.get("path");
    const lang = (ALLOWED_LANGS as readonly string[]).includes(langParam)
      ? (langParam as typeof ALLOWED_LANGS[number])
      : "de";
    const screen = (ALLOWED_SCREENS as readonly string[]).includes(screenParam)
      ? (screenParam as typeof ALLOWED_SCREENS[number])
      : "cinema";
    const initialPath: "client" | "partner" | null =
      pathParam === "client" || pathParam === "partner" ? pathParam : null;
    return (
      <InteractivePresentation
        onClose={() => {}}
        language={lang}
        initialScreen={screen}
        initialPath={initialPath}
        staticMode
      />
    );
  }

  if (basePath.startsWith("/partner-app")) {
    return <PartnerApp />;
  }

  if (basePath === "/promo-preview") {
    return <TurkeyPromoPreview />;
  }

  if (basePath === "/promo-banner") {
    return <PromoBanner />;
  }

  if (basePath === "/presentation" && import.meta.env.DEV) {
    return (
      <React.Suspense fallback={<div className="fixed inset-0 bg-black" />}>
        <PresentationPage />
      </React.Suspense>
    );
  }

  if (basePath === "/ai-landing" && import.meta.env.DEV) {
    return (
      <React.Suspense fallback={<div className="fixed inset-0 bg-black" />}>
        <AILandingPage />
      </React.Suspense>
    );
  }

  if (basePath === "/explore") {
    return (
      <React.Suspense fallback={<div className="fixed inset-0 bg-black" />}>
        <ExplorePage />
      </React.Suspense>
    );
  }

  const eventMatch = basePath.match(/^\/event\/(\d+)$/);
  const promoSingleMatch = basePath.match(/^\/promo\/(\d+)$/);
  const partnerMatch = basePath.match(/^\/p\/[\w-]+$/);
  const inviteMatch = basePath.match(/^\/invite\/([\w-]+)$/);
  const personalInviteMatch = basePath.match(/^\/personal-invite\/([\w-]+)$/);
  const directPartnerMatch = basePath === "/dennis";

  const renderPage = () => {
    if (basePath === "/dennis/live") return <LiveCallScreen />;
    if (eventMatch) return <EventDetailPage />;
    if (promoSingleMatch) return <PromoSinglePage />;
    if (personalInviteMatch) return <PersonalInvitePage />;
    if (inviteMatch) return <InvitePage />;
    if (partnerMatch || directPartnerMatch) return <PartnerDigitalHub />;

    switch (basePath) {
      case "/":
        return <HomePage />;
      case "/maria":
        return <MariaPage />;
      case "/trading":
        return <TradingHubPage />;
      case "/partner":
        return <PartnerHubPage />;
      case "/schedule":
        return <SchedulePage />;
      case "/tutorials":
        return <TutorialsPage />;
      case "/promo":
        return <PromoDetailPage />;
      case "/ama":
        return <AmaPage />;
      default:
        return <HomePage />;
    }
  };

  const showTabBar = basePath === "/" || basePath === "/maria";

  const isFullPageRoute = !!(inviteMatch || personalInviteMatch || eventMatch || basePath === "/ama");

  return (
    <div className={`bg-background text-foreground font-sans flex justify-center w-full ${isFullPageRoute ? 'min-h-[100dvh]' : 'h-[100dvh] overflow-hidden'}`}>
      <div className={`w-full max-w-[420px] relative bg-background shadow-2xl ${isFullPageRoute ? 'min-h-full' : 'h-full flex flex-col overflow-hidden'}`}>
        <main className={`flex-1 relative ${isFullPageRoute ? 'overflow-y-auto no-scrollbar' : 'overflow-hidden no-scrollbar'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={basePath}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={isFullPageRoute ? '' : 'h-full overflow-hidden'}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {showTabBar && (
          <TabBar 
            currentPath={basePath} 
            onNavigate={setLocation} 
          />
        )}
      </div>
    </div>
  );
}

function SofiaShell() {
  const { language } = useLanguage();
  return (
    <SofiaSessionProvider language={language}>
      <AppContent />
      <SofiaOverlay />
    </SofiaSessionProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <SofiaShell />
    </LanguageProvider>
  );
}

export default App;
