import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  DEFAULT_CATEGORIES,
  slugifyCategory,
  type UserCategory,
} from '../../data/categories';
import {
  createUserCategory,
  deleteUserCategory,
  subscribeUserCategories,
} from '../../lib/categoryStore';

const DEMO_CATEGORIES_STORAGE_KEY = 'vido-demo-custom-categories-v1';

function loadDemoCustomCategories(): UserCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(DEMO_CATEGORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface UseCategoriesResult {
  categories: UserCategory[];
  customCategories: UserCategory[];
  addCategory: (params: { name: string; color?: string }) => Promise<UserCategory>;
  deleteCategory: (categoryId: string) => Promise<void>;
  error: string | null;
}

export function useCategories(
  uid?: string | null,
  mode: 'demo' | 'live' = 'demo'
): UseCategoriesResult {
  const [demoCustom, setDemoCustom] = useState<UserCategory[]>(loadDemoCustomCategories);
  const [liveCustom, setLiveCustom] = useState<UserCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sync demo categories to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DEMO_CATEGORIES_STORAGE_KEY, JSON.stringify(demoCustom));
    } catch {
      // ignore
    }
  }, [demoCustom]);

  // Subscribe to live categories from Firestore
  useEffect(() => {
    if (mode !== 'live' || !uid) return;
    setError(null);
    return subscribeUserCategories(
      uid,
      (custom) => setLiveCustom(custom),
      (err) => setError(err.message)
    );
  }, [mode, uid]);

  const customCategories = mode === 'live' ? liveCustom : demoCustom;

  const categories = useMemo(() => {
    // Combine standard default categories with user's custom categories
    const existingIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
    const filteredCustom = customCategories.filter((c) => !existingIds.has(c.id));
    return [...DEFAULT_CATEGORIES, ...filteredCustom];
  }, [customCategories]);

  const addCategory = useCallback(
    async (params: { name: string; color?: string }): Promise<UserCategory> => {
      const trimmed = params.name.trim();
      if (!trimmed) {
        throw new Error('Category name cannot be empty');
      }

      const id = slugifyCategory(trimmed);
      const newCategory: UserCategory = {
        id,
        name: trimmed,
        color: params.color || '#305fdd',
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      if (mode === 'live' && uid) {
        const next = [...liveCustom.filter((c) => c.id !== id), newCategory];
        setLiveCustom(next);
        await createUserCategory(uid, { name: trimmed, color: params.color });
      } else {
        setDemoCustom((prev) => [...prev.filter((c) => c.id !== id), newCategory]);
      }

      return newCategory;
    },
    [mode, uid, liveCustom]
  );

  const deleteCategory = useCallback(
    async (categoryId: string): Promise<void> => {
      if (mode === 'live' && uid) {
        const next = liveCustom.filter((c) => c.id !== categoryId);
        setLiveCustom(next);
        await deleteUserCategory(uid, categoryId);
      } else {
        setDemoCustom((prev) => prev.filter((c) => c.id !== categoryId));
      }
    },
    [mode, uid, liveCustom]
  );

  return {
    categories,
    customCategories,
    addCategory,
    deleteCategory,
    error,
  };
}
