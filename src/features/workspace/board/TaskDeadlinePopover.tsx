import React, { useState, useRef, useEffect } from 'react';
import { CalendarClock, X, Check, Trash2 } from 'lucide-react';
import { PopoverPosition } from './TaskDatePopover';
import { getTodayDateString } from '../../../utils/dateUtils';

export interface TaskDeadlinePopoverProps {
  isOpen: boolean;
  initialDeadline?: string | null;
  position: PopoverPosition | null;
  onClose: () => void;
  onSave: (deadlineStr: string | null) => void;
}

function parseInitialDeadline(initialDeadline?: string | null): {
  dateStr: string;
  timeStr: string;
} {
  const today = getTodayDateString();
  if (!initialDeadline || !initialDeadline.trim()) {
    return { dateStr: today, timeStr: '23:59' };
  }
  const parts = initialDeadline.trim().split(' ');
  const dateStr = parts[0] || today;
  const timeStr = parts[1] || '23:59';
  return { dateStr, timeStr };
}

export const TaskDeadlinePopover: React.FC<TaskDeadlinePopoverProps> = ({
  isOpen,
  initialDeadline,
  position,
  onClose,
  onSave,
}) => {
  const parsed = parseInitialDeadline(initialDeadline);
  const [selectedDate, setSelectedDate] = useState<string>(parsed.dateStr);
  const [selectedTime, setSelectedTime] = useState<string>(parsed.timeStr);

  const popoverRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number }>(() => {
    const estimatedHeight = 360;
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
    const height = rect.height > 0 ? rect.height : 360;
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
  }, [isOpen, position]);

  useEffect(() => {
    if (isOpen) {
      const p = parseInitialDeadline(initialDeadline);
      setSelectedDate(p.dateStr);
      setSelectedTime(p.timeStr);
    }
  }, [initialDeadline, isOpen]);

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
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  const setQuickDate = (daysToAdd: number) => {
    try {
      const d = new Date();
      d.setDate(d.getDate() + daysToAdd);
      setSelectedDate(d.toISOString().substring(0, 10));
      setSelectedTime('23:59');
    } catch {}
  };

  const handleSave = () => {
    if (!selectedDate) {
      onSave(null);
      return;
    }
    onSave(`${selectedDate} ${selectedTime || '23:59'}`);
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Set deadline"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 60,
        maxHeight: 'calc(100vh - 32px)',
      }}
      className="w-80 bg-[var(--surface)] border border-rose-500/30 rounded-2xl shadow-2xl p-4 flex flex-col space-y-3.5 animate-in fade-in zoom-in-95 duration-150 text-[var(--ink)] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
        <div className="flex items-center space-x-2 text-rose-600 font-semibold text-sm">
          <CalendarClock className="w-4 h-4 shrink-0" />
          <span>Set Deadline</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[var(--muted)] hover:text-[var(--ink)] rounded-full hover:bg-[var(--canvas)] transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
        <button
          type="button"
          onClick={() => setQuickDate(0)}
          className="px-2.5 py-1 text-xs rounded-full bg-[var(--canvas)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
        >
          Today (23:59)
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(1)}
          className="px-2.5 py-1 text-xs rounded-full bg-[var(--canvas)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
        >
          Tomorrow (23:59)
        </button>
        <button
          type="button"
          onClick={() => setQuickDate(7)}
          className="px-2.5 py-1 text-xs rounded-full bg-[var(--canvas)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
        >
          Next Week (23:59)
        </button>
      </div>

      {/* Date & Time Picker */}
      <div className="space-y-2 pt-1">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
            Target Deadline Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-[var(--canvas)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-rose-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
            Deadline Time
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full bg-[var(--canvas)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Note about mutual exclusivity */}
      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 leading-snug">
        Setting a deadline disables repeating recurrence on this task.
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
        <button
          type="button"
          onClick={() => {
            onSave(null);
            onClose();
          }}
          className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Set Deadline</span>
        </button>
      </div>
    </div>
  );
};
