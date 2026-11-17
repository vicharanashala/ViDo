import React, { useEffect, useRef, useState } from 'react';
import type { Task, TaskCategory, TaskPriority } from '../../data/taskTypes';
import { Badge, Button } from '../../components/ui';
import { DoodleTitle } from './doodles/DoodleTitle';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Maximize2,
  RotateCcw,
  Save,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  completionTiming,
  formatDateTime,
  getTaskPace,
  paceTone,
} from '../../data/taskDates';

export interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, patch: Partial<Task>) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onSetProgress?: (id: string, progress: number) => void;
  onToggleComplete?: (id: string) => void;
  onAddCheckpoint?: (id: string, note: string) => void;
  onFocus?: () => void;
}

function progressColor(task: Task): string {
  const pace = getTaskPace(task);
  if (pace.status === 'behind') return 'var(--red)';
  if (pace.status === 'at-risk') return 'var(--amber)';
  if (pace.status === 'done' || pace.status === 'ahead') return 'var(--green)';
  return 'var(--accent)';
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onArchive,
  onRestore,
  onSetProgress,
  onToggleComplete,
  onAddCheckpoint,
  onFocus,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [progress, setProgress] = useState(0);
  const [checkpointNote, setCheckpointNote] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!task) return;
    setIsEditing(false);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDueDate(task.dueDate);
    setDueTime(task.dueTime ?? '');
    setPriority(task.priority ?? '');
    setCategory(task.category);
    setProgress(task.progress);
    setCheckpointNote('');
  }, [task?.id, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !task) return null;

  const pace = getTaskPace(task);
  const isCompleted = task.state === 'completed';
  const timing = completionTiming(task);
  const isOverdue = !isCompleted && new Date(`${task.dueDate}T${task.dueTime || '23:59'}:00`).getTime() < Date.now();

  const handleSaveDetails = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onUpdate?.(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      dueTime: dueTime || undefined,
      priority: (priority || undefined) as TaskPriority | undefined,
      category,
    });
    setIsEditing(false);
  };

  const handleSaveProgress = () => {
    onSetProgress?.(task.id, progress);
  };

  const handleAddCheckpoint = (event: React.FormEvent) => {
    event.preventDefault();
    if (!checkpointNote.trim()) return;
    onAddCheckpoint?.(task.id, checkpointNote);
    setCheckpointNote('');
  };

  const handleDelete = () => {
    if (window.confirm('Delete this task permanently? This cannot be undone.')) {
      onDelete?.(task.id);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close task details"
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-3 pr-10">
          <Badge variant="neutral" size="sm" className="uppercase font-bold tracking-wider">
            <Tag className="w-3 h-3 mr-1" />
            {task.category}
          </Badge>
          {task.priority && (
            <Badge
              size="sm"
              variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'neutral'}
            >
              {task.priority}
            </Badge>
          )}
          <Badge size="sm" variant={isCompleted ? 'success' : isOverdue ? 'danger' : 'accent'}>
            {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
          </Badge>
          <Badge size="sm" variant={paceTone(pace.status)}>
            {pace.label}
          </Badge>
          {task.archivedAt && (
            <Badge size="sm" variant="neutral">
              Archived
            </Badge>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveDetails} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Task title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)] resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Due time</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as TaskCategory)}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg"
                >
                  <option value="personal">Personal</option>
                  <option value="home">Household</option>
                  <option value="work">Work</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value as TaskPriority | '')}
                  className="w-full px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg"
                >
                  <option value="">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Save className="w-3.5 h-3.5" /> Save details
              </Button>
            </div>
          </form>
        ) : (
          <>
            <h2 id="task-detail-title" className="text-base font-bold text-[var(--ink)] leading-snug pr-8">
              <DoodleTitle title={task.title} size="lg" />
            </h2>
            {task.description && (
              <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed bg-[var(--canvas)] p-3.5 rounded-xl border border-[var(--line)]">
                {task.description}
              </p>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="mt-3 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
            >
              Edit details
            </button>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">Due Date</span>
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {task.dueDate}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">Due Time</span>
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {task.dueTime || '23:59'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">Created</span>
                <span className="font-semibold text-[var(--ink)] font-mono text-[11px]">
                  {formatDateTime(task.createdAt)}
                </span>
              </div>
            </div>

            {task.completedAt && (
              <div className="mt-4 p-3 rounded-lg bg-[var(--green-soft)] border border-[var(--green)]/20 text-xs text-[var(--green)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Completed {formatDateTime(task.completedAt)}{' '}
                  {timing === 'late' ? '(after deadline)' : '(on time)'}
                </span>
              </div>
            )}
          </>
        )}

        <div className="mt-6 p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)]">
          <div className="flex items-center justify-between gap-3 mb-2">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">Pace vs deadline</h3>
            <Badge size="sm" variant={paceTone(pace.status)}>
              {pace.label}
            </Badge>
          </div>
          <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--line)]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${task.progress}%`, backgroundColor: progressColor(task) }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--muted)] mt-1.5 font-mono">
            <span>Actual {task.progress}%</span>
            <span>Expected by now {pace.expected}%</span>
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-2">
            {pace.status === 'behind'
              ? 'Progress is behind the time elapsed. Consider narrowing the scope or moving the deadline.'
              : pace.status === 'at-risk'
                ? 'Progress is slightly behind. A checkpoint update would help.'
                : pace.status === 'ahead'
                  ? 'You are ahead of the deadline. Good place to bank the win.'
                  : pace.status === 'done'
                    ? 'Delivered and recorded.'
                    : 'Progress is tracking the deadline.'}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(event) => setProgress(Number(event.target.value))}
              aria-label="Task progress"
              className="flex-1 accent-[var(--accent)]"
            />
            <span className="text-xs font-mono font-semibold text-[var(--ink)] w-10 text-right">{progress}%</span>
            <Button size="sm" variant="secondary" onClick={handleSaveProgress} disabled={progress === task.progress}>
              Save
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xs uppercase font-bold tracking-wider text-[var(--muted)] flex items-center gap-1.5 mb-3">
            <History className="w-3.5 h-3.5 text-[var(--accent)]" /> Progress checkpoints
          </h3>

          {task.checkpoints.length > 0 ? (
            <div className="space-y-2.5">
              {task.checkpoints
                .slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((checkpoint) => (
                  <div key={checkpoint.id} className="p-3 rounded-lg bg-[var(--canvas)] border border-[var(--line)] text-xs">
                    <div className="flex items-center justify-between text-[10px] text-[var(--faint)] mb-1">
                      <span className="font-semibold text-[var(--accent)]">{checkpoint.progress}% checkpoint</span>
                      <span className="font-mono">{formatDateTime(checkpoint.createdAt)}</span>
                    </div>
                    <p className="text-[var(--ink)] leading-relaxed">{checkpoint.note}</p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--faint)] italic">No checkpoints recorded yet for this task.</p>
          )}

          <form onSubmit={handleAddCheckpoint} className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              value={checkpointNote}
              onChange={(event) => setCheckpointNote(event.target.value)}
              placeholder="Add a progress update, blocker, or decision..."
              aria-label="Checkpoint note"
              className="flex-1 px-3.5 py-2 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={!checkpointNote.trim()}>
              Log checkpoint
            </Button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--line)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onFocus && !task.archivedAt && (
              <Button size="sm" variant="secondary" onClick={onFocus}>
                <Maximize2 className="w-3.5 h-3.5" /> Focus
              </Button>
            )}
            {!isCompleted ? (
              <Button size="sm" variant="primary" onClick={() => onToggleComplete?.(task.id)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onToggleComplete?.(task.id)}>
                <RotateCcw className="w-3.5 h-3.5" /> Reopen
              </Button>
            )}
            {task.archivedAt ? (
              <Button size="sm" variant="secondary" onClick={() => onRestore?.(task.id)}>
                Restore
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onArchive?.(task.id)}>
                <Archive className="w-3.5 h-3.5" /> Archive
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="danger" onClick={handleDelete}>
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        {isOverdue && (
          <p className="mt-3 text-[11px] text-[var(--red)] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> This task is past its deadline.
          </p>
        )}
      </div>
    </div>
  );
};
