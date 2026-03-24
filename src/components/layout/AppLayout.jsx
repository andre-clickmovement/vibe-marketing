import { useState } from 'react';
import Sidebar from './Sidebar.jsx';

export default function AppLayout({
  children,
  activeSkillId,
  activeWorkflowId,
  activeDocumentId,
  onSelectSkill,
  onSelectWorkflow,
  documents = [],
  onSelectDocument,
  brand,
  user,
  syncing,
  onLogout,
  onOpenCMO,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Get user display info safely
  const userDisplay = user ? {
    initial: user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U',
    name: user.name || user.email?.split('@')[0] || 'User',
  } : null;

  return (
    <div className="app-layout">
      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .app-header {
          height: 56px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 20px;
          gap: 12px;
          background: var(--bg-primary);
        }
        .app-header-sync {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--teal);
          animation: pulse 1.5s ease infinite;
        }
        .app-header-user {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg-elevated);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .app-header-avatar {
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
        .app-header-btn {
          padding: 8px 14px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .app-header-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
          background: var(--bg-elevated);
        }
        .app-header-btn--logout:hover {
          border-color: var(--red);
          color: var(--red);
        }
        .app-header-btn--cmo {
          background: linear-gradient(135deg, #E8B931 0%, #4ECDC4 100%);
          border: none;
          color: var(--bg-primary);
          font-weight: 500;
        }
        .app-header-btn--cmo:hover {
          opacity: 0.9;
          background: linear-gradient(135deg, #E8B931 0%, #4ECDC4 100%);
          color: var(--bg-primary);
        }
        .app-content {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      <Sidebar
        activeSkillId={activeSkillId}
        activeWorkflowId={activeWorkflowId}
        activeDocumentId={activeDocumentId}
        onSelectSkill={onSelectSkill}
        onSelectWorkflow={onSelectWorkflow}
        documents={documents}
        onSelectDocument={onSelectDocument}
        brand={brand}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="app-main">
        <header className="app-header">
          {syncing && <div className="app-header-sync" title="Syncing..." />}
          {userDisplay && (
            <div className="app-header-user">
              <div className="app-header-avatar">{userDisplay.initial}</div>
              <span>{userDisplay.name}</span>
            </div>
          )}
          {onOpenCMO && (
            <button className="app-header-btn app-header-btn--cmo" onClick={onOpenCMO}>
              AI CMO
            </button>
          )}
          {onLogout && (
            <button className="app-header-btn app-header-btn--logout" onClick={onLogout}>
              Logout
            </button>
          )}
        </header>
        <div className="app-content">
          {children}
        </div>
      </main>
    </div>
  );
}
