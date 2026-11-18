import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeCard } from './WelcomeCard';

describe('WelcomeCard', () => {
  it('saves a name and allows skipping', () => {
    const onSave = vi.fn();
    render(<WelcomeCard onSave={onSave} />);

    expect(screen.getByRole('heading', { name: /make yourself at home/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/prefix/i), { target: { value: 'Ms.' } });
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Asha' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(onSave).toHaveBeenCalledWith({ prefix: 'Ms.', name: 'Asha' });

    fireEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    expect(onSave).toHaveBeenCalledWith({ prefix: '', name: '' });
  });
});
