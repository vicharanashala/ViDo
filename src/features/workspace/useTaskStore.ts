import { useCallback, useEffect, useState } from 'react';
import type { NewTaskInput, Task } from '../../data/taskTypes';
import { createSeedTasks, createTaskFromInput } from '../../data/sampleTasks';
import { clearStoredTasks, loadTasks, saveTasks } from '../../lib/taskRepository';
import { nextRecurrenceDate } from '../../data/taskDates';

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function createNextOccurrence(task: Task, timestamp: string): Task | null {
  if (!task.recurrence || !task.deadlineDate) return null;

  const nextDate = nextRecurrenceDate(task.dueDate, task.recurrence);
  if (nextDate > task.deadlineDate) return null;

  return {
    ...task,
    id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    dueDate: nextDate,
    state: 'active',
    progress: 0,
    completedAt: undefined,
    archivedAt: undefined,
    parkedAt: undefined,
    reminderAt: undefined,
    reminderSentAt: undefined,
    subtasks: task.subtasks?.map((subtask) => ({ ...subtask, done: false })),
    createdAt: timestamp,
    updatedAt: timestamp,
    checkpoints: [],
  };
}

function completeTask(task: Task, timestamp: string): Task[] {
  const completed: Task = {
    ...task,
    state: 'completed',
    progress: 100,
    completedAt: task.completedAt ?? timestamp,
    updatedAt: timestamp,
  };
  const next = createNextOccurrence(task, timestamp);
  return next ? [completed, next] : [completed];
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((input: NewTaskInput) => {
    const task = createTaskFromInput(input);
    setTasks((previous) => [task, ...previous]);
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== id) return task;
        const next: Task = { ...task, ...patch, updatedAt: timestamp };
        if (patch.state === 'completed') {
          next.progress = 100;
          next.completedAt = patch.completedAt ?? task.completedAt ?? timestamp;
        }
        if (patch.state === 'active') {
          next.completedAt = undefined;
          next.progress = Math.min(clampProgress(next.progress), 99);
        }
        return next;
      })
    );
  }, []);

  const setProgress = useCallback((id: string, value: number) => {
    const progress = clampProgress(value);
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.flatMap((task) => {
        if (task.id !== id) return [task];
        if (progress >= 100) {
          return task.state === 'completed'
            ? [{ ...task, progress: 100, updatedAt: timestamp }]
            : completeTask({ ...task, progress }, timestamp);
        }
        return [
          {
            ...task,
            progress,
            state: 'active',
            completedAt: undefined,
            updatedAt: timestamp,
          },
        ];
      })
    );
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.flatMap((task) => {
        if (task.id !== id) return [task];
        if (task.state === 'completed') {
          return [
            {
              ...task,
              state: 'active',
              progress: Math.min(task.progress, 99),
              completedAt: undefined,
              updatedAt: timestamp,
            },
          ];
        }
        return completeTask(task, timestamp);
      })
    );
  }, []);

  const addCheckpoint = useCallback((id: string, note: string, progress?: number) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.flatMap((task) => {
        if (task.id !== id) return task;
        const nextProgress = progress === undefined ? task.progress : clampProgress(progress);
        const checkpoint = {
          id: `checkpoint-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: timestamp,
          note: trimmed,
          progress: nextProgress,
        };
        if (nextProgress >= 100) {
          return task.state === 'completed'
            ? [
                {
                  ...task,
                  progress: 100,
                  updatedAt: timestamp,
                  checkpoints: [...task.checkpoints, checkpoint],
                },
              ]
            : completeTask(
                {
                  ...task,
                  progress: nextProgress,
                  checkpoints: [...task.checkpoints, checkpoint],
                },
                timestamp
              );
        }
        return [
          {
            ...task,
            progress: nextProgress,
            state: 'active',
            completedAt: undefined,
            updatedAt: timestamp,
            checkpoints: [...task.checkpoints, checkpoint],
          },
        ];
      })
    );
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          updatedAt: timestamp,
          state: task.state === 'completed' ? 'active' : task.state,
          progress: task.state === 'completed' ? Math.min(task.progress, 99) : task.progress,
          completedAt: task.state === 'completed' ? undefined : task.completedAt,
          subtasks: [
            ...(task.subtasks ?? []),
            {
              id: `subtask-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              title: trimmed,
              done: false,
              createdAt: timestamp,
            },
          ],
        };
      })
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.flatMap((task) => {
        if (task.id !== taskId) return [task];
        const subtasks = (task.subtasks ?? []).map((subtask) =>
          subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
        );
        const allDone = subtasks.length > 0 && subtasks.every((subtask) => subtask.done);

        if (allDone && task.state !== 'completed') {
          const checkpoint = {
            id: `checkpoint-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            createdAt: timestamp,
            note: 'All path steps completed.',
            progress: 100,
          };
          return completeTask(
            {
              ...task,
              subtasks,
              checkpoints: [...task.checkpoints, checkpoint],
            },
            timestamp
          );
        }

        if (!allDone && task.state === 'completed') {
          return [
            {
              ...task,
              subtasks,
              state: 'active',
              progress: Math.min(task.progress, 99),
              completedAt: undefined,
              updatedAt: timestamp,
            },
          ];
        }

        return [{ ...task, subtasks, updatedAt: timestamp }];
      })
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          updatedAt: timestamp,
          subtasks: (task.subtasks ?? []).filter((subtask) => subtask.id !== subtaskId),
        };
      })
    );
  }, []);

  const shareTask = useCallback((taskId: string, identifier: string, sharedBy?: string) => {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return;
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== taskId) return task;
        const sharedWith = task.sharedWith ?? [];
        return {
          ...task,
          sharedWith: sharedWith.includes(clean) ? sharedWith : [...sharedWith, clean],
          sharedBy: sharedBy ?? task.sharedBy,
          ownerId: task.ownerId ?? sharedBy,
          updatedAt: timestamp,
        };
      })
    );
  }, []);

  const unshareTask = useCallback((taskId: string, identifier: string) => {
    const clean = identifier.trim().toLowerCase();
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          sharedWith: (task.sharedWith ?? []).filter((item) => item !== clean),
          updatedAt: timestamp,
        };
      })
    );
  }, []);

  const archiveTask = useCallback((id: string) => {
    updateTask(id, { archivedAt: new Date().toISOString() });
  }, [updateTask]);

  const restoreTask = useCallback((id: string) => {
    updateTask(id, { archivedAt: undefined });
  }, [updateTask]);

  const deleteTask = useCallback((id: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }, []);

  const resetTasks = useCallback(() => {
    clearStoredTasks();
    setTasks(createSeedTasks());
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    setProgress,
    toggleComplete,
    addCheckpoint,
    archiveTask,
    restoreTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    shareTask,
    unshareTask,
    resetTasks,
  };
}

export type TaskStore = ReturnType<typeof useTaskStore>;
