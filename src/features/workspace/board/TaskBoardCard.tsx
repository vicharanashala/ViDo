import React, { useState, useRef, useEffect } from 'react';
import { SampleTask } from '../../../data/sampleTasks';
import { getTaskPriorityCardStyle, PriorityColors } from '../../../utils/priorityColor';
import { formatRecurrenceLabel, formatTaskDate } from '../../../utils/recurrence';
import {
  Circle,
  CheckCircle2,
  AlertCircle,
  Star,
  MoreVertical,
  Calendar,
  Repeat,
  AlignLeft,
  CornerDownRight,
  Plus,
  Trash2,
  X,
  CalendarClock,
  Check,
} from 'lucide-react';

export interface TaskBoardCardProps {
  task: SampleTask;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onToggle: (task: SampleTask) => void;
  onUpdate: (taskId: string, updates: Partial<SampleTask>) => void;
  onDelete?: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onOpenDatePopover: (e: React.MouseEvent, taskId: string) => void;
  onOpenRepeatModal: (e: React.MouseEvent, taskId: string) => void;
  onOpenDeadlinePopover?: (e: React.MouseEvent, taskId: string) => void;
  categories?: { id: string; title: string }[];
  referenceDateStr?: string;
  isPreview?: boolean;
  // Drag and Drop props
  isDraggable?: boolean;
  isBeingDragged?: boolean;
  isDropTargetBefore?: boolean;
  isDropTargetAfter?: boolean;
  onDragStartTask?: (e: React.DragEvent, taskId: string) => void;
  onDragOverTask?: (e: React.DragEvent, taskId: string) => void;
  onDragLeaveTask?: (e: React.DragEvent, taskId: string) => void;
  onDropTask?: (e: React.DragEvent, taskId: string) => void;
  onDragEndTask?: (e: React.DragEvent) => void;
  priorityColors?: PriorityColors;
}

export function formatDeadlineLabel(deadlineStr?: string | null): string {
  if (!deadlineStr) return '';
  const parts = deadlineStr.trim().split(' ');
  const datePart = parts[0];
  const timePart = parts[1];
  try {
    const d = new Date(`${datePart}T${timePart || '00:00'}:00`);
    if (isNaN(d.getTime())) return deadlineStr;
    const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return timePart ? `${dateFormatted}, ${timePart}` : dateFormatted;
  } catch {
    return deadlineStr;
  }
}

export function formatCompletedDate(
  completedAt?: string,
  fallbackDate?: string,
  refDateStr?: string
): string {
  const rawDateStr = completedAt || fallbackDate;
  if (!rawDateStr) return 'Completed';
  try {
    const safeDateStr = rawDateStr.includes('T') ? rawDateStr : `${rawDateStr}T12:00:00`;
    const d = new Date(safeDateStr);
    if (isNaN(d.getTime())) return 'Completed';

    let refYear = new Date().getFullYear();
    if (refDateStr) {
      const parsedRef = new Date(refDateStr.includes('T') ? refDateStr : `${refDateStr}T12:00:00`);
      if (!isNaN(parsedRef.getTime())) {
        refYear = parsedRef.getFullYear();
      }
    }

    const isSameYear = d.getFullYear() === refYear;
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const day = d.getDate();
    if (isSameYear) {
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
      return `Completed: ${weekday} ${day} ${monthShort}`;
    } else {
      const monthLong = d.toLocaleDateString('en-US', { month: 'long' });
      return `Completed: ${day} ${monthLong} ${d.getFullYear()}`;
    }
  } catch {
    return 'Completed';
  }
}

const DEFAULT_CATEGORIES: { id: string; title: string }[] = [
  { id: 'personal', title: 'Personal & Routine' },
  { id: 'home', title: 'Household & Living' },
  { id: 'work', title: 'Work & Professional' },
];

