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

const TODAY_QUOTE = '“Small steps still count. Begin where it feels lightest.”';

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
  const priorityNote =
    queue.all.length === 0
      ? 'Nothing here. Take the day.'
      : queue.highToday > 0
        ? 'One important thing is here. The rest can wait.'
        : null;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      <h2 className="sr-only">Today's queue</h2>

      <div className="flex flex-col items-center gap-2 text-center">
        <p className="max-w-2xl text-base sm:text-lg font-extrabold leading-snug tracking-tight text-[var(--accent)]">
          {TODAY_QUOTE}
        </p>
        {priorityNote && (
          <p className="text-xs font-medium text-[var(--muted)]">{priorityNote}</p>
        )}
        <Button
          size="sm"
          variant="primary"
          onClick={() => nextTask && onFocusTask(nextTask)}
          disabled={!nextTask}
          className="mt-1 shrink-0"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Start with one
        </Button>
      </div>

      <p className="text-[11px] text-[var(--muted)]">
        Tasks due today, plus deadline work you can start now. Earlier tasks are in Past.
      </p>
      <p className="text-[11px] text-[var(--muted)]">
        Drag a task image into a zone, or click the circle to check in.
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
          <p className="text-sm font-semibold text-[var(--ink)]">Nothing due today</p>
          <p className="text-xs text-[var(--muted)] mt-1">
            No tasks waiting for today. Add one when you are ready.
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
