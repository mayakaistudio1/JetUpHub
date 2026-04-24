import { motion } from 'framer-motion';
import { sceneTransitions, containerVariants, itemVariants } from '@/lib/video';
import { Swords, Crown, Flame } from 'lucide-react';

const qualities = [
  { icon: Flame, title: 'STÄRKE', desc: 'Durchhaltevermögen & Fokus', color: '#EF4444' },
  { icon: Crown, title: 'ERBE', desc: 'Vermächtnis aufbauen', color: '#C9A96E' },
  { icon: Swords, title: 'FÜHRUNG', desc: 'Teams inspirieren', color: '#A855F7' },
];

export const QualitiesScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
      key="qualities"
      {...sceneTransitions.perspectiveFlip}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0B2E 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(168,85,247,0.1) 0%, transparent 50%)' }} />

      <motion.div
        className="text-sm tracking-[0.3em] uppercase mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontFamily: 'Montserrat, sans-serif', color: '#C9A96E' }}
      >
        Was einen Helden ausmacht
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl font-bold mb-12 text-center text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Stärke. Erbe. <span style={{ color: '#A855F7' }}>Führung.</span>
      </motion.h2>

      <motion.div
        className="flex flex-col md:flex-row gap-6 w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {qualities.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex-1 flex flex-col items-center p-8 rounded-2xl border border-white/10 relative overflow-hidden group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at 50% 50%, ${item.color}10 0%, transparent 70%)` }}
            />
            <div className="p-4 rounded-xl mb-5 relative z-10" style={{ background: `${item.color}10`, border: `1px solid ${item.color}20` }}>
              <item.icon size={40} style={{ color: item.color }} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {item.title}
            </h3>
            <p className="text-sm text-center relative z-10" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
