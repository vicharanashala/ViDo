import React, { useEffect, useId, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

const pad = (n: number): string => String(n).padStart(2, '0');

const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const build24 = (h24: number, m: number): string => `${pad(h24)}:${pad(m)}`;

const format12 = (time: string): string => {
  const [h24, m] = time.split(':').map(Number);
  return `${h24 % 12 || 12}:${pad(m)} ${h24 >= 12 ? 'PM' : 'AM'}`;
};

type Period = 'AM' | 'PM';
type Mode = 'hour' | 'minute';

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const DIAL_SIZE = 200;
const DIAL_RADIUS = 78;
const ITEM_SIZE = 32;

export interface TimePickerProps {
  label?: string;
  /** Selected time as `HH:mm` (24-hour), or empty string for none. */
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable time (`HH:mm`), inclusive. Everything earlier is disabled. */
  minTime?: string;
  /** Allow removing the time again. Defaults to true (time is optional). */
  clearable?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  minTime,
  clearable = true,
  disabled,
  error,
  helperText,
  id,
}) => {
  const generatedId = useId();
  const triggerId = id || `${generatedId}-trigger`;
  const noteId = `${generatedId}-note`;

  const minMinutes = minTime ? toMinutes(minTime) : 0;

  const hasValue = !!value;
  const valueH24 = hasValue ? Number(value.split(':')[0]) : 0;
  const valueMinute = hasValue ? Number(value.split(':')[1]) : 0;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('hour');
  const [period, setPeriod] = useState<Period>('AM');

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const focusDialRef = useRef(false);

  const periodDisabled = (p: Period): boolean => (p === 'AM' ? 12 * 60 - 1 : 24 * 60 - 1) < minMinutes;

  const openPopover = () => {
    const initial: Period = hasValue ? (valueH24 >= 12 ? 'PM' : 'AM') : periodDisabled('AM') ? 'PM' : 'AM';
    setPeriod(initial);
    setMode('hour');
    focusDialRef.current = true;
    setOpen(true);
  };

  const closePopover = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Close when the pointer goes down outside the picker.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Move DOM focus into the dial when opening or switching hour/minute.
  useEffect(() => {
    if (!open || !focusDialRef.current) return;
    focusDialRef.current = false;
    dialRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [open, mode]);

  const hourDisabled = (h12: number): boolean => {
    const h24 = period === 'PM' ? (h12 % 12) + 12 : h12 % 12;
    return h24 * 60 + 59 < minMinutes;
  };

  const minuteDisabled = (m: number): boolean => valueH24 * 60 + m < minMinutes;

  /** Lowest minute allowed within `h24` given the minimum time. */
  const lowestMinute = (h24: number): number => Math.min(59, Math.max(0, minMinutes - h24 * 60));

  const selectHour = (h12: number) => {
    const h24 = period === 'PM' ? (h12 % 12) + 12 : h12 % 12;
    const minute = Math.max(hasValue ? valueMinute : 0, lowestMinute(h24));
    onChange(build24(h24, minute));
    focusDialRef.current = true;
    setMode('minute');
  };

  const selectMinute = (m: number) => {
    onChange(build24(valueH24, m));
    closePopover(true);
  };

  const stepMinute = (delta: number) => {
    const next = valueMinute + delta;
    if (next < 0 || next > 59 || valueH24 * 60 + next < minMinutes) return;
    onChange(build24(valueH24, next));
  };

  const selectPeriod = (p: Period) => {
    if (periodDisabled(p)) return;
    setPeriod(p);
    if (hasValue) {
      const h24 = (valueH24 % 12) + (p === 'PM' ? 12 : 0);
      onChange(build24(h24, Math.max(valueMinute, lowestMinute(h24))));
    }
  };

  const clear = () => {
    onChange('');
    setMode('hour');
    closePopover(true);
  };

  const items =
    mode === 'hour'
      ? HOURS.map((v) => ({ val: v, disabled: hourDisabled(v), label: String(v), aria: `${v} o'clock` }))
      : MINUTES.map((v) => ({ val: v, disabled: minuteDisabled(v), label: pad(v), aria: `${v} minutes` }));

  const selectedVal = !hasValue ? null : mode === 'hour' ? valueH24 % 12 || 12 : valueMinute;
  const enabledVals = items.filter((i) => !i.disabled).map((i) => i.val);
  const tabVal = selectedVal !== null && enabledVals.includes(selectedVal) ? selectedVal : enabledVals[0];

  const handleDialKeyDown = (e: React.KeyboardEvent) => {
    if (enabledVals.length === 0) return;
    const current = Number((e.target as HTMLElement).dataset.val);
    const idx = enabledVals.indexOf(current);
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = enabledVals[(idx + 1) % enabledVals.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = enabledVals[(idx - 1 + enabledVals.length) % enabledVals.length];
        break;
      case 'Home':
        next = enabledVals[0];
        break;
      case 'End':
        next = enabledVals[enabledVals.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    dialRef.current?.querySelector<HTMLButtonElement>(`[data-val="${next}"]`)?.focus();
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

  const describedBy = error || helperText ? noteId : undefined;
  const hourText = hasValue ? String(valueH24 % 12 || 12) : '--';
  const minuteText = hasValue ? pad(valueMinute) : '--';

  const tabBase = 'px-2 py-1 rounded-lg text-2xl font-semibold tabular-nums transition-colors';
  const tabActive = 'bg-[var(--accent-soft)] text-[var(--accent)]';
  const tabIdle = 'text-[var(--muted)] hover:bg-[var(--canvas)]';
  const smallBtn =
    'px-2.5 py-1 rounded-lg text-xs font-semibold border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  return (
    <div className="w-full relative" ref={wrapperRef}>
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
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onClick={() => (open ? closePopover(false) : openPopover())}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left bg-[var(--surface)] border rounded-lg transition-colors hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-[var(--amber)]' : 'border-[var(--line)]'
        } ${hasValue ? 'text-[var(--ink)]' : 'text-[var(--faint)]'}`}
      >
        <span>{hasValue ? format12(value) : 'No time set'}</span>
        <Clock className="w-4 h-4 text-[var(--muted)] shrink-0" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label ? `Choose ${label.replace(/\s*\(optional\)\s*$/i, '').toLowerCase()}` : 'Choose time'}
          tabIndex={-1}
          onKeyDown={handlePopoverKeyDown}
          className="absolute left-0 top-full mt-1.5 z-20 w-[15.5rem] p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-pressed={mode === 'hour'}
                aria-label="Hour"
                onClick={() => {
                  focusDialRef.current = true;
                  setMode('hour');
                }}
                className={`${tabBase} ${mode === 'hour' ? tabActive : tabIdle}`}
              >
                {hourText}
              </button>
              <span className="text-2xl font-semibold text-[var(--faint)]" aria-hidden="true">
                :
              </span>
              <button
                type="button"
                aria-pressed={mode === 'minute'}
                aria-label="Minute"
                disabled={!hasValue}
                onClick={() => {
                  focusDialRef.current = true;
                  setMode('minute');
                }}
                className={`${tabBase} ${mode === 'minute' ? tabActive : tabIdle} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {minuteText}
              </button>
            </div>

            <div className="flex flex-col gap-1" role="group" aria-label="AM or PM">
              {(['AM', 'PM'] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={period === p}
                  disabled={periodDisabled(p)}
                  onClick={() => selectPeriod(p)}
                  className={`px-2 py-0.5 rounded-md text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    period === p
                      ? 'bg-[var(--accent)] text-white'
                      : 'text-[var(--muted)] hover:bg-[var(--canvas)]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={dialRef}
            role="group"
            aria-label={mode === 'hour' ? 'Select hour' : 'Select minute'}
            onKeyDown={handleDialKeyDown}
            className="relative mx-auto rounded-full bg-[var(--canvas)]"
            style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
          >
            {items.map((item, i) => {
              const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
              const left = DIAL_SIZE / 2 + DIAL_RADIUS * Math.cos(angle) - ITEM_SIZE / 2;
              const top = DIAL_SIZE / 2 + DIAL_RADIUS * Math.sin(angle) - ITEM_SIZE / 2;
              const isSelected = item.val === selectedVal;

              return (
                <button
                  key={item.val}
                  type="button"
                  data-val={item.val}
                  aria-label={item.aria}
                  aria-pressed={isSelected}
                  disabled={item.disabled}
                  tabIndex={item.val === tabVal ? 0 : -1}
                  onClick={() => (mode === 'hour' ? selectHour(item.val) : selectMinute(item.val))}
                  style={{ left, top, width: ITEM_SIZE, height: ITEM_SIZE }}
                  className={`absolute rounded-full text-sm tabular-nums transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white font-semibold'
                      : item.disabled
                        ? 'text-[var(--faint)] opacity-40 cursor-not-allowed'
                        : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {mode === 'minute' && (
                <>
                  <button
                    type="button"
                    aria-label="Subtract one minute"
                    disabled={valueMinute - 1 < 0 || valueH24 * 60 + valueMinute - 1 < minMinutes}
                    onClick={() => stepMinute(-1)}
                    className={smallBtn}
                  >
                    −1
                  </button>
                  <button
                    type="button"
                    aria-label="Add one minute"
                    disabled={valueMinute + 1 > 59}
                    onClick={() => stepMinute(1)}
                    className={smallBtn}
                  >
                    +1
                  </button>
                </>
              )}
              {clearable && mode === 'hour' && (
                <button type="button" disabled={!hasValue} onClick={clear} className={smallBtn}>
                  Clear
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => closePopover(true)}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}

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

TimePicker.displayName = 'TimePicker';
