import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, LogOut, ChevronRight, Settings, Sliders, ArrowLeft } from 'lucide-react';
import { Badge } from '../../components/ui';
import { NotificationBell } from '../teams/NotificationBell';
import { getTeamRepository } from '../teams/teamRepository';
import { TeamInvitation } from '../teams/types';
import { formatTopBarDate } from '../../utils/dateUtils';

export interface WorkspaceTopBarProps {
  isPreview?: boolean;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  authMode?: 'firebase' | 'emulator' | 'unconfigured';
  onSearchFocus?: () => void;
  onSignOut?: () => void;
  invitations?: TeamInvitation[];
  onRespondInvitation?: (invitationId: string, accept: boolean) => Promise<void>;
  currentDate?: string;
  basePath?: string;
  isSettings?: boolean;
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  isPreview = true,
  user,
  authMode: _authMode,
  onSearchFocus,
  onSignOut,
  invitations: propInvitations,
  onRespondInvitation,
  currentDate: propCurrentDate,
  basePath = '/preview',
  isSettings: propIsSettings,
}) => {
  const location = useLocation();
  const isSettingsPage = propIsSettings ?? location.pathname.endsWith('/settings');
  const userName = isPreview ? 'Demo User' : user?.name || 'Alex Morgan';
  const userInitials = isPreview
    ? 'DU'
    : userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
  const userSubtitle = isPreview
    ? 'Personal Workspace'
    : user?.email || 'alex.morgan@gmail.com';
  const userEmail = isPreview ? 'demo@vido.app' : user?.email || 'alex.morgan@gmail.com';
  const userId = isPreview ? 'demo-user-uid' : user?.id || 'alex-morgan-uid';

  const [displayDate, setDisplayDate] = useState<string>(() => propCurrentDate ?? formatTopBarDate());

  useEffect(() => {
    if (propCurrentDate) {
      setDisplayDate(propCurrentDate);
      return;
    }
    const interval = setInterval(() => {
      setDisplayDate(formatTopBarDate());
    }, 60000);
    return () => clearInterval(interval);
  }, [propCurrentDate]);

  const [internalInvitations, setInternalInvitations] = useState<TeamInvitation[]>([]);

  useEffect(() => {
    if (propInvitations !== undefined) return;
    const repo = getTeamRepository();
    const unsubscribe = repo.subscribeToInvitations(userEmail, (invites) => {
      setInternalInvitations(invites);
    });
    return unsubscribe;
  }, [userEmail, propInvitations]);

  const activeInvitations = propInvitations ?? internalInvitations;

  const handleRespond = async (invitationId: string, accept: boolean) => {
    if (onRespondInvitation) {
      await onRespondInvitation(invitationId, accept);
      return;
    }
    const repo = getTeamRepository();
    await repo.respondToInvitation(invitationId, accept, {
      id: userId,
      email: userEmail,
      name: userName,
    });
  };

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)]/95 backdrop-blur-xs border-b border-[var(--line)] px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
      {/* Workspace Context / Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isSettingsPage ? (
          <div className="flex items-center gap-2">
            <Link
              to={basePath}
              className="text-sm sm:text-base font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex items-center gap-1.5"
            >
              <span>Workspace</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-[var(--faint)]" />
            <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--ink)] flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[var(--accent)]" /> Settings
            </span>
          </div>
        ) : (
          <span className="text-base sm:text-lg font-bold tracking-tight text-[var(--ink)]">Workspace</span>
        )}
        {isPreview && (
          <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Interactive Preview
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {isSettingsPage ? (
          <>
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--canvas)] text-[var(--muted)] border border-[var(--line)]">
              <Sliders className="w-3.5 h-3.5 text-[var(--accent)]" /> Preferences & Customization
            </span>
            <Link
              to={basePath}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </>
        ) : (
          <>
            {/* Search */}
            <div className="relative hidden sm:block w-64 lg:w-80">
              <Search className="w-4 h-4 text-[var(--faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search tasks..."
                onFocus={onSearchFocus}
                className="w-full pl-9 pr-12 py-2 text-sm bg-[var(--canvas)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-all"
                aria-label="Search tasks"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-[var(--faint)] bg-[var(--surface)] border border-[var(--line)] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            </div>

            {/* Filter */}
            <button
              type="button"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors cursor-pointer"
              aria-label="Filter tasks"
            >
              <Filter className="w-4 h-4 text-[var(--faint)]" />
              <span>All Priorities</span>
            </button>

            {/* Date Badge */}
            <div className="hidden lg:block">
              <Badge variant="neutral" size="sm" data-testid="topbar-date" className="text-xs font-medium px-3 py-1">
                {displayDate}
              </Badge>
            </div>
          </>
        )}

        {/* Notification Bell */}
        <NotificationBell
          invitations={activeInvitations}
          onRespond={handleRespond}
        />

        {/* User Profile Badge */}
        <div
          className="flex items-center gap-2.5 pl-3 border-l border-[var(--line)]"
          title={`${userName} ${isPreview ? '(Preview Mode)' : ''}`}
        >
          <div
            className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border shadow-xs ${
              isPreview
                ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
            }`}
          >
            {userInitials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-[var(--ink)] block leading-tight">
                {userName}
              </span>
              {isPreview && (
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  Demo
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--muted)] block leading-tight truncate max-w-[150px]">
              {userSubtitle}
            </span>
          </div>
        </div>

        {/* Sign Out Button (for authenticated workspace) */}
        {!isPreview && onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="p-2 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer shrink-0"
            title="Sign out of ViDo"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
