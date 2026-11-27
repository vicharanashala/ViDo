import { describe, it, expect } from 'vitest';
import { parseRRuleForUI, formatRecurrenceLabel, formatTaskDate } from './recurrence';

describe('recurrence utilities', () => {
  it('parses RRULE for weekly weekdays', () => {
    const parsed = parseRRuleForUI('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR');
    expect(parsed.freq).toBe('week');
    expect(parsed.interval).toBe(1);
    expect(parsed.byDay).toEqual(['MO', 'TU', 'WE', 'TH', 'FR']);
    expect(parsed.ends).toBe('never');
  });

  it('formats recurrence label for daily and weekday rules', () => {
    expect(formatRecurrenceLabel('FREQ=DAILY;INTERVAL=1')).toBe('Daily');
    expect(formatRecurrenceLabel('FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR')).toBe('Weekdays (Mon–Fri)');
    expect(formatRecurrenceLabel('FREQ=MONTHLY;INTERVAL=1')).toBe('Monthly');
    expect(formatRecurrenceLabel('FREQ=YEARLY;INTERVAL=1')).toBe('Yearly');
  });

  it('formats task date correctly with reference date', () => {
    const today = formatTaskDate('2026-11-17', '16:00', '2026-11-17');
    expect(today.isToday).toBe(true);
    expect(today.isOverdue).toBe(false);
    expect(today.label).toContain('Today');

    const overdue = formatTaskDate('2026-11-10', '12:00', '2026-11-17');
    expect(overdue.isOverdue).toBe(true);
  });
});
