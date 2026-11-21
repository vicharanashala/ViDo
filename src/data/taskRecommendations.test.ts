import { describe, it, expect } from 'vitest';
import { rankNextTasks, getNextBestTask, getWorkloadInsight, parseDeadline } from './taskRecommendations';
import { SampleTask } from './sampleTasks';

const now = new Date(2026, 10, 19, 18, 0, 30);

function task(overrides: Partial<SampleTask> & Pick<SampleTask, 'id' | 'title'>): SampleTask {
  return {
    dueDate: '2026-11-20',
    state: 'active',
    category: 'work',
    createdAt: '2026-11-19T10:00:00Z',
    ...overrides,
  };
}

describe('taskRecommendations', () => {
  it('ranks the worked example', () => {
    const tasks: SampleTask[] = [
      task({ id: 't1', title: 'Report', priority: 'high', dueDate: '2026-11-15', dueTime: '17:00' }),
      task({ id: 't8', title: 'Standup', priority: 'high', dueDate: '2026-11-19', dueTime: '09:00' }),
      task({ id: 't9', title: 'Cleanup', priority: 'low', dueDate: '2026-11-18', dueTime: '12:00' }),
      task({ id: 't10', title: 'Release', priority: 'high', dueDate: '2026-11-19', dueTime: '19:00' }),
      task({ id: 't3', title: 'Review', priority: 'medium', dueDate: '2026-11-19', dueTime: '18:30' }),
      task({ id: 't2', title: 'Prep', priority: 'high', dueDate: '2026-11-20', dueTime: '10:00' }),
      task({ id: 't4', title: 'Garden', priority: 'low', dueDate: '2026-11-25', dueTime: '12:00' }),
      task({ id: 't5', title: 'Done', priority: 'high', dueDate: '2026-11-20', dueTime: '10:00', state: 'completed' }),
    ];

    const ranked = rankNextTasks(tasks, now, 10);
    expect(ranked.map((item) => item.task.id)).toEqual(['t1', 't8', 't9', 't10', 't3', 't2', 't4']);
  });

  it('applies due-today bonus only when not overdue', () => {
    const overdueToday = task({ id: 'a', title: 'A', priority: 'high', dueDate: '2026-11-19', dueTime: '09:00' });
    const ranked = rankNextTasks([overdueToday], now, 1);
    expect(ranked[0].components.dueTodayBonus).toBe(0);
    expect(ranked[0].components.overdueBonus).toBeGreaterThan(0);
  });

  it('defines overdue days with floor of hours/24', () => {
    const justUnder = task({ id: 'a', title: 'A', priority: 'low', dueDate: '2026-11-19', dueTime: '17:01' });
    const justOver = task({ id: 'b', title: 'B', priority: 'low', dueDate: '2026-11-18', dueTime: '18:00' });

    const underRanked = rankNextTasks([justUnder], now, 1)[0];
    const overRanked = rankNextTasks([justOver], now, 1)[0];

    expect(underRanked.components.overdueBonus).toBe(40);
    expect(overRanked.components.overdueBonus).toBe(45);
  });

  it('excludes completed and archived tasks', () => {
    const tasks: SampleTask[] = [
      task({ id: 'a', title: 'A', state: 'completed', dueDate: '2026-11-15', dueTime: '10:00' }),
      task({ id: 'b', title: 'B', isArchived: true, dueDate: '2026-11-15', dueTime: '10:00' }),
      task({ id: 'c', title: 'C', priority: 'low', dueDate: '2026-11-25', dueTime: '10:00' }),
    ];
    expect(rankNextTasks(tasks, now, 10).map((item) => item.task.id)).toEqual(['c']);
  });

  it('handles malformed dates without throwing', () => {
    const tasks: SampleTask[] = [
      task({ id: 'a', title: 'A', priority: 'high', dueDate: '2026-02-31', dueTime: '10:00' }),
      task({ id: 'b', title: 'B', priority: 'medium', dueDate: '2026-11-20', dueTime: '10:00' }),
    ];

    expect(() => rankNextTasks(tasks, now, 10)).not.toThrow();
    const ranked = rankNextTasks(tasks, now, 10);
    expect(ranked.map((item) => item.task.id)).toEqual(['b', 'a']);
  });

  it('uses fixed explanation templates and omits priority for none', () => {
    const overdue = task({ id: 'a', title: 'A', priority: undefined, dueDate: '2026-11-15', dueTime: '10:00' });
    const ranked = rankNextTasks([overdue], now, 1);
    expect(ranked[0].reason).not.toMatch(/priority/i);
    expect(ranked[0].reason.toLowerCase()).toContain('overdue');
  });

  it('does not mutate tasks', () => {
    const original = task({ id: 'a', title: 'A', priority: 'high', dueDate: '2026-11-15', dueTime: '10:00' });
    const snapshot = JSON.stringify(original);
    rankNextTasks([original], now, 1);
    expect(JSON.stringify(original)).toBe(snapshot);
  });

  it('returns only requested limit', () => {
    const tasks: SampleTask[] = [
      task({ id: 'a', title: 'A', priority: 'high', dueDate: '2026-11-20', dueTime: '10:00' }),
      task({ id: 'b', title: 'B', priority: 'medium', dueDate: '2026-11-21', dueTime: '10:00' }),
      task({ id: 'c', title: 'C', priority: 'low', dueDate: '2026-11-22', dueTime: '10:00' }),
      task({ id: 'd', title: 'D', priority: 'low', dueDate: '2026-11-23', dueTime: '10:00' }),
    ];
    expect(rankNextTasks(tasks, now, 2)).toHaveLength(2);
  });

  it('returns null from getNextBestTask when no eligible tasks', () => {
    expect(getNextBestTask([], now)).toBeNull();
  });

  it('computes workload insight counts', () => {
    const tasks: SampleTask[] = [
      task({ id: 'a', title: 'A', priority: 'high', dueDate: '2026-11-15', dueTime: '10:00' }),
      task({ id: 'b', title: 'B', priority: 'high', dueDate: '2026-11-19', dueTime: '19:00' }),
      task({ id: 'c', title: 'C', priority: 'medium', dueDate: '2026-11-21', dueTime: '10:00' }),
      task({ id: 'd', title: 'D', priority: 'low', dueDate: '2026-11-22', dueTime: '10:00', state: 'completed' }),
    ];
    expect(getWorkloadInsight(tasks, now)).toEqual({
      overdueCount: 1,
      dueTodayCount: 1,
      highPriorityDueSoonCount: 1,
      pendingCount: 3,
    });
  });

  it('parses dates by round-tripping parts', () => {
    expect(parseDeadline('2026-02-31', '10:00')).toBeNull();
    expect(parseDeadline('2026-11-19', '24:00')).toBeNull();
    expect(parseDeadline('2026-11-19', '10:00')).not.toBeNull();
  });

  it('handles DST boundary for overdue days', () => {
    // Construct a deadline 23 hours before now in a way that crosses a local DST boundary.
    const dstNow = new Date(2026, 2, 8, 3, 0, 0);
    const deadline = new Date(2026, 2, 7, 4, 0, 0);
    const ranked = rankNextTasks([task({ id: 'a', title: 'A', priority: 'low', dueDate: '2026-03-07', dueTime: '04:00' })], dstNow, 1);
    // 23 hours is still zero full overdue days.
    expect(ranked[0].components.overdueBonus).toBe(40);
    expect(deadline.getTime()).toBeLessThan(dstNow.getTime());
  });
});
