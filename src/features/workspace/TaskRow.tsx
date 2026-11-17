import React from 'react';
import type { Task } from '../../data/taskTypes';
import { AlertCircle, CheckCircle2, Clock, Maximize2 } from 'lucide-react';
import { getTaskPace, isDueToday, isOverdue, relativeDayLabel } from '../../data/taskDates';
import { DoodleTitle } from './doodles/DoodleTitle';

export interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onFocus?: (task: Task) => void;
  now?: Date;
}

function progressColor(status: ReturnType<typeof getTaskPace>['status']): string {
  if (status === 'done' || status === 'ahead') return 'var(--green)';
  if (status === 'behind') return 'var(--red)';
  if (status === 'at-risk') return 'var(--amber)';
  return 'var(--accent)';
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onClick,
  onToggleComplete,
  onFocus,
  now = new Date(),
}) => {
  const isCompleted = task.state === 'completed';
  const overdue = isOverdue(task, now);
  const dueToday = isDueToday(task, now);
  const pace = getTaskPace(task, now);
  const barColor = progressColor(pace.status);
  const dueTodayLabel = task.dueTime ? `Today ${task.dueTime}` : 'Today';

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
          onToggleComplete?.(task);
        }
        if (event.key.toLowerCase() === 'f') {
          event.preventDefault();
          onFocus?.(task);
        }
      }}
      aria-label={`Task: ${task.title}`}
      aria-keyshortcuts="Enter Space F"
      className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--canvas)]/60 transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleComplete?.(task);
          }}
          aria-label={isCompleted ? `Reopen ${task.title}` : `Mark ${task.title} complete`}
          className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] cursor-pointer"
        >
          {isCompleted ? (
            <span className="w-5 h-5 rounded-full bg-[var(--green-soft)] text-[var(--green)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          ) : overdue ? (
            <span className="w-5 h-5 rounded-full bg-[var(--red-soft)] text-[var(--red)] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full border-2 border-[var(--line)] group-hover:border-[var(--accent)] transition-colors block" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {task.priority === 'high' && !isCompleted && (
              <span
                role="img"
                aria-label="High priority"
                title="High priority"
                className="w-1.5 h-1.5 rounded-full bg-[var(--red)] shrink-0"
              />
            )}
            <DoodleTitle
              title={task.title}
              size="md"
              className={`text-[10px] font-semibold text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors ${
                isCompleted ? 'line-through opacity-60' : ''
              }`}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="w-20 sm:w-24">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--faint)] mb-1">
            <span className="hidden sm:inline">Progress</span>
            <span style={{ color: barColor }} className="font-semibold ml-auto">
              {task.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--line)]">
            <div
              className="h-full rounded-full transition-all motion-reduce:transition-none"
              style={{ width: `${task.progress}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        <div className="text-right font-mono text-[11px] min-w-[86px]">
          {isCompleted ? (
            <span className="text-[var(--green)] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 check-pop" />
              Delivered
            </span>
          ) : overdue ? (
            <span className="text-[var(--red)] font-semibold inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {dueToday ? dueTodayLabel : relativeDayLabel(task.dueDate, now)}
            </span>
          ) : dueToday ? (
            <span className="text-[var(--accent)] font-semibold inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {dueTodayLabel}
            </span>
          ) : (
            <span className="text-[var(--muted)]">{relativeDayLabel(task.dueDate, now)}</span>
          )}
        </div>

        {onFocus && !isCompleted && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onFocus(task);
            }}
            aria-label={`Focus ${task.title}`}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[10px] font-semibold text-[var(--muted)] opacity-0 pointer-events-none transition-opacity group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto hover:text-[var(--ink)]"
          >
            <Maximize2 className="w-3 h-3" /> Focus
          </button>
        )}
      </div>
    </div>
  );
};
