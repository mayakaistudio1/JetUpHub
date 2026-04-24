import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video';

export const IstanbulScene = () => {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden"
      key="istanbul"
      {...sceneTransitions.crossDissolve}
      style={{ background: 'linear-gradient(180deg, #0A0515 0%, #1A0B2E 40%, #0D1117 100%)' }}
    >
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(201,169,110,0.15) 0%, transparent 50%)' }} />

      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <svg viewBox="0 0 800 400" className="w-full max-w-4xl" style={{ fill: 'none', stroke: '#C9A96E', strokeWidth: 0.5 }}>
          <path d="M200,300 Q250,200 300,250 Q350,200 400,150 Q450,100 500,150 Q520,170 540,140 Q560,110 580,150 Q600,190 620,160 Q640,130 660,170" />
          <circle cx="300" cy="150" r="30" />
          <path d="M300,120 L300,100 L310,110" />
          <circle cx="450" cy="120" r="25" />
          <path d="M450,95 L450,75 L458,85" />
          <ellipse cx="400" cy="300" rx="200" ry="20" style={{ fill: 'rgba(201,169,110,0.05)' }} />
        </svg>
      </div>

      <motion.div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <motion.div
          className="text-sm tracking-[0.4em] uppercase mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontFamily: 'Montserrat, sans-serif', color: '#C9A96E' }}
        >
          Wo Kontinente sich treffen
        </motion.div>

        <motion.h2
          className="text-5xl md:text-7xl font-extrabold mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #C9A96E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ISTANBUL
        </motion.h2>

        <motion.p
          className="text-xl md:text-2xl leading-relaxed mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgba(255,255,255,0.6)' }}
        >
          Stadt der Imperien. Wo Geschichte auf Zukunft trifft —
          und Helden ihre nächste Stufe erreichen.
        </motion.p>

        <motion.div
          className="flex gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {['Networking', 'Leadership', 'Vision'].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: '#C9A96E', boxShadow: '0 0 10px rgba(201,169,110,0.5)' }} />
              <span className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgba(255,255,255,0.5)' }}>
                {item}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        style={{ background: 'linear-gradient(0deg, rgba(201,169,110,0.05) 0%, transparent 100%)' }}
      />
    </motion.div>
  );
};