export const TaskBoardCard: React.FC<TaskBoardCardProps> = ({
  task,
  isExpanded,
  onExpand,
  onCollapse,
  onToggle,
  onUpdate,
  onDelete,
  onToggleStar,
  onOpenDatePopover,
  onOpenRepeatModal,
  onOpenDeadlinePopover,
  categories = DEFAULT_CATEGORIES,
  referenceDateStr = '2026-11-17',
  isPreview: _isPreview = true,
  isDraggable = true,
  isBeingDragged = false,
  isDropTargetBefore = false,
  isDropTargetAfter = false,
  onDragStartTask,
  onDragOverTask,
  onDragLeaveTask,
  onDropTask,
  onDragEndTask,
  priorityColors,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuOpensUpward, setMenuOpensUpward] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  // Automatically close task options menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Automatically close expanded card when clicking outside or pressing Escape
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't close if clicking inside this card
      if (cardRef.current && cardRef.current.contains(target)) {
        return;
      }

      // Don't close if clicking inside a modal or floating popover
      if (
        target.closest('[role="dialog"]') ||
        target.closest('[data-task-popover]') ||
        target.closest('[data-popover]') ||
        target.closest('[data-portal]')
      ) {
        return;
      }

      onCollapse();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCollapse();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, onCollapse]);

  const isCompleted = task.state === 'completed';
  const cardPriorityStyle = getTaskPriorityCardStyle(task.priority, priorityColors, isExpanded);

  const dateInfo = formatTaskDate(task.dueDate, task.dueTime, referenceDateStr);
  const isLate = dateInfo.isOverdue && !isCompleted;
  const estimatedMins = task.estimatedMinutes || 0;

  // Subtask handlers
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newSubtaskTitle.trim();
    if (!title) return;

    const subtasks = [
      ...(task.subtasks || []),
      { id: `st_${Date.now()}`, title, completed: false },
    ];
    onUpdate(task.id, { subtasks });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const subtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdate(task.id, { subtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const subtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    onUpdate(task.id, { subtasks });
  };

  return (
    <div
      ref={cardRef}
      style={{
        ...cardPriorityStyle,
        ...(isCompleted && !isExpanded ? { opacity: 0.9 } : {}),
      }}
      draggable={!isExpanded && isDraggable}
      onDragStart={(e) => {
        if (isExpanded) return;
        e.stopPropagation();
        onDragStartTask && onDragStartTask(e, task.id);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOverTask && onDragOverTask(e, task.id);
      }}
      onDragLeave={(e) => {
        e.stopPropagation();
        onDragLeaveTask && onDragLeaveTask(e, task.id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDropTask && onDropTask(e, task.id);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        onDragEndTask && onDragEndTask(e);
      }}
      onClick={() => {
        if (!isExpanded) onExpand();
      }}
      className={`group relative rounded-xl border transition-all duration-150 select-none ${
        isBeingDragged
          ? 'opacity-30 border-dashed border-[var(--accent)] scale-[0.98]'
          : ''
      } ${
        isExpanded
          ? 'bg-[var(--surface)] border-[var(--accent)] shadow-md p-3.5 ring-1 ring-[var(--accent)]/30'
          : `bg-[var(--surface)] border-[var(--line)] hover:border-[var(--muted)]/40 p-2.5 ${
              isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
            } shadow-2xs hover:shadow-xs`
      }`}
    >
      {/* Drop Target Indicators */}
      {isDropTargetBefore && (
        <div className="absolute -top-1.5 inset-x-2 h-1 bg-[var(--accent)] rounded-full z-20 shadow-xs pointer-events-none animate-in fade-in duration-100" />
      )}
      {isDropTargetAfter && (
        <div className="absolute -bottom-1.5 inset-x-2 h-1 bg-[var(--accent)] rounded-full z-20 shadow-xs pointer-events-none animate-in fade-in duration-100" />
      )}
      {/* Task Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
          {/* Completion Check Circle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(task);
            }}
            className="mt-0.5 shrink-0 cursor-pointer focus:outline-none"
            aria-label={isCompleted ? 'Mark active' : 'Mark completed'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-[var(--green)] hover:opacity-75 transition-opacity" />
            ) : isLate ? (
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 hover:text-rose-600 transition-colors" />
            ) : (
              <Circle className="w-4.5 h-4.5 text-[var(--faint)] group-hover:text-[var(--accent)] transition-colors" />
            )}
          </button>

          {/* Title & Preview Content */}
          <div className="min-w-0 flex-1">
            {isExpanded ? (
              <input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate(task.id, { title: e.target.value })}
                className="w-full bg-transparent text-xs font-semibold text-[var(--ink)] focus:outline-none border-b border-[var(--line)] focus:border-[var(--accent)] py-0.5"
                autoFocus
                placeholder="Title"
              />
            ) : (
              <p
                className={`text-xs font-medium text-[var(--ink)] leading-snug break-words ${
                  isCompleted ? 'line-through opacity-70' : ''
                }`}
              >
                {task.title}
              </p>
            )}

            {/* Google Tasks style completion timestamp */}
            {isCompleted && !isExpanded && (
              <p className="text-[11px] text-[var(--muted)] mt-0.5 font-normal">
                {formatCompletedDate(task.completedAt, task.createdAt, referenceDateStr)}
              </p>
            )}

            {/* Collapsed Description Snippet (2-line clamp) */}
            {!isExpanded && task.description && (
              <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1 flex items-start space-x-1 leading-relaxed">
                <AlignLeft className="w-3 h-3 text-[var(--faint)] shrink-0 mt-0.5" />
                <span>{task.description}</span>
              </p>
            )}

            {/* Collapsed Subtask Count */}
            {!isExpanded && task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-[var(--muted)] font-medium">
                <CornerDownRight className="w-3 h-3 text-[var(--accent)] shrink-0" />
                <span>
                  {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                </span>
              </div>
            )}

            {/* Collapsed Pills: Date, Duration & Repeat */}
            {!isExpanded && (
              <div
                className={`mt-2 flex items-center space-x-1.5 flex-wrap gap-y-1 ${
                  isCompleted ? 'opacity-75' : ''
                }`}
              >
                {task.dueDate && (
                  <button
                    type="button"
                    onClick={(e) => onOpenDatePopover(e, task.id)}
                    className={`inline-flex items-center space-x-1.5 text-[10px] px-2.5 py-0.5 rounded-full font-semibold transition-colors shrink-0 border cursor-pointer ${
                      isLate
                        ? 'bg-rose-500/10 text-rose-700 border-rose-500/30'
                        : dateInfo.isToday
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
                        : 'bg-[var(--canvas)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]/50'
                    }`}
                  >
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{dateInfo.label}</span>
                  </button>
                )}

                {task.deadline && (
                  <button
                    type="button"
                    onClick={(e) => onOpenDeadlinePopover && onOpenDeadlinePopover(e, task.id)}
                    className="inline-flex items-center space-x-1.5 text-[10px] text-rose-700 bg-rose-500/10 border border-rose-400/30 px-2.5 py-0.5 rounded-full font-semibold shrink-0 shadow-2xs hover:bg-rose-500/20 transition-colors cursor-pointer"
                    title={`Deadline: ${task.deadline}`}
                  >
                    <CalendarClock className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>Deadline: {formatDeadlineLabel(task.deadline)}</span>
                  </button>
                )}

                {estimatedMins > 0 && (
                  <span className="text-[10px] text-[var(--muted)] font-medium shrink-0">
                    ~{estimatedMins} mins
                  </span>
                )}

                {task.recurrence?.enabled && task.recurrence?.rule && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRepeatModal(e, task.id);
                    }}
                    className="inline-flex items-center space-x-1.5 text-[10px] text-purple-900 bg-purple-500/15 border border-purple-400/40 px-2.5 py-0.5 rounded-full font-semibold hover:bg-purple-500/25 transition-colors shrink-0 cursor-pointer shadow-2xs"
                    title="Edit recurrence rule"
                  >
                    <Repeat className="w-3 h-3 text-purple-800 shrink-0" strokeWidth={2.2} />
                    <span>{formatRecurrenceLabel(task.recurrence.rule)}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Action Icons: Delete on hover for Completed Tasks; Star & 3-Dots for Active */}
        {isCompleted ? (
          <div className="flex items-center space-x-0.5 shrink-0">
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                aria-label="Delete task"
                title="Delete task"
                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[var(--muted)] hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-0.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(task.id);
              }}
              aria-label={task.starred ? 'Unstar task' : 'Star task'}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                task.starred
                  ? 'text-amber-500'
                  : isExpanded
                  ? 'text-[var(--faint)] hover:text-amber-500'
                  : 'text-transparent group-hover:text-[var(--faint)] hover:text-amber-500'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${task.starred ? 'fill-amber-500' : ''}`} />
            </button>

            {/* Options Menu */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    if (window.innerHeight - rect.bottom < 240 && rect.top > 240) {
                      setMenuOpensUpward(true);
                    } else {
                      setMenuOpensUpward(false);
                    }
                  } catch {}
                  setIsMenuOpen((prev) => !prev);
                }}
                aria-label="More task options"
                aria-expanded={isMenuOpen}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  isExpanded
                    ? 'text-[var(--faint)] hover:text-[var(--ink)]'
                    : 'text-transparent group-hover:text-[var(--faint)] hover:text-[var(--ink)]'
                }`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute right-0 w-60 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl py-2 z-50 text-xs select-none animate-in fade-in duration-100 ${
                    menuOpensUpward ? 'bottom-full mb-1' : 'top-full mt-1'
                  }`}
                >
                  {/* Star Option */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStar(task.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-[var(--line)]/50 text-[var(--ink)] transition-colors cursor-pointer text-left"
                  >
                    <Star
                      className={`w-4 h-4 shrink-0 ${
                        task.starred ? 'fill-amber-500 text-amber-500' : 'text-[var(--muted)]'
                      }`}
                    />
                    <span>{task.starred ? 'Remove from starred' : 'Add to starred'}</span>
                  </button>

                  {/* Add Deadline */}
                  {onOpenDeadlinePopover && (
                    <button
                      type="button"
                      disabled={Boolean(task.recurrence?.enabled && task.recurrence?.rule)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (task.recurrence?.enabled && task.recurrence?.rule) return;
                        setIsMenuOpen(false);
                        onOpenDeadlinePopover(e, task.id);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 transition-colors cursor-pointer text-left ${
                        task.recurrence?.enabled && task.recurrence?.rule
                          ? 'opacity-40 cursor-not-allowed text-[var(--muted)]'
                          : 'hover:bg-[var(--line)]/50 text-rose-600'
                      }`}
                    >
                      <CalendarClock className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Set deadline</span>
                    </button>
                  )}

                  {/* Delete Task */}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-rose-500/10 text-rose-600 transition-colors cursor-pointer text-left"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Delete task</span>
                    </button>
                  )}

                  <div className="my-1.5 border-t border-[var(--line)]" />

                  {/* Category Switcher with Checkmarks */}
                  <div className="max-h-48 overflow-y-auto">
                    {activeCategories.map((cat) => {
                      const isCurrent = task.category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate(task.id, { category: cat.id as any });
                            setIsMenuOpen(false);
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-2 transition-colors cursor-pointer text-left ${
                            isCurrent
                              ? 'text-[var(--ink)] font-medium bg-[var(--line)]/40'
                              : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/30'
                          }`}
                        >
                          <div className="w-4 h-4 flex items-center justify-center shrink-0">
                            {isCurrent && <Check className="w-4 h-4 text-[var(--accent)]" />}
                          </div>
                          <span className="truncate">{cat.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Inline Editor Body */}
      {isExpanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-3 pt-2.5 border-t border-[var(--line)] space-y-3 animate-in fade-in duration-150"
        >
          {/* Details / Description Textarea */}
          <div className="flex items-start space-x-2">
            <AlignLeft className="w-4 h-4 text-[var(--muted)] mt-1.5 shrink-0" />
            <textarea
              value={task.description || ''}
              onChange={(e) => onUpdate(task.id, { description: e.target.value })}
              placeholder="Details"
              rows={2}
              className="w-full bg-[var(--canvas)] border border-[var(--line)] rounded-lg p-2 text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>

          {/* Date & Time, Deadline, Repeat Row */}
          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 pl-6">
            {/* 1. Date/time button */}
            <button
              type="button"
              onClick={(e) => onOpenDatePopover(e, task.id)}
              className={`inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                isLate
                  ? 'bg-rose-500/10 text-rose-700 border-rose-500/30'
                  : task.dueDate && dateInfo.isToday
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
                  : 'bg-[var(--canvas)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{task.dueDate ? dateInfo.label : 'Date/time'}</span>
            </button>

            {/* 2. Deadline button (Mutually exclusive with Repeat) */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={Boolean(task.recurrence?.enabled && task.recurrence?.rule)}
                onClick={(e) => {
                  if (task.recurrence?.enabled && task.recurrence?.rule) return;
                  onOpenDeadlinePopover && onOpenDeadlinePopover(e, task.id);
                }}
                className={`inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  task.recurrence?.enabled && task.recurrence?.rule
                    ? 'opacity-40 cursor-not-allowed bg-[var(--canvas)] text-[var(--muted)] border-[var(--line)]'
                    : task.deadline
                    ? 'bg-rose-500/15 text-rose-700 border-rose-400/40 hover:bg-rose-500/25 cursor-pointer'
                    : 'bg-[var(--canvas)] text-rose-600 hover:text-rose-700 border-[var(--line)] cursor-pointer'
                }`}
                title={
                  task.recurrence?.enabled && task.recurrence?.rule
                    ? 'Repeating tasks cannot have a deadline. Remove repeat to set a deadline.'
                    : task.deadline
                    ? `Deadline: ${task.deadline}`
                    : 'Set deadline'
                }
              >
                <CalendarClock className={`w-3.5 h-3.5 ${task.deadline ? 'text-rose-600' : 'text-rose-500'}`} />
                <span>{task.deadline ? `Deadline: ${formatDeadlineLabel(task.deadline)}` : 'Set deadline'}</span>
              </button>

              {task.deadline && (
                <button
                  type="button"
                  onClick={() => onUpdate(task.id, { deadline: undefined })}
                  className="p-1 text-[var(--muted)] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove deadline"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3. Repeat button (Mutually exclusive with Deadline) */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                disabled={Boolean(task.deadline)}
                onClick={(e) => {
                  if (task.deadline) return;
                  e.stopPropagation();
                  onOpenRepeatModal(e, task.id);
                }}
                className={`inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                  task.deadline
                    ? 'opacity-40 cursor-not-allowed bg-[var(--canvas)] text-[var(--muted)] border-[var(--line)]'
                    : task.recurrence?.enabled && task.recurrence?.rule
                    ? 'bg-purple-500/15 text-purple-900 border-purple-400/40 hover:bg-purple-500/25 cursor-pointer'
                    : 'bg-[var(--canvas)] text-purple-600 hover:text-purple-700 border-[var(--line)] cursor-pointer'
                }`}
                title={
                  task.deadline
                    ? 'Tasks with a deadline cannot be repeating tasks. Remove deadline to set repeating.'
                    : task.recurrence?.enabled && task.recurrence?.rule
                    ? formatRecurrenceLabel(task.recurrence.rule)
                    : 'Repeat'
                }
              >
                <Repeat className={`w-3.5 h-3.5 ${task.recurrence?.enabled && task.recurrence?.rule ? 'text-purple-800' : 'text-purple-500'}`} strokeWidth={2.2} />
                <span>
                  {task.recurrence?.enabled && task.recurrence?.rule
                    ? formatRecurrenceLabel(task.recurrence.rule)
                    : 'Repeat'}
                </span>
              </button>

              {task.recurrence?.enabled && task.recurrence?.rule && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdate(task.id, {
                      recurrence: { enabled: false, rule: null },
                    })
                  }
                  className="p-1 text-[var(--muted)] hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove repeat"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="pl-6 space-y-1.5">
            {(task.subtasks || []).map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between text-xs text-[var(--ink)] group/st py-0.5"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(st.id)}
                    className="text-[var(--faint)] hover:text-[var(--accent)] shrink-0 cursor-pointer"
                  >
                    {st.completed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[var(--faint)]" />
                    )}
                  </button>
                  <span
                    className={`truncate text-xs ${
                      st.completed ? 'line-through text-[var(--muted)]' : 'text-[var(--ink)]'
                    }`}
                  >
                    {st.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="opacity-0 group-hover/st:opacity-100 p-0.5 text-[var(--muted)] hover:text-rose-600 transition-all shrink-0 ml-2 cursor-pointer"
                  title="Delete subtask"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            <form onSubmit={handleAddSubtask} className="flex items-center space-x-2 pt-1">
              <Plus className="w-3.5 h-3.5 text-[var(--faint)] shrink-0" />
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask"
                className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none border-b border-transparent focus:border-[var(--accent)] py-0.5"
              />
            </form>
          </div>

          {/* Bottom Toolbar: Priority Selector on left, Trash & Done on right */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)] pl-6">
            <div className="flex items-center space-x-1">
              {(['low', 'medium', 'high'] as const).map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => onUpdate(task.id, { priority: pri })}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize transition-colors cursor-pointer ${
                    (task.priority || 'low') === pri
                      ? pri === 'high'
                        ? 'bg-rose-500/20 text-rose-600 border border-rose-500/40'
                        : pri === 'medium'
                        ? 'bg-amber-500/20 text-amber-600 border border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-600 border border-blue-500/40'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] bg-[var(--canvas)]'
                  }`}
                >
                  {pri}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="text-xs text-rose-500 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onCollapse}
                className="px-3 py-1 bg-[var(--canvas)] hover:bg-[var(--line)] text-xs text-[var(--ink)] rounded-lg transition-colors cursor-pointer font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
