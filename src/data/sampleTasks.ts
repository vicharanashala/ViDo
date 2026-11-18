import type {
  NewTaskInput,
  Task,
  TaskCategory,
  TaskCheckpoint,
  TaskPriority,
} from './taskTypes';
import { addDays, startOfDay, toDateKey, toIso } from './taskDates';

export type {
  NewTaskInput,
  Task,
  TaskCategory,
  TaskCheckpoint,
  TaskPriority,
  TaskState,
  TaskPace,
  PaceStatus,
} from './taskTypes';

export type SampleTask = Task;

interface CheckpointSpec {
  offset: number;
  time: string;
  note: string;
  progress: number;
}

interface TaskSpec {
  id: string;
  title: string;
  description?: string;
  offset: number;
  dueTime?: string;
  priority?: TaskPriority;
  category: TaskCategory;
  progress: number;
  checkpoints?: CheckpointSpec[];
  completedOffset?: number;
  completedTime?: string;
  archivedOffset?: number;
}

const TASK_SPECS: TaskSpec[] = [
  {
    id: 'task-today-1',
    title: 'Review Q4 Budget & Resource Allocations',
    description: 'Ensure departmental forecasts align with overall organizational runway.',
    offset: 0,
    dueTime: '16:00',
    priority: 'high',
    category: 'work',
    progress: 60,
    checkpoints: [
      { offset: -2, time: '11:00', note: 'Draft spreadsheets collected from finance team.', progress: 30 },
      { offset: -1, time: '15:30', note: 'Initial discrepancies addressed in payroll projections.', progress: 60 },
    ],
  },
  {
    id: 'task-today-2',
    title: 'Submit Vehicle Registration Renewal',
    description: 'Complete online renewal form and verify proof of emissions inspection.',
    offset: 0,
    dueTime: '18:00',
    priority: 'medium',
    category: 'personal',
    progress: 25,
  },
  {
    id: 'task-today-3',
    title: 'Do the laundry',
    description: 'Wash, dry, fold, and put away the clean clothes.',
    offset: 0,
    dueTime: '17:00',
    priority: 'high',
    category: 'home',
    progress: 0,
  },
  {
    id: 'task-today-4',
    title: 'Finalize Architecture Spec for Task Sync',
    description: 'Document conflict resolution strategies and offline delta queues.',
    offset: 0,
    dueTime: '19:00',
    priority: 'high',
    category: 'work',
    progress: 75,
    checkpoints: [
      { offset: -1, time: '10:00', note: 'Offline queue draft reviewed with the team.', progress: 50 },
      { offset: 0, time: '09:00', note: 'Conflict matrix completed; remaining section is the rollout plan.', progress: 75 },
    ],
  },
  {
    id: 'task-today-5',
    title: 'Buy Groceries for Weekly Meal Prep',
    description: 'Organic vegetables, whole grain oats, oat milk, and cold brew coffee.',
    offset: 0,
    dueTime: '20:00',
    priority: 'medium',
    category: 'home',
    progress: 10,
  },
  {
    id: 'task-today-6',
    title: 'Evening 5km Recovery Jog',
    description: 'Keep zone 2 heart rate below 140 bpm.',
    offset: 0,
    dueTime: '21:00',
    priority: 'low',
    category: 'personal',
    progress: 0,
  },
  {
    id: 'task-attention-1',
    title: 'Submit Annual Property Insurance Declaration',
    description: 'Required policy verification for carrier underwriting update.',
    offset: -2,
    dueTime: '17:00',
    priority: 'high',
    category: 'home',
    progress: 40,
    checkpoints: [{ offset: -1, time: '09:00', note: 'Policy summary received from broker.', progress: 40 }],
  },
  {
    id: 'task-attention-2',
    title: 'Renew SSL TLS Certificates on Staging API Gateway',
    description: 'Certificate expiring within 24 hours. Needs renewal validation.',
    offset: -1,
    dueTime: '23:59',
    priority: 'high',
    category: 'work',
    progress: 80,
  },
  {
    id: 'task-attention-3',
    title: 'Follow Up with Dental Clinic Regarding Appointment',
    description: 'Confirm appointment time for next Tuesday routine checkup.',
    offset: -3,
    dueTime: '15:00',
    priority: 'medium',
    category: 'personal',
    progress: 20,
  },
  {
    id: 'task-attention-4',
    title: 'Fix Leaking Garden Hose Connector',
    description: 'Replace rubber washer before winter freeze.',
    offset: -4,
    dueTime: '12:00',
    priority: 'low',
    category: 'home',
    progress: 0,
  },
  {
    id: 'task-upcoming-1',
    title: 'Team Sprint Planning & Demo Preparation',
    description: 'Coordinate presentation slides and review project deliverables.',
    offset: 2,
    dueTime: '10:00',
    priority: 'high',
    category: 'work',
    progress: 30,
  },
  {
    id: 'task-upcoming-2',
    title: 'Dentist Checkup & Cleaning',
    description: 'Downtown Dental Associates, Suite 400.',
    offset: 3,
    dueTime: '14:30',
    priority: 'medium',
    category: 'personal',
    progress: 0,
  },
  {
    id: 'task-upcoming-3',
    title: 'Schedule Annual Heat Pump Inspection',
    description: 'Book a technician to check the heat pump before winter.',
    offset: 4,
    dueTime: '11:00',
    priority: 'low',
    category: 'home',
    progress: 0,
  },
  {
    id: 'task-upcoming-4',
    title: 'Publish Monthly Engineering Newsletter',
    description: 'Highlight architecture improvements and newly adopted workflow.',
    offset: 7,
    dueTime: '17:00',
    priority: 'medium',
    category: 'work',
    progress: 15,
  },
  {
    id: 'task-upcoming-5',
    title: 'Family Thanksgiving Travel Booking',
    description: 'Verify flight reservations and airport shuttle timing.',
    offset: 8,
    dueTime: '18:00',
    priority: 'high',
    category: 'personal',
    progress: 0,
  },
  {
    id: 'task-completed-recent-1',
    title: 'Draft ViDo Core Architecture & Design Specifications',
    description: 'Define application layout, component specifications, design tokens, and user flows.',
    offset: -1,
    dueTime: '17:00',
    priority: 'high',
    category: 'work',
    progress: 100,
    completedOffset: -1,
    completedTime: '16:30',
  },
  {
    id: 'task-completed-recent-2',
    title: 'Pay Monthly High-Speed Internet Bill',
    description: 'Monthly fiber optical connection subscription invoice.',
    offset: -3,
    dueTime: '23:59',
    priority: 'medium',
    category: 'home',
    progress: 100,
    completedOffset: -3,
    completedTime: '14:20',
  },
  {
    id: 'task-completed-recent-3',
    title: 'Complete Bi-Weekly Grocery Run',
    description: 'Stock pantry staples and household supplies.',
    offset: -4,
    dueTime: '19:00',
    priority: 'low',
    category: 'personal',
    progress: 100,
    completedOffset: -4,
    completedTime: '20:15',
  },
  {
    id: 'task-completed-recent-4',
    title: 'Audit Team GitHub Access & Deploy Keys',
    description: 'Remove inactive collaborator keys and enforce 2FA verification.',
    offset: -5,
    dueTime: '18:00',
    priority: 'high',
    category: 'work',
    progress: 100,
    completedOffset: -5,
    completedTime: '15:45',
  },
  {
    id: 'task-completed-older-1',
    title: 'Product Discovery & Stakeholder Alignment',
    description: 'Initial brainstorming, target persona definitions, and core principles.',
    offset: -15,
    dueTime: '17:00',
    priority: 'high',
    category: 'work',
    progress: 100,
    completedOffset: -15,
    completedTime: '16:00',
  },
  {
    id: 'task-archived-1',
    title: 'Legacy Spreadsheet Migration Spike',
    description: 'Exploratory test for importing tasks from CSV tables.',
    offset: -28,
    dueTime: '18:00',
    priority: 'low',
    category: 'work',
    progress: 100,
    completedOffset: -27,
    completedTime: '14:00',
    archivedOffset: -20,
  },
  {
    id: 'task-archived-2',
    title: 'Research Discarded Kanban Feature Ideas',
    description: 'Evaluated drag-and-drop columns; deferred in favor of calm list views.',
    offset: -20,
    dueTime: '17:00',
    priority: 'medium',
    category: 'work',
    progress: 100,
    completedOffset: -19,
    completedTime: '16:45',
    archivedOffset: -10,
  },
];

