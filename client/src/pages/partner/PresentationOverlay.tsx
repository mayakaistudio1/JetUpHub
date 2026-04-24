import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Video,
  Link,
  MessageSquare,
  Send,
  List,
  Globe,
  Shield,
  TrendingUp,
  Cpu,
  Zap,
  User,
  MessageCircle,
  CheckCircle,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type { SharedMessage } from "../PartnerDigitalHub";
import FinancialBackground from "./FinancialBackground";
import EcosystemMapSlide from "./EcosystemMapSlide";
import { useLanguage } from "../../contexts/LanguageContext";

interface PresentationOverlayProps {
  onBackToChat: () => void;
  onShowEcosystem: () => void;
  messages: SharedMessage[];
  addMessage: (msg: Omit<SharedMessage, "id">) => number;
  updateMessage: (id: number, text: string) => void;
}

interface Chip {
  text: string;
  intent: string;
}

interface InteractiveItem {
  label: string;
  description: string;
  color?: string;
}

interface Slide {
  id: number;
  title: string;
  text: string;
  image: string;
  accent: string;
  chips: Chip[];
  type: "standard" | "ecosystem";
  interactiveType?: "security-points" | "strategy-cards" | "graph-points" | "ai-nodes";
  interactiveItems?: InteractiveItem[];
  insightKey?: string;
}

