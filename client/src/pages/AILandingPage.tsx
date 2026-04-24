import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

const ACCENT = "#A855F7";
const ACCENT_LIGHT = "#C084FC";
const MAGENTA = "#E879F9";

function useTypewriter(text: string, speed = 60, startDelay = 0, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!trigger) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setDone(true);
        }
      }, speed);
    }, startDelay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutRef.current = null;
      intervalRef.current = null;
    };
  }, [text, speed, startDelay, trigger]);

  return { displayed, done };
}

function Particles({ count = 40 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let raf: number;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(animate);
    };

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    animate();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}
      data-testid="particles-canvas"
    />
  );
}

function LightBeams() {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "30%",
          width: "40%",
          height: "80%",
          background: `radial-gradient(ellipse at center, rgba(124, 58, 237, 0.08) 0%, transparent 70%)`,
          transform: "rotate(-15deg)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "20%",
          width: "30%",
          height: "70%",
          background: `radial-gradient(ellipse at center, rgba(168, 85, 247, 0.06) 0%, transparent 70%)`,
          transform: "rotate(10deg)",
        }}
      />
    </div>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const line1 = "Почему у сильных лидеров рост останавливается?";
  const line2 = "Потому что их физически мало.";
  const tw1 = useTypewriter(line1, 50, 500, inView);
  const [line1Dissolving, setLine1Dissolving] = useState(false);
  const [line1Gone, setLine1Gone] = useState(false);
  const tw2 = useTypewriter(line2, 50, 200, line1Gone);

  useEffect(() => {
    if (!tw1.done) return;
    const t1 = setTimeout(() => setLine1Dissolving(true), 400);
    const t2 = setTimeout(() => setLine1Gone(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [tw1.done]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        overflow: "hidden",
      }}
      data-testid="section-hero"
    >
      <Particles count={35} />
      <LightBeams />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 700, textAlign: "center" }}>
        <AnimatePresence mode="wait">
          {!line1Gone && (
            <motion.h1
              key="line1"
              exit={{
                opacity: 0,
                filter: "blur(12px)",
                scale: 1.04,
                y: -20,
              }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontSize: "clamp(1.6rem, 5vw, 3.2rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "#fff",
                letterSpacing: "-0.02em",
                fontFamily: "'Montserrat', system-ui, sans-serif",
                opacity: line1Dissolving ? 0.5 : 1,
                filter: line1Dissolving ? "blur(2px)" : "none",
                transition: "opacity 0.6s, filter 0.6s",
              }}
              data-testid="hero-title-1"
            >
              {tw1.displayed}
              {!tw1.done && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1em",
                    background: ACCENT,
                    marginLeft: 2,
                    animation: "blink 1s steps(2) infinite",
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {line1Gone && (
            <motion.h2
              key="line2"
              initial={{ opacity: 0, y: 30, filter: "blur(16px)", scale: 0.96 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(1.5rem, 4.5vw, 2.8rem)",
                fontWeight: 600,
                color: ACCENT_LIGHT,
                lineHeight: 1.3,
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
              data-testid="hero-title-2"
            >
              {tw2.displayed}
              {!tw2.done && (
                <span
                  style={{
                    display: "inline-block",
                    width: 2,
                    height: "1em",
                    background: ACCENT,
                    marginLeft: 2,
                    animation: "blink 1s steps(2) infinite",
                    verticalAlign: "text-bottom",
                  }}
                />
              )}
            </motion.h2>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: 40,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
        data-testid="scroll-cue"
      >
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          scroll
        </span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 12l6 6 6-6" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>
    </section>
  );
}

function PainIcon({ type }: { type: string }) {
  const s = { width: 20, height: 20, strokeWidth: 1.5, stroke: "rgba(239, 68, 68, 0.6)", fill: "none" };
  switch (type) {
    case "user":
      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-7 8-7s8 3 8 7" /></svg>;
    case "trending-down":
      return <svg viewBox="0 0 24 24" {...s}><path d="M22 17l-6-6-4 4L2 5" /><path d="M16 17h6v-6" /></svg>;
    case "clock":
      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    case "refresh":
      return <svg viewBox="0 0 24 24" {...s}><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></svg>;
    case "lock":
      return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    default:
      return null;
  }
}

const PAIN_POINTS = [
  { text: "Ручной рекрутинг", iconType: "user" },
  { text: "Потерянные лиды", iconType: "trending-down" },
  { text: "Слабый follow-up", iconType: "clock" },
  { text: "Нестабильный онбординг", iconType: "refresh" },
  { text: "Bottleneck на лидере", iconType: "lock" },
];

function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        overflow: "hidden",
      }}
      data-testid="section-problem"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2.4rem)",
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          marginBottom: 48,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
        data-testid="problem-title"
      >
        Что ломает рост
      </motion.h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 520,
          width: "100%",
        }}
      >
        {PAIN_POINTS.map((point, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -60, scale: 0.9 }}
            animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{
              delay: 0.3 + i * 0.25,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            data-testid={`pain-point-${i}`}
          >
            <PainPointCard text={point.text} iconType={point.iconType} index={i} inView={inView} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PainPointCard({ text, iconType, index, inView }: { text: string; iconType: string; index: number; inView: boolean }) {
  const [destabilized, setDestabilized] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setDestabilized(true), 1200 + index * 400);
    return () => clearTimeout(timer);
  }, [inView, index]);

  return (
    <motion.div
      animate={
        destabilized
          ? {
              opacity: [1, 0.6, 0.3],
              filter: ["blur(0px)", "blur(1px)", "blur(3px)"],
              x: [0, -3, 5, -2, 0],
              scale: [1, 0.98, 0.96],
            }
          : {}
      }
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 24px",
        background: destabilized
          ? "rgba(239, 68, 68, 0.08)"
          : "rgba(255, 255, 255, 0.04)",
        border: `1px solid ${destabilized ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.08)"}`,
        borderRadius: 16,
        transition: "background 0.6s, border-color 0.6s",
        position: "relative",
      }}
    >
      <PainIcon type={iconType} />
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: destabilized ? "rgba(255,255,255,0.4)" : "#fff",
          transition: "color 0.6s",
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        {text}
      </span>
      {destabilized && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            height: 1,
            background: "rgba(239, 68, 68, 0.4)",
          }}
        />
      )}
    </motion.div>
  );
}

function ShiftSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const illumination = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        overflow: "hidden",
      }}
      data-testid="section-shift"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          marginBottom: 48,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
        data-testid="shift-title"
      >
        До и после
      </motion.h2>

      <div
        className="ail-shift-grid"
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: 24,
            background: "rgba(239, 68, 68, 0.06)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            borderRadius: 20,
          }}
          data-testid="shift-before"
        >
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "rgba(239, 68, 68, 0.8)",
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Без системы
          </h3>
          {["Ручной контроль", "Хаос касаний", "Потеря людей", "Выгорание лидера"].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(239, 68, 68, 0.5)",
                  flexShrink: 0,
                }}
              />
              {item}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: 24,
            background: "rgba(124, 58, 237, 0.08)",
            border: "1px solid rgba(124, 58, 237, 0.2)",
            borderRadius: 20,
            position: "relative",
            overflow: "hidden",
          }}
          data-testid="shift-after"
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(168, 85, 247, 0.06) 100%)`,
              opacity: illumination,
            }}
          />
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: ACCENT_LIGHT,
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              position: "relative",
              zIndex: 1,
            }}
          >
            С JetUP
          </h3>
          {["AI-инфраструктура", "Системный поток", "Удержание людей", "Масштаб лидера"].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                position: "relative",
                zIndex: 1,
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: ACCENT,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${ACCENT}`,
                }}
              />
              {item}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const AI_LAYERS = [
  { name: "Recruiting", desc: "AI квалифицирует, вовлекает и переводит лидов дальше по воронке 24/7", color: "#A855F7" },
  { name: "Onboarding", desc: "Автоматическое сопровождение нового партнёра от первого контакта до старта", color: "#3B82F6" },
  { name: "Duplication", desc: "Единая логика подачи — команда опирается на систему, а не пересказывает по-своему", color: "#22C55E" },
  { name: "Personal Hub", desc: "Каждый лидер получает свою AI-среду — персональный digital hub", color: "#F59E0B" },
  { name: "Communication", desc: "Мультиязычный AI-ассистент: текст, голос, видео-аватар", color: "#E879F9" },
  { name: "Follow-up", desc: "Автоматическое удержание внимания и переход к следующему шагу", color: "#06B6D4" },
];

function InfrastructureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [activeLayer, setActiveLayer] = useState<number | null>(null);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        overflow: "hidden",
      }}
      data-testid="section-infrastructure"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          marginBottom: 12,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
        data-testid="infra-title"
      >
        AI-инфраструктура JetUP
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          marginBottom: 40,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        Живая системная архитектура
      </motion.p>

      <div style={{ position: "relative", maxWidth: 600, width: "100%" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(168, 85, 247, 0.15))",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(124, 58, 237, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              position: "relative",
            }}
            data-testid="infra-core"
          >
            <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>JETUP</span>
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: 24,
                border: "1px solid rgba(168, 85, 247, 0.2)",
              }}
            />
          </div>
        </motion.div>

        <svg
          viewBox="0 0 600 40"
          style={{ width: "100%", height: 40, display: "block", overflow: "visible" }}
          preserveAspectRatio="xMidYMid meet"
        >
          {AI_LAYERS.map((layer, i) => {
            const col = i % 2;
            const targetX = col === 0 ? 150 : 450;
            const targetY = 40;
            return (
              <motion.line
                key={`conn-${i}`}
                x1="300"
                y1="0"
                x2={targetX}
                y2={targetY}
                stroke={layer.color}
                strokeWidth="1"
                strokeOpacity="0.25"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: "easeOut" }}
              />
            );
          })}
          {AI_LAYERS.map((layer, i) => (
            <motion.circle
              key={`dot-${i}`}
              cx="300"
              cy="0"
              r="2"
              fill={layer.color}
              initial={{ opacity: 0 }}
              animate={
                inView
                  ? {
                      cx: [300, i % 2 === 0 ? 150 : 450],
                      cy: [0, 40],
                      opacity: [0.8, 0],
                    }
                  : {}
              }
              transition={{
                delay: 0.5 + i * 0.3,
                duration: 1.2,
                repeat: Infinity,
                repeatDelay: 2 + i * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </svg>

        <div className="ail-infra-grid">
          {AI_LAYERS.map((layer, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActiveLayer(activeLayer === i ? null : i)}
              onMouseEnter={() => setActiveLayer(i)}
              onMouseLeave={() => setActiveLayer(null)}
              style={{
                padding: 16,
                background:
                  activeLayer === i
                    ? `linear-gradient(135deg, ${layer.color}15, ${layer.color}08)`
                    : "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${activeLayer === i ? layer.color + "40" : "rgba(255, 255, 255, 0.06)"}`,
                borderRadius: 16,
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.3s",
                position: "relative",
                overflow: "hidden",
              }}
              data-testid={`infra-layer-${i}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: activeLayer === i ? 10 : 0 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: layer.color,
                    boxShadow: `0 0 8px ${layer.color}60`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: activeLayer === i ? "#fff" : "rgba(255,255,255,0.7)",
                    fontFamily: "'Montserrat', system-ui, sans-serif",
                  }}
                >
                  {layer.name}
                </span>
              </div>

              <AnimatePresence>
                {activeLayer === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.5,
                      margin: 0,
                      overflow: "hidden",
                      fontFamily: "'Montserrat', system-ui, sans-serif",
                    }}
                  >
                    {layer.desc}
                  </motion.p>
                )}
              </AnimatePresence>

              {activeLayer === i && (
                <motion.div
                  layoutId="connector"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 3,
                    height: "100%",
                    background: layer.color,
                    borderRadius: "0 2px 2px 0",
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

const MARIA_MESSAGES = [
  { sender: "user" as const, text: "Привет! Как работает AI-система JetUP?" },
  {
    sender: "ai" as const,
    text: "Привет! 👋 JetUP AI — это не просто бот. Это целая инфраструктура, которая помогает лидерам масштабировать свой бизнес. Я могу объяснить продукт, помочь с рекрутингом, провести через онбординг — всё 24/7, на трёх языках.",
  },
  { sender: "user" as const, text: "А в чём конкретно отличие от обычных AI-ботов?" },
  {
    sender: "ai" as const,
    text: "Главное отличие: я встроена в систему JetUP, а не стою отдельно. Я знаю продукт, стратегии, партнёрскую модель. Я не просто отвечаю — я помогаю довести человека до следующего шага. Это как цифровое продолжение лидера.",
  },
];

function MariaChatSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [typingVisible, setTypingVisible] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!inView) return;
    const timers = timersRef.current;
    let cancelled = false;
    let i = 0;

    const showNext = () => {
      if (cancelled || i >= MARIA_MESSAGES.length) return;
      const isAI = MARIA_MESSAGES[i].sender === "ai";
      if (isAI) {
        setTypingVisible(true);
        timers.push(setTimeout(() => {
          if (cancelled) return;
          setTypingVisible(false);
          i++;
          setVisibleMessages(i);
          timers.push(setTimeout(showNext, 600));
        }, 1200));
      } else {
        i++;
        setVisibleMessages(i);
        timers.push(setTimeout(showNext, 800));
      }
    };
    timers.push(setTimeout(showNext, 600));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.length = 0;
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        overflow: "hidden",
      }}
      data-testid="section-maria"
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
          fontWeight: 700,
          color: "#fff",
          textAlign: "center",
          marginBottom: 8,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
        data-testid="maria-title"
      >
        Познакомьтесь с Maria
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.6 }}
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.4)",
          textAlign: "center",
          marginBottom: 32,
          fontFamily: "'Montserrat', system-ui, sans-serif",
        }}
      >
        AI-ассистент внутри экосистемы JetUP
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: 440,
          width: "100%",
          background: "rgba(15, 10, 26, 0.9)",
          border: "1px solid rgba(168, 85, 247, 0.15)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 0 60px rgba(124, 58, 237, 0.1), 0 20px 60px rgba(0,0,0,0.4)",
        }}
        data-testid="maria-chat-container"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7C3AED, #A855F7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            M
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Maria</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#22C55E", fontWeight: 600 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px #22C55E" }} />
              online
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minHeight: 280,
          }}
        >
          {MARIA_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: 18,
                fontSize: 13,
                lineHeight: 1.6,
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                background:
                  msg.sender === "user"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(124, 58, 237, 0.12)",
                border: `1px solid ${msg.sender === "user" ? "rgba(255,255,255,0.06)" : "rgba(124, 58, 237, 0.15)"}`,
                borderBottomRightRadius: msg.sender === "user" ? 4 : 18,
                borderBottomLeftRadius: msg.sender === "ai" ? 4 : 18,
                color: msg.sender === "user" ? "#fff" : "#E9D5FF",
                fontFamily: "'Montserrat', system-ui, sans-serif",
              }}
              data-testid={`maria-msg-${i}`}
            >
              {msg.text}
            </motion.div>
          ))}

          {typingVisible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: "flex-start",
                padding: "12px 20px",
                borderRadius: 18,
                borderBottomLeftRadius: 4,
                background: "rgba(124, 58, 237, 0.12)",
                border: "1px solid rgba(124, 58, 237, 0.15)",
                display: "flex",
                gap: 4,
              }}
              data-testid="maria-typing"
            >
              {[0, 1, 2].map((d) => (
                <motion.div
                  key={d}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "rgba(168, 85, 247, 0.5)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function FormulaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        overflow: "hidden",
      }}
      data-testid="section-formula"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 560,
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            padding: "32px 28px",
            background: "rgba(124, 58, 237, 0.06)",
            border: "1px solid rgba(168, 85, 247, 0.15)",
            borderRadius: 24,
            marginBottom: 40,
            boxShadow: "0 0 60px rgba(124, 58, 237, 0.08)",
          }}
          data-testid="formula-card"
        >
          <h2
            style={{
              fontSize: "clamp(1.1rem, 3.5vw, 1.6rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.4,
              marginBottom: 0,
              fontFamily: "'Montserrat', system-ui, sans-serif",
            }}
          >
            <span style={{ color: ACCENT_LIGHT }}>JetUP</span> ={" "}
            <span style={{ color: "#3B82F6" }}>продукт</span> +{" "}
            <span style={{ color: "#22C55E" }}>партнёрская модель</span> +{" "}
            <span style={{ color: MAGENTA }}>AI-инфраструктура</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontSize: "clamp(1rem, 3vw, 1.3rem)",
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
            lineHeight: 1.6,
            marginBottom: 48,
            fontFamily: "'Montserrat', system-ui, sans-serif",
          }}
          data-testid="formula-supporting"
        >
          AI не заменяет лидера.
          <br />
          <span style={{ color: "#fff", fontWeight: 600 }}>Он усиливает лидера.</span>
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "18px 48px",
            background: "linear-gradient(135deg, #7C3AED, #A855F7)",
            border: "none",
            borderRadius: 16,
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 0 40px rgba(124, 58, 237, 0.3), 0 8px 32px rgba(0,0,0,0.3)",
            fontFamily: "'Montserrat', system-ui, sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
          data-testid="cta-button"
        >
          <motion.div
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 2,
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "40%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              pointerEvents: "none",
            }}
          />
          Узнать больше
        </motion.button>
      </motion.div>
    </section>
  );
}

export default function AILandingPage() {
  return (
    <div
      style={{
        background: "#060212",
        color: "#fff",
        minHeight: "100vh",
        overflowX: "hidden",
        fontFamily: "'Montserrat', system-ui, sans-serif",
      }}
      data-testid="ai-landing-page"
    >
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .ail-shift-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 640px;
          width: 100%;
        }
        .ail-infra-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (max-width: 480px) {
          .ail-shift-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .ail-infra-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
        }
      `}</style>
      <HeroSection />
      <ProblemSection />
      <ShiftSection />
      <InfrastructureSection />
      <MariaChatSection />
      <FormulaSection />
    </div>
  );
}
