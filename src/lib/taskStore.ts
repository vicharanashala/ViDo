import { getAuthHeaders } from './apiHeaders';
import type { SampleTask } from '../data/sampleTasks';

// In-memory cache for offline/testing fallback
const memoryTaskCache = new Map<string, SampleTask[]>();

export async function fetchUserTasks(uid?: string): Promise<SampleTask[]> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/tasks', { headers });
    if (!res.ok) {
      throw new Error(`Failed to fetch tasks: ${res.statusText}`);
    }
    const data = await res.json();
    const tasks = Array.isArray(data) ? (data as SampleTask[]) : [];
    if (uid) memoryTaskCache.set(uid, tasks);
    return tasks;
  } catch (err) {
    if (uid && memoryTaskCache.has(uid)) {
      return memoryTaskCache.get(uid)!;
    }
    return [];
  }
}

export async function createUserTask(task: SampleTask, uid?: string): Promise<SampleTask> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch('/api/user/tasks', {
      method: 'POST',
      headers,
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      throw new Error(`Failed to create task: ${res.statusText}`);
    }
    const created = await res.json();
    if (uid) {
      const current = memoryTaskCache.get(uid) || [];
      memoryTaskCache.set(uid, [created, ...current]);
    }
    return created;
  } catch (err) {
    if (uid) {
      const current = memoryTaskCache.get(uid) || [];
      memoryTaskCache.set(uid, [task, ...current]);
    }
    return task;
  }
}

export async function updateUserTask(
  taskId: string,
  updates: Partial<SampleTask>,
  uid?: string
): Promise<SampleTask> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch(`/api/user/tasks/${taskId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error(`Failed to update task: ${res.statusText}`);
    }
    const updated = await res.json();
    if (uid && memoryTaskCache.has(uid)) {
      const current = memoryTaskCache.get(uid)!;
      memoryTaskCache.set(
        uid,
        current.map((t) => (t.id === taskId ? { ...t, ...updated } : t))
      );
    }
    return updated;
  } catch (err) {
    if (uid && memoryTaskCache.has(uid)) {
      const current = memoryTaskCache.get(uid)!;
      memoryTaskCache.set(
        uid,
        current.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    }
    return updates as SampleTask;
  }
}

export async function deleteUserTask(taskId: string, uid?: string): Promise<void> {
  try {
    const headers = await getAuthHeaders(uid);
    const res = await fetch(`/api/user/tasks/${taskId}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete task: ${res.statusText}`);
    }
  } catch (err) {
    // offline / test
  }
  if (uid && memoryTaskCache.has(uid)) {
    const current = memoryTaskCache.get(uid)!;
    memoryTaskCache.set(
      uid,
      current.filter((t) => t.id !== taskId)
    );
  }
}
