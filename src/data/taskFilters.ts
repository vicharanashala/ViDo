import type { Task, TaskCategory, TaskPriority } from './taskTypes';
import { addDays, dueAt, toDateKey } from './taskDates';

export interface ViewFilteredTasks {
  today: Task[];
  needsAttention: Task[];
  upcoming: Task[];
  completed: Task[];
  recentlyCompleted: Task[];
  archived: Task[];
}

export interface HomeDashboardTasks {
  today: { items: Task[]; totalCount: number; limit: number };
  needsAttention: { items: Task[]; totalCount: number; limit: number };
  upcoming: { items: Task[]; totalCount: number; limit: number };
  recentlyCompleted: { items: Task[]; totalCount: number; limit: number };
}

export type DeadlineFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export interface TaskFilterState {
  query: string;
  priority: 'all' | TaskPriority;
  category: 'all' | TaskCategory;
  deadline: DeadlineFilter;
}

export const EMPTY_TASK_FILTERS: TaskFilterState = {
  query: '',
  priority: 'all',
  category: 'all',
  deadline: 'all',
};

export const HOME_LIMITS = {
  today: 5,
  needsAttention: 3,
  upcoming: 3,
  recentlyCompleted: 3,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function byDueTime(a: Task, b: Task): number {
  return dueAt(a).getTime() - dueAt(b).getTime();
}

function byDateAsc(a: Task, b: Task): number {
  return a.dueDate === b.dueDate ? byDueTime(a, b) : a.dueDate.localeCompare(b.dueDate);
}

function byCompletedDesc(a: Task, b: Task): number {
  return (b.completedAt ?? '').localeCompare(a.completedAt ?? '');
}

function byArchivedDesc(a: Task, b: Task): number {
  return (b.archivedAt ?? '').localeCompare(a.archivedAt ?? '');
}

export function isArchived(task: Task): boolean {
  return Boolean(task.archivedAt);
}

export function applyTaskFilters(
  tasks: Task[],
  filters: TaskFilterState,
  reference: Date = new Date()
): Task[] {
  const todayKey = toDateKey(reference);
  const query = filters.query.trim().toLowerCase();

  return tasks.filter((task) => {
    if (query) {
      const haystack = `${task.title} ${task.description ?? ''} ${task.category} ${task.priority ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;

    switch (filters.deadline) {
      case 'today':
        return task.state === 'active' && task.dueDate === todayKey;
      case 'upcoming':
        return task.state === 'active' && task.dueDate > todayKey;
      case 'overdue':
        return task.state === 'active' && task.dueDate < todayKey;
      case 'completed':
        return task.state === 'completed' && !isArchived(task);
      default:
        return true;
    }
  });
}

export function getFilteredTasks(
  tasks: Task[],
  reference: Date = new Date()
): ViewFilteredTasks {
  const todayKey = toDateKey(reference);
  const referenceTime = reference.getTime();
  const sevenDaysAgo = referenceTime - 7 * DAY_MS;

  const archived = tasks.filter(isArchived).sort(byArchivedDesc);
  const nonArchived = tasks.filter((task) => !isArchived(task));
  const active = nonArchived.filter((task) => task.state === 'active');
  const completed = nonArchived.filter((task) => task.state === 'completed').sort(byCompletedDesc);

  const today = active.filter((task) => task.dueDate === todayKey).sort(byDueTime);
  const needsAttention = active.filter((task) => task.dueDate < todayKey).sort(byDateAsc);
  const upcoming = active.filter((task) => task.dueDate > todayKey).sort(byDateAsc);

  const recentlyCompleted = completed.filter((task) => {
    if (!task.completedAt) return false;
    const completedTime = new Date(task.completedAt).getTime();
    return completedTime >= sevenDaysAgo && completedTime <= referenceTime;
  });

  return {
    today,
    needsAttention,
    upcoming,
    completed,
    recentlyCompleted,
    archived,
  };
}

export function getHomeDashboardTasks(
  tasks: Task[],
  reference: Date = new Date()
): HomeDashboardTasks {
  const filtered = getFilteredTasks(tasks, reference);

  return {
    today: {
      items: filtered.today.slice(0, HOME_LIMITS.today),
      totalCount: filtered.today.length,
      limit: HOME_LIMITS.today,
    },
    needsAttention: {
      items: filtered.needsAttention.slice(0, HOME_LIMITS.needsAttention),
      totalCount: filtered.needsAttention.length,
      limit: HOME_LIMITS.needsAttention,
    },
    upcoming: {
      items: filtered.upcoming.slice(0, HOME_LIMITS.upcoming),
      totalCount: filtered.upcoming.length,
      limit: HOME_LIMITS.upcoming,
    },
    recentlyCompleted: {
      items: filtered.recentlyCompleted.slice(0, HOME_LIMITS.recentlyCompleted),
      totalCount: filtered.recentlyCompleted.length,
      limit: HOME_LIMITS.recentlyCompleted,
    },
  };
}

function focusScore(task: Task, todayKey: string): number {
  const overdue = task.dueDate < todayKey;
  const dueToday = task.dueDate === todayKey;
  const priority = task.priority ?? 'low';

  if (overdue) return priority === 'high' ? 100 : priority === 'medium' ? 80 : 60;
  if (dueToday) return priority === 'high' ? 70 : priority === 'medium' ? 50 : 40;
  return priority === 'high' ? 30 : priority === 'medium' ? 20 : 10;
}

export function pickFocusTask(tasks: Task[], reference: Date = new Date()): Task | null {
  const todayKey = toDateKey(reference);
  const candidates = tasks.filter((task) => task.state === 'active' && !isArchived(task));
  if (candidates.length === 0) return null;

  return candidates
    .slice()
    .sort((a, b) => {
      const score = focusScore(b, todayKey) - focusScore(a, todayKey);
      if (score !== 0) return score;
      const due = a.dueDate.localeCompare(b.dueDate);
      if (due !== 0) return due;
      return dueAt(a).getTime() - dueAt(b).getTime();
    })[0];
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function priorityRank(task: Task): number {
  return task.priority ? PRIORITY_ORDER[task.priority] : 0;
}

export interface TodayQueue {
  overdue: Task[];
  today: Task[];
  all: Task[];
  highOverdue: number;
  highToday: number;
}

export function getTodayQueue(tasks: Task[], reference: Date = new Date()): TodayQueue {
  const todayKey = toDateKey(reference);
  const queue = tasks.filter(
    (task) => task.state === 'active' && !isArchived(task) && task.dueDate <= todayKey
  );

  const overdue = queue
    .filter((task) => task.dueDate < todayKey)
    .sort((a, b) => {
      const priority = priorityRank(b) - priorityRank(a);
      if (priority !== 0) return priority;
      return dueAt(a).getTime() - dueAt(b).getTime();
    });

  const today = queue
    .filter((task) => task.dueDate === todayKey)
    .sort((a, b) => {
      const due = dueAt(a).getTime() - dueAt(b).getTime();
      if (due !== 0) return due;
      return priorityRank(b) - priorityRank(a);
    });

  return {
    overdue,
    today,
    all: [...overdue, ...today],
    highOverdue: overdue.filter((task) => task.priority === 'high').length,
    highToday: today.filter((task) => task.priority === 'high').length,
  };
}


export interface MomentumDay {
  date: string;
  label: string;
  weekday: string;
  count: number;
}

export function getWeeklyMomentum(tasks: Task[], reference: Date = new Date()): MomentumDay[] {
  const days: MomentumDay[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const date = addDays(reference, -i);
    const key = toDateKey(date);
    const count = tasks.filter(
      (task) => task.completedAt && toDateKey(new Date(task.completedAt)) === key
    ).length;
    days.push({
      date: key,
      label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
      count,
    });
  }
  return days;
}
