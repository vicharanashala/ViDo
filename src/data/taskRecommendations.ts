import { SampleTask, TaskPriority } from './sampleTasks';
import { toDateStr } from './taskDeadline';

export type RecommendationPriority = TaskPriority | undefined;

export interface RankedTask {
  task: SampleTask;
  score: number;
  components: {
    priorityWeight: number;
    overdueBonus: number;
    dueTodayBonus: number;
    proximityBonus: number;
  };
  reason: string;
  deadlineAt: Date | null;
}

export interface RankNextTasksOptions {
  limit?: number;
}

const PRIORITY_WEIGHT: Record<string, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

function priorityWeight(priority?: TaskPriority): number {
  return PRIORITY_WEIGHT[priority ?? ''] ?? 5;
}

function priorityLabel(priority?: TaskPriority): string {
  return priority ? `${priority.charAt(0).toUpperCase()}${priority.slice(1)} priority` : '';
}

/**
 * Parse a YYYY-MM-DD date (and optional HH:mm time) without throwing.
 * Invalid or rolled-over calendar dates return null.
 */
export function parseDeadline(dueDate: string, dueTime?: string): Date | null {
  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return null;
  }

  const [yearText, monthText, dayText] = dueDate.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  if (dueTime !== undefined && dueTime !== '') {
    if (!/^\d{2}:\d{2}$/.test(dueTime)) {
      return null;
    }
    const [hourText, minuteText] = dueTime.split(':');
    const hour = Number(hourText);
    const minute = Number(minuteText);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }
    date.setHours(hour, minute, 0, 0);
  } else {
    date.setHours(23, 59, 0, 0);
  }

  return date;
}

function calendarDaysBetween(from: Date, to: Date): number {
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toMidnight.getTime() - fromMidnight.getTime()) / 86400000);
}

function reasonFor(task: SampleTask, deadlineAt: Date | null, now: Date, overdue: boolean, overdueDays: number): string {
  const priorityPrefix = priorityLabel(task.priority);
  const withPriority = (message: string) =>
    priorityPrefix ? `${priorityPrefix} and ${message}` : message.charAt(0).toUpperCase() + message.slice(1);

  if (!deadlineAt) {
    return priorityPrefix ? `${priorityPrefix}; no valid deadline.` : 'No valid deadline.';
  }

  if (overdue) {
    const dayText = overdueDays === 1 ? '1 day' : `${overdueDays} days`;
    return overdueDays > 0
      ? withPriority(`overdue by ${dayText}.`)
      : withPriority('overdue.');
  }

  const today = toDateStr(now);
  if (task.dueDate === today) {
    return withPriority('due today.');
  }

  const daysUntil = calendarDaysBetween(now, deadlineAt);
  if (daysUntil >= 1 && daysUntil <= 2) {
    return withPriority(`due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`);
  }
  if (daysUntil >= 3 && daysUntil <= 7) {
    return withPriority(`due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}.`);
  }
  return withPriority('no urgent deadline.');
}

export function rankNextTasks(
  tasks: SampleTask[],
  now: Date,
  limit = 3
): RankedTask[] {
  const today = toDateStr(now);

  const ranked = tasks
    .filter((task) => task.state === 'active' && !task.isArchived)
    .map((task) => {
      const deadlineAt = parseDeadline(task.dueDate, task.dueTime);
      const overdue = deadlineAt !== null && deadlineAt.getTime() < now.getTime();
      const overdueDays = overdue && deadlineAt
        ? Math.floor((now.getTime() - deadlineAt.getTime()) / 86400000)
        : 0;

      const priority = priorityWeight(task.priority);
      const overdueBonus = overdue ? 40 + Math.min(20, overdueDays * 5) : 0;
      const dueTodayBonus =
        !overdue && task.dueDate === today ? 25 : 0;

      let proximityBonus = 0;
      if (deadlineAt && !overdue) {
        const daysUntil = calendarDaysBetween(now, deadlineAt);
        if (daysUntil >= 1 && daysUntil <= 2) proximityBonus = 15;
        else if (daysUntil >= 3 && daysUntil <= 7) proximityBonus = 8;
      }

      const score = priority + overdueBonus + dueTodayBonus + proximityBonus;

      return {
        task,
        score,
        components: {
          priorityWeight: priority,
          overdueBonus,
          dueTodayBonus,
          proximityBonus,
        },
        reason: reasonFor(task, deadlineAt, now, overdue, overdueDays),
        deadlineAt,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const aTime = a.deadlineAt ? a.deadlineAt.getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.deadlineAt ? b.deadlineAt.getTime() : Number.POSITIVE_INFINITY;
      if (aTime !== bTime) return aTime - bTime;

      const priorityDiff = priorityWeight(b.task.priority) - priorityWeight(a.task.priority);
      if (priorityDiff !== 0) return priorityDiff;

      const titleDiff = a.task.title.localeCompare(b.task.title);
      if (titleDiff !== 0) return titleDiff;

      return a.task.id.localeCompare(b.task.id);
    });

  return ranked.slice(0, Math.max(0, limit));
}

export function getNextBestTasks(tasks: SampleTask[], now: Date, limit = 3): RankedTask[] {
  return rankNextTasks(tasks, now, limit);
}

export function getNextBestTask(tasks: SampleTask[], now: Date): SampleTask | null {
  return rankNextTasks(tasks, now, 1)[0]?.task ?? null;
}

export function getWorkloadInsight(tasks: SampleTask[], now: Date) {
  const activeTasks = tasks.filter((task) => task.state === 'active' && !task.isArchived);
  const today = toDateStr(now);

  const overdueCount = activeTasks.filter((task) => {
    const deadlineAt = parseDeadline(task.dueDate, task.dueTime);
    return deadlineAt !== null && deadlineAt.getTime() < now.getTime();
  }).length;

  const dueTodayCount = activeTasks.filter((task) => task.dueDate === today).length;

  const highPriorityDueSoonCount = activeTasks.filter((task) => {
    if (task.priority !== 'high') return false;
    const deadlineAt = parseDeadline(task.dueDate, task.dueTime);
    if (!deadlineAt) return false;
    const daysUntil = calendarDaysBetween(now, deadlineAt);
    return daysUntil >= 0 && daysUntil <= 7 && deadlineAt.getTime() >= now.getTime();
  }).length;

  return {
    overdueCount,
    dueTodayCount,
    highPriorityDueSoonCount,
    pendingCount: activeTasks.length,
  };
}
