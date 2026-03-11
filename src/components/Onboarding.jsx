import { useState } from 'react';
import { GOALS } from '../data/skills.js';

const STEPS = [
  { title: 'Your Business', subtitle: 'One sentence is all I need.' },
  { title: 'Your Goal', subtitle: 'What are you trying to achieve?' },
  { title: 'Integrations', subtitle: 'Optional — connect your tools for richer output.' },
];

export default function Onboarding({ onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const [businessDesc, setBusinessDesc] = useState('');
  const [businessUrl, setBusinessUrl] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [apiKeys, setApiKeys] = useState({ replicate: '', mailchimp: '', convertkit: '' });

  const canAdvance =
    (step === 0 && businessDesc.trim()) ||
    (step === 1 && selectedGoal) ||
    step === 2;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete({ businessDesc, businessUrl, selectedGoal, apiKeys });
    }
  };

  return (
    <div className="ob-root">
      <style>{`
        .ob-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .ob-progress {
          height: 3px;
          background: #1A1A20;
        }
        .ob-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold), var(--teal));
          border-radius: 2px;
          transition: width 0.5s var(--ease);
        }
        .ob-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .ob-inner { max-width: 560px; width: 100%; }
        .ob-dots {
          display: flex;
          gap: 8px;
          margin-bottom: 48px;
        }
        .ob-dot {
          flex: 1;
          height: 4px;
          border-radius: 2px;
          transition: background 0.3s;
        }
        .ob-step-num {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 3px;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .ob-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px;
        }
        .ob-subtitle {
          color: var(--text-secondary);
          font-size: 16px;
          margin: 0 0 40px;
        }
        .ob-label {
          display: block;
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-weight: 500;
        }
        .ob-textarea, .ob-input-field {
          width: 100%;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-hover);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 16px;
          font-family: var(--font-body);
          box-sizing: border-box;
          resize: vertical;
        }
        .ob-goal-card {
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          display: flex;
          gap: 16px;
          align-items: center;
          cursor: pointer;
          transition: all 0.25s var(--ease);
        }
        .ob-goal-card:hover { border-color: var(--gold); transform: translateY(-2px); }
        .ob-goal-card.selected {
          background: rgba(232,185,49,0.08);
          border-color: var(--gold);
        }
        .ob-goal-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          font-size: 28px;
          flex-shrink: 0;
        }
        .ob-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 48px;
        }
        .ob-back {
          padding: 12px 24px;
          background: transparent;
          border: 1px solid var(--border-hover);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 15px;
        }
        .ob-next {
          padding: 12px 32px;
          background: transparent;
          border: 2px solid var(--gold);
          border-radius: 8px;
          color: var(--gold);
          font-size: 15px;
          font-weight: 600;
        }
        .ob-next:hover:not(:disabled) {
          background: var(--gold);
          color: var(--bg-primary);
        }
        .api-desc {
          font-size: 12px;
          color: var(--text-muted);
        }
        .api-input {
          width: 100%;
          padding: 14px;
          background: var(--bg-primary);
          border: 1px solid var(--border-hover);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 13px;
          font-family: var(--font-mono);
          box-sizing: border-box;
        }
      `}</style>

      <div className="ob-progress">
        <div className="ob-progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="ob-body">
        <div className="ob-inner">
          <div className="ob-dots">
            {STEPS.map((_, i) => (
              <div key={i} className="ob-dot" style={{ background: i <= step ? 'var(--gold)' : '#1A1A20' }} />
            ))}
          </div>

          <div className="ob-step-num">Step {step + 1} of {STEPS.length}</div>
          <h2 className="ob-title">{STEPS[step].title}</h2>
          <p className="ob-subtitle">{STEPS[step].subtitle}</p>

          {/* Step 0: Business */}
          {step === 0 && (
            <div className="animate-fade-in">
              <label className="ob-label">What does your business do?</label>
              <textarea
                className="ob-textarea"
                value={businessDesc}
                onChange={(e) => setBusinessDesc(e.target.value)}
                placeholder="e.g. We sell handmade leather goods to professionals who want something that lasts forever."
                rows={3}
              />
              <label className="ob-label" style={{ marginTop: 24 }}>Website URL (optional)</label>
              <input
                className="ob-input-field"
                value={businessUrl}
                onChange={(e) => setBusinessUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
              />
            </div>
          )}

          {/* Step 1: Goal */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ display: 'grid', gap: 12 }}>
              {GOALS.map((g) => (
                <div
                  key={g.id}
                  className={`ob-goal-card ${selectedGoal === g.id ? 'selected' : ''}`}
                  onClick={() => setSelectedGoal(g.id)}
                >
                  <div className="ob-goal-icon" style={{ background: selectedGoal === g.id ? 'var(--gold-dim)' : 'var(--bg-elevated)' }}>
                    {g.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{g.label}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{g.desc}</div>
                  </div>
                  {selectedGoal === g.id && (
                    <div style={{ color: 'var(--gold)', fontSize: 20 }}>✓</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Integrations */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gap: 20 }}>
                {[
                  { key: 'replicate', label: 'Replicate API Token', placeholder: 'r8_...', desc: 'Enables AI image + video generation' },
                  { key: 'mailchimp', label: 'Mailchimp API Key', placeholder: 'xxxxxxxx-us1', desc: 'Deploy email sequences directly' },
                ].map((t) => (
                  <div key={t.key}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      <span style={{ fontWeight: 500 }}>{t.label}</span>
                      <span className="api-desc">{t.desc}</span>
                    </label>
                    <input
                      className="api-input"
                      type="password"
                      value={apiKeys[t.key]}
                      onChange={(e) => setApiKeys({ ...apiKeys, [t.key]: e.target.value })}
                      placeholder={t.placeholder}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
                All optional. Every skill works without them — keys just unlock deeper integrations.
              </p>
            </div>
          )}

          <div className="ob-nav">
            <button className="ob-back" onClick={() => step === 0 ? onBack() : setStep(step - 1)}>
              {step === 0 ? 'Back' : 'Previous'}
            </button>
            <button className="ob-next" disabled={!canAdvance} onClick={handleNext}>
              {step < STEPS.length - 1 ? 'Continue' : 'Build My Brand →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
