import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, Cpu, Network, Zap, ShieldCheck, ChevronRight, Activity } from 'lucide-react';

export function PartnerPath() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.2 } },
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0c] text-white selection:bg-violet-500/30 font-sans overflow-hidden relative dark">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-violet-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navigation / Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-12 md:py-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">JetUP</span>
          <span className="text-white/40 font-mono text-xs uppercase tracking-widest ml-2 border border-white/10 px-2 py-0.5 rounded-full">Partner</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <span className="text-white">01 / Vision</span>
          <span>02 / System</span>
          <span>03 / Economics</span>
          <span>04 / Scale</span>
        </div>

        <button className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-2">
          Skip Intro <ChevronRight className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 md:px-12 pt-12 pb-24 md:pt-20 md:pb-32 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center min-h-[calc(100vh-100px)]">
        
        {/* Left Column: Typography & Story */}
        <motion.div 
          className="lg:col-span-6 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-white/80">Opportunity Brief</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] mb-6">
            Build the network. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-white">
              We provide the system.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mb-10 font-light">
            Independence shouldn't mean starting from scratch. Join a serious financial ecosystem equipped with an AI-driven CRM, automated guest tracking, and deep attribution. Your ambition, our infrastructure.
          </motion.p>

          {/* Action Area */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <button className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-sm hover:scale-105 transition-all duration-300 ease-out flex items-center gap-3 overflow-hidden">
              <span className="relative z-10">Explore the Model</span>
              <div className="relative z-10 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            <div className="flex items-center gap-4 text-sm text-white/50 font-medium">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0a0a0c] bg-white/10 flex items-center justify-center overflow-hidden`}>
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=transparent`} alt="avatar" className="w-full h-full opacity-70 mix-blend-luminosity" />
                  </div>
                ))}
              </div>
              <span>Join 2,400+ active partners</span>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-8 mt-16 pt-16 border-t border-white/10">
            <div>
              <Bot className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="text-white font-medium mb-1">AI Assistant</h3>
              <p className="text-white/50 text-sm leading-relaxed">Personalized invitations and follow-ups handled by your dedicated AI.</p>
            </div>
            <div>
              <Network className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="text-white font-medium mb-1">Deep Attribution</h3>
              <p className="text-white/50 text-sm leading-relaxed">Every Zoom attendee, every click, perfectly mapped to your network.</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Visual Impact */}
        <motion.div 
          className="lg:col-span-6 relative"
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-full aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl group">
            {/* Primary Image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/20 to-transparent z-10" />
            <img 
              src="/__mockup/images/partner-tech-abstract.png" 
              alt="Technology infrastructure" 
              className="w-full h-full object-cover object-center opacity-80 mix-blend-lighten group-hover:scale-105 transition-transform duration-1000"
            />
            
            {/* Floating UI Elements */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute top-8 left-8 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-20 max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-xs font-medium text-white/80">Live Network</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-light tracking-tight text-white">14.2k</span>
                <span className="text-green-400 text-sm font-medium mb-1">+12%</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute bottom-8 right-8 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-20"
            >
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-medium text-white/80">Automated Payouts</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.5, duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-400" 
                />
              </div>
            </motion.div>

            {/* Network Overlay Image */}
            <div className="absolute inset-0 z-15 mix-blend-screen opacity-40">
               <img src="/__mockup/images/partner-network.png" alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>

      </main>

      {/* Progress Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-0 left-0 w-full h-1 bg-white/5"
      >
        <motion.div 
          initial={{ width: "0%" }}
          animate={{ width: "25%" }}
          transition={{ delay: 1.8, duration: 1.5, ease: "circOut" }}
          className="h-full bg-white" 
        />
      </motion.div>
    </div>
  );
}