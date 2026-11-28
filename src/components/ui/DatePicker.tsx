import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

/* ---------- Local calendar-date helpers (YYYY-MM-DD, no time zones) ---------- */

const pad = (n: number): string => String(n).padStart(2, '0');

const formatDate = (d: Date): string => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const addDays = (s: string, days: number): string => {
  const d = parseDate(s);
  return formatDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
};

/** Shift by whole months, clamping the day to the target month's length. */
const addMonths = (s: string, months: number): string => {
  const d = parseDate(s);
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return formatDate(new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), lastDay)));
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const monthLabel = (year: number, month: number): string =>
  new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

const longLabel = (s: string): string =>
  parseDate(s).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const shortLabel = (s: string): string =>
  parseDate(s).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/* ---------- Component ---------- */

export interface DatePickerProps {
  label?: string;
  /** Selected date as `YYYY-MM-DD`, or empty string for none. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable date (`YYYY-MM-DD`), inclusive. */
  min?: string;
  /** Latest selectable date (`YYYY-MM-DD`), inclusive. */
  max?: string;
  /** Date marked as "today" (`YYYY-MM-DD`). Defaults to the local current date. */
  today?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  today,
  required,
  disabled,
  error,
  helperText,
  id,
}) => {
  const generatedId = useId();
  const triggerId = id || `${generatedId}-trigger`;
  const headingId = `${generatedId}-heading`;
  const noteId = `${generatedId}-note`;

  const todayStr = today || formatDate(new Date());

  const clamp = (s: string): string => {
    if (min && s < min) return min;
    if (max && s > max) return max;
    return s;
  };

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const d = parseDate(value || todayStr);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [focusDate, setFocusDate] = useState(() => clamp(value || todayStr));

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const focusGridRef = useRef(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = () => {
    const trigger = triggerRef.current?.getBoundingClientRect();
    if (!trigger) return;
    const modal = triggerRef.current?.closest('[role="dialog"][aria-modal="true"]') as HTMLElement | null;
    const container = modal?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const popover = popoverRef.current?.getBoundingClientRect();
    const margin = 8;
    const estimatedWidth = popover?.width ?? 296;
    const estimatedHeight = popover?.height ?? 320;
    let left = container.left + container.width / 2 - estimatedWidth / 2;
    let top = container.top + container.height / 2 - estimatedHeight / 2;
    if (popover) {
      if (left + popover.width > window.innerWidth - margin) left = window.innerWidth - popover.width - margin;
      if (left < margin) left = margin;
      if (top + popover.height > window.innerHeight - margin) top = window.innerHeight - popover.height - margin;
      if (top < margin) top = margin;
    }
    setCoords({ top, left });
  };

  const openPopover = () => {
    const start = clamp(value || todayStr);
    const d = parseDate(start);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setFocusDate(start);
    focusGridRef.current = true;
    const modal = triggerRef.current?.closest('[role="dialog"][aria-modal="true"]') as HTMLElement | null;
    const container = modal?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    setCoords({
      top: container.top + container.height / 2 - 160,
      left: container.left + container.width / 2 - 148,
    });
    flushSync(() => {
      setOpen(true);
    });
    window.dispatchEvent(new CustomEvent('vido:picker-open', { detail: generatedId }));
  };

  const closePopover = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Close when the pointer goes down outside the picker.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleUpdate = () => updatePosition();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [open]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (detail && detail !== generatedId && open) {
        setOpen(false);
      }
    };
    window.addEventListener('vido:picker-open', handler);
    return () => window.removeEventListener('vido:picker-open', handler);
  }, [open, generatedId]);

  // Move DOM focus to the active day after keyboard navigation / opening.
  useEffect(() => {
    if (!open || !focusGridRef.current) return;
    focusGridRef.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus();
  }, [open, focusDate, view]);

  const moveFocusTo = (next: string) => {
    const target = clamp(next);
    const d = parseDate(target);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setFocusDate(target);
    focusGridRef.current = true;
  };

  const goMonth = (delta: number) => {
    const target = clamp(addMonths(focusDate, delta));
    const d = parseDate(target);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setFocusDate(target);
  };

  const select = (date: string) => {
    if ((min && date < min) || (max && date > max)) return;
    onChange(date);
    closePopover(true);
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    let next: string | null = null;
    switch (e.key) {
      case 'ArrowLeft':
        next = addDays(focusDate, -1);
        break;
      case 'ArrowRight':
        next = addDays(focusDate, 1);
        break;
      case 'ArrowUp':
        next = addDays(focusDate, -7);
        break;
      case 'ArrowDown':
        next = addDays(focusDate, 7);
        break;
      case 'Home':
        next = addDays(focusDate, -parseDate(focusDate).getDay());
        break;
      case 'End':
        next = addDays(focusDate, 6 - parseDate(focusDate).getDay());
        break;
      case 'PageUp':
        next = addMonths(focusDate, e.shiftKey ? -12 : -1);
        break;
      case 'PageDown':
        next = addMonths(focusDate, e.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }
    e.preventDefault();
    moveFocusTo(next);
  };

  const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Close only the picker, not a surrounding modal.
      e.stopPropagation();
      closePopover(true);
    } else if (e.key === 'Tab') {
      // Hand focus back to the trigger so Tab continues from there.
      closePopover(true);
    }
  };

  // Build the month grid (Sunday-first), padding with nulls.
  const firstOfMonth = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstOfMonth.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => formatDate(new Date(view.year, view.month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const prevDisabled = !!min && formatDate(new Date(view.year, view.month, 0)) < min;
  const nextDisabled = !!max && formatDate(new Date(view.year, view.month + 1, 1)) > max;

  const describedBy = error || helperText ? noteId : undefined;

  return (
    <div className="w-full relative">
      {label && (
        <label htmlFor={triggerId} className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? closePopover(false) : openPopover())}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left bg-[var(--surface)] border rounded-lg transition-colors hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-[var(--amber)]' : 'border-[var(--line)]'
        } ${value ? 'text-[var(--ink)]' : 'text-[var(--faint)]'}`}
      >
        <span>{value ? shortLabel(value) : 'Select a date'}</span>
        <Calendar className="w-4 h-4 text-[var(--muted)] shrink-0" aria-hidden="true" />
      </button>

      {open ? createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={label ? `Choose ${label.replace(/\s*\*$/, '').toLowerCase()}` : 'Choose date'}
          tabIndex={-1}
          onKeyDown={handlePopoverKeyDown}
          style={{ position: 'fixed', top: (coords?.top ?? 0), left: (coords?.left ?? 0), zIndex: 1000 }}
          className="w-[18.5rem] p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              aria-label="Previous month"
              disabled={prevDisabled}
              onClick={() => goMonth(-1)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div id={headingId} aria-live="polite" className="text-sm font-semibold text-[var(--ink)]">
              {monthLabel(view.year, view.month)}
            </div>
            <button
              type="button"
              aria-label="Next month"
              disabled={nextDisabled}
              onClick={() => goMonth(1)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-labelledby={headingId}
            onKeyDown={handleGridKeyDown}
          >
            <div role="row" className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  role="columnheader"
                  className="text-center text-[11px] font-semibold text-[var(--faint)] py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div role="row" key={wi} className="grid grid-cols-7">
                {week.map((date, di) => {
                  if (!date) return <div role="gridcell" key={di} aria-hidden="true" />;

                  const isSelected = date === value;
                  const isToday = date === todayStr;
                  const isDisabled = (!!min && date < min) || (!!max && date > max);

                  return (
                    <div role="gridcell" key={date} aria-selected={isSelected} className="flex justify-center">
                      <button
                        type="button"
                        data-date={date}
                        aria-label={longLabel(date)}
                        aria-current={isToday ? 'date' : undefined}
                        disabled={isDisabled}
                        tabIndex={date === focusDate ? 0 : -1}
                        onClick={() => select(date)}
                        className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white font-semibold'
                            : isDisabled
                              ? 'text-[var(--faint)] opacity-50 cursor-not-allowed'
                              : `text-[var(--ink)] hover:bg-[var(--canvas)] ${
                                  isToday ? 'ring-1 ring-[var(--accent)] font-semibold' : ''
                                }`
                        }`}
                      >
                        {parseDate(date).getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      , document.body) : null}

      {error ? (
        <p id={noteId} role="status" className="mt-1 text-xs text-[var(--amber)]">
          {error}
        </p>
      ) : helperText ? (
        <p id={noteId} className="mt-1 text-xs text-[var(--muted)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';
