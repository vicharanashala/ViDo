import React from 'react';
import type { Task } from '../../../data/taskTypes';
import { getTodayQueue } from '../../../data/taskFilters';
import { TaskRow } from '../TaskRow';
import { Button } from '../../../components/ui';
import { Inbox, Maximize2 } from 'lucide-react';

export interface TodayQueueViewProps {
  tasks: Task[];
  reference?: Date;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onFocusTask: (task: Task) => void;
  onNewTaskClick?: () => void;
}

function prioritySummary(total: number, highOverdue: number, highToday: number): string {
  if (total === 0) return 'Nothing here. Take the day.';
  if (highOverdue + highToday > 0) return 'One important thing is here. The rest can wait.';
  return 'A few things are here. Start with the smallest one.';
}

const GroupHeading: React.FC<{ label: string }> = ({ label }) => (
  <div className="px-4 py-2 bg-[var(--canvas)] border-b border-[var(--line)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
    {label}
  </div>
);

export const TodayQueueView: React.FC<TodayQueueViewProps> = ({
  tasks,
  reference = new Date(),
  onTaskClick,
  onToggleComplete,
  onFocusTask,
  onNewTaskClick,
}) => {
  const queue = getTodayQueue(tasks, reference);
  const nextTask = queue.all[0] ?? null;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      <h2 className="sr-only">Today's queue</h2>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--muted)]">
          {prioritySummary(queue.all.length, queue.highOverdue, queue.highToday)}
        </p>
        <Button
          size="sm"
          variant="primary"
          onClick={() => nextTask && onFocusTask(nextTask)}
          disabled={!nextTask}
          className="shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Start with one
        </Button>
      </div>

      {queue.all.length > 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl overflow-hidden shadow-xs">
          {queue.overdue.length > 0 && (
            <section aria-labelledby="overdue-heading">
              <div id="overdue-heading">
                <GroupHeading label="Carried over" />
              </div>
              <div className="divide-y divide-[var(--line)]">
                {queue.overdue.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    onToggleComplete={onToggleComplete}
                    onFocus={onFocusTask}
                  />
                ))}
              </div>
            </section>
          )}

          {queue.today.length > 0 && (
            <section
              aria-labelledby="due-today-heading"
              className={queue.overdue.length > 0 ? 'border-t border-[var(--line)]' : ''}
            >
              <div id="due-today-heading">
                <GroupHeading label="Today" />
              </div>
              <div className="divide-y divide-[var(--line)]">
                {queue.today.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    onToggleComplete={onToggleComplete}
                    onFocus={onFocusTask}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
          <div className="w-10 h-10 rounded-full bg-[var(--canvas)] text-[var(--faint)] flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[var(--ink)]">Nothing queued</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            No tasks waiting. Add one when you are ready.
          </p>
          {onNewTaskClick && (
            <div className="mt-4">
              <Button size="sm" variant="secondary" onClick={onNewTaskClick}>
                Add a task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
