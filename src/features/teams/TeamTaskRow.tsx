import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  User,
  Flag,
  Lock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  AlertCircle,
} from 'lucide-react';
import { TeamTask, TeamMilestone, UserProfile } from './types';
import { Button } from '../../components/ui';

export interface TeamTaskRowProps {
  task: TeamTask;
  milestone?: TeamMilestone;
  currentUser: UserProfile;
  isLead: boolean;
  onUpdateProgress?: (taskId: string, progress: number, note?: string) => Promise<void>;
}

export const TeamTaskRow: React.FC<TeamTaskRowProps> = ({
  task,
  milestone,
  currentUser,
  isLead,
  onUpdateProgress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState(task.progress);
  const [checkpointNote, setCheckpointNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permission check: only assigned member or team lead can update progress
  const canUpdate = isLead || (task.assigneeId !== undefined && task.assigneeId === currentUser.id);

  const isCompleted = task.status === 'completed' || task.progress === 100;

  const handleProgressChange = async (newProgress: number) => {
    setSelectedProgress(newProgress);
    if (!onUpdateProgress) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdateProgress(
        task.id,
        newProgress,
        checkpointNote.trim() ? checkpointNote.trim() : undefined
      );
      setCheckpointNote('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update task progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckpointSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpointNote.trim() || !onUpdateProgress) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onUpdateProgress(task.id, selectedProgress, checkpointNote.trim());
      setCheckpointNote('');
    } catch (err: any) {
      setError(err?.message || 'Failed to add checkpoint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityBadge = (priority: TeamTask['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Medium
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      data-testid={`team-task-row-${task.id}`}
      className={`p-4 rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-[var(--surface)]/60 border-[var(--line)] opacity-85'
          : 'bg-[var(--surface)] border-[var(--line)] shadow-xs hover:border-[var(--ink)]/20'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Task Info & Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {milestone && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-full">
                <Flag className="w-3 h-3" />
                <span>{milestone.title}</span>
              </span>
            )}
            {getPriorityBadge(task.priority)}
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="text-xs text-[var(--muted)] flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" /> Due {task.deadline}
              </span>
            )}
          </div>

          <h4
            className={`text-base font-semibold text-[var(--ink)] ${
              isCompleted ? 'line-through text-[var(--muted)]' : ''
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Center: Assignee Avatar & Name */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          {task.assigneeId ? (
            <div className="flex items-center gap-2 bg-[var(--canvas)] px-2.5 py-1.5 rounded-xl border border-[var(--line)]">
              <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center uppercase shadow-2xs">
                {(task.assigneeName || 'User')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-[var(--ink)] block leading-tight">
                  {task.assigneeName || task.assigneeEmail}
                </span>
                <span className="text-xs text-[var(--muted)] block leading-tight mt-0.5">
                  Assignee
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] bg-[var(--canvas)] px-2.5 py-1.5 rounded-xl border border-[var(--line)]">
              <User className="w-3.5 h-3.5" />
              <span>Unassigned</span>
            </div>
          )}
        </div>

        {/* Right: Progress Indicator & Action Toggle */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <div className="w-32">
            <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)] mb-1">
              <span>Progress</span>
              <span className="font-bold text-[var(--ink)]">{task.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--canvas)] border border-[var(--line)] overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  task.progress === 100
                    ? 'bg-emerald-500'
                    : 'bg-[var(--accent)]'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-[var(--line)] hover:bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            aria-label={isExpanded ? 'Collapse task details' : 'Expand task details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Controls & Checkpoints */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[var(--line)] space-y-4 animate-in fade-in duration-150">
          {/* Progress Controls */}
          <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--line)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[var(--ink)]">
                Update Deliverable Progress
              </span>
              {!canUpdate && (
                <span className="text-[11px] text-[var(--muted)] flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3" /> Read-only: Only assignee or lead can modify
                </span>
              )}
            </div>

            {canUpdate ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleProgressChange(val)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        task.progress === val
                          ? 'bg-[var(--accent)] text-white shadow-xs'
                          : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--accent)]'
                      }`}
                    >
                      {val}% {val === 100 ? '✓ Complete' : ''}
                    </button>
                  ))}
                </div>

                {/* Add Checkpoint Note */}
                <form onSubmit={handleCheckpointSubmit} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={checkpointNote}
                    onChange={(e) => setCheckpointNote(e.target.value)}
                    placeholder="Record a checkpoint update note..."
                    className="flex-1 px-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-lg text-xs text-[var(--ink)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting || !checkpointNote.trim()}
                    className="gap-1 text-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Log Checkpoint</span>
                  </Button>
                </form>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)]">
                Task is assigned to {task.assigneeName || 'another team member'}. You have read-only visibility.
              </p>
            )}

            {error && (
              <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Checkpoint History Timeline */}
          {task.checkpoints && task.checkpoints.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Checkpoint History ({task.checkpoints.length})</span>
              </div>
              <div className="space-y-2">
                {task.checkpoints.map((cp) => (
                  <div
                    key={cp.id}
                    className="p-2.5 rounded-lg bg-[var(--canvas)] border border-[var(--line)] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                      <span className="font-semibold text-[var(--ink)]">{cp.authorName}</span>
                      <span>{cp.timestamp ? new Date(cp.timestamp).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-[var(--ink)]">{cp.note}</p>
                    <div className="text-[10px] font-mono text-[var(--accent)] font-bold">
                      Progress: {cp.progress}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
