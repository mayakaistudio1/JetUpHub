import { motion } from 'framer-motion';
import { sceneTransitions, elementAnimations } from '@/lib/video';
import { Crown } from 'lucide-react';

export const IntroScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      key="intro"
      {...sceneTransitions.fadeBlur}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A0B2E 50%, #16082B 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.3) 0%, transparent 60%)' }} />

      <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #E30A17 50%, #FFFFFF 50%)' }} />

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? '#C9A96E' : 'rgba(124,58,237,0.5)',
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.3 } },
        }}
      >
        <motion.div
          variants={elementAnimations.popIn}
          className="mb-6 p-5 rounded-2xl border border-white/10"
          style={{ background: 'rgba(124,58,237,0.15)', backdropFilter: 'blur(20px)', boxShadow: '0 0 60px -12px rgba(124,58,237,0.5)' }}
        >
          <Crown size={64} style={{ color: '#C9A96E', filter: 'drop-shadow(0 0 15px rgba(201,169,110,0.6))' }} />
        </motion.div>

        <motion.div
          variants={elementAnimations.fadeUp}
          className="text-lg font-semibold tracking-[0.3em] uppercase mb-3"
          style={{ fontFamily: 'Montserrat, sans-serif', color: '#C9A96E' }}
        >
          JetUP Presents
        </motion.div>

        <motion.h1
          variants={elementAnimations.fadeUp}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-center mb-4"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A96E 50%, #FFFFFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          TURKEY CALLS
        </motion.h1>

        <motion.h2
          variants={elementAnimations.fadeUp}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-center"
          style={{
            fontFamily: 'Montserrat, sans-serif',
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          HEROES
        </motion.h2>

        <motion.div
          variants={elementAnimations.fadeUp}
          className="mt-6 flex items-center gap-3"
        >
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A96E)' }} />
          <span className="text-sm tracking-[0.2em] uppercase" style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgba(255,255,255,0.6)' }}>
            Partner Challenge 2026
          </span>
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A96E, transparent)' }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
