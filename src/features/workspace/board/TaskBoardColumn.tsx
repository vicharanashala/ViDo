import React, { useState, useRef, useEffect, useMemo } from 'react';
import { SampleTask } from '../../../data/sampleTasks';
import { PriorityColors } from '../../../utils/priorityColor';
import { TaskBoardCard } from './TaskBoardCard';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  MoreVertical,
  GripVertical,
  Check,
} from 'lucide-react';

export type ListSortOption = 'my_order' | 'date' | 'deadline' | 'starred' | 'title';

export interface TaskBoardColumnProps {
  id: string;
  title: string;
  tasks: SampleTask[];
  expandedTaskId: string | null;
  onExpandTask: (taskId: string) => void;
  onCollapseTask: () => void;
  onToggleTask: (task: SampleTask) => void;
  onUpdateTask: (taskId: string, updates: Partial<SampleTask>) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onAddTask: (category: string, title: string) => void;
  onOpenCreateSlider?: (category: string) => void;
  onRenameList?: (id: string, newTitle: string) => void;
  onDeleteList?: (id: string) => void;
  onOpenDatePopover: (e: React.MouseEvent, taskId: string) => void;
  onOpenRepeatModal: (e: React.MouseEvent, taskId: string) => void;
  onOpenDeadlinePopover?: (e: React.MouseEvent, taskId: string) => void;
  categories?: { id: string; title: string }[];
  referenceDateStr?: string;
  isPreview?: boolean;
  widthClass?: string;
  isDraggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  // Task Card Drag & Drop
  draggedTaskId?: string | null;
  onDragStartTask?: (e: React.DragEvent, taskId: string) => void;
  onDragEndTask?: (e: React.DragEvent) => void;
  onMoveTask?: (taskId: string, targetColId: string, targetTaskId?: string, position?: 'before' | 'after') => void;
  // Sorting & List Actions
  sortBy?: ListSortOption;
  onSortChange?: (columnId: string, sort: ListSortOption) => void;
  onDeleteCompletedTasks?: (columnId: string) => void;
  onCleanUpOldTasks?: (columnId: string) => void;
  priorityColors?: PriorityColors;
}

const SORT_OPTIONS: { id: ListSortOption; label: string }[] = [
  { id: 'my_order', label: 'My order' },
  { id: 'date', label: 'Date' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'starred', label: 'Starred recently' },
  { id: 'title', label: 'Title' },
];

