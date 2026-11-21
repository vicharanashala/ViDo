/**
 * Pure deadline rules for task creation.
 *
 * - Past dates are allowed only within a 7-day grace period (for logging
 *   work that started before the task was created).
 * - Deadline time is optional and defaults to end of day (23:59).
 * - A deadline set for today must be later than the creation time.
 * - Future dates accept any time of day.
 *
 * All dates are local calendar dates (`YYYY-MM-DD`) and times are `HH:mm`.
 */

export const GRACE_PERIOD_DAYS = 7;
export const END_OF_DAY_TIME = '23:59';

export const DEADLINE_TIME_ERROR = 'Deadline must be later than start time';
export const DEADLINE_DATE_ERROR = `Pick a date within the last ${GRACE_PERIOD_DAYS} days or later`;

export type DeadlineErrorCode = 'date-too-old' | 'time-not-later';

export interface DeadlineValidation {
  valid: boolean;
  code?: DeadlineErrorCode;
  message?: string;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/** Local calendar date of `date` as `YYYY-MM-DD`. */
export function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local clock time of `date` as `HH:mm`. */
export function toTimeStr(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** `dateStr` shifted by a whole number of calendar days (DST-safe). */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return toDateStr(new Date(y, m - 1, d + days));
}

/** Earliest selectable deadline date: today minus the grace period. */
export function getEarliestDeadlineDate(now: Date): string {
  return addDaysToDateStr(toDateStr(now), -GRACE_PERIOD_DAYS);
}

/** Deadline time to store: the chosen time, or end of day when omitted. */
export function resolveDueTime(dueTime?: string): string {
  return dueTime && dueTime.trim() ? dueTime : END_OF_DAY_TIME;
}

/**
 * Earliest allowed deadline time for `dateStr`, as minutes since midnight.
 * Only today is restricted: the deadline must be strictly later than `now`
 * at minute precision, so the earliest choice is the next whole minute.
 * Returns `undefined` when every time of day is allowed.
 */
export function getMinDeadlineMinutes(dateStr: string, now: Date): number | undefined {
  if (dateStr !== toDateStr(now)) return undefined;
  return now.getHours() * 60 + now.getMinutes() + 1;
}

/** Same as `getMinDeadlineMinutes`, formatted `HH:mm` (undefined if unrestricted or past midnight). */
export function getMinDeadlineTime(dateStr: string, now: Date): string | undefined {
  const minutes = getMinDeadlineMinutes(dateStr, now);
  if (minutes === undefined) return undefined;
  const clamped = Math.min(minutes, 24 * 60 - 1);
  return `${pad(Math.floor(clamped / 60))}:${pad(clamped % 60)}`;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function validateDeadline(input: {
  dueDate: string;
  dueTime?: string;
  now: Date;
}): DeadlineValidation {
  const { dueDate, dueTime, now } = input;

  if (dueDate < getEarliestDeadlineDate(now)) {
    return { valid: false, code: 'date-too-old', message: DEADLINE_DATE_ERROR };
  }

  // No time chosen means end of day, which is always acceptable.
  if (!dueTime || !dueTime.trim()) return { valid: true };

  const min = getMinDeadlineMinutes(dueDate, now);
  if (min !== undefined && timeToMinutes(dueTime) < min) {
    return { valid: false, code: 'time-not-later', message: DEADLINE_TIME_ERROR };
  }

  return { valid: true };
}
