import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('switches between system, day and night', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /system/i })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /night/i }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('vido.theme.v1')).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: /day/i }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });
});
