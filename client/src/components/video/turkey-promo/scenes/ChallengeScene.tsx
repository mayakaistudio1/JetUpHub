import { motion } from 'framer-motion';
import { sceneTransitions, containerVariants, itemVariants } from '@/lib/video';
import { Target, Calendar, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Target, value: '$150,000', label: 'Team-Volumen', color: '#A855F7' },
  { icon: Calendar, value: '20.02 – 20.04', label: 'Zeitraum 2026', color: '#C9A96E' },
  { icon: TrendingUp, value: '60 Tage', label: 'Deine Challenge', color: '#10B981' },
];

export const ChallengeScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
      key="challenge"
      {...sceneTransitions.slideLeft}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0B2E 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.15) 0%, transparent 50%)' }} />

      <motion.div
        className="text-sm tracking-[0.3em] uppercase mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontFamily: 'Montserrat, sans-serif', color: '#C9A96E' }}
      >
        Die Herausforderung
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl font-bold mb-12 text-center text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Dein Ziel. <span style={{ color: '#A855F7' }}>Dein Weg.</span>
      </motion.h2>

      <motion.div
        className="flex flex-col md:flex-row gap-6 w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex-1 flex flex-col items-center p-8 rounded-2xl border border-white/10"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 40px -15px ${item.color}30`,
            }}
          >
            <div className="p-3 rounded-xl mb-4" style={{ background: `${item.color}15` }}>
              <item.icon size={36} style={{ color: item.color }} />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {item.value}
            </div>
            <div className="text-sm uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
              {item.label}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mt-8 px-6 py-3 rounded-full border border-white/10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        style={{ background: 'rgba(124,58,237,0.1)' }}
      >
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Montserrat, sans-serif' }}>
          Qualifiziere dich für das exklusive Event in Istanbul
        </span>
      </motion.div>
    </motion.div>
  );
};
