import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'vibe-brand-state';

const createEmptyBrand = () => ({
  voiceProfile: null,
  positioning: null,
  greatHooks: null,
  audience: null,
  competitors: null,
  creativeKit: null,
  stack: null,
  keywordPlan: null,
  assets: [],
  learnings: [],
});

export function useBrandStore(userId = null) {
  const [brand, setBrand] = useState(createEmptyBrand);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Load brand data on mount or when userId changes
  useEffect(() => {
    const loadBrand = async () => {
      setLoading(true);

      if (userId && isSupabaseConfigured()) {
        // Load from Supabase
        try {
          const { data, error } = await supabase
            .from('brand_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned
            console.error('Error loading brand:', error);
          }

          if (data) {
            setBrand({
              voiceProfile: data.voice_profile,
              positioning: data.positioning,
              greatHooks: data.great_hooks,
              audience: data.audience,
              competitors: data.competitors,
              creativeKit: data.creative_kit,
              stack: data.stack,
              keywordPlan: data.keyword_plan,
              assets: data.assets || [],
              learnings: data.learnings || [],
            });
          } else {
            setBrand(createEmptyBrand());
          }
        } catch (err) {
          console.error('Error loading brand:', err);
          setBrand(createEmptyBrand());
        }
      } else {
        // Fall back to localStorage
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          setBrand(stored ? JSON.parse(stored) : createEmptyBrand());
        } catch {
          setBrand(createEmptyBrand());
        }
      }

      setLoading(false);
    };

    loadBrand();
  }, [userId]);

  // Debounced save to Supabase
  const saveBrand = useCallback(
    async (newBrand) => {
      if (!userId || !isSupabaseConfigured()) {
        // Save to localStorage
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newBrand));
        } catch {
          // localStorage might be full
        }
        return;
      }

      // Debounce Supabase saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setSyncing(true);
        try {
          const { error } = await supabase.from('brand_profiles').upsert(
            {
              user_id: userId,
              voice_profile: newBrand.voiceProfile,
              positioning: newBrand.positioning,
              great_hooks: newBrand.greatHooks,
              audience: newBrand.audience,
              competitors: newBrand.competitors,
              creative_kit: newBrand.creativeKit,
              stack: newBrand.stack,
              keyword_plan: newBrand.keywordPlan,
              assets: newBrand.assets,
              learnings: newBrand.learnings,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id',
            }
          );

          if (error) {
            console.error('Error saving brand:', error);
          }
        } catch (err) {
          console.error('Error saving brand:', err);
        } finally {
          setSyncing(false);
        }
      }, 1000); // Debounce 1 second
    },
    [userId]
  );

  // Auto-save on brand changes
  useEffect(() => {
    if (!loading) {
      saveBrand(brand);
    }
  }, [brand, loading, saveBrand]);

  const updateBrand = useCallback((key, value) => {
    setBrand((prev) => ({ ...prev, [key]: value }));
  }, []);

  const appendAsset = useCallback((asset) => {
    setBrand((prev) => ({
      ...prev,
      assets: [...prev.assets, { ...asset, date: new Date().toISOString() }],
    }));
  }, []);

  const appendLearning = useCallback((learning) => {
    setBrand((prev) => ({
      ...prev,
      learnings: [...prev.learnings, { ...learning, date: new Date().toISOString() }],
    }));
  }, []);

  const resetBrand = useCallback(async () => {
    setBrand(createEmptyBrand());

    if (userId && isSupabaseConfigured()) {
      try {
        await supabase.from('brand_profiles').delete().eq('user_id', userId);
      } catch (err) {
        console.error('Error deleting brand:', err);
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // no-op
      }
    }
  }, [userId]);

  const getBrandContext = useCallback(() => {
    const parts = [];
    if (brand.voiceProfile) parts.push(`## Voice Profile\n${brand.voiceProfile}`);
    if (brand.positioning) parts.push(`## Positioning\n${brand.positioning}`);
    if (brand.greatHooks) parts.push(`## Great Hooks\n${brand.greatHooks}`);
    if (brand.keywordPlan) parts.push(`## Keyword Plan\n${brand.keywordPlan}`);
    if (brand.stack) parts.push(`## Business Info\n${brand.stack}`);
    if (brand.learnings.length > 0) {
      parts.push(
        `## Learnings\n${brand.learnings.map((l) => `- ${l.text}`).join('\n')}`
      );
    }
    return parts.join('\n\n') || '';
  }, [brand]);

  const foundationComplete = [brand.voiceProfile, brand.positioning, brand.greatHooks].filter(Boolean).length;

  return {
    brand,
    setBrand,
    updateBrand,
    appendAsset,
    appendLearning,
    resetBrand,
    getBrandContext,
    foundationComplete,
    foundationTotal: 3,
    loading,
    syncing,
  };
}
