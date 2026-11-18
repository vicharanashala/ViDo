import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { QuickAdd } from './QuickAdd';

describe('QuickAdd', () => {
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
