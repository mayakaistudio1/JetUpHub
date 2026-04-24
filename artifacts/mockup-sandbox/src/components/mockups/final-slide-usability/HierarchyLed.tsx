export function HierarchyLed() {
  return (
    <div className="min-h-screen w-full flex items-center" style={{ background: "#08070d", fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
      <div className="w-full max-w-[1100px] mx-auto px-[10%] py-12">

        {/* TIER 0 — micro eyebrow */}
        <div className="flex items-center gap-3 mb-12">
          <div className="h-px w-10" style={{ background: "linear-gradient(90deg, #7C3AED, #E879F9)" }} />
          <span className="text-[11px] font-semibold tracking-[0.32em] uppercase" style={{ color: "#E879F9" }}>
            Dein nächster Schritt
          </span>
          <span className="text-[11px] font-medium tracking-wider uppercase text-white/30">
            Schritt 5 / 5
          </span>
        </div>

        {/* TIER 1 — primary message (THE ONE thing) */}
        <div className="mb-10">
          <p className="text-white/45 text-sm font-medium tracking-wide uppercase mb-3">Wo bekommst du den Link?</p>
          <h1 className="font-black leading-[1.02] tracking-[-0.035em] text-white"
              style={{ fontSize: "clamp(2.6rem, 5.8vw, 5rem)" }}>
            Den Registrierungs-Link
            <br />
            bekommst du{" "}
            <span style={{
              background: "linear-gradient(90deg, #C4B5FD 0%, #E879F9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>persönlich</span>.
          </h1>
        </div>

        {/* TIER 2 — supporting context (smaller, lighter) */}
        <div className="mb-8 pl-1 border-l-2 border-white/10 pl-5">
          <p className="text-white/55 text-lg font-light leading-relaxed">
            Von der Person, die dich eingeladen hat.
          </p>
        </div>

        {/* TIER 3 — actionable detail (instruction) */}
        <div className="flex items-start gap-4 max-w-xl">
          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5"
               style={{ background: "rgba(124,58,237,0.18)", border: "1px solid rgba(232,121,249,0.4)" }}>
            <span className="text-[13px] font-bold text-fuchsia-300">1</span>
          </div>
          <div>
            <p className="text-white/85 text-base font-semibold mb-1">Schreib ihr direkt</p>
            <p className="text-white/45 text-sm font-light leading-relaxed">
              Sie führt dich Schritt für Schritt durch die Registrierung.
            </p>
          </div>
        </div>

        {/* TIER 4 — meta (almost invisible) */}
        <button className="mt-14 text-[11px] uppercase tracking-widest text-white/25 hover:text-white/45 transition-colors">
          ↻ Von vorne ansehen
        </button>
      </div>
    </div>
  );
}