function buildSlides(t: (key: string) => string): Slide[] {
  return [
    {
      id: 1,
      title: t('pdh.s1.title'),
      text: t('pdh.s1.text'),
      image: "/images/presentation/scene_01.png",
      accent: "#7C3AED",
      type: "standard",
      chips: [
        { text: t('pdh.s1.c1'), intent: "REALITY_WHY" },
        { text: t('pdh.s1.c2'), intent: "REALITY_MISTAKES" },
      ],
    },
    {
      id: 2,
      title: t('pdh.s2.title'),
      text: t('pdh.s2.text'),
      image: "/images/presentation/scene_02.png",
      accent: "#EF4444",
      type: "standard",
      chips: [
        { text: t('pdh.s2.c1'), intent: "DIAGNOSIS_LEADER" },
        { text: t('pdh.s2.c2'), intent: "DIAGNOSIS_EXIT" },
      ],
    },
    {
      id: 3,
      title: t('pdh.s3.title'),
      text: t('pdh.s3.text'),
      image: "/images/presentation/scene_03.png",
      accent: "#8B5CF6",
      type: "standard",
      insightKey: 'pdh.insight.s3',
      chips: [
        { text: t('pdh.s3.c1'), intent: "MODEL_THREE" },
        { text: t('pdh.s3.c2'), intent: "MODEL_MISSING" },
      ],
    },
    {
      id: 4,
      title: t('pdh.s4.title'),
      text: t('pdh.s4.text'),
      image: "/images/presentation/scene_04.png",
      accent: "#22C55E",
      type: "standard",
      interactiveType: "security-points",
      interactiveItems: [
        { label: t('pdh.s4.i1.label'), description: t('pdh.s4.i1.desc'), color: "#22C55E" },
        { label: t('pdh.s4.i2.label'), description: t('pdh.s4.i2.desc'), color: "#3B82F6" },
        { label: t('pdh.s4.i3.label'), description: t('pdh.s4.i3.desc'), color: "#F59E0B" },
      ],
      chips: [
        { text: t('pdh.s4.c1'), intent: "SAFETY_CAPITAL" },
        { text: t('pdh.s4.c2'), intent: "SAFETY_WITHDRAW" },
      ],
    },
    {
      id: 5,
      title: t('pdh.s5.title'),
      text: t('pdh.s5.text'),
      image: "/images/presentation/scene_05.png",
      accent: "#22C55E",
      type: "standard",
      interactiveType: "strategy-cards",
      interactiveItems: [
        { label: t('pdh.s5.i1.label'), description: t('pdh.s5.i1.desc'), color: "#22C55E" },
        { label: t('pdh.s5.i2.label'), description: t('pdh.s5.i2.desc'), color: "#3B82F6" },
        { label: t('pdh.s5.i3.label'), description: t('pdh.s5.i3.desc'), color: "#F59E0B" },
      ],
      insightKey: 'pdh.insight.s5',
      chips: [
        { text: t('pdh.s5.c1'), intent: "PARTNER_COMMISSIONS" },
        { text: t('pdh.s5.c2'), intent: "PARTNER_EARNINGS" },
        { text: t('pdh.s5.c3'), intent: "PARTNER_INFINITY" },
      ],
    },
    {
      id: 6,
      title: t('pdh.s6.title'),
      text: t('pdh.s6.text'),
      image: "/images/presentation/scene_06.png",
      accent: "#10B981",
      type: "standard",
      interactiveType: "security-points",
      interactiveItems: [
        { label: t('pdh.s6.i1.label'), description: t('pdh.s6.i1.desc'), color: "#F59E0B" },
        { label: t('pdh.s6.i2.label'), description: t('pdh.s6.i2.desc'), color: "#EF4444" },
        { label: t('pdh.s6.i3.label'), description: t('pdh.s6.i3.desc'), color: "#A855F7" },
      ],
      insightKey: 'pdh.insight.s6',
      chips: [
        { text: t('pdh.s6.c1'), intent: "PARTNER_GLOBAL_POOL" },
        { text: t('pdh.s6.c2'), intent: "PARTNER_INCENTIVES" },
        { text: t('pdh.s6.c3'), intent: "PARTNER_CAREER" },
      ],
    },
    {
      id: 7,
      title: t('pdh.s7.title'),
      text: t('pdh.s7.text'),
      image: "/images/presentation/scene_07.png",
      accent: "#F97316",
      type: "standard",
      chips: [
        { text: t('pdh.s7.c1'), intent: "SCALE_DUPLICATION" },
        { text: t('pdh.s7.c2'), intent: "SCALE_SYSTEM" },
      ],
    },
    {
      id: 8,
      title: t('pdh.s8.title'),
      text: t('pdh.s8.text'),
      image: "/images/presentation/scene_08.png",
      accent: "#E88FEC",
      type: "standard",
      interactiveType: "ai-nodes",
      interactiveItems: [
        { label: t('pdh.s8.i1.label'), description: t('pdh.s8.i1.desc'), color: "#A855F7" },
        { label: t('pdh.s8.i2.label'), description: t('pdh.s8.i2.desc'), color: "#3B82F6" },
        { label: t('pdh.s8.i3.label'), description: t('pdh.s8.i3.desc'), color: "#22C55E" },
        { label: t('pdh.s8.i4.label'), description: t('pdh.s8.i4.desc'), color: "#F59E0B" },
      ],
      insightKey: 'pdh.insight.s8',
      chips: [
        { text: t('pdh.s8.c1'), intent: "AI_REPLACE" },
        { text: t('pdh.s8.c2'), intent: "AI_QUALIFY" },
        { text: t('pdh.s8.c3'), intent: "AI_LIVE" },
      ],
    },
    {
      id: 9,
      title: t('pdh.s9.title'),
      text: t('pdh.s9.text'),
      image: "/images/presentation/scene_09.png",
      accent: "#A855F7",
      type: "ecosystem",
      chips: [
        { text: t('pdh.s9.c1'), intent: "ECO_CONNECTION" },
        { text: t('pdh.s9.c2'), intent: "ECO_PARTNER_VALUE" },
      ],
    },
    {
      id: 10,
      title: t('pdh.s10.title'),
      text: t('pdh.s10.text'),
      image: "/images/presentation/scene_10.png",
      accent: "#7C3AED",
      type: "standard",
      chips: [],
    },
  ];
}

const SecurityPoints: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-security-row"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    {items.map((item, i) => (
      <button
        key={i}
        className="si-security-pill"
        onClick={() => onSelect(item)}
        data-testid={`security-point-${i}`}
      >
        <span className="si-pill-dot" style={{ background: item.color }} />
        <span className="si-pill-label">{item.label}</span>
      </button>
    ))}
  </motion.div>
);

const StrategyCards: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-strategy-row"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    {items.map((item, i) => (
      <button
        key={i}
        className="si-strategy-card"
        onClick={() => onSelect(item)}
        style={{ borderColor: `${item.color}40` }}
        data-testid={`strategy-card-${i}`}
      >
        <span className="si-strategy-indicator" style={{ background: item.color }} />
        <span className="si-strategy-name">{item.label}</span>
      </button>
    ))}
  </motion.div>
);

