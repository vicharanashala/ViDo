import type { Task, TaskPace, PaceStatus } from './taskTypes';
import { PACE_EFFICIENCY_LABELS } from './taskTypes';

const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function atTime(date: Date, time = '23:59'): Date {
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    Number.isFinite(hours) ? hours : 23,
    Number.isFinite(minutes) ? minutes : 59
  );
}

export function toIso(date: Date, time = '09:00'): string {
  return atTime(date, time).toISOString();
}

export function dueAt(task: Pick<Task, 'dueDate' | 'dueTime'>): Date {
  return atTime(parseDateKey(task.dueDate), task.dueTime || '23:59');
}

export function isOverdue(task: Pick<Task, 'dueDate' | 'dueTime' | 'state'>, now = new Date()): boolean {
  return task.state === 'active' && dueAt(task).getTime() < now.getTime();
}

export function isDueToday(task: Pick<Task, 'dueDate'>, now = new Date()): boolean {
  return task.dueDate === toDateKey(now);
}

export function completionTiming(task: Pick<Task, 'completedAt' | 'dueDate' | 'dueTime'>): 'on-time' | 'late' | null {
  if (!task.completedAt) return null;
  return new Date(task.completedAt).getTime() <= dueAt(task).getTime() ? 'on-time' : 'late';
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeDayLabel(dateKey: string, now = new Date()): string {
  const today = toDateKey(now);
  const tomorrow = toDateKey(addDays(now, 1));
  const yesterday = toDateKey(addDays(now, -1));
  if (dateKey === today) return 'Today';
  if (dateKey === tomorrow) return 'Tomorrow';
  if (dateKey === yesterday) return 'Yesterday';
  return formatDateShort(parseDateKey(dateKey));
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

export function getTaskPace(task: Task, now = new Date()): TaskPace {
  const actual = clamp(task.progress);

  if (task.state === 'completed') {
    return { expected: 100, actual: 100, delta: 0, status: 'done', label: PACE_EFFICIENCY_LABELS.done };
  }

  const created = new Date(task.createdAt).getTime();
  const due = dueAt(task).getTime();
  const current = now.getTime();
  const total = due - created;

  if (!Number.isFinite(total) || total <= 0) {
    const delta = actual - 100;
    const status: PaceStatus = actual >= 100 ? 'done' : 'behind';
    return {
      expected: 100,
      actual,
      delta,
      status,
      label: PACE_EFFICIENCY_LABELS[status],
    };
  }

  const expected = clamp(Math.round(((current - created) / total) * 100));
  const delta = actual - expected;

  let status: PaceStatus;
  if (current > due) {
    status = 'behind';
  } else if (delta >= 15) {
    status = 'ahead';
  } else if (delta >= -10) {
    status = 'on-track';
  } else if (delta >= -25) {
    status = 'at-risk';
  } else {
    status = 'behind';
  }

  return { expected, actual, delta, status, label: PACE_EFFICIENCY_LABELS[status] };
}

export function paceTone(status: PaceStatus): 'accent' | 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'done' || status === 'ahead') return 'success';
  if (status === 'on-track') return 'accent';
  if (status === 'at-risk') return 'warning';
  if (status === 'behind') return 'danger';
  return 'neutral';
}
