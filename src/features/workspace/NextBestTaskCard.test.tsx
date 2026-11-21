import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextBestTaskCard } from './NextBestTaskCard';
import { SampleTask } from '../../data/sampleTasks';

const now = new Date(2026, 10, 19, 18, 0, 30);

function task(overrides: Partial<SampleTask> & Pick<SampleTask, 'id' | 'title'>): SampleTask {
  return {
    state: 'active',
    category: 'work',
    createdAt: '2026-11-19T10:00:00Z',
    dueDate: '2026-11-20',
    dueTime: '10:00',
    ...overrides,
  };
}

describe('NextBestTaskCard', () => {
  it('shows the top ranked task', () => {
    render(
      <NextBestTaskCard
        tasks={[task({ id: 'a', title: 'Report', priority: 'high', dueDate: '2026-11-15', dueTime: '10:00' })]}
        now={now}
      />
    );

    expect(screen.getByRole('heading', { name: /next best task/i })).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('shows only rank 1', () => {
    render(
      <NextBestTaskCard
        tasks={[
          task({ id: 'a', title: 'Report', priority: 'high', dueDate: '2026-11-15', dueTime: '10:00' }),
          task({ id: 'b', title: 'Prep', priority: 'medium', dueDate: '2026-11-20', dueTime: '10:00' }),
        ]}
        now={now}
      />
    );

    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.queryByText('Prep')).not.toBeInTheDocument();
  });

  it('shows an empty state', () => {
    render(<NextBestTaskCard tasks={[]} now={now} />);
    expect(screen.getByText(/no pending tasks/i)).toBeInTheDocument();
  });

  it('does not display 23:59 when dueTime is missing', () => {
    render(
      <NextBestTaskCard
        tasks={[task({ id: 'a', title: 'Report', priority: 'high', dueDate: '2026-11-20', dueTime: undefined })]}
        now={now}
      />
    );
    expect(screen.getByText(/Due 2026-11-20/i)).toBeInTheDocument();
    expect(screen.queryByText(/23:59/)).not.toBeInTheDocument();
  });

  it('opens the task on click', () => {
    const onClick = vi.fn();
    render(
      <NextBestTaskCard
        tasks={[task({ id: 'a', title: 'Report', priority: 'high', dueDate: '2026-11-20', dueTime: '10:00' })]}
        now={now}
        onTaskClick={onClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
