import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, X, Check, Trash2, Repeat } from 'lucide-react';
import { formatRecurrenceLabel } from '../../../utils/recurrence';

export interface PopoverPosition {
  top: number;
  left: number;
  triggerTop?: number;
  triggerBottom?: number;
}

export interface TaskDatePopoverProps {
  isOpen: boolean;
  initialDate?: string | null;
  initialTime?: string | null;
  recurrenceRule?: string | null;
  position: PopoverPosition | null;
  onClose: () => void;
  onSave: (dateStr: string | null, timeStr: string | null) => void;
  onOpenRepeat?: (e?: React.MouseEvent) => void;
}

function parseInitial(initialDate?: string | null, initialTime?: string | null): {
  dateStr: string;
  timeStr: string;
  hasSpecificTime: boolean;
} {
  const defaultDate = new Date().toISOString().substring(0, 10);
  let dateStr = defaultDate;
  let timeStr = initialTime || '09:00';
  let hasSpecificTime = !!initialTime && initialTime.trim() !== '';

  if (initialDate) {
    const trimmed = initialDate.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      dateStr = trimmed;
    } else {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().substring(0, 10);
        if (!initialTime) {
          const h = d.getHours();
          const m = d.getMinutes();
          if (h !== 0 || m !== 0) {
            hasSpecificTime = true;
            timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
          }
        }
      }
    }
  }

  return { dateStr, timeStr, hasSpecificTime };
}

export const TaskDatePopover: React.FC<TaskDatePopoverProps> = ({
  isOpen,
  initialDate,
  initialTime,
  recurrenceRule,
  position,
  onClose,
  onSave,
  onOpenRepeat,
}) => {
  const parsedInit = parseInitial(initialDate, initialTime);
  const [selectedDate, setSelectedDate] = useState<string>(parsedInit.dateStr);
  const [hasTime, setHasTime] = useState<boolean>(parsedInit.hasSpecificTime);
  const [selectedTime, setSelectedTime] = useState<string>(parsedInit.timeStr);

  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number }>(() => {
    const estimatedHeight = 440;
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
    const height = rect.height > 0 ? rect.height : 420;
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
  }, [isOpen, position, hasTime]);

  useEffect(() => {
    if (isOpen) {
      const p = parseInitial(initialDate, initialTime);
      setSelectedDate(p.dateStr);
      setHasTime(p.hasSpecificTime);
      setSelectedTime(p.timeStr);
    }
  }, [initialDate, initialTime, isOpen]);

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

  if (!isOpen || !position) return null;

  const setQuickDate = (daysToAdd: number) => {
    try {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      setSelectedDate(d.toISOString().substring(0, 10));
    } catch {}
  };

  const setNextWeek = () => {
    try {
      const d = new Date();
      d.setDate(d.getDate() + ((7 - d.getDay() + 1) % 7 || 7));
      setSelectedDate(d.toISOString().substring(0, 10));
    } catch {}
  };

  const handleSave = () => {
    if (!selectedDate) {
      onSave(null, null);
    } else {
      onSave(selectedDate, hasTime ? selectedTime : null);
    }
    onClose();
  };

  const handleClear = () => {
    onSave(null, null);
    onClose();
  };

  return (
    <div
      ref={popoverRef}
      data-testid="task-date-popover"
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
        <span className="font-semibold text-[var(--ink)] flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          <span>Date & time</span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
          aria-label="Close date popover"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Choice Pills */}
      <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
        <button
          type="button"
          onClick={() => setQuickDate(0)}
          className="px-2.5 py-1 bg-[var(--accent-soft)] hover:bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 rounded-full text-[11px] font-semibold transition-colors cursor-pointer"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(1)}
          className="px-2.5 py-1 bg-[var(--canvas)] hover:bg-[var(--line)]/60 text-[var(--ink)] border border-[var(--line)] rounded-full text-[11px] font-medium transition-colors cursor-pointer"
        >
          Tomorrow
        </button>
        <button
          type="button"
          onClick={setNextWeek}
          className="px-2.5 py-1 bg-[var(--canvas)] hover:bg-[var(--line)]/60 text-[var(--ink)] border border-[var(--line)] rounded-full text-[11px] font-medium transition-colors cursor-pointer"
        >
          Next week
        </button>
      </div>

      {/* Date Input */}
      <div className="space-y-1">
        <label className="text-[11px] text-[var(--muted)] font-medium">Target Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)] cursor-pointer"
        />
      </div>

      {/* Time Toggle & Input */}
      <div className="space-y-2 pt-1 border-t border-[var(--line)]">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-[var(--ink)] font-medium flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTime}
              onChange={(e) => setHasTime(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[var(--accent)] accent-[var(--accent)] bg-transparent border-[var(--line)] cursor-pointer"
            />
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Set specific time</span>
            </span>
          </label>
          {!hasTime && (
            <span className="text-[10px] text-[var(--muted)]">(Default 23:59)</span>
          )}
        </div>

        {hasTime && (
          <div className="bg-[var(--canvas)] border border-[var(--line)] rounded-xl px-3 py-1.5 flex items-center">
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-transparent text-xs text-[var(--ink)] focus:outline-none cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Recurrence Shortcut Link */}
      {onOpenRepeat && (
        <div className="pt-1 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={(e) => {
              onClose();
              if (onOpenRepeat) onOpenRepeat(e);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer ${
              recurrenceRule
                ? 'bg-purple-500/15 text-purple-900 border-purple-400/40 hover:bg-purple-500/25'
                : 'bg-[var(--canvas)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]/50'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Repeat className={`w-3.5 h-3.5 ${recurrenceRule ? 'text-purple-800' : 'text-[var(--muted)]'}`} strokeWidth={2.2} />
              <span>{recurrenceRule ? `Repeats: ${formatRecurrenceLabel(recurrenceRule)}` : 'Repeat'}</span>
            </span>
            <span className="text-[10px] text-[var(--accent)] font-semibold hover:underline">Edit</span>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 text-xs font-medium transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-5 py-1.5 bg-[var(--accent)] hover:opacity-90 text-white text-xs font-semibold rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
