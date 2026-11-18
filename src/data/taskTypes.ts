export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'personal' | 'home' | 'work';
export type TaskState = 'active' | 'completed';

export interface TaskCheckpoint {
  id: string;
  createdAt: string;
  note: string;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority?: TaskPriority;
  category: TaskCategory;
  state: TaskState;
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  checkpoints: TaskCheckpoint[];
}

export interface NewTaskInput {
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
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
