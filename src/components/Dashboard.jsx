import { useState } from 'react';
import { SKILLS, WORKFLOWS, LAYER_META, getSkillById } from '../data/skills.js';

export default function Dashboard({ brand, foundationComplete, foundationTotal, onOpenSkill, onOpenWorkflow, onReset, onLogout, user, syncing }) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="dash-root">
      <style>{`
        .dash-root { min-height: 100vh; }
        .dash-nav {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          z-index: 10;
        }
        .dash-nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dash-nav-logo {
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: 1px;
        }
        .dash-nav-sub {
          font-size: 13px;
          color: var(--text-muted);
        }
        .dash-settings-btn {
          padding: 8px 16px;
          background: transparent;
          border: 1px solid var(--border-hover);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .dash-settings-btn:hover { background: var(--bg-elevated); }
        .dash-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dash-user-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg-elevated);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .dash-user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gold-dim);
          color: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
        }
        .dash-sync-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--teal);
          animation: pulse 1.5s ease infinite;
        }
        .dash-logout-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-muted);
          font-size: 12px;
        }
        .dash-logout-btn:hover { border-color: var(--red); color: var(--red); }
        .dash-body {
          max-width: 1080px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        /* Foundation Card */
        .foundation-card {
          padding: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          margin-bottom: 32px;
        }
        .foundation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .foundation-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 1.5px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .foundation-title { font-size: 18px; font-weight: 600; }
        .foundation-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 16px;
          font-weight: 700;
        }
        .foundation-items {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .foundation-item {
          padding: 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .foundation-item:hover { border-color: var(--gold); }
        .foundation-item.done { background: var(--teal-dim); border-color: rgba(78,205,196,0.2); }
        .foundation-hint {
          margin-top: 16px;
          padding: 12px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .foundation-hint strong { cursor: pointer; text-decoration: underline; color: var(--gold); }
        /* Skills */
        .skills-section { margin-bottom: 48px; }
        .section-title { font-size: 20px; font-weight: 600; margin: 0 0 20px; }
        .layer-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }
        .layer-dot {
          width: 8px;
          height: 8px;
          border-radius: 2px;
        }
        .layer-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: var(--font-mono);
        }
        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        .skill-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s var(--ease);
        }
        .skill-card:hover {
          border-color: var(--border-hover);
          background: var(--bg-elevated);
        }
        .skill-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .skill-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-mono);
          letter-spacing: -0.5px;
        }
        .skill-card-time {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .skill-card-name { font-weight: 500; font-size: 15px; margin-bottom: 4px; }
        .skill-card-tag { font-size: 13px; color: var(--text-muted); line-height: 1.5; }
        /* Workflows */
        .wf-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 12px;
        }
        .wf-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s var(--ease);
        }
        .wf-card:hover {
          border-color: var(--border-hover);
          background: var(--bg-elevated);
        }
        .wf-steps {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .wf-step-pill {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .wf-step-name { font-size: 12px; color: var(--text-secondary); }
        .wf-arrow { color: var(--border-hover); margin: 0 2px; font-size: 12px; }
        /* Settings */
        .settings-panel {
          padding: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 32px;
          animation: fadeIn 0.3s var(--ease);
        }
        .settings-grid {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }
        .settings-reset {
          margin-top: 20px;
          padding: 8px 16px;
          background: transparent;
          border: 1px solid rgba(255,107,107,0.25);
          border-radius: 6px;
          color: var(--red);
          font-size: 13px;
        }
        .settings-reset:hover { background: rgba(255,107,107,0.08); }
        /* Footer */
        .dash-footer {
          text-align: center;
          padding: 48px 0 24px;
          color: var(--border-hover);
          font-size: 12px;
          font-family: var(--font-mono);
        }
      `}</style>

      {/* Nav */}
      <nav className="dash-nav">
        <div className="dash-nav-brand">
          <img
            src="https://customer-assets.emergentagent.com/job_7e29061e-ffd5-4596-a601-775e365ccb93/artifacts/eiumndvy_LevRegWhiteBlue_Logo.png"
            alt="LevReg"
            style={{ height: 28, width: 'auto' }}
          />
          <div className="dash-nav-sub">Marketing Skills</div>
        </div>
        <div className="dash-nav-actions">
          {syncing && <div className="dash-sync-indicator" title="Syncing..." />}
          {user && (
            <div className="dash-user-info">
              <div className="dash-user-avatar">
                {typeof user.email === 'string' ? user.email[0]?.toUpperCase() : 'U'}
              </div>
              <span>{typeof user.email === 'string' ? user.email.split('@')[0] : 'User'}</span>
            </div>
          )}
          <button className="dash-settings-btn" onClick={() => setShowSettings(!showSettings)}>
            Settings
          </button>
          {onLogout && (
            <button className="dash-logout-btn" onClick={onLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <div className="dash-body">
        {/* Settings */}
        {showSettings && (
          <div className="settings-panel">
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 20px' }}>API Keys & Integrations</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Add API keys in your Vercel project settings as environment variables. The app uses a server-side proxy — keys are never exposed to the browser.
            </p>
            <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>
                ANTHROPIC_API_KEY=sk-ant-...<br />
                REPLICATE_API_TOKEN=r8_...<br />
                MAILCHIMP_API_KEY=xxxxxxxx-us1
              </code>
            </div>
            <button className="settings-reset" onClick={onReset}>
              Reset Brand & Start Over
            </button>
          </div>
        )}

        {/* Foundation Status */}
        <div className="foundation-card">
          <div className="foundation-header">
            <div>
              <div className="foundation-badge">Brand Foundation</div>
              <div className="foundation-title">
                {foundationComplete === 0
                  ? 'Not started yet'
                  : foundationComplete === foundationTotal
                  ? 'Foundation complete'
                  : `${foundationComplete}/${foundationTotal} complete`}
              </div>
            </div>
            <div
              className="foundation-ring"
              style={{
                border: `3px solid ${foundationComplete === foundationTotal ? 'var(--teal)' : 'var(--border-hover)'}`,
                color: foundationComplete === foundationTotal ? 'var(--teal)' : 'var(--text-muted)',
              }}
            >
              {Math.round((foundationComplete / foundationTotal) * 100)}%
            </div>
          </div>

          <div className="foundation-items">
            {[
              { key: 'voiceProfile', label: 'Voice Profile', skill: 'brand-voice', shortLabel: 'BV' },
              { key: 'positioning', label: 'Positioning', skill: 'positioning-angles', shortLabel: 'PA' },
              { key: 'greatHooks', label: 'Great Hooks', skill: 'great-hooks', shortLabel: 'GH' },
            ].map((item) => (
              <div
                key={item.key}
                className={`foundation-item ${brand[item.key] ? 'done' : ''}`}
                onClick={() => onOpenSkill(item.skill)}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: brand[item.key] ? 'var(--teal-dim)' : 'var(--bg-elevated)',
                    border: `1px solid ${brand[item.key] ? 'var(--teal)' : 'var(--border-hover)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    color: brand[item.key] ? 'var(--teal)' : 'var(--text-muted)',
                  }}>{item.shortLabel}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                </div>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  background: brand[item.key] ? 'var(--teal)' : 'transparent',
                  border: brand[item.key] ? 'none' : '1px solid var(--border-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  color: brand[item.key] ? 'var(--bg-primary)' : 'var(--text-muted)',
                }}>{brand[item.key] ? '✓' : ''}</span>
              </div>
            ))}
          </div>

          {foundationComplete === 0 && (
            <div className="foundation-hint">
              Start with{' '}
              <strong onClick={() => onOpenSkill('brand-voice')}>Brand Voice</strong> to build
              your foundation. Every skill works without it, but output will be personalized once
              it's set.
            </div>
          )}
        </div>

        {/* Skills Grid */}
        <div className="skills-section">
          <h2 className="section-title">Skills</h2>
          {Object.entries(LAYER_META).map(([layerKey, meta]) => {
            const layerSkills = SKILLS.filter((s) => s.layer === layerKey);
            if (!layerSkills.length) return null;
            return (
              <div key={layerKey}>
                <div className="layer-header">
                  <div className="layer-dot" style={{ background: meta.color }} />
                  <span className="layer-label" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <div className="skills-grid">
                  {layerSkills.map((skill) => (
                    <div key={skill.id} className="skill-card" onClick={() => onOpenSkill(skill.id)}>
                      <div className="skill-card-head">
                        <div className="skill-card-icon" style={{ background: meta.color + '15', color: meta.color, border: `1px solid ${meta.color}25` }}>{skill.shortLabel}</div>
                        <div className="skill-card-time">~{skill.time}</div>
                      </div>
                      <div className="skill-card-name">{skill.name}</div>
                      <div className="skill-card-tag">{skill.tagline}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Workflows */}
        <div>
          <h2 className="section-title">Workflows</h2>
          <div className="wf-grid">
            {WORKFLOWS.map((wf) => (
              <div key={wf.id} className="wf-card" onClick={() => onOpenWorkflow(wf.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{wf.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{wf.time}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{wf.description}</div>
                <div className="wf-steps">
                  {wf.steps.map((stepId, i) => {
                    const s = getSkillById(stepId);
                    const layer = LAYER_META[s.layer];
                    return (
                      <span key={stepId} className="wf-step-pill">
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: layer.color + '15',
                          color: layer.color,
                          fontSize: 10,
                          fontWeight: 600,
                          fontFamily: 'var(--font-mono)',
                        }}>{s.shortLabel}</span>
                        <span className="wf-step-name">{s.name}</span>
                        {i < wf.steps.length - 1 && <span className="wf-arrow">/</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-footer">
          LevReg Skills
        </div>
      </div>
    </div>
  );
}
