import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrailView } from './TrailView';
import { createSeedTasks } from '../../../data/sampleTasks';

const tasks = createSeedTasks(new Date(2026, 10, 17, 12, 0, 0));

describe('TrailView', () => {
  it('moves the token with completed tasks and climbs a ladder', () => {
    const withCompleted = tasks.slice(0, 3).map((task, index) => ({
      ...task,
      state: index < 2 ? ('completed' as const) : ('active' as const),
      completedAt: index < 2 ? task.completedAt ?? '2026-11-17T10:00:00.000Z' : undefined,
    }));

    render(<TrailView tasks={withCompleted} />);

    expect(screen.getByRole('heading', { name: /little game of progress/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/your token on square 11/i)).toBeInTheDocument();
    expect(screen.getByText(/2 completed tasks/i)).toBeInTheDocument();
    expect(screen.getByTitle(/ladder because of/i)).toBeInTheDocument();
  });

  it('reaches the goal when every task is done', () => {
    const allDone = tasks.slice(0, 3).map((task) => ({
      ...task,
      state: 'completed' as const,
      completedAt: task.completedAt ?? '2026-11-17T10:00:00.000Z',
    }));

    render(<TrailView tasks={allDone} />);

    expect(screen.getByLabelText(/your token on square 36/i)).toBeInTheDocument();
    expect(screen.getAllByText(/goal reached/i).length).toBeGreaterThan(0);
  });
});
