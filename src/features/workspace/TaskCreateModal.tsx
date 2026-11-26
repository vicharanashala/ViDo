import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from '../../components/ui';
import { SampleTask } from '../../data/sampleTasks';
import { X, Tag, CheckCircle2 } from 'lucide-react';

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask?: (task: SampleTask) => void;
  // Accepted for compatibility with the workspace category settings; the
  // restored early-creation form intentionally keeps its fixed category list.
  categories?: Array<{ id: string; name: string }>;
  onAddCategory?: (category: { name: string; color?: string }) => unknown;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-17');
  const [dueTime, setDueTime] = useState('17:00');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('medium');
  const [category, setCategory] = useState<'personal' | 'home' | 'work'>('personal');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setSubmittedNotice(false);
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: SampleTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || '2026-11-17',
      dueTime: dueTime || '18:00',
      priority: (priority as 'high' | 'medium' | 'low') || undefined,
      state: 'active',
      category,
      createdAt: '2026-11-17T12:00:00Z',
      checkpoints: [
        {
          id: `cp-${Date.now()}`,
          timestamp: '2026-11-17T12:00:00Z',
          note: 'Task initialized in workspace.',
        },
      ],
    };

    setSubmittedNotice(true);
    onCreateTask?.(newTask);

    // Reset inputs
    setTitle('');
    setDescription('');
    setDueDate('2026-11-17');
    setDueTime('17:00');
    setPriority('medium');
    setCategory('personal');

    // Close the popup so it does not remain stuck open
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
        onClick={(e) => e.stopPropagation()}
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
          Define exact deadlines and ownership for your next responsibility.
        </p>

        {submittedNotice && (
          <div className="mb-5 p-3.5 rounded-xl bg-[var(--green-soft)] border border-[var(--green)]/30 text-xs text-[var(--green)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">
              Task successfully saved to your workspace.
            </p>
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
            <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key context, requirements, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-1 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Target Due Date *"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Input
              label="Due Time (Optional)"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              helperText="Defaults to 23:59 if omitted"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-[var(--faint)]" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
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
                onChange={(e) => setPriority(e.target.value as any)}
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
