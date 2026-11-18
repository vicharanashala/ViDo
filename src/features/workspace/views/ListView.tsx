import React, { useState } from 'react';
import type { Task } from '../../../data/taskTypes';
import { TaskRow } from '../TaskRow';
import { Button } from '../../../components/ui';
import { Inbox } from 'lucide-react';

export interface ListViewProps {
  title: string;
  description: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTaskClick?: () => void;
  onToggleComplete?: (task: Task) => void;
  onFocusTask?: (task: Task) => void;
  onCheckInStart?: (task: Task) => void;
  onBringToToday?: (task: Task) => void;
  onScheduleTask?: (task: Task, dateKey: string) => void;
  onOpenPath?: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  title,
  description,
  tasks,
  onTaskClick,
  onNewTaskClick,
  onToggleComplete,
  onFocusTask,
  onCheckInStart,
  onBringToToday,
  onScheduleTask,
  onOpenPath,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTasks =
    selectedCategory === 'all' ? tasks : tasks.filter((task) => task.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Tasks', count: tasks.length },
    { id: 'personal', label: 'Personal', count: tasks.filter((task) => task.category === 'personal').length },
    { id: 'home', label: 'Household', count: tasks.filter((task) => task.category === 'home').length },
    { id: 'work', label: 'Work', count: tasks.filter((task) => task.category === 'work').length },
  ];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--ink)]">{title}</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>
        </div>

        <div className="flex items-center gap-1.5 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--line)] self-start sm:self-auto flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === category.id
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onClick={onTaskClick}
              onToggleComplete={onToggleComplete}
              onFocus={onFocusTask}
              onCheckInStart={onCheckInStart}
              onBringToToday={onBringToToday}
              onSchedule={onScheduleTask}
              onOpenPath={onOpenPath}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-2xl bg-[var(--surface)] my-8">
          <div className="w-12 h-12 rounded-full bg-[var(--canvas)] text-[var(--faint)] flex items-center justify-center mx-auto mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">No tasks in this view</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            All clear. There are no items matching this view and category.
          </p>
          {onNewTaskClick && (
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={onNewTaskClick}>
                Create a task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
