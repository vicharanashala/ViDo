import React from 'react';
import { SampleTask } from '../../data/sampleTasks';
import { Badge, Card } from '../../components/ui';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dateUtils';

export interface TaskCardProps {
  task: SampleTask;
  onClick: (task: SampleTask) => void;
  isPreview?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isPreview = true }) => {
  const todayStr = getTodayDateString();
  const currentTimeStr = getCurrentTimeString();
  const isCompleted = task.state === 'completed';
  const isDueToday =
    task.state === 'active' &&
    (task.dueDate === todayStr || (isPreview && task.dueDate === '2026-11-17')) &&
    (!task.dueTime || task.dueDate !== todayStr || task.dueTime >= currentTimeStr);
  const isOverdue =
    task.state === 'active' &&
    ((task.dueDate < todayStr && (!isPreview || task.dueDate < '2026-11-17')) ||
      (task.dueDate === todayStr && !!task.dueTime && task.dueTime < currentTimeStr));

  return (
    <Card
      hoverable
      onClick={() => onClick(task)}
      className="p-5 flex flex-col justify-between transition-all group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
      aria-label={`Task: ${task.title}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <Badge
            variant="neutral"
            size="sm"
            className="uppercase tracking-wider font-semibold text-xs px-2.5 py-0.5"
          >
            {task.category}
          </Badge>

          <div className="flex items-center gap-1.5">
            {task.priority && (
              <Badge
                size="sm"
                variant={
                  task.priority === 'high'
                    ? 'danger'
                    : task.priority === 'medium'
                    ? 'warning'
                    : 'neutral'
                }
              >
                {task.priority}
              </Badge>
            )}

            {isCompleted && (
              <Badge size="sm" variant="success">
                Done
              </Badge>
            )}
          </div>
        </div>

        <h4
          className={`text-base font-semibold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors ${
            isCompleted ? 'line-through opacity-70' : ''
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="text-sm text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5 font-mono text-xs">
          {isOverdue ? (
            <span className="text-[var(--red)] font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Overdue ({task.dueDate})
            </span>
          ) : isDueToday ? (
            <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
              <Clock className="w-4 h-4 shrink-0" />
              Today {task.dueTime ? `at ${task.dueTime}` : ''}
            </span>
          ) : isCompleted ? (
            <span className="text-[var(--green)] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Completed
            </span>
          ) : (
            <span>Due {task.dueDate}</span>
          )}
        </div>

        {task.checkpoints && task.checkpoints.length > 0 && (
          <span className="text-xs text-[var(--faint)]">
            {task.checkpoints.length} update{task.checkpoints.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </Card>
  );
};

