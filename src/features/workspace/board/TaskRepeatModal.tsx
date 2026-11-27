import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, Trash2, Repeat, Check } from 'lucide-react';
import { parseRRuleForUI, formatRecurrenceLabel } from '../../../utils/recurrence';
import { PopoverPosition } from './TaskDatePopover';

export interface TaskRepeatModalProps {
  isOpen: boolean;
  initialRule?: string | null;
  initialTime?: string;
  position?: PopoverPosition | null;
  onClose: () => void;
  onSave: (rule: string, time?: string) => void;
  onRemove?: () => void;
}

const WEEK_DAYS: { code: string; label: string; name: string }[] = [
  { code: 'SU', label: 'S', name: 'Sunday' },
  { code: 'MO', label: 'M', name: 'Monday' },
  { code: 'TU', label: 'T', name: 'Tuesday' },
  { code: 'WE', label: 'W', name: 'Wednesday' },
  { code: 'TH', label: 'T', name: 'Thursday' },
  { code: 'FR', label: 'F', name: 'Friday' },
  { code: 'SA', label: 'S', name: 'Saturday' },
];

export const TaskRepeatModal: React.FC<TaskRepeatModalProps> = ({
  isOpen,
  initialRule,
  initialTime,
  position,
  onClose,
  onSave,
  onRemove,
}) => {
  const [interval, setInterval] = useState<number>(1);
  const [unit, setUnit] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [byDay, setByDay] = useState<string[]>(['MO', 'TU', 'WE', 'TH', 'FR']);
  const [time, setTime] = useState<string>(initialTime || '09:00');
  const [ends, setEnds] = useState<'never' | 'on' | 'after'>('never');
  const [endDate, setEndDate] = useState<string>('');
  const [occurrences, setOccurrences] = useState<number>(30);

  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number }>(() => {
    const estimatedHeight = 480;
    const estimatedWidth = 320;
    const vHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const vWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const PADDING = 16;

    let initTop = position ? position.top : PADDING;
    if (position?.triggerTop !== undefined && position?.triggerBottom !== undefined) {
      const spaceBelow = vHeight - position.triggerBottom - PADDING;
      const spaceAbove = position.triggerTop - PADDING;
      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        initTop = position.triggerTop - estimatedHeight - 6;
      }
    }

    return {
      top: Math.max(PADDING, Math.min(initTop, vHeight - estimatedHeight - PADDING)),
      left: position
        ? Math.max(PADDING, Math.min(position.left, vWidth - estimatedWidth - PADDING))
        : PADDING,
    };
  });

  const updatePosition = () => {
    if (!position || !popoverRef.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 320;
    const height = rect.height > 0 ? rect.height : 460;
    const vHeight = window.innerHeight;
    const vWidth = window.innerWidth;
    const PADDING = 16;

    let targetTop = position.top;
    if (position.triggerTop !== undefined && position.triggerBottom !== undefined) {
      const spaceBelow = vHeight - position.triggerBottom - PADDING;
      const spaceAbove = position.triggerTop - PADDING;
      if (spaceBelow < height && spaceAbove > spaceBelow) {
        targetTop = position.triggerTop - height - 6;
      } else {
        targetTop = position.triggerBottom + 6;
      }
    }

    const clampedTop = Math.max(PADDING, Math.min(targetTop, vHeight - height - PADDING));
    const clampedLeft = Math.max(PADDING, Math.min(position.left, vWidth - width - PADDING));

    setCoords({ top: clampedTop, left: clampedLeft });
  };

  useEffect(() => {
    if (!isOpen || !position) return;
    updatePosition();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && popoverRef.current) {
      ro = new ResizeObserver(() => {
        updatePosition();
      });
      ro.observe(popoverRef.current);
    }

    window.addEventListener('resize', updatePosition);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, position, unit, byDay, ends]);

  useEffect(() => {
    if (isOpen) {
      if (initialRule) {
        const parsed = parseRRuleForUI(initialRule);
        setInterval(parsed.interval);
        setUnit(parsed.freq);
        setByDay(parsed.byDay.length > 0 ? parsed.byDay : ['MO', 'TU', 'WE', 'TH', 'FR']);
        setEnds(parsed.ends);
        setEndDate(parsed.endDate);
        setOccurrences(parsed.occurrences);
      } else {
        setInterval(1);
        setUnit('week');
        setByDay(['MO', 'TU', 'WE', 'TH', 'FR']);
        setEnds('never');
        setEndDate('');
        setOccurrences(30);
      }
      if (initialTime !== undefined && initialTime.trim() !== '') {
        setTime(initialTime);
      } else {
        setTime('09:00');
      }
    }
  }, [isOpen, initialRule, initialTime]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleDay = (code: string) => {
    setByDay((prev) => {
      if (prev.includes(code)) {
        const next = prev.filter((d) => d !== code);
        return next.length > 0 ? next : [code];
      }
      return [...prev, code];
    });
  };

  const handleDone = () => {
    const freqMap: Record<string, string> = {
      day: 'DAILY',
      week: 'WEEKLY',
      month: 'MONTHLY',
      year: 'YEARLY',
    };

    let rruleStr = `FREQ=${freqMap[unit]};INTERVAL=${Math.max(1, interval)}`;

    if (unit === 'week' && byDay.length > 0) {
      rruleStr += `;BYDAY=${byDay.join(',')}`;
    }

    if (ends === 'on' && endDate) {
      const cleanDate = endDate.replace(/-/g, '');
      rruleStr += `;UNTIL=${cleanDate}T235959Z`;
    } else if (ends === 'after' && occurrences > 0) {
      rruleStr += `;COUNT=${occurrences}`;
    }

    onSave(rruleStr, time || undefined);
    onClose();
  };

  const getUnitLabel = (u: 'day' | 'week' | 'month' | 'year', count: number) => {
    if (count > 1) {
      if (u === 'day') return 'days';
      if (u === 'week') return 'weeks';
      if (u === 'month') return 'months';
      if (u === 'year') return 'years';
    }
    return u;
  };

  const previewRule = (() => {
    const freqMap: Record<string, string> = {
      day: 'DAILY',
      week: 'WEEKLY',
      month: 'MONTHLY',
      year: 'YEARLY',
    };
    let r = `FREQ=${freqMap[unit]};INTERVAL=${Math.max(1, interval)}`;
    if (unit === 'week' && byDay.length > 0) r += `;BYDAY=${byDay.join(',')}`;
    if (ends === 'on' && endDate) r += `;UNTIL=${endDate.replace(/-/g, '')}T235959Z`;
    else if (ends === 'after') r += `;COUNT=${occurrences}`;
    return r;
  })();
  const previewText = formatRecurrenceLabel(previewRule);

  return (
    <div
      ref={popoverRef}
      data-task-popover="true"
      style={{
        top: coords.top,
        left: coords.left,
        maxHeight: 'calc(100vh - 32px)',
      }}
      className="fixed w-80 max-h-[calc(100vh-32px)] overflow-y-auto bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl p-4 z-50 text-xs text-[var(--ink)] space-y-4 select-none animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-2.5">
        <div className="flex items-center space-x-2">
          <Repeat className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-[var(--ink)] tracking-tight">Repeats every</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          aria-label="Close repeat modal"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interval & Unit Selection */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 flex items-center justify-center">
          <input
            type="number"
            min={1}
            max={99}
            value={interval}
            onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full bg-transparent text-center text-xs font-semibold text-[var(--ink)] focus:outline-none"
          />
        </div>

        <div className="bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 flex items-center">
          <select
            value={unit}
            onChange={(e) => {
              const newUnit = e.target.value as any;
              setUnit(newUnit);
              if (newUnit === 'week' && byDay.length === 0) {
                setByDay(['MO', 'TU', 'WE', 'TH', 'FR']);
              }
            }}
            className="w-full bg-transparent text-xs font-medium text-[var(--ink)] focus:outline-none cursor-pointer"
          >
            <option value="day">{getUnitLabel('day', interval)}</option>
            <option value="week">{getUnitLabel('week', interval)}</option>
            <option value="month">{getUnitLabel('month', interval)}</option>
            <option value="year">{getUnitLabel('year', interval)}</option>
          </select>
        </div>
      </div>

      {/* Weekly Day of Week Selector */}
      {unit === 'week' && (
        <div className="space-y-1.5 pt-0.5">
          <label className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
            Repeats on
          </label>
          <div className="flex items-center justify-between">
            {WEEK_DAYS.map((wd) => {
              const isSelected = byDay.includes(wd.code);
              return (
                <button
                  key={wd.code}
                  type="button"
                  title={wd.name}
                  onClick={() => toggleDay(wd.code)}
                  className={`w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white shadow-xs font-bold scale-105'
                      : 'bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)] border border-[var(--line)]'
                  }`}
                >
                  {wd.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Set Time Input */}
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider flex items-center space-x-1.5">
          <Clock className="w-3 h-3 text-[var(--accent)]" />
          <span>Reminder time</span>
        </label>
        <div className="bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-2.5 py-1.5 flex items-center justify-between">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-transparent text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
          />
          {time && (
            <button
              type="button"
              onClick={() => setTime('')}
              className="text-[10px] text-[var(--muted)] hover:text-rose-600 transition-colors cursor-pointer"
              title="Clear time"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Ends Section */}
      <div className="space-y-2 pt-1 border-t border-[var(--line)]">
        <label className="text-[11px] font-bold text-[var(--ink)]">Ends</label>

        {/* Never Option */}
        <label className="flex items-center space-x-2.5 cursor-pointer">
          <input
            type="radio"
            name="repeatEnd"
            checked={ends === 'never'}
            onChange={() => setEnds('never')}
            className="w-3.5 h-3.5 text-[var(--accent)] accent-[var(--accent)] cursor-pointer"
          />
          <span className="text-xs text-[var(--ink)]">Never</span>
        </label>

        {/* On Date Option */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2.5 cursor-pointer shrink-0">
            <input
              type="radio"
              name="repeatEnd"
              checked={ends === 'on'}
              onChange={() => {
                setEnds('on');
                if (!endDate) {
                  const d = new Date();
                  d.setMonth(d.getMonth() + 3);
                  setEndDate(d.toISOString().substring(0, 10));
                }
              }}
              className="w-3.5 h-3.5 text-[var(--accent)] accent-[var(--accent)] cursor-pointer"
            />
            <span className="text-xs text-[var(--ink)]">On</span>
          </label>
          <input
            type="date"
            disabled={ends !== 'on'}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-2.5 py-1 text-xs text-[var(--ink)] focus:outline-none ${
              ends !== 'on' ? 'opacity-40 pointer-events-none' : 'cursor-pointer'
            }`}
          />
        </div>

        {/* After Occurrences Option */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2.5 cursor-pointer shrink-0">
            <input
              type="radio"
              name="repeatEnd"
              checked={ends === 'after'}
              onChange={() => setEnds('after')}
              className="w-3.5 h-3.5 text-[var(--accent)] accent-[var(--accent)] cursor-pointer"
            />
            <span className="text-xs text-[var(--ink)]">After</span>
          </label>
          <div className="flex items-center space-x-1.5">
            <input
              type="number"
              min={1}
              max={999}
              disabled={ends !== 'after'}
              value={occurrences}
              onChange={(e) => setOccurrences(parseInt(e.target.value, 10) || 1)}
              className={`w-14 bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-2 py-1 text-center text-xs text-[var(--ink)] focus:outline-none ${
                ends !== 'after' ? 'opacity-40 pointer-events-none' : ''
              }`}
            />
            <span className="text-[11px] text-[var(--muted)]">occurrences</span>
          </div>
        </div>
      </div>

      {/* Summary preview tag */}
      <div className="bg-purple-500/15 border border-purple-400/40 rounded-xl px-3 py-1.5 text-[11px] text-purple-900 font-semibold flex items-center space-x-2">
        <Repeat className="w-3.5 h-3.5 text-purple-800 shrink-0" strokeWidth={2.2} />
        <span className="truncate">
          {previewText}
          {time ? ` at ${time}` : ''}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
        {initialRule && onRemove ? (
          <button
            type="button"
            onClick={() => {
              onRemove();
              onClose();
            }}
            className="flex items-center space-x-1 text-rose-600 hover:text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            title="Stop repeating this task"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Stop repeat</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-full hover:bg-[var(--canvas)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            data-testid="repeat-done-btn"
            onClick={handleDone}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-[var(--accent)] hover:opacity-90 text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
