import { beforeEach, describe, expect, it } from 'vitest';
import { clearStoredTasks, loadTasks, saveTasks } from './taskRepository';
import { createTaskFromInput } from '../data/sampleTasks';
import { toDateKey } from '../data/taskDates';

describe('taskRepository', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('seeds a first-run workspace when nothing is stored', () => {
    const tasks = loadTasks(new Date(2026, 10, 17, 12));
    expect(tasks).toHaveLength(22);
    expect(tasks.some((task) => task.dueDate === toDateKey(new Date(2026, 10, 17)))).toBe(true);
  });

  it('persists and reloads tasks', () => {
    const task = createTaskFromInput({
      title: 'Persist me',
      dueDate: '2026-11-17',
      category: 'personal',
      priority: 'medium',
    });

    saveTasks([task]);
    const loaded = loadTasks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Persist me');
    expect(loaded[0].progress).toBe(0);
    expect(loaded[0].checkpoints).toEqual([]);
  });

  it('repairs a “by date” title into a deadline on load', () => {
    saveTasks([
      {
        id: 'legacy-deadline',
        title: 'Project submission by 14th December 2026',
        dueDate: '2026-11-18',
        category: 'work',
        state: 'active',
        progress: 0,
        createdAt: '2026-11-18T10:00:00.000Z',
        updatedAt: '2026-11-18T10:00:00.000Z',
        checkpoints: [],
      } as never,
    ]);

    const [task] = loadTasks();
    expect(task.title).toBe('Project submission');
    expect(task.deadlineDate).toBe('2026-12-14');
  });

  it('repairs an “on date” target on load', () => {
    saveTasks([
      {
        id: 'legacy-on-date',
        title: 'Go out for a walk on 1st December 2026',
        dueDate: '2026-11-18',
        category: 'personal',
        state: 'active',
        progress: 0,
        createdAt: '2026-11-18T10:00:00.000Z',
        updatedAt: '2026-11-18T10:00:00.000Z',
        checkpoints: [],
      } as never,
    ]);

    const [task] = loadTasks(new Date(2026, 10, 18, 12));
    expect(task.title).toBe('Go out for a walk');
    expect(task.dueDate).toBe('2026-12-01');
  });

  it('keeps an intentionally empty workspace empty', () => {
    saveTasks([]);
    expect(loadTasks()).toEqual([]);
  });

  it('clears stored tasks', () => {
    saveTasks([]);
    clearStoredTasks();
    expect(loadTasks(new Date(2026, 10, 17, 12))).toHaveLength(22);
  });
});
