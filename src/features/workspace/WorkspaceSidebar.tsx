import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Archive,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Palette,
  Plus,
} from 'lucide-react';

export interface WorkspaceSidebarProps {
  counts: {
    today: number;
    needsAttention: number;
    upcoming: number;
    completed: number;
    archived: number;
  };
  onNewTaskClick?: () => void;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({ counts, onNewTaskClick }) => {
  const navItems = [
    { to: '/app', end: true, label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    {
      to: '/app/today',
      label: 'Today',
      icon: <Clock className="w-5 h-5" />,
      count: counts.today,
    },
    {
      to: '/app/upcoming',
      label: 'Upcoming',
      icon: <Calendar className="w-5 h-5" />,
      count: counts.upcoming,
    },
    {
      to: '/app/needs-attention',
      label: 'Needs Attention',
      icon: <AlertCircle className="w-5 h-5" />,
      count: counts.needsAttention,
      badgeColor: 'bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/20',
    },
    {
      to: '/app/completed',
      label: 'Completed',
      icon: <CheckCircle2 className="w-5 h-5" />,
      count: counts.completed,
    },
    {
      to: '/app/archived',
      label: 'Archived',
      icon: <Archive className="w-5 h-5" />,
      count: counts.archived,
    },
  ];

  return (
    <aside
      aria-label="Workspace navigation"
      className="hidden md:flex w-[76px] shrink-0 flex-col items-center gap-3 border-r border-[var(--line)] bg-[var(--surface)]/80 py-4 sticky top-0 h-screen"
    >
      <Link
        to="/app"
        aria-label="ViDo"
        className="w-10 h-10 rounded-2xl bg-[var(--dark)] text-white flex items-center justify-center font-display font-semibold text-lg shadow-sm"
      >
        V
      </Link>

      {onNewTaskClick && (
        <button
          type="button"
          onClick={onNewTaskClick}
          aria-label="New task"
          title="New task"
          className="w-10 h-10 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      <nav aria-label="Views" className="mt-2 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            aria-label={item.count !== undefined ? `${item.label} ${item.count}` : item.label}
            title={item.label}
            className={({ isActive }) =>
              `relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]'
              }`
            }
          >
            {item.icon}
            {item.count !== undefined && item.count > 0 && (
              <span
                className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ${
                  item.badgeColor || 'bg-[var(--canvas)] text-[var(--muted)] border border-[var(--line)]'
                }`}
              >
                {item.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Link
          to="/style-lab"
          aria-label="Themes"
          title="Themes"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
        >
          <Palette className="w-4 h-4" />
        </Link>
        <div
          className="w-9 h-9 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold"
          title="You"
        >
          Y
        </div>
      </div>
    </aside>
  );
};