const GraphPoints: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-graph-container"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    <svg viewBox="0 0 300 60" className="si-graph-svg">
      <polyline points="10,50 80,35 180,20 290,8" fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth="2" />
      <polyline points="10,50 80,35 180,20 290,8" fill="none" stroke="rgba(16,185,129,0.6)" strokeWidth="1.5" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="2s" repeatCount="indefinite" />
      </polyline>
    </svg>
    <div className="si-graph-points">
      {items.map((item, i) => (
        <button
          key={i}
          className="si-graph-point"
          onClick={() => onSelect(item)}
          data-testid={`graph-point-${i}`}
        >
          <span className="si-graph-dot" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}>
            <span className="si-graph-dot-ping" style={{ borderColor: item.color }} />
          </span>
          <span className="si-graph-label">{item.label}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

const AiNodes: React.FC<{ items: InteractiveItem[]; onSelect: (item: InteractiveItem) => void }> = ({ items, onSelect }) => (
  <motion.div
    className="si-ai-grid"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.55, duration: 0.4 }}
  >
    {items.map((item, i) => (
      <button
        key={i}
        className="si-ai-node"
        onClick={() => onSelect(item)}
        data-testid={`ai-node-${i}`}
      >
        <span className="si-ai-dot" style={{ background: item.color, boxShadow: `0 0 10px ${item.color}60` }} />
        <span className="si-ai-label">{item.label}</span>
      </button>
    ))}
    <svg className="si-ai-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="25" y1="25" x2="75" y2="25" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="25" y1="75" x2="75" y2="75" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="25" y1="25" x2="25" y2="75" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="75" y1="25" x2="75" y2="75" stroke="rgba(168,85,247,0.2)" strokeWidth="0.5" />
      <line x1="25" y1="25" x2="75" y2="75" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
      <line x1="75" y1="25" x2="25" y2="75" stroke="rgba(168,85,247,0.15)" strokeWidth="0.5" />
    </svg>
  </motion.div>
);

const MicroInfoCard: React.FC<{ item: InteractiveItem; onClose: () => void }> = ({ item, onClose }) =>
  ReactDOM.createPortal(
    <>
      <motion.div
        className="si-micro-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="si-micro-card"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info: PanInfo) => { if (info.offset.y > 80) onClose(); }}
      >
        <div className="si-micro-handle" />
        <div className="si-micro-header">
          <span className="si-micro-dot" style={{ background: item.color }} />
          <span className="si-micro-title">{item.label}</span>
          <button className="si-micro-close" onClick={onClose}><X size={14} /></button>
        </div>
        <p className="si-micro-desc">{item.description}</p>
      </motion.div>
    </>,
    document.body
  );

const DennisInsight: React.FC<{ insightKey: string; t: (key: string) => string }> = ({ insightKey, t }) => (
  <motion.div
    className="pres-insight"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.8, duration: 0.5 }}
    data-testid="dennis-insight"
  >
    <div className="pres-insight-avatar">
      <img src="/dennis-photo.png" alt="Dennis" />
    </div>
    <div className="pres-insight-content">
      <span className="pres-insight-label">{t('pdh.dennisInsight')}</span>
      <p className="pres-insight-text">"{t(insightKey)}"</p>
    </div>
  </motion.div>
);

