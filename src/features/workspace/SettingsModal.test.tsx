import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';

describe('SettingsModal', () => {
  it('renders modal dialog when isOpen is true', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /^settings$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /theme & appearance/i })).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<SettingsModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking close X button', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /close settings/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking Close button in modal footer', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    const footerCloseBtn = screen.getByRole('button', { name: /^close$/i });
    fireEvent.click(footerCloseBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when pressing Escape key', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop overlay', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    const dialogBackdrop = screen.getByRole('dialog');
    fireEvent.click(dialogBackdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the modal content', () => {
    const handleClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={handleClose} />);

    const heading = screen.getByRole('heading', { name: /^settings$/i });
    fireEvent.click(heading);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('switches sections inside popup dialog', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} initialSection="account" />);

    expect(screen.getByRole('heading', { name: /profile & identity/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /theme & appearance/i }));
    expect(screen.getByRole('heading', { name: /appearance & themes/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /preferences/i }));
    expect(screen.getByRole('heading', { name: /task & planning preferences/i })).toBeInTheDocument();
  });
});
