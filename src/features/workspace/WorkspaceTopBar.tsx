import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, LogOut, Check, ChevronRight, Settings, Sliders, ArrowLeft } from 'lucide-react';
import { Badge } from '../../components/ui';
import { NotificationBell } from '../teams/NotificationBell';
import { getTeamRepository } from '../teams/teamRepository';
import { TeamInvitation } from '../teams/types';
import { formatTopBarDate } from '../../utils/dateUtils';

export type StatusFilter = 'all' | 'today' | 'needsAttention' | 'upcoming' | 'completed';
export type CategoryFilter = 'all' | 'personal' | 'home' | 'work' | string;
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

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
  title?: string;
  basePath?: string;
  isSettings?: boolean;
  // Filters
  statusFilter?: StatusFilter;
  categoryFilter?: CategoryFilter;
  selectedCategories?: string[];
  priorityFilter?: PriorityFilter;
  onToggleStatusFilter?: (status: StatusFilter) => void;
  onToggleCategoryFilter?: (category: CategoryFilter) => void;
  onTogglePriorityFilter?: (priority: PriorityFilter) => void;
  onClearFilters?: () => void;
  customLists?: Array<{ id: string; title: string }>;
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
  statusFilter = 'all',
  categoryFilter = 'all',
  selectedCategories: propSelectedCategories,
  priorityFilter = 'all',
  onToggleStatusFilter,
  onToggleCategoryFilter,
  onTogglePriorityFilter,
  onClearFilters,
  customLists,
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

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

  const categoryOptions = [
    { id: 'personal', label: 'Personal' },
    { id: 'home', label: 'Household / Living' },
    { id: 'work', label: 'Work / Professional' },
    ...(customLists
      ? customLists
          .filter((l) => !['personal', 'home', 'work'].includes(l.id))
          .map((l) => ({ id: l.id, label: l.title }))
      : []),
  ];

  const priorityOptions = [
    { id: 'high' as const, label: 'High Priority', colorClass: 'text-red-600 font-medium' },
    { id: 'medium' as const, label: 'Medium Priority', colorClass: 'text-amber-600 font-medium' },
    { id: 'low' as const, label: 'Low Priority', colorClass: 'text-blue-600 font-medium' },
  ];

  const statusOptions = [
    { id: 'today' as const, label: 'Due Today' },
    { id: 'needsAttention' as const, label: 'Needs Attention (Overdue)' },
    { id: 'upcoming' as const, label: 'Upcoming Schedule' },
  ];

  const activeCategories =
    propSelectedCategories !== undefined
      ? propSelectedCategories
      : categoryFilter && categoryFilter !== 'all'
      ? [categoryFilter]
      : [];

  const activeCount =
    activeCategories.length +
    (priorityFilter && priorityFilter !== 'all' ? 1 : 0) +
    (statusFilter && statusFilter !== 'all' ? 1 : 0);
  const hasActiveFilters = activeCount > 0;

  const getFilterButtonLabel = () => {
    if (!hasActiveFilters) return 'All Priorities';
    if (activeCount === 1) {
      if (activeCategories.length === 1) {
        return categoryOptions.find((o) => o.id === activeCategories[0])?.label || 'Filtered';
      }
      if (priorityFilter && priorityFilter !== 'all') {
        return priorityOptions.find((o) => o.id === priorityFilter)?.label || 'Filtered';
      }
      if (statusFilter && statusFilter !== 'all') {
        return statusOptions.find((o) => o.id === statusFilter)?.label || 'Filtered';
      }
    }
    return `Filters (${activeCount})`;
  };

  const filterButtonLabel = getFilterButtonLabel();

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

        {/* Filter Trigger Button & Popover Card */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              hasActiveFilters
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-2xs'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]'
            }`}
            aria-label="Filter tasks"
            aria-expanded={isFilterOpen}
          >
            <Filter className={`w-3.5 h-3.5 ${hasActiveFilters ? 'text-[var(--accent)]' : 'text-[var(--faint)]'}`} />
            <span>{filterButtonLabel}</span>
          </button>

          {isFilterOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xl z-50 p-2 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150 select-none"
              role="dialog"
              aria-label="Filter options"
            >
              {/* Category Section */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--faint)] px-2.5 py-1 block">
                  Category
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {categoryOptions.map((opt) => {
                    const isTicked = activeCategories.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onToggleCategoryFilter && onToggleCategoryFilter(opt.id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isTicked
                            ? 'bg-[var(--accent-soft)]/50 text-[var(--ink)] font-semibold'
                            : 'text-[var(--ink)] hover:bg-[var(--canvas)]'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isTicked && (
                          <Check className="w-4 h-4 text-[var(--accent)] shrink-0 ml-2 animate-in zoom-in-75 duration-100" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Section */}
              <div className="pt-1.5 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--faint)] px-2.5 py-1 block">
                  Priority
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {priorityOptions.map((opt) => {
                    const isTicked = priorityFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onTogglePriorityFilter && onTogglePriorityFilter(opt.id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isTicked
                            ? 'bg-[var(--accent-soft)]/50 font-semibold'
                            : 'hover:bg-[var(--canvas)]'
                        }`}
                      >
                        <span className={`truncate ${opt.colorClass}`}>{opt.label}</span>
                        {isTicked && (
                          <Check className="w-4 h-4 text-[var(--accent)] shrink-0 ml-2 animate-in zoom-in-75 duration-100" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeline / Status Section */}
              <div className="pt-1.5 border-t border-[var(--line)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--faint)] px-2.5 py-1 block">
                  Timeline / Status
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {statusOptions.map((opt) => {
                    const isTicked = statusFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onToggleStatusFilter && onToggleStatusFilter(opt.id);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                          isTicked
                            ? 'bg-[var(--accent-soft)]/50 text-[var(--ink)] font-semibold'
                            : 'text-[var(--ink)] hover:bg-[var(--canvas)]'
                        }`}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isTicked && (
                          <Check className="w-4 h-4 text-[var(--accent)] shrink-0 ml-2 animate-in zoom-in-75 duration-100" strokeWidth={2.5} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear All Filters */}
              {hasActiveFilters && onClearFilters && (
                <div className="pt-1.5 border-t border-[var(--line)]">
                  <button
                    type="button"
                    onClick={() => {
                      onClearFilters();
                    }}
                    className="w-full text-center py-1.5 text-xs text-[var(--muted)] hover:text-red-600 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
