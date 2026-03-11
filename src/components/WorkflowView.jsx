import { getSkillById, LAYER_META } from '../data/skills.js';

export default function WorkflowView({ workflow, onOpenSkill, onBack }) {
  return (
    <div className="wfv-root">
      <style>{`
        .wfv-root { min-height: 100vh; padding: 24px; }
        .wfv-back {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 15px;
          padding: 0;
          margin-bottom: 32px;
        }
        .wfv-back:hover { color: var(--gold); }
        .wfv-inner { max-width: 640px; margin: 0 auto; }
        .wfv-icon { font-size: 48px; margin-bottom: 16px; }
        .wfv-title { font-size: 32px; font-weight: 700; margin: 0 0 8px; }
        .wfv-desc { color: var(--text-secondary); font-size: 16px; margin: 0 0 8px; }
        .wfv-time {
          font-size: 13px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          margin-bottom: 40px;
        }
        .wfv-steps { position: relative; }
        .wfv-line {
          position: absolute;
          left: 23px;
          top: 48px;
          bottom: 48px;
          width: 2px;
          background: linear-gradient(180deg, var(--gold), var(--teal), var(--purple));
        }
        .wfv-step {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 16px;
          position: relative;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .wfv-step:hover { border-color: var(--gold); }
        .wfv-step-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
          z-index: 1;
        }
        .wfv-step-num {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--text-muted);
        }
        .wfv-step-name { font-weight: 600; font-size: 15px; }
        .wfv-step-tag { font-size: 13px; color: var(--text-secondary); }
        .wfv-step-time { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        .wfv-start {
          width: 100%;
          padding: 16px 32px;
          background: transparent;
          border: 2px solid var(--gold);
          border-radius: 10px;
          color: var(--gold);
          font-size: 16px;
          font-weight: 600;
          margin-top: 24px;
        }
        .wfv-start:hover {
          background: var(--gold);
          color: var(--bg-primary);
        }
      `}</style>

      <button className="wfv-back" onClick={onBack}>← Back to Dashboard</button>

      <div className="wfv-inner">
        <div className="wfv-icon">{workflow.icon}</div>
        <h1 className="wfv-title">{workflow.name}</h1>
        <p className="wfv-desc">{workflow.description}</p>
        <div className="wfv-time">Estimated: {workflow.time}</div>

        <div className="wfv-steps">
          <div className="wfv-line" />

          {workflow.steps.map((stepId, i) => {
            const skill = getSkillById(stepId);
            const layer = LAYER_META[skill.layer];
            return (
              <div key={stepId} className="wfv-step" onClick={() => onOpenSkill(stepId)}>
                <div className="wfv-step-icon" style={{ background: layer.color + '18', border: `1px solid ${layer.color}30` }}>
                  {skill.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="wfv-step-num">STEP {i + 1}</span>
                    <span className="wfv-step-name">{skill.name}</span>
                  </div>
                  <div className="wfv-step-tag">{skill.tagline}</div>
                  <div className="wfv-step-time">~{skill.time}</div>
                </div>
                <div style={{ color: 'var(--border-hover)', fontSize: 18, alignSelf: 'center' }}>→</div>
              </div>
            );
          })}
        </div>

        <button className="wfv-start" onClick={() => onOpenSkill(workflow.steps[0])}>
          Start with {getSkillById(workflow.steps[0])?.name} →
        </button>
      </div>
    </div>
  );
}
