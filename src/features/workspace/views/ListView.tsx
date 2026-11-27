import React, { useState } from 'react';
import { SampleTask } from '../../../data/sampleTasks';
import { DEFAULT_CATEGORIES, type UserCategory } from '../../../data/categories';
import { TaskCard } from '../TaskCard';
import { Button } from '../../../components/ui';
import { Inbox } from 'lucide-react';

export interface ListViewProps {
  title: string;
  description: string;
  tasks: SampleTask[];
  onTaskClick: (task: SampleTask) => void;
  onNewTaskClick?: () => void;
  categories?: UserCategory[];
  isPreview?: boolean;
}

export const ListView: React.FC<ListViewProps> = ({
  title,
  description,
  tasks,
  onTaskClick,
  onNewTaskClick,
  categories: userCategories = DEFAULT_CATEGORIES,
  isPreview = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTasks =
    selectedCategory === 'all'
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Tasks', count: tasks.length },
    ...userCategories.map((c) => ({
      id: c.id,
      label: c.name,
      count: tasks.filter((t) => t.category === c.id).length,
    })),
  ];

  return (
    <div className="space-y-6 p-8 max-w-6xl mx-auto">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">{title}</h2>
          <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[var(--canvas)] p-1 rounded-xl border border-[var(--line)] self-start sm:self-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} isPreview={isPreview} />
          ))}
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center border border-dashed border-[var(--line)] rounded-2xl bg-[var(--surface)] my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--canvas)] text-[var(--faint)] flex items-center justify-center mx-auto shadow-xs">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl font-bold tracking-tight text-[var(--ink)]">No tasks in this category</h3>
            <p className="text-base text-[var(--muted)] max-w-md mx-auto leading-relaxed">
              All clear. There are no items matching this view and category filter.
            </p>
          </div>
          {onNewTaskClick && (
            <div className="pt-2">
              <Button variant="secondary" size="md" onClick={onNewTaskClick} className="px-6 py-2.5 text-base font-semibold">
                Create New Task
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
