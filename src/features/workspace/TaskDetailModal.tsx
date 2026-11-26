import React, { useEffect, useRef, useState } from 'react';
import { SampleTask, type TaskCategory, type TaskPriority } from '../../data/sampleTasks';
import { Badge, Button } from '../../components/ui';
import { X, Clock, Calendar, CheckCircle2, AlertCircle, History, Tag } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dateUtils';

export interface TaskDetailModalProps {
  task: SampleTask | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTask?: (task: SampleTask) => void;
  onDeleteTask?: (task: SampleTask) => void;
  onUpdateTask?: (taskId: string, updates: Partial<SampleTask>) => void;
  isPreview?: boolean;
}

type EditablePriority = '' | TaskPriority;

interface EditFormState {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  startTime: string;
  endTime: string;
  priority: EditablePriority;
  category: TaskCategory;
}

function createEditForm(task: SampleTask | null): EditFormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    dueDate: task?.dueDate ?? '',
    dueTime: task?.dueTime ?? '',
    startTime: task?.startTime ?? '',
    endTime: task?.endTime ?? '',
    priority: task?.priority ?? '',
    category: task?.category ?? 'personal',
  };
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  isPreview = true,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(() => createEditForm(null));
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Auto focus close button for accessibility
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && task) {
      setEditForm(createEditForm(task));
      setIsEditing(false);
      setEditError('');
    }
  }, [isOpen, task?.id]);

  function setField<K extends keyof EditFormState>(key: K, value: EditFormState[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function beginEdit() {
    if (!task) return;
    setEditForm(createEditForm(task));
    setEditError('');
    setIsEditing(true);
  }

  function saveEdit() {
    if (!task || !onUpdateTask) return;
    const title = editForm.title.trim();
    if (!title) {
      setEditError('Title is required.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(editForm.dueDate)) {
      setEditError('Enter a valid due date.');
      return;
    }
    const timeFields: Array<[string, string]> = [
      ['Due time', editForm.dueTime],
      ['Start time', editForm.startTime],
      ['End time', editForm.endTime],
    ];
    if (timeFields.some(([, value]) => value && !isValidTime(value))) {
      setEditError('Enter valid times in HH:mm format.');
      return;
    }
    if (editForm.startTime && editForm.endTime && editForm.endTime <= editForm.startTime) {
      setEditError('End time must be after start time.');
      return;
    }

    onUpdateTask(task.id, {
      title,
      description: editForm.description.trim() || undefined,
      dueDate: editForm.dueDate,
      dueTime: editForm.dueTime || undefined,
      startTime: editForm.startTime || undefined,
      endTime: editForm.endTime || undefined,
      priority: editForm.priority || undefined,
      category: editForm.category,
    });
    setIsEditing(false);
    setEditError('');
  }

  if (!isOpen || !task) return null;

  const todayStr = getTodayDateString();
  const currentTimeStr = getCurrentTimeString();
  const isCompleted = task.state === 'completed';
  const isDueToday =
    task.state === 'active' &&
    (task.dueDate === todayStr || (isPreview && task.dueDate === '2026-11-17')) &&
    (!task.dueTime || task.dueDate !== todayStr || task.dueTime >= currentTimeStr);
  const isOverdue =
    task.state === 'active' &&
    ((task.dueDate < todayStr && (!isPreview || task.dueDate < '2026-11-17')) ||
      (task.dueDate === todayStr && !!task.dueTime && task.dueTime < currentTimeStr));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close task details"
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="neutral" size="sm" className="uppercase font-bold tracking-wider">
            <Tag className="w-3 h-3 mr-1" />
            {task.category}
          </Badge>

          {task.priority && (
            <Badge
              size="sm"
              variant={
                task.priority === 'high'
                  ? 'danger'
                  : task.priority === 'medium'
                  ? 'warning'
                  : 'neutral'
              }
            >
              Priority: {task.priority}
            </Badge>
          )}

          {isCompleted ? (
            <Badge size="sm" variant="success">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
            </Badge>
          ) : isOverdue ? (
            <Badge size="sm" variant="danger">
              <AlertCircle className="w-3 h-3 mr-1" /> Overdue
            </Badge>
          ) : isDueToday ? (
            <Badge size="sm" variant="accent">
              <Clock className="w-3 h-3 mr-1" /> Due Today
            </Badge>
          ) : (
            <Badge size="sm" variant="neutral">
              <Calendar className="w-3 h-3 mr-1" /> Upcoming
            </Badge>
          )}
        </div>

        {/* Task Title */}
        <h2 id="task-detail-title" className="text-xl font-bold text-[var(--ink)] leading-snug pr-8">
          {task.title}
        </h2>

        {/* Description */}
        {task.description && (
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed bg-[var(--canvas)] p-3.5 rounded-xl border border-[var(--line)]">
            {task.description}
          </p>
        )}

        {isEditing ? (
          <div className="mt-5 rounded-xl border border-[var(--line)] bg-[var(--canvas)]/40 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
              Edit task details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-[10px] font-semibold text-[var(--muted)] sm:col-span-2">
                Title
                <input
                  value={editForm.title}
                  onChange={(e) => setField('title', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)] sm:col-span-2">
                Description
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setField('description', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] resize-y"
                />
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)]">
                Due date
                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setField('dueDate', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)]">
                Due time
                <input
                  type="time"
                  value={editForm.dueTime}
                  onChange={(e) => setField('dueTime', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)]">
                Start time
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setField('startTime', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)]">
                End time
                <input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setField('endTime', e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                />
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)]">
                Priority
                <select
                  value={editForm.priority}
                  onChange={(e) => setField('priority', e.target.value as EditablePriority)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                >
                  <option value="">None</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label className="text-[10px] font-semibold text-[var(--muted)]">
                Category
                <select
                  value={editForm.category}
                  onChange={(e) => setField('category', e.target.value as TaskCategory)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                >
                  <option value="personal">Personal</option>
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                </select>
              </label>
            </div>
            {editError && <p className="mt-2 text-xs text-[var(--red)]">{editError}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={saveEdit} disabled={!onUpdateTask}>
                Save changes
              </Button>
              <Button variant="secondary" size="sm" onClick={() => { setIsEditing(false); setEditError(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Metadata Details Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">
                  Due Date
                </span>
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {task.dueDate}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">
                  Due Time
                </span>
                <span className="font-semibold text-[var(--ink)] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
                  {task.dueTime || '23:59 (End of day)'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-[var(--faint)] block mb-1">
                  Created
                </span>
                <span className="font-semibold text-[var(--ink)] font-mono text-[11px]">
                  {new Date(task.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {(task.startTime || task.endTime) && (
              <div className="mt-3 p-3 rounded-lg border border-[var(--line)] bg-[var(--canvas)] text-xs flex items-center gap-2 text-[var(--muted)]">
                <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="font-semibold text-[var(--ink)]">Timeline:</span>
                <span className="font-mono">{task.startTime || '--:--'} - {task.endTime || task.dueTime || '--:--'}</span>
              </div>
            )}
          </>
        )}

        {/* Completed Timing Notice (if completed) */}
        {task.completedAt && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--green-soft)] border border-[var(--green)]/20 text-xs text-[var(--green)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Completed on {new Date(task.completedAt).toLocaleString('en-GB')}{' '}
              {task.completedAt <= `${task.dueDate}T${task.dueTime || '23:59'}:00Z`
                ? '(On Time)'
                : '(After Deadline)'}
            </span>
          </div>
        )}

        {/* Checkpoint Updates Timeline */}
        <div className="mt-6 pt-5 border-t border-[var(--line)]">
          <h3 className="text-xs uppercase font-bold tracking-wider text-[var(--muted)] flex items-center gap-1.5 mb-3">
            <History className="w-3.5 h-3.5 text-[var(--accent)]" /> Progress Checkpoints & Updates
          </h3>

          {task.checkpoints && task.checkpoints.length > 0 ? (
            <div className="space-y-2.5">
              {task.checkpoints.map((cp) => (
                <div
                  key={cp.id}
                  className="p-3 rounded-lg bg-[var(--canvas)] border border-[var(--line)] text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-[var(--faint)] mb-1">
                    <span className="font-semibold text-[var(--accent)]">Checkpoint Logged</span>
                    <span className="font-mono">{new Date(cp.timestamp).toLocaleString('en-GB')}</span>
                  </div>
                  <p className="text-[var(--ink)] leading-relaxed">{cp.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--faint)] italic">
              No checkpoints recorded yet for this task.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onUpdateTask && !isEditing && (
              <Button variant="secondary" size="sm" onClick={beginEdit}>
                Edit
              </Button>
            )}
            {onToggleTask && task && (
              <Button
                variant={isCompleted ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => onToggleTask(task)}
              >
                {isCompleted ? 'Reopen Task' : 'Mark as Complete'}
              </Button>
            )}
            {onDeleteTask && task && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDeleteTask(task)}
                className="text-[var(--red)] hover:opacity-80"
              >
                Delete
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
