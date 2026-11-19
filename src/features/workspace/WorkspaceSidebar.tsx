import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Archive,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Gamepad2,
  LayoutDashboard,
  Leaf,
  ListChecks,
  PanelLeftClose,
  Palette,
  Pencil,
  Plus,
} from 'lucide-react';

export interface WorkspaceSidebarProps {
  userName?: string;
  userPrefix?: string;
  onNewTaskClick?: () => void;
  onClose?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  userName,
  userPrefix,
  onNewTaskClick,
  onClose,
}) => {
  const displayName = [userPrefix, userName].filter(Boolean).join(' ');
  const location = useLocation();

  const navGroups: {
    label: string;
    items: { to: string; label: string; icon: React.ReactNode; end?: boolean }[];
  }[] = [
    {
      label: 'Main',
      items: [
        {
          to: '/app',
          end: true,
          label: 'Home',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          to: '/app/today',
          label: 'Today',
          icon: <Clock className="w-4 h-4" />,
        },
        {
          to: '/app/upcoming',
          label: 'Upcoming',
          icon: <Calendar className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'Plan',
      items: [
        {
          to: '/app/paths',
          label: 'Task paths',
          icon: <ListChecks className="w-4 h-4" />,
        },
        {
          to: '/app/trail',
          label: 'Momentum trail',
          icon: <Gamepad2 className="w-4 h-4" />,
        },
      ],
    },
    {
      label: 'History',
      items: [
        {
          to: '/app/needs-attention',
          label: 'Past',
          icon: <AlertCircle className="w-4 h-4" />,
        },
        {
          to: '/app/completed',
          label: 'Completed',
          icon: <CheckCircle2 className="w-4 h-4" />,
        },
        {
          to: '/app/archived',
          label: 'Archived',
          icon: <Archive className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      aria-label="Workspace navigation"
      className="hidden md:flex w-[220px] shrink-0 flex-col justify-between border-r border-[var(--line)] bg-[var(--surface)]/80 p-3 sticky top-0 h-screen overflow-y-auto"
    >
      <div>
        <div className="mb-4 flex items-center justify-between gap-1">
          <Link to="/app" className="flex items-center gap-2.5 px-2 py-1.5" aria-label="ViDo">
            <span className="w-8 h-8 rounded-xl bg-[var(--dark)] text-white flex items-center justify-center font-display font-semibold text-base shadow-sm">
              V
            </span>
            <span>
              <span className="font-display font-semibold text-lg text-[var(--ink)] block leading-tight">
                ViDo
              </span>
              <span className="text-[10px] text-[var(--muted)] block">Personal workspace</span>
            </span>
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] cursor-pointer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {onNewTaskClick && (
          <button
            type="button"
            onClick={onNewTaskClick}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold py-2 mb-4 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New task
          </button>
        )}

        <div className="space-y-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1.5 px-2.5">
                {group.label}
              </div>
              <nav aria-label={group.label} className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => {
                      const pathActive =
                        item.to === '/app/paths' && location.pathname.includes('/tasks/');
                      return `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                        isActive || pathActive
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                          : 'text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]'
                      }`;
                    }}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="min-w-0 text-xs font-semibold leading-tight">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--line)] space-y-1">
        <Link
          to="/style-lab"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span>Themes</span>
        </Link>
        <Link
          to="/app/profile"
          aria-label="Edit profile"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">
            {userName ? userName.trim().charAt(0).toUpperCase() : <Leaf className="w-4 h-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold leading-tight text-[var(--ink)]">
              {displayName || 'You'}
            </span>
            <span className="block text-[10px] leading-tight text-[var(--muted)]">Edit profile</span>
          </span>
          <Pencil className="h-3.5 w-3.5 shrink-0" />
        </Link>
      </div>
    </aside>
  );
};
