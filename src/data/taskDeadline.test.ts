import { describe, it, expect } from 'vitest';
import {
  END_OF_DAY_TIME,
  DEADLINE_TIME_ERROR,
  addDaysToDateStr,
  getEarliestDeadlineDate,
  getMinDeadlineMinutes,
  getMinDeadlineTime,
  resolveDueTime,
  toDateStr,
  toTimeStr,
  validateDeadline,
} from './taskDeadline';

// Thursday 19 November 2026, 18:00:30 local time
const NOW = new Date(2026, 10, 19, 18, 0, 30);

describe('taskDeadline', () => {
  describe('formatting helpers', () => {
    it('formats local date and time with zero padding', () => {
      const d = new Date(2026, 0, 5, 7, 4);
      expect(toDateStr(d)).toBe('2026-01-05');
      expect(toTimeStr(d)).toBe('07:04');
    });

    it('shifts dates across month and year boundaries', () => {
      expect(addDaysToDateStr('2026-03-01', -1)).toBe('2026-02-28');
      expect(addDaysToDateStr('2027-01-03', -7)).toBe('2026-12-27');
      expect(addDaysToDateStr('2026-12-31', 1)).toBe('2027-01-01');
    });
  });

  describe('grace period', () => {
    it('allows dates back to exactly 7 days before today', () => {
      expect(getEarliestDeadlineDate(NOW)).toBe('2026-11-12');
    });

    it('crosses month and year boundaries', () => {
      expect(getEarliestDeadlineDate(new Date(2026, 2, 3, 9, 0))).toBe('2026-02-24');
      expect(getEarliestDeadlineDate(new Date(2027, 0, 3, 9, 0))).toBe('2026-12-27');
    });

    it('accepts the last allowed day and rejects the day before', () => {
      expect(validateDeadline({ dueDate: '2026-11-12', now: NOW }).valid).toBe(true);
      const tooOld = validateDeadline({ dueDate: '2026-11-11', now: NOW });
      expect(tooOld.valid).toBe(false);
      expect(tooOld.code).toBe('date-too-old');
    });

    it('accepts any time on a backdated date', () => {
      expect(validateDeadline({ dueDate: '2026-11-15', dueTime: '00:00', now: NOW }).valid).toBe(true);
      expect(validateDeadline({ dueDate: '2026-11-18', dueTime: '09:30', now: NOW }).valid).toBe(true);
    });
  });

  describe('same-day deadline', () => {
    it('rejects a time earlier than the creation time', () => {
      const result = validateDeadline({ dueDate: '2026-11-19', dueTime: '16:00', now: NOW });
      expect(result.valid).toBe(false);
      expect(result.code).toBe('time-not-later');
      expect(result.message).toBe(DEADLINE_TIME_ERROR);
    });

    it('rejects the current minute but accepts the next one', () => {
      expect(validateDeadline({ dueDate: '2026-11-19', dueTime: '18:00', now: NOW }).valid).toBe(false);
      expect(validateDeadline({ dueDate: '2026-11-19', dueTime: '18:01', now: NOW }).valid).toBe(true);
    });

    it('exposes the earliest allowed time for today only', () => {
      expect(getMinDeadlineMinutes('2026-11-19', NOW)).toBe(18 * 60 + 1);
      expect(getMinDeadlineTime('2026-11-19', NOW)).toBe('18:01');
      expect(getMinDeadlineTime('2026-11-20', NOW)).toBeUndefined();
      expect(getMinDeadlineTime('2026-11-15', NOW)).toBeUndefined();
    });

    it('handles the last minute of the day', () => {
      const late = new Date(2026, 10, 19, 23, 59, 10);
      expect(getMinDeadlineTime('2026-11-19', late)).toBe('23:59');
      // An explicit 23:59 is no longer "later", but omitting the time still is fine.
      expect(validateDeadline({ dueDate: '2026-11-19', dueTime: '23:59', now: late }).valid).toBe(false);
      expect(validateDeadline({ dueDate: '2026-11-19', now: late }).valid).toBe(true);
    });
  });

  describe('future dates and optional time', () => {
    it('allows every time of day on a future date', () => {
      expect(validateDeadline({ dueDate: '2026-11-20', dueTime: '00:00', now: NOW }).valid).toBe(true);
      expect(validateDeadline({ dueDate: '2027-02-01', dueTime: '06:15', now: NOW }).valid).toBe(true);
    });

    it('treats an omitted or blank time as valid, even today', () => {
      expect(validateDeadline({ dueDate: '2026-11-19', now: NOW }).valid).toBe(true);
      expect(validateDeadline({ dueDate: '2026-11-19', dueTime: '', now: NOW }).valid).toBe(true);
      expect(validateDeadline({ dueDate: '2026-11-19', dueTime: '  ', now: NOW }).valid).toBe(true);
    });

    it('resolves a missing time to end of day', () => {
      expect(END_OF_DAY_TIME).toBe('23:59');
      expect(resolveDueTime()).toBe('23:59');
      expect(resolveDueTime('')).toBe('23:59');
      expect(resolveDueTime('09:15')).toBe('09:15');
    });
  });
});
