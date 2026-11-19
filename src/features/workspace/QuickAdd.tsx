import React, { useRef, useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import type { NewTaskInput, TaskPriority, TaskRecurrence } from '../../data/taskTypes';
import { parseQuickAdd } from '../../data/quickAddParser';

export interface QuickAddProps {
  onAdd: (input: NewTaskInput) => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [manualPriority, setManualPriority] = useState<TaskPriority | 'auto'>('auto');
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualDeadlineDate, setManualDeadlineDate] = useState('');
  const [manualDeadlineTime, setManualDeadlineTime] = useState('');
  const [manualRecurrence, setManualRecurrence] = useState<TaskRecurrence | ''>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const parsed = parseQuickAdd(title);
  const meta = parsed.meta;
  const effectivePriority = manualPriority === 'auto' ? parsed.priority : manualPriority;
  const effectiveDueDate = manualDueDate || parsed.dueDate;
  const effectiveDeadlineDate = manualDeadlineDate || parsed.deadlineDate;
  const effectiveDueTime = manualDeadlineTime || parsed.dueTime;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsed.title.trim()) return;
    onAdd({
      title: parsed.title,
      deadlineDate: effectiveDeadlineDate,
      recurrence: manualRecurrence || undefined,
      dueDate: effectiveDueDate,
      dueTime: effectiveDueTime,
      priority: effectivePriority,
      category: parsed.category,
    });
    setTitle('');
    setManualPriority('auto');
    setManualDueDate('');
    setManualDeadlineDate('');
    setManualDeadlineTime('');
    setManualRecurrence('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-2.5 shadow-xs"
      aria-label="Quick add task"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 px-1.5">
          <Plus className="w-4 h-4 text-[var(--accent)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={'Add a task… try "in 45 min" or "walk on 1 Dec"'}
            aria-label="New task title"
            className="w-full bg-transparent text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none py-1.5"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!parsed.title.trim()}
          className="shrink-0"
        >
          Add
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-1.5 pt-2 pb-0.5">
        {title.trim() && (
          <>
            <label htmlFor="quick-add-priority" className="text-[10px] font-semibold text-[var(--muted)]">
              Priority
            </label>
            <select
              id="quick-add-priority"
              value={manualPriority}
              onChange={(event) => setManualPriority(event.target.value as TaskPriority | 'auto')}
              className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <option value="auto">Auto</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </>
        )}

        <details className="relative">
            <summary className="inline-flex list-none items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--ink)] cursor-pointer hover:bg-[var(--canvas)]">
              <CalendarDays className="h-3 w-3" /> Calendar
            </summary>
            <div className="absolute left-0 top-full z-40 mt-1 w-72 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-xl">
              <label className="block text-[10px] font-semibold text-[var(--muted)]">
                Planned date
                <input
                  type="date"
                  value={manualDueDate}
                  onChange={(event) => setManualDueDate(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--canvas)] px-2 py-1 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </label>
              <label className="mt-2 block text-[10px] font-semibold text-[var(--muted)]">
                Deadline date
                <input
                  type="date"
                  value={manualDeadlineDate}
                  onChange={(event) => {
                    setManualDeadlineDate(event.target.value);
                    if (!event.target.value) setManualRecurrence('');
                  }}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--canvas)] px-2 py-1 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </label>
              <label className="mt-2 block text-[10px] font-semibold text-[var(--muted)]">
                Deadline time
                <input
                  type="time"
                  value={manualDeadlineTime}
                  onChange={(event) => setManualDeadlineTime(event.target.value)}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--canvas)] px-2 py-1 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </label>
              <label className="mt-2 block text-[10px] font-semibold text-[var(--muted)]">
                Repeat until deadline
                <select
                  value={manualRecurrence}
                  onChange={(event) => setManualRecurrence(event.target.value as TaskRecurrence | '')}
                  disabled={!effectiveDeadlineDate}
                  className="mt-1 w-full rounded-md border border-[var(--line)] bg-[var(--canvas)] px-2 py-1 text-xs text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
                >
                  <option value="">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
              <p className="mt-2 text-[10px] text-[var(--faint)]">
                Leave a field blank to use the dates in your sentence.
              </p>
            </div>
          </details>
        {title.trim() && (
          <>
            {meta.dateLabel && <Badge size="sm">{meta.dateLabel}</Badge>}
            {meta.timeLabel && <Badge size="sm">{meta.timeLabel}</Badge>}
            {manualPriority === 'auto' && meta.priority && (
              <Badge
                size="sm"
                variant={meta.priority === 'high' ? 'danger' : meta.priority === 'medium' ? 'warning' : 'neutral'}
              >
                {meta.priority}
              </Badge>
            )}
            {meta.category && <Badge size="sm" variant="accent">{meta.category}</Badge>}
            {(meta.dateLabel || meta.timeLabel || meta.priority || meta.category) && (
              <span className="text-[10px] text-[var(--faint)]">Parsed from your sentence</span>
            )}
          </>
        )}
      </div>
    </form>
  );
};
