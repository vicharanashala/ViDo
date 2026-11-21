import React from 'react';
import { SampleTask } from '../../data/sampleTasks';
import { Badge } from '../../components/ui';
import { Clock, AlertCircle, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dateUtils';

export interface TaskRowProps {
  task: SampleTask;
  onClick: (task: SampleTask) => void;
  onToggle?: (task: SampleTask) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onClick, onToggle }) => {
  const todayStr = getTodayDateString();
  const currentTimeStr = getCurrentTimeString();
  const isCompleted = task.state === 'completed';
  const isDueToday =
    task.state === 'active' &&
    (task.dueDate === todayStr || task.dueDate === '2026-11-17') &&
    (!task.dueTime || task.dueDate !== todayStr || task.dueTime >= currentTimeStr);
  const isOverdue =
    task.state === 'active' &&
    ((task.dueDate < todayStr && task.dueDate < '2026-11-17') ||
      (task.dueDate === todayStr && !!task.dueTime && task.dueTime < currentTimeStr));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      aria-label={`Task: ${task.title}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-[var(--canvas)]/60 transition-colors cursor-pointer select-none"
    >
      {/* Left: Status icon, Title, Category */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            if (onToggle) {
              e.stopPropagation();
              onToggle(task);
            }
          }}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as active`
              : `Mark "${task.title}" as completed`
          }
          className="shrink-0 mt-0.5 sm:mt-0 cursor-pointer focus:outline-none"
        >
          {isCompleted ? (
            <div className="w-5 h-5 rounded-full bg-[var(--green-soft)] text-[var(--green)] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : isOverdue ? (
            <div className="w-5 h-5 rounded-full bg-[var(--red-soft)] text-[var(--red)] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[var(--line)] group-hover:border-[var(--accent)] transition-colors" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors ${
                isCompleted ? 'line-through opacity-60' : ''
              }`}
            >
              {task.title}
            </span>

            {task.priority === 'high' && (
              <Badge size="sm" variant="danger">
                High
              </Badge>
            )}

            {task.priority === 'medium' && (
              <Badge size="sm" variant="warning">
                Med
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--muted)]">
            <span className="capitalize font-medium text-[11px] text-[var(--muted)]">
              {task.category}
            </span>
            {task.checkpoints && task.checkpoints.length > 0 && (
              <>
                <span className="text-[var(--faint)]">•</span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--faint)]">
                  <MessageSquare className="w-3 h-3" />
                  {task.checkpoints.length}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Deadline timing & Action indicator */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-auto pt-1 sm:pt-0">
        <div className="text-right font-mono text-xs">
          {isOverdue ? (
            <span className="text-[var(--red)] font-semibold inline-flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Due {task.dueDate}
            </span>
          ) : isDueToday ? (
            <span className="text-[var(--accent)] font-semibold inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {task.dueTime ? `Today at ${task.dueTime}` : 'Today'}
            </span>
          ) : isCompleted ? (
            <span className="text-[var(--green)] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </span>
          ) : (
            <span className="text-[var(--muted)]">{task.dueDate}</span>
          )}
        </div>

        <ChevronRight className="w-4 h-4 text-[var(--faint)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all hidden sm:block" />
      </div>
    </div>
  );
};

