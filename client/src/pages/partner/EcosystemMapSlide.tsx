import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface EcosystemNode {
  id: string;
  nameKey: string;
  descKey: string;
  intent: string;
  x: number;
  y: number;
}

const NODE_DEFS: EcosystemNode[] = [
  { id: "tag", nameKey: "pdh.eco.tag", descKey: "pdh.eco.tagDesc", intent: "ASK_TAG_MARKETS", x: 50, y: 15 },
  { id: "bit1", nameKey: "pdh.eco.bit1", descKey: "pdh.eco.bit1Desc", intent: "ASK_BIT1", x: 78, y: 35 },
  { id: "bix", nameKey: "pdh.eco.bix", descKey: "pdh.eco.bixDesc", intent: "ASK_BIX", x: 72, y: 72 },
  { id: "ai", nameKey: "pdh.eco.ai", descKey: "pdh.eco.aiDesc", intent: "ASK_AI_SYSTEM", x: 28, y: 72 },
  { id: "network", nameKey: "pdh.eco.partners", descKey: "pdh.eco.partnersDesc", intent: "ASK_PARTNER_NETWORK", x: 22, y: 35 },
];

const ORBIT_CONFIGS = [
  { radiusX: 3, radiusY: 2, duration: 8, startAngle: 0 },
  { radiusX: 2.5, radiusY: 3, duration: 10, startAngle: 72 },
  { radiusX: 3, radiusY: 2.5, duration: 9, startAngle: 144 },
  { radiusX: 2, radiusY: 3.5, duration: 11, startAngle: 216 },
  { radiusX: 3.5, radiusY: 2, duration: 7, startAngle: 288 },
];

interface EcosystemMapSlideProps {
  onAskDennis: (intent: string, question: string) => void;
}

const EcosystemMapSlide: React.FC<EcosystemMapSlideProps> = ({ onAskDennis }) => {
  const { t } = useLanguage();
  const [selectedNode, setSelectedNode] = useState<EcosystemNode | null>(null);
  const [zoomingNode, setZoomingNode] = useState<EcosystemNode | null>(null);

  const handleNodeClick = (node: EcosystemNode) => {
    setZoomingNode(node);
    setTimeout(() => {
      setSelectedNode(node);
    }, 400);
  };

  const handleClose = () => {
    setSelectedNode(null);
    setZoomingNode(null);
  };

  const mapTransform = useMemo(() => {
    if (!zoomingNode) return { scale: 1, x: 0, y: 0 };
    const offsetX = -(zoomingNode.x - 50) * 2.5;
    const offsetY = -(zoomingNode.y - 50) * 2.5;
    return { scale: 1.8, x: offsetX, y: offsetY };
  }, [zoomingNode]);

  return (
    <div className="eco-map-container">
      <motion.div
        className="eco-map-zoom-wrapper"
        animate={{
          scale: mapTransform.scale,
          x: `${mapTransform.x}%`,
          y: `${mapTransform.y}%`,
        }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
      >
        <svg className="eco-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(124, 58, 237, 0.1)" />
              <stop offset="50%" stopColor="rgba(124, 58, 237, 0.5)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.1)" />
            </linearGradient>
            <linearGradient id="lineGradientActive" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.3)" />
              <stop offset="50%" stopColor="rgba(167, 139, 250, 0.9)" />
              <stop offset="100%" stopColor="rgba(167, 139, 250, 0.3)" />
            </linearGradient>
          </defs>
          {NODE_DEFS.map((node) => {
            const isActive = zoomingNode?.id === node.id;
            return (
              <React.Fragment key={`line-${node.id}`}>
                <motion.line
                  x1="50"
                  y1="50"
                  x2={node.x}
                  y2={node.y}
                  stroke={isActive ? "url(#lineGradientActive)" : "url(#lineGradient)"}
                  strokeWidth={isActive ? "1" : "0.5"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: isActive ? 1 : 0.7,
                  }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                {isActive && (
                  <motion.line
                    x1="50"
                    y1="50"
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(167, 139, 250, 0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: [0, 1],
                      opacity: [0.8, 0.2, 0.8],
                    }}
                    transition={{
                      pathLength: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                      opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </svg>

        <motion.div
          className="eco-node-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
        >
          <div className="eco-node-center-inner">
            <img src="/jetup-logo.png" alt="JETUP" className="eco-center-logo" />
            <span className="eco-center-text">JETUP</span>
          </div>
          <div className="eco-center-pulse" />
        </motion.div>

        {NODE_DEFS.map((node, i) => {
          const orbit = ORBIT_CONFIGS[i];
          const isActive = zoomingNode?.id === node.id;
          return (
            <motion.div
              key={node.id}
              className={`eco-node-satellite ${isActive ? 'eco-node-active' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isActive ? 1.3 : 1,
                opacity: 1,
                x: isActive ? 0 : [0, orbit.radiusX, 0, -orbit.radiusX, 0],
                y: isActive ? 0 : [0, -orbit.radiusY, 0, orbit.radiusY, 0],
              }}
              transition={isActive ? {
                scale: { duration: 0.3 },
              } : {
                delay: 0.2 + i * 0.1,
                type: "spring",
                x: { duration: orbit.duration, repeat: Infinity, ease: "easeInOut", delay: 0.5 + i * 0.1 },
                y: { duration: orbit.duration, repeat: Infinity, ease: "easeInOut", delay: 0.5 + i * 0.1 },
              }}
              onClick={() => handleNodeClick(node)}
              data-testid={`eco-node-${node.id}`}
            >
              <div className={`eco-satellite-dot ${isActive ? 'eco-satellite-dot-active' : ''}`} />
              <div className="eco-satellite-label">{t(node.nameKey)}</div>
              <motion.div
                className="eco-satellite-pulse"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.1, 0.4],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {ReactDOM.createPortal(
        <AnimatePresence>
          {selectedNode && (
            <>
              <motion.div
                className="eco-card-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
              />
              <motion.div
                className="eco-info-card"
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 30 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                data-testid={`eco-info-card-${selectedNode.id}`}
              >
                <button
                  className="eco-card-close"
                  onClick={handleClose}
                  data-testid="btn-close-eco-card"
                >
                  <X size={18} />
                </button>
                
                <h3 className="eco-card-title">{t(selectedNode.nameKey)}</h3>
                <p className="eco-card-desc">{t(selectedNode.descKey)}</p>
                
                <div className="eco-card-actions">
                  <button
                    className="eco-card-btn-primary"
                    onClick={() => {
                      onAskDennis(selectedNode.intent, `${t('pdh.ecoAskAbout')} ${t(selectedNode.nameKey)}`);
                      handleClose();
                    }}
                    data-testid={`btn-ask-dennis-${selectedNode.id}`}
                  >
                    <MessageSquare size={16} />
                    {t('pdh.askDennis')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default EcosystemMapSlide;
