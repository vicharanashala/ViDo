import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkloadInsightCard } from './WorkloadInsightCard';
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

describe('WorkloadInsightCard', () => {
  it('renders counts', () => {
    render(
      <WorkloadInsightCard
        tasks={[
          task({ id: 'a', title: 'A', priority: 'high', dueDate: '2026-11-15', dueTime: '10:00' }),
          task({ id: 'b', title: 'B', priority: 'high', dueDate: '2026-11-19', dueTime: '19:00' }),
          task({ id: 'c', title: 'C', priority: 'medium', dueDate: '2026-11-21', dueTime: '10:00' }),
        ]}
        now={now}
      />
    );

    expect(screen.getByRole('heading', { name: /workload insight/i })).toBeInTheDocument();
    expect(screen.getByText(/overdue: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/due today: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/high priority due soon: 1/i)).toBeInTheDocument();
  });

  it('shows an empty state', () => {
    render(<WorkloadInsightCard tasks={[]} now={now} />);
    expect(screen.getByText(/no pending tasks/i)).toBeInTheDocument();
  });
});
