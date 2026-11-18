import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodayQueueView } from './TodayQueueView';
import { createSeedTasks } from '../../../data/sampleTasks';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const tasks = createSeedTasks(reference);

describe('TodayQueueView', () => {
  it('renders only due-today tasks with priority feedback', () => {
    const onTaskClick = vi.fn();
    const onToggleComplete = vi.fn();
    const onFocusTask = vi.fn();
    const onCheckInStart = vi.fn();

    render(
      <TodayQueueView
        tasks={tasks}
        reference={reference}
        onTaskClick={onTaskClick}
        onToggleComplete={onToggleComplete}
        onFocusTask={onFocusTask}
        onCheckInStart={onCheckInStart}
      />
    );

    expect(screen.getByText(/one important thing is here/i)).toBeInTheDocument();
    expect(screen.queryByText(/carried over/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/property insurance/i)).not.toBeInTheDocument();
    expect(screen.getByText(/review q4 budget/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /start with one/i }));
    expect(onFocusTask).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/review q4 budget/i) })
    );

    const row = screen.getByLabelText(/task: review q4 budget/i);
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onTaskClick).toHaveBeenCalled();

    fireEvent.keyDown(row, { key: ' ' });
    expect(onCheckInStart).toHaveBeenCalled();
  });

  it('suggests a few earlier tasks and lets the user choose one', () => {
    const onBringToToday = vi.fn();

    render(
      <TodayQueueView
        tasks={tasks}
        reference={reference}
        onTaskClick={vi.fn()}
        onFocusTask={vi.fn()}
        onBringToToday={onBringToToday}
      />
    );

    expect(screen.getByRole('heading', { name: /from earlier/i })).toBeInTheDocument();
    expect(screen.getByText(/property insurance/i)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /do submit annual property insurance declaration today/i })
    );
    expect(onBringToToday).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/property insurance/i) })
    );
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

    expect(screen.getByText(/nothing due today/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add a task/i }));
    expect(onNewTaskClick).toHaveBeenCalled();
  });
});
