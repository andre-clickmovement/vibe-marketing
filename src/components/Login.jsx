import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, isConfigured } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        setMessage('Check your email for a confirmation link.');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithGithub();
      }
    } catch (err) {
      setError(typeof err?.message === 'string' ? err.message : String(err));
    }
  };

  if (!isConfigured) {
    return (
      <div className="login-container">
        <style>{`
          .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: var(--bg-primary);
          }
          .login-card {
            width: 100%;
            max-width: 400px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 40px;
          }
          .login-logo {
            height: 32px;
            margin-bottom: 32px;
          }
          .login-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .login-subtitle {
            color: var(--text-muted);
            font-size: 14px;
            margin-bottom: 32px;
          }
          .login-warning {
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.3);
            border-radius: 8px;
            padding: 16px;
            color: var(--red);
            font-size: 13px;
            line-height: 1.5;
          }
        `}</style>
        <div className="login-card">
          <img
            src="https://customer-assets.emergentagent.com/job_7e29061e-ffd5-4596-a601-775e365ccb93/artifacts/eiumndvy_LevRegWhiteBlue_Logo.png"
            alt="LevReg"
            className="login-logo"
          />
          <h1 className="login-title">Setup Required</h1>
          <p className="login-subtitle">Supabase is not configured yet.</p>
          <div className="login-warning">
            Add your Supabase credentials to <code>.env</code>:
            <br /><br />
            <code>VITE_SUPABASE_URL=...</code><br />
            <code>VITE_SUPABASE_ANON_KEY=...</code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: var(--bg-primary);
        }
        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 40px;
        }
        .login-logo {
          height: 32px;
          margin-bottom: 32px;
        }
        .login-title {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .login-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 32px;
        }
        .login-social-btns {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .login-social-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
        }
        .login-social-btn:hover {
          border-color: var(--border-hover);
          background: var(--bg-card);
        }
        .login-social-btn svg {
          width: 20px;
          height: 20px;
        }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .login-divider-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .login-divider-text {
          color: var(--text-muted);
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .login-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .login-input {
          padding: 12px 16px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
        }
        .login-input:focus {
          outline: none;
          border-color: var(--gold);
          box-shadow: 0 0 0 3px var(--gold-dim);
        }
        .login-submit {
          padding: 14px 24px;
          background: var(--gold);
          border: none;
          border-radius: 8px;
          color: var(--bg-primary);
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
        }
        .login-submit:hover:not(:disabled) {
          background: #c99a49;
        }
        .login-submit:disabled {
          opacity: 0.5;
        }
        .login-error {
          background: rgba(248, 113, 113, 0.1);
          border: 1px solid rgba(248, 113, 113, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--red);
          font-size: 13px;
        }
        .login-message {
          background: rgba(94, 234, 212, 0.1);
          border: 1px solid rgba(94, 234, 212, 0.3);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--teal);
          font-size: 13px;
        }
        .login-switch {
          text-align: center;
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .login-switch-btn {
          background: none;
          border: none;
          color: var(--gold);
          font-size: 14px;
          font-weight: 500;
          padding: 0;
          margin-left: 4px;
        }
        .login-switch-btn:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        <img
          src="https://customer-assets.emergentagent.com/job_7e29061e-ffd5-4596-a601-775e365ccb93/artifacts/eiumndvy_LevRegWhiteBlue_Logo.png"
          alt="LevReg"
          className="login-logo"
        />
        <h1 className="login-title">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to access your brand and continue where you left off.'
            : 'Get started with your AI marketing assistant.'}
        </p>

        {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}
        {message && <div className="login-message" style={{ marginBottom: 16 }}>{message}</div>}

        <div className="login-social-btns">
          <button className="login-social-btn" onClick={() => handleSocialLogin('google')}>
            <svg viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button className="login-social-btn" onClick={() => handleSocialLogin('github')}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span className="login-divider-text">or</span>
          <div className="login-divider-line" />
        </div>

        <form className="login-form" onSubmit={handleEmailSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-switch">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button
            className="login-switch-btn"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
              setMessage('');
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
