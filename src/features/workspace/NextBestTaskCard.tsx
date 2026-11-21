import React from 'react';
import { SampleTask } from '../../data/sampleTasks';
import { rankNextTasks } from '../../data/taskRecommendations';
import { Badge } from '../../components/ui';

export interface NextBestTaskCardProps {
  tasks?: SampleTask[];
  now?: Date;
  onTaskClick?: (task: SampleTask) => void;
  onOpenTask?: (task: SampleTask) => void;
  className?: string;
}

export const NextBestTaskCard: React.FC<NextBestTaskCardProps> = ({
  tasks = [],
  now = new Date(),
  onTaskClick,
  onOpenTask,
  className = '',
}) => {
  const ranked = rankNextTasks(tasks, now, 1);
  const best = ranked[0];

  const openTask = () => {
    if (!best) return;
    const handler = onTaskClick ?? onOpenTask;
    handler?.(best.task);
  };

  return (
    <section className={`bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs ${className}`}>
      <h3 className="text-sm font-bold text-[var(--ink)] mb-3">Next Best Task</h3>

      {!best ? (
        <p className="text-xs text-[var(--muted)]">No pending tasks.</p>
      ) : (
        <button
          type="button"
          onClick={openTask}
          className="w-full text-left rounded-lg p-3 bg-[var(--canvas)] border border-[var(--line)] hover:border-[var(--accent)] transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-sm font-semibold text-[var(--ink)] truncate">{best.task.title}</span>
            {best.task.priority && (
              <Badge size="sm" variant={best.task.priority === 'high' ? 'danger' : best.task.priority === 'medium' ? 'warning' : 'neutral'}>
                {best.task.priority}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mb-1.5">{best.reason}</p>
          <p className="text-[11px] font-mono text-[var(--faint)]">
            Due {best.task.dueDate}{best.task.dueTime ? ` at ${best.task.dueTime}` : ''}
          </p>
        </button>
      )}
    </section>
  );
};

NextBestTaskCard.displayName = 'NextBestTaskCard';
