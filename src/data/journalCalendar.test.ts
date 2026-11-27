import { describe, expect, it } from 'vitest';
import { addMonths, groupDaysByEntries, monthMatrix, monthOf } from './journalCalendar';

describe('monthMatrix', () => {
  it('builds Monday-first weeks with neighbouring days shaded out', () => {
    const month = monthMatrix(new Date(2026, 10, 15));
    expect(month.label).toBe('November 2026');
    expect(month.weeks).toHaveLength(6);

    const cells = month.weeks.flat();
    expect(cells).toHaveLength(42);
    expect(cells[0]).toMatchObject({ dateKey: '2026-10-26', day: 26, inMonth: false });
    expect(cells.find((cell) => cell.dateKey === '2026-11-01')).toMatchObject({
      day: 1,
      inMonth: true,
    });
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(30);
    expect(cells[cells.length - 1].dateKey).toBe('2026-12-06');
  });

  it('handles a short month that starts on Sunday', () => {
    const month = monthMatrix(new Date(2026, 1, 10));
    expect(month.label).toBe('February 2026');
    const cells = month.weeks.flat();
    expect(cells[0]).toMatchObject({ dateKey: '2026-01-26', inMonth: false });
    expect(cells.filter((cell) => cell.inMonth)).toHaveLength(28);
    expect(cells[cells.length - 1].dateKey).toBe('2026-03-01');
  });
});

describe('addMonths and monthOf', () => {
  it('pages across a year boundary', () => {
    const december = new Date(2026, 11, 1);
    expect(monthMatrix(addMonths(december, 1)).label).toBe('January 2027');
    expect(monthMatrix(addMonths(december, -1)).label).toBe('November 2026');
  });

  it('returns the first of the month for a stored day key', () => {
    const month = monthOf('2026-11-27');
    expect(month.getFullYear()).toBe(2026);
    expect(month.getMonth()).toBe(10);
    expect(month.getDate()).toBe(1);
  });
});

describe('groupDaysByEntries', () => {
  it('counts entries per day', () => {
    expect(
      groupDaysByEntries([
        { dateKey: '2026-11-20' },
        { dateKey: '2026-11-20' },
        { dateKey: '2026-11-18' },
      ])
    ).toEqual({ '2026-11-20': 2, '2026-11-18': 1 });
  });
});
