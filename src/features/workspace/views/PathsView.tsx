import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ListChecks, Sparkles } from 'lucide-react';
import type { Task } from '../../../data/taskTypes';
import { getFilteredTasks } from '../../../data/taskFilters';
import { DoodleTitle } from '../doodles/DoodleTitle';

export interface PathsViewProps {
  tasks: Task[];
  reference?: Date;
}

const PathCard: React.FC<{ task: Task }> = ({ task }) => {
  const subtasks = task.subtasks ?? [];
  const done = subtasks.filter((subtask) => subtask.done).length;
  const deadline = task.deadlineDate ?? task.dueDate;

  return (
    <Link
      to={`/app/tasks/${task.id}/path`}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/95 p-3 shadow-xs transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/30 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <ListChecks className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1 text-xs font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--accent)]">
          <DoodleTitle
            title={task.title}
            category={task.category}
            customImageKey={task.customImageKey}
            size="md"
            wrapTitle
          />
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[10px]">
        <span className="rounded-full border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-2 py-0.5 font-bold text-[var(--accent)]">
          {task.deadlineDate ? 'Deadline' : 'Planned'} {deadline}
        </span>
        {task.recurrence && (
          <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2 py-0.5 text-[var(--muted)]">
            Repeats {task.recurrence}
          </span>
        )}
        <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2 py-0.5 text-[var(--muted)]">
          {subtasks.length ? `${done}/${subtasks.length} steps` : 'No steps yet'}
        </span>
      </div>

      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)]">
        Open path <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
};

const PathGroup: React.FC<{ title: string; description: string; tasks: Task[] }> = ({
  title,
  description,
  tasks,
}) => {
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-2.5">
      <div>
        <h2 className="text-lg font-bold text-[var(--ink)]">{title}</h2>
        <p className="text-[11px] text-[var(--muted)]">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tasks.map((task) => (
          <PathCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
};

export const PathsView: React.FC<PathsViewProps> = ({ tasks, reference = new Date() }) => {
  const views = getFilteredTasks(tasks, reference);
  const today = views.today;
  const upcoming = views.upcoming;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--ink)]">Task paths</h1>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Choose a task for today or later, then break it into small steps. The path assistant
              can draft a route when the first move is hard to see.
            </p>
          </div>
        </div>
      </section>

      <PathGroup
        title="Today"
        description="Pick one task to shape for today."
        tasks={today}
      />
      <PathGroup
        title="Upcoming"
        description="Future tasks you can prepare in advance."
        tasks={upcoming}
      />

      {today.length === 0 && upcoming.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <p className="text-sm font-semibold text-[var(--ink)]">No tasks to shape yet</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Add a task for today or later, then come back to build its path.
          </p>
        </div>
      )}
    </div>
  );
};