const AIComparison: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  return (
    <motion.div
      className="pres-ai-compare"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      data-testid="ai-comparison"
    >
      <div className="pres-ai-col">
        <div className="pres-ai-col-header col-off">
          <ToggleLeft size={14} />
          {t('pdh.withoutAI')}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="pres-ai-item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.08, duration: 0.25 }}
          >
            <span className="pres-ai-item-dot dot-red" />
            {t(`pdh.noai.${i}`)}
          </motion.div>
        ))}
      </div>
      <div className="pres-ai-col">
        <div className="pres-ai-col-header col-on">
          <ToggleRight size={14} />
          {t('pdh.withAI')}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="pres-ai-item"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.08, duration: 0.25 }}
          >
            <span className="pres-ai-item-dot dot-green" />
            {t(`pdh.withai.${i}`)}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const LivePipeline: React.FC<{ t: (key: string) => string; isActive: boolean }> = ({ t, isActive }) => {
  const steps = [
    { icon: User, key: 'pdh.pipeline.step1', color: '#7C3AED' },
    { icon: MessageCircle, key: 'pdh.pipeline.step2', color: '#3B82F6' },
    { icon: CheckCircle, key: 'pdh.pipeline.step3', color: '#F59E0B' },
    { icon: Calendar, key: 'pdh.pipeline.step4', color: '#22C55E' },
  ];

  return (
    <motion.div
      className="pres-pipeline"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
    >
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <motion.div
            className="pres-pipeline-step"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.8 + i * 0.4, duration: 0.35, ease: "easeOut" }}
          >
            <div className="pres-pipeline-icon" style={{ background: `${step.color}25`, borderColor: `${step.color}50` }}>
              <step.icon size={16} style={{ color: step.color }} />
            </div>
            <span className="pres-pipeline-label">{t(step.key)}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              className="pres-pipeline-arrow"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={isActive ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
              transition={{ delay: 1.0 + i * 0.4, duration: 0.3 }}
            >
              <ChevronRight size={14} />
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

const JetUPEngine: React.FC<{ t: (key: string) => string }> = ({ t }) => {
  const parts = [
    { key: 'pdh.engine.products', color: '#3B82F6', delay: 0.4 },
    { key: 'pdh.engine.ai', color: '#A855F7', delay: 0.9 },
    { key: 'pdh.engine.partners', color: '#22C55E', delay: 1.4 },
  ];

  return (
    <motion.div
      className="pres-engine"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <motion.h3
        className="pres-engine-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {t('pdh.engine.title')}
      </motion.h3>
      <div className="pres-engine-parts">
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <motion.span
                className="pres-engine-plus"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: part.delay - 0.2, duration: 0.3 }}
              >+</motion.span>
            )}
            <motion.div
              className="pres-engine-block"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: part.delay, duration: 0.4, ease: "easeOut" }}
              style={{ borderColor: `${part.color}50`, background: `${part.color}12` }}
            >
              <span className="pres-engine-dot" style={{ background: part.color }} />
              {t(part.key)}
            </motion.div>
          </React.Fragment>
        ))}
      </div>
      <motion.div
        className="pres-engine-equals"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 1.9, duration: 0.3 }}
      >=</motion.div>
      <motion.div
        className="pres-engine-result"
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.5, type: "spring", damping: 15 }}
      >
        <Zap size={20} />
        {t('pdh.engine.result')}
      </motion.div>
    </motion.div>
  );
};

interface FactItem {
  id: string;
  titleKey: string;
  descKey: string;
}

const SLIDE_FACTS: Record<number, FactItem[]> = {
  1: [
    { id: 'f1_1', titleKey: 'pdh.fact.1.1.t', descKey: 'pdh.fact.1.1.d' },
    { id: 'f1_2', titleKey: 'pdh.fact.1.2.t', descKey: 'pdh.fact.1.2.d' },
  ],
  2: [
    { id: 'f2_1', titleKey: 'pdh.fact.2.1.t', descKey: 'pdh.fact.2.1.d' },
    { id: 'f2_2', titleKey: 'pdh.fact.2.2.t', descKey: 'pdh.fact.2.2.d' },
  ],
  7: [
    { id: 'f7_1', titleKey: 'pdh.fact.7.1.t', descKey: 'pdh.fact.7.1.d' },
    { id: 'f7_2', titleKey: 'pdh.fact.7.2.t', descKey: 'pdh.fact.7.2.d' },
  ],
  8: [
    { id: 'f8_1', titleKey: 'pdh.fact.8.1.t', descKey: 'pdh.fact.8.1.d' },
    { id: 'f8_2', titleKey: 'pdh.fact.8.2.t', descKey: 'pdh.fact.8.2.d' },
  ],
  9: [
    { id: 'f9_1', titleKey: 'pdh.fact.9.1.t', descKey: 'pdh.fact.9.1.d' },
    { id: 'f9_2', titleKey: 'pdh.fact.9.2.t', descKey: 'pdh.fact.9.2.d' },
  ],
};

const SLIDE_BG_PRESETS: Record<number, string> = {
  1: 'market', 2: 'market',
  3: 'market', 4: 'partner',
  5: 'partner', 6: 'partner', 7: 'partner',
  8: 'tech', 9: 'tech', 10: 'partner',
};

