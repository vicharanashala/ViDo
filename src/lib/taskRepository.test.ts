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
