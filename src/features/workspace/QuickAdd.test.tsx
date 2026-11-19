import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuickAdd } from './QuickAdd';

describe('QuickAdd', () => {
  it('keeps the calendar available before typing', () => {
    render(<QuickAdd onAdd={vi.fn()} />);

    expect(screen.getByText(/^calendar$/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/priority/i)).not.toBeInTheDocument();
  });

  it('calculates “in 45 min” into the deadline time', () => {
    const onAdd = vi.fn();
    render(<QuickAdd onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/new task title/i), {
      target: { value: 'Walking for 15 min in 45 min' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Walking for 15 min',
        dueTime: expect.stringMatching(/^\d{2}:\d{2}$/),
      })
    );
  });

  it('lets the user choose priority while adding a task', () => {
    const onAdd = vi.fn();
    render(<QuickAdd onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/new task title/i), {
      target: { value: 'Buy milk' },
    });
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: 'high' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Buy milk', priority: 'high' })
    );
  });

  it('lets the user pick a deadline from the calendar without typing it', () => {
    const onAdd = vi.fn();
    render(<QuickAdd onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/new task title/i), {
      target: { value: 'Project submission' },
    });
    fireEvent.change(screen.getByLabelText(/deadline date/i), {
      target: { value: '2026-12-14' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Project submission', deadlineDate: '2026-12-14' })
    );
  });

  it('can repeat the task until its deadline', () => {
    const onAdd = vi.fn();
    render(<QuickAdd onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/new task title/i), {
      target: { value: 'Daily practice' },
    });
    fireEvent.change(screen.getByLabelText(/deadline date/i), {
      target: { value: '2026-12-14' },
    });
    fireEvent.change(screen.getByLabelText(/repeat until deadline/i), {
      target: { value: 'daily' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Daily practice',
        deadlineDate: '2026-12-14',
        recurrence: 'daily',
      })
    );
  });

  it('still reads priority from the sentence when set to auto', () => {
    const onAdd = vi.fn();
    render(<QuickAdd onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText(/new task title/i), {
      target: { value: 'Buy milk !low' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Buy milk', priority: 'low' })
    );
  });
});
