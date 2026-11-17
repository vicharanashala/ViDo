import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskRow } from './TaskRow';
import { createSeedTasks } from '../../data/sampleTasks';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const task = createSeedTasks(reference)[0];

describe('TaskRow', () => {
  it('shows three signals and a high-priority marker', () => {
    render(<TaskRow task={task} now={reference} onClick={vi.fn()} onToggleComplete={vi.fn()} />);

    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText(/today 16:00/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/high priority/i)).toBeInTheDocument();
    expect(screen.queryByText(/^high$/i)).not.toBeInTheDocument();
  });

  it('opens with Enter, completes with Space, and focuses with F', () => {
    const onClick = vi.fn();
    const onToggleComplete = vi.fn();
    const onFocus = vi.fn();

    render(
      <TaskRow
        task={task}
        now={reference}
        onClick={onClick}
        onToggleComplete={onToggleComplete}
        onFocus={onFocus}
      />
    );
    const row = screen.getByLabelText(new RegExp(`task: ${task.title}`, 'i'));

    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(task);

    fireEvent.keyDown(row, { key: ' ' });
    expect(onToggleComplete).toHaveBeenCalledWith(task);

    fireEvent.keyDown(row, { key: 'f' });
    expect(onFocus).toHaveBeenCalledWith(task);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(`focus ${task.title}`, 'i') }));
    expect(onFocus).toHaveBeenCalledTimes(2);
  });

  it('renders the image and title together for a recognised task', () => {
    const laundry = { ...task, title: 'Making laundry' };
    const { container } = render(<TaskRow task={laundry} now={reference} onClick={vi.fn()} />);

    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByText('Making laundry')).toBeInTheDocument();
  });
});
