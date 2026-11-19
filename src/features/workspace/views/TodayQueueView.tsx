import React from 'react';
import type { Task } from '../../../data/taskTypes';
import { getTodayQueue, pickTodayRecommendations } from '../../../data/taskFilters';
import { TaskRow } from '../TaskRow';
import { Button } from '../../../components/ui';
import { Inbox, Maximize2 } from 'lucide-react';

export interface TodayQueueViewProps {
  tasks: Task[];
  reference?: Date;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onFocusTask: (task: Task) => void;
  onCheckInStart?: (task: Task) => void;
  onBringToToday?: (task: Task) => void;
  onScheduleTask?: (task: Task, dateKey: string) => void;
  onOpenPath?: (taskId: string) => void;
  onNewTaskClick?: () => void;
}

const TODAY_QUOTE = 'Small steps still count. Begin where it feels lightest.';

export const TodayQueueView: React.FC<TodayQueueViewProps> = ({
  tasks,
  reference = new Date(),
  onTaskClick,
  onToggleComplete,
  onFocusTask,
  onCheckInStart,
  onBringToToday,
  onScheduleTask,
  onOpenPath,
  onNewTaskClick,
}) => {
  const queue = getTodayQueue(tasks, reference);
  const recommendations = onBringToToday ? pickTodayRecommendations(tasks, reference) : [];
  const nextTask = queue.all[0] ?? null;
  const taskCountLabel =
    queue.all.length === 0
      ? 'A clear day.'
      : `${queue.all.length} task${queue.all.length === 1 ? '' : 's'} due today.`;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      <h2 className="sr-only">Today's queue</h2>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--ink)]">{taskCountLabel}</p>
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
            Tasks due today, plus deadline work you can start now. Earlier tasks are in Past.
          </p>
          {queue.highToday > 0 && (
            <p className="mt-1 text-[11px] font-medium text-[var(--muted)]">
              One important thing is here. The rest can wait.
            </p>
          )}
        </div>
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

      <p className="text-[11px] text-[var(--muted)]">
        Drag a task image into a check-in zone, or click the circle to check in.
      </p>

      {queue.today.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {queue.today.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onToggleComplete={onToggleComplete}
              onFocus={onFocusTask}
              onCheckInStart={onCheckInStart}
              onOpenPath={onOpenPath}
            />
          ))}
        </div>
      ) : (
        <div className="p-10 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
          <div className="w-10 h-10 rounded-full bg-[var(--canvas)] text-[var(--faint)] flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-[var(--ink)]">Nothing queued</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            No tasks waiting for today. Add one when you are ready.
          </p>
          <p className="mt-2 text-xs font-medium text-[var(--accent)]">{TODAY_QUOTE}</p>
          {onNewTaskClick && (
            <div className="mt-4">
              <Button size="sm" variant="secondary" onClick={onNewTaskClick}>
                Add a task
              </Button>
            </div>
          )}
        </div>
      )}

      {recommendations.length > 0 && (
        <section aria-labelledby="recommendations-heading" className="space-y-2">
          <div>
            <h3 id="recommendations-heading" className="text-xs font-semibold text-[var(--ink)]">
              From earlier
            </h3>
            <p className="text-[11px] text-[var(--muted)]">
              A few suggestions from earlier. Pick one for today, or leave them where they are.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommendations.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={onTaskClick}
                onToggleComplete={onToggleComplete}
                onFocus={onFocusTask}
                onCheckInStart={onCheckInStart}
                onBringToToday={onBringToToday}
                onSchedule={onScheduleTask}
                onOpenPath={onOpenPath}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
