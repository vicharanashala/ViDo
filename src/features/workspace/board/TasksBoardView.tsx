import React, { useState } from 'react';
import { SampleTask } from '../../../data/sampleTasks';
import { TaskBoardColumn, ListSortOption } from './TaskBoardColumn';
import { TaskDatePopover } from './TaskDatePopover';
import { TaskRepeatModal } from './TaskRepeatModal';
import { TaskDeadlinePopover } from './TaskDeadlinePopover';
import { TaskCreateSlider } from './TaskCreateSlider';
import { PriorityColors } from '../../../utils/priorityColor';

export interface CustomListDefinition {
  id: string;
  title: string;
}

export interface TasksBoardViewProps {
  tasks: SampleTask[];
  selectedCategories?: string[];
  priorityColors?: PriorityColors;
  customLists?: CustomListDefinition[];
  onCreateList?: (title: string) => void;
  onRenameList?: (id: string, newTitle: string) => void;
  onDeleteList?: (id: string) => void;
  onReorderLists?: (newOrder: CustomListDefinition[]) => void;
  onToggleTask: (task: SampleTask) => void;
  onUpdateTask: (taskId: string, updates: Partial<SampleTask>) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
  onAddTask?: (
    category: string,
    title: string,
    options?: {
      description?: string;
      dueDate?: string;
      dueTime?: string;
      deadline?: string;
      priority?: 'high' | 'medium' | 'low';
      starred?: boolean;
    }
  ) => void;
  referenceDateStr?: string;
  isPreview?: boolean;
  onMoveTask?: (taskId: string, targetColId: string, targetTaskId?: string, position?: 'before' | 'after') => void;
  onDeleteCompletedTasks?: (columnId: string) => void;
  onCleanUpOldTasks?: (columnId: string) => void;
}

const DEFAULT_COLUMNS: CustomListDefinition[] = [
  { id: 'personal', title: 'Personal & Routine' },
  { id: 'home', title: 'Household & Living' },
  { id: 'work', title: 'Work & Professional' },
];

