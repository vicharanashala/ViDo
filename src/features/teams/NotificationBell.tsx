import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Users } from 'lucide-react';
import { TeamInvitation } from './types';

export interface NotificationBellProps {
  invitations: TeamInvitation[];
  onRespond: (invitationId: string, accept: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  invitations,
  onRespond,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pendingCount = invitations.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAction = async (invitationId: string, accept: boolean) => {
    try {
      setRespondingId(invitationId);
      await onRespond(invitationId, accept);
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors cursor-pointer"
        aria-label={`Notifications: ${pendingCount} pending invitations`}
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {pendingCount > 0 && (
          <span
            data-testid="notification-badge"
            className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-[var(--accent)] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse"
          >
            {pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-testid="notification-dropdown"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-lg z-50 overflow-hidden text-sm"
        >
          <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between bg-[var(--canvas)]/60">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--accent)]" />
              <span className="font-semibold text-[var(--ink)]">Team Invitations</span>
            </div>
            {pendingCount > 0 && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-semibold">
                {pendingCount} pending
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
            {pendingCount === 0 ? (
              <div className="p-6 text-center text-[var(--muted)]">
                <p className="text-sm">No pending invitations</p>
                <p className="text-xs text-[var(--faint)] mt-1">
                  When someone adds you to a team, invitations will appear here.
                </p>
              </div>
            ) : (
              invitations.map((inv) => {
                const isProcessing = respondingId === inv.id;
                return (
                  <div key={inv.id} className="p-4 hover:bg-[var(--canvas)]/40 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-[var(--ink)] text-sm">{inv.teamName}</h4>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Invited by <span className="font-medium text-[var(--ink)]">{inv.inviterName}</span> ({inv.inviterEmail})
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={isProcessing || isLoading}
                        onClick={() => handleAction(inv.id, false)}
                        className="px-3 py-1.5 rounded-md border border-[var(--line)] text-xs font-medium text-[var(--muted)] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        type="button"
                        disabled={isProcessing || isLoading}
                        onClick={() => handleAction(inv.id, true)}
                        className="px-3 py-1.5 rounded-md bg-[var(--accent)] text-white text-xs font-medium hover:opacity-95 shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isProcessing ? 'Accepting...' : 'Accept'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
