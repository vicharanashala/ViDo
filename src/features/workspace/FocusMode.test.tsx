import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FocusMode } from './FocusMode';
import { createSeedTasks } from '../../data/sampleTasks';

const task = createSeedTasks(new Date(2026, 10, 17, 12, 0, 0))[0];

describe('FocusMode', () => {
  it('shows one task with progress, checkpoints, and completion controls', () => {
    const onClose = vi.fn();
    const onSetProgress = vi.fn();
    const onAddCheckpoint = vi.fn();
    const onToggleComplete = vi.fn();

    render(
      <FocusMode
        task={task}
        onClose={onClose}
        onSetProgress={onSetProgress}
        onAddCheckpoint={onAddCheckpoint}
        onToggleComplete={onToggleComplete}
      />
    );

    expect(screen.getByRole('heading', { name: task.title })).toBeInTheDocument();
    expect(screen.getAllByText(`${task.progress}%`).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /set progress to 75%/i }));
    expect(onSetProgress).toHaveBeenCalledWith(task.id, 75);

    fireEvent.change(screen.getByLabelText(/a note to yourself/i), { target: { value: 'Draft reviewed' } });
    fireEvent.click(screen.getByRole('button', { name: /keep a note/i }));
    expect(onAddCheckpoint).toHaveBeenCalledWith(task.id, 'Draft reviewed');

    fireEvent.click(screen.getByRole('button', { name: /done for now/i }));
    expect(onToggleComplete).toHaveBeenCalledWith(task.id);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
