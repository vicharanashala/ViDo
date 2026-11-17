import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodayQueueView } from './TodayQueueView';
import { createSeedTasks } from '../../../data/sampleTasks';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const tasks = createSeedTasks(reference);

describe('TodayQueueView', () => {
  it('renders overdue first, then due today, with priority feedback', () => {
    const onTaskClick = vi.fn();
    const onToggleComplete = vi.fn();
    const onFocusTask = vi.fn();

    render(
      <TodayQueueView
        tasks={tasks}
        reference={reference}
        onTaskClick={onTaskClick}
        onToggleComplete={onToggleComplete}
        onFocusTask={onFocusTask}
      />
    );

    expect(screen.getByText(/2 high-priority overdue · 3 due today/i)).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Due today')).toBeInTheDocument();
    expect(screen.getByText(/property insurance/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start next/i }));
    expect(onFocusTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/property insurance/i) })
    );

    const row = screen.getByLabelText(/task: submit annual property insurance/i);
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onTaskClick).toHaveBeenCalled();

    fireEvent.keyDown(row, { key: ' ' });
    expect(onToggleComplete).toHaveBeenCalled();
  });

  it('renders a calm empty state', () => {
    const onNewTaskClick = vi.fn();
    render(
      <TodayQueueView
        tasks={[]}
        onTaskClick={vi.fn()}
        onFocusTask={vi.fn()}
        onNewTaskClick={onNewTaskClick}
      />
    );

    expect(screen.getByText(/nothing queued/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add a task/i }));
    expect(onNewTaskClick).toHaveBeenCalled();
  });
});
