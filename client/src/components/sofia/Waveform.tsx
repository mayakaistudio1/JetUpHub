import React, { useEffect, useRef } from "react";

interface WaveformProps {
  getAnalyser: () => AnalyserNode | null;
  width: number;
  height: number;
  bars?: number;
  color: string;
  /** Color of the bars when analyser is null (idle/flat line). */
  idleColor?: string;
  /** Multiplier on amplitude. */
  gain?: number;
  /** Minimum bar height ratio (0..1). */
  minRatio?: number;
  /** Whether bars are forcibly flat (e.g. mic muted). */
  flat?: boolean;
  className?: string;
  rounded?: boolean;
  gap?: number;
}

/**
 * Lightweight canvas-based bar visualizer driven by the AnalyserNode the
 * provider owns. Renders a symmetric (mirrored) bar strip filling the
 * available area. When the analyser is null or `flat` is true, renders
 * a flat baseline line.
 */
export default function Waveform({
  getAnalyser,
  width,
  height,
  bars = 28,
  color,
  idleColor,
  gain = 1.6,
  minRatio = 0.12,
  flat = false,
  className,
  rounded = true,
  gap = 2,
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);
  const lastValuesRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;
    ctx2d.scale(dpr, dpr);

    const idle = idleColor || color;
    const barW = Math.max(1.5, (width - gap * (bars - 1)) / bars);
    if (lastValuesRef.current.length !== bars) {
      lastValuesRef.current = new Array(bars).fill(minRatio);
    }

    const draw = () => {
      ctx2d.clearRect(0, 0, width, height);
      const analyser = getAnalyser();
      if (!analyser || flat) {
        // flat baseline
        ctx2d.fillStyle = idle;
        for (let i = 0; i < bars; i++) {
          const x = i * (barW + gap);
          const h = Math.max(2, height * minRatio);
          const y = (height - h) / 2;
          if (rounded && (ctx2d as CanvasRenderingContext2D).roundRect) {
            ctx2d.beginPath();
            (ctx2d as CanvasRenderingContext2D).roundRect(x, y, barW, h, barW / 2);
            ctx2d.fill();
          } else {
            ctx2d.fillRect(x, y, barW, h);
          }
        }
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (!dataRef.current || dataRef.current.length !== analyser.frequencyBinCount) {
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(dataRef.current);
      const data = dataRef.current;
      const stride = Math.max(1, Math.floor(data.length / bars));
      ctx2d.fillStyle = color;
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < stride; j++) {
          sum += data[i * stride + j] || 0;
        }
        const avg = sum / stride / 255;
        let v = Math.min(1, avg * gain);
        if (v < minRatio) v = minRatio;
        // smoothing
        const last = lastValuesRef.current[i] ?? minRatio;
        v = last + (v - last) * 0.45;
        lastValuesRef.current[i] = v;
        const h = Math.max(2, height * v);
        const x = i * (barW + gap);
        const y = (height - h) / 2;
        if (rounded && (ctx2d as CanvasRenderingContext2D).roundRect) {
          ctx2d.beginPath();
          (ctx2d as CanvasRenderingContext2D).roundRect(x, y, barW, h, barW / 2);
          ctx2d.fill();
        } else {
          ctx2d.fillRect(x, y, barW, h);
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [getAnalyser, width, height, bars, color, idleColor, gain, minRatio, flat, rounded, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width, height, display: "block" }}
      aria-hidden
    />
  );
}
