import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Calendar, Clock, Video, ChevronDown, CheckCircle2 } from "lucide-react";

export function Hierarchy() {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="w-[390px] h-[844px] bg-[#0c0b1a] text-white overflow-y-auto font-sans mx-auto shadow-2xl relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0c0b1a]/90 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center px-4 py-3">
          <button className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-colors">
            <ArrowLeft size={20} className="text-white/70" />
          </button>
          <span className="text-[14px] font-medium text-white/80 ml-2">Back to Hub</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* EVENT TICKET / KEY INFO */}
        <section className="bg-[#151426] border border-white/10 rounded-2xl overflow-hidden shadow-lg shadow-black/50">
          <div className="relative h-32 w-full overflow-hidden">
            <img 
              src="/__mockup/images/ama-banner.png" 
              alt="Niklas Freihofer - CEO TAG Markets" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151426] via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-4">
              <span className="px-2 py-1 rounded bg-[#7C3AED] text-white text-[10px] font-bold uppercase tracking-wider">
                Live AMA
              </span>
            </div>
          </div>
          
          <div className="p-4 pb-5 space-y-4">
            <div>
              <h1 className="text-[22px] font-extrabold leading-tight">
                AMA Session with Niklas Freihofer
              </h1>
              <p className="text-[14px] text-white/60 mt-1">CEO TAG Markets</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-[#0c0b1a] rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[#A855F7] mb-1">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Date</span>
                </div>
                <div className="text-[15px] font-bold">April 9</div>
              </div>
              <div className="bg-[#0c0b1a] rounded-xl p-3 border border-white/5 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-[#A855F7] mb-1">
                  <Clock size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Time</span>
                </div>
                <div className="text-[14px] font-bold leading-tight">19:00 <span className="text-white/50 font-normal">Berlin</span><br/>20:00 <span className="text-white/50 font-normal">Moscow</span></div>
              </div>
            </div>
            
            <div className="pt-1">
               <button 
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="flex items-center justify-between w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
                >
                  <span className="text-[13px] font-medium text-white/80">About this session</span>
                  <ChevronDown size={16} className={`text-white/50 transition-transform ${isDescOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isDescOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-3 px-1 text-[13px] text-white/60 leading-relaxed">
                        Niklas answers your questions live. No script, no presentation — a direct conversation with the man behind the brokerage infrastructure of our ecosystem.<br/><br/>Everything you've always wanted to ask — ask it directly.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          </div>
        </section>

        {/* PRIMARY CTA: JOIN SESSION */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-[14px] font-bold uppercase tracking-wider text-white/50">Join Stream</h2>
             <div className="flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
               <span className="text-[12px] font-mono text-red-400">00:45:12</span>
             </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[15px] border border-white/10 transition-colors active:scale-[0.98]">
            <Video size={18} />
            Join Zoom Call
          </button>
        </section>

        <div className="h-[1px] w-full bg-white/10 my-6"></div>

        {/* SECONDARY CTA: SUBMIT QUESTION */}
        <section className="space-y-4 pb-8">
           <div className="px-1 space-y-1">
             <h2 className="text-[18px] font-bold">Ask a Question</h2>
             <p className="text-[13px] text-white/50 leading-relaxed">
               Submit your question in advance. We'll prioritize the most important points during the live stream.
             </p>
           </div>

           {submitted ? (
              <div className="bg-[#1a1830]/50 border border-green-500/30 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 size={32} className="text-green-400 mx-auto" />
                <h3 className="text-[16px] font-bold text-white">Question submitted!</h3>
                <p className="text-[13px] text-white/60">See you on April 9th.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-[13px] text-[#A855F7] font-medium hover:underline"
                >
                  Ask another question
                </button>
              </div>
           ) : (
             <div className="bg-[#151426] border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-1.5 ml-1">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 bg-[#0c0b1a] border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-1.5 ml-1">Contact Info</label>
                    <input 
                      type="text" 
                      placeholder="Telegram / Email" 
                      className="w-full px-4 py-3 bg-[#0c0b1a] border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-white/60 mb-1.5 ml-1">Your Question</label>
                    <textarea 
                      placeholder="What is the future of..." 
                      rows={3}
                      className="w-full px-4 py-3 bg-[#0c0b1a] border border-white/10 rounded-xl text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:border-[#7C3AED] transition-colors resize-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSubmitted(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-[15px] shadow-lg shadow-purple-900/30 active:scale-[0.98] transition-transform"
                >
                  <Send size={16} />
                  Submit Question
                </button>
             </div>
           )}
        </section>
      </div>
    </div>
  );
}