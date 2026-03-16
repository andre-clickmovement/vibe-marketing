import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Extract only safe primitive values from the Supabase user object
const sanitizeUser = (rawUser) => {
  if (!rawUser) return null;
  console.log('Raw user from Supabase:', JSON.stringify(rawUser, null, 2));
  const sanitized = {
    id: String(rawUser.id || ''),
    email: typeof rawUser.email === 'string' ? rawUser.email : '',
    name: typeof rawUser.user_metadata?.full_name === 'string'
      ? rawUser.user_metadata.full_name
      : typeof rawUser.user_metadata?.name === 'string'
        ? rawUser.user_metadata.name
        : '',
  };
  console.log('Sanitized user:', sanitized);
  return sanitized;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (rawUser) => {
    setUser(sanitizeUser(rawUser));
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        }
        updateUser(session?.user);
      } catch (err) {
        console.error('Session error:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signInWithGithub = async () => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUpWithEmail = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
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
