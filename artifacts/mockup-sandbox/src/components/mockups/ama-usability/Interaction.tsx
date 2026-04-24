import React, { useState } from "react";
import { ArrowLeft, Send, User, Phone, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";

export function Interaction() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const isNameValid = name.trim().length > 0;
  const isContactValid = contact.trim().length > 0;
  const isQuestionValid = question.trim().length > 0;
  const isFormValid = isNameValid && isContactValid && isQuestionValid;

  return (
    <div className="w-[390px] min-h-[844px] bg-[#0c0b1a] text-white flex flex-col relative overflow-hidden font-sans">
      <div className="sticky top-0 z-30 bg-[#0c0b1a]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <h1 className="text-[17px] font-extrabold text-white flex-1 tracking-tight">
            AMA Session
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="relative w-full overflow-hidden">
          <img
            src="/__mockup/images/ama-banner.png"
            alt="AMA Session with Niklas Freihofer"
            className="w-full h-auto object-cover"
          />
        </div>

        <div className="px-5 pt-5 pb-8">
          <div className="bg-[#131224] rounded-3xl p-5 border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <div className="mb-5">
              <h2 className="text-[18px] font-bold text-white mb-1">Submit your question</h2>
              <p className="text-[13px] text-white/50 leading-relaxed">
                We're collecting questions now to cover the most important topics on stream.
              </p>
            </div>

            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-white/80 pl-1">Your Name</label>
                  {isNameValid && <CheckCircle2 size={14} className="text-green-400" />}
                </div>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'name' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <User size={18} className={focused === 'name' ? 'text-[#A855F7]' : ''} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] focus:outline-none placeholder-white/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-white/80 pl-1">Contact Info</label>
                  {isContactValid && <CheckCircle2 size={14} className="text-green-400" />}
                </div>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'contact' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <Phone size={18} className={focused === 'contact' ? 'text-[#A855F7]' : ''} />
                  </div>
                  <input
                    type="text"
                    value={contact}
                    onFocus={() => setFocused('contact')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setContact(e.target.value)}
                    placeholder="Telegram or Email"
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] focus:outline-none placeholder-white/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-white/80 pl-1">Your Question</label>
                  {isQuestionValid && <CheckCircle2 size={14} className="text-green-400" />}
                  {!isQuestionValid && focused === 'question' && question.length > 0 && <AlertCircle size={14} className="text-amber-400" />}
                </div>
                <div className={`relative rounded-xl overflow-hidden transition-all duration-200 border ${focused === 'question' ? 'border-[#7C3AED] ring-1 ring-[#7C3AED]/30' : 'border-white/10'} bg-[#0c0b1a]`}>
                  <div className="absolute left-3.5 top-4 text-white/40">
                    <HelpCircle size={18} className={focused === 'question' ? 'text-[#A855F7]' : ''} />
                  </div>
                  <textarea
                    value={question}
                    onFocus={() => setFocused('question')}
                    onBlur={() => setFocused(null)}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="What would you like to ask Niklas?"
                    rows={4}
                    className="w-full bg-transparent pl-11 pr-4 py-3.5 text-[15px] focus:outline-none placeholder-white/20 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 ${
                    isFormValid
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98]"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  }`}
                >
                  <Send size={18} className={isFormValid ? "text-white" : "opacity-40"} />
                  Send Question
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