const JOURNEY_GROUPS = [
  { id: 'market', slides: [1, 2], color: '#EF4444', labelKey: 'pdh.journey.market' },
  { id: 'solution', slides: [3, 4], color: '#A855F7', labelKey: 'pdh.journey.solution' },
  { id: 'partner', slides: [5, 6, 7], color: '#22C55E', labelKey: 'pdh.journey.partner' },
  { id: 'ai', slides: [8], color: '#3B82F6', labelKey: 'pdh.journey.ai' },
  { id: 'ecosystem', slides: [9, 10], color: '#F59E0B', labelKey: 'pdh.journey.ecosystem' },
];

const JourneyProgress: React.FC<{
  currentSlide: number;
  visitedSlides: Set<number>;
  t: (key: string) => string;
  onNavigate: (slideIndex: number) => void;
}> = ({ currentSlide, visitedSlides, t, onNavigate }) => (
  <div className="pres-journey-bar" data-testid="journey-progress">
    {JOURNEY_GROUPS.map((group) => {
      const isCurrent = group.slides.includes(currentSlide);
      const isCompleted = group.slides.every((s) => visitedSlides.has(s));
      const isPartial = group.slides.some((s) => visitedSlides.has(s));
      return (
        <button
          key={group.id}
          className={`pres-journey-dot ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : isPartial ? 'partial' : ''}`}
          onClick={() => onNavigate(group.slides[0] - 1)}
          data-testid={`journey-${group.id}`}
        >
          <span
            className="pres-journey-indicator"
            style={{
              background: isCurrent || isCompleted ? group.color : `${group.color}40`,
              boxShadow: isCurrent ? `0 0 8px ${group.color}80` : 'none',
            }}
          />
          <span
            className="pres-journey-label"
            style={{ color: isCurrent ? group.color : isCompleted ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}
          >
            {t(group.labelKey)}
          </span>
        </button>
      );
    })}
  </div>
);

const BG_VIDEO_MAP: Record<string, { video: string; poster: string }> = {
  market: { video: '/videos/bg_market.mp4', poster: '/images/presentation/bg_market.jpg' },
  partner: { video: '/videos/bg_partner.mp4', poster: '/images/presentation/bg_partner.png' },
  tech: { video: '/videos/bg_tech.mp4', poster: '/images/presentation/bg_tech.png' },
};

const CinematicVideoBg: React.FC<{ slideId: number }> = ({ slideId }) => {
  const preset = SLIDE_BG_PRESETS[slideId] || 'market';
  const bg = BG_VIDEO_MAP[preset];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const tryPlay = () => {
      vid.play().catch(() => {});
    };
    if (vid.readyState >= 2) {
      tryPlay();
    } else {
      vid.addEventListener('canplay', tryPlay, { once: true });
    }
  }, [preset]);

  return (
    <div className="pres-cinematic-bg-wrap">
      <video
        ref={videoRef}
        key={`video-${preset}`}
        className="pres-cinematic-video"
        src={bg.video}
        poster={bg.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div
        className="pres-cinematic-fallback"
        style={{ backgroundImage: `url(${bg.poster})` }}
      />
      <div className={`pres-cinematic-gradient pres-cinematic-gradient-${preset}`} />
      <div className="pres-cinematic-overlay" />
      <div className="pres-cinematic-vignette" />
    </div>
  );
};

const FactSheet: React.FC<{
  fact: FactItem;
  t: (key: string) => string;
  onClose: () => void;
}> = ({ fact, t, onClose }) =>
  ReactDOM.createPortal(
    <>
      <motion.div
        className="fact-sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fact-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info: PanInfo) => { if (info.offset.y > 80) onClose(); }}
      >
        <div className="fact-sheet-handle" />
        <div className="fact-sheet-icon">
          <BookOpen size={20} />
        </div>
        <h3 className="fact-sheet-title">{t(fact.titleKey)}</h3>
        <p className="fact-sheet-desc">{t(fact.descKey)}</p>
      </motion.div>
    </>,
    document.body
  );

