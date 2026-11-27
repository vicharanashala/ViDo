import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DailyQuote } from './DailyQuote';
import { dailyQuote } from '../../data/quotes';

describe('DailyQuote', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('shows the quote of the day and lets the person write their own', () => {
    render(<DailyQuote dateKey="2026-11-28" />);
    expect(screen.getByText(dailyQuote('2026-11-28'))).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /write your own quote/i }));
    fireEvent.change(screen.getByLabelText(/your quote/i), {
      target: { value: 'Be where your feet are.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /keep it/i }));

    expect(screen.getByText('Be where your feet are.')).toBeInTheDocument();
    expect(window.localStorage.getItem('vido.quote.2026-11-28')).toBe('Be where your feet are.');
  });

  it('can go back to the quote of the day', () => {
    window.localStorage.setItem('vido.quote.2026-11-28', 'Mine.');
    render(<DailyQuote dateKey="2026-11-28" />);
    expect(screen.getByText('Mine.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /write your own quote/i }));
    fireEvent.click(screen.getByRole('button', { name: /today's quote/i }));

    expect(screen.getByText(dailyQuote('2026-11-28'))).toBeInTheDocument();
    expect(window.localStorage.getItem('vido.quote.2026-11-28')).toBeNull();
  });
});