export const TasksBoardView: React.FC<TasksBoardViewProps> = ({
  tasks,
  selectedCategories,
  priorityColors,
  customLists = DEFAULT_COLUMNS,
  onRenameList,
  onDeleteList,
  onReorderLists,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onToggleStar,
  onAddTask,
  referenceDateStr = '2026-11-17',
  isPreview = true,
  onMoveTask,
  onDeleteCompletedTasks,
  onCleanUpOldTasks,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Google Tasks Bottom Typing Slider state
  const [isCreateSliderOpen, setIsCreateSliderOpen] = useState(false);
  const [createSliderCategory, setCreateSliderCategory] = useState<string>('personal');

  const handleOpenCreateSlider = (colId: string) => {
    setCreateSliderCategory(colId);
    setIsCreateSliderOpen(true);
  };

  // Drag and drop state for board rearrangement
  const [draggedColId, setDraggedColId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Drag and drop state for task cards
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [columnSorts, setColumnSorts] = useState<Record<string, ListSortOption>>({});

  const handleSortChange = (colId: string, sort: ListSortOption) => {
    setColumnSorts((prev) => ({ ...prev, [colId]: sort }));
  };

  const handleDragStartTask = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'vido-task', taskId })
    );
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEndTask = (e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedTaskId(null);
  };

  const handleMoveTaskInternal = (
    taskId: string,
    targetColId: string,
    targetTaskId?: string,
    position?: 'before' | 'after'
  ) => {
    if (onMoveTask) {
      onMoveTask(taskId, targetColId, targetTaskId, position);
    } else {
      onUpdateTask(taskId, { category: targetColId as any });
    }
    setDraggedTaskId(null);
  };

  // Date popover state
  const [datePopoverTaskId, setDatePopoverTaskId] = useState<string | null>(null);
  const [datePopoverPos, setDatePopoverPos] = useState<{
    top: number;
    left: number;
    triggerTop?: number;
    triggerBottom?: number;
  } | null>(null);

  // Repeat popover state
  const [repeatModalTaskId, setRepeatModalTaskId] = useState<string | null>(null);
  const [repeatPopoverPos, setRepeatPopoverPos] = useState<{
    top: number;
    left: number;
    triggerTop?: number;
    triggerBottom?: number;
  } | null>(null);

  // Floating Deadline Popover State
  const [deadlinePopoverTaskId, setDeadlinePopoverTaskId] = useState<string | null>(null);
  const [deadlinePopoverPos, setDeadlinePopoverPos] = useState<{
    top: number;
    left: number;
    triggerTop?: number;
    triggerBottom?: number;
  } | null>(null);

  const activeDateTask = tasks.find((t) => t.id === datePopoverTaskId);
  const activeRepeatTask = tasks.find((t) => t.id === repeatModalTaskId);
  const activeDeadlineTask = tasks.find((t) => t.id === deadlinePopoverTaskId);

  const handleOpenDatePopover = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDatePopoverTaskId(taskId);
    setDatePopoverPos({
      top: rect.bottom + 6,
      left: rect.left,
      triggerTop: rect.top,
      triggerBottom: rect.bottom,
    });
  };

  const handleOpenRepeatPopover = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setRepeatModalTaskId(taskId);
    setRepeatPopoverPos({
      top: rect.bottom + 6,
      left: rect.left,
      triggerTop: rect.top,
      triggerBottom: rect.bottom,
    });
  };

  const handleOpenDeadlinePopover = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDeadlinePopoverTaskId(taskId);
    setDeadlinePopoverPos({
      top: rect.bottom + 6,
      left: rect.left,
      triggerTop: rect.top,
      triggerBottom: rect.bottom,
    });
  };

  const handleSaveDate = (dateStr: string | null, timeStr: string | null) => {
    if (!datePopoverTaskId) return;
    onUpdateTask(datePopoverTaskId, {
      dueDate: dateStr || '',
      dueTime: timeStr || undefined,
    });
    setDatePopoverTaskId(null);
    setDatePopoverPos(null);
  };

  const handleSaveRepeat = (rule: string, time?: string) => {
    if (!repeatModalTaskId) return;
    onUpdateTask(repeatModalTaskId, {
      recurrence: {
        enabled: true,
        rule,
      },
      dueTime: time || undefined,
      // Mutually exclusive: if repeating task is set, it cannot have a deadline!
      deadline: undefined,
    });
    setRepeatModalTaskId(null);
    setRepeatPopoverPos(null);
  };

  const handleSaveDeadline = (deadlineStr: string | null) => {
    if (!deadlinePopoverTaskId) return;
    if (deadlineStr) {
      onUpdateTask(deadlinePopoverTaskId, {
        deadline: deadlineStr,
        // Mutually exclusive: if deadline is set, it cannot be a repeating task!
        recurrence: {
          enabled: false,
          rule: null,
        },
      });
    } else {
      onUpdateTask(deadlinePopoverTaskId, {
        deadline: undefined,
      });
    }
    setDeadlinePopoverTaskId(null);
    setDeadlinePopoverPos(null);
  };

  const handleRemoveRepeat = () => {
    if (!repeatModalTaskId) return;
    onUpdateTask(repeatModalTaskId, {
      recurrence: {
        enabled: false,
        rule: null,
      },
    });
    setRepeatModalTaskId(null);
  };

  // Build dynamic columns: customLists + any distinct categories in tasks
  const dynamicColumns = [...customLists];
  tasks.forEach((t) => {
    if (t.category && !dynamicColumns.some((col) => col.id === t.category)) {
      dynamicColumns.push({
        id: t.category,
        title: t.category.charAt(0).toUpperCase() + t.category.slice(1),
      });
    }
  });

  // Filter displayed columns when selectedCategories are provided
  const displayedColumns =
    selectedCategories && selectedCategories.length > 0
      ? dynamicColumns.filter((col) => selectedCategories.includes(col.id))
      : dynamicColumns;

  // Calculate dynamic column width class matching Google Tasks behavior
  const totalColumns = displayedColumns.length;
  const columnWidthClass =
    totalColumns === 1
      ? 'w-full max-w-3xl min-w-[360px] flex-1'
      : totalColumns === 2
      ? 'flex-1 min-w-[360px] max-w-[640px]'
      : totalColumns === 3
      ? 'flex-1 min-w-[340px] max-w-[500px]'
      : 'w-[360px] min-w-[360px] shrink-0';

  // Drag and drop handlers to rearrange task boards
  const handleDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.setData('text/plain', colId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedColId(colId);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (colId: string) => {
    if (dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const sourceColId = draggedColId || e.dataTransfer.getData('text/plain');
    if (!sourceColId || sourceColId === targetColId) {
      setDraggedColId(null);
      setDragOverColId(null);
      return;
    }

    const sourceIndex = dynamicColumns.findIndex((c) => c.id === sourceColId);
    const targetIndex = dynamicColumns.findIndex((c) => c.id === targetColId);

    if (sourceIndex === -1 || targetIndex === -1) {
      setDraggedColId(null);
      setDragOverColId(null);
      return;
    }

    const reordered = [...dynamicColumns];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    if (onReorderLists) {
      onReorderLists(reordered);
    }

    setDraggedColId(null);
    setDragOverColId(null);
  };

  const handleDragEnd = () => {
    setDraggedColId(null);
    setDragOverColId(null);
  };

  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden relative">
      {/* Horizontal Category Columns Board */}
      <div className="w-full h-full flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex items-stretch space-x-5 pb-3 select-none scroll-smooth">
        {displayedColumns.map((col) => {
          const columnTasks = tasks.filter((t) => t.category === col.id);

          return (
            <TaskBoardColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={columnTasks}
              widthClass={columnWidthClass}
              isDraggable={true}
              isDragging={draggedColId === col.id}
              isDragOver={dragOverColId === col.id && draggedColId !== col.id}
              onDragStart={(e) => handleDragStart(e, col.id)}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragEnd={handleDragEnd}
              expandedTaskId={expandedTaskId}
              onExpandTask={(id) => setExpandedTaskId(id)}
              onCollapseTask={() => setExpandedTaskId(null)}
              onToggleTask={onToggleTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onToggleStar={onToggleStar}
              onAddTask={onAddTask || (() => {})}
              onOpenCreateSlider={handleOpenCreateSlider}
              onRenameList={onRenameList}
              onDeleteList={onDeleteList}
              onOpenDatePopover={handleOpenDatePopover}
              onOpenRepeatModal={handleOpenRepeatPopover}
              onOpenDeadlinePopover={handleOpenDeadlinePopover}
              categories={displayedColumns}
              referenceDateStr={referenceDateStr}
              isPreview={isPreview}
              draggedTaskId={draggedTaskId}
              onDragStartTask={handleDragStartTask}
              onDragEndTask={handleDragEndTask}
              onMoveTask={handleMoveTaskInternal}
              sortBy={columnSorts[col.id] || 'my_order'}
              priorityColors={priorityColors}
              onSortChange={handleSortChange}
              onDeleteCompletedTasks={onDeleteCompletedTasks}
              onCleanUpOldTasks={onCleanUpOldTasks}
            />
          );
        })}
      </div>

      {/* Floating Date & Time Popover */}
      {datePopoverTaskId && datePopoverPos && (
        <TaskDatePopover
          isOpen={true}
          initialDate={activeDateTask?.dueDate}
          initialTime={activeDateTask?.dueTime}
          recurrenceRule={activeDateTask?.recurrence?.rule}
          position={datePopoverPos}
          onClose={() => {
            setDatePopoverTaskId(null);
            setDatePopoverPos(null);
          }}
          onSave={handleSaveDate}
          onOpenRepeat={(e) => {
            const rect = e ? (e.currentTarget as HTMLElement).getBoundingClientRect() : null;
            const pos = rect
              ? {
                  top: rect.bottom + 6,
                  left: rect.left,
                  triggerTop: rect.top,
                  triggerBottom: rect.bottom,
                }
              : datePopoverPos;
            setRepeatModalTaskId(datePopoverTaskId);
            setRepeatPopoverPos(pos);
            setDatePopoverTaskId(null);
            setDatePopoverPos(null);
          }}
        />
      )}

      {/* Recurrence Rules Popover */}
      {repeatModalTaskId && (
        <TaskRepeatModal
          isOpen={true}
          initialRule={activeRepeatTask?.recurrence?.rule}
          initialTime={activeRepeatTask?.dueTime}
          position={repeatPopoverPos}
          onClose={() => {
            setRepeatModalTaskId(null);
            setRepeatPopoverPos(null);
          }}
          onSave={handleSaveRepeat}
          onRemove={handleRemoveRepeat}
        />
      )}

      {/* Floating Deadline Popover */}
      {deadlinePopoverTaskId && deadlinePopoverPos && (
        <TaskDeadlinePopover
          isOpen={true}
          initialDeadline={activeDeadlineTask?.deadline}
          position={deadlinePopoverPos}
          onClose={() => {
            setDeadlinePopoverTaskId(null);
            setDeadlinePopoverPos(null);
          }}
          onSave={handleSaveDeadline}
        />
      )}

      {/* Google Tasks Bottom Typing Slider */}
      <TaskCreateSlider
        isOpen={isCreateSliderOpen}
        onClose={() => setIsCreateSliderOpen(false)}
        defaultCategory={createSliderCategory}
        categories={displayedColumns}
        referenceDateStr={referenceDateStr}
        onCreateTask={(cat, title, options) => {
          if (onAddTask) {
            if (options && (options.description || options.dueDate || options.dueTime || options.deadline || options.priority || options.starred)) {
              onAddTask(cat, title, options);
            } else {
              onAddTask(cat, title);
            }
          }
        }}
      />
    </div>
  );
};
