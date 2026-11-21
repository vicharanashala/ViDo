import React, { useEffect, useRef } from 'react';
import { SampleTask } from '../../data/sampleTasks';
import { Badge, Button } from '../../components/ui';
import { X, Clock, Calendar, CheckCircle2, AlertCircle, History, Tag } from 'lucide-react';
import { getTodayDateString, getCurrentTimeString } from '../../utils/dateUtils';

export interface TaskDetailModalProps {
  task: SampleTask | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleTask?: (task: SampleTask) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onToggleTask,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

  if (!isOpen || !task) return null;

  const todayStr = getTodayDateString();
  const currentTimeStr = getCurrentTimeString();
  const isCompleted = task.state === 'completed';
  const isDueToday =
    task.state === 'active' &&
    (task.dueDate === todayStr || task.dueDate === '2026-11-17') &&
    (!task.dueTime || task.dueDate !== todayStr || task.dueTime >= currentTimeStr);
  const isOverdue =
    task.state === 'active' &&
    ((task.dueDate < todayStr && task.dueDate < '2026-11-17') ||
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
          {onToggleTask && task && (
            <Button
              variant={isCompleted ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => onToggleTask(task)}
            >
              {isCompleted ? 'Reopen Task' : 'Mark as Complete'}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
