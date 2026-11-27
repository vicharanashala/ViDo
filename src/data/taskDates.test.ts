import { describe, expect, it } from 'vitest';
import {
  formatDateKey,
  formatDateLong,
  formatDateShort,
  formatDateTime,
  formatTimeLabel,
  relativeDayLabel,
} from './taskDates';

describe('formatTimeLabel', () => {
  it('shows 24-hour values in a 12-hour label', () => {
    expect(formatTimeLabel('20:30')).toBe('8:30 PM');
    expect(formatTimeLabel('08:05')).toBe('8:05 AM');
    expect(formatTimeLabel('00:15')).toBe('12:15 AM');
    expect(formatTimeLabel('12:00')).toBe('12:00 PM');
  });

  it('returns empty for missing values and passes odd values through', () => {
    expect(formatTimeLabel('')).toBe('');
    expect(formatTimeLabel(undefined)).toBe('');
    expect(formatTimeLabel('later')).toBe('later');
  });
});

describe('date formatting uses dd-mm-yyyy', () => {
  const sample = new Date(2026, 10, 27, 20, 30);

  it('formats the long label with weekday and numeric date', () => {
    expect(formatDateLong(sample)).toBe('Friday, 27-11-2026');
  });

  it('formats short dates and stored keys numerically', () => {
    expect(formatDateShort(sample)).toBe('27-11-2026');
    expect(formatDateKey('2026-11-09')).toBe('09-11-2026');
  });

  it('formats date-time values numerically with 24-hour time', () => {
    expect(formatDateTime(sample.toISOString())).toBe('27-11-2026, 20:30');
  });

  it('falls back to dd-mm-yyyy for non-relative days', () => {
    expect(relativeDayLabel('2026-11-27', new Date(2026, 0, 1))).toBe('27-11-2026');
    expect(relativeDayLabel('2026-11-27', sample)).toBe('Today');
  });
});
