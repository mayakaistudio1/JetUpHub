import { AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { IntroScene } from './scenes/IntroScene';
import { ChallengeScene } from './scenes/ChallengeScene';
import { PrizeScene } from './scenes/PrizeScene';
import { IstanbulScene } from './scenes/IstanbulScene';
import { QualitiesScene } from './scenes/QualitiesScene';
import { RequirementsScene } from './scenes/RequirementsScene';
import { OutroScene } from './scenes/OutroScene';

const SCENE_DURATIONS = {
  intro: 5000,
  challenge: 6000,
  prize: 6000,
  istanbul: 5000,
  qualities: 5000,
  requirements: 6000,
  outro: 6000,
};

export default function TurkeyPromoVideo() {
  const { currentScene, totalScenes, currentSceneKey, restart, isPaused, togglePause } = useVideoPlayer({
    durations: SCENE_DURATIONS,
    loop: true,
  });

  const progress = ((currentScene + 1) / totalScenes) * 100;

  return (
    <div className="w-full h-full overflow-hidden relative" style={{ background: '#0F0A1A' }}>
      <AnimatePresence mode="wait">
        {currentScene === 0 && <IntroScene key="intro" />}
        {currentScene === 1 && <ChallengeScene key="challenge" />}
        {currentScene === 2 && <PrizeScene key="prize" />}
        {currentScene === 3 && <IstanbulScene key="istanbul" />}
        {currentScene === 4 && <QualitiesScene key="qualities" />}
        {currentScene === 5 && <RequirementsScene key="requirements" />}
        {currentScene === 6 && <OutroScene key="outro" />}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="h-1 w-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7C3AED, #C9A96E)',
            }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePause}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              data-testid="button-pause-toggle"
            >
              {isPaused ? '▶' : '❚❚'}
            </button>
            <button
              onClick={restart}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              data-testid="button-restart"
            >
              ↺
            </button>
          </div>

          <div className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {currentSceneKey}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {currentScene + 1}/{totalScenes}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
