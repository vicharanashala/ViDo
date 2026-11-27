import React, { useState } from 'react';
import { X, Mail, Send, AlertCircle } from 'lucide-react';
import { getTeamRepository } from './teamRepository';
import { UserProfile, TeamInvitation } from './types';

export interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  inviter: UserProfile;
  onInviteSent?: (invitation: TeamInvitation) => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  inviter,
  onInviteSent,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (cleanEmail === inviter.email.trim().toLowerCase()) {
      setError('You are already the Team Lead of this team');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const repo = getTeamRepository();
      const invite = await repo.sendInvitation(teamId, teamName, inviter, cleanEmail);
      setEmail('');
      if (onInviteSent) onInviteSent(invite);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="w-full max-w-md glass-modal bg-[var(--surface-glass-modal)] border border-[var(--line-glass)] rounded-2xl shadow-2xl overflow-hidden text-[var(--ink)]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line-glass)] flex items-center justify-between bg-[var(--canvas)]/40">
          <div>
            <h3 id="invite-modal-title" className="text-base font-bold text-[var(--ink)]">
              Invite Team Member
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Add a collaborator to <span className="font-semibold">{teamName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--line)]/50 transition-colors cursor-pointer"
            aria-label="Close invite modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="invite-email" className="block text-xs font-semibold text-[var(--ink)] mb-1.5">
              Collaborator Google Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[var(--faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="colleague@gmail.com"
                required
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--canvas)] border border-[var(--line)] rounded-xl text-[var(--ink)] placeholder-[var(--faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-all"
              />
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1.5">
              The invitee will see an in-app invitation banner the next time they sign in with this email.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-95 shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending...' : 'Send Invitation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
