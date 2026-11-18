import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from './HelpModal';

describe('HelpModal', () => {
  it('explains the views, check-in, keyboard, and images', () => {
    const onClose = vi.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);

    expect(screen.getByRole('heading', { name: /how vido works/i })).toBeInTheDocument();
    expect(screen.getByText(/^past$/i)).toBeInTheDocument();
    expect(screen.getByText(/drag a task image/i)).toBeInTheDocument();
    expect(screen.getByText(/images are visual anchors/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
