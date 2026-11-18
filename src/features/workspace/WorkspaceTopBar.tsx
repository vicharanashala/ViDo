import React, { useState } from 'react';
import { CircleHelp, Filter, Search, UserRound, X } from 'lucide-react';
import { Badge } from '../../components/ui';
import type { TaskPriority } from '../../data/taskTypes';
import type { DeadlineFilter } from '../../data/taskFilters';

export interface WorkspaceTopBarProps {
  title: string;
  subtitle?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  priority?: 'all' | TaskPriority;
  onPriorityChange?: (priority: 'all' | TaskPriority) => void;
  deadline?: DeadlineFilter;
  onDeadlineChange?: (deadline: DeadlineFilter) => void;
  filtersActive?: boolean;
  onClearFilters?: () => void;
  onHelpClick?: () => void;
  onProfileClick?: () => void;
}

export const WorkspaceTopBar: React.FC<WorkspaceTopBarProps> = ({
  title,
  subtitle,
  searchQuery = '',
  onSearchChange,
  priority = 'all',
  onPriorityChange,
  deadline = 'all',
  onDeadlineChange,
  filtersActive = false,
  onClearFilters,
  onHelpClick,
  onProfileClick,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)]/95 backdrop-blur-xs border-b border-[var(--line)] px-4 sm:px-8 py-3.5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(194, 90, 61, 0.38), rgba(131, 184, 168, 0.3), transparent)',
        }}
      />
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-[var(--ink)] truncate">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--muted)] truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {onProfileClick && (
            <button
              type="button"
              onClick={onProfileClick}
              aria-label="Edit profile"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <UserRound className="w-4 h-4" />
            </button>
          )}
          {onHelpClick && (
            <button
              type="button"
              onClick={onHelpClick}
              aria-label="How ViDo works"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-medium text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <CircleHelp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Help</span>
            </button>
          )}

          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-[var(--faint)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--canvas)] border border-[var(--line)] rounded-lg text-[var(--ink)] placeholder-[var(--faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] transition-all"
              aria-label="Search tasks"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-label="Toggle filters"
            aria-expanded={filtersOpen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              filtersActive
                ? 'border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--canvas)]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {filtersActive && <Badge variant="accent" size="sm">On</Badge>}
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div className="mt-3 pt-3 border-t border-[var(--line)] flex flex-wrap items-center gap-2">
          <select
            value={priority}
            onChange={(event) => onPriorityChange?.(event.target.value as 'all' | TaskPriority)}
            aria-label="Filter by priority"
            className="px-2 py-1.5 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={deadline}
            onChange={(event) => onDeadlineChange?.(event.target.value as DeadlineFilter)}
            aria-label="Filter by deadline"
            className="px-2 py-1.5 text-xs bg-[var(--surface)] border border-[var(--line)] rounded-lg text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <option value="all">Any deadline</option>
            <option value="today">Today</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Past</option>
            <option value="completed">Completed</option>
          </select>
          {filtersActive && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] rounded-lg hover:bg-[var(--canvas)] cursor-pointer"
              aria-label="Clear filters"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      )}
    </header>
  );
};
