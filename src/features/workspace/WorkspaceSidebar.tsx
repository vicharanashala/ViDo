import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  BarChart3,
  Plus,
  LogOut,
  Users,
  ChevronDown,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { Button } from '../../components/ui';
import { Team } from '../teams/types';

export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 240;
export const MAX_SIDEBAR_WIDTH = 480;
export const SIDEBAR_WIDTH_STORAGE_KEY = 'vido_sidebar_width';

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
  onNewTaskClick,
  onCreateTeamClick,
  onOpenSettings,
  onSignOut,
}) => {
  const location = useLocation();

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
  const settingsPath = `${basePath}/settings`;

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
    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-white/15 text-white shadow-xs font-semibold'
        : 'text-gray-300 hover:bg-white/8 hover:text-white'
    }`;

  return (
    <aside
      aria-label="Workspace navigation"
      style={{
        width: `${width}px`,
        minWidth: `${MIN_SIDEBAR_WIDTH}px`,
        maxWidth: `${MAX_SIDEBAR_WIDTH}px`,
      }}
      className={`relative bg-[var(--dark)] text-gray-200 flex flex-col justify-between shrink-0 sticky border-r border-white/10 ${
        isPreview ? 'top-[45px] h-[calc(100vh-45px)]' : 'top-0 h-screen'
      } workspace-sidebar-scrollbar select-none overflow-hidden ${
        isResizing ? 'transition-none' : 'transition-[width] duration-75'
      }`}
    >
      {/* 1. Fixed Top Header: Brand & New Task */}
      <div className="p-5 pb-0 shrink-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5 px-1">
          <div className="w-10 h-10 rounded-xl bg-white text-[var(--dark)] flex items-center justify-center font-black text-lg shadow-sm">
            V
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight block">ViDo</span>
              {isPreview ? (
                <span className="text-xs font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs">
                  DEMO
                </span>
              ) : (
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white border border-white/20">
                  WORKSPACE
                </span>
              )}
            </div>
            <span className="text-xs text-amber-300/90 font-medium tracking-wide block mt-0.5">
              {isPreview ? 'Logged-in demo preview' : user?.name || 'Personal Workspace'}
            </span>
          </div>
        </div>

        {/* Quick New Task Button */}
        {onNewTaskClick && (
          <div className="mb-4">
            <Button
              variant="primary"
              size="sm"
              onClick={onNewTaskClick}
              className="w-full justify-center gap-1.5 shadow-sm text-sm py-2"
            >
              <Plus className="w-4 h-4" /> New Task
            </Button>
          </div>
        )}
      </div>

      {/* 2. Scrollable Middle Navigation Area (Tasks, Planning, Teams) */}
      <div className="flex-1 overflow-y-auto pl-5 pr-2 py-2 mr-2 workspace-sidebar-scrollbar min-h-0">
        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2 px-2.5">
          Workspace
        </div>
        <nav className="space-y-1">
          <NavLink to={dashboardPath} end className={linkClass}>
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4.5 h-4.5 text-[var(--accent)]" />
              <span>Dashboard</span>
            </div>
          </NavLink>

          <div>
            <NavLink
              to={tasksPath}
              onClick={() => setIsTasksOpen(true)}
              className={() =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isTaskRoute
                    ? 'bg-white/15 text-white shadow-xs font-semibold'
                    : 'text-gray-300 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4.5 h-4.5 text-emerald-400" />
                <span>Tasks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-200 font-bold">
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
                  className="p-0.5 text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isTasksOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </button>
              </div>
            </NavLink>

            {isTasksOpen && (
              <div className="space-y-0.5 mt-1 mb-1 pl-3 border-l border-white/10 ml-4.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {taskSubItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all ${
                        isActive
                          ? 'bg-white/12 text-white font-semibold shadow-2xs'
                          : 'text-gray-400 hover:bg-white/6 hover:text-gray-200 font-medium'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2 truncate">
                      <item.icon className={`w-4 h-4 shrink-0 ${item.iconColor}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="text-xs font-mono text-gray-400 font-semibold shrink-0 ml-1">
                      {item.count}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2 mt-6 px-2.5">
          Planning
        </div>
        <nav className="space-y-1">
          <NavLink to={calendarPath} className={linkClass}>
            <div className="flex items-center gap-2.5">
              <CalendarDays className="w-4.5 h-4.5 text-indigo-400" />
              <span>Calendar</span>
            </div>
          </NavLink>

          <NavLink to={analyticsPath} className={linkClass}>
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-400" />
              <span>Analytics</span>
            </div>
          </NavLink>
        </nav>

        {/* Teams & Shared Projects Section */}
        <div className="mt-6 mb-2">
          <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2 px-2.5">
            Teams & Shared Projects
          </div>

          <div className="space-y-1">
            {teams && teams.length > 0 ? (
              teams.map((team) => (
                <NavLink
                  key={team.id}
                  to={`${basePath}/team/${team.id}`}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-xs font-semibold'
                        : 'text-gray-300 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Users className="w-4.5 h-4.5 text-sky-400 shrink-0" />
                    <span className="truncate">{team.name}</span>
                  </div>
                  {team.leadId === (user?.id || 'demo-user-1') && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-500/20 text-sky-300 rounded font-bold shrink-0">
                      LEAD
                    </span>
                  )}
                </NavLink>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400 italic">No teams yet</div>
            )}

            {onCreateTeamClick && (
              <button
                type="button"
                onClick={onCreateTeamClick}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/8 hover:text-white transition-colors cursor-pointer text-left"
              >
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Create Team</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Fixed Bottom Settings Footer: Profile, Themes, Sign Out */}
      <div className="p-5 pt-3 border-t border-white/10 space-y-2 text-sm shrink-0 bg-[var(--dark)]">
        {!isPreview && (
          <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(user?.name || 'Alex Morgan')
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-white block truncate">
                  {user?.name || 'Alex Morgan'}
                </span>
                <span className="text-xs text-gray-400 block truncate">
                  {user?.email || 'alex.morgan@gmail.com'}
                </span>
              </div>
            </div>
          </div>
        )}

        <NavLink
          to={settingsPath}
          onClick={(e) => {
            if (onOpenSettings) {
              e.preventDefault();
              onOpenSettings();
            }
          }}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-white/15 text-white shadow-xs font-semibold'
                : 'text-gray-300 hover:bg-white/8 hover:text-white'
            }`
          }
        >
          <Settings className="w-4 h-4 text-gray-400" />
          <span>Settings</span>
        </NavLink>

        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>

      {/* 4. Resizable Right Gutter Handle */}
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
        className={`absolute top-0 -right-1 bottom-0 w-2.5 cursor-col-resize z-40 transition-colors group flex items-center justify-center focus-visible:outline-none focus-visible:bg-[var(--accent)] ${
          isResizing
            ? 'bg-[var(--accent)]'
            : 'hover:bg-[var(--accent)]/60 active:bg-[var(--accent)] bg-transparent'
        }`}
      >
        <div
          className={`w-1 h-8 rounded-full transition-all ${
            isResizing ? 'bg-white opacity-100 shadow-xs' : 'bg-white/40 opacity-0 group-hover:opacity-100'
          }`}
        />
      </div>
    </aside>
  );
};
