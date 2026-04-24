import React, { useEffect, useRef } from "react";
import { useSofiaVoice } from "./SofiaVoiceProvider";

interface VoiceWaveProps {
  color: string;
  bars?: number;
  barWidth?: number;
  barGap?: number;
  height?: number;
  /** Floor amplitude (0..1) so bars always show a faint "alive" pulse. */
  idleFloor?: number;
  /** When true, bars use a slow breathing curve and ignore live levels.
   *  Used when Sofia is speaking — we want a calm visual rhythm rather
   *  than amplitude-driven jitter. */
  breathing?: boolean;
  testid?: string;
}

/**
 * Equalizer-style sound wave. Subscribes to the SofiaVoiceProvider's
 * VAD analyser feed and writes bar heights directly to the DOM via
 * refs — no React re-renders per frame. Falls back to a CSS breathing
 * animation when the provider has no live levels (live mode off) or
 * when `breathing` is true.
 */
export default function VoiceWave({
  color,
  bars = 5,
  barWidth = 4,
  barGap = 4,
  height = 28,
  idleFloor = 0.12,
  breathing = false,
  testid,
}: VoiceWaveProps) {
  const voice = useSofiaVoice();
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const breathingRef = useRef(breathing);

  useEffect(() => {
    breathingRef.current = breathing;
  }, [breathing]);

  // Subscribe to live analyser levels.
  useEffect(() => {
    if (!voice.subscribeLevels) return;
    const unsub = voice.subscribeLevels((levels: number[]) => {
      if (breathingRef.current) return;
      const refs = barRefs.current;
      const n = refs.length;
      for (let i = 0; i < n; i++) {
        const node = refs[i];
        if (!node) continue;
        // Map a frequency bin to this bar (lerp across `levels.length`).
        const idx = Math.min(levels.length - 1, Math.floor((i / Math.max(1, n - 1)) * (levels.length - 1)));
        const v = Math.max(idleFloor, Math.min(1, levels[idx] ?? 0));
        node.style.transform = `scaleY(${v.toFixed(3)})`;
      }
    });
    return unsub;
  }, [voice, idleFloor]);

  // Breathing fallback — explicitly paused when the document is hidden
  // so backgrounded tabs don't keep RAF spinning (battery / CPU saver).
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const refs = barRefs.current;
      const n = refs.length;
      const liveFeed = voice.voiceMode === "live" && !breathingRef.current;
      if (!liveFeed) {
        for (let i = 0; i < n; i++) {
          const node = refs[i];
          if (!node) continue;
          const phase = (i / Math.max(1, n - 1)) * Math.PI;
          const v =
            idleFloor +
            (0.55 - idleFloor) *
              (0.5 + 0.5 * Math.sin(t * 2.4 + phase));
          node.style.transform = `scaleY(${v.toFixed(3)})`;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (raf === 0 && !document.hidden) {
        raf = requestAnimationFrame(tick);
      }
    };
    const stopLoop = () => {
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const onVis = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    document.addEventListener("visibilitychange", onVis);
    startLoop();
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      stopLoop();
    };
  }, [voice.voiceMode, idleFloor]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: barGap,
        height,
      }}
      data-testid={testid}
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          style={{
            width: barWidth,
            height,
            background: color,
            borderRadius: barWidth / 2,
            transformOrigin: "center",
            transform: `scaleY(${idleFloor})`,
            transition: "background-color 200ms ease",
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