export function createSeedTasks(reference: Date = new Date()): Task[] {
  const base = startOfDay(reference);

  return TASK_SPECS.map((spec) => {
    const dueDate = toDateKey(addDays(base, spec.offset));
    const created = toIso(addDays(base, spec.offset - 4), '09:00');
    const checkpoints: TaskCheckpoint[] = (spec.checkpoints ?? []).map((checkpoint, index) => ({
      id: `${spec.id}-cp-${index + 1}`,
      createdAt: toIso(addDays(base, checkpoint.offset), checkpoint.time),
      note: checkpoint.note,
      progress: checkpoint.progress,
    }));

    const completedAt =
      spec.completedOffset === undefined
        ? undefined
        : toIso(addDays(base, spec.completedOffset), spec.completedTime ?? '16:00');

    const archivedAt =
      spec.archivedOffset === undefined
        ? undefined
        : toIso(addDays(base, spec.archivedOffset), '12:00');

    return {
      id: spec.id,
      title: spec.title,
      description: spec.description,
      dueDate,
      dueTime: spec.dueTime,
      priority: spec.priority,
      category: spec.category,
      state: completedAt ? 'completed' : 'active',
      progress: completedAt ? 100 : spec.progress,
      createdAt: created,
      updatedAt: completedAt ?? created,
      completedAt,
      archivedAt,
      checkpoints,
    };
  });
}

export const SAMPLE_TASKS: Task[] = createSeedTasks();

export function createTaskFromInput(input: NewTaskInput, now: Date = new Date()): Task {
  const timestamp = now.toISOString();
  return {
    id: `task-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    deadlineDate: input.deadlineDate,
    recurrence: input.recurrence,
    dueDate: input.dueDate,
    dueTime: input.dueTime || undefined,
    reminderAt: input.reminderAt,
    reminderSentAt: undefined,
    priority: input.priority ?? 'medium',
    category: input.category ?? 'personal',
    state: 'active',
    progress: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    checkpoints: [],
    subtasks: [],
  };
}
