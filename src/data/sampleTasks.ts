export type TaskPriority = 'high' | 'medium' | 'low';
export type StandardCategory = 'personal' | 'home' | 'work';
export type TaskCategory = StandardCategory | (string & {});
export type TaskState = 'active' | 'completed';

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

export const SAMPLE_TASKS: SampleTask[] = [
  // 1. TODAY TASKS (Active, due 2026-11-17)
  {
    id: 'task-today-1',
    title: 'Review Q4 Budget & Resource Allocations',
    description: 'Ensure departmental forecasts align with overall organizational runway.',
    dueDate: '2026-11-17',
    dueTime: '16:00',
    priority: 'high',
    state: 'active',
    category: 'work',
    createdAt: '2026-11-14T09:00:00Z',
    checkpoints: [
      { id: 'cp-1', timestamp: '2026-11-15T11:00:00Z', note: 'Draft spreadsheets collected from finance team.' },
      { id: 'cp-2', timestamp: '2026-11-16T15:30:00Z', note: 'Initial discrepancies addressed in payroll projections.' },
    ],
  },
  {
    id: 'task-today-2',
    title: 'Submit Vehicle Registration Renewal',
    description: 'Complete online renewal form and verify proof of emissions inspection.',
    dueDate: '2026-11-17',
    dueTime: '18:00',
    priority: 'medium',
    state: 'active',
    category: 'personal',
    createdAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'task-today-3',
    title: 'Schedule Annual HVAC Inspection',
    description: 'Book certified technician for winter heat pump tune-up.',
    dueDate: '2026-11-17',
    dueTime: '17:00',
    priority: 'low',
    state: 'active',
    category: 'home',
    createdAt: '2026-11-10T14:00:00Z',
  },
  {
    id: 'task-today-4',
    title: 'Finalize Architecture Spec for Task Sync',
    description: 'Document conflict resolution strategies and offline delta queues.',
    dueDate: '2026-11-17',
    dueTime: '19:00',
    priority: 'high',
    state: 'active',
    category: 'work',
    createdAt: '2026-11-16T08:30:00Z',
  },
  {
    id: 'task-today-5',
    title: 'Buy Groceries for Weekly Meal Prep',
    description: 'Organic vegetables, whole grain oats, oat milk, and cold brew coffee.',
    dueDate: '2026-11-17',
    dueTime: '20:00',
    priority: 'medium',
    state: 'active',
    category: 'home',
    createdAt: '2026-11-17T08:00:00Z',
  },
  {
    id: 'task-today-6',
    title: 'Evening 5km Recovery Jog',
    description: 'Keep zone 2 heart rate below 140 bpm.',
    dueDate: '2026-11-17',
    dueTime: '21:00',
    priority: 'low',
    state: 'active',
    category: 'personal',
    createdAt: '2026-11-17T07:00:00Z',
  },

  // 2. OVERDUE / NEEDS ATTENTION (Active, due < 2026-11-17)
  {
    id: 'task-attention-1',
    title: 'Submit Annual Property Insurance Declaration',
    description: 'Required policy verification for carrier underwriting update.',
    dueDate: '2026-11-15',
    dueTime: '17:00',
    priority: 'high',
    state: 'active',
    category: 'home',
    createdAt: '2026-11-01T10:00:00Z',
    checkpoints: [
      { id: 'cp-3', timestamp: '2026-11-14T09:00:00Z', note: 'Policy summary received from broker.' },
    ],
  },
  {
    id: 'task-attention-2',
    title: 'Renew SSL TLS Certificates on Staging API Gateway',
    description: 'Certificate expiring within 24 hours. Needs Let’s Encrypt renewal validation.',
    dueDate: '2026-11-16',
    dueTime: '23:59',
    priority: 'high',
    state: 'active',
    category: 'work',
    createdAt: '2026-11-11T12:00:00Z',
  },
  {
    id: 'task-attention-3',
    title: 'Follow Up with Dental Clinic Regarding Appointment',
    description: 'Confirm appointment time for next Tuesday routine checkup.',
    dueDate: '2026-11-14',
    dueTime: '15:00',
    priority: 'medium',
    state: 'active',
    category: 'personal',
    createdAt: '2026-11-10T11:00:00Z',
  },
  {
    id: 'task-attention-4',
    title: 'Fix Leaking Garden Hose Connector',
    description: 'Replace rubber washer before winter freeze.',
    dueDate: '2026-11-13',
    dueTime: '12:00',
    priority: 'low',
    state: 'active',
    category: 'home',
    createdAt: '2026-11-08T16:00:00Z',
  },

  // 3. UPCOMING TASKS (Active, due > 2026-11-17)
  {
    id: 'task-upcoming-1',
    title: 'Team Sprint Planning & Demo Preparation',
    description: 'Coordinate presentation slides and review project deliverables.',
    dueDate: '2026-11-19',
    dueTime: '10:00',
    priority: 'high',
    state: 'active',
    category: 'work',
    createdAt: '2026-11-15T14:00:00Z',
  },
  {
    id: 'task-upcoming-2',
    title: 'Dentist Checkup & Cleaning',
    description: 'Downtown Dental Associates, Suite 400.',
    dueDate: '2026-11-20',
    dueTime: '14:30',
    priority: 'medium',
    state: 'active',
    category: 'personal',
    createdAt: '2026-11-12T16:00:00Z',
  },
  {
    id: 'task-upcoming-3',
    title: 'Quarterly Roof Gutter Cleaning',
    description: 'Clear autumn leaves and check downspout drainage.',
    dueDate: '2026-11-21',
    dueTime: '11:00',
    priority: 'low',
    state: 'active',
    category: 'home',
    createdAt: '2026-11-14T09:00:00Z',
  },
  {
    id: 'task-upcoming-4',
    title: 'Publish Monthly Engineering Newsletter',
    description: 'Highlight architecture improvements and newly adopted OpenSpec workflow.',
    dueDate: '2026-11-24',
    dueTime: '17:00',
    priority: 'medium',
    state: 'active',
    category: 'work',
    createdAt: '2026-11-15T18:00:00Z',
  },
  {
    id: 'task-upcoming-5',
    title: 'Family Thanksgiving Travel Booking',
    description: 'Verify flight reservations and airport shuttle timing.',
    dueDate: '2026-11-25',
    dueTime: '18:00',
    priority: 'high',
    state: 'active',
    category: 'personal',
    createdAt: '2026-11-16T12:00:00Z',
  },

  // 4. RECENTLY COMPLETED (Completed within last 7 days: 2026-11-10 to 2026-11-17)
  {
    id: 'task-completed-recent-1',
    title: 'Draft ViDo Core Architecture & Design Specifications',
    description: 'Define application layout, component specifications, design tokens, and user flows.',
    dueDate: '2026-11-16',
    dueTime: '17:00',
    priority: 'high',
    state: 'completed',
    category: 'work',
    createdAt: '2026-11-15T09:00:00Z',
    completedAt: '2026-11-16T16:30:00Z', // Completed on time
  },
  {
    id: 'task-completed-recent-2',
    title: 'Pay Monthly High-Speed Internet Bill',
    description: 'Monthly fiber optical connection subscription invoice.',
    dueDate: '2026-11-14',
    dueTime: '23:59',
    priority: 'medium',
    state: 'completed',
    category: 'home',
    createdAt: '2026-11-05T10:00:00Z',
    completedAt: '2026-11-14T14:20:00Z', // Completed on time
  },
  {
    id: 'task-completed-recent-3',
    title: 'Complete Bi-Weekly Grocery Run',
    description: 'Stock pantry staples and household supplies.',
    dueDate: '2026-11-13',
    dueTime: '19:00',
    priority: 'low',
    state: 'completed',
    category: 'personal',
    createdAt: '2026-11-11T12:00:00Z',
    completedAt: '2026-11-13T20:15:00Z', // Completed after deadline
  },
  {
    id: 'task-completed-recent-4',
    title: 'Audit Team GitHub Access & Deploy Keys',
    description: 'Remove inactive collaborator keys and enforce 2FA verification.',
    dueDate: '2026-11-12',
    dueTime: '18:00',
    priority: 'high',
    state: 'completed',
    category: 'work',
    createdAt: '2026-11-09T09:00:00Z',
    completedAt: '2026-11-12T15:45:00Z',
  },

  // 5. OLDER COMPLETED (Completed > 7 days ago: before 2026-11-10)
  {
    id: 'task-completed-older-1',
    title: 'Product Discovery & Stakeholder Alignment',
    description: 'Initial brainstorming, target persona definitions, and core principles.',
    dueDate: '2026-11-02',
    dueTime: '17:00',
    priority: 'high',
    state: 'completed',
    category: 'work',
    createdAt: '2026-10-25T10:00:00Z',
    completedAt: '2026-11-02T16:00:00Z',
  },

  // 6. ARCHIVED TASKS
  {
    id: 'task-archived-1',
    title: 'Legacy Spreadsheet Migration Spike',
    description: 'Exploratory test for importing tasks from CSV tables.',
    dueDate: '2026-10-20',
    dueTime: '18:00',
    priority: 'low',
    state: 'completed',
    category: 'work',
    createdAt: '2026-10-15T11:00:00Z',
    completedAt: '2026-10-19T14:00:00Z',
    isArchived: true,
  },
  {
    id: 'task-archived-2',
    title: 'Research Discarded Kanban Feature Ideas',
    description: 'Evaluated drag-and-drop columns; deferred in favor of calm list views.',
    dueDate: '2026-10-28',
    dueTime: '17:00',
    priority: 'medium',
    state: 'completed',
    category: 'work',
    createdAt: '2026-10-22T09:00:00Z',
    completedAt: '2026-10-27T16:45:00Z',
    isArchived: true,
  },
];

