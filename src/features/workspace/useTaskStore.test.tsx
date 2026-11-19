import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTaskStore } from './useTaskStore';
import { addDays, toDateKey } from '../../data/taskDates';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const todayKey = toDateKey(reference);

describe('useTaskStore sharing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shares and unshares a task by email', () => {
    const { result } = renderHook(() => useTaskStore());
    let taskId = '';

    act(() => {
      taskId = result.current.addTask({ title: 'Shared task', dueDate: todayKey }).id;
      result.current.shareTask(taskId, 'friend@example.com', 'me@example.com');
    });

    let task = result.current.tasks.find((item) => item.id === taskId);
    expect(task?.sharedWith).toContain('friend@example.com');
    expect(task?.ownerId).toBe('me@example.com');

    act(() => {
      result.current.unshareTask(taskId, 'friend@example.com');
    });
    task = result.current.tasks.find((item) => item.id === taskId);
    expect(task?.sharedWith).not.toContain('friend@example.com');
  });
});

describe('useTaskStore subtasks', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('completes the task when every path step is done', () => {
    const { result } = renderHook(() => useTaskStore());
    let taskId = '';

    act(() => {
      taskId = result.current.addTask({ title: 'Project', dueDate: todayKey }).id;
      result.current.addSubtask(taskId, 'First step');
      result.current.addSubtask(taskId, 'Second step');
    });

    const steps = result.current.tasks.find((task) => task.id === taskId)?.subtasks ?? [];
    act(() => {
      result.current.toggleSubtask(taskId, steps[0].id);
      result.current.toggleSubtask(taskId, steps[1].id);
    });

    const task = result.current.tasks.find((item) => item.id === taskId);
    expect(task?.state).toBe('completed');
    expect(task?.progress).toBe(100);
    expect(task?.checkpoints.some((checkpoint) => /all path steps/i.test(checkpoint.note))).toBe(true);
  });

  it('adds, completes, and removes path steps', () => {
    const { result } = renderHook(() => useTaskStore());
    let taskId = '';

    act(() => {
      taskId = result.current.addTask({ title: 'Project', dueDate: todayKey }).id;
      result.current.addSubtask(taskId, 'Collect requirements');
    });

    const subtask = result.current.tasks.find((task) => task.id === taskId)?.subtasks?.[0];
    expect(subtask?.title).toBe('Collect requirements');

    act(() => {
      result.current.toggleSubtask(taskId, subtask!.id);
    });
    expect(
      result.current.tasks.find((task) => task.id === taskId)?.subtasks?.[0].done
    ).toBe(true);

    act(() => {
      result.current.deleteSubtask(taskId, subtask!.id);
    });
    expect(result.current.tasks.find((task) => task.id === taskId)?.subtasks).toEqual([]);
  });
});

describe('useTaskStore recurrence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('schedules the next occurrence when a recurring task is completed', () => {
    const { result } = renderHook(() => useTaskStore());
    let taskId = '';

    act(() => {
      taskId = result.current.addTask({
        title: 'Daily practice',
        dueDate: todayKey,
        deadlineDate: toDateKey(addDays(reference, 5)),
        recurrence: 'daily',
      }).id;
    });

    act(() => {
      result.current.toggleComplete(taskId);
    });

    const next = result.current.tasks.find(
      (task) => task.recurrence === 'daily' && task.state === 'active'
    );
    expect(next?.dueDate).toBe(toDateKey(addDays(reference, 1)));
    expect(next?.progress).toBe(0);
  });

  it('resets reminder and subtask state for the next occurrence', () => {
    const { result } = renderHook(() => useTaskStore());
    let taskId = '';

    act(() => {
      taskId = result.current.addTask({
        title: 'Daily practice',
        dueDate: todayKey,
        deadlineDate: toDateKey(addDays(reference, 5)),
        recurrence: 'daily',
        reminderAt: reference.toISOString(),
      }).id;
      result.current.addSubtask(taskId, 'Warm up');
    });

    const step = result.current.tasks.find((task) => task.id === taskId)?.subtasks?.[0];
    act(() => {
      result.current.toggleSubtask(taskId, step!.id);
    });

    const next = result.current.tasks.find(
      (task) => task.recurrence === 'daily' && task.state === 'active'
    );
    expect(next?.reminderAt).toBeUndefined();
    expect(next?.reminderSentAt).toBeUndefined();
    expect(next?.subtasks?.every((subtask) => !subtask.done)).toBe(true);
  });

  it('stops when the next occurrence would pass the deadline', () => {
    const { result } = renderHook(() => useTaskStore());
    let taskId = '';

    act(() => {
      taskId = result.current.addTask({
        title: 'Last daily practice',
        dueDate: todayKey,
        deadlineDate: todayKey,
        recurrence: 'daily',
      }).id;
    });

    act(() => {
      result.current.toggleComplete(taskId);
    });

    expect(
      result.current.tasks.filter((task) => task.recurrence === 'daily' && task.state === 'active')
    ).toHaveLength(0);
  });
});
