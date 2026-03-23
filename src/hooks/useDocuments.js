import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'vibe-documents';

export function useDocuments(userId = null) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load documents on mount or when userId changes
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);

      if (userId && isSupabaseConfigured()) {
        // Load from Supabase
        try {
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

          if (error) {
            console.error('Error loading documents:', error);
            setDocuments([]);
          } else {
            setDocuments(data || []);
          }
        } catch (err) {
          console.error('Error loading documents:', err);
          setDocuments([]);
        }
      } else {
        // Fall back to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          setDocuments(stored ? JSON.parse(stored) : []);
        } catch {
          setDocuments([]);
        }
      }

      setLoading(false);
    };

    loadDocuments();
  }, [userId]);

  // Save to localStorage (fallback)
  const saveToLocalStorage = useCallback((docs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    } catch {
      // localStorage might be full
    }
  }, []);

  // Create a new document
  const createDocument = useCallback(async ({ title, content, skillId }) => {
    const newDoc = {
      id: crypto.randomUUID(),
      title,
      content,
      skill_id: skillId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (userId && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            title,
            content,
            skill_id: skillId,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating document:', error);
          return null;
        }

        setDocuments((prev) => [data, ...prev]);
        return data;
      } catch (err) {
        console.error('Error creating document:', err);
        return null;
      }
    } else {
      // localStorage fallback
      const updated = [newDoc, ...documents];
      setDocuments(updated);
      saveToLocalStorage(updated);
      return newDoc;
    }
  }, [userId, documents, saveToLocalStorage]);

  // Update an existing document
  const updateDocument = useCallback(async (id, { title, content }) => {
    if (userId && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('documents')
          .update({ title, content })
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          console.error('Error updating document:', error);
          return null;
        }

        setDocuments((prev) =>
          prev.map((doc) => (doc.id === id ? data : doc))
        );
        return data;
      } catch (err) {
        console.error('Error updating document:', err);
        return null;
      }
    } else {
      // localStorage fallback
      const updated = documents.map((doc) =>
        doc.id === id
          ? { ...doc, title, content, updated_at: new Date().toISOString() }
          : doc
      );
      setDocuments(updated);
      saveToLocalStorage(updated);
      return updated.find((d) => d.id === id);
    }
  }, [userId, documents, saveToLocalStorage]);

  // Delete a document
  const deleteDocument = useCallback(async (id) => {
    if (userId && isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.error('Error deleting document:', error);
          return false;
        }

        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        return true;
      } catch (err) {
        console.error('Error deleting document:', err);
        return false;
      }
    } else {
      // localStorage fallback
      const updated = documents.filter((doc) => doc.id !== id);
      setDocuments(updated);
      saveToLocalStorage(updated);
      return true;
    }
  }, [userId, documents, saveToLocalStorage]);

  // Get a single document by ID
  const getDocument = useCallback((id) => {
    return documents.find((doc) => doc.id === id) || null;
  }, [documents]);

  return {
    documents,
    loading,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
  };
}
