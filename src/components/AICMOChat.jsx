import { useState, useRef, useEffect } from 'react';

// Simple markdown renderer
function SimpleMarkdown({ children }) {
  if (typeof children !== 'string') return null;

  const html = children
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

export default function AICMOChat({
  isOpen,
  onClose,
  messages,
  isStreaming,
  onSend,
  onStop,
  onSelectSkill,
}) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Detect skill recommendations in messages and make them clickable
  const skillMap = {
    'Brand Voice': 'brand-voice',
    'Positioning & Angles': 'positioning-angles',
    'Positioning': 'positioning-angles',
    'Great Hooks': 'great-hooks',
    'Keyword Research': 'keyword-research',
    'SEO Content': 'seo-content',
    'Newsletter': 'newsletter',
    'Newsletter Writer': 'newsletter',
    'Social Creator': 'social-creator',
    'Direct Response Copy': 'direct-response-copy',
    'Direct Response': 'direct-response-copy',
    'Lead Magnets': 'lead-magnet',
    'Lead Magnet': 'lead-magnet',
    'Email Sequences': 'email-sequences',
    'Creative Engine': 'creative',
  };

  return (
    <div className={`cmo-overlay ${isOpen ? 'cmo-overlay--open' : ''}`}>
      <style>{`
        .cmo-overlay {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          background: var(--bg-card);
          border-left: 1px solid var(--border);
          transform: translateX(100%);
          transition: transform 0.3s var(--ease);
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        .cmo-overlay--open {
          transform: translateX(0);
        }
        .cmo-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-elevated);
        }
        .cmo-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, #E8B931 0%, #4ECDC4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: var(--bg-primary);
        }
        .cmo-title-area {
          flex: 1;
        }
        .cmo-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .cmo-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }
        .cmo-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 24px;
          padding: 4px;
          line-height: 1;
        }
        .cmo-close:hover {
          color: var(--text-primary);
        }
        .cmo-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .cmo-empty {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }
        .cmo-empty-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #E8B931 0%, #4ECDC4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 16px;
          color: var(--bg-primary);
        }
        .cmo-empty-title {
          font-size: 16px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .cmo-empty-desc {
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .cmo-suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cmo-suggestion {
          padding: 10px 14px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          text-align: left;
        }
        .cmo-suggestion:hover {
          border-color: var(--gold);
          color: var(--text-primary);
        }
        .cmo-msg {
          margin-bottom: 16px;
          display: flex;
          gap: 10px;
        }
        .cmo-msg-avatar {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .cmo-msg-avatar--user {
          background: var(--bg-elevated);
          color: var(--text-muted);
        }
        .cmo-msg-avatar--ai {
          background: linear-gradient(135deg, #E8B931 0%, #4ECDC4 100%);
          color: var(--bg-primary);
        }
        .cmo-msg-content {
          flex: 1;
          min-width: 0;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
        }
        .cmo-msg-content p {
          margin: 0 0 8px;
        }
        .cmo-msg-content p:last-child {
          margin-bottom: 0;
        }
        .cmo-loading {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
        }
        .cmo-dots {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        .cmo-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--gold);
        }
        .cmo-input-bar {
          padding: 12px 16px;
          border-top: 1px solid var(--border);
          background: var(--bg-primary);
        }
        .cmo-input-row {
          display: flex;
          gap: 10px;
        }
        .cmo-input {
          flex: 1;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
        }
        .cmo-input:focus {
          outline: none;
          border-color: var(--gold);
        }
        .cmo-send {
          padding: 12px 18px;
          background: var(--gold);
          border: none;
          border-radius: 8px;
          color: var(--bg-primary);
          font-weight: 500;
          font-size: 13px;
        }
        .cmo-send:hover:not(:disabled) {
          background: #c99a49;
        }
        .cmo-send:disabled {
          opacity: 0.5;
        }
        .cmo-stop {
          padding: 12px 18px;
          background: transparent;
          border: 1px solid var(--red);
          border-radius: 8px;
          color: var(--red);
          font-weight: 500;
          font-size: 13px;
        }
        .cmo-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 420px;
          bottom: 0;
          background: rgba(0,0,0,0.3);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s;
          z-index: 999;
        }
        .cmo-overlay--open + .cmo-backdrop,
        .cmo-backdrop--open {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>

      <div className="cmo-header">
        <div className="cmo-avatar">CMO</div>
        <div className="cmo-title-area">
          <div className="cmo-title">AI CMO</div>
          <div className="cmo-subtitle">Your marketing strategist</div>
        </div>
        <button className="cmo-close" onClick={onClose}>x</button>
      </div>

      <div className="cmo-body" ref={scrollRef}>
        {messages.length === 0 && !isStreaming ? (
          <div className="cmo-empty">
            <div className="cmo-empty-icon">CMO</div>
            <div className="cmo-empty-title">How can I help?</div>
            <div className="cmo-empty-desc">
              I can analyze your website, recommend marketing strategies, or help you decide which skill to use next.
            </div>
            <div className="cmo-suggestions">
              <button
                className="cmo-suggestion"
                onClick={() => setInput('Analyze my website: ')}
              >
                Analyze my website
              </button>
              <button
                className="cmo-suggestion"
                onClick={() => setInput('What should I work on first for my new business?')}
              >
                What should I work on first?
              </button>
              <button
                className="cmo-suggestion"
                onClick={() => setInput('Help me understand my competitive positioning')}
              >
                Help with competitive positioning
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className="cmo-msg">
                <div className={`cmo-msg-avatar ${msg.role === 'user' ? 'cmo-msg-avatar--user' : 'cmo-msg-avatar--ai'}`}>
                  {msg.role === 'user' ? 'You' : 'CMO'}
                </div>
                <div className="cmo-msg-content markdown-content">
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <SimpleMarkdown>{msg.content}</SimpleMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
              <div className="cmo-loading">
                <div className="cmo-msg-avatar cmo-msg-avatar--ai">CMO</div>
                <div className="cmo-dots">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="cmo-dot" style={{ animation: `pulse 1.2s ease infinite ${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="cmo-input-bar">
        <div className="cmo-input-row">
          <input
            ref={inputRef}
            className="cmo-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI CMO..."
          />
          {isStreaming ? (
            <button className="cmo-stop" onClick={onStop}>Stop</button>
          ) : (
            <button
              className="cmo-send"
              disabled={!input.trim()}
              onClick={handleSend}
            >
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
