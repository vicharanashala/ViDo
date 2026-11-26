import type { SampleTask } from './sampleTasks';

// Test-only fixtures. These are never imported by the app preview or live workspace.
function fixture(
  id: string,
  title: string,
  dueDate: string,
  overrides: Partial<SampleTask> = {}
): SampleTask {
  return {
    id,
    title,
    description: 'Fixture task used by automated tests.',
    dueDate,
    state: 'active',
    category: 'work',
    createdAt: '2026-11-14T09:00:00Z',
    ...overrides,
  };
}

export const TASK_FIXTURES: SampleTask[] = [
  fixture('fixture-today-1', 'Fixture Planning Block', '2026-11-17', {
    dueTime: '12:00',
    startTime: '10:00',
    endTime: '12:00',
    priority: 'high',
    checkpoints: [
      { id: 'fixture-cp-1', timestamp: '2026-11-15T11:00:00Z', note: 'Fixture checkpoint one.' },
      { id: 'fixture-cp-2', timestamp: '2026-11-16T15:30:00Z', note: 'Fixture checkpoint two.' },
    ],
  }),
  fixture('fixture-today-2', 'Fixture Personal Renewal', '2026-11-17', {
    dueTime: '14:00',
    startTime: '12:00',
    endTime: '14:00',
    priority: 'medium',
    category: 'personal',
  }),
  fixture('fixture-today-3', 'Fixture Home Maintenance', '2026-11-17', {
    dueTime: '16:00',
    startTime: '15:00',
    endTime: '16:00',
    priority: 'low',
    category: 'home',
  }),
  fixture('fixture-today-4', 'Fixture Spec Review', '2026-11-17', {
    dueTime: '18:00',
    startTime: '17:00',
    endTime: '18:00',
    priority: 'high',
  }),
  fixture('fixture-today-5', 'Fixture Meal Prep', '2026-11-17', {
    dueTime: '19:30',
    startTime: '18:30',
    endTime: '19:30',
    priority: 'medium',
    category: 'home',
  }),
  fixture('fixture-today-6', 'Fixture Evening Walk', '2026-11-17', {
    dueTime: '20:30',
    startTime: '20:00',
    endTime: '20:30',
    priority: 'low',
    category: 'personal',
  }),

  fixture('fixture-attention-1', 'Fixture Overdue Letter', '2026-11-15', {
    priority: 'high',
    category: 'home',
  }),
  fixture('fixture-attention-2', 'Fixture Overdue Certificate', '2026-11-16', {
    priority: 'high',
  }),
  fixture('fixture-attention-3', 'Fixture Overdue Appointment', '2026-11-14', {
    priority: 'medium',
    category: 'personal',
  }),
  fixture('fixture-attention-4', 'Fixture Overdue Repair', '2026-11-13', {
    priority: 'low',
    category: 'home',
  }),

  fixture('fixture-upcoming-1', 'Fixture Sprint Sync', '2026-11-19', { priority: 'high' }),
  fixture('fixture-upcoming-2', 'Fixture Personal Visit', '2026-11-20', {
    priority: 'medium',
    category: 'personal',
  }),
  fixture('fixture-upcoming-3', 'Fixture Gutter Review', '2026-11-21', {
    priority: 'low',
    category: 'home',
  }),
  fixture('fixture-upcoming-4', 'Fixture Team Update', '2026-11-24', { priority: 'medium' }),
  fixture('fixture-upcoming-5', 'Fixture Travel Plan', '2026-11-25', {
    priority: 'high',
    category: 'personal',
  }),

  fixture('fixture-completed-1', 'Fixture Design Review', '2026-11-16', {
    state: 'completed',
    completedAt: '2026-11-16T16:30:00Z',
  }),
  fixture('fixture-completed-2', 'Fixture Utility Payment', '2026-11-14', {
    state: 'completed',
    completedAt: '2026-11-14T14:20:00Z',
    category: 'home',
  }),
  fixture('fixture-completed-3', 'Fixture Supply Run', '2026-11-13', {
    state: 'completed',
    completedAt: '2026-11-13T20:15:00Z',
    category: 'personal',
  }),
  fixture('fixture-completed-4', 'Fixture Access Audit', '2026-11-12', {
    state: 'completed',
    completedAt: '2026-11-12T15:45:00Z',
  }),
  fixture('fixture-completed-older-1', 'Fixture Discovery Notes', '2026-11-02', {
    state: 'completed',
    completedAt: '2026-11-02T16:00:00Z',
  }),

  fixture('fixture-archived-1', 'Fixture Legacy Review', '2026-10-20', {
    state: 'completed',
    completedAt: '2026-10-19T14:00:00Z',
    isArchived: true,
  }),
  fixture('fixture-archived-2', 'Fixture Deferred Ideas', '2026-10-28', {
    state: 'completed',
    completedAt: '2026-10-27T16:45:00Z',
    isArchived: true,
  }),
];
