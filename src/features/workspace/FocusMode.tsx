import React, { useEffect, useState } from 'react';
import type { Task } from '../../data/taskTypes';
import { Badge, Button, ProgressRing } from '../../components/ui';
import { DoodleTitle } from './doodles/DoodleTitle';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Maximize2,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  formatDateTime,
  getTaskPace,
  paceTone,
  relativeDayLabel,
} from '../../data/taskDates';

export interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onSetProgress: (id: string, progress: number) => void;
  onAddCheckpoint: (id: string, note: string) => void;
  onToggleComplete: (id: string) => void;
  onOpenDetails?: () => void;
}

function paceSentence(status: ReturnType<typeof getTaskPace>['status']): string {
  if (status === 'done') return 'Done. That counts.';
  if (status === 'ahead') return 'You are moving. Keep it light.';
  if (status === 'on-track') return 'One thing at a time.';
  if (status === 'at-risk') return 'One small update is enough.';
  if (status === 'behind') return 'No rush. Pick the smallest next step.';
  return 'No rush.';
}

export const FocusMode: React.FC<FocusModeProps> = ({
  task,
  onClose,
  onSetProgress,
  onAddCheckpoint,
  onToggleComplete,
  onOpenDetails,
}) => {
  const [note, setNote] = useState('');
  const pace = getTaskPace(task);
  const isCompleted = task.state === 'completed';

  useEffect(() => {
    setNote('');
  }, [task.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleLog = (event: React.FormEvent) => {
    event.preventDefault();
    if (!note.trim()) return;
    onAddCheckpoint(task.id, note);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-[80] bg-[var(--canvas)] overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[var(--canvas)]/95 backdrop-blur-xs border-b border-[var(--line)]">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--dark)] text-white flex items-center justify-center font-black text-xs">
              V
            </div>
            <span className="font-display text-base font-semibold text-[var(--ink)]">ViDo</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">
              <Maximize2 className="w-3 h-3" /> Focus
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close focus mode"
            className="text-[var(--muted)] hover:text-[var(--ink)] p-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-6 py-8 pb-16">
        {isCompleted ? (
          <section className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--green-soft)] text-[var(--green)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 check-pop" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Done</h1>
            <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto">{task.title}</p>
            <p className="text-xs text-[var(--faint)] mt-1">
              {task.checkpoints.length} checkpoint{task.checkpoints.length === 1 ? '' : 's'} preserved in the
              task history.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => onToggleComplete(task.id)}>
                <RotateCcw className="w-3.5 h-3.5" /> Back on the list
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Back to your space
              </Button>
            </div>
          </section>
        ) : (
          <section className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="neutral" size="sm" className="capitalize">
                {task.category}
              </Badge>
              {task.priority === 'high' && (
                <Badge variant="danger" size="sm">
                  High priority
                </Badge>
              )}
              <Badge size="sm" variant={paceTone(pace.status)}>
                {pace.label}
              </Badge>
            </div>

            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--ink)] mt-3 leading-tight">
              <DoodleTitle title={task.title} category={task.category} customImageKey={task.customImageKey} size="xl" />
            </h1>
            {task.description && (
              <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mt-4 text-xs text-[var(--muted)]">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Due {relativeDayLabel(task.dueDate)}
                {task.dueTime ? ` at ${task.dueTime}` : ''}
              </span>
              {pace.status === 'behind' && (
                <span className="text-[var(--amber)] inline-flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> take your time
                </span>
              )}
            </div>

            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-5">
              <ProgressRing
                value={task.progress}
                size={128}
                strokeWidth={8}
                label={`${task.progress}%`}
                className="mx-auto sm:mx-0"
              />

              <div className="flex-1">
                <p className="text-[11px] text-[var(--muted)]">{paceSentence(pace.status)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onSetProgress(task.id, value)}
                      aria-label={`Set progress to ${value}%`}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        task.progress === value
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--accent)]/40'
                      }`}
                    >
                      {value === 100 ? 'Done' : `${value}%`}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--faint)] mt-2">
                  Update as you move. Every change is saved to the task.
                </p>
              </div>
            </div>

            <form onSubmit={handleLog} className="mt-7">
              <label
                htmlFor="focus-checkpoint"
                className="block text-xs font-semibold text-[var(--muted)] mb-1.5"
              >
                A note to yourself
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="focus-checkpoint"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="One line: what changed, what is blocking, what is next"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
                <Button type="submit" variant="secondary" size="sm" disabled={!note.trim()}>
                  Keep a note
                </Button>
              </div>
            </form>

            {task.checkpoints.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] flex items-center gap-1.5 mb-2">
                  <History className="w-3.5 h-3.5" /> Notes
                </h2>
                <div className="space-y-2">
                  {task.checkpoints
                    .slice()
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                    .slice(0, 3)
                    .map((checkpoint) => (
                      <div
                        key={checkpoint.id}
                        className="p-2.5 rounded-lg bg-[var(--canvas)] border border-[var(--line)] text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-[var(--faint)] mb-0.5">
                          <span className="font-semibold text-[var(--accent)]">{checkpoint.progress}%</span>
                          <span className="font-mono">{formatDateTime(checkpoint.createdAt)}</span>
                        </div>
                        <p className="text-[var(--ink)]">{checkpoint.note}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-7 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
              <Button variant="primary" size="md" onClick={() => onToggleComplete(task.id)}>
                <CheckCircle2 className="w-4 h-4" /> Done for now
              </Button>
              <div className="flex items-center gap-2">
                {onOpenDetails && (
                  <Button variant="ghost" size="sm" onClick={onOpenDetails}>
                    More
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Leave for now
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
