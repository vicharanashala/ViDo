import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { EveningCheckIn } from './EveningCheckIn';
import type { Task } from '../../data/taskTypes';
import { loadEveningCheckIn } from '../../lib/journalStore';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-1',
    title: 'Write the summary',
    dueDate: '2026-11-20',
    category: 'work',
    state: 'active',
    progress: 0,
    createdAt: '2026-11-20T08:00:00.000Z',
    updatedAt: '2026-11-20T08:00:00.000Z',
    checkpoints: [],
    ...overrides,
  };
}

const tasks: Task[] = [
  makeTask({ id: 'task-1', title: 'Write the summary', state: 'completed', progress: 100, spentMinutes: 45, plannedMinutes: 60 }),
  makeTask({ id: 'task-2', title: 'Read the brief' }),
];

function renderSheet(overrides: Partial<React.ComponentProps<typeof EveningCheckIn>> = {}) {
  const onClose = vi.fn();
  const onLater = vi.fn();
  const onSaved = vi.fn();
  render(
    <EveningCheckIn
      dateKey="2026-11-20"
      tasks={tasks}
      onClose={onClose}
      onLater={onLater}
      onSaved={onSaved}
      {...overrides}
    />
  );
  return { onClose, onLater, onSaved };
}

describe('EveningCheckIn', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('asks how the day sat and branches the follow-ups by mood', () => {
    renderSheet();
    expect(screen.getByRole('heading', { name: /how did today sit/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'heavy' }));
    expect(screen.getByText(/which task took the most out of you/i)).toBeInTheDocument();
    expect(screen.queryByText(/what kept the day steady/i)).not.toBeInTheDocument();
  });

  it('prefills what moved from completed tasks', () => {
    renderSheet();
    const moved = within(screen.getByRole('region', { name: /what got done/i })).getByRole('button', {
      name: 'Write the summary',
    });
    expect(moved).toHaveAttribute('aria-pressed', 'true');
  });

  it('saves the evening and the next day intention', () => {
    const { onSaved } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'steady' }));
    fireEvent.change(screen.getByPlaceholderText(/a line is enough/i), {
      target: { value: 'One meeting and two calls, but focus time was good.' },
    });
    fireEvent.change(screen.getByPlaceholderText(/becomes tomorrow's intention/i), {
      target: { value: 'Start with the smallest step' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save the evening/i }));

    const saved = loadEveningCheckIn('2026-11-20');
    expect(saved?.mood).toBe('steady');
    expect(saved?.movedTaskIds).toContain('task-1');
    expect(saved?.analysis?.tags.map((tag) => tag.label)).toEqual(
      expect.arrayContaining(['meetings', 'focus time'])
    );
    expect(window.localStorage.getItem('vido.intention.2026-11-21')).toBe(
      'Start with the smallest step'
    );
    expect(onSaved).toHaveBeenCalledTimes(1);
  });

  it('always analyses the write-up and offers no checkbox', () => {
    renderSheet();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'calm' }));
    fireEvent.change(screen.getByPlaceholderText(/a line is enough/i), {
      target: { value: 'Two meetings and a call.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save the evening/i }));

    expect(loadEveningCheckIn('2026-11-20')?.analysis?.tags).toEqual([
      { label: 'meetings', count: 2 },
    ]);
  });

  it('accepts manual minutes when no timer ran', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'steady' }));
    fireEvent.change(screen.getByLabelText(/add time for another task/i), {
      target: { value: 'task-2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set 30 minutes for Read the brief' }));
    fireEvent.click(screen.getByRole('button', { name: /save the evening/i }));

    const saved = loadEveningCheckIn('2026-11-20');
    const tracked = saved?.timeLog.find((entry) => entry.taskId === 'task-1');
    expect(tracked).toMatchObject({ actualMinutes: 45, source: 'timer' });
    const manual = saved?.timeLog.find((entry) => entry.taskId === 'task-2');
    expect(manual).toMatchObject({ actualMinutes: 30, source: 'manual' });
  });

  it('records what felt easy as well as what felt heavy', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'steady' }));
    const easy = within(screen.getByRole('region', { name: /what felt easy/i })).getByRole(
      'button',
      { name: 'Read the brief' }
    );
    fireEvent.click(easy);
    fireEvent.click(screen.getByRole('button', { name: /save the evening/i }));

    const saved = loadEveningCheckIn('2026-11-20');
    expect(saved?.lightTaskTitles).toEqual(['Read the brief']);
    expect(saved?.lightTaskIds).toEqual(['task-2']);
  });

  it('keeps heavy and easy exclusive while got done stays independent', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'steady' }));

    const heavySection = screen.getByRole('region', { name: /what felt heavy/i });
    const easySection = screen.getByRole('region', { name: /what felt easy/i });
    fireEvent.click(within(heavySection).getByRole('button', { name: 'Read the brief' }));
    fireEvent.click(within(easySection).getByRole('button', { name: 'Read the brief' }));

    expect(
      within(heavySection).getByRole('button', { name: 'Read the brief' })
    ).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: /save the evening/i }));
    const saved = loadEveningCheckIn('2026-11-20');
    expect(saved?.lightTaskTitles).toEqual(['Read the brief']);
    expect(saved?.heavyTaskTitles).toEqual([]);
    expect(saved?.movedTaskIds).toContain('task-1');
  });

  it('stores the work journey separately from the share note', () => {
    renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'steady' }));
    fireEvent.change(screen.getByPlaceholderText(/what was hard/i), {
      target: { value: 'No interruptions, deep work after lunch.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /save the evening/i }));

    const saved = loadEveningCheckIn('2026-11-20');
    expect(saved?.journey).toBe('No interruptions, deep work after lunch.');
    expect(saved?.journeyAnalysis?.tags.map((tag) => tag.label)).toEqual(
      expect.arrayContaining(['interruptions', 'focus time'])
    );
    expect(saved?.note).toBeUndefined();
  });

  it('can be deferred', () => {
    const { onLater } = renderSheet();
    fireEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(onLater).toHaveBeenCalledTimes(1);
  });
});
