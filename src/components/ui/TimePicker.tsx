import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
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
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);
const FIVE_MINUTE_MARKS = Array.from({ length: 12 }, (_, index) => index * 5);

const DIAL_SIZE = 240;
const HOUR_RADIUS = 82;
const MINUTE_TICK_RADIUS = 104;
const HOUR_ITEM_SIZE = 32;
const MINUTE_ITEM_SIZE = 8;

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
  const [dragging, setDragging] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const focusDialRef = useRef(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const periodDisabled = (p: Period): boolean => (p === 'AM' ? 12 * 60 - 1 : 24 * 60 - 1) < minMinutes;

  const hourFromPeriod = (h12: number, p: Period): number =>
    p === 'PM' ? (h12 % 12) + 12 : h12 % 12;

  const hourDisabled = (h12: number): boolean => {
    const h24 = hourFromPeriod(h12, period);
    return h24 * 60 + 59 < minMinutes;
  };

  const minuteDisabled = (m: number): boolean => valueH24 * 60 + m < minMinutes;

  const lowestMinute = (h24: number): number => Math.min(59, Math.max(0, minMinutes - h24 * 60));

  const selectHour = (h12: number) => {
    if (hourDisabled(h12)) return;
    const h24 = hourFromPeriod(h12, period);
    const minute = Math.max(hasValue ? valueMinute : 0, lowestMinute(h24));
    onChange(build24(h24, minute));
    focusDialRef.current = true;
    setMode('minute');
  };

  const selectMinute = (m: number) => {
    if (minuteDisabled(m)) return;
    onChange(build24(valueH24, m));
  };

  const selectPeriod = (p: Period) => {
    if (periodDisabled(p)) return;
    setPeriod(p);
    if (hasValue) {
      const h24 = hourFromPeriod(valueH24 % 12 || 12, p);
      onChange(build24(h24, Math.max(valueMinute, lowestMinute(h24))));
    }
  };

  const clear = () => {
    onChange('');
    setMode('hour');
    closePopover(true);
  };

  const closePopover = (returnFocus: boolean) => {
    setOpen(false);
    setDragging(false);
    if (returnFocus) triggerRef.current?.focus();
  };

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
    const estimatedWidth = popover?.width ?? 260;
    const estimatedHeight = popover?.height ?? 360;
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
    const initial: Period = hasValue ? (valueH24 >= 12 ? 'PM' : 'AM') : periodDisabled('AM') ? 'PM' : 'AM';
    setPeriod(initial);
    setMode('hour');
    focusDialRef.current = true;
    const modal = triggerRef.current?.closest('[role="dialog"][aria-modal="true"]') as HTMLElement | null;
    const container = modal?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    setCoords({
      top: container.top + container.height / 2 - 180,
      left: container.left + container.width / 2 - 130,
    });
    flushSync(() => {
      setOpen(true);
    });
    window.dispatchEvent(new CustomEvent('vido:picker-open', { detail: generatedId }));
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
      setDragging(false);
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
        setDragging(false);
      }
    };
    window.addEventListener('vido:picker-open', handler);
    return () => window.removeEventListener('vido:picker-open', handler);
  }, [open, generatedId]);

  useEffect(() => {
    if (!open || !focusDialRef.current) return;
    focusDialRef.current = false;
    dialRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [open, mode]);

  const selectFromAngle = (clientX: number, clientY: number) => {
    const dial = dialRef.current;
    if (!dial) return;
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (degrees < 0) degrees += 360;

    if (mode === 'hour') {
      const hour = Math.round(degrees / 30) % 12 || 12;
      selectHour(hour);
    } else {
      const minute = Math.round(degrees / 6) % 60;
      selectMinute(minute);
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
    selectFromAngle(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    selectFromAngle(event.clientX, event.clientY);
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const items =
    mode === 'hour'
      ? HOURS.map((v) => ({ val: v, disabled: hourDisabled(v), label: String(v), aria: `${v} o'clock` }))
      : FIVE_MINUTE_MARKS.map((v) => ({
          val: v,
          disabled: minuteDisabled(v),
          label: pad(v),
          aria: `${v} minutes`,
        }));

  const selectedVal = !hasValue ? null : mode === 'hour' ? valueH24 % 12 || 12 : valueMinute;
  const enabledVals = items.filter((i) => !i.disabled).map((i) => i.val);
  const tabVal = selectedVal !== null && enabledVals.includes(selectedVal) ? selectedVal : enabledVals[0];

  const enabledMinutes = MINUTES.filter((minute) => !minuteDisabled(minute));

  const handleDialKeyDown = (e: React.KeyboardEvent) => {
    const values = mode === 'hour' ? enabledVals : enabledMinutes;
    if (values.length === 0) return;
    const current =
      mode === 'hour'
        ? Number((e.target as HTMLElement).dataset.val) || valueH24 % 12 || 12
        : Number((e.target as HTMLElement).dataset.val) || valueMinute;
    const idx = values.indexOf(current);
    const safeIndex = idx >= 0 ? idx : 0;
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = values[(safeIndex + 1) % values.length];
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = values[(safeIndex - 1 + values.length) % values.length];
        break;
      case 'Home':
        next = values[0];
        break;
      case 'End':
        next = values[values.length - 1];
        break;
      default:
        return;
    }
    e.preventDefault();
    if (mode === 'hour') {
      dialRef.current?.querySelector<HTMLButtonElement>(`[data-val="${next}"]`)?.focus();
    } else {
      selectMinute(next);
      dialRef.current?.focus();
    }
  };

  const handlePopoverKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closePopover(true);
    } else if (e.key === 'Tab') {
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

  const radius = mode === 'hour' ? HOUR_RADIUS : MINUTE_TICK_RADIUS;
  const handAngle = !hasValue
    ? -90
    : mode === 'hour'
      ? ((valueH24 % 12) * 30 - 90)
      : (valueMinute * 6 - 90);
  const handLength = radius - 14;
  const handX = DIAL_SIZE / 2 + handLength * Math.cos((handAngle * Math.PI) / 180);
  const handY = DIAL_SIZE / 2 + handLength * Math.sin((handAngle * Math.PI) / 180);

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

      {open ? createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={label ? `Choose ${label.replace(/\s*\(optional\)\s*$/i, '').toLowerCase()}` : 'Choose time'}
          tabIndex={-1}
          onKeyDown={handlePopoverKeyDown}
          style={{ position: 'fixed', top: (coords?.top ?? 0), left: (coords?.left ?? 0), zIndex: 1000 }}
          className="w-[17rem] p-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-lg"
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
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative mx-auto rounded-full bg-[var(--canvas)] select-none touch-none"
            style={{ width: DIAL_SIZE, height: DIAL_SIZE }}
            tabIndex={0}
            onKeyDown={handleDialKeyDown}
          >
            <svg
              className="absolute inset-0 pointer-events-none"
              width={DIAL_SIZE}
              height={DIAL_SIZE}
              aria-hidden="true"
            >
              <line
                x1={DIAL_SIZE / 2}
                y1={DIAL_SIZE / 2}
                x2={handX}
                y2={handY}
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle
                cx={DIAL_SIZE / 2}
                cy={DIAL_SIZE / 2}
                r="4"
                fill="var(--accent)"
              />
              <circle cx={handX} cy={handY} r="6" fill="var(--accent)" />
            </svg>

            {items.map((item, i) => {
              const radius = mode === 'hour' ? HOUR_RADIUS : MINUTE_TICK_RADIUS;
              const size = mode === 'hour' ? HOUR_ITEM_SIZE : MINUTE_ITEM_SIZE;
              const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
              const left = DIAL_SIZE / 2 + radius * Math.cos(angle) - size / 2;
              const top = DIAL_SIZE / 2 + radius * Math.sin(angle) - size / 2;
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
                  style={{ left, top, width: size, height: size }}
                  className={`absolute rounded-full text-[10px] tabular-nums transition-colors ${
                    mode === 'hour'
                      ? isSelected
                        ? 'bg-[var(--accent)] text-white font-semibold'
                        : item.disabled
                          ? 'text-[var(--faint)] opacity-40 cursor-not-allowed'
                          : 'text-[var(--ink)] hover:bg-[var(--surface)]'
                      : isSelected
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
              {clearable && (
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

TimePicker.displayName = 'TimePicker';