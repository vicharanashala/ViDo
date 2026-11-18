import React from 'react';
import type { Task } from '../../data/taskTypes';
import { Badge, Card } from '../../components/ui';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { getTaskPace, isDueToday, isOverdue, paceTone, relativeDayLabel } from '../../data/taskDates';
import { DoodleTitle } from './doodles/DoodleTitle';

export interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const isCompleted = task.state === 'completed';
  const overdue = isOverdue(task);
  const dueToday = isDueToday(task);
  const pace = getTaskPace(task);

  return (
    <Card
      hoverable
      onClick={() => onClick(task)}
      className="p-4 flex flex-col justify-between transition-all group"
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
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="neutral" size="sm" className="uppercase tracking-wider font-semibold text-[10px]">
            {task.category}
          </Badge>

          <div className="flex items-center gap-1.5">
            {task.priority && (
              <Badge
                size="sm"
                variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'neutral'}
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
          className={`text-[10px] font-semibold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors ${
            isCompleted ? 'line-through opacity-70' : ''
          }`}
        >
          <DoodleTitle title={task.title} category={task.category} customImageKey={task.customImageKey} size="md" />
        </h4>

        {task.description && (
          <p className="text-xs text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--faint)] mb-1">
          <span>Progress</span>
          <span>{task.progress}%</span>
        </div>
        <div className="h-1.5 bg-[var(--canvas)] rounded-full overflow-hidden border border-[var(--line)]">
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${task.progress}%` }} />
        </div>
      </div>

      <div className="mt-3.5 pt-2.5 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {overdue ? (
            <span className="text-[var(--red)] font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {relativeDayLabel(task.dueDate)}
            </span>
          ) : dueToday ? (
            <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              Today {task.dueTime ? `at ${task.dueTime}` : ''}
            </span>
          ) : isCompleted ? (
            <span className="text-[var(--green)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Delivered
            </span>
          ) : (
            <span>{relativeDayLabel(task.dueDate)}</span>
          )}
        </div>

        <Badge size="sm" variant={paceTone(pace.status)}>
          {pace.label}
        </Badge>
      </div>
    </Card>
  );
};
