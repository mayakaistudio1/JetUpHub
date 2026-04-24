export function AccessibleLed() {
  return (
    <div className="min-h-screen w-full flex items-center"
         style={{
           background: "#0B0A12",
           fontFamily: "Atkinson Hyperlegible, Inter, system-ui, sans-serif",
         }}>
      <div className="w-full max-w-[980px] mx-auto px-[8%] py-12">

        {/* Eyebrow — high contrast, clear label */}
        <div className="mb-8">
          <p className="text-[15px] font-bold tracking-wide uppercase"
             style={{ color: "#FFFFFF", letterSpacing: "0.08em" }}>
            <span aria-hidden="true" style={{ color: "#F0ABFC", marginRight: 12 }}>▍</span>
            Dein nächster Schritt
          </p>
        </div>

        {/* Heading — high contrast, generous spacing */}
        <h1 className="mb-7 font-bold"
            style={{
              fontSize: "clamp(2rem, 4.4vw, 3.6rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "#FFFFFF",
              wordSpacing: "0.05em",
            }}>
          Den Registrierungs-Link
          <br />
          bekommst du{" "}
          <span style={{
            color: "#FFFFFF",
            borderBottom: "4px solid #F0ABFC",
            paddingBottom: "2px",
          }}>
            persönlich
          </span>.
        </h1>

        {/* Body — very readable size, ~16-18px equivalent, generous line-height */}
        <p className="mb-10"
           style={{
             fontSize: "clamp(1.05rem, 1.5vw, 1.2rem)",
             lineHeight: 1.7,
             color: "#E5E5EA",
             maxWidth: "60ch",
             wordSpacing: "0.04em",
           }}>
          Du bekommst den Link von der Person, die dich eingeladen hat.
          Schreib ihr direkt — sie führt dich Schritt für Schritt durch die Registrierung.
        </p>

        {/* Info card — solid background, AAA contrast text, large icon, clear semantic structure */}
        <div role="note" aria-label="Hinweis"
             className="flex items-start gap-4 p-5 rounded-xl"
             style={{
               background: "#1A1825",
               border: "2px solid #4C1D95",
             }}>
          <div aria-hidden="true"
               className="flex-shrink-0 flex items-center justify-center"
               style={{
                 width: 36, height: 36, borderRadius: "50%",
                 background: "#F0ABFC", color: "#0B0A12",
                 fontWeight: 900, fontSize: 20,
               }}>
            i
          </div>
          <div>
            <p className="font-bold mb-1"
               style={{ color: "#FFFFFF", fontSize: "1rem", letterSpacing: "0.01em" }}>
              Tipp
            </p>
            <p style={{ color: "#E5E5EA", fontSize: "1rem", lineHeight: 1.65 }}>
              Du hast die Person noch nicht? Frag den Bekannten, der dir JetUP gezeigt hat.
            </p>
          </div>
        </div>

        {/* Replay — visible, real button, generous touch target */}
        <button
          type="button"
          className="mt-10 inline-flex items-center gap-2.5 transition-colors hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fuchsia-400"
          style={{
            color: "#F0ABFC",
            fontSize: "1rem",
            fontWeight: 600,
            padding: "10px 14px",
            minHeight: 44,
            borderRadius: 8,
          }}>
          <span aria-hidden="true">↻</span>
          Präsentation von vorne ansehen
        </button>
      </div>
    </div>
  );
}
