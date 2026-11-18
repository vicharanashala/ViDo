import React, { useEffect, useRef, useState } from 'react';
import type { Task, TaskCategory, TaskPriority, TaskRecurrence } from '../../data/taskTypes';
import { Badge, Button } from '../../components/ui';
import { DoodleTitle } from './doodles/DoodleTitle';
import { CustomImageEditor } from './CustomImageEditor';
import { detectDoodle } from './doodles/doodleMap';
import {
  findCustomImageForTitle,
  removeCustomImageRule,
  saveCustomImageRule,
} from '../../lib/customImages';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  Circle,
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
  isDueTimePassed,
  isPastDay,
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
  onOpenPath?: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  currentUser?: string | null;
  onShare?: (taskId: string, identifier: string) => void;
  onUnshare?: (taskId: string, identifier: string) => void;
}

function isValidShareTarget(value: string): boolean {
  const clean = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) || /^\+?\d{7,15}$/.test(clean.replace(/\s+/g, ''));
}

function progressColor(task: Task): string {
  return task.state === 'completed' ? 'var(--green)' : 'var(--accent)';
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
  onOpenPath,
  onToggleSubtask,
  currentUser,
  onShare,
  onUnshare,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [recurrence, setRecurrence] = useState<TaskRecurrence | ''>('');
  const [dueTime, setDueTime] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [shareInput, setShareInput] = useState('');
  const [shareError, setShareError] = useState('');
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
    setDeadlineDate(task.deadlineDate ?? '');
    setRecurrence(task.recurrence ?? '');
    setDueTime(task.dueTime ?? '');
    setReminderAt(task.reminderAt ? task.reminderAt.slice(0, 16) : '');
    setShareInput('');
    setShareError('');
    setPriority(task.priority ?? '');
    setCategory(task.category);
    setProgress(task.progress);
    setCheckpointNote('');
  }, [task?.id, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !task) return null;

  const pace = getTaskPace(task);
  const isCompleted = task.state === 'completed';
  const timing = completionTiming(task);
  const parked = Boolean(task.parkedAt);
  const pastDay = !parked && isPastDay(task);
  const deadlinePassed = !parked && !pastDay && isDueTimePassed(task);
  const pending = pastDay || deadlinePassed;
  const builtInImage = detectDoodle(task.title) ?? (task.category === 'work' ? 'project' : null);
  const customImage = findCustomImageForTitle(task.title, task.customImageKey);

  const handleSaveDetails = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    onUpdate?.(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      deadlineDate: deadlineDate || undefined,
      recurrence: (recurrence || undefined) as TaskRecurrence | undefined,
      dueDate,
      dueTime: dueTime || undefined,
      reminderAt: reminderAt || undefined,
      reminderSentAt: undefined,
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
              {task.priority === 'high' ? 'Important' : task.priority}
            </Badge>
          )}
          {task.recurrence && (
            <Badge size="sm" variant="accent">
              Repeats {task.recurrence}
            </Badge>
          )}
          <Badge
            size="sm"
            variant={isCompleted ? 'success' : pending ? 'warning' : parked ? 'neutral' : 'accent'}
          >
            {isCompleted ? 'Done' : parked ? 'Pick up again' : pending ? 'Pending' : 'Active'}
          </Badge>
          <Badge size="sm" variant={paceTone(pace.status)}>
            {pace.label}
          </Badge>
          {task.archivedAt && (
            <Badge size="sm" variant="neutral">
              Put away
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
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Planned date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                  Deadline date (optional)
                </label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(event) => {
                    setDeadlineDate(event.target.value);
                    if (!event.target.value) setRecurrence('');
                  }}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                  Deadline time (optional)
                </label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(event) => setDueTime(event.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                  Repeat until deadline
                </label>
                <select
                  value={recurrence}
                  onChange={(event) => setRecurrence(event.target.value as TaskRecurrence | '')}
                  disabled={!deadlineDate}
                  className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
                >
                  <option value="">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                Reminder (optional)
              </label>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(event) => setReminderAt(event.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
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
              <DoodleTitle title={task.title} category={task.category} customImageKey={task.customImageKey} size="lg" />
            </h2>
            {task.description && (
              <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed bg-[var(--canvas)] p-3.5 rounded-xl border border-[var(--line)]">
                {task.description}
              </p>
            )}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Steps
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--muted)]">
                    {task.subtasks.filter((subtask) => subtask.done).length}/{task.subtasks.length} done
                  </span>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {task.subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => onToggleSubtask?.(task.id, subtask.id)}
                        aria-label={subtask.done ? `Reopen ${subtask.title}` : `Complete ${subtask.title}`}
                        className="shrink-0 text-[var(--accent)] cursor-pointer"
                      >
                        {subtask.done ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-4 w-4 text-[var(--faint)]" />
                        )}
                      </button>
                      <span className={subtask.done ? 'text-[var(--faint)] line-through' : 'text-[var(--ink)]'}>
                        {subtask.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
              >
                Edit details
              </button>
              {onOpenPath && (
                <button
                  onClick={() => onOpenPath(task.id)}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:underline cursor-pointer"
                >
                  Open task path
                </button>
              )}
            </div>

            {(!builtInImage || customImage) && (
              <CustomImageEditor
                title={task.title}
                customImageKey={task.customImageKey}
                onSave={(keyword, dataUrl) => {
                  saveCustomImageRule(keyword, dataUrl);
                  onUpdate?.(task.id, { customImageKey: keyword });
                }}
                onRemove={() => {
                  const rule = findCustomImageForTitle(task.title, task.customImageKey);
                  if (rule) removeCustomImageRule(rule.keyword);
                  onUpdate?.(task.id, { customImageKey: undefined });
                }}
              />
            )}

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">Planned date</span>
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {parked ? 'Pick up again' : task.dueDate}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">Deadline</span>
                <span
                  className={`flex items-center gap-1 font-mono font-bold ${
                    task.deadlineDate || task.dueTime ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {parked
                    ? 'No set date'
                    : task.deadlineDate
                      ? `${task.deadlineDate}${task.dueTime ? ` ${task.dueTime}` : ''}`
                      : task.dueTime
                        ? `Planned day ${task.dueTime}`
                        : 'No deadline'}
                </span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">Created</span>
                <span className="font-semibold text-[var(--ink)] font-mono text-[11px]">
                  {formatDateTime(task.createdAt)}
                </span>
              </div>
            </div>

            {task.reminderAt && (
              <p className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-[11px] text-[var(--muted)]">
                Reminder: <span className="font-semibold text-[var(--ink)]">{formatDateTime(task.reminderAt)}</span>
              </p>
            )}

            <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  Shared with
                </h3>
                {task.sharedBy && (
                  <span className="text-[10px] text-[var(--muted)]">Shared by {task.sharedBy}</span>
                )}
              </div>
              {currentUser ? (
                <>
                  <form
                    className="mt-2 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!isValidShareTarget(shareInput)) {
                        setShareError('Use a valid email or phone number.');
                        return;
                      }
                      onShare?.(task.id, shareInput);
                      setShareInput('');
                      setShareError('');
                    }}
                  >
                    <input
                      value={shareInput}
                      onChange={(event) => {
                        setShareInput(event.target.value);
                        setShareError('');
                      }}
                      placeholder="Email or phone number"
                      aria-label="Share with email or phone"
                      className="min-w-0 flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--ink)]"
                    />
                    <Button type="submit" size="sm" variant="secondary" disabled={!shareInput.trim()}>
                      Share
                    </Button>
                  </form>
                  {shareError && <p className="mt-1 text-[10px] font-semibold text-[var(--amber)]">{shareError}</p>}
                  {(task.sharedWith ?? []).length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(task.sharedWith ?? []).map((identifier) => (
                        <span
                          key={identifier}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--muted)]"
                        >
                          {identifier}
                          {onUnshare && (
                            <button
                              type="button"
                              onClick={() => onUnshare(task.id, identifier)}
                              aria-label={`Remove ${identifier}`}
                              className="text-[var(--faint)] hover:text-[var(--red)]"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-[10px] text-[var(--faint)]">Only you can see this task.</p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-[10px] text-[var(--muted)]">
                  Sign in from Profile to share this task with an email or phone number.
                </p>
              )}
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
            <h3 className="text-xs uppercase font-bold tracking-wider text-[var(--muted)]">A little context</h3>
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
            <span>{task.progress}% there</span>
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-2">
            {pace.status === 'behind'
              ? 'No rush. Pick the smallest next step.'
              : pace.status === 'at-risk'
                ? 'One small update is enough.'
                : pace.status === 'ahead'
                  ? 'You are moving. Keep it light.'
                  : pace.status === 'done'
                    ? 'Done. That counts.'
                    : 'One thing at a time.'}
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
            <History className="w-3.5 h-3.5 text-[var(--accent)]" /> Notes and updates
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
            <p className="text-xs text-[var(--faint)] italic">No notes yet.</p>
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
                <Maximize2 className="w-3.5 h-3.5" /> Begin
              </Button>
            )}
            {!isCompleted ? (
              <Button size="sm" variant="primary" onClick={() => onToggleComplete?.(task.id)}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Done
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onToggleComplete?.(task.id)}>
                <RotateCcw className="w-3.5 h-3.5" /> Back on the list
              </Button>
            )}
            {task.archivedAt ? (
              <Button size="sm" variant="secondary" onClick={() => onRestore?.(task.id)}>
                Bring back
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => onArchive?.(task.id)}>
                <Archive className="w-3.5 h-3.5" /> Put away
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

        {parked && (
          <p className="mt-3 text-[11px] text-[var(--muted)] flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Set aside. Pick it up again whenever you choose.
          </p>
        )}
        {deadlinePassed && (
          <p className="mt-3 text-[11px] text-[var(--amber)] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> The deadline has passed. You can still update it
            until midnight.
          </p>
        )}
        {pastDay && (
          <p className="mt-3 text-[11px] text-[var(--amber)] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> This one is pending. Move it or leave it for later.
          </p>
        )}
      </div>
    </div>
  );
};
