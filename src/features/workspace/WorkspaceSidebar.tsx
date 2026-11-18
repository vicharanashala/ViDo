import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Archive,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Leaf,
  Palette,
  Plus,
} from 'lucide-react';

export interface WorkspaceSidebarProps {
  userName?: string;
  userPrefix?: string;
  onNewTaskClick?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  userName,
  userPrefix,
  onNewTaskClick,
}) => {
  const displayName = [userPrefix, userName].filter(Boolean).join(' ');

  const navItems = [
    {
      to: '/app',
      end: true,
      label: 'Home base',
      hint: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      to: '/app/today',
      label: "Today's move",
      hint: 'Today',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      to: '/app/upcoming',
      label: "What's next",
      hint: 'Upcoming',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      to: '/app/needs-attention',
      label: 'Pick up again',
      hint: 'Past',
      icon: <AlertCircle className="w-4 h-4" />,
    },
    {
      to: '/app/completed',
      label: 'Wins so far',
      hint: 'Completed',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      to: '/app/archived',
      label: 'Resting',
      hint: 'Archived',
      icon: <Archive className="w-4 h-4" />,
    },
  ];

  return (
    <aside
      aria-label="Workspace navigation"
      className="hidden md:flex w-[220px] shrink-0 flex-col justify-between border-r border-[var(--line)] bg-[var(--surface)]/80 p-3 sticky top-0 h-screen overflow-y-auto"
    >
      <div>
        <Link to="/app" className="flex items-center gap-2.5 px-2 py-1.5 mb-4" aria-label="ViDo">
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

        {onNewTaskClick && (
          <button
            type="button"
            onClick={onNewTaskClick}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold py-2 mb-4 shadow-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New task
          </button>
        )}

        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1.5 px-2.5">
          Views
        </div>
        <nav aria-label="Views" className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="min-w-0">
                <span className="text-xs font-semibold block leading-tight">{item.label}</span>
                {item.hint && (
                  <span className="text-[10px] text-[var(--faint)] block leading-tight">{item.hint}</span>
                )}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="pt-3 border-t border-[var(--line)] space-y-1">
        <Link
          to="/style-lab"
          className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span>Themes</span>
        </Link>
        <div className="flex items-center gap-2 px-2.5 py-2">
          <span className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold">
            {userName ? userName.trim().charAt(0).toUpperCase() : <Leaf className="w-4 h-4" />}
          </span>
          <span className="min-w-0">
            <span className="text-xs font-semibold text-[var(--ink)] block leading-tight truncate">
              {displayName || 'You'}
            </span>
            <span className="text-[10px] text-[var(--muted)] block leading-tight">Saved on this device</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
