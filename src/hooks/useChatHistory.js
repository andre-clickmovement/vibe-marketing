import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'vibe-chat-sessions';

export function useChatHistory(userId = null, skillId = null) {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef(null);

  // Load chat sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      if (!skillId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      if (userId && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId)
            .eq('skill_id', skillId)
            .order('updated_at', { ascending: false });

          if (error) {
            console.error('Error loading chat sessions:', error);
          } else {
            setSessions(data || []);
            // Load the most recent session if available
            if (data && data.length > 0) {
              setCurrentSession(data[0]);
            }
          }
        } catch (err) {
          console.error('Error loading chat sessions:', err);
        }
      } else {
        // Fall back to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const allSessions = stored ? JSON.parse(stored) : [];
          const skillSessions = allSessions.filter((s) => s.skill_id === skillId);
          setSessions(skillSessions);
          if (skillSessions.length > 0) {
            setCurrentSession(skillSessions[0]);
          }
        } catch {
          setSessions([]);
        }
      }

      setLoading(false);
    };

    loadSessions();
  }, [userId, skillId]);

  // Save session
  const saveSession = useCallback(
    async (messages) => {
      if (!skillId || messages.length === 0) return;

      const sessionData = {
        skill_id: skillId,
        messages,
        updated_at: new Date().toISOString(),
      };

      if (userId && isSupabaseConfigured()) {
        // Debounce Supabase saves
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
          try {
            if (currentSession?.id) {
              // Update existing session
              const { error } = await supabase
                .from('chat_sessions')
                .update({ messages, updated_at: new Date().toISOString() })
                .eq('id', currentSession.id);

              if (error) console.error('Error updating session:', error);
            } else {
              // Create new session
              const { data, error } = await supabase
                .from('chat_sessions')
                .insert({
                  user_id: userId,
                  skill_id: skillId,
                  messages,
                })
                .select()
                .single();

              if (error) {
                console.error('Error creating session:', error);
              } else if (data) {
                setCurrentSession(data);
              }
            }
          } catch (err) {
            console.error('Error saving session:', err);
          }
        }, 1000);
      } else {
        // Save to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const allSessions = stored ? JSON.parse(stored) : [];

          if (currentSession?.id) {
            const idx = allSessions.findIndex((s) => s.id === currentSession.id);
            if (idx >= 0) {
              allSessions[idx] = { ...allSessions[idx], ...sessionData };
            }
          } else {
            const newSession = {
              id: `local_${Date.now()}`,
              ...sessionData,
              created_at: new Date().toISOString(),
            };
            allSessions.unshift(newSession);
            setCurrentSession(newSession);
          }

          localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
        } catch {
          // localStorage might be full
        }
      }
    },
    [userId, skillId, currentSession]
  );

  // Start a new session
  const startNewSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  // Load a specific session
  const loadSession = useCallback((session) => {
    setCurrentSession(session);
  }, []);

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId) => {
      if (userId && isSupabaseConfigured()) {
        try {
          const { error } = await supabase
            .from('chat_sessions')
            .delete()
            .eq('id', sessionId);

          if (error) {
            console.error('Error deleting session:', error);
          } else {
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (currentSession?.id === sessionId) {
              setCurrentSession(null);
            }
          }
        } catch (err) {
          console.error('Error deleting session:', err);
        }
      } else {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const allSessions = stored ? JSON.parse(stored) : [];
          const filtered = allSessions.filter((s) => s.id !== sessionId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          if (currentSession?.id === sessionId) {
            setCurrentSession(null);
          }
        } catch {
          // no-op
        }
      }
    },
    [userId, currentSession]
  );

  return {
    sessions,
    currentSession,
    loading,
    saveSession,
    startNewSession,
    loadSession,
    deleteSession,
    currentMessages: currentSession?.messages || [],
  };
}
