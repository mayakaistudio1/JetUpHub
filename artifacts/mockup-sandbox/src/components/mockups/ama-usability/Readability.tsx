import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle2, Calendar, Clock, ExternalLink } from "lucide-react";

export function Readability() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [question, setQuestion] = useState("");

  const [now, setNow] = useState(new Date("2026-04-05T12:00:00Z"));
  const targetDate = new Date("2026-04-09T17:00:00Z");

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = targetDate.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
  const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

  return (
    <div className="bg-[#0c0b1a] min-h-screen text-white font-sans mx-auto max-w-[390px] overflow-hidden flex flex-col shadow-2xl relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0c0b1a]/95 backdrop-blur-md border-b border-white/10 px-5 py-4 flex items-center gap-4 min-h-[64px]">
        <button className="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7]">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-[20px] font-extrabold tracking-tight">AMA Session</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-12">
        {/* Banner Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video bg-[#1a1830]">
          <img
            src="/__mockup/images/ama-banner.png"
            alt="Niklas Freihofer, CEO TAG Markets"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-[14px] font-bold uppercase tracking-wider shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Live
            </span>
          </div>
        </div>

        <div className="px-5 pt-8 pb-6 space-y-8">
          {/* Event Info */}
          <section className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[14px] font-bold px-3 py-1.5 rounded-full bg-[#7C3AED]/20 text-[#D8B4FE] uppercase tracking-wider border border-[#A855F7]/30">
                AMA Session
              </span>
              <span className="text-[14px] font-bold px-3 py-1.5 rounded-full bg-[#7C3AED] text-white shadow-md shadow-purple-900/50">
                Zoom Call
              </span>
            </div>

            <h2 className="text-[28px] md:text-[32px] font-extrabold leading-tight text-white">
              AMA Session with the CEO of TAG Markets
            </h2>

            <div className="flex flex-col gap-4 text-[16px]">
              <div className="flex items-center gap-3 text-gray-200 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <Calendar size={22} className="text-[#D8B4FE] shrink-0" />
                <span className="font-bold">April 9, 2026</span>
              </div>
              <div className="flex items-center gap-3 text-gray-200 bg-white/5 px-4 py-3 rounded-xl border border-white/5">
                <Clock size={22} className="text-[#D8B4FE] shrink-0" />
                <span className="font-bold">7:00 PM Berlin · 8:00 PM Moscow</span>
              </div>
            </div>

            <p className="text-[17px] text-gray-300 leading-[1.7] whitespace-pre-line font-medium">
              Niklas answers your questions live. No script, no presentation — a direct conversation with the man behind the brokerage infrastructure of our ecosystem.{"\n\n"}Everything you've always wanted to ask — ask it directly.
            </p>
          </section>

          {/* Countdown & Zoom Link */}
          <section className="space-y-6 pt-4 border-t border-white/10">
            <h3 className="text-[18px] font-bold text-white">Starts In</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: days, label: "Days" },
                { value: hours, label: "Hours" },
                { value: minutes, label: "Mins" },
                { value: seconds, label: "Secs" },
              ].map((item, i) => (
                <div key={i} className="bg-[#1a1830] rounded-2xl p-4 text-center border border-[#2d2a4a] shadow-lg">
                  <div className="text-[28px] font-extrabold text-white tabular-nums tracking-tight">
                    {String(item.value).padStart(2, "0")}
                  </div>
                  <div className="text-[13px] text-[#D8B4FE] font-bold uppercase tracking-wider mt-1">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white text-[18px] font-extrabold transition-transform active:scale-[0.98] shadow-xl shadow-purple-900/40 outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              <ExternalLink size={22} />
              Join Zoom Call
            </button>
          </section>

          {/* Form Area - Lighter Background for contrast */}
          <section className="bg-[#16142b] rounded-3xl p-6 border border-[#2d2a4a] shadow-2xl mt-4">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="text-[14px] font-extrabold text-[#D8B4FE] uppercase tracking-widest bg-[#7C3AED]/10 px-3 py-1 rounded-lg">
                  Important
                </span>
              </div>
              <p className="text-[16px] text-gray-300 leading-[1.6] font-medium">
                Please submit your questions in advance using this form. We collect questions beforehand, create a shared list, and address the key points during the live stream.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <h3 className="text-[22px] font-extrabold text-white border-b border-white/10 pb-4">
                Submit your question
              </h3>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-[16px] font-bold text-gray-200">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-5 py-4 bg-[#232140] border border-[#3d3966] rounded-xl text-white text-[17px] placeholder-gray-500 font-medium focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/50 transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact" className="block text-[16px] font-bold text-gray-200">
                  Contact (Telegram / Email / Phone)
                </label>
                <input
                  id="contact"
                  type="text"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder="How can we reach you?"
                  className="w-full px-5 py-4 bg-[#232140] border border-[#3d3966] rounded-xl text-white text-[17px] placeholder-gray-500 font-medium focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/50 transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="question" className="block text-[16px] font-bold text-gray-200">
                  Your Question for Niklas
                </label>
                <textarea
                  id="question"
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  placeholder="What would you like to know?"
                  rows={5}
                  className="w-full px-5 py-4 bg-[#232140] border border-[#3d3966] rounded-xl text-white text-[17px] placeholder-gray-500 font-medium focus:outline-none focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/50 transition-shadow resize-y min-h-[120px]"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-3 w-full py-4 px-6 mt-4 rounded-xl bg-white text-[#0c0b1a] text-[18px] font-extrabold hover:bg-gray-100 transition-colors active:scale-[0.98] outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7] shadow-xl"
              >
                <Send size={20} className="text-[#0c0b1a]" />
                Submit Question
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
