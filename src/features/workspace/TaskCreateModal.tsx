import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Input, DatePicker, TimePicker } from '../../components/ui';
import { SampleTask } from '../../data/sampleTasks';
import { DEFAULT_CATEGORIES, type UserCategory } from '../../data/categories';
import { X, Tag, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import {
  getTodayDateString,
  getSevenDaysAgoDateString,
  getCurrentTimeString,
  getDefaultDueTime,
  validateChronologicalDeadline,
} from '../../utils/dateUtils';

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask?: (task: SampleTask) => void;
  /** Clock used for "today" and validation. Defaults to the real current time. */
  now?: Date;
  categories?: UserCategory[];
  onAddCategory?: (category: { name: string; color?: string }) => Promise<UserCategory> | UserCategory;
  initialStartDate?: string;
  initialDueDate?: string;
  initialDueTime?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  now: nowProp,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  initialDueDate,
  initialDueTime,
}) => {
  const now = nowProp ?? new Date();
  const todayStr = getTodayDateString(now);
  const sevenDaysAgoStr = getSevenDaysAgoDateString(now);
  const currentTimeStr = getCurrentTimeString(now);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => initialDueDate || todayStr);
  const [dueTime, setDueTime] = useState(() => initialDueTime ?? getDefaultDueTime());
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('medium');
  const [category, setCategory] = useState<string>('personal');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(() => {
    return validateChronologicalDeadline({
      dueDate,
      dueTime,
      now,
    });
  }, [dueDate, dueTime, now]);

  const isFormValid = Boolean(title.trim()) && validation.isValid;
  const isSelectedDateToday = dueDate === todayStr;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setSubmittedNotice(false);

      if (!dueDate) {
        setDueDate(todayStr);
      }
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !validation.isValid) return;

    const newTask: SampleTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: validation.effectiveDueDate,
      dueTime: validation.effectiveDueTime,
      priority: (priority as 'high' | 'medium' | 'low') || undefined,
      state: 'active',
      category,
      createdAt: validation.effectiveCreatedAt,
      checkpoints: [
        {
          id: `cp-${Date.now()}`,
          timestamp: validation.effectiveCreatedAt,
          note: 'Task initialized in workspace.',
        },
      ],
    };

    setSubmittedNotice(true);
    onCreateTask?.(newTask);

    setTitle('');
    setDescription('');
    setDueDate(todayStr);
    setDueTime(getDefaultDueTime());
    setPriority('medium');
    setCategory('personal');

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
        className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close create task modal"
          className="absolute top-5 right-5 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="create-task-title" className="text-2xl font-bold tracking-tight text-[var(--ink)]">
          Create New Task
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1.5 mb-6">
          Define exact deadlines and chronological ownership for your next responsibility.
        </p>

        {submittedNotice && (
          <div className="mb-5 p-4 rounded-xl bg-[var(--green-soft)] border border-[var(--green)]/30 text-sm text-[var(--green)] flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold leading-relaxed">
              Task successfully saved to your workspace.
            </p>
          </div>
        )}

        {validation.generalError && (
          <div
            role="alert"
            className="mb-5 p-4 rounded-xl bg-[var(--red-soft)] border border-[var(--red)]/30 text-sm text-[var(--red)] flex items-start gap-2.5 animate-in fade-in duration-150"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Invalid Chronological Combination</p>
              <p className="mt-0.5 text-xs leading-relaxed opacity-90">{validation.generalError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={titleInputRef}
            label="Task Title *"
            required
            placeholder="e.g., Finalize customer onboarding slide deck"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key context, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePicker
              label="Target Due Date *"
              required
              value={dueDate}
              onChange={setDueDate}
              min={sevenDaysAgoStr}
              today={todayStr}
              error={validation.dateError}
              helperText="Up to 7 days back, for work already started"
            />

            <TimePicker
              label="Due Time (Optional)"
              value={dueTime}
              onChange={setDueTime}
              minTime={isSelectedDateToday ? currentTimeStr : undefined}
              error={validation.timeError}
              helperText={
                isSelectedDateToday
                  ? `Must be after ${currentTimeStr} (defaults to 11:59 PM if omitted)`
                  : 'Defaults to 11:59 PM if omitted'
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="create-task-category" className="block text-sm font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[var(--faint)]" /> Category
                </label>
                {onAddCategory && !isAddingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> New
                  </button>
                )}
              </div>

              {isAddingCategory ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-100">
                  <input
                    type="text"
                    value={newCategoryName}
                    placeholder="e.g., Fitness"
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!newCategoryName.trim()}
                    onClick={async () => {
                      if (!newCategoryName.trim() || !onAddCategory) return;
                      try {
                        const created = await onAddCategory({ name: newCategoryName.trim() });
                        setCategory(created.id);
                        setNewCategoryName('');
                        setIsAddingCategory(false);
                      } catch {}
                    }}
                    className="px-3 py-2 text-xs font-semibold"
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="px-2.5 py-2 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <select
                  id="create-task-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.isCustom ? '★' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <option value="">None</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="pt-5 border-t border-[var(--line)] flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!isFormValid}
              aria-label="Create Task"
              className="px-5 py-2.5 text-sm font-semibold"
            >
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
