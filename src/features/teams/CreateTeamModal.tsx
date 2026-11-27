import React, { useState } from 'react';
import { X, Users, AlertCircle, Plus } from 'lucide-react';
import { getTeamRepository } from './teamRepository';
import { UserProfile, Team } from './types';
import { Button } from '../../components/ui';

export interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onTeamCreated?: (team: Team) => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onTeamCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      setError('Please provide a team name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const repo = getTeamRepository();
      const team = await repo.createTeam(cleanName, cleanDescription, currentUser);
      setName('');
      setDescription('');
      if (onTeamCreated) {
        onTeamCreated(team);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-team-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md glass-modal bg-[var(--surface-glass-modal)] border border-[var(--line-glass)] rounded-2xl shadow-2xl overflow-hidden text-[var(--ink)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line-glass)] flex items-center justify-between bg-[var(--canvas)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 id="create-team-modal-title" className="text-base font-bold text-[var(--ink)]">
                Create Team Workspace
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Establish a shared space for phased milestones and team tasks
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
            <label htmlFor="team-name" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              Team / Project Name
            </label>
            <input
              id="team-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., Alpha Launch or Core Platform"
              className="w-full px-3.5 py-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--faint)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="team-description" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              Project Goal & Description <span className="text-[var(--muted)] font-normal">(Optional)</span>
            </label>
            <textarea
              id="team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What common mission or deliverable is this team coordinating?"
              className="w-full px-3.5 py-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--faint)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)] transition-all resize-none"
            />
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
              disabled={isSubmitting || !name.trim()}
              className="gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : 'Create Team'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
