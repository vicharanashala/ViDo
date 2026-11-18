import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { Task } from '../../data/taskTypes';
import { getFilteredTasks } from '../../data/taskFilters';
import { Button } from '../../components/ui';
import { DoodleTitle } from './doodles/DoodleTitle';
import { PathAssistantModal } from './PathAssistantModal';

export interface TaskPathViewProps {
  tasks: Task[];
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskPathView: React.FC<TaskPathViewProps> = ({
  tasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p className="text-sm text-[var(--muted)]">That task is no longer here.</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => navigate('/app/today')}>
          Back to Today
        </Button>
      </div>
    );
  }

  const subtasks = task.subtasks ?? [];
  const done = subtasks.filter((subtask) => subtask.done).length;
  const allDone = subtasks.length > 0 && done === subtasks.length;
  const currentIndex = subtasks.findIndex((subtask) => !subtask.done);
  const deadline = task.deadlineDate ?? task.dueDate;
  const views = getFilteredTasks(tasks);
  const pathTasks = [...views.today, ...views.upcoming].filter(
    (item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index
  );
  const selectorTasks = pathTasks.some((item) => item.id === task.id)
    ? pathTasks
    : [task, ...pathTasks];

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAddSubtask(task.id, title);
    setTitle('');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => navigate('/app/paths')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All paths
        </button>
        <label className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--muted)]">
          Switch task
          <select
            value={task.id}
            onChange={(event) => navigate(`/app/tasks/${event.target.value}/path`)}
            className="max-w-[220px] rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[11px] font-medium text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            {selectorTasks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Quest path</p>
          {allDone && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--green)]">
              <Sparkles className="h-3 w-3" /> Quest complete
            </span>
          )}
        </div>
        <h1 className="mt-1 text-xl font-extrabold text-[var(--ink)]">
          <DoodleTitle
            title={task.title}
            category={task.category}
            customImageKey={task.customImageKey}
            size="lg"
          />
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--line)] bg-[var(--canvas)] px-2 py-0.5">
            {task.recurrence ? `Repeats ${task.recurrence}` : 'One-time task'}
          </span>
          <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-2 py-0.5 font-bold text-[var(--accent)]">
            Deadline {deadline}{task.dueTime ? ` · ${task.dueTime}` : ''}
          </span>
          <span>
            {done} of {subtasks.length} steps done
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full border border-[var(--line)] bg-[var(--canvas)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: subtasks.length ? `${Math.round((done / subtasks.length) * 100)}%` : '0%' }}
          />
        </div>
        {subtasks.length > 0 && (
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {subtasks.map((subtask, index) => (
              <span
                key={subtask.id}
                className={`h-1.5 flex-1 rounded-full ${
                  subtask.done
                    ? 'bg-[var(--green)]'
                    : index === currentIndex
                      ? 'bg-[var(--accent)]'
                      : 'bg-[var(--line)]'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="path-steps-heading" className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="path-steps-heading" className="text-lg font-bold text-[var(--ink)]">
              Quest steps
            </h2>
            <p className="text-[11px] text-[var(--muted)]">
              One station at a time. The next move is enough.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--accent)] hover:border-[var(--accent)] cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" /> Not sure? Break it down
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a step…"
            aria-label="New path step"
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none"
          />
          <Button type="submit" size="sm" variant="primary" disabled={!title.trim()}>
            <Plus className="w-3.5 h-3.5" /> Add step
          </Button>
        </form>

        {subtasks.length > 0 ? (
          <ol className="grid gap-4 sm:grid-cols-2">
            {subtasks.map((subtask, index) => (
              <li
                key={subtask.id}
                className={`flex items-center gap-2.5 rounded-2xl border p-3 shadow-xs transition-all ${
                  subtask.done
                    ? 'border-[var(--green)]/30 bg-[var(--green-soft)]/45'
                    : index === currentIndex
                      ? 'border-[var(--accent)]/35 bg-[var(--surface)] ring-2 ring-[var(--accent)]/15'
                      : 'border-[var(--line)] bg-[var(--surface)]'
                }`}
              >
                <span className="w-5 shrink-0 text-[10px] font-mono text-[var(--faint)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => onToggleSubtask(task.id, subtask.id)}
                  aria-label={subtask.done ? `Reopen ${subtask.title}` : `Complete ${subtask.title}`}
                  className="shrink-0 text-[var(--accent)] cursor-pointer"
                >
                  {subtask.done ? (
                    <CheckCircle2 className="h-5 w-5 check-pop" />
                  ) : (
                    <Circle className="h-5 w-5 text-[var(--faint)]" />
                  )}
                </button>
                <span
                  className={`min-w-0 flex-1 text-xs font-medium ${
                    subtask.done ? 'text-[var(--faint)] line-through' : 'text-[var(--ink)]'
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  type="button"
                  onClick={() => onDeleteSubtask(task.id, subtask.id)}
                  aria-label={`Delete ${subtask.title}`}
                  className="shrink-0 rounded-md p-1 text-[var(--faint)] hover:bg-[var(--canvas)] hover:text-[var(--red)] cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
            <p className="text-sm font-semibold text-[var(--ink)]">No steps yet</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Add the first small move above.</p>
          </div>
        )}
      </section>

      <PathAssistantModal
        isOpen={assistantOpen}
        taskTitle={task.title}
        onClose={() => setAssistantOpen(false)}
        onApprove={(newSteps) => {
          newSteps.forEach((step) => onAddSubtask(task.id, step));
        }}
      />
    </div>
  );
};
