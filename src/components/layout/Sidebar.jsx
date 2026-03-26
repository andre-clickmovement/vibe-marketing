import { useState } from 'react';
import { SKILLS, PLAYBOOKS, LAYER_META } from '../../data/skills.js';

// Group skills by layer
const getSkillsByLayer = () => {
  const layers = {};
  SKILLS.forEach(skill => {
    if (!layers[skill.layer]) {
      layers[skill.layer] = [];
    }
    layers[skill.layer].push(skill);
  });
  return layers;
};

export default function Sidebar({
  activeSkillId,
  activeWorkflowId,
  activeDocumentId,
  onSelectSkill,
  onSelectWorkflow,
  documents = [],
  onSelectDocument,
  brand,
  collapsed = false,
  onToggleCollapse,
}) {
  const [expandedSections, setExpandedSections] = useState({
    foundation: true,
    'content-strategy': true,
    'marketing-execution': true,
    workflows: false,
    documents: true,
  });

  const skillsByLayer = getSkillsByLayer();
  const layerOrder = ['foundation', 'content-strategy', 'marketing-execution'];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if a skill has been completed (has output in brand)
  const isSkillComplete = (skill) => {
    if (!skill.brandKey || !brand) return false;
    return !!brand[skill.brandKey];
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <style>{`
        .sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          background: var(--bg-card);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.2s var(--ease), min-width 0.2s var(--ease);
        }
        .sidebar--collapsed {
          width: 60px;
          min-width: 60px;
        }
        .sidebar-header {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sidebar-logo {
          height: 24px;
          width: auto;
        }
        .sidebar-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }
        .sidebar--collapsed .sidebar-title {
          display: none;
        }
        .sidebar-collapse-btn {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-collapse-btn:hover {
          color: var(--text-primary);
        }
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }
        .sidebar-section {
          margin-bottom: 4px;
        }
        .sidebar-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          cursor: pointer;
          user-select: none;
          transition: background 0.15s;
        }
        .sidebar-section-header:hover {
          background: var(--bg-elevated);
        }
        .sidebar-section-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .sidebar-section-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          flex: 1;
        }
        .sidebar-section-chevron {
          color: var(--text-muted);
          font-size: 10px;
          transition: transform 0.2s;
        }
        .sidebar-section-chevron--open {
          transform: rotate(90deg);
        }
        .sidebar-section-items {
          overflow: hidden;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 8px 28px;
          cursor: pointer;
          transition: background 0.15s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .sidebar-item:hover {
          background: var(--bg-elevated);
        }
        .sidebar-item--active {
          background: var(--gold-dim);
        }
        .sidebar-item--active:hover {
          background: var(--gold-dim);
        }
        .sidebar-item-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1.5px solid var(--text-muted);
          flex-shrink: 0;
        }
        .sidebar-item-indicator--complete {
          background: var(--teal);
          border-color: var(--teal);
        }
        .sidebar-item-indicator--active {
          background: var(--gold);
          border-color: var(--gold);
        }
        .sidebar-item-name {
          font-size: 13px;
          color: var(--text-secondary);
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-item--active .sidebar-item-name {
          color: var(--gold);
          font-weight: 500;
        }
        .sidebar-item-badge {
          font-size: 10px;
          font-family: var(--font-mono);
          padding: 2px 5px;
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-muted);
        }
        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 12px 16px;
        }
        .sidebar-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
        }
        .sidebar--collapsed .sidebar-section-label,
        .sidebar--collapsed .sidebar-item-name,
        .sidebar--collapsed .sidebar-item-badge,
        .sidebar--collapsed .sidebar-section-chevron {
          display: none;
        }
        .sidebar--collapsed .sidebar-item {
          padding: 10px 0;
          justify-content: center;
        }
        .sidebar--collapsed .sidebar-section-header {
          justify-content: center;
          padding: 10px 0;
        }
      `}</style>

      <div className="sidebar-header">
        <img
          src="https://customer-assets.emergentagent.com/job_7e29061e-ffd5-4596-a601-775e365ccb93/artifacts/eiumndvy_LevRegWhiteBlue_Logo.png"
          alt="LevReg"
          className="sidebar-logo"
        />
        <span className="sidebar-title">Marketing</span>
        <button className="sidebar-collapse-btn" onClick={onToggleCollapse}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <div className="sidebar-content">
        {/* Skill Layers */}
        {layerOrder.map(layerId => {
          const layer = LAYER_META[layerId];
          const skills = skillsByLayer[layerId] || [];
          const isExpanded = expandedSections[layerId];

          return (
            <div key={layerId} className="sidebar-section">
              <div
                className="sidebar-section-header"
                onClick={() => toggleSection(layerId)}
              >
                <div
                  className="sidebar-section-dot"
                  style={{ background: layer.color }}
                />
                <span className="sidebar-section-label">{layer.label}</span>
                <span className={`sidebar-section-chevron ${isExpanded ? 'sidebar-section-chevron--open' : ''}`}>
                  ▶
                </span>
              </div>
              {isExpanded && (
                <div className="sidebar-section-items">
                  {skills.map(skill => {
                    const isActive = activeSkillId === skill.id;
                    const isComplete = isSkillComplete(skill);
                    return (
                      <button
                        key={skill.id}
                        className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                        onClick={() => onSelectSkill(skill.id)}
                      >
                        <div className={`sidebar-item-indicator ${isComplete ? 'sidebar-item-indicator--complete' : ''} ${isActive ? 'sidebar-item-indicator--active' : ''}`} />
                        <span className="sidebar-item-name">{skill.name}</span>
                        <span className="sidebar-item-badge">{skill.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <div className="sidebar-divider" />

        {/* Playbooks Section */}
        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => toggleSection('workflows')}
          >
            <div className="sidebar-section-dot" style={{ background: '#6366f1' }} />
            <span className="sidebar-section-label">Playbooks</span>
            <span className={`sidebar-section-chevron ${expandedSections.workflows ? 'sidebar-section-chevron--open' : ''}`}>
              ▶
            </span>
          </div>
          {expandedSections.workflows && (
            <div className="sidebar-section-items">
              {PLAYBOOKS.map(wf => {
                const isActive = activeWorkflowId === wf.id;
                return (
                  <button
                    key={wf.id}
                    className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                    onClick={() => onSelectWorkflow(wf.id)}
                  >
                    <div className={`sidebar-item-indicator ${isActive ? 'sidebar-item-indicator--active' : ''}`} />
                    <span className="sidebar-item-name">{wf.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="sidebar-divider" />
        <div className="sidebar-section">
          <div
            className="sidebar-section-header"
            onClick={() => toggleSection('documents')}
          >
            <div className="sidebar-section-dot" style={{ background: '#10b981' }} />
            <span className="sidebar-section-label">Documents ({documents.length})</span>
            <span className={`sidebar-section-chevron ${expandedSections.documents ? 'sidebar-section-chevron--open' : ''}`}>
              ▶
            </span>
          </div>
          {expandedSections.documents && (
            <div className="sidebar-section-items">
              {documents.length === 0 ? (
                <div className="sidebar-item" style={{ cursor: 'default', opacity: 0.6 }}>
                  <span className="sidebar-item-name" style={{ fontStyle: 'italic' }}>
                    No saved documents yet
                  </span>
                </div>
              ) : (
                documents.map(doc => {
                  const isActive = activeDocumentId === doc.id;
                  return (
                    <button
                      key={doc.id}
                      className={`sidebar-item ${isActive ? 'sidebar-item--active' : ''}`}
                      onClick={() => onSelectDocument(doc.id)}
                    >
                      <div className={`sidebar-item-indicator sidebar-item-indicator--complete ${isActive ? 'sidebar-item-indicator--active' : ''}`} />
                      <span className="sidebar-item-name">{doc.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
