import React from 'react';
import type { Task } from '../../data/taskTypes';
import { AlertCircle, ArrowRight, CalendarDays, CheckCircle2, Clock, ListChecks, Maximize2, RotateCcw } from 'lucide-react';
import { formatTimeLabel, isDueTimePassed, isDueToday, isPastDay, relativeDayLabel } from '../../data/taskDates';
import { DoodleTitle } from './doodles/DoodleTitle';

export interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onFocus?: (task: Task) => void;
  onCheckInStart?: (task: Task) => void;
  onBringToToday?: (task: Task) => void;
  onSchedule?: (task: Task, dateKey: string) => void;
  onOpenPath?: (taskId: string) => void;
  now?: Date;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onClick,
  onToggleComplete,
  onFocus,
  onCheckInStart,
  onBringToToday,
  onSchedule,
  onOpenPath,
  now = new Date(),
}) => {
  const isCompleted = task.state === 'completed';
  const parked = Boolean(task.parkedAt);
  const deadlineDay = task.recurrence ? task.dueDate : task.deadlineDate ?? task.dueDate;
  const pastDay = !parked && isPastDay(task, now);
  const dueToday = isDueToday({ dueDate: deadlineDay }, now);
  const dueTimePassed = !parked && isDueTimePassed(task, now);
  const pending = pastDay || dueTimePassed;
  const barColor = isCompleted ? 'var(--green)' : 'var(--accent)';
  const dueTodayLabel = task.dueTime ? `Today ${formatTimeLabel(task.dueTime)}` : 'Today';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(task)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter') {
          event.preventDefault();
          onClick(task);
        }
        if (event.key === ' ') {
          event.preventDefault();
          if (isCompleted) onToggleComplete?.(task);
          else onCheckInStart?.(task);
        }
        if (event.key.toLowerCase() === 'f') {
          event.preventDefault();
          onFocus?.(task);
        }
        if (event.key.toLowerCase() === 'c') {
          event.preventDefault();
          if (!isCompleted) onCheckInStart?.(task);
        }
      }}
      aria-label={`Task: ${task.title}`}
      aria-keyshortcuts="Enter Space F C"
      className="group @container flex h-full flex-col gap-2.5 @[380px]:gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-3 @[380px]:p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/25 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transform-none cursor-pointer select-none"
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isCompleted) onToggleComplete?.(task);
            else onCheckInStart?.(task);
          }}
          aria-label={isCompleted ? `Reopen ${task.title}` : `Check in ${task.title}`}
          title={isCompleted ? `Reopen ${task.title}` : 'Check in — drag the image or click here'}
          className="mt-0.5 shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          {isCompleted ? (
            <span className="w-5 h-5 rounded-full bg-[var(--green-soft)] text-[var(--green)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          ) : pastDay ? (
            <span className="w-5 h-5 rounded-full bg-[var(--amber-soft)] text-[var(--amber)] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full border-2 border-[var(--line)] group-hover:border-[var(--accent)] transition-colors block" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5">
            {task.priority === 'high' && !isCompleted && (
              <span
                role="img"
                aria-label="Important"
                title="Important"
                className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
              />
            )}
            <span
              draggable={!isCompleted}
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', task.id);
                event.dataTransfer.effectAllowed = 'move';
                onCheckInStart?.(task);
              }}
              title={isCompleted ? task.title : 'Drag to check in'}
              className={`inline-flex min-w-0 flex-1 cursor-grab active:cursor-grabbing ${
                isCompleted ? 'cursor-default' : ''
              }`}
            >
              <DoodleTitle
                title={task.title}
                category={task.category}
                customImageKey={task.customImageKey}
                size="md"
                wrapTitle
                className={`text-xs @[380px]:text-[13px] font-semibold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors ${
                  isCompleted ? 'line-through opacity-60' : ''
                }`}
                onImageClick={
                  isCompleted
                    ? undefined
                    : (event) => {
                        event.stopPropagation();
                        onCheckInStart?.(task);
                      }
                }
              />
            </span>
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <p className="mt-1 flex items-center gap-1 text-[10px] text-[var(--muted)]">
              <ListChecks className="h-3 w-3" />
              {task.subtasks.filter((subtask) => subtask.done).length}/{task.subtasks.length} steps
            </p>
          )}

          {pending && !isCompleted && onOpenPath && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenPath(task.id);
              }}
              className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
            >
              Break into steps <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {(onBringToToday || onSchedule) && !isCompleted && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {onBringToToday && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onBringToToday(task);
                  }}
                  aria-label={`Do ${task.title} today`}
                  className="inline-flex w-fit items-center rounded-md border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer"
                >
                  Will do it today
                </button>
              )}
              {onSchedule && (
                <label
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--muted)]"
                >
                  <CalendarDays className="h-3 w-3" />
                  <span className="sr-only">Move {task.title} to date</span>
                  <input
                    type="date"
                    onChange={(event) => {
                      event.stopPropagation();
                      if (event.target.value) onSchedule(task, event.target.value);
                    }}
                    aria-label={`Move ${task.title} to date`}
                    className="w-[112px] bg-transparent text-[10px] text-[var(--ink)] focus:outline-none"
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {onFocus && !isCompleted && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFocus(task);
            }}
            aria-label={`Begin ${task.title}`}
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1.5 text-[var(--muted)] opacity-100 transition-all hover:text-[var(--ink)] sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between text-[10px] @[380px]:text-[11px] font-mono text-[var(--faint)]">
            <span>Progress</span>
            <span style={{ color: barColor }} className="font-semibold">
              {task.progress}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--canvas)]">
            <div
              className="h-full rounded-full transition-all motion-reduce:transition-none"
              style={{ width: `${task.progress}%`, backgroundColor: barColor }}
            />
          </div>
          {dueTimePassed && (
            <p className="mt-1 text-[9px] leading-tight text-[var(--muted)]">Hope you got it done.</p>
          )}
        </div>

        <div className="shrink-0 text-right font-mono text-[11px] @[420px]:text-xs">
          {isCompleted ? (
            <span className="text-[var(--green)] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 check-pop" />
              Done
            </span>
          ) : parked ? (
            <span className="text-[var(--muted)] inline-flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              Pick up again
            </span>
          ) : pending ? (
            <span className="text-[var(--amber)] font-semibold inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Pending
            </span>
          ) : dueToday ? (
            <span className="text-[var(--accent)] font-bold inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {dueTodayLabel}
            </span>
          ) : task.deadlineDate && !task.recurrence ? (
            <span className="font-bold text-[var(--accent)]">By {relativeDayLabel(deadlineDay, now)}{task.dueTime ? ` · ${formatTimeLabel(task.dueTime)}` : ''}</span>
          ) : (
            <span className="text-[var(--muted)]">{relativeDayLabel(task.dueDate, now)}{task.dueTime ? ` · ${formatTimeLabel(task.dueTime)}` : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};
