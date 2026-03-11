import { useState, useEffect } from 'react';

export default function Splash({ onStart, onSkip }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const stats = [
    { n: '11', l: 'Skills' },
    { n: '5', l: 'Creative Modes' },
    { n: '7', l: 'Workflows' },
    { n: '6', l: 'JSON Schemas' },
  ];

  return (
    <div className="splash-root">
      <style>{`
        .splash-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .splash-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(232,185,49,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232,185,49,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPulse 6s ease infinite;
        }
        .splash-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(232,185,49,0.06) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .splash-content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 640px;
          padding: 0 24px;
          opacity: 0;
          transform: translateY(24px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .splash-content.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .splash-badge {
          font-family: var(--font-mono);
          font-size: 13px;
          letter-spacing: 4px;
          color: var(--gold);
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .splash-title {
          font-size: clamp(36px, 6vw, 56px);
          font-weight: 800;
          line-height: 1.05;
          margin: 0 0 20px;
          letter-spacing: -1px;
        }
        .splash-title span { color: var(--gold); }
        .splash-sub {
          font-size: 18px;
          line-height: 1.6;
          color: var(--text-secondary);
          max-width: 480px;
          margin: 0 auto 48px;
          font-weight: 300;
        }
        .splash-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .splash-cta {
          padding: 16px 40px;
          font-size: 16px;
          font-weight: 600;
          background: transparent;
          color: var(--gold);
          border: 2px solid var(--gold);
          border-radius: 8px;
        }
        .splash-cta:hover {
          background: var(--gold);
          color: var(--bg-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(232,185,49,0.3);
        }
        .splash-ghost {
          padding: 16px 40px;
          font-size: 16px;
          font-weight: 400;
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-hover);
          border-radius: 8px;
        }
        .splash-ghost:hover {
          border-color: var(--gold);
          color: var(--gold);
        }
        .splash-stats {
          display: flex;
          gap: 32px;
          justify-content: center;
          margin-top: 64px;
          flex-wrap: wrap;
        }
        .splash-stat-num {
          font-size: 28px;
          font-weight: 700;
          color: var(--gold);
          font-family: var(--font-mono);
        }
        .splash-stat-label {
          font-size: 12px;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 4px;
        }
      `}</style>

      <div className="splash-grid" />
      <div className="splash-glow" />

      <div className={`splash-content ${visible ? 'visible' : ''}`}>
        <div className="splash-badge">Vibe Marketing Skills v2.0</div>
        <h1 className="splash-title">
          Your marketing team<br />
          <span>in a browser.</span>
        </h1>
        <p className="splash-sub">
          11 AI-powered marketing skills that remember your brand, chain together
          into workflows, and get sharper every time you use them.
        </p>
        <div className="splash-actions">
          <button className="splash-cta" onClick={onStart}>Get Started</button>
          <button className="splash-ghost" onClick={onSkip}>Skip to Dashboard</button>
        </div>
        <div className="splash-stats">
          {stats.map((s) => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div className="splash-stat-num">{s.n}</div>
              <div className="splash-stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
