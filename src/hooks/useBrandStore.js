import { useState, useCallback, useEffect } from 'react';

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

export function useBrandStore() {
  const [brand, setBrand] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : createEmptyBrand();
    } catch {
      return createEmptyBrand();
    }
  });

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(brand));
    } catch {
      // localStorage might be full or unavailable
    }
  }, [brand]);

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

  const resetBrand = useCallback(() => {
    setBrand(createEmptyBrand());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  }, []);

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
  };
}
