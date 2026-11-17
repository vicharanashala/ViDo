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

  it('returns an empty title when the input is only metadata', () => {
    const parsed = parseQuickAdd('tomorrow 5pm', reference);
    expect(parsed.title).toBe('');
    expect(parsed.dueTime).toBe('17:00');
  });
});
