import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';

// === DIAGNOSTIC: Patch React.createElement to catch objects being rendered as children ===
const origCreateElement = React.createElement;
React.createElement = function patchedCreateElement(type, props, ...children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child !== null && child !== undefined && typeof child === 'object' && !React.isValidElement(child) && !Array.isArray(child)) {
      console.error(
        '[DIAGNOSTIC] Object rendered as React child!',
        '\n  Component:', type?.displayName || type?.name || type,
        '\n  Child index:', i,
        '\n  Object value:', child,
        '\n  Object keys:', Object.keys(child),
        '\n  JSON:', JSON.stringify(child).slice(0, 500),
        '\n  Props:', props,
      );
    }
  }
  return origCreateElement.call(this, type, props, ...children);
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const msg = typeof this.state.error?.message === 'string' ? this.state.error.message : 'An unexpected error occurred';
      const stack = this.state.errorInfo?.componentStack || '';
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
        }}>
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <h1 style={{ fontSize: 24, marginBottom: 16 }}>Something went wrong</h1>
            <p style={{ color: '#a1a1aa', marginBottom: 16 }}>{msg}</p>
            <pre style={{ color: '#f87171', fontSize: 11, textAlign: 'left', maxHeight: 200, overflow: 'auto', background: '#18181b', padding: 12, borderRadius: 8, marginBottom: 24 }}>{stack}</pre>
            <p style={{ color: '#71717a', fontSize: 12, marginBottom: 24 }}>Check browser console for [DIAGNOSTIC] logs</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: '#d4a855',
                border: 'none',
                borderRadius: 8,
                color: '#09090b',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
