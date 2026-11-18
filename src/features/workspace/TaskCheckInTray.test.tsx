import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCheckInTray } from './TaskCheckInTray';
import { createSeedTasks } from '../../data/sampleTasks';

const task = createSeedTasks(new Date(2026, 10, 17, 12, 0, 0))[0];

describe('TaskCheckInTray', () => {
  it('offers three calm responses and reports the chosen one', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<TaskCheckInTray task={task} onSelect={onSelect} onClose={onClose} />);

    expect(screen.getByText(/what happened with this one/i)).toBeInTheDocument();
    expect(screen.getByText(task.title)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /yesss/i }));
    expect(onSelect).toHaveBeenCalledWith('done');
  });

  it('asks for a percentage during a partial check-in', () => {
    const onSelect = vi.fn();
    render(<TaskCheckInTray task={task} onSelect={onSelect} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /worked on it/i }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/how far along is it now/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '75%' }));
    expect(onSelect).toHaveBeenCalledWith('progress', 75);
  });

  it('supports dropping an image into a zone', () => {
    const onSelect = vi.fn();
    render(<TaskCheckInTray task={task} onSelect={onSelect} onClose={vi.fn()} />);

    const zone = screen.getByRole('button', { name: /not today/i });
    fireEvent.dragOver(zone);
    fireEvent.drop(zone);
    expect(onSelect).toHaveBeenCalledWith('not-today');
  });

  it('supports keyboard choices and Escape', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(<TaskCheckInTray task={task} onSelect={onSelect} onClose={onClose} />);

    fireEvent.keyDown(window, { key: '4' });
    expect(onSelect).toHaveBeenCalledWith('not-important');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
