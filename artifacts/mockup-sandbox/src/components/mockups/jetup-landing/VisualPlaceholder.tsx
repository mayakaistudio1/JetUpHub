const VISUAL_CONFIG: Record<string, { icon: string; label: string; gradient: string }> = {
  chart: { icon: "📊", label: "Myfxbook Live Performance", gradient: "from-blue-900/40 to-blue-800/20" },
  broker: { icon: "🏦", label: "TAG Markets Dashboard", gradient: "from-slate-900/40 to-slate-800/20" },
  promo: { icon: "🎯", label: "Fast Start Promo", gradient: "from-green-900/40 to-green-800/20" },
  signals: { icon: "📡", label: "Signal Feed — Live", gradient: "from-cyan-900/40 to-cyan-800/20" },
  network: { icon: "🌐", label: "Network Structure", gradient: "from-emerald-900/40 to-emerald-800/20" },
  commissions: { icon: "💸", label: "Commission Calculator", gradient: "from-green-900/40 to-teal-800/20" },
  depth: { icon: "🔱", label: "Infinity Bonus Depth", gradient: "from-purple-900/40 to-indigo-800/20" },
  leaderboard: { icon: "🏆", label: "Partner Leaderboard", gradient: "from-yellow-900/40 to-amber-800/20" },
  "ai-clone": { icon: "🤖", label: "Maria AI — Live Demo", gradient: "from-violet-900/40 to-purple-800/20" },
  maria: { icon: "🎥", label: "Maria Video Call", gradient: "from-violet-900/40 to-fuchsia-800/20" },
  automation: { icon: "⚙️", label: "Automation Flow", gradient: "from-indigo-900/40 to-violet-800/20" },
  personalized: { icon: "✉️", label: "Personalized Invite Preview", gradient: "from-pink-900/40 to-rose-800/20" },
  overview: { icon: "🗺️", label: "JetUP Ecosystem Map", gradient: "from-amber-900/40 to-orange-800/20" },
  "layer-product": { icon: "📈", label: "Product Layer", gradient: "from-blue-900/40 to-sky-800/20" },
  "layer-business": { icon: "🏗️", label: "Business Layer", gradient: "from-green-900/40 to-emerald-800/20" },
  "layer-ai": { icon: "🧠", label: "AI Layer", gradient: "from-purple-900/40 to-violet-800/20" },
  academy: { icon: "🎓", label: "JetUP Academy", gradient: "from-cyan-900/40 to-teal-800/20" },
};

type VisualPlaceholderProps = {
  type: string;
};

export function VisualPlaceholder({ type }: VisualPlaceholderProps) {
  const cfg = VISUAL_CONFIG[type] ?? { icon: "🖼️", label: "Visual", gradient: "from-gray-900/40 to-gray-800/20" };

  return (
    <div
      data-testid={`visual-placeholder-${type}`}
      className={`bg-gradient-to-br ${cfg.gradient}`}
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.07)",
        height: 140,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backdropFilter: "blur(8px)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 36 }}>{cfg.icon}</div>
      <div style={{
        color: "rgba(255,255,255,0.3)", fontSize: 11,
        letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase",
      }}>
        {cfg.label}
      </div>
      <div style={{
        position: "absolute", bottom: 10, right: 14,
        fontSize: 10, color: "rgba(255,255,255,0.12)",
        fontWeight: 700, letterSpacing: "0.08em",
      }}>
        PLACEHOLDER
      </div>
    </div>
  );
}