export const TaskBoardColumn: React.FC<TaskBoardColumnProps> = ({
  id,
  title,
  tasks,
  expandedTaskId,
  onExpandTask,
  onCollapseTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onToggleStar,
  onAddTask,
  onOpenCreateSlider,
  onRenameList,
  onDeleteList,
  onOpenDatePopover,
  onOpenRepeatModal,
  onOpenDeadlinePopover,
  categories,
  referenceDateStr = '2026-11-17',
  isPreview = true,
  widthClass = 'w-[360px] min-w-[360px] shrink-0',
  isDraggable = true,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedTaskId,
  onDragStartTask,
  onDragEndTask,
  onMoveTask,
  priorityColors,
  sortBy: propSortBy,
  onSortChange,
  onDeleteCompletedTasks,
  onCleanUpOldTasks,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [spacerMinHeight, setSpacerMinHeight] = useState<number>(0);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);

  // DnD hover states
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<'before' | 'after' | null>(null);
  const [isFeedDragOver, setIsFeedDragOver] = useState(false);

  // Sorting state
  const [internalSort, setInternalSort] = useState<ListSortOption>('my_order');
  const currentSort = propSortBy ?? internalSort;

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleDraft(title);
  }, [title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const activeTasks = tasks.filter((t) => t.state !== 'completed');
  const completedTasks = tasks.filter((t) => t.state === 'completed');
  const oldUncompletedTasks = activeTasks.filter((t) => {
    if (t.dueDate) return t.dueDate < referenceDateStr;
    if (t.createdAt) return t.createdAt.slice(0, 10) < referenceDateStr;
    return false;
  });

  const handleToggleCompleted = () => {
    if (!showCompleted) {
      const currentHeight = spacerRef.current?.getBoundingClientRect().height || 0;
      setSpacerMinHeight(currentHeight);
      setShowCompleted(true);
    } else {
      setSpacerMinHeight(0);
      setShowCompleted(false);
    }
  };

  useEffect(() => {
    if (completedTasks.length === 0 && showCompleted) {
      setShowCompleted(false);
      setSpacerMinHeight(0);
    }
  }, [completedTasks.length, showCompleted]);

  // Sort active tasks according to currentSort
  const sortedActiveTasks = useMemo(() => {
    const list = [...activeTasks];
    switch (currentSort) {
      case 'date':
        return list.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
      case 'deadline':
        return list.sort((a, b) => {
          const aDateTime = `${a.dueDate || '9999-99-99'}T${a.dueTime || '23:59'}`;
          const bDateTime = `${b.dueDate || '9999-99-99'}T${b.dueTime || '23:59'}`;
          return aDateTime.localeCompare(bDateTime);
        });
      case 'starred':
        return list.sort((a, b) => {
          if (Boolean(a.starred) === Boolean(b.starred)) return 0;
          return a.starred ? -1 : 1;
        });
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'my_order':
      default:
        return list;
    }
  }, [activeTasks, currentSort]);

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setIsAdding(false);
      return;
    }
    onAddTask(id, newTaskTitle.trim());
    setNewTaskTitle('');
    setIsAdding(false);
  };

  const handleSaveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== title && onRenameList) {
      onRenameList(id, trimmed);
    } else {
      setTitleDraft(title);
    }
    setIsEditingTitle(false);
  };

  // Card DnD drop handlers
  const handleDragOverCard = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos = e.clientY < midY ? 'before' : 'after';
    setHoveredTaskId(targetTaskId);
    setHoverPosition(pos);
    setIsFeedDragOver(false);
  };

  const handleDragLeaveCard = (e: React.DragEvent, targetTaskId: string) => {
    e.stopPropagation();
    if (hoveredTaskId === targetTaskId) {
      setHoveredTaskId(null);
      setHoverPosition(null);
    }
  };

  const handleDropCard = (e: React.DragEvent, targetTaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = hoverPosition || 'after';
    setHoveredTaskId(null);
    setHoverPosition(null);
    setIsFeedDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.type === 'vido-task' && data.taskId) {
          onMoveTask && onMoveTask(data.taskId, id, targetTaskId, pos);
          if (currentSort !== 'my_order') {
            if (onSortChange) onSortChange(id, 'my_order');
            else setInternalSort('my_order');
          }
        }
      }
    } catch {}
  };

  // Feed DnD handlers (empty column or bottom of column)
  const handleDragOverFeed = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isFeedDragOver) {
      setIsFeedDragOver(true);
      setHoveredTaskId(null);
      setHoverPosition(null);
    }
  };

  const handleDragLeaveFeed = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsFeedDragOver(false);
  };

  const handleDropFeed = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFeedDragOver(false);
    setHoveredTaskId(null);
    setHoverPosition(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.type === 'vido-task' && data.taskId) {
          onMoveTask && onMoveTask(data.taskId, id);
          if (currentSort !== 'my_order') {
            if (onSortChange) onSortChange(id, 'my_order');
            else setInternalSort('my_order');
          }
        }
      }
    } catch {}
  };

  return (
    <div
      data-testid="task-board-column"
      data-column-id={id}
      draggable={isDraggable && !isEditingTitle && !draggedTaskId}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`board-task-column group/board ${widthClass} bg-[var(--surface)] border transition-all duration-150 rounded-2xl p-4 flex flex-col shadow-xs h-full overflow-hidden select-none ${
        isDragging
          ? 'opacity-40 border-dashed border-[var(--accent)] scale-[0.98]'
          : isDragOver
          ? 'ring-2 ring-[var(--accent)] border-[var(--accent)] bg-[var(--accent-soft)]/20 shadow-md scale-[1.01]'
          : 'border-[var(--line)]'
      }`}
    >
      {/* 1. Statically Fixed Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-2.5 shrink-0">
        <div className="flex items-center space-x-1.5 min-w-0 flex-1 mr-1">
          {isDraggable && !isEditingTitle && (
            <div
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                onDragStart && onDragStart(e);
              }}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--muted)]/50 hover:text-[var(--ink)] transition-colors rounded-lg hover:bg-[var(--canvas)] shrink-0"
              title="Drag to rearrange list"
              aria-label="Drag to rearrange list"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          {isEditingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTitle();
              }}
              className="flex-1 mr-1"
            >
              <input
                type="text"
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleSaveTitle}
                className="w-full bg-[var(--canvas)] border border-[var(--accent)] rounded-lg px-2 py-0.5 text-sm font-bold text-[var(--ink)] focus:outline-none"
              />
            </form>
          ) : (
            <h3
              onDoubleClick={() => setIsEditingTitle(true)}
              className="text-sm font-bold text-[var(--ink)] truncate tracking-tight cursor-pointer hover:text-[var(--accent)] transition-colors"
              title="Double click to rename list"
            >
              {title}
            </h3>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--canvas)] text-[var(--muted)] border border-[var(--line)] shrink-0">
            {activeTasks.length}
          </span>
        </div>

        {/* Column 3-Dots Options Menu (Google Tasks style) */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1 rounded-full hover:bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            title="List options"
            aria-label="List options"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-56 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xl z-40 py-2 space-y-0.5 animate-in fade-in duration-100 select-none text-left"
              role="menu"
              aria-label="List options"
            >
              {/* Sort by header */}
              <div className="px-3.5 pt-1 pb-1 text-xs text-[var(--muted)] font-medium">
                Sort by
              </div>

              {/* Sort options */}
              {SORT_OPTIONS.map((opt) => {
                const isSelected = currentSort === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (onSortChange) onSortChange(id, opt.id);
                      else setInternalSort(opt.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3.5 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer text-left"
                    role="menuitem"
                  >
                    <div className="w-4 h-4 flex items-center justify-center mr-2 shrink-0">
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[var(--ink)]" strokeWidth={2.5} />
                      )}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}

              <div className="my-1.5 border-t border-[var(--line)]" />

              {/* Rename list */}
              <button
                type="button"
                onClick={() => {
                  setIsEditingTitle(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer text-left"
                role="menuitem"
              >
                <div className="w-4 h-4 mr-2 shrink-0" />
                <span>Rename list</span>
              </button>

              {/* Delete list */}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete list "${title}" and all its tasks?`)) {
                    onDeleteList && onDeleteList(id);
                  }
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                role="menuitem"
              >
                <div className="w-4 h-4 mr-2 shrink-0" />
                <span>Delete list</span>
              </button>

              <div className="my-1.5 border-t border-[var(--line)]" />

              {/* Print list */}
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3.5 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer text-left"
                role="menuitem"
              >
                <div className="w-4 h-4 mr-2 shrink-0" />
                <span>Print list</span>
              </button>

              {/* Delete all completed tasks */}
              <button
                type="button"
                onClick={() => {
                  onDeleteCompletedTasks && onDeleteCompletedTasks(id);
                  setIsMenuOpen(false);
                }}
                disabled={completedTasks.length === 0}
                className={`w-full flex items-center px-3.5 py-1.5 text-xs transition-colors text-left ${
                  completedTasks.length === 0
                    ? 'opacity-40 cursor-not-allowed text-[var(--muted)]'
                    : 'text-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer'
                }`}
                role="menuitem"
              >
                <div className="w-4 h-4 mr-2 shrink-0" />
                <span>Delete all completed tasks</span>
              </button>

              {/* Clean up old tasks */}
              <button
                type="button"
                onClick={() => {
                  onCleanUpOldTasks && onCleanUpOldTasks(id);
                  setIsMenuOpen(false);
                }}
                disabled={oldUncompletedTasks.length === 0}
                className={`w-full flex items-center px-3.5 py-1.5 text-xs transition-colors text-left ${
                  oldUncompletedTasks.length === 0
                    ? 'opacity-40 cursor-not-allowed text-[var(--muted)]'
                    : 'text-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer'
                }`}
                role="menuitem"
              >
                <div className="w-4 h-4 mr-2 shrink-0" />
                <span>Clean up old tasks</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Statically Fixed "+ Add a task" Action */}
      <div className="shrink-0 mb-3">
        {isAdding ? (
          <form onSubmit={handleSubmitNewTask}>
            <div className="flex items-center space-x-2 bg-[var(--canvas)] border border-[var(--accent)] rounded-xl px-3 py-2 shadow-2xs">
              <Circle className="w-4 h-4 text-[var(--faint)] shrink-0" />
              <input
                type="text"
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onBlur={() => {
                  if (!newTaskTitle.trim()) setIsAdding(false);
                }}
                placeholder="Title"
                className="w-full bg-transparent text-xs text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none"
              />
              <button
                type="submit"
                className="text-[11px] font-bold text-[var(--accent)] hover:opacity-80 px-1 cursor-pointer"
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (onOpenCreateSlider) {
                onOpenCreateSlider(id);
              } else {
                setIsAdding(true);
              }
            }}
            className="w-full flex items-center space-x-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] p-2 rounded-xl transition-all cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full border border-[var(--accent)]/40 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <span>Add a task</span>
          </button>
        )}
      </div>

      {/* 3. Task Feed: ONLY THIS SCROLLS VERTICALLY (supports DnD anywhere within and across boards) */}
      <div
        onDragOver={handleDragOverFeed}
        onDragLeave={handleDragLeaveFeed}
        onDrop={handleDropFeed}
        className={`board-task-feed flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-2.5 pr-1.5 flex flex-col rounded-xl transition-colors ${
          isFeedDragOver ? 'bg-[var(--accent-soft)]/20 ring-1 ring-[var(--accent)]' : ''
        }`}
      >
        {sortedActiveTasks.map((task) => (
          <TaskBoardCard
            key={task.id}
            task={task}
            isExpanded={expandedTaskId === task.id}
            onExpand={() => onExpandTask(task.id)}
            onCollapse={onCollapseTask}
            onToggle={onToggleTask}
            onUpdate={onUpdateTask}
            onDelete={onDeleteTask}
            onToggleStar={onToggleStar}
            onOpenDatePopover={onOpenDatePopover}
            onOpenRepeatModal={onOpenRepeatModal}
            onOpenDeadlinePopover={onOpenDeadlinePopover}
            categories={categories}
            referenceDateStr={referenceDateStr}
            isPreview={isPreview}
            isDraggable={true}
            isBeingDragged={draggedTaskId === task.id}
            isDropTargetBefore={hoveredTaskId === task.id && hoverPosition === 'before'}
            isDropTargetAfter={hoveredTaskId === task.id && hoverPosition === 'after'}
            onDragStartTask={onDragStartTask}
            onDragOverTask={(e) => handleDragOverCard(e, task.id)}
            onDragLeaveTask={(e) => handleDragLeaveCard(e, task.id)}
            onDropTask={(e) => handleDropCard(e, task.id)}
            onDragEndTask={onDragEndTask}
            priorityColors={priorityColors}
          />
        ))}

        {/* Empty State Illustration */}
        {sortedActiveTasks.length === 0 && !isAdding && (
          completedTasks.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 stroke-[2.2]" />
              </div>
              <h4 className="text-sm font-bold text-[var(--ink)]">All tasks complete</h4>
              <p className="text-xs text-[var(--muted)] mt-1">Nice work!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] mb-3">
                <CheckCircle2 className="w-7 h-7 text-[var(--accent)]" />
              </div>
              <h4 className="text-xs font-bold text-[var(--ink)]">No tasks yet</h4>
              <p className="text-[11px] text-[var(--muted)] mt-1 max-w-[200px] leading-relaxed">
                Add your to-dos to keep track of work in {title}
              </p>
            </div>
          )
        )}

        {/* Spacer that preserves position and pins Completed Tasks at bottom without jumping upward on expansion */}
        {completedTasks.length > 0 && (
          <div
            ref={spacerRef}
            className="flex-1 min-h-[16px] shrink-0"
            style={{
              minHeight: spacerMinHeight > 0 ? `${spacerMinHeight}px` : undefined,
            }}
          />
        )}

        {/* 4. Completed Tasks Accordion: Inside feed, opens downward and makes way for vertical scrolling downward */}
        {completedTasks.length > 0 && (
          <div className="pt-3 border-t border-[var(--line)] select-none pb-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleCompleted}
              className="w-full flex items-center space-x-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors py-1 cursor-pointer"
            >
              {showCompleted ? (
                <ChevronDown className="w-4 h-4 shrink-0 text-[var(--muted)]" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0 text-[var(--muted)]" />
              )}
              <span>Completed ({completedTasks.length})</span>
            </button>

            {showCompleted && (
              <div className="mt-2.5 space-y-2.5 pr-1 animate-in fade-in duration-150">
                {completedTasks.map((task) => (
                  <TaskBoardCard
                    key={task.id}
                    task={task}
                    isExpanded={expandedTaskId === task.id}
                    onExpand={() => onExpandTask(task.id)}
                    onCollapse={onCollapseTask}
                    onToggle={onToggleTask}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                    onToggleStar={onToggleStar}
                    onOpenDatePopover={onOpenDatePopover}
                    onOpenRepeatModal={onOpenRepeatModal}
                    onOpenDeadlinePopover={onOpenDeadlinePopover}
                    categories={categories}
                    referenceDateStr={referenceDateStr}
                    isPreview={isPreview}
                    isDraggable={false}
                    priorityColors={priorityColors}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
