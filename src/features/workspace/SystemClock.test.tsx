import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemClock } from './SystemClock';

describe('SystemClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 18, 21, 42, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the current system time', () => {
    render(<SystemClock />);
    expect(screen.getByText('21:42')).toBeInTheDocument();
    expect(screen.getByText('Wednesday, 18 November 2026')).toBeInTheDocument();
    expect(screen.getByText(/right now/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/system time: Wednesday, 18 November 2026 21:42/i)).toBeInTheDocument();
  });

  it('updates when the clock moves forward', () => {
    render(<SystemClock />);
    vi.advanceTimersByTime(1000);
    expect(screen.getByText('21:42')).toBeInTheDocument();
  });
});