async function streamDennisChat(
  chatHistory: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (err: string) => void,
  errorMsg: string,
  connErrorMsg: string,
  language?: string,
) {
  try {
    const res = await fetch("/api/partner/dennis/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory, language }),
    });

    if (!res.ok || !res.body) {
      onError(errorMsg);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            fullText += data.content;
            onChunk(fullText);
          }
          if (data.done) {
            onDone(data.fullContent || fullText);
            return;
          }
          if (data.error) {
            onError(data.error);
            return;
          }
        } catch {}
      }
    }
    onDone(fullText);
  } catch {
    onError(connErrorMsg);
  }
}

const PresentationOverlay: React.FC<PresentationOverlayProps> = ({
  onBackToChat,
  onShowEcosystem,
  messages,
  addMessage,
  updateMessage,
}) => {
  const { t, language } = useLanguage();
  const slides = useMemo(() => buildSlides(t), [t]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showToc, setShowToc] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState("");
  const [cardPulse, setCardPulse] = useState(false);
  const [activeInteractiveItem, setActiveInteractiveItem] = useState<InteractiveItem | null>(null);
  const [visitedSlides, setVisitedSlides] = useState<Set<number>>(new Set([1]));
  const [activeFact, setActiveFact] = useState<FactItem | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const slide = slides[current];
  const isLast = current === slides.length - 1;
  const progress = ((current + 1) / slides.length) * 100;
  const nextSlide = current < slides.length - 1 ? slides[current + 1] : null;

  useEffect(() => {
    if (chatOpen && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatOpen, messages]);

  const buildChatHistory = useCallback((extraUserMsg?: string, slideContext?: Slide) => {
    const history: { role: string; content: string }[] = [];
    for (const msg of messages) {
      history.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      });
    }
    if (slideContext) {
      const ctx = `[${t('pdh.slideContext')} "${slideContext.title}". ${slideContext.text}. ${t('pdh.slideContextSuffix')}]`;
      history.push({ role: "system", content: ctx });
    }
    if (extraUserMsg) {
      history.push({ role: "user", content: extraUserMsg });
    }
    return history;
  }, [messages, t]);

  const goTo = useCallback((index: number, dir?: number) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    setDirection(dir ?? (clamped > current ? 1 : -1));
    setCurrent(clamped);
    setShowToc(false);
    setActiveInteractiveItem(null);
    setVisitedSlides((prev) => {
      const next = new Set(prev);
      next.add(slides[clamped].id);
      return next;
    });
  }, [current, slides]);

  const handleNext = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1, 1);
  }, [current, goTo, slides.length]);

  const handlePrev = useCallback(() => {
    if (current > 0) goTo(current - 1, -1);
  }, [current, goTo]);

  const sendToAI = useCallback((userText: string, openChatAfter?: boolean, slideCtx?: Slide) => {
    addMessage({ text: userText, sender: "user" });
    setIsStreaming(true);

    const aiMsgId = addMessage({ text: "...", sender: "ai" });
    const history = buildChatHistory(userText, slideCtx);

    streamDennisChat(
      history,
      (partialText) => {
        updateMessage(aiMsgId, partialText);
      },
      (fullText) => {
        updateMessage(aiMsgId, fullText);
        setIsStreaming(false);
        if (openChatAfter) setChatOpen(true);
      },
      (error) => {
        updateMessage(aiMsgId, `${t('pdh.errorShort')}${error}`);
        setIsStreaming(false);
        if (openChatAfter) setChatOpen(true);
      },
      t('pdh.errorResponse'),
      t('pdh.errorConnection'),
      language,
    );
  }, [addMessage, updateMessage, buildChatHistory, t, language]);

  const handleChipClick = useCallback((chip: Chip) => {
    if (isStreaming) return;
    setCardPulse(true);
    setTimeout(() => setCardPulse(false), 150);
    sendToAI(chip.text, true, slide);
  }, [slide, sendToAI, isStreaming]);

  const handleEcoAskDennis = useCallback((intent: string, question: string) => {
    if (isStreaming) return;
    sendToAI(question, true, slide);
  }, [slide, sendToAI, isStreaming]);

  const handleChatSend = useCallback(() => {
    if (!chatInput.trim() || isStreaming) return;
    const text = chatInput.trim();
    setChatInput("");
    sendToAI(text);
  }, [chatInput, sendToAI, isStreaming]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.offset.y > 80 && info.velocity.y > 0) {
      setChatOpen(true);
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  }, [handleNext, handlePrev]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.96, y: 20 }),
    center: { x: 0, opacity: 1, scale: 1, y: 0 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.96, y: 20 }),
  };

  return (
    <motion.div
      className="pres-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <CinematicVideoBg slideId={slide.id} />
      <FinancialBackground slideIndex={current} />

      <div className="pres-progress-wrap">
        <div className="pres-progress-bar">
          <motion.div
            className="pres-progress-fill"
            style={{ background: slide.accent }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="pres-progress-info">
          <span className="pres-progress-pct">{t('pdh.explored')} {Math.round(progress)}%</span>
          {nextSlide && <span className="pres-progress-next">{t('pdh.nextSlide')} {nextSlide.title}</span>}
        </div>
      </div>

      <div className="pres-layout">
        <div className="pres-main">
          <div className="pres-top-row">
            <button className="pres-close-btn" onClick={onBackToChat} data-testid="btn-close-pres">
              <X size={18} />
            </button>
            <div className="pres-top-center">
              <span className="pres-counter">{current + 1} / {slides.length}</span>
            </div>
            <button className="pres-toc-trigger" onClick={() => setShowToc(true)} data-testid="btn-toc">
              <List size={18} />
            </button>
          </div>
          <JourneyProgress
            currentSlide={slide.id}
            visitedSlides={visitedSlides}
            t={t}
            onNavigate={(idx) => goTo(idx)}
          />

          <motion.div
            className="pres-stage"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="pres-slide-frame"
              >
                {slide.type === "ecosystem" ? (
                  <EcosystemMapSlide onAskDennis={handleEcoAskDennis} />
                ) : (
                  <>
                    <motion.div 
                      className="pres-glass-card"
                      animate={{ scale: cardPulse ? 1.02 : 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.span
                        className="pres-slide-num"
                        style={{ color: slide.accent }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.35 }}
                      >
                        {String(slide.id).padStart(2, "0")}
                      </motion.span>
                      <motion.h2
                        className="pres-card-title"
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.45, ease: "easeOut" }}
                      >
                        {slide.title}
                      </motion.h2>
                      <motion.p
                        className="pres-card-text"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                      >
                        {slide.text.split("\n\n").map((p, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <><br /><br /></>}
                            {p.split("\n").map((line, j) => (
                              <React.Fragment key={j}>
                                {j > 0 && <br />}
                                {line}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))}
                      </motion.p>

                      {slide.interactiveType && slide.interactiveItems && (
                        <>
                          {slide.interactiveType === "security-points" && (
                            <SecurityPoints items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                          {slide.interactiveType === "strategy-cards" && (
                            <StrategyCards items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                          {slide.interactiveType === "graph-points" && (
                            <GraphPoints items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                          {slide.interactiveType === "ai-nodes" && (
                            <AiNodes items={slide.interactiveItems} onSelect={setActiveInteractiveItem} />
                          )}
                        </>
                      )}

                      {slide.id === 8 && (
                        <>
                          <AIComparison t={t} />
                          <button
                            className="pres-try-ai-btn"
                            onClick={() => setChatOpen(true)}
                            data-testid="btn-try-dennis-ai"
                          >
                            <Sparkles size={16} />
                            {t('pdh.tryDennisAI')}
                          </button>
                        </>
                      )}

                      {slide.id === 10 && <JetUPEngine t={t} />}

                      {slide.insightKey && (
                        <DennisInsight insightKey={slide.insightKey} t={t} />
                      )}

                      {SLIDE_FACTS[slide.id] && (
                        <motion.div
                          className="pres-facts-row"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9, duration: 0.35 }}
                        >
                          {SLIDE_FACTS[slide.id].map((fact, fi) => (
                            <motion.button
                              key={fact.id}
                              className="pres-fact-chip"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.0 + fi * 0.15, duration: 0.3 }}
                              onClick={() => setActiveFact(fact)}
                              data-testid={`fact-chip-${fact.id}`}
                            >
                              <BookOpen size={11} />
                              <span>{t(fact.titleKey)}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>

                    <AnimatePresence>
                      {activeInteractiveItem && (
                        <MicroInfoCard
                          item={activeInteractiveItem}
                          onClose={() => setActiveInteractiveItem(null)}
                        />
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="pres-bottom-area">
            {slide.chips.length > 0 && (
              <motion.div
                className="pres-chips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.35 }}
              >
                {slide.chips.map((chip, i) => (
                  <button
                    key={i}
                    className="pres-chip"
                    onClick={() => handleChipClick(chip)}
                    disabled={isStreaming}
                    data-testid={`chip-${slide.id}-${i}`}
                  >
                    <MessageSquare size={13} />
                    {chip.text}
                  </button>
                ))}
              </motion.div>
            )}

            <div className="pres-nav-row">
              <button
                className="pres-nav-btn"
                onClick={handlePrev}
                disabled={current === 0}
                data-testid="btn-prev-slide"
              >
                <ChevronLeft size={20} />
              </button>

              {!isLast ? (
                <button
                  className="pres-nav-btn pres-nav-next"
                  onClick={handleNext}
                  style={{ background: `${slide.accent}25`, borderColor: `${slide.accent}40` }}
                  data-testid="btn-next-slide"
                >
                  {t('pdh.next')}
                  <ChevronRight size={20} />
                </button>
              ) : (
                <div style={{ width: 52 }} />
              )}
            </div>

            {isLast && (
              <div className="pres-final-actions">
                <button className="ph-btn-primary" data-testid="btn-schedule-call">
                  <Video size={18} />
                  {t('pdh.scheduleCall')}
                </button>
                <button className="ph-btn-glass" data-testid="btn-start-link">
                  <Link size={18} />
                  {t('pdh.startLink')}
                </button>
                <button className="ph-btn-glass" onClick={() => setChatOpen(true)} data-testid="btn-ask-dennis">
                  <MessageSquare size={18} />
                  {t('pdh.goTelegram')}
                </button>
                <button className="ph-btn-outline" onClick={onShowEcosystem} data-testid="btn-show-ecosystem">
                  <Globe size={18} />
                  {t('pdh.viewEcosystem')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showToc && (
          <>
            <motion.div
              className="pres-toc-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowToc(false)}
            />
            <motion.div
              className="pres-toc-panel-popup"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_: any, info: PanInfo) => { if (info.offset.y > 80) setShowToc(false); }}
            >
              <div className="pres-sheet-handle" />
              <div className="pres-toc-header">
                <span>{t('pdh.toc')}</span>
                <button className="pres-close-btn-small" onClick={() => setShowToc(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="pres-toc-list">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    className={`pres-toc-item ${i === current ? "pres-toc-active" : ""}`}
                    style={i === current ? { borderColor: s.accent, color: s.accent } : undefined}
                    onClick={() => goTo(i)}
                    data-testid={`toc-slide-${s.id}`}
                  >
                    <span className="pres-toc-num">{String(s.id).padStart(2, "0")}</span>
                    <span className="pres-toc-title">{s.title}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeFact && (
          <FactSheet
            fact={activeFact}
            t={t}
            onClose={() => setActiveFact(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              className="pres-chat-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              className="pres-chat-panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setChatOpen(false);
              }}
            >
              <div className="pres-chat-handle" />
              <div className="pres-chat-head">
                <div className="ph-chat-header-left">
                  <div className="ph-chat-avatar-small">
                    <img src="/dennis-photo.png" alt="Dennis" />
                  </div>
                  <div>
                    <span className="ph-chat-name">Dennis AI</span>
                    <span className="ph-chat-status">
                      <span className="ph-status-dot" />
                      Online
                    </span>
                  </div>
                </div>
                <button className="pres-close-btn" onClick={() => setChatOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="pres-chat-messages" ref={chatScrollRef}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`ph-msg ${msg.sender === "user" ? "ph-msg-user" : "ph-msg-ai"}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              <div className="ph-chat-input-row">
                <input
                  type="text"
                  className="ph-chat-input"
                  placeholder={t('pdh.chatPlaceholder')}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleChatSend();
                    }
                  }}
                  disabled={isStreaming}
                  data-testid="input-pres-chat"
                />
                <button className="ph-chat-send" onClick={handleChatSend} disabled={isStreaming} data-testid="btn-pres-chat-send">
                  <Send size={18} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PresentationOverlay;
