import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';
import { CheckCircle2, GitBranch, Scale } from 'lucide-react';

const requirements = [
  {
    icon: GitBranch,
    title: '2 Team-Beine',
    desc: 'Volumen aus mindestens zwei Strukturlinien',
  },
  {
    icon: Scale,
    title: 'Max. 50% Regel',
    desc: 'Nicht mehr als 50% aus einem Bein',
  },
  {
    icon: CheckCircle2,
    title: '$150.000 Volumen',
    desc: 'Gesamtvolumen innerhalb von 60 Tagen',
  },
];

export const RequirementsScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
      key="requirements"
      {...sceneTransitions.slideUp}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0B2E 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 80%, rgba(124,58,237,0.1) 0%, transparent 50%)' }} />

      <motion.div
        className="text-sm tracking-[0.3em] uppercase mb-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ fontFamily: 'Montserrat, sans-serif', color: '#C9A96E' }}
      >
        Qualifikation
      </motion.div>

      <motion.h2
        className="text-4xl md:text-5xl font-bold mb-12 text-center text-white"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        So qualifizierst <span style={{ color: '#A855F7' }}>du dich</span>
      </motion.h2>

      <div className="flex flex-col gap-5 w-full max-w-2xl">
        {requirements.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-6 p-6 rounded-2xl border border-white/10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.2, duration: 0.6, ease: 'circOut' }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <item.icon size={28} style={{ color: '#A855F7' }} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Montserrat, sans-serif' }}>
                {item.desc}
              </p>
            </div>
            <motion.div
              className="ml-auto flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + index * 0.2, type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 size={24} style={{ color: '#10B981' }} />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mt-8 flex items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2))' }} />
        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif' }}>
          20. Februar – 20. April 2026
        </span>
        <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.2), transparent)' }} />
      </motion.div>
    </motion.div>
  );
};
