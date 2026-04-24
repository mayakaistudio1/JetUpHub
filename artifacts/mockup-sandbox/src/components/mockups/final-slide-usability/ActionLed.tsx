import { MessageCircle, Send, RotateCcw } from "lucide-react";

export function ActionLed() {
  return (
    <div className="min-h-screen w-full flex items-center" style={{ background: "#08070d", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <div className="w-full max-w-[1100px] mx-auto px-[10%] py-12">

        <span className="inline-block text-[11px] font-semibold tracking-[0.3em] uppercase mb-7 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(232,121,249,0.10)", color: "#E879F9", border: "1px solid rgba(232,121,249,0.25)" }}>
          Dein nächster Schritt
        </span>

        <h1 className="font-black leading-[1.05] tracking-[-0.035em] text-white mb-4"
            style={{ fontSize: "clamp(2.4rem, 5.4vw, 4.6rem)" }}>
          Den Link bekommst
          <br />du{" "}
          <span style={{
            background: "linear-gradient(90deg, #C4B5FD 0%, #E879F9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>persönlich</span>.
        </h1>

        <p className="text-white/55 text-lg font-light leading-relaxed mb-10 max-w-md">
          Schreib der Person, die dich eingeladen hat — sie führt dich durch die Registrierung.
        </p>

        {/* PRIMARY ACTION — looks fully clickable */}
        <a href="#" className="group inline-flex items-center gap-3 px-7 py-4 rounded-full font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.99]"
           style={{
             background: "linear-gradient(135deg, #7C3AED 0%, #E879F9 100%)",
             boxShadow: "0 0 56px rgba(232,121,249,0.4), 0 8px 24px rgba(0,0,0,0.5)",
             fontSize: "16px",
           }}>
          <MessageCircle className="w-5 h-5" />
          Inviter kontaktieren
          <span className="text-white/70 transition-transform group-hover:translate-x-1">→</span>
        </a>

        {/* SECONDARY ACTIONS — channel chips, clearly tappable */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <span className="text-xs uppercase tracking-wider text-white/40 mr-1">Schreib via</span>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white/85 transition-all hover:bg-white/10 hover:border-white/25"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Send className="w-4 h-4" style={{ color: "#26A5E4" }} />
            Telegram
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white/85 transition-all hover:bg-white/10 hover:border-white/25"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} />
            WhatsApp
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white/85 transition-all hover:bg-white/10 hover:border-white/25"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ color: "#FBBF24" }}>✉</span>
            E-Mail
          </button>
        </div>

        {/* TERTIARY — replay, clearly a button */}
        <button className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider text-white/45 hover:text-white/85 hover:bg-white/5 transition-all">
          <RotateCcw className="w-3.5 h-3.5" />
          Von vorne ansehen
        </button>
      </div>
    </div>
  );
}
