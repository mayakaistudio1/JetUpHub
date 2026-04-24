import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";

const PromoBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const exportPNG = async () => {
    if (!bannerRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(bannerRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        width: 1200,
        height: 675,
      });
      const link = document.createElement("a");
      link.download = "dennis_fast_start_promo_banner.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: 16, background: "#0a0510", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: "100%", maxWidth: "100%", overflowX: "auto" }}>
        <div
          ref={bannerRef}
          style={{
            width: 1200,
            height: 675,
            position: "relative",
            overflow: "hidden",
            fontFamily: "'Montserrat', sans-serif",
            background: "#08051a",
          }}
        >
          <img
            src="/promo_banner_bg.png"
            alt=""
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(10,5,30,0.85) 0%, rgba(30,12,65,0.5) 35%, rgba(10,15,40,0.3) 65%, rgba(10,5,30,0.75) 100%)",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: -10,
              bottom: 0,
              width: 500,
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <img
              src="/dennis-photo.png"
              alt="Dennis"
              crossOrigin="anonymous"
              style={{
                height: "97%",
                objectFit: "contain",
                objectPosition: "bottom",
                filter: "drop-shadow(-10px 0 50px rgba(124,58,237,0.4)) drop-shadow(0 0 80px rgba(124,58,237,0.15))",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              left: 65,
              top: 55,
              right: 480,
              bottom: 55,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: 58,
                  fontWeight: 800,
                  color: "#ffffff",
                  lineHeight: 1.08,
                  margin: 0,
                  letterSpacing: -1.5,
                  textShadow: "0 2px 30px rgba(0,0,0,0.4)",
                }}
              >
                Fast Start Promo
              </h1>
              <p
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  color: "#C084FC",
                  margin: 0,
                  marginTop: 4,
                  lineHeight: 1.2,
                  letterSpacing: -0.5,
                }}
              >
                For new partners
              </p>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 88,
                    fontWeight: 800,
                    color: "#C084FC",
                    lineHeight: 1,
                    textShadow: "0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(124,58,237,0.2)",
                    letterSpacing: -2,
                  }}
                >
                  100
                </span>
                <span
                  style={{
                    fontSize: 44,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1,
                  }}
                >
                  +
                </span>
                <span
                  style={{
                    fontSize: 88,
                    fontWeight: 800,
                    color: "#C084FC",
                    lineHeight: 1,
                    textShadow: "0 0 40px rgba(168,85,247,0.4), 0 0 80px rgba(124,58,237,0.2)",
                    letterSpacing: -2,
                  }}
                >
                  100
                </span>
              </div>

              <p
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: "rgba(196,181,253,0.6)",
                  margin: 0,
                  marginBottom: 20,
                  letterSpacing: 0.5,
                }}
              >
                by Dennis, JetUp Founder
              </p>
            </div>

            <div>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Deposit 100 USD
              </p>
              <p
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                get{" "}
                <span style={{ color: "#C084FC", fontWeight: 700 }}>100 USD on top</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={exportPNG}
        disabled={exporting}
        style={{
          padding: "12px 32px",
          background: exporting ? "#555" : "#7C3AED",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: exporting ? "default" : "pointer",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {exporting ? "Exporting..." : "Download PNG (2400x1350)"}
      </button>
    </div>
  );
};

export default PromoBanner;
