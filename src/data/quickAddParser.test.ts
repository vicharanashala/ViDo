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

  it('uses a date after “by” as the deadline', () => {
    const parsed = parseQuickAdd('Deadline Project submission by 14th December 2026', reference);

    expect(parsed.title).toBe('Project submission');
    expect(parsed.dueDate).toBe(toDateKey(reference));
    expect(parsed.deadlineDate).toBe('2026-12-14');
    expect(parsed.meta.dateLabel).toBe('14 Dec 2026');
  });

  it('treats “on <date>” as the planned task date', () => {
    const parsed = parseQuickAdd('Go out for a walk on 1st December 2026', reference);

    expect(parsed.title).toBe('Go out for a walk');
    expect(parsed.dueDate).toBe('2026-12-01');
    expect(parsed.deadlineDate).toBeUndefined();
    expect(parsed.meta.dateLabel).toBe('1 Dec 2026');
  });

  it('supports “on the 1st of December” and month-first dates', () => {
    expect(parseQuickAdd('Walk on the 1st of December', reference).dueDate).toBe('2026-12-01');
    expect(parseQuickAdd('Walk on December 1, 2026', reference).dueDate).toBe('2026-12-01');
  });

  it('treats “date is” as a deadline too', () => {
    const parsed = parseQuickAdd('Project submission date is 14th December', reference);

    expect(parsed.title).toBe('Project submission');
    expect(parsed.deadlineDate).toBe('2026-12-14');
  });

  it('handles month-first dates and dates without a year', () => {
    expect(parseQuickAdd('Submit report by December 14, 2026', reference).deadlineDate).toBe('2026-12-14');
    expect(parseQuickAdd('Submit report by 14th December', reference).deadlineDate).toBe('2026-12-14');
    expect(parseQuickAdd('Renew by 1st January', reference).deadlineDate).toBe('2027-01-01');
  });

  it('strips “by” from relative dates too', () => {
    const parsed = parseQuickAdd('Call mom by tomorrow', reference);

    expect(parsed.title).toBe('Call mom');
    expect(parsed.dueDate).toBe(toDateKey(addDays(reference, 1)));
  });

  it('returns an empty title when the input is only metadata', () => {
    const parsed = parseQuickAdd('tomorrow 5pm', reference);
    expect(parsed.title).toBe('');
    expect(parsed.dueTime).toBe('17:00');
  });
});
