import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  WEEKDAY_INITIALS,
  addMonths,
  formatDayKey,
  monthMatrix,
  monthOf,
} from '../../../data/journalCalendar';
import { toDateKey } from '../../../data/taskDates';

export interface JournalCalendarProps {
  selectedDateKey: string;
  daysWithEntries: Record<string, number>;
  onSelect: (dateKey: string) => void;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({
  selectedDateKey,
  daysWithEntries,
  onSelect,
}) => {
  const [cursor, setCursor] = useState(() => monthOf(selectedDateKey));

  useEffect(() => {
    setCursor(monthOf(selectedDateKey));
  }, [selectedDateKey]);

  const month = monthMatrix(cursor);
  const todayKey = toDateKey(new Date());

  return (
    <section aria-label="Journal calendar" className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5">
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-[var(--ink)]">{month.label}</span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-y-1 gap-x-0.5 text-center">
        {WEEKDAY_INITIALS.map((day) => (
          <span key={day} className="text-[9px] uppercase tracking-wide font-bold text-[var(--faint)]">
            {day.slice(0, 2)}
          </span>
        ))}
        {month.weeks.flat().map((cell) => {
          const count = daysWithEntries[cell.dateKey] ?? 0;
          const selected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayKey;
          return (
            <button
              key={cell.dateKey}
              type="button"
              aria-pressed={selected}
              aria-label={`${formatDayKey(cell.dateKey)}${
                count > 0 ? `, ${count} ${count === 1 ? 'entry' : 'entries'}` : ''
              }`}
              onClick={() => onSelect(cell.dateKey)}
              className={`relative mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-lg text-[11px] transition-colors ${
                selected
                  ? 'bg-[var(--accent)] text-white font-semibold'
                  : isToday
                    ? 'border border-[var(--accent)]/50 text-[var(--ink)] font-semibold'
                    : cell.inMonth
                      ? 'text-[var(--ink)] hover:bg-[var(--canvas)]'
                      : 'text-[var(--faint)]/60 hover:bg-[var(--canvas)]'
              }`}
            >
              <span>{cell.day}</span>
              <span
                aria-hidden="true"
                className={`mt-0.5 h-1 w-1 rounded-full ${
                  count > 0 ? (selected ? 'bg-white' : 'bg-[var(--accent)]') : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onSelect(todayKey)}
        className="mt-2 w-full rounded-lg border border-[var(--line)] py-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
      >
        Today
      </button>
    </section>
  );
};
