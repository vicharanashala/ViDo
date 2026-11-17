import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickAdd } from './QuickAdd';

describe('QuickAdd', () => {
  it('captures a plain task with one field and clears the input', () => {
    const handleAdd = vi.fn();
    render(<QuickAdd onAdd={handleAdd} />);

    const input = screen.getByLabelText(/new task title/i);
    fireEvent.change(input, { target: { value: 'Buy milk' } });
    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Buy milk',
        priority: 'medium',
        category: 'personal',
      })
    );
    expect(input).toHaveValue('');
  });

  it('parses a natural-language sentence and previews the result', () => {
    const handleAdd = vi.fn();
    render(<QuickAdd onAdd={handleAdd} />);

    const input = screen.getByLabelText(/new task title/i);
    fireEvent.change(input, {
      target: { value: 'Renew insurance tomorrow 5pm !high #home' },
    });

    expect(screen.getByText('Tomorrow')).toBeInTheDocument();
    expect(screen.getByText('17:00')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();

    fireEvent.submit(input.closest('form')!);

    expect(handleAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Renew insurance',
        dueTime: '17:00',
        priority: 'high',
        category: 'home',
      })
    );
  });

  it('does not submit an empty title', () => {
    const handleAdd = vi.fn();
    render(<QuickAdd onAdd={handleAdd} />);

    fireEvent.submit(screen.getByLabelText(/new task title/i).closest('form')!);
    expect(handleAdd).not.toHaveBeenCalled();
  });
});
