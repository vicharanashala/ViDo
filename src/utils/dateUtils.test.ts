import { describe, it, expect } from 'vitest';
import {
  getTodayDateString,
  getSevenDaysAgoDateString,
  getCurrentTimeString,
  getDefaultDueTime,
  validateDeadline,
  validateChronologicalDeadline,
} from './dateUtils';

describe('dateUtils', () => {
  const mockNow = new Date('2026-11-19T18:00:00'); // 6:00 PM on Nov 19, 2026

  it('formats current date, 7 days ago date, and time correctly', () => {
    expect(getTodayDateString(mockNow)).toBe('2026-11-19');
    expect(getSevenDaysAgoDateString(mockNow)).toBe('2026-11-12');
    expect(getCurrentTimeString(mockNow)).toBe('18:00');
    expect(getDefaultDueTime(mockNow)).toBe('19:00');
  });

  it('caps default due time at 23:59 if 1 hour later rolls into the next day', () => {
    const lateNight = new Date('2026-11-19T23:45:00');
    expect(getDefaultDueTime(lateNight)).toBe('23:59');
  });

  describe('validateChronologicalDeadline', () => {
    describe('Default (Current) Creation Timestamp & Same-Day Validation', () => {
      it('records exact current time as createdAt when not backdated', () => {
        const res = validateChronologicalDeadline({
          dueDate: '2026-11-20',
          now: mockNow,
        });
        expect(res.isValid).toBe(true);
        expect(res.effectiveCreatedAt).toBe(mockNow.toISOString());
      });

      it('blocks setting deadline on a past date without backdating', () => {
        const res = validateChronologicalDeadline({
          dueDate: '2026-11-18', // Yesterday
          now: mockNow,
        });
        expect(res.isValid).toBe(false);
        expect(res.dateError).toMatch(/deadline date must be on or after start date/i);
      });

      it('same-day: blocks selecting deadline time earlier than or equal to current time (6:00 PM)', () => {
        // 5:00 PM (17:00) is before 6:00 PM
        const resEarly = validateChronologicalDeadline({
          dueDate: '2026-11-19',
          dueTime: '17:00',
          now: mockNow,
        });
        expect(resEarly.isValid).toBe(false);
        expect(resEarly.timeError).toMatch(/deadline time must be after the start time/i);

        // Exactly 6:00 PM (18:00) is also not after 6:00 PM
        const resSame = validateChronologicalDeadline({
          dueDate: '2026-11-19',
          dueTime: '18:00',
          now: mockNow,
        });
        expect(resSame.isValid).toBe(false);
        expect(resSame.timeError).toMatch(/deadline time must be after the start time/i);
      });

      it('same-day: accepts deadline time strictly after current time (e.g. 6:30 PM)', () => {
        const res = validateChronologicalDeadline({
          dueDate: '2026-11-19',
          dueTime: '18:30',
          now: mockNow,
        });
        expect(res.isValid).toBe(true);
        expect(res.effectiveDueTime).toBe('18:30');
      });

      it('same-day: defaults to 11:59 PM (23:59) when no end time is selected', () => {
        const res = validateChronologicalDeadline({
          dueDate: '2026-11-19',
          dueTime: '',
          now: mockNow,
        });
        expect(res.isValid).toBe(true);
        expect(res.effectiveDueTime).toBe('23:59');
      });

      it('future date: allows any valid time of day on dates after today', () => {
        // Tomorrow at 08:00 AM should be completely valid even though 08:00 is earlier than 18:00
        const res = validateChronologicalDeadline({
          dueDate: '2026-11-20',
          dueTime: '08:00',
          now: mockNow,
        });
        expect(res.isValid).toBe(true);
        expect(res.effectiveDueDate).toBe('2026-11-20');
        expect(res.effectiveDueTime).toBe('08:00');
      });
    });

    describe('7-Day Grace Period & Backdating', () => {
      it('allows backdating start date up to 7 days in the past (boundary check: exactly 7 days ago)', () => {
        // Nov 12 is exactly 7 days before Nov 19
        const res = validateChronologicalDeadline({
          startDate: '2026-11-12',
          dueDate: '2026-11-13',
          dueTime: '17:00',
          now: mockNow,
        });
        expect(res.isValid).toBe(true);
        expect(res.effectiveCreatedAt).toBe(new Date('2026-11-12T12:00:00').toISOString());
      });

      it('blocks start dates older than 7 days in the past (boundary check: 8 days ago)', () => {
        // Nov 11 is 8 days before Nov 19
        const resStart = validateChronologicalDeadline({
          startDate: '2026-11-11',
          dueDate: '2026-11-19',
          now: mockNow,
        });
        expect(resStart.isValid).toBe(false);
        expect(resStart.startError).toMatch(/start date cannot be older than 7 days/i);

        // Same for deadline date older than 7 days
        const resDue = validateChronologicalDeadline({
          dueDate: '2026-11-11',
          now: mockNow,
        });
        expect(resDue.isValid).toBe(false);
        expect(resDue.dateError).toMatch(/7-day logging window/i);
      });

      it('blocks start date in the future', () => {
        const res = validateChronologicalDeadline({
          startDate: '2026-11-20',
          dueDate: '2026-11-21',
          now: mockNow,
        });
        expect(res.isValid).toBe(false);
        expect(res.startError).toMatch(/start date cannot be in the future/i);
      });

      it('enforces deadline date scheduled on or after start date (deadline >= startDate)', () => {
        // Started 3 days ago (Nov 16), deadline scheduled 4 days ago (Nov 15) -> blocked
        const resDateBefore = validateChronologicalDeadline({
          startDate: '2026-11-16',
          dueDate: '2026-11-15',
          now: mockNow,
        });
        expect(resDateBefore.isValid).toBe(false);
        expect(resDateBefore.dateError).toMatch(/deadline date must be on or after start date/i);

        // Started 3 days ago (Nov 16), deadline scheduled on same day (Nov 16) -> valid
        const resSameDay = validateChronologicalDeadline({
          startDate: '2026-11-16',
          dueDate: '2026-11-16',
          dueTime: '15:00',
          now: mockNow,
        });
        expect(resSameDay.isValid).toBe(true);

        // Started 3 days ago (Nov 16), deadline scheduled in future relative to start (Nov 18) -> valid
        const resMultiDay = validateChronologicalDeadline({
          startDate: '2026-11-16',
          dueDate: '2026-11-18',
          now: mockNow,
        });
        expect(resMultiDay.isValid).toBe(true);
      });
    });

    describe('Empty or Missing Fields', () => {
      it('rejects empty due date', () => {
        const res = validateChronologicalDeadline({
          dueDate: '',
          now: mockNow,
        });
        expect(res.isValid).toBe(false);
        expect(res.dateError).toMatch(/required/i);
      });
    });
  });

  describe('validateDeadline (legacy compatibility)', () => {
    it('delegates properly to chronological validator', () => {
      const resValid = validateDeadline('2026-11-20', '10:00', mockNow);
      expect(resValid.isValid).toBe(true);

      const resPast = validateDeadline('2026-11-18', '10:00', mockNow);
      expect(resPast.isValid).toBe(false);
    });
  });
});
