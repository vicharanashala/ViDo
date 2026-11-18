import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProfileView } from './ProfileView';

describe('ProfileView', () => {
  it('edits and saves the prefix and name', () => {
    const onSave = vi.fn();
    render(<ProfileView prefix="Ms." name="Asha" onSave={onSave} />);

    expect(screen.getByRole('heading', { name: /ms\. asha/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^prefix$/i), { target: { value: 'Dr.' } });
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: 'Asha Rao' } });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(onSave).toHaveBeenCalledWith({ prefix: 'Dr.', name: 'Asha Rao' });
    expect(screen.getByRole('status')).toHaveTextContent(/profile saved/i);
  });
});
