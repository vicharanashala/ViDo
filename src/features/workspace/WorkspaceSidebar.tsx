import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Plus,
  Users,
  ChevronDown,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  PanelLeft,
  PanelLeftClose,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { Team } from '../teams/types';

export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 240;
export const MAX_SIDEBAR_WIDTH = 480;
export const COLLAPSED_SIDEBAR_WIDTH = 64;
export const SIDEBAR_WIDTH_STORAGE_KEY = 'vido_sidebar_width';
export const SIDEBAR_COLLAPSED_STORAGE_KEY = 'vido_sidebar_collapsed';

export interface WorkspaceSidebarProps {
  isPreview?: boolean;
  basePath?: string;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  counts: {
    total?: number;
    today: number;
    needsAttention: number;
    upcoming: number;
    completed: number;
    archived: number;
  };
  teams?: Team[];
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNewTaskClick?: () => void;
  onCreateTeamClick?: () => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  isPreview = true,
  basePath = '/preview',
  user,
  counts,
  teams = [],
  sidebarWidth: controlledWidth,
  onSidebarWidthChange,
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  onNewTaskClick,
  onCreateTeamClick,
}) => {
  const location = useLocation();

  // Collapsed state with localStorage persistence
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed = controlledCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    }
  };

  // Resizable width state with localStorage persistence
  const [internalWidth, setInternalWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
      if (saved) {
        const parsed = Number(saved);
        if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH && parsed <= MAX_SIDEBAR_WIDTH) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const width = controlledWidth ?? internalWidth;
  const widthRef = useRef(width);
  widthRef.current = width;

  const [isResizing, setIsResizing] = useState(false);

  const updateWidth = (newWidth: number) => {
    const clamped = Math.min(Math.max(newWidth, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
    setInternalWidth(clamped);
    onSidebarWidthChange?.(clamped);
    try {
      localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clamped));
    } catch {
      // ignore
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(e.clientX, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setInternalWidth(newWidth);
      onSidebarWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      try {
        localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(widthRef.current));
      } catch {
        // ignore
      }
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onSidebarWidthChange]);

  const handleDoubleClick = () => {
    updateWidth(DEFAULT_SIDEBAR_WIDTH);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateWidth(width - 16);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateWidth(width + 16);
    } else if (e.key === 'Home') {
      e.preventDefault();
      updateWidth(MIN_SIDEBAR_WIDTH);
    } else if (e.key === 'End') {
      e.preventDefault();
      updateWidth(MAX_SIDEBAR_WIDTH);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      updateWidth(DEFAULT_SIDEBAR_WIDTH);
    }
  };

  const totalTasks =
    counts.total ?? counts.today + counts.upcoming + counts.needsAttention;

  const dashboardPath = basePath;
  const tasksPath = `${basePath}/tasks`;
  const calendarPath = `${basePath}/calendar`;
  const analyticsPath = `${basePath}/analytics`;

  const isTaskRoute =
    location.pathname === tasksPath ||
    location.pathname.startsWith(`${tasksPath}/`) ||
    location.pathname === `${basePath}/today` ||
    location.pathname === `${basePath}/upcoming` ||
    location.pathname === `${basePath}/needs-attention` ||
    location.pathname === `${basePath}/completed` ||
    location.pathname === `${basePath}/archived`;

  const [isTasksOpen, setIsTasksOpen] = useState(isTaskRoute);

  useEffect(() => {
    if (isTaskRoute) {
      setIsTasksOpen(true);
    }
  }, [isTaskRoute]);

  const taskSubItems = [
    {
      label: 'All Tasks',
      path: tasksPath,
      icon: CheckSquare,
      iconColor: 'text-emerald-400',
      count: totalTasks,
    },
    {
      label: "Today's Tasks",
      path: `${basePath}/today`,
      icon: Clock,
      iconColor: 'text-[var(--accent)]',
      count: counts.today,
    },
    {
      label: 'Upcoming',
      path: `${basePath}/upcoming`,
      icon: Calendar,
      iconColor: 'text-indigo-400',
      count: counts.upcoming,
    },
    {
      label: 'Needs Attention',
      path: `${basePath}/needs-attention`,
      icon: AlertCircle,
      iconColor: 'text-amber-400',
      count: counts.needsAttention,
    },
    {
      label: 'Completed',
      path: `${basePath}/completed`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      count: counts.completed,
    },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-nav-item flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all group relative ${isActive
      ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-xs font-semibold border border-[var(--accent)]/30'
      : 'text-[var(--muted)] hover:bg-[var(--surface-glass)]/60 hover:text-[var(--ink)]'
    }`;

  const effectiveWidth = isCollapsed ? COLLAPSED_SIDEBAR_WIDTH : width;

  return (
    <aside
      aria-label="Workspace navigation"
      style={{
        width: `${effectiveWidth}px`,
        minWidth: `${effectiveWidth}px`,
        maxWidth: `${effectiveWidth}px`,
      }}
      className={`relative glass-panel bg-[var(--surface-glass)]/75 backdrop-blur-2xl text-[var(--ink)] flex flex-col shrink-0 sticky border-r border-[var(--line-glass)] shadow-xl ${isPreview ? 'top-[45px] h-[calc(100vh-45px)]' : 'top-0 h-screen'
        } workspace-sidebar-scrollbar select-none overflow-hidden ${isResizing ? 'transition-none' : 'transition-[width] duration-200 ease-in-out'
        }`}
    >
      {/* 1. Header: Brand & New Task */}
      <div className={`${isCollapsed ? 'p-3 pb-2' : 'p-5 pb-0'} shrink-0`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center mb-3 gap-2">
            <Link to={dashboardPath} title="ViDo Dashboard">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-amber-300 text-[var(--accent-ink)] flex items-center justify-center font-black text-base shadow-md cursor-pointer hover:scale-105 transition-transform">
                V
              </div>
            </Link>
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-glass)]/60 focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors cursor-pointer group relative"
            >
              <PanelLeft className="w-4 h-4" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Expand sidebar
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-5 px-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-amber-300 text-[var(--accent-ink)] flex items-center justify-center font-black text-lg shadow-md shrink-0">
                V
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-[var(--ink)] tracking-tight block">ViDo</span>
                  {isPreview ? (
                    <span className="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs">
                      DEMO
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                      WORKSPACE
                    </span>
                  )}
                </div>
                <span className="text-xs text-[var(--muted)] font-medium tracking-wide block mt-0.5 truncate">
                  {isPreview ? 'Logged-in demo preview' : user?.name || 'Personal Workspace'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-glass)]/60 focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-colors cursor-pointer shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick New Task Button */}
        {onNewTaskClick && (
          <div className="mb-3">
            {isCollapsed ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onNewTaskClick}
                  aria-label="New Task"
                  title="New Task"
                  className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-95 group relative"
                >
                  <Plus className="w-5 h-5" />
                  <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    New Task
                  </span>
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onNewTaskClick}
                className="w-full justify-center gap-1.5 shadow-sm text-sm py-2"
              >
                <Plus className="w-4 h-4" /> New Task
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 2. Scrollable Middle Navigation Area (Tasks, Planning, Teams) */}
      <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-2' : 'pl-5 pr-2 py-2 mr-2'} workspace-sidebar-scrollbar min-h-0`}>
        {!isCollapsed && (
          <div className="text-xs uppercase font-bold tracking-wider text-[var(--faint)] mb-2 px-2.5">
            Workspace
          </div>
        )}
        <nav className="space-y-1">
          <NavLink to={dashboardPath} end className={linkClass} title={isCollapsed ? 'Dashboard' : undefined}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
              <LayoutDashboard className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
              {!isCollapsed && <span>Dashboard</span>}
            </div>
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Dashboard
              </span>
            )}
          </NavLink>

          <div>
            <NavLink
              to={tasksPath}
              onClick={() => setIsTasksOpen(true)}
              title={isCollapsed ? `Tasks (${totalTasks})` : undefined}
              className={() =>
                `sidebar-nav-item flex items-center ${isCollapsed ? 'justify-center p-2.5 group relative' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all ${isTaskRoute
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-xs font-semibold border border-[var(--accent)]/30'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-glass)]/60 hover:text-[var(--ink)]'
                }`
              }
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                <CheckSquare className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                {!isCollapsed && <span>Tasks</span>}
              </div>
              {isCollapsed ? (
                <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Tasks ({totalTasks})
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--canvas)] text-[var(--muted)] border border-[var(--line-glass)] font-bold">
                    {totalTasks}
                  </span>
                  <button
                    type="button"
                    aria-label={isTasksOpen ? 'Collapse task views' : 'Expand task views'}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsTasksOpen((prev) => !prev);
                    }}
                    className="p-0.5 text-[var(--faint)] hover:text-[var(--ink)] rounded transition-colors cursor-pointer !shadow-none !border-transparent"
                  >
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${isTasksOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                    />
                  </button>
                </div>
              )}
            </NavLink>

            {isTasksOpen && !isCollapsed && (
              <div className="space-y-0.5 mt-1 mb-1 pl-3 border-l border-[var(--line-glass)] ml-4.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {taskSubItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `sidebar-nav-item flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all ${isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-2xs'
                        : 'text-[var(--muted)] hover:bg-[var(--surface-glass)]/60 hover:text-[var(--ink)] font-medium'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      <item.icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono text-[var(--muted)] font-semibold shrink-0 ml-1">
                      {item.count}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}

            {isCollapsed && isTaskRoute && (
              <div className="space-y-1 mt-1 pt-1 border-t border-[var(--line-glass)]">
                {taskSubItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `sidebar-nav-item flex items-center justify-center p-2 rounded-lg text-sm transition-all group relative ${isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-2xs'
                        : 'text-[var(--muted)] hover:bg-[var(--surface-glass)]/60 hover:text-[var(--ink)]'
                      }`
                    }
                  >
                    <item.icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                    <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label} ({item.count})
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        {!isCollapsed && (
          <div className="text-xs uppercase font-bold tracking-wider text-[var(--faint)] mb-2 mt-6 px-2.5">
            Planning
          </div>
        )}
        <nav className={`space-y-1 ${isCollapsed ? 'mt-3 pt-2 border-t border-[var(--line-glass)]' : ''}`}>
          <NavLink to={calendarPath} className={linkClass} title={isCollapsed ? 'Calendar' : undefined}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
              <CalendarDays className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
              {!isCollapsed && <span>Calendar</span>}
            </div>
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Calendar
              </span>
            )}
          </NavLink>

          <NavLink to={analyticsPath} className={linkClass} title={isCollapsed ? 'Analytics' : undefined}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
              <BarChart3 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              {!isCollapsed && <span>Analytics</span>}
            </div>
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Analytics
              </span>
            )}
          </NavLink>
        </nav>

        {/* Teams & Shared Projects Section */}
        <div className={`mb-2 ${isCollapsed ? 'mt-3 pt-2 border-t border-[var(--line-glass)]' : 'mt-6'}`}>
          {!isCollapsed && (
            <div className="text-xs uppercase font-bold tracking-wider text-[var(--faint)] mb-2 px-2.5">
              Teams & Shared Projects
            </div>
          )}

          <div className="space-y-1">
            {teams && teams.length > 0 ? (
              teams.map((team) => (
                <NavLink
                  key={team.id}
                  to={`${basePath}/team/${team.id}`}
                  title={isCollapsed ? team.name : undefined}
                  className={({ isActive }) =>
                    `sidebar-nav-item flex items-center ${isCollapsed ? 'justify-center p-2.5 group relative' : 'justify-between px-3 py-2'} rounded-xl text-sm font-medium transition-all ${isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-xs font-semibold border border-[var(--accent)]/30'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-glass)]/60 hover:text-[var(--ink)]'
                    }`
                  }
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5 truncate'}`}>
                    <Users className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                    {!isCollapsed && <span className="truncate">{team.name}</span>}
                  </div>
                  {isCollapsed ? (
                    <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {team.name} {team.leadId === (user?.id || 'demo-user-1') ? '(LEAD)' : ''}
                    </span>
                  ) : (
                    team.leadId === (user?.id || 'demo-user-1') && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-500/20 text-sky-400 rounded font-bold shrink-0">
                        LEAD
                      </span>
                    )
                  )}
                </NavLink>
              ))
            ) : !isCollapsed ? (
              <div className="px-3 py-2 text-sm text-[var(--muted)] italic">No teams yet</div>
            ) : null}

            {onCreateTeamClick && (
              <button
                type="button"
                onClick={onCreateTeamClick}
                aria-label="Create Team"
                title={isCollapsed ? 'Create Team' : undefined}
                className={`sidebar-nav-item w-full flex items-center ${isCollapsed ? 'justify-center p-2.5 group relative' : 'gap-2 px-3 py-2 text-left'} rounded-xl text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-glass)]/60 hover:text-[var(--ink)] transition-colors cursor-pointer`}
              >
                <Plus className="w-4 h-4 text-sky-400" />
                {!isCollapsed && <span>Create Team</span>}
                {isCollapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 bg-[var(--dark)] text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Create Team
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Resizable Right Gutter Handle (Visible only when expanded) */}
      {!isCollapsed && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          aria-valuenow={width}
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          tabIndex={0}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
          title="Drag to resize sidebar (Double-click to reset)"
          className={`absolute top-0 -right-1 bottom-0 w-2.5 cursor-col-resize z-40 transition-colors group flex items-center justify-center focus-visible:outline-none focus-visible:bg-[var(--accent)] ${isResizing
              ? 'bg-[var(--accent)]'
              : 'hover:bg-[var(--accent)]/60 active:bg-[var(--accent)] bg-transparent'
            }`}
        >
          <div
            className={`w-1 h-8 rounded-full transition-all ${isResizing ? 'bg-white opacity-100 shadow-xs' : 'bg-white/40 opacity-0 group-hover:opacity-100'
              }`}
          />
        </div>
      )}
    </aside>
  );
};
