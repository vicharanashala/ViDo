import { addDays, parseDateKey, startOfDay, toDateKey } from './taskDates';

export interface CalendarCell {
  dateKey: string;
  day: number;
  inMonth: boolean;
}

export interface CalendarMonth {
  year: number;
  month: number;
  label: string;
  weeks: CalendarCell[][];
}

export const WEEKDAY_INITIALS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Format a stored `YYYY-MM-DD` key as `DD-MM-YYYY` without touching the shared date helpers. */
export function formatDayKey(dateKey: string): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  const date = parseDateKey(dateKey);
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
}

export function monthLabel(reference: Date): string {
  return reference.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function startOfMonth(reference: Date): Date {
  return new Date(reference.getFullYear(), reference.getMonth(), 1);
}

export function addMonths(reference: Date, delta: number): Date {
  return new Date(reference.getFullYear(), reference.getMonth() + delta, 1);
}

/** Monday-first weeks covering the whole month, with neighbouring days shaded out. */
export function monthMatrix(reference: Date): CalendarMonth {
  const first = startOfMonth(reference);
  const mondayOffset = (first.getDay() + 6) % 7;
  const gridStart = addDays(first, -mondayOffset);
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weekCount = Math.ceil((mondayOffset + daysInMonth) / 7);

  const weeks: CalendarCell[][] = [];
  for (let week = 0; week < weekCount; week += 1) {
    const cells: CalendarCell[] = [];
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = addDays(gridStart, week * 7 + weekday);
      cells.push({
        dateKey: toDateKey(date),
        day: date.getDate(),
        inMonth: date.getMonth() === first.getMonth(),
      });
    }
    weeks.push(cells);
  }

  return {
    year: first.getFullYear(),
    month: first.getMonth(),
    label: monthLabel(first),
    weeks,
  };
}

export function groupDaysByEntries(entries: { dateKey: string }[]): Record<string, number> {
  return entries.reduce<Record<string, number>>((days, entry) => {
    days[entry.dateKey] = (days[entry.dateKey] ?? 0) + 1;
    return days;
  }, {});
}

export function monthOf(dateKey: string): Date {
  return startOfMonth(startOfDay(parseDateKey(dateKey)));
}
