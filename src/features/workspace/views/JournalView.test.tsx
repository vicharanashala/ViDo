import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { JournalView } from './JournalView';
import { addJournalEntry, loadJournalEntries, saveEveningCheckIn } from '../../../lib/journalStore';
import { toDateKey } from '../../../data/taskDates';
import { formatDayKey } from '../../../data/journalCalendar';
import type { EveningCheckIn } from '../../../data/journalTypes';

function checkIn(overrides: Partial<EveningCheckIn> = {}): EveningCheckIn {
  return {
    dateKey: '2026-11-20',
    mood: 'stretched',
    answers: [],
    movedTaskIds: [],
    movedTaskTitles: [],
    heavyTaskIds: [],
    heavyTaskTitles: [],
    timeLog: [],
    answeredAt: '2026-11-20T22:00:00.000Z',
    ...overrides,
  };
}

function yesterdayKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
}

describe('JournalView', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('says plainly that free writing is never analysed', () => {
    render(<JournalView />);
    expect(screen.getByText(/never analysed/i)).toBeInTheDocument();
    expect(screen.getByText(/only yours/i)).toBeInTheDocument();
  });

  it('autosaves a thought with a timestamp', async () => {
    render(<JournalView />);
    fireEvent.change(screen.getByPlaceholderText(/whatever is on your mind/i), {
      target: { value: 'A quiet afternoon.' },
    });

    await waitFor(
      () => {
        const entries = loadJournalEntries(toDateKey(new Date()));
        expect(entries).toHaveLength(1);
        expect(entries[0].text).toBe('A quiet afternoon.');
        expect(entries[0].createdAt).toBeTruthy();
      },
      { timeout: 3000 }
    );
    expect(await screen.findByText(/^Saved /)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
  });

  it('flushes the thought when another day is chosen', async () => {
    render(<JournalView />);
    fireEvent.change(screen.getByPlaceholderText(/whatever is on your mind/i), {
      target: { value: 'Written on the way out.' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(`^${formatDayKey(yesterdayKey())}`) })
    );

    expect(loadJournalEntries(toDateKey(new Date()))).toHaveLength(1);
    await waitFor(() =>
      expect(screen.getByText(formatDayKey(yesterdayKey()))).toBeInTheDocument()
    );
  });

  it('shows a day’s entries with their times and supports editing', async () => {
    const today = toDateKey(new Date());
    addJournalEntry(today, 'First thought.', new Date(`${today}T09:05:00`));

    render(<JournalView />);
    expect(await screen.findByText('First thought.')).toBeInTheDocument();
    expect(screen.getByText('09:05')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /edit entry from 09:05/i }));
    expect(screen.getByPlaceholderText(/whatever is on your mind/i)).toHaveValue('First thought.');
  });

  it('deletes one entry without touching the others', async () => {
    const today = toDateKey(new Date());
    addJournalEntry(today, 'Keep me.', new Date(`${today}T09:05:00`));
    addJournalEntry(today, 'Remove me.', new Date(`${today}T10:15:00`));

    render(<JournalView />);
    fireEvent.click(await screen.findByRole('button', { name: /delete entry from 10:15/i }));

    expect(loadJournalEntries(today).map((entry) => entry.text)).toEqual(['Keep me.']);
  });

  it('deletes a whole day and clears the dot', async () => {
    const today = toDateKey(new Date());
    addJournalEntry(today, 'One.', new Date(`${today}T09:05:00`));
    addJournalEntry(today, 'Two.', new Date(`${today}T10:15:00`));

    render(<JournalView />);
    expect(
      await screen.findByRole('button', { name: `${formatDayKey(today)}, 2 entries` })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /delete this day/i }));
    expect(loadJournalEntries(today)).toEqual([]);
  });

  it('marks days with writing in the calendar', async () => {
    const today = toDateKey(new Date());
    addJournalEntry(today, 'Something.', new Date(`${today}T09:05:00`));

    render(<JournalView />);
    expect(
      await screen.findByRole('button', { name: `${formatDayKey(today)}, 1 entry` })
    ).toBeInTheDocument();
  });

  it('shows evening tags and offers an export', () => {
    saveEveningCheckIn(
      checkIn({
        note: 'Two meetings and no focus time.',
        analysis: {
          tags: [
            { label: 'meetings', count: 2 },
            { label: 'focus time', count: 1 },
          ],
          summary: 'This note mentioned meetings (2) and focus time (1).',
        },
      })
    );
    render(<JournalView />);
    expect(screen.getByText('meetings (2)')).toBeInTheDocument();
    expect(screen.getByText('This note mentioned meetings (2) and focus time (1).')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export journal/i })).toBeInTheDocument();
  });
});
