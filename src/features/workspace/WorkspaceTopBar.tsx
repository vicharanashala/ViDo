import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  LogOut,
  ChevronRight,
  Settings,
  Sliders,
  ArrowLeft,
  Sun,
  Sunset,
  Moon,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/ui';
import { NotificationBell } from '../teams/NotificationBell';
import { getTeamRepository } from '../teams/teamRepository';
import { TeamInvitation } from '../teams/types';
import { formatTopBarDate } from '../../utils/dateUtils';
import { useTheme, ThemeMode } from '../../lib/theme';

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
  onOpenSettings?: () => void;
  invitations?: TeamInvitation[];
  onRespondInvitation?: (invitationId: string, accept: boolean) => Promise<void>;
  currentDate?: string;
  basePath?: string;
  isSettings?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  isPreview = true,
  user,
  authMode: _authMode,
  onSearchFocus,
  onSignOut,
  onOpenSettings,
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

  // Profile Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { mode: currentThemeMode, setMode: setCelestialMode } = useTheme();

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { mode: 'auto', label: 'Auto', icon: Sparkles },
    { mode: 'light', label: 'Day', icon: Sun },
    { mode: 'evening', label: 'Dusk', icon: Sunset },
    { mode: 'dark', label: 'Night', icon: Moon },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line-glass)] px-6 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4 shadow-xs relative">
      {/* Background glass blur layer isolated to prevent trapping child dropdowns in a backdrop root */}
      <div className="absolute inset-0 -z-10 glass-panel pointer-events-none" />
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
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-sm font-medium text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-all cursor-pointer"
              aria-label="Filter tasks"
            >
              <Filter className="w-4 h-4 text-[var(--faint)]" />
              <span className="text-xs">All Priorities</span>
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

        {/* User Profile Circular Avatar & Floating Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            aria-label="User profile menu"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            title={`${userName} ${isPreview ? '(Preview Mode)' : ''}`}
            className="flex items-center gap-1.5 rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-transform active:scale-95 cursor-pointer group"
          >
            <div
              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border shadow-xs transition-all ${isPreview
                ? 'bg-amber-500/15 text-amber-800 border-amber-500/30 group-hover:border-amber-500/70'
                : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30 group-hover:border-[var(--accent)]'
                }`}
            >
              {userInitials}
            </div>
          </button>

          {/* Floating Dropdown Card */}
          {isDropdownOpen && (
            <div
              role="menu"
              aria-label="User profile options"
              className="absolute right-0 top-full mt-2 w-72 rounded-2xl glass-modal border border-[var(--line-glass)] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-[var(--ink)]"
              style={{
                backgroundColor: 'var(--surface-glass-modal)',
                backdropFilter: 'blur(40px) saturate(220%)',
                WebkitBackdropFilter: 'blur(40px) saturate(220%)',
              }}
            >
              {/* 1. User Identity Header */}
              <div className="p-2 mb-2 pb-3 border-b border-[var(--line-glass)] flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full font-bold text-sm flex items-center justify-center border shadow-xs shrink-0 ${isPreview
                    ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                    : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30'
                    }`}
                >
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[var(--ink)] block truncate">
                      {userName}
                    </span>
                    {isPreview && (
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        Demo
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--muted)] block truncate">
                    {userSubtitle}
                  </span>
                </div>
              </div>

              {/* 2. Atmosphere Theme Switcher */}
              <div className="px-2 py-1.5 mb-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--faint)] mb-2">
                  Atmosphere & Theme
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[var(--canvas)] border border-[var(--line-glass)]">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = currentThemeMode === option.mode;
                    return (
                      <button
                        key={option.mode}
                        type="button"
                        onClick={() => setCelestialMode(option.mode)}
                        aria-pressed={isActive}
                        title={`Switch theme to ${option.label}`}
                        className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${isActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-2xs border border-[var(--accent)]/30'
                          : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-glass)]'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5 mb-0.5" />
                        <span className="text-[10px] leading-tight">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Navigation Links */}
              <div className="space-y-0.5 border-t border-[var(--line-glass)] pt-2">
                <Link
                  to={`${basePath}/settings`}
                  role="menuitem"
                  onClick={(e) => {
                    if (onOpenSettings) {
                      e.preventDefault();
                      onOpenSettings();
                    }
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-glass)]/80 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[var(--accent)]" />
                  <span>Workspace Settings</span>
                </Link>
              </div>

              {/* 4. Sign Out / Exit Demo */}
              {onSignOut && (
                <div className="pt-1.5 mt-1.5 border-t border-[var(--line-glass)]">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    aria-label="Sign out"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isPreview ? 'Exit Preview' : 'Sign Out'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
