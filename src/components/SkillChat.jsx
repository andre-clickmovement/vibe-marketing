import { useState, useRef, useEffect } from 'react';
import { LAYER_META } from '../data/skills.js';

// Simple markdown renderer — avoids react-markdown + unified pipeline
// which causes React error #310 with hast-util-to-jsx-runtime
function SimpleMarkdown({ children }) {
  if (typeof children !== 'string') return null;

  const html = children
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br />');

  return <div dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

export default function SkillChat({ skill, messages, isStreaming, onSend, onStop, onBack }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const layer = LAYER_META[skill.layer];

  return (
    <div className="chat-root">
      <style>{`
        .chat-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
          background: var(--bg-primary);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .chat-back {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 20px;
          padding: 4px;
        }
        .chat-back:hover { color: var(--gold); }
        .chat-skill-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-mono);
        }
        .chat-skill-name { font-weight: 600; font-size: 16px; }
        .chat-skill-tag { font-size: 12px; color: var(--text-muted); }
        .chat-layer-badge {
          margin-left: auto;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        /* Empty state */
        .chat-empty {
          text-align: center;
          padding: 60px 24px;
          color: var(--text-muted);
        }
        .chat-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          font-family: var(--font-mono);
          margin: 0 auto 16px;
        }
        .chat-empty-name { font-size: 18px; font-weight: 500; color: var(--text-secondary); margin-bottom: 8px; }
        .chat-empty-desc {
          font-size: 14px;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .chat-prompts {
          margin-top: 32px;
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .chat-prompt-btn {
          padding: 10px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 13px;
        }
        .chat-prompt-btn:hover { border-color: var(--border-hover); color: var(--text-primary); background: var(--bg-card); }
        /* Messages */
        .chat-msg {
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          animation: fadeIn 0.3s var(--ease);
        }
        .chat-msg-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .chat-msg-body { flex: 1; min-width: 0; }
        .chat-msg-role {
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
          margin-bottom: 6px;
        }
        .chat-msg-user {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
          white-space: pre-wrap;
          word-break: break-word;
        }
        .chat-msg-assistant {
          font-size: 15px;
          line-height: 1.7;
        }
        /* Loading */
        .chat-loading {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .chat-dots {
          display: flex;
          gap: 6px;
          padding: 12px 0;
        }
        .chat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gold);
        }
        /* Input bar */
        .chat-input-bar {
          padding: 16px 24px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          background: var(--bg-primary);
        }
        .chat-input-row {
          display: flex;
          gap: 12px;
        }
        .chat-input {
          flex: 1;
          padding: 14px 18px;
          background: var(--bg-card);
          border: 1px solid var(--border-hover);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 15px;
          font-family: var(--font-body);
        }
        .chat-send {
          padding: 14px 24px;
          background: var(--gold);
          border: none;
          border-radius: 8px;
          color: var(--bg-primary);
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
        }
        .chat-send:hover:not(:disabled) {
          background: #c99a49;
        }
        .chat-stop {
          padding: 14px 24px;
          background: transparent;
          border: 2px solid var(--red);
          border-radius: 10px;
          color: var(--red);
          font-weight: 600;
          font-size: 15px;
          white-space: nowrap;
        }
        .chat-stop:hover { background: rgba(255,107,107,0.1); }
      `}</style>

      {/* Header */}
      <div className="chat-header">
        <button className="chat-back" onClick={onBack}>Back</button>
        <div className="chat-skill-icon" style={{ background: layer.color + '15', color: layer.color, border: `1px solid ${layer.color}25` }}>{skill.shortLabel}</div>
        <div>
          <div className="chat-skill-name">{skill.name}</div>
          <div className="chat-skill-tag">{skill.tagline}</div>
        </div>
        <div className="chat-layer-badge" style={{ background: layer.color + '18', color: layer.color }}>
          {layer.label}
        </div>
      </div>

      {/* Chat body */}
      <div className="chat-body" ref={scrollRef}>
        {messages.length === 0 && !isStreaming && (
          <div className="chat-empty">
            <div className="chat-empty-icon" style={{ background: layer.color + '15', color: layer.color, border: `1px solid ${layer.color}25` }}>{skill.shortLabel}</div>
            <div className="chat-empty-name">{skill.name}</div>
            <div className="chat-empty-desc">{skill.description}</div>
            <div className="chat-prompts">
              {(skill.quickPrompts || []).map((prompt) => (
                <button
                  key={prompt}
                  className="chat-prompt-btn"
                  onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                >
                  {prompt}
                </button>
              ))}
              <button
                className="chat-prompt-btn"
                onClick={() => { setInput('What can you help me with?'); inputRef.current?.focus(); }}
              >
                What can you help me with?
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="chat-msg">
            <div
              className="chat-msg-avatar"
              style={{
                background: msg.role === 'user' ? 'var(--bg-elevated)' : layer.color + '15',
                color: msg.role === 'user' ? 'var(--text-muted)' : layer.color,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
              }}
            >
              {msg.role === 'user' ? 'You' : skill.shortLabel}
            </div>
            <div className="chat-msg-body">
              <div className="chat-msg-role">
                {msg.role === 'user' ? 'YOU' : skill.name.toUpperCase()}
              </div>
              {msg.role === 'user' ? (
                <div className="chat-msg-user">{msg.content}</div>
              ) : (
                <div className="chat-msg-assistant markdown-content">
                  <SimpleMarkdown>{msg.content}</SimpleMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isStreaming && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
          <div className="chat-loading">
            <div className="chat-msg-avatar" style={{ background: layer.color + '15', color: layer.color, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{skill.shortLabel}</div>
            <div className="chat-dots">
              {[0, 1, 2].map((i) => (
                <div key={i} className="chat-dot" style={{ animation: `pulse 1.2s ease infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="chat-input-row">
          <input
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${skill.name}...`}
          />
          {isStreaming ? (
            <button className="chat-stop" onClick={onStop}>Stop</button>
          ) : (
            <button
              className="chat-send"
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
