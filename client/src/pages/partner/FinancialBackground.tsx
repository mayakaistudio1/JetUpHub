import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface FinancialBackgroundProps {
  slideIndex: number;
}

const FinancialBackground: React.FC<FinancialBackgroundProps> = ({ slideIndex }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = 40;
    const connectionDistance = 150;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(167, 139, 250, 0.3)";
        ctx.fill();
      }
    }

    const candles: Candle[] = [];
    const candleCount = 15;

    class Candle {
      x: number;
      y: number;
      w: number;
      h: number;
      vy: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.w = 3;
        this.h = Math.random() * 20 + 10;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.color = Math.random() > 0.5 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)";
      }

      update() {
        this.y += this.vy;
        if (this.y < -50) this.y = height + 50;
        if (this.y > height + 50) this.y = -50;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillRect(this.x + 1, this.y - 5, 1, this.h + 10);
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    for (let i = 0; i < candleCount; i++) candles.push(new Candle());

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.1 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 1;
          }
        }
      }
      ctx.stroke();

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      candles.forEach((c) => {
        c.update();
        c.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Parallax effect: layers shift translateY based on slideIndex
  // Layer 1: Base gradient (CSS)
  // Layer 2: Grid/Lines (Canvas)
  // Layer 3: Candles (Canvas - same as Layer 2 for now, or could be separate)
  
  return (
    <div className="pres-unified-bg" style={{ background: 'transparent' }}>
      {/* Layer 1: Transparent — video shows through from CinematicVideoBg */}
      
      {/* Layer 2 & 3: Canvas animated network and candles */}
      <motion.canvas
        ref={canvasRef}
        className="pres-bg-canvas"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          transform: `translateY(${slideIndex * -15}px)`,
        }}
        animate={{ y: slideIndex * -15 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      <div className="pres-unified-overlay" style={{ zIndex: 2 }} />
    </div>
  );
};

export default FinancialBackground;
