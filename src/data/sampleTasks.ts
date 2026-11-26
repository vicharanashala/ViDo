export type TaskPriority = 'high' | 'medium' | 'low';
export type StandardCategory = 'personal' | 'home' | 'work';
export type TaskCategory = StandardCategory | (string & {});
export type TaskState = 'active' | 'completed' | 'cancelled';

export interface TaskCheckpoint {
  id: string;
  timestamp: string;
  note: string;
}

export interface SampleTask {
  id: string;
  title: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD (optional, defaults to createdAt)
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  startTime?: string; // HH:mm, optional scheduled start for timeline
  endTime?: string; // HH:mm, optional scheduled end for timeline
  priority?: TaskPriority;
  state: TaskState;
  category: TaskCategory;
  createdAt: string;
  completedAt?: string;
  isArchived?: boolean;
  checkpoints?: TaskCheckpoint[];
}

export const BENCHMARK_DATE_STR = '2026-11-17';
export const BENCHMARK_DATE_TIME = '2026-11-17T12:00:00Z';

// This fork intentionally ships with no preassigned demo tasks.
// Live users start with an empty workspace, and tests use their own fixtures.
export const SAMPLE_TASKS: SampleTask[] = [];
