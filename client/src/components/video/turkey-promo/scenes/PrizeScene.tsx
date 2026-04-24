import { motion } from 'framer-motion';
import { sceneTransitions, elementAnimations } from '@/lib/video';
import { Plane, Star, MapPin } from 'lucide-react';

export const PrizeScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
      key="prize"
      {...sceneTransitions.zoomThrough}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0829 50%, #0D1117 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(201,169,110,0.2) 0%, transparent 60%)' }} />

      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            delay: i * 0.5,
          }}
        >
          <Star size={12} style={{ color: '#C9A96E' }} />
        </motion.div>
      ))}

      <motion.div className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          className="mb-6 p-6 rounded-full border border-white/10"
          style={{ background: 'rgba(201,169,110,0.1)', boxShadow: '0 0 60px rgba(201,169,110,0.2)' }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <Plane size={56} style={{ color: '#C9A96E', filter: 'drop-shadow(0 0 15px rgba(201,169,110,0.5))' }} />
        </motion.div>

        <motion.div
          className="text-sm tracking-[0.3em] uppercase mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontFamily: 'Montserrat, sans-serif', color: '#A855F7' }}
        >
          Der Gewinn
        </motion.div>

        <motion.h2
          className="text-5xl md:text-6xl font-extrabold mb-4 text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <span style={{ background: 'linear-gradient(135deg, #C9A96E, #E8D5A3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Istanbul
          </span>
        </motion.h2>

        <motion.div
          className="flex items-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <MapPin size={18} style={{ color: '#C9A96E' }} />
          <span className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgba(255,255,255,0.7)' }}>
            Türkei
          </span>
        </motion.div>

        <motion.div
          className="flex gap-8 items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>14 – 17</div>
            <div className="text-sm uppercase tracking-widest" style={{ color: '#C9A96E', fontFamily: 'Montserrat, sans-serif' }}>Mai 2026</div>
          </div>
          <div className="h-12 w-px" style={{ background: 'rgba(201,169,110,0.3)' }} />
          <div className="text-center">
            <div className="text-3xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>4 Tage</div>
            <div className="text-sm uppercase tracking-widest" style={{ color: '#C9A96E', fontFamily: 'Montserrat, sans-serif' }}>Exklusiv-Event</div>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 px-6 py-3 rounded-xl border"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          style={{
            borderColor: 'rgba(201,169,110,0.3)',
            background: 'rgba(201,169,110,0.05)',
          }}
        >
          <span className="text-sm" style={{ color: '#C9A96E', fontFamily: 'Montserrat, sans-serif' }}>
            Flug • Hotel • VIP-Programm • Networking
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
