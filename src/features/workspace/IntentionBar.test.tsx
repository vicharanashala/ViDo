import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntentionBar } from './IntentionBar';

describe('IntentionBar', () => {
  it('saves a daily intention with the button or Enter', () => {
    const onSave = vi.fn();
    render(<IntentionBar value="" onSave={onSave} />);

    const input = screen.getByLabelText(/daily intention/i);
    fireEvent.change(input, { target: { value: 'Move slowly.' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(onSave).toHaveBeenCalledWith('Move slowly.');

    fireEvent.change(input, { target: { value: 'Finish one thing.' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSave).toHaveBeenCalledWith('Finish one thing.');
  });
});
