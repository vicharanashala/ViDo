import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import type { NewTaskInput } from '../../data/taskTypes';
import { parseQuickAdd } from '../../data/quickAddParser';

export interface QuickAddProps {
  onAdd: (input: NewTaskInput) => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const parsed = parseQuickAdd(title);
  const meta = parsed.meta;
  const hasMeta = Boolean(meta.dateLabel || meta.timeLabel || meta.priority || meta.category);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!parsed.title.trim()) return;
    onAdd({
      title: parsed.title,
      dueDate: parsed.dueDate,
      dueTime: parsed.dueTime,
      priority: parsed.priority,
      category: parsed.category,
    });
    setTitle('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--surface)] border border-[var(--line)] rounded-xl p-2.5 shadow-xs"
      aria-label="Quick add task"
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0 px-1.5">
          <Plus className="w-4 h-4 text-[var(--accent)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={'Add a task… try "tomorrow 6pm !high"'}
            aria-label="New task title"
            className="w-full bg-transparent text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none py-1.5"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!parsed.title.trim()}
          className="shrink-0"
        >
          Add
        </Button>
      </div>

      {title.trim() && hasMeta && (
        <div className="flex flex-wrap items-center gap-1.5 px-1.5 pt-2 pb-0.5">
          {meta.dateLabel && <Badge size="sm">{meta.dateLabel}</Badge>}
          {meta.timeLabel && <Badge size="sm">{meta.timeLabel}</Badge>}
          {meta.priority && (
            <Badge
              size="sm"
              variant={meta.priority === 'high' ? 'danger' : meta.priority === 'medium' ? 'warning' : 'neutral'}
            >
              {meta.priority}
            </Badge>
          )}
          {meta.category && <Badge size="sm" variant="accent">{meta.category}</Badge>}
          <span className="text-[10px] text-[var(--faint)]">Parsed from your sentence</span>
        </div>
      )}
    </form>
  );
};
