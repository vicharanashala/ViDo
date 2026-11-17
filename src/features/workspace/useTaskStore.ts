import { useCallback, useEffect, useState } from 'react';
import type { NewTaskInput, Task } from '../../data/taskTypes';
import { createSeedTasks, createTaskFromInput } from '../../data/sampleTasks';
import { clearStoredTasks, loadTasks, saveTasks } from '../../lib/taskRepository';

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
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
      previous.map((task) => {
        if (task.id !== id) return task;
        if (progress >= 100) {
          return {
            ...task,
            progress: 100,
            state: 'completed',
            completedAt: task.completedAt ?? timestamp,
            updatedAt: timestamp,
          };
        }
        return {
          ...task,
          progress,
          state: 'active',
          completedAt: undefined,
          updatedAt: timestamp,
        };
      })
    );
  }, []);

  const toggleComplete = useCallback((id: string) => {
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== id) return task;
        if (task.state === 'completed') {
          return {
            ...task,
            state: 'active',
            progress: Math.min(task.progress, 99),
            completedAt: undefined,
            updatedAt: timestamp,
          };
        }
        return {
          ...task,
          state: 'completed',
          progress: 100,
          completedAt: timestamp,
          updatedAt: timestamp,
        };
      })
    );
  }, []);

  const addCheckpoint = useCallback((id: string, note: string, progress?: number) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    const timestamp = new Date().toISOString();
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id !== id) return task;
        const nextProgress = progress === undefined ? task.progress : clampProgress(progress);
        const checkpoint = {
          id: `checkpoint-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          createdAt: timestamp,
          note: trimmed,
          progress: nextProgress,
        };
        if (nextProgress >= 100) {
          return {
            ...task,
            progress: 100,
            state: 'completed',
            completedAt: task.completedAt ?? timestamp,
            updatedAt: timestamp,
            checkpoints: [...task.checkpoints, checkpoint],
          };
        }
        return {
          ...task,
          progress: nextProgress,
          state: 'active',
          completedAt: undefined,
          updatedAt: timestamp,
          checkpoints: [...task.checkpoints, checkpoint],
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
    resetTasks,
  };
}

export type TaskStore = ReturnType<typeof useTaskStore>;
