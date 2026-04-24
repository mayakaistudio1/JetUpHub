import React from "react";
import { motion } from "framer-motion";
import { Video, MessageSquare } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface HeroSectionProps {
  onOpenChat: () => void;
  onOpenLive: () => void;
  dimmed?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onOpenChat, onOpenLive, dimmed }) => {
  const { t } = useLanguage();

  return (
    <div className="ph-hero">
      <div className="ph-hero-bg">
        <img
          src="/dennis-photo.png"
          alt="Dennis"
          className="ph-hero-img"
          data-testid="img-partner-hero"
        />
        <div className={`ph-hero-gradient ${dimmed ? "ph-hero-dimmed" : ""}`} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: dimmed ? 0 : 1, y: dimmed ? 10 : 0 }}
        transition={{ duration: 0.4 }}
        className="ph-hero-content"
      >
        <h1 className="ph-hero-name" data-testid="text-partner-name">Dennis</h1>
        <p className="ph-hero-role" data-testid="text-partner-role">{t('pdh.role')}</p>
        <p className="ph-hero-tagline">
          {t('pdh.tagline')}
        </p>

        <div className="ph-hero-btns">
          <button
            className="ph-btn-primary"
            onClick={onOpenLive}
            data-testid="btn-live-call"
          >
            <Video size={18} />
            {t('pdh.btnLive')}
          </button>
          <button
            className="ph-btn-glass"
            onClick={onOpenChat}
            data-testid="btn-open-chat"
          >
            <MessageSquare size={18} />
            {t('pdh.btnChat')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
