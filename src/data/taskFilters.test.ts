import { describe, it, expect } from 'vitest';
import { SampleTask } from './sampleTasks';
import { TASK_FIXTURES } from './testTaskFixtures';
import {
  getFilteredTasks,
  getHomeDashboardTasks,
  buildHomeDashboard,
  HOME_LIMITS,
} from './taskFilters';

describe('taskFilters', () => {
  it('correctly categorizes tasks based on the benchmark date', () => {
    const views = getFilteredTasks(TASK_FIXTURES);

    expect(views.today.length).toBe(6);
    expect(views.needsAttention.length).toBe(4);
    expect(views.upcoming.length).toBe(5);
    expect(views.recentlyCompleted.length).toBe(4);
    expect(views.completed.length).toBe(5); // 4 recent + 1 older
    expect(views.archived.length).toBe(2);

    // Verify all today tasks have the benchmark date
    views.today.forEach((t) => {
      expect(t.dueDate).toBe('2026-11-17');
      expect(t.state).toBe('active');
    });

    // Verify all needs attention tasks are overdue relative to benchmark date
    views.needsAttention.forEach((t) => {
      expect(t.dueDate < '2026-11-17').toBe(true);
      expect(t.state).toBe('active');
    });

    // Verify upcoming tasks are strictly in the future
    views.upcoming.forEach((t) => {
      expect(t.dueDate > '2026-11-17').toBe(true);
      expect(t.state).toBe('active');
    });
  });

  it('enforces Home dashboard section limits with total counts', () => {
    const home = getHomeDashboardTasks(TASK_FIXTURES);

    // Today section: limited to 5, total is 6
    expect(home.today.items.length).toBe(HOME_LIMITS.today);
    expect(home.today.totalCount).toBe(6);

    // Needs attention: limited to 3, total is 4
    expect(home.needsAttention.items.length).toBe(HOME_LIMITS.needsAttention);
    expect(home.needsAttention.totalCount).toBe(4);

    // Upcoming: limited to 3, total is 5
    expect(home.upcoming.items.length).toBe(HOME_LIMITS.upcoming);
    expect(home.upcoming.totalCount).toBe(5);

    // Recently completed: limited to 3, total is 4
    expect(home.recentlyCompleted.items.length).toBe(HOME_LIMITS.recentlyCompleted);
    expect(home.recentlyCompleted.totalCount).toBe(4);
  });

  it('omits recently completed when empty', () => {
    // Pass empty tasks
    const home = getHomeDashboardTasks([]);
    expect(home.recentlyCompleted.items.length).toBe(0);
    expect(home.recentlyCompleted.totalCount).toBe(0);
  });

  it('correctly categorizes tasks created for current today into today and not upcoming', () => {
    const todayTask: SampleTask = {
      id: 'task-real-today-1',
      title: 'Current Date Real Task',
      dueDate: '2026-11-22',
      state: 'active',
      category: 'work',
      createdAt: '2026-11-22T08:00:00Z',
    };

    const futureTask: SampleTask = {
      id: 'task-real-future-1',
      title: 'Future Task Later',
      dueDate: '2026-11-28',
      state: 'active',
      category: 'personal',
      createdAt: '2026-11-22T08:00:00Z',
    };

    const all = [todayTask, futureTask, ...TASK_FIXTURES];
    const views = getFilteredTasks(all, '2026-11-17', '2026-11-17T09:00:00Z', '2026-11-22');

    // Today task should be in today, NOT upcoming
    expect(views.today.some((t) => t.id === 'task-real-today-1')).toBe(true);
    expect(views.upcoming.some((t) => t.id === 'task-real-today-1')).toBe(false);

    // Future task should be in upcoming, NOT today
    expect(views.upcoming.some((t) => t.id === 'task-real-future-1')).toBe(true);
    expect(views.today.some((t) => t.id === 'task-real-future-1')).toBe(false);

    // Dashboard sections accurately reflect views
    const home = buildHomeDashboard(views);
    expect(home.today.items.some((t) => t.id === 'task-real-today-1')).toBe(true);
    expect(home.upcoming.items.some((t) => t.id === 'task-real-today-1')).toBe(false);
    expect(home.upcoming.items.some((t) => t.id === 'task-real-future-1')).toBe(true);
  });
});

