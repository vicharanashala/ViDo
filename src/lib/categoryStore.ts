import { getAuthHeaders } from './apiHeaders';
import type { UserCategory } from '../data/categories';

// Memory cache for offline/testing fallback
const memoryCategoryCache = new Map<string, UserCategory[]>();

export async function fetchUserCategories(uid?: string): Promise<UserCategory[]> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/categories', { headers });
    if (!res.ok) {
      throw new Error(`Failed to load categories: ${res.statusText}`);
    }
    const data = await res.json();
    const categories = Array.isArray(data) ? (data as UserCategory[]) : [];
    if (uid) memoryCategoryCache.set(uid, categories);
    return categories;
  } catch (err) {
    if (uid && memoryCategoryCache.has(uid)) {
      return memoryCategoryCache.get(uid)!;
    }
    return [];
  }
}

export function subscribeUserCategories(
  uid: string,
  next: (customCategories: UserCategory[]) => void,
  onError: (error: Error) => void
): () => void {
  let active = true;

  const poll = async () => {
    try {
      const categories = await fetchUserCategories(uid);
      if (active) next(categories);
    } catch (err: any) {
      if (active) onError(err);
    }
  };

  void poll();
  const interval = setInterval(() => void poll(), 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function createUserCategory(
  uid: string,
  category: { name: string; color?: string }
): Promise<UserCategory> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      throw new Error(`Failed to create category: ${res.statusText}`);
    }
    const created = await res.json();
    const current = memoryCategoryCache.get(uid) || [];
    memoryCategoryCache.set(uid, [...current, created]);
    return created;
  } catch (err) {
    const fallbackCategory: UserCategory = {
      id: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: category.name,
      color: category.color || '#305fdd',
      isCustom: true,
    };
    const current = memoryCategoryCache.get(uid) || [];
    memoryCategoryCache.set(uid, [...current, fallbackCategory]);
    return fallbackCategory;
  }
}

export async function deleteUserCategory(uid: string, categoryId: string): Promise<void> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch(`/api/user/categories/${categoryId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete category: ${res.statusText}`);
    }
  } catch (err) {
    // offline/test
  }
  const current = memoryCategoryCache.get(uid) || [];
  memoryCategoryCache.set(
    uid,
    current.filter((c) => c.id !== categoryId)
  );
}

export async function updateUserCustomCategories(
  uid: string,
  customCategories: UserCategory[]
): Promise<void> {
  // Sync in-memory and backend
  memoryCategoryCache.set(uid, customCategories);
  try {
    for (const cat of customCategories) {
      await createUserCategory(uid, { name: cat.name, color: cat.color });
    }
  } catch {
    // ignore
  }
}
