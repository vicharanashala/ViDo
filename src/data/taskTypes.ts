export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'personal' | 'home' | 'work';
export type TaskState = 'active' | 'completed';
export type TaskRecurrence = 'daily' | 'weekdays' | 'weekly';

export interface TaskCheckpoint {
  id: string;
  createdAt: string;
  note: string;
  progress: number;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  customImageKey?: string;
  deadlineDate?: string;
  recurrence?: TaskRecurrence;
  dueDate: string;
  dueTime?: string;
  reminderAt?: string;
  priority?: TaskPriority;
  category: TaskCategory;
  state: TaskState;
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  parkedAt?: string;
  checkpoints: TaskCheckpoint[];
  subtasks?: Subtask[];
  reminderSentAt?: string;
  sharedWith?: string[];
  sharedBy?: string;
  ownerId?: string;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  deadlineDate?: string;
  recurrence?: TaskRecurrence;
  dueDate: string;
  dueTime?: string;
  reminderAt?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
}

export type PaceStatus = 'done' | 'ahead' | 'on-track' | 'at-risk' | 'behind' | 'no-deadline';

export interface TaskPace {
  expected: number;
  actual: number;
  delta: number;
  status: PaceStatus;
  label: string;
}

export const PACE_EFFICIENCY_LABELS: Record<PaceStatus, string> = {
  done: 'Done',
  ahead: 'Ahead',
  'on-track': 'Steady',
  'at-risk': 'Small step',
  behind: 'Take your time',
  'no-deadline': 'No rush',
};
