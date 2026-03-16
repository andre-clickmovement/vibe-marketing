import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      loading: true,
      isAuthenticated: false,
      isConfigured: false,
      signInWithGoogle: async () => {},
      signInWithGithub: async () => {},
      signInWithEmail: async () => {},
      signUpWithEmail: async () => {},
      signOut: async () => {},
    };
  }
  return ctx;
};

// Convert Supabase AuthError to a plain Error with a string message
const toError = (err) => {
  if (!err) return new Error('Unknown error');
  if (typeof err.message === 'string') return new Error(err.message);
  return new Error(String(err));
};

export function AuthProvider({ children }) {
  // Store user fields as individual primitives — never store raw Supabase objects in state
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  const updateUser = (rawUser) => {
    if (!rawUser) {
      setUserId(null);
      setUserEmail('');
      setUserName('');
      return;
    }
    setUserId(String(rawUser.id || ''));
    setUserEmail(typeof rawUser.email === 'string' ? rawUser.email : '');
    setUserName(
      typeof rawUser.user_metadata?.full_name === 'string'
        ? rawUser.user_metadata.full_name
        : typeof rawUser.user_metadata?.name === 'string'
          ? rawUser.user_metadata.name
          : ''
    );
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        updateUser(session?.user ?? null);
      } catch (err) {
        console.error('Session error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw toError(error);
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw toError(error);
  };

  const signInWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw toError(error);
  };

  const signUpWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) throw toError(error);
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw toError(error);
  };

  // Build user object from primitive state — never from raw Supabase objects
  const user = userId ? { id: userId, email: userEmail, name: userName } : null;

  const value = {
    user,
    loading,
    isAuthenticated: !!userId,
    isConfigured: isSupabaseConfigured(),
    signInWithGoogle,
    signInWithGithub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
