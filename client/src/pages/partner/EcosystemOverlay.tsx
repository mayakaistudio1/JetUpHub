import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { EcoNavContext } from "@/contexts/EcoNavContext";
import HomePage from "../HomePage";
import TradingHubPage from "../TradingHubPage";
import PartnerHubPage from "../PartnerHubPage";
import SchedulePage from "../SchedulePage";
import TutorialsPage from "../TutorialsPage";
import PromoDetailPage from "../PromoDetailPage";
import MariaPage from "../MariaPage";

interface EcosystemOverlayProps {
  onClose: () => void;
}

const PAGE_MAP: Record<string, React.FC> = {
  "/": HomePage,
  "/trading": TradingHubPage,
  "/partner": PartnerHubPage,
  "/schedule": SchedulePage,
  "/tutorials": TutorialsPage,
  "/promo": PromoDetailPage,
  "/maria": MariaPage,
};

const EcosystemOverlay: React.FC<EcosystemOverlayProps> = ({ onClose }) => {
  const [currentPath, setCurrentPath] = useState("/");

  const navigate = useCallback((to: string) => {
    const cleanPath = to.split("?")[0];
    if (PAGE_MAP[cleanPath]) {
      setCurrentPath(cleanPath);
    }
  }, []);

  const PageComponent = PAGE_MAP[currentPath] || HomePage;
  const isSubPage = currentPath !== "/";

  return (
    <motion.div
      className="eco-overlay"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
    >
      <div className="eco-header">
        <div className="eco-header-row">
          <button className="eco-back-btn" onClick={onClose} data-testid="btn-back-to-dennis">
            <ArrowLeft size={18} />
            <span>Вернуться к Денису</span>
          </button>
        </div>
        {isSubPage && (
          <button
            className="eco-sub-back-btn"
            onClick={() => setCurrentPath("/")}
            data-testid="btn-eco-back-home"
          >
            <ChevronLeft size={16} />
            <span>Главная</span>
          </button>
        )}
      </div>
      <div className="eco-content">
        <EcoNavContext.Provider value={{ navigate }}>
          <PageComponent key={currentPath} />
        </EcoNavContext.Provider>
      </div>
    </motion.div>
  );
};

export default EcosystemOverlay;
