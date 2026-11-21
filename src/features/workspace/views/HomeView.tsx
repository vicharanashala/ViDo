import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SampleTask, SAMPLE_TASKS } from '../../../data/sampleTasks';
import { getHomeDashboardTasks, HomeDashboardTasks } from '../../../data/taskFilters';
import { getTodayDateString } from '../../../utils/dateUtils';
import { TaskRow } from '../TaskRow';
import { Button } from '../../../components/ui';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Sparkles,
  Filter,
  Plus,
  X,
  ArrowRight,
} from 'lucide-react';

export interface HomeViewProps {
  isPreview?: boolean;
  basePath?: string;
  user?: {
    name: string;
    email?: string;
  };
  tasks?: SampleTask[];
  dashboard?: HomeDashboardTasks;
  initialTab?: 'dashboard' | 'tasks';
  initialStatus?: 'today' | 'needsAttention' | 'upcoming' | 'completed' | 'all';
  onTaskClick: (task: SampleTask) => void;
  onToggleTask?: (task: SampleTask) => void;
  onNewTaskClick?: () => void;
}

export type StatusFilter = 'all' | 'today' | 'needsAttention' | 'upcoming' | 'completed';
export type CategoryFilter = 'all' | 'personal' | 'home' | 'work';
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export const HomeView: React.FC<HomeViewProps> = ({
  isPreview = true,
  basePath = '/preview',
  user,
  tasks,
  dashboard,
  initialTab = 'dashboard',
  initialStatus = 'today',
  onTaskClick,
  onToggleTask,
  onNewTaskClick,
}) => {
  const navigate = useNavigate();
  const allTasks = tasks ?? SAMPLE_TASKS;
  const currentDashboard = dashboard ?? getHomeDashboardTasks(allTasks);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>(initialTab);
  const [dashboardCategory, setDashboardCategory] = useState<
    'today' | 'needsAttention' | 'upcoming' | 'completed'
  >('today');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setStatusFilter(initialStatus);
  }, [initialStatus]);

  // Status human-readable labels
  const statusLabels: Record<StatusFilter, string> = {
    all: 'All Active Tasks',
    today: "Today's Agenda",
    needsAttention: 'Needs Attention',
    upcoming: 'Upcoming Schedule',
    completed: 'Recently Completed',
  };

  const categoryLabels: Record<CategoryFilter, string> = {
    all: 'All Categories',
    personal: 'Personal',
    home: 'Household / Living',
    work: 'Work / Professional',
  };

  // Tasks Filtered for the "Tasks" Tab (Strictly active tasks only - no completed tasks)
  const displayedTasks = allTasks.filter((task) => {
    // 0. Completed or archived tasks are never shown in the Tasks section
    if (task.state !== 'active' || task.isArchived) return false;

    // 1. Status Filter
    const todayStr = getTodayDateString();
    if (statusFilter === 'today') {
      if (task.dueDate !== '2026-11-17' && task.dueDate !== todayStr) return false;
    } else if (statusFilter === 'needsAttention') {
      if (task.dueDate >= '2026-11-17' && task.dueDate >= todayStr) return false;
    } else if (statusFilter === 'upcoming') {
      if (task.dueDate <= '2026-11-17' || task.dueDate <= todayStr) return false;
    }

    // 2. Category Filter
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }

    // 3. Priority Filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  // Dashboard Tab Category Data
  const dashboardCategories = {
    today: {
      title: "Today's Agenda",
      subtitle: 'Tasks scheduled for today, 17 November 2026',
      items: currentDashboard.today.items,
      count: currentDashboard.today.totalCount,
      emptyText: 'No tasks due today. You are fully caught up.',
    },
    needsAttention: {
      title: 'Needs Attention',
      subtitle: 'Overdue or high-priority responsibilities requiring review',
      items: currentDashboard.needsAttention.items,
      count: currentDashboard.needsAttention.totalCount,
      emptyText: 'Great work! No overdue tasks requiring attention.',
    },
    upcoming: {
      title: 'Upcoming Schedule',
      subtitle: 'Planned responsibilities scheduled beyond today',
      items: currentDashboard.upcoming.items,
      count: currentDashboard.upcoming.totalCount,
      emptyText: 'No upcoming tasks scheduled for the rest of the week.',
    },
    completed: {
      title: 'Recently Completed',
      subtitle: 'Delivered responsibilities finished over the last 7 days',
      items: currentDashboard.recentlyCompleted.items,
      count: currentDashboard.recentlyCompleted.totalCount,
      emptyText: 'No tasks completed in the last 7 days yet.',
    },
  };

  const activeDashboardSection = dashboardCategories[dashboardCategory];

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-6xl mx-auto">
      {/* ======================================================== */}
      {/* TAB 1: DASHBOARD VIEW                                   */}
      {/* ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Dark Navy Hero Overview Card */}
          <section
            aria-label="Overview Command Center"
            className="bg-[var(--dark)] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                      Tuesday, 17 November 2026
                    </span>
                    {isPreview ? (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs">
                        Sample Data
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Personal Workspace
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5 flex-wrap">
                    <span>
                      {isPreview ? 'Welcome back, Demo User' : `Welcome back, ${user?.name || 'Alex'}`}
                    </span>
                    {isPreview ? (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                        Preview Mode
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-gray-200 border border-white/20">
                        Active
                      </span>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
                    Here is your focused daily workload snapshot. Select an area below to inspect its tasks.
                  </p>
                </div>

                {onNewTaskClick && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onNewTaskClick}
                    className="self-start sm:self-auto gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> New Task
                  </Button>
                )}
              </div>

              {/* 4 Interactive Summary Tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
                {/* Tile 1: Today */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDashboardCategory('today')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && setDashboardCategory('today')
                  }
                  aria-label={`View Today tasks (${currentDashboard.today.totalCount})`}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'today'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[var(--accent)]" /> Today
                    </span>
                    {dashboardCategory === 'today' && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {currentDashboard.today.totalCount}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-0.5 block">Due by end of day</span>
                </div>

                {/* Tile 2: Needs Attention */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDashboardCategory('needsAttention')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && setDashboardCategory('needsAttention')
                  }
                  aria-label={`View Needs Attention tasks (${currentDashboard.needsAttention.totalCount})`}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'needsAttention'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> Attention
                    </span>
                    {dashboardCategory === 'needsAttention' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-amber-300">
                    {currentDashboard.needsAttention.totalCount}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-0.5 block">Overdue or urgent</span>
                </div>

                {/* Tile 3: Upcoming */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDashboardCategory('upcoming')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && setDashboardCategory('upcoming')
                  }
                  aria-label={`View Upcoming tasks (${currentDashboard.upcoming.totalCount})`}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'upcoming'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Upcoming
                    </span>
                    {dashboardCategory === 'upcoming' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {currentDashboard.upcoming.totalCount}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-0.5 block">Scheduled later</span>
                </div>

                {/* Tile 4: Recently Completed */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDashboardCategory('completed')}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && setDashboardCategory('completed')
                  }
                  aria-label={`View Completed tasks (${currentDashboard.recentlyCompleted.totalCount})`}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'completed'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Delivered
                    </span>
                    {dashboardCategory === 'completed' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="text-2xl font-black tracking-tight text-emerald-300">
                    {currentDashboard.recentlyCompleted.totalCount}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-0.5 block">Finished this week</span>
                </div>
              </div>
            </div>
          </section>

          {/* Active Category Tasks Preview on Dashboard */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[var(--ink)] tracking-tight">
                  {activeDashboardSection.title}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]">
                  {activeDashboardSection.items.length}
                </span>
              </div>

              {dashboardCategory !== 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter(dashboardCategory);
                    try {
                      navigate(`${basePath}/tasks`);
                    } catch {
                      setActiveTab('tasks');
                    }
                  }}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Open in Tasks view <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Task Rows Card Container */}
            {activeDashboardSection.items.length > 0 ? (
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl divide-y divide-[var(--line)] shadow-xs overflow-hidden">
                {activeDashboardSection.items.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    onToggle={onToggleTask}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
                <p className="text-xs text-[var(--muted)]">{activeDashboardSection.emptyText}</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TASKS VIEW WITH FILTER BUILDER                    */}
      {/* ======================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">Tasks</h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
                {displayedTasks.length} {displayedTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {onNewTaskClick && (
              <Button
                variant="primary"
                size="sm"
                onClick={onNewTaskClick}
                className="gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Task
              </Button>
            )}
          </div>

          {/* Interactive Filter Bar with "+ Add Filter" Controls */}
          <section aria-label="Task Filters" className="space-y-4">
            <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Active Filters and + Add Filter Trigger */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5 mr-1">
                    <Filter className="w-3.5 h-3.5 text-[var(--accent)]" /> Filters:
                  </span>

                  {/* Status Filter Pill */}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold border border-[var(--accent)]/30 shadow-2xs">
                      <span>Status: {statusLabels[statusFilter]}</span>
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="hover:opacity-70 cursor-pointer p-0.5 rounded-full"
                        aria-label="Remove status filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Category Filter Pill */}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-700 text-xs font-semibold border border-indigo-500/30 shadow-2xs">
                      <span>Category: {categoryLabels[categoryFilter]}</span>
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className="hover:opacity-70 cursor-pointer p-0.5 rounded-full"
                        aria-label="Remove category filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* Priority Filter Pill */}
                  {priorityFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-800 text-xs font-semibold border border-amber-500/30 shadow-2xs">
                      <span>Priority: {priorityFilter.toUpperCase()}</span>
                      <button
                        onClick={() => setPriorityFilter('all')}
                        className="hover:opacity-70 cursor-pointer p-0.5 rounded-full"
                        aria-label="Remove priority filter"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {/* + Add Filter Popover Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAddFilterOpen(!isAddFilterOpen)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--accent)] bg-[var(--canvas)] text-xs font-semibold text-[var(--ink)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-2xs"
                      aria-label="Add filter"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Filter</span>
                    </button>

                    {isAddFilterOpen && (
                      <div className="absolute left-0 top-full mt-2 w-56 p-2 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl z-30 space-y-2 animate-in fade-in duration-100">
                        {/* Category Options */}
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--faint)] px-2 block mb-1">
                            Category
                          </span>
                          <div className="space-y-0.5">
                            <button
                              onClick={() => {
                                setCategoryFilter('personal');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-[var(--ink)] cursor-pointer"
                            >
                              Personal
                            </button>
                            <button
                              onClick={() => {
                                setCategoryFilter('home');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-[var(--ink)] cursor-pointer"
                            >
                              Household / Living
                            </button>
                            <button
                              onClick={() => {
                                setCategoryFilter('work');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-[var(--ink)] cursor-pointer"
                            >
                              Work / Professional
                            </button>
                          </div>
                        </div>

                        {/* Priority Options */}
                        <div className="pt-1 border-t border-[var(--line)]">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--faint)] px-2 block mb-1">
                            Priority
                          </span>
                          <div className="space-y-0.5">
                            <button
                              onClick={() => {
                                setPriorityFilter('high');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-red-600 font-medium cursor-pointer"
                            >
                              High Priority
                            </button>
                            <button
                              onClick={() => {
                                setPriorityFilter('medium');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-amber-600 font-medium cursor-pointer"
                            >
                              Medium Priority
                            </button>
                            <button
                              onClick={() => {
                                setPriorityFilter('low');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-blue-600 font-medium cursor-pointer"
                            >
                              Low Priority
                            </button>
                          </div>
                        </div>

                        {/* Status Options */}
                        <div className="pt-1 border-t border-[var(--line)]">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--faint)] px-2 block mb-1">
                            Timeline / Status
                          </span>
                          <div className="space-y-0.5">
                            <button
                              onClick={() => {
                                setStatusFilter('today');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-[var(--ink)] cursor-pointer"
                            >
                              Due Today
                            </button>
                            <button
                              onClick={() => {
                                setStatusFilter('needsAttention');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-[var(--ink)] cursor-pointer"
                            >
                              Needs Attention (Overdue)
                            </button>
                            <button
                              onClick={() => {
                                setStatusFilter('upcoming');
                                setIsAddFilterOpen(false);
                              }}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-[var(--canvas)] text-[var(--ink)] cursor-pointer"
                            >
                              Upcoming Schedule
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clear All Filters */}
                  {(statusFilter !== 'all' ||
                    categoryFilter !== 'all' ||
                    priorityFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setStatusFilter('all');
                        setCategoryFilter('all');
                        setPriorityFilter('all');
                      }}
                      className="text-xs text-[var(--muted)] hover:text-[var(--ink)] underline cursor-pointer ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Right: Task Count */}
                <div className="text-xs text-[var(--muted)] font-medium">
                  Showing <strong className="text-[var(--ink)]">{displayedTasks.length}</strong> tasks
                </div>
              </div>
            </div>

            {/* Task Rows Card Container */}
            {displayedTasks.length > 0 ? (
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl divide-y divide-[var(--line)] shadow-xs overflow-hidden">
                {displayedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                    onToggle={onToggleTask}
                  />
                ))}
              </div>
            ) : allTasks.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)] space-y-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[var(--ink)]">Your workspace is empty</p>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                  Get started by creating your first task to track your personal, household, or work responsibilities.
                </p>
                {onNewTaskClick && (
                  <Button variant="primary" size="sm" onClick={onNewTaskClick} className="mt-2">
                    <Plus className="w-4 h-4 mr-1.5" /> Create First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)] space-y-2">
                <p className="text-sm font-semibold text-[var(--ink)]">No tasks match your filters</p>
                <p className="text-xs text-[var(--muted)]">
                  Try adjusting your active filters or clear them to view all responsibilities.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="mt-2"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
