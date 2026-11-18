import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskRow } from './TaskRow';
import { createSeedTasks } from '../../data/sampleTasks';
import { addDays, toDateKey } from '../../data/taskDates';

const reference = new Date(2026, 10, 17, 12, 0, 0);
const task = createSeedTasks(reference)[0];

describe('TaskRow', () => {
  it('shows three signals and an important marker', () => {
    render(<TaskRow task={task} now={reference} onClick={vi.fn()} onToggleComplete={vi.fn()} />);

    expect(screen.getByText(task.title)).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText(/today 16:00/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/important/i)).toBeInTheDocument();
    expect(screen.queryByText(/^high$/i)).not.toBeInTheDocument();
  });

  it('opens with Enter, opens check-in with Space, and focuses with F', () => {
    const onClick = vi.fn();
    const onToggleComplete = vi.fn();
    const onFocus = vi.fn();
    const onCheckInStart = vi.fn();

    render(
      <TaskRow
        task={task}
        now={reference}
        onClick={onClick}
        onToggleComplete={onToggleComplete}
        onFocus={onFocus}
        onCheckInStart={onCheckInStart}
      />
    );
    const row = screen.getByLabelText(new RegExp(`task: ${task.title}`, 'i'));

    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(task);

    fireEvent.keyDown(row, { key: ' ' });
    expect(onCheckInStart).toHaveBeenCalledWith(task);
    expect(onToggleComplete).not.toHaveBeenCalled();

    fireEvent.keyDown(row, { key: 'f' });
    expect(onFocus).toHaveBeenCalledWith(task);

    fireEvent.keyDown(row, { key: 'c' });
    expect(onCheckInStart).toHaveBeenCalledWith(task);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(`begin ${task.title}`, 'i') }));
    expect(onFocus).toHaveBeenCalledTimes(2);
  });

  it('does not nudge before the due time', () => {
    const future = { ...task, dueTime: '23:00' };
    render(<TaskRow task={future} now={reference} onClick={vi.fn()} />);

    expect(screen.queryByText(/hope you got it done/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
  });

  it('shows pending after the deadline but keeps the circle open until midnight', () => {
    const passed = { ...task, dueTime: '11:00' };
    render(<TaskRow task={passed} now={reference} onClick={vi.fn()} />);

    expect(screen.getByText(/hope you got it done/i)).toBeInTheDocument();
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(`check in ${passed.title}`, 'i'))).toBeInTheDocument();
  });

  it('links a pending task to its path', () => {
    const passed = { ...task, dueTime: '11:00' };
    const onOpenPath = vi.fn();
    render(
      <TaskRow
        task={passed}
        now={reference}
        onClick={vi.fn()}
        onOpenPath={onOpenPath}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /break into steps/i }));
    expect(onOpenPath).toHaveBeenCalledWith(passed.id);
  });

  it('shows pending for a past day without the deadline nudge', () => {
    const past = { ...task, dueDate: toDateKey(addDays(reference, -1)) };
    render(<TaskRow task={past} now={reference} onClick={vi.fn()} />);

    expect(screen.getByText(/pending/i)).toBeInTheDocument();
    expect(screen.queryByText(/hope you got it done/i)).not.toBeInTheDocument();
  });

  it('can bring a past task into today without opening the task', () => {
    const onClick = vi.fn();
    const onBringToToday = vi.fn();

    render(
      <TaskRow
        task={task}
        now={reference}
        onClick={onClick}
        onBringToToday={onBringToToday}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: new RegExp(`do ${task.title} today`, 'i') }));
    expect(onBringToToday).toHaveBeenCalledWith(task);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows a parked task as pick up again instead of pending', () => {
    const parked = {
      ...task,
      dueDate: toDateKey(addDays(reference, -2)),
      parkedAt: reference.toISOString(),
    };
    render(<TaskRow task={parked} now={reference} onClick={vi.fn()} />);

    expect(screen.getByText(/pick up again/i)).toBeInTheDocument();
    expect(screen.queryByText(/pending/i)).not.toBeInTheDocument();
  });

  it('opens check-in when the image is tapped', () => {
    const onClick = vi.fn();
    const onCheckInStart = vi.fn();
    const { container } = render(
      <TaskRow
        task={task}
        now={reference}
        onClick={onClick}
        onCheckInStart={onCheckInStart}
      />
    );

    fireEvent.click(container.querySelector('img')!);
    expect(onCheckInStart).toHaveBeenCalledWith(task);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders the image and title together for a recognised task', () => {
    const laundry = { ...task, title: 'Making laundry' };
    const { container } = render(<TaskRow task={laundry} now={reference} onClick={vi.fn()} />);

    expect(container.querySelector('img')).toBeInTheDocument();
    expect(screen.getByText('Making laundry')).toBeInTheDocument();
  });
});
