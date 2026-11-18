import type { Task } from '../data/taskTypes';
import { createSeedTasks } from '../data/sampleTasks';
import { parseQuickAdd } from '../data/quickAddParser';

export const TASK_STORAGE_KEY = 'vido.tasks.v1';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeTask(raw: Partial<Task>, reference: Date = new Date()): Task | null {
  if (!raw || typeof raw.id !== 'string' || typeof raw.title !== 'string') return null;
  if (typeof raw.dueDate !== 'string') return null;

  const now = new Date().toISOString();
  const progress = Math.min(100, Math.max(0, Number(raw.progress) || 0));
  const state = raw.state === 'completed' || raw.completedAt ? 'completed' : 'active';
  const repaired = parseQuickAdd(raw.title, reference);
  const repairedDeadline = raw.deadlineDate ? undefined : repaired.deadlineDate;
  const repairedDueDate = repaired.meta.dateKind === 'planned' ? repaired.dueDate : undefined;

  return {
    id: raw.id,
    title: repairedDeadline || repairedDueDate ? repaired.title : raw.title,
    description: raw.description,
    customImageKey: typeof raw.customImageKey === 'string' ? raw.customImageKey : undefined,
    deadlineDate:
      typeof raw.deadlineDate === 'string' ? raw.deadlineDate : repairedDeadline,
    recurrence:
      raw.recurrence === 'daily' || raw.recurrence === 'weekdays' || raw.recurrence === 'weekly'
        ? raw.recurrence
        : undefined,
    dueDate: repairedDueDate ?? raw.dueDate,
    dueTime: raw.dueTime,
    reminderAt: typeof raw.reminderAt === 'string' ? raw.reminderAt : undefined,
    reminderSentAt: typeof raw.reminderSentAt === 'string' ? raw.reminderSentAt : undefined,
    sharedWith: Array.isArray(raw.sharedWith) ? raw.sharedWith : [],
    sharedBy: typeof raw.sharedBy === 'string' ? raw.sharedBy : undefined,
    ownerId: typeof raw.ownerId === 'string' ? raw.ownerId : undefined,
    priority: raw.priority,
    category: raw.category ?? 'personal',
    state,
    progress: state === 'completed' ? 100 : Math.min(progress, 99),
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
    completedAt: raw.completedAt,
    archivedAt: raw.archivedAt,
    parkedAt: typeof raw.parkedAt === 'string' ? raw.parkedAt : undefined,
    checkpoints: Array.isArray(raw.checkpoints)
      ? raw.checkpoints.map((checkpoint, index) => ({
          id: checkpoint.id ?? `checkpoint-${index}`,
          createdAt: checkpoint.createdAt ?? now,
          note: checkpoint.note ?? '',
          progress: Math.min(100, Math.max(0, Number(checkpoint.progress) || 0)),
        }))
      : [],
    subtasks: Array.isArray(raw.subtasks)
      ? raw.subtasks
          .filter((subtask) => subtask && typeof subtask.title === 'string')
          .map((subtask, index) => ({
            id: subtask.id ?? `subtask-${index}`,
            title: subtask.title,
            done: Boolean(subtask.done),
            createdAt: subtask.createdAt ?? now,
          }))
      : [],
  };
}

export function loadTasks(reference: Date = new Date()): Task[] {
  const store = storage();
  if (!store) return createSeedTasks(reference);

  const raw = store.getItem(TASK_STORAGE_KEY);
  if (!raw) return createSeedTasks(reference);

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createSeedTasks(reference);
    const tasks = parsed
      .map((item) => normalizeTask(item as Partial<Task>, reference))
      .filter((task): task is Task => Boolean(task));
    return tasks;
  } catch {
    return createSeedTasks(reference);
  }
}

export function saveTasks(tasks: Task[]): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage can be full or blocked (private mode); the in-memory state still works.
  }
}

export function clearStoredTasks(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(TASK_STORAGE_KEY);
  } catch {
    // Ignore blocked storage.
  }
}
