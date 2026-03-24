import { getSkillById, WORKFLOWS, LAYER_META } from '../../data/skills.js';

// Welcome/Overview view when nothing is selected
function WelcomeView({ brand, onSelectSkill }) {
  const foundationSkills = ['brand-voice', 'positioning-angles', 'great-hooks'];
  const foundationComplete = foundationSkills.filter(id => {
    const skill = getSkillById(id);
    return skill?.brandKey && brand?.[skill.brandKey];
  }).length;

  return (
    <div className="welcome-view">
      <style>{`
        .welcome-view {
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .welcome-header {
          margin-bottom: 40px;
        }
        .welcome-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .welcome-subtitle {
          font-size: 15px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .welcome-section {
          margin-bottom: 32px;
        }
        .welcome-section-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        .welcome-progress {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }
        .welcome-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .welcome-progress-label {
          font-size: 14px;
          font-weight: 500;
        }
        .welcome-progress-count {
          font-size: 13px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .welcome-progress-bar {
          height: 6px;
          background: var(--bg-elevated);
          border-radius: 3px;
          overflow: hidden;
        }
        .welcome-progress-fill {
          height: 100%;
          background: var(--gold);
          border-radius: 3px;
          transition: width 0.3s var(--ease);
        }
        .welcome-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        .welcome-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s var(--ease);
          text-align: left;
        }
        .welcome-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        .welcome-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .welcome-card-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .welcome-card-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .welcome-card-desc {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .welcome-card-status {
          margin-top: 12px;
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--teal);
        }
        .brand-memory {
          margin-top: 32px;
        }
        .brand-memory-grid {
          display: grid;
          gap: 16px;
        }
        .brand-memory-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .brand-memory-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border);
        }
        .brand-memory-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .brand-memory-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .brand-memory-edit {
          font-size: 12px;
          color: var(--text-muted);
          background: none;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .brand-memory-edit:hover {
          color: var(--gold);
          background: var(--gold-dim);
        }
        .brand-memory-content {
          padding: 16px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
        }
        .brand-memory-empty {
          color: var(--text-muted);
          font-style: italic;
        }
        .brand-memory-preview {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className="welcome-header">
        <h1 className="welcome-title">Welcome to LevReg Marketing</h1>
        <p className="welcome-subtitle">
          Your AI marketing team in a browser. Select a skill from the sidebar to get started,
          or complete your foundation first for best results.
        </p>
      </div>

      <div className="welcome-section">
        <div className="welcome-progress">
          <div className="welcome-progress-header">
            <span className="welcome-progress-label">Foundation Progress</span>
            <span className="welcome-progress-count">{foundationComplete}/3 complete</span>
          </div>
          <div className="welcome-progress-bar">
            <div
              className="welcome-progress-fill"
              style={{ width: `${(foundationComplete / 3) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="welcome-section">
        <h3 className="welcome-section-title">Recommended Next Steps</h3>
        <div className="welcome-cards">
          {foundationSkills.map(id => {
            const skill = getSkillById(id);
            const isComplete = skill?.brandKey && brand?.[skill.brandKey];
            const layer = LAYER_META[skill.layer];
            return (
              <button
                key={id}
                className="welcome-card"
                onClick={() => onSelectSkill(id)}
              >
                <div className="welcome-card-header">
                  <div className="welcome-card-dot" style={{ background: layer.color }} />
                  <span className="welcome-card-name">{skill.name}</span>
                </div>
                <p className="welcome-card-desc">{skill.tagline}</p>
                {isComplete && (
                  <div className="welcome-card-status">Completed</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Memory Section - Show saved brand context */}
      {foundationComplete > 0 && (
        <div className="welcome-section brand-memory">
          <h3 className="welcome-section-title">Your Brand Memory</h3>
          <div className="brand-memory-grid">
            {/* Voice Profile */}
            {brand?.voiceProfile && (
              <div className="brand-memory-card">
                <div className="brand-memory-header">
                  <span className="brand-memory-title">
                    <span className="brand-memory-dot" style={{ background: LAYER_META.foundation.color }} />
                    Brand Voice
                  </span>
                  <button className="brand-memory-edit" onClick={() => onSelectSkill('brand-voice')}>
                    Edit
                  </button>
                </div>
                <div className="brand-memory-content brand-memory-preview">
                  {brand.voiceProfile}
                </div>
              </div>
            )}

            {/* Positioning */}
            {brand?.positioning && (
              <div className="brand-memory-card">
                <div className="brand-memory-header">
                  <span className="brand-memory-title">
                    <span className="brand-memory-dot" style={{ background: LAYER_META.foundation.color }} />
                    Positioning & Angles
                  </span>
                  <button className="brand-memory-edit" onClick={() => onSelectSkill('positioning-angles')}>
                    Edit
                  </button>
                </div>
                <div className="brand-memory-content brand-memory-preview">
                  {brand.positioning}
                </div>
              </div>
            )}

            {/* Great Hooks */}
            {brand?.greatHooks && (
              <div className="brand-memory-card">
                <div className="brand-memory-header">
                  <span className="brand-memory-title">
                    <span className="brand-memory-dot" style={{ background: LAYER_META.foundation.color }} />
                    Great Hooks
                  </span>
                  <button className="brand-memory-edit" onClick={() => onSelectSkill('great-hooks')}>
                    Edit
                  </button>
                </div>
                <div className="brand-memory-content brand-memory-preview">
                  {brand.greatHooks}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Document viewer
function DocumentView({ document, onClose }) {
  if (!document) return null;

  return (
    <div className="document-view">
      <style>{`
        .document-view {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .document-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .document-title {
          font-size: 18px;
          font-weight: 600;
        }
        .document-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 20px;
          padding: 4px 8px;
        }
        .document-close:hover {
          color: var(--text-primary);
        }
        .document-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }
      `}</style>

      <div className="document-header">
        <h2 className="document-title">{document.title}</h2>
        <button className="document-close" onClick={onClose}>×</button>
      </div>
      <div className="document-content markdown-content">
        {/* Render document content here */}
        <pre>{document.content}</pre>
      </div>
    </div>
  );
}

export default function MainContent({
  view,
  activeSkill,
  activeWorkflow,
  activeDocument,
  brand,
  onSelectSkill,
  onCloseDocument,
  children, // For SkillChat or other custom content
}) {
  // If there's custom children (like SkillChat), render that
  if (children) {
    return <div className="main-content">{children}</div>;
  }

  // Document view
  if (view === 'document' && activeDocument) {
    return <DocumentView document={activeDocument} onClose={onCloseDocument} />;
  }

  // Default: Welcome/Overview
  return <WelcomeView brand={brand} onSelectSkill={onSelectSkill} />;
}
