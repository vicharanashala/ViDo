import { describe, expect, it } from 'vitest';
import { parseQuickAdd } from './quickAddParser';
import { addDays, toDateKey } from './taskDates';

const reference = new Date(2026, 10, 17, 12, 0, 0);

describe('parseQuickAdd', () => {
  it('parses date, time, priority, and category from a sentence', () => {
    const parsed = parseQuickAdd('Renew insurance tomorrow 5pm !high #home', reference);

    expect(parsed.title).toBe('Renew insurance');
    expect(parsed.dueDate).toBe(toDateKey(addDays(reference, 1)));
    expect(parsed.dueTime).toBe('17:00');
    expect(parsed.priority).toBe('high');
    expect(parsed.category).toBe('home');
    expect(parsed.meta.dateLabel).toBe('Tomorrow');
    expect(parsed.meta.timeLabel).toBe('17:00');
  });

  it('uses calm defaults for a plain title', () => {
    const parsed = parseQuickAdd('Buy milk', reference);

    expect(parsed.title).toBe('Buy milk');
    expect(parsed.dueDate).toBe(toDateKey(reference));
    expect(parsed.dueTime).toBeUndefined();
    expect(parsed.priority).toBe('medium');
    expect(parsed.category).toBe('personal');
    expect(parsed.meta).toEqual({});
  });

  it('handles 24-hour times and low priority', () => {
    const parsed = parseQuickAdd('Write report 17:00 !low #work', reference);

    expect(parsed.dueTime).toBe('17:00');
    expect(parsed.priority).toBe('low');
    expect(parsed.category).toBe('work');
    expect(parsed.title).toBe('Write report');
  });

  it('does not infer priority from ordinary words', () => {
    const parsed = parseQuickAdd('Review high school budget', reference);
    expect(parsed.title).toBe('Review high school budget');
    expect(parsed.priority).toBe('medium');
  });

  it('calculates a relative due time and keeps the task duration', () => {
    const parsed = parseQuickAdd('Walking for 15 min in 45 min', reference);

    expect(parsed.title).toBe('Walking for 15 min');
    expect(parsed.dueDate).toBe(toDateKey(reference));
    expect(parsed.dueTime).toBe('12:45');
    expect(parsed.meta.timeLabel).toBe('12:45');
    expect(parsed.meta.dateLabel).toBeUndefined();
  });

  it('handles relative hours, words, and crossings into tomorrow', () => {
    expect(parseQuickAdd('Stretch in 2 hours', reference).dueTime).toBe('14:00');
    expect(parseQuickAdd('Call mom within 20 minutes', reference).dueTime).toBe('12:20');
    expect(parseQuickAdd('Take a break in an hour', reference).dueTime).toBe('13:00');

    const late = new Date(2026, 10, 17, 23, 30, 0);
    const parsed = parseQuickAdd('Sleep in 90 min', late);
    expect(parsed.dueDate).toBe(toDateKey(addDays(late, 1)));
    expect(parsed.dueTime).toBe('01:00');
    expect(parsed.meta.dateLabel).toBe('Tomorrow');
  });

  it('returns an empty title when the input is only metadata', () => {
    const parsed = parseQuickAdd('tomorrow 5pm', reference);
    expect(parsed.title).toBe('');
    expect(parsed.dueTime).toBe('17:00');
  });
});
