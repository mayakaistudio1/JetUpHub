import { motion } from 'framer-motion';
import { sceneTransitions, elementAnimations } from '@/lib/video';
import { Rocket } from 'lucide-react';

export const OutroScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
      key="outro"
      {...sceneTransitions.fadeBlur}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0B2E 50%, #16082B 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.3) 0%, transparent 55%)' }} />

      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 2 === 0 ? '#C9A96E' : '#A855F7',
          }}
          animate={{
            opacity: [0, 0.7, 0],
            y: [0, -30, -60],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 3,
          }}
        />
      ))}

      <motion.div className="relative z-10 flex flex-col items-center text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A96E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Helden warten nicht.
        </motion.h2>

        <motion.h3
          className="text-3xl md:text-5xl font-bold mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            color: '#A855F7',
          }}
        >
          Helden schaffen Ergebnisse.
        </motion.h3>

        <motion.div
          className="flex items-center gap-3 text-lg mb-10"
          variants={elementAnimations.fadeUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.8 }}
          style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Montserrat, sans-serif' }}
        >
          <span>Struktur</span>
          <span style={{ color: '#C9A96E' }}>•</span>
          <span>Transparenz</span>
          <span style={{ color: '#C9A96E' }}>•</span>
          <span>Kontrolle</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3 px-8 py-4 rounded-full text-lg font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, type: 'spring' }}
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
            color: 'white',
            fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 0 40px rgba(124,58,237,0.4)',
          }}
        >
          <Rocket size={22} />
          Jetzt starten
        </motion.div>

        <motion.div
          className="mt-6 text-sm tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Montserrat, sans-serif' }}
        >
          jetup.ibportal.io
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
