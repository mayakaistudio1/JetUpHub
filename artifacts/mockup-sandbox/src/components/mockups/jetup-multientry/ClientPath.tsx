import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Globe, Play } from "lucide-react";

export function ClientPath() {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-[100dvh] bg-[#0c0a09] text-white overflow-hidden font-sans selection:bg-amber-500/30">
      {/* Cinematic Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img
            src="/__mockup/images/client-path-premium-bg.png"
            alt="Premium Background"
            className="w-full h-full object-cover opacity-60"
          />
        </motion.div>
        
        {/* Gradients for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0a09] via-[#0c0a09]/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent z-10 mix-blend-screen" />
      </div>

      {/* Header / Utility */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute top-0 left-0 right-0 p-8 z-50 flex justify-between items-center"
      >
        <div className="flex items-center gap-3 text-amber-50/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-black font-bold tracking-tighter text-sm shadow-lg shadow-amber-500/20">
            J
          </div>
          <span className="font-semibold tracking-wider uppercase text-sm">JetUP</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-amber-50/50 uppercase cursor-pointer">
            <Globe className="w-3.5 h-3.5" />
            <span className="text-amber-50">EN</span>
            <span className="mx-1 opacity-30">/</span>
            <span className="hover:text-amber-50 transition-colors">DE</span>
            <span className="mx-1 opacity-30">/</span>
            <span className="hover:text-amber-50 transition-colors">RU</span>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="h-[1px] w-12 bg-amber-500/50" />
          <span className="text-amber-500/80 text-sm tracking-[0.2em] uppercase font-medium">The Client Journey</span>
        </motion.div>

        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-[1.1] tracking-tight mb-4">
              <span className="block text-neutral-300">You want your</span>
              <span className="block text-white font-medium">money to work</span>
              <span className="block text-amber-500 italic">for you.</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
          >
            <p className="mt-8 text-lg md:text-2xl text-neutral-400 max-w-2xl leading-relaxed font-light mb-16 border-l-2 border-amber-500/30 pl-6">
              But you don't know how to start. Welcome to the new standard of passive wealth generation through intelligent copy-trading. No jargon, just results.
            </p>
          </motion.div>

          {/* Action Area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1 }}
            className="flex items-center gap-8"
          >
            <button 
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              className="group relative flex items-center gap-6 cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full border border-amber-500/30 bg-amber-500/5 backdrop-blur-sm transition-all duration-500 group-hover:bg-amber-500/10 group-hover:border-amber-500/50 group-hover:scale-105 overflow-hidden">
                <motion.div 
                  className="absolute inset-0 bg-amber-500/20 rounded-full blur-md"
                  animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.8 : 0 }}
                  transition={{ duration: 0.4 }}
                />
                <Play className="w-5 h-5 text-amber-400 ml-1 relative z-10 transition-transform duration-500 group-hover:scale-110" fill="currentColor" />
              </div>
              
              <div className="flex flex-col items-start">
                <span className="text-amber-50 font-medium tracking-wide text-lg">Begin the Journey</span>
                <span className="text-amber-50/40 text-sm flex items-center gap-2 mt-1">
                  Press space <kbd className="font-sans px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-xs ml-1">Space</kbd> or click
                </span>
              </div>
            </button>
          </motion.div>
        </div>
      </main>

      {/* Decorative elements */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 2, duration: 2 }}
        className="absolute bottom-0 right-0 p-12 pointer-events-none z-0"
      >
        <div className="w-64 h-64 border border-amber-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Progress Indicators (Bottom Right) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.2 }}
        className="absolute bottom-12 right-12 z-50 flex items-center gap-3"
      >
        <div className="hidden md:flex gap-2">
          <div className="w-8 h-1 bg-amber-500 rounded-full" />
          <div className="w-2 h-1 bg-white/20 rounded-full transition-all duration-300 hover:bg-white/40 cursor-pointer" />
          <div className="w-2 h-1 bg-white/20 rounded-full transition-all duration-300 hover:bg-white/40 cursor-pointer" />
          <div className="w-2 h-1 bg-white/20 rounded-full transition-all duration-300 hover:bg-white/40 cursor-pointer" />
        </div>
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center ml-4 cursor-pointer hover:bg-white/5 transition-colors group">
          <ChevronRight className="w-4 h-4 text-amber-50/70 group-hover:text-amber-50" />
        </div>
      </motion.div>
    </div>
  );
}
