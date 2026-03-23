import { useState } from 'react';
import { getSkillById, LAYER_META } from '../data/skills.js';

// Simple markdown renderer (same as SkillChat)
function SimpleMarkdown({ children }) {
  if (typeof children !== 'string') return null;

  const html = children
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

export default function DocumentView({ document, onBack, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(document?.title || '');
  const [editContent, setEditContent] = useState(document?.content || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!document) return null;

  const skill = document.skill_id ? getSkillById(document.skill_id) : null;
  const layer = skill ? LAYER_META[skill.layer] : null;

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(document.id, { title: editTitle, content: editContent });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete(document.id);
      onBack();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
  };

  return (
    <div className="doc-view">
      <style>{`
        .doc-view {
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .doc-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .doc-back {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 20px;
          padding: 4px;
        }
        .doc-back:hover { color: var(--gold); }
        .doc-title-area {
          flex: 1;
        }
        .doc-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .doc-title-input {
          font-size: 18px;
          font-weight: 600;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--text-primary);
          width: 100%;
        }
        .doc-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .doc-skill-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        .doc-actions {
          display: flex;
          gap: 8px;
        }
        .doc-btn {
          padding: 8px 14px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .doc-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }
        .doc-btn--primary {
          background: var(--gold);
          border-color: var(--gold);
          color: var(--bg-primary);
        }
        .doc-btn--primary:hover {
          background: #c99a49;
          border-color: #c99a49;
        }
        .doc-btn--danger {
          border-color: var(--red);
          color: var(--red);
        }
        .doc-btn--danger:hover {
          background: rgba(255,107,107,0.1);
        }
        .doc-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .doc-content {
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.7;
          font-size: 15px;
        }
        .doc-textarea {
          width: 100%;
          min-height: 400px;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          font-family: var(--font-mono);
          line-height: 1.6;
          resize: vertical;
        }
        .doc-textarea:focus {
          outline: none;
          border-color: var(--gold);
        }
        .doc-delete-confirm {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-muted);
        }
      `}</style>

      <div className="doc-header">
        <button className="doc-back" onClick={onBack}>Back</button>
        <div className="doc-title-area">
          {isEditing ? (
            <input
              className="doc-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Document title..."
            />
          ) : (
            <>
              <div className="doc-title">{document.title}</div>
              <div className="doc-meta">
                <span>{new Date(document.created_at).toLocaleDateString()}</span>
                {skill && layer && (
                  <span
                    className="doc-skill-badge"
                    style={{ background: layer.color + '18', color: layer.color }}
                  >
                    {skill.name}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="doc-actions">
          {isEditing ? (
            <>
              <button className="doc-btn" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="doc-btn doc-btn--primary" onClick={handleSave}>Save</button>
            </>
          ) : confirmDelete ? (
            <div className="doc-delete-confirm">
              <span>Delete?</span>
              <button className="doc-btn" onClick={() => setConfirmDelete(false)}>No</button>
              <button className="doc-btn doc-btn--danger" onClick={handleDelete}>Yes</button>
            </div>
          ) : (
            <>
              <button className="doc-btn" onClick={handleCopy}>Copy</button>
              {onUpdate && (
                <button className="doc-btn" onClick={() => {
                  setEditTitle(document.title);
                  setEditContent(document.content);
                  setIsEditing(true);
                }}>Edit</button>
              )}
              {onDelete && (
                <button className="doc-btn doc-btn--danger" onClick={() => setConfirmDelete(true)}>Delete</button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="doc-body">
        <div className="doc-content markdown-content">
          {isEditing ? (
            <textarea
              className="doc-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Document content..."
            />
          ) : (
            <SimpleMarkdown>{document.content}</SimpleMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
