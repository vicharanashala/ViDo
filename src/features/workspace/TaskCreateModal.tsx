import React, { useEffect, useRef, useState } from 'react';
import { Button, Input } from '../../components/ui';
import { NewTaskInput, TaskCategory, TaskPriority, TaskRecurrence } from '../../data/taskTypes';
import { toDateKey } from '../../data/taskDates';
import { parseQuickAdd } from '../../data/quickAddParser';
import { Tag, X } from 'lucide-react';

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (input: NewTaskInput) => void;
  defaultDate?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultDate,
}) => {
  const today = defaultDate ?? toDateKey(new Date());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(today);
  const [dueDateTouched, setDueDateTouched] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [recurrence, setRecurrence] = useState<TaskRecurrence | ''>('');
  const [dueTime, setDueTime] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  const [priority, setPriority] = useState<TaskPriority | ''>('medium');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTitle('');
      setDescription('');
      setDueDate(defaultDate ?? toDateKey(new Date()));
      setDueDateTouched(false);
      setDeadlineDate('');
      setRecurrence('');
      setDueTime('');
      setReminderAt('');
      setPriority('medium');
      setCategory('personal');
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !dueDate) return;
    const parsed = parseQuickAdd(title);
    const parsedDeadline = !deadlineDate && parsed.deadlineDate ? parsed.deadlineDate : undefined;
    const parsedHasDateOrTime = Boolean(parsed.deadlineDate || parsed.dueTime || parsed.meta.dateLabel);
    onCreate?.({
      title: parsedHasDateOrTime ? parsed.title : title.trim(),
      description: description.trim() || undefined,
      deadlineDate: deadlineDate || parsedDeadline,
      recurrence: (recurrence || undefined) as TaskRecurrence | undefined,
      dueDate: dueDateTouched ? dueDate : parsed.dueDate,
      dueTime: dueTime || parsed.dueTime,
      reminderAt: reminderAt || undefined,
      priority: (priority || undefined) as TaskPriority | undefined,
      category,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close create task modal"
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="create-task-title" className="text-xl font-bold text-[var(--ink)]">
          Create New Task
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1 mb-5">
          Add the detail you need. Only the title and due date are required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={titleInputRef}
            label="Task Title *"
            required
            placeholder="e.g., Finalize customer onboarding slide deck"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key context, requirements, or links..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1 resize-none"
            />
          </div>

          <Input
            label="Planned Date *"
            type="date"
            required
            value={dueDate}
            onChange={(event) => {
              setDueDate(event.target.value);
              setDueDateTouched(true);
            }}
            helperText="When the task should appear in Today"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Deadline Date (Optional)"
              type="date"
              value={deadlineDate}
              onChange={(event) => {
                setDeadlineDate(event.target.value);
                if (!event.target.value) setRecurrence('');
              }}
            />
            <Input
              label="Deadline Time (Optional)"
              type="time"
              value={dueTime}
              onChange={(event) => setDueTime(event.target.value)}
              helperText="Leave blank if there is no hard deadline"
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
              className="w-full px-3 py-2 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-50"
            >
              <option value="">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays</option>
              <option value="weekly">Weekly</option>
            </select>
            <p className="mt-1 text-[10px] text-[var(--faint)]">
              Set a deadline date first. Each finished occurrence schedules the next one.
            </p>
          </div>

          <Input
            label="Reminder (Optional)"
            type="datetime-local"
            value={reminderAt}
            onChange={(event) => setReminderAt(event.target.value)}
            helperText="A local reminder while ViDo is open"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[var(--faint)]" /> Category
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <option value="personal">Personal</option>
                <option value="home">Household / Living</option>
                <option value="work">Work / Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as TaskPriority | '')}
                className="w-full px-3 py-2 text-xs bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
