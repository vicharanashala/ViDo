import { describe, it, expect } from 'vitest';
import { createSeedTasks } from './sampleTasks';
import {
  applyTaskFilters,
  EMPTY_TASK_FILTERS,
  getFilteredTasks,
  getHomeDashboardTasks,
  getTodayQueue,
  HOME_LIMITS,
  pickFocusTask,
} from './taskFilters';
import { addDays, getTaskPace, toDateKey } from './taskDates';
import type { Task } from './taskTypes';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const todayKey = toDateKey(reference);
const tasks = createSeedTasks(reference);

describe('taskFilters', () => {
  it('categorizes tasks from the real reference date', () => {
    const views = getFilteredTasks(tasks, reference);

    expect(views.today.length).toBe(6);
    expect(views.needsAttention.length).toBe(4);
    expect(views.upcoming.length).toBe(5);
    expect(views.recentlyCompleted.length).toBe(4);
    expect(views.completed.length).toBe(5);
    expect(views.archived.length).toBe(2);

    views.today.forEach((task) => {
      expect(task.dueDate).toBe(todayKey);
      expect(task.state).toBe('active');
    });

    views.needsAttention.forEach((task) => {
      expect(task.dueDate < todayKey).toBe(true);
      expect(task.state).toBe('active');
    });

    views.upcoming.forEach((task) => {
      expect(task.dueDate > todayKey).toBe(true);
      expect(task.state).toBe('active');
    });
  });

  it('enforces Home dashboard limits with total counts', () => {
    const home = getHomeDashboardTasks(tasks, reference);

    expect(home.today.items.length).toBe(HOME_LIMITS.today);
    expect(home.today.totalCount).toBe(6);
    expect(home.needsAttention.items.length).toBe(HOME_LIMITS.needsAttention);
    expect(home.needsAttention.totalCount).toBe(4);
    expect(home.upcoming.items.length).toBe(HOME_LIMITS.upcoming);
    expect(home.upcoming.totalCount).toBe(5);
    expect(home.recentlyCompleted.items.length).toBe(HOME_LIMITS.recentlyCompleted);
    expect(home.recentlyCompleted.totalCount).toBe(4);
  });

  it('returns empty recently completed sections for no tasks', () => {
    const home = getHomeDashboardTasks([], reference);
    expect(home.recentlyCompleted.items.length).toBe(0);
    expect(home.recentlyCompleted.totalCount).toBe(0);
  });

  it('searches title and description', () => {
    const results = applyTaskFilters(tasks, { ...EMPTY_TASK_FILTERS, query: 'budget' }, reference);
    expect(results).toHaveLength(1);
    expect(results[0].title).toMatch(/budget/i);
  });

  it('filters by priority, deadline, and category together', () => {
    const high = applyTaskFilters(tasks, { ...EMPTY_TASK_FILTERS, priority: 'high' }, reference);
    expect(high.every((task) => task.priority === 'high')).toBe(true);

    const today = applyTaskFilters(tasks, { ...EMPTY_TASK_FILTERS, deadline: 'today' }, reference);
    expect(today.every((task) => task.dueDate === todayKey && task.state === 'active')).toBe(true);

    const home = applyTaskFilters(
      tasks,
      { ...EMPTY_TASK_FILTERS, category: 'home', deadline: 'today' },
      reference
    );
    expect(home.every((task) => task.category === 'home' && task.dueDate === todayKey)).toBe(true);
  });

  it('returns no results for a query that does not match', () => {
    const results = applyTaskFilters(tasks, { ...EMPTY_TASK_FILTERS, query: 'zzzz-no-match' }, reference);
    expect(results).toHaveLength(0);
  });

  it('picks the highest-priority overdue task as the focus', () => {
    const focus = pickFocusTask(tasks, reference);
    expect(focus).not.toBeNull();
    expect(focus?.priority).toBe('high');
    expect(focus!.dueDate < todayKey).toBe(true);
  });

  it('builds an ordered Today queue with priority feedback', () => {
    const queue = getTodayQueue(tasks, reference);

    expect(queue.overdue).toHaveLength(4);
    expect(queue.today).toHaveLength(6);
    expect(queue.all).toHaveLength(10);

    expect(queue.overdue.map((task) => task.priority)).toEqual([
      'high',
      'high',
      'medium',
      'low',
    ]);
    expect(queue.overdue[0].title).toMatch(/property insurance/i);
    expect(queue.today.map((task) => task.dueTime)).toEqual([
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
    ]);

    expect(queue.highOverdue).toBe(2);
    expect(queue.highToday).toBe(2);
  });
});

describe('pace vs deadline', () => {
  it('marks an unfinished task with low progress as behind', () => {
    const base = tasks.find((task) => task.priority === 'high') as Task;
    const task: Task = {
      ...base,
      id: 'pace-behind',
      state: 'active',
      progress: 10,
      createdAt: addDays(reference, -10).toISOString(),
      dueDate: todayKey,
      dueTime: '23:59',
    };

    const pace = getTaskPace(task, reference);
    expect(pace.expected).toBeGreaterThan(50);
    expect(pace.status).toBe('behind');
  });

  it('marks a completed task as delivered', () => {
    const completed = tasks.find((task) => task.state === 'completed') as Task;
    expect(getTaskPace(completed, reference).status).toBe('done');
  });
});
