import { getAuthHeaders } from './apiHeaders';
import type { PlanningTargets } from '../data/analytics';

// Memory cache for offline/testing fallback
const memoryTargetsCache = new Map<string, PlanningTargets>();

export async function fetchPlanningTargets(uid?: string): Promise<PlanningTargets> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/planning-targets', { headers });
    if (!res.ok) {
      throw new Error(`Failed to load planning targets: ${res.statusText}`);
    }
    const data = await res.json();
    const targets = {
      weekly: typeof data.weekly === 'number' ? data.weekly : 15,
      monthly: typeof data.monthly === 'number' ? data.monthly : 60,
    };
    if (uid) memoryTargetsCache.set(uid, targets);
    return targets;
  } catch (err) {
    if (uid && memoryTargetsCache.has(uid)) {
      return memoryTargetsCache.get(uid)!;
    }
    return { weekly: 15, monthly: 60 };
  }
}

export function subscribePlanningTargets(
  uid: string,
  next: (targets: PlanningTargets) => void,
  onError: (error: Error) => void
): () => void {
  let active = true;

  const poll = async () => {
    try {
      const targets = await fetchPlanningTargets(uid);
      if (active) next(targets);
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

export async function updatePlanningTargets(
  uid: string,
  targets: PlanningTargets
): Promise<void> {
  memoryTargetsCache.set(uid, targets);
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/planning-targets', {
      method: 'PUT',
      headers,
      body: JSON.stringify(targets),
    });
    if (!res.ok) {
      throw new Error(`Failed to update planning targets: ${res.statusText}`);
    }
  } catch (err) {
    // offline/test
  }
}
