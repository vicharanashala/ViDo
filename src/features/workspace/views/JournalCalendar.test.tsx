import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { JournalCalendar } from './JournalCalendar';
import { toDateKey } from '../../../data/taskDates';

describe('JournalCalendar', () => {
  it('shows the month, marks days that hold writing, and selects a day', () => {
    const onSelect = vi.fn();
    render(
      <JournalCalendar
        selectedDateKey="2026-11-27"
        daysWithEntries={{ '2026-11-26': 2 }}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText('November 2026')).toBeInTheDocument();
    const marked = screen.getByRole('button', { name: '26-11-2026, 2 entries' });
    fireEvent.click(marked);
    expect(onSelect).toHaveBeenCalledWith('2026-11-26');

    expect(screen.getByRole('button', { name: '27-11-2026' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('pages months and returns to today', () => {
    const onSelect = vi.fn();
    render(
      <JournalCalendar selectedDateKey="2026-11-27" daysWithEntries={{}} onSelect={onSelect} />
    );

    fireEvent.click(screen.getByRole('button', { name: /next month/i }));
    expect(screen.getByText('December 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous month/i }));
    expect(screen.getByText('November 2026')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^today$/i }));
    expect(onSelect).toHaveBeenCalledWith(toDateKey(new Date()));
  });
});
