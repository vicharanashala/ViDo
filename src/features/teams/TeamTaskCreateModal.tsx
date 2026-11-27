import React, { useState } from 'react';
import { X, CheckSquare, Plus, AlertCircle } from 'lucide-react';
import { getTeamRepository } from './teamRepository';
import { TeamMember, TeamMilestone, TeamTask, TeamTaskPriority } from './types';
import { Button } from '../../components/ui';

export interface TeamTaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  leadId: string;
  members: TeamMember[];
  milestones: TeamMilestone[];
  onTaskCreated?: (task: TeamTask) => void;
}

export const TeamTaskCreateModal: React.FC<TeamTaskCreateModalProps> = ({
  isOpen,
  onClose,
  teamId,
  leadId,
  members,
  milestones,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('2026-11-25');
  const [priority, setPriority] = useState<TeamTaskPriority>('medium');
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setError('Please provide a task title');
      return;
    }
    if (!deadline) {
      setError('Please specify a delivery deadline');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const selectedMember = members.find((m) => m.userId === assigneeId);

      const repo = getTeamRepository();
      const created = await repo.createTeamTask({
        teamId,
        leadId,
        title: cleanTitle,
        description: description.trim() || undefined,
        deadline,
        priority,
        status: 'active',
        progress: 0,
        milestoneId: milestoneId || undefined,
        assigneeId: selectedMember?.userId,
        assigneeName: selectedMember?.name,
        assigneeEmail: selectedMember?.email,
      });

      setTitle('');
      setDescription('');
      setMilestoneId('');
      setAssigneeId('');
      if (onTaskCreated) onTaskCreated(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create team task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-team-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg glass-modal bg-[var(--surface-glass-modal)] border border-[var(--line-glass)] rounded-2xl shadow-2xl overflow-hidden text-[var(--ink)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line-glass)] flex items-center justify-between bg-[var(--canvas)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 id="create-team-task-title" className="text-base font-bold text-[var(--ink)]">
                Create Team Task
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Define a shared deliverable, phase milestone, and assignee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Build responsive layout for team settings"
              className="w-full px-3.5 py-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--faint)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              Description <span className="text-[var(--muted)] font-normal">(Optional)</span>
            </label>
            <textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Specific deliverables, references, or instructions..."
              className="w-full px-3.5 py-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--faint)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-deadline" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                Target Deadline
              </label>
              <input
                id="task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TeamTaskPriority)}
                className="w-full px-3.5 py-2 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
                <option value="none">No Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-milestone" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                Associated Milestone
              </label>
              <select
                id="task-milestone"
                value={milestoneId}
                onChange={(e) => setMilestoneId(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <option value="">No Milestone Phase</option>
                {milestones.map((m, idx) => (
                  <option key={m.id} value={m.id}>
                    Phase {idx + 1}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-assignee" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
                Assign Deliverable To
              </label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <option value="">Unassigned (Open Backlog)</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !title.trim()}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Task'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
