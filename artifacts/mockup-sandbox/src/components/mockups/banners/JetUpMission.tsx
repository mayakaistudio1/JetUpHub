export function JetUpMission() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        html, body {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          font-family: 'Montserrat', sans-serif;
        }

        .banner {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .bg {
          position: absolute;
          inset: 0;
          background-image: url('/__mockup/jetup-mission-bg.png');
          background-size: cover;
          background-position: center 30%;
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            rgba(10, 4, 26, 0.82) 0%,
            rgba(10, 4, 26, 0.55) 45%,
            rgba(10, 4, 26, 0.0) 80%
          );
        }

        .content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 5vw;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5vw;
          margin-bottom: 1.8vh;
        }

        .tag-bar {
          width: 0.35vw;
          height: 2.8vh;
          background: #9B59FF;
          border-radius: 2px;
        }

        .tag-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.2vw;
          font-weight: 400;
          color: #C5A8FF;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }

        .brand {
          font-family: 'Montserrat', sans-serif;
          font-size: 7.5vw;
          font-weight: 900;
          color: #FFFFFF;
          line-height: 0.92;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 40px rgba(120, 60, 255, 0.35);
        }

        .mission-row {
          display: flex;
          align-items: center;
          gap: 1.2vw;
          margin-top: 0.6vh;
        }

        .mission-word {
          font-family: 'Montserrat', sans-serif;
          font-size: 7.5vw;
          font-weight: 300;
          color: #FFFFFF;
          line-height: 0.92;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .accent-line {
          flex: 1;
          height: 0.3vh;
          background: linear-gradient(90deg, #9B59FF 0%, rgba(155, 89, 255, 0) 100%);
          max-width: 18vw;
          border-radius: 2px;
        }

        .sub {
          margin-top: 2.5vh;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.1vw;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.65);
          letter-spacing: 0.06em;
          max-width: 38vw;
          line-height: 1.6;
        }

        .logo-mark {
          position: absolute;
          bottom: 4vh;
          right: 4vw;
          display: flex;
          align-items: center;
          gap: 0.6vw;
        }

        .logo-dot {
          width: 0.7vw;
          height: 0.7vw;
          border-radius: 50%;
          background: #9B59FF;
          box-shadow: 0 0 12px #9B59FF;
        }

        .logo-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 1vw;
          font-weight: 700;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.15em;
        }
      `}</style>

      <div className="banner">
        <div className="bg" />
        <div className="overlay" />
        <div className="content">
          <div className="tag">
            <div className="tag-bar" />
            <span className="tag-text">Digital Infrastructure of Growth</span>
          </div>
          <div className="brand">JetUP</div>
          <div className="mission-row">
            <span className="mission-word">Mission</span>
            <div className="accent-line" />
          </div>
        </div>
        <div className="logo-mark">
          <div className="logo-dot" />
          <span className="logo-text">jet-up.ai</span>
        </div>
      </div>
    </>
  );
}
