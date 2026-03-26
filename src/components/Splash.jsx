import { useState, useEffect } from 'react';

export default function Splash({ onStart, onSkip }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  const stats = [
    { n: '12', l: 'Skills' },
    { n: '5', l: 'Creative Modes' },
    { n: '7', l: 'Playbooks' },
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
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .splash-glow {
          position: absolute;
          top: -30%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 900px;
          background: radial-gradient(circle, rgba(212, 168, 85, 0.04) 0%, transparent 60%);
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
          font-size: 11px;
          letter-spacing: 3px;
          color: var(--text-muted);
          margin-bottom: 24px;
          text-transform: uppercase;
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 20px;
          display: inline-block;
        }
        .splash-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 600;
          line-height: 1.1;
          margin: 0 0 20px;
          letter-spacing: -0.5px;
        }
        .splash-title span { color: var(--gold); }
        .splash-sub {
          font-size: 17px;
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 460px;
          margin: 0 auto 48px;
          font-weight: 400;
        }
        .splash-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .splash-cta {
          padding: 14px 32px;
          font-size: 14px;
          font-weight: 500;
          background: var(--gold);
          color: var(--bg-primary);
          border: none;
          border-radius: 8px;
        }
        .splash-cta:hover {
          background: #c99a49;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(212, 168, 85, 0.25);
        }
        .splash-ghost {
          padding: 14px 32px;
          font-size: 14px;
          font-weight: 500;
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .splash-ghost:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
          background: var(--bg-elevated);
        }
        .splash-stats {
          display: flex;
          gap: 48px;
          justify-content: center;
          margin-top: 64px;
          flex-wrap: wrap;
        }
        .splash-stat-num {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-mono);
        }
        .splash-stat-label {
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 6px;
        }
      `}</style>

      <div className="splash-grid" />
      <div className="splash-glow" />

      <div className={`splash-content ${visible ? 'visible' : ''}`}>
        <img
          src="https://customer-assets.emergentagent.com/job_7e29061e-ffd5-4596-a601-775e365ccb93/artifacts/eiumndvy_LevRegWhiteBlue_Logo.png"
          alt="LevReg"
          style={{ height: 32, width: 'auto', marginBottom: 24 }}
        />
        <h1 className="splash-title">
          Your marketing team<br />
          <span>in a browser.</span>
        </h1>
        <p className="splash-sub">
          AI-powered marketing skills that remember your brand, chain together
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
