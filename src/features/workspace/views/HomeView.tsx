import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SampleTask, SAMPLE_TASKS } from '../../../data/sampleTasks';
import {
  getHomeDashboardTasks,
  HomeDashboardTasks,
} from '../../../data/taskFilters';
import { BENCHMARK_DATE_STR } from '../../../data/sampleTasks';
import { getTodayDateString, formatTopBarDate } from '../../../utils/dateUtils';
import { TaskRow } from '../TaskRow';
import { TasksBoardView, CustomListDefinition } from '../board';
import { PriorityColors } from '../../../utils/priorityColor';
import { Button } from '../../../components/ui';
import {
  Clock,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Sparkles,
  Filter,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { DEFAULT_CATEGORIES, type UserCategory } from '../../../data/categories';

export interface HomeViewProps {
  isPreview?: boolean;
  basePath?: string;
  user?: {
    name: string;
    email?: string;
  };
  tasks?: SampleTask[];
  categories?: UserCategory[];
  dashboard?: HomeDashboardTasks;
  initialTab?: 'dashboard' | 'tasks';
  initialStatus?: 'today' | 'needsAttention' | 'upcoming' | 'completed' | 'all';
  statusFilter?: StatusFilter;
  categoryFilter?: CategoryFilter;
  selectedCategories?: string[];
  priorityFilter?: PriorityFilter;
  priorityColors?: PriorityColors;
  onStatusFilterChange?: (status: StatusFilter) => void;
  onClearFilters?: () => void;
  onTaskClick: (task: SampleTask) => void;
  onToggleTask?: (task: SampleTask) => void;
  onNewTaskClick?: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<SampleTask>) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleStar?: (taskId: string) => void;
  onQuickAddTask?: (
    category: string,
    title: string,
    options?: {
      description?: string;
      dueDate?: string;
      dueTime?: string;
      deadline?: string;
      priority?: 'high' | 'medium' | 'low';
      starred?: boolean;
    }
  ) => void;
  customLists?: CustomListDefinition[];
  onCreateList?: (title: string) => void;
  onRenameList?: (id: string, newTitle: string) => void;
  onDeleteList?: (id: string) => void;
  onReorderLists?: (newOrder: CustomListDefinition[]) => void;
  onMoveTask?: (taskId: string, targetColId: string, targetTaskId?: string, position?: 'before' | 'after') => void;
  onDeleteCompletedTasks?: (columnId: string) => void;
  onCleanUpOldTasks?: (columnId: string) => void;
}

export type StatusFilter = 'all' | 'today' | 'needsAttention' | 'upcoming' | 'completed';
export type CategoryFilter = 'all' | 'personal' | 'home' | 'work' | string;
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export const HomeView: React.FC<HomeViewProps> = ({
  isPreview = true,
  basePath = '/preview',
  user,
  tasks,
  categories: _categories = DEFAULT_CATEGORIES,
  dashboard,
  initialTab = 'dashboard',
  initialStatus = 'all',
  statusFilter: propStatusFilter,
  categoryFilter: propCategoryFilter,
  selectedCategories: propSelectedCategories,
  priorityFilter: propPriorityFilter,
  priorityColors,
  onStatusFilterChange,
  onClearFilters: propOnClearFilters,
  onTaskClick,
  onToggleTask,
  onNewTaskClick,
  onUpdateTask,
  onDeleteTask,
  onToggleStar,
  onQuickAddTask,
  customLists,
  onCreateList,
  onRenameList,
  onDeleteList,
  onReorderLists,
  onMoveTask,
  onDeleteCompletedTasks,
  onCleanUpOldTasks,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationStateStatus = (location.state as { status?: StatusFilter } | null)?.status;
  const effectiveInitialStatus = navigationStateStatus ?? initialStatus;

  const allTasks = tasks ?? SAMPLE_TASKS;
  const todayStr = getTodayDateString();
  const currentDashboard =
    dashboard ??
    getHomeDashboardTasks(
      allTasks,
      isPreview ? BENCHMARK_DATE_STR : todayStr,
      undefined,
      todayStr
    );

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>(initialTab);
  const [dashboardCategory, setDashboardCategory] = useState<
    'today' | 'needsAttention' | 'upcoming' | 'completed'
  >('today');

  const [internalStatusFilter, setInternalStatusFilter] = useState<StatusFilter>(effectiveInitialStatus);
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<CategoryFilter>('all');
  const [internalSelectedCategories, setInternalSelectedCategories] = useState<string[]>([]);
  const [internalPriorityFilter, setInternalPriorityFilter] = useState<PriorityFilter>('all');

  const statusFilter = propStatusFilter ?? internalStatusFilter;
  const categoryFilter = propCategoryFilter ?? internalCategoryFilter;
  const activeCategories =
    propSelectedCategories !== undefined
      ? propSelectedCategories
      : internalSelectedCategories.length > 0
      ? internalSelectedCategories
      : categoryFilter !== 'all'
      ? [categoryFilter]
      : [];
  const priorityFilter = propPriorityFilter ?? internalPriorityFilter;

  const setStatus = (s: StatusFilter) => {
    if (onStatusFilterChange) onStatusFilterChange(s);
    else setInternalStatusFilter(s);
  };

  const handleClearFilters = () => {
    if (propOnClearFilters) {
      propOnClearFilters();
    } else {
      setInternalStatusFilter('all');
      setInternalCategoryFilter('all');
      setInternalSelectedCategories([]);
      setInternalPriorityFilter('all');
    }
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (propStatusFilter === undefined) {
      setInternalStatusFilter(effectiveInitialStatus);
    }
  }, [effectiveInitialStatus, propStatusFilter]);

  // Tasks Filtered for the "Tasks" Tab
  const displayedTasks = allTasks.filter((task) => {
    // 0. Archived tasks are never shown in workspace tasks
    if (task.isArchived) return false;

    // 1. Multi-select Category Filter
    if (activeCategories.length > 0 && !activeCategories.includes(task.category)) {
      return false;
    }

    // 2. Priority Filter
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }

    // 3. Status Filter (active tasks filtered by timeline; completed tasks populate Completed accordion)
    const todayStr = getTodayDateString();
    const referenceDate = isPreview ? BENCHMARK_DATE_STR : todayStr;
    if (statusFilter === 'today') {
      const isDueToday = task.dueDate === referenceDate || (isPreview && task.dueDate === todayStr);
      if (task.state === 'active' && !isDueToday) return false;
    } else if (statusFilter === 'needsAttention') {
      const isOverdue = task.dueDate < referenceDate && (!isPreview || task.dueDate !== todayStr);
      if (task.state === 'active' && !isOverdue) return false;
    } else if (statusFilter === 'upcoming') {
      const isUpcoming = task.dueDate > referenceDate && (!isPreview || task.dueDate !== todayStr);
      if (task.state === 'active' && !isUpcoming) return false;
    } else if (statusFilter === 'completed') {
      if (task.state !== 'completed') return false;
    }

    return true;
  });

  const activeTaskCount =
    statusFilter === 'completed'
      ? displayedTasks.length
      : displayedTasks.filter((t) => t.state === 'active').length;

  // Dashboard Tab Category Data
  const dashboardCategories = {
    today: {
      title: "Today's Agenda",
      subtitle: isPreview
        ? 'Tasks scheduled for today, 17 November 2026'
        : `Tasks scheduled for today, ${formatTopBarDate()}`,
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

  // 1. DASHBOARD VIEW (Full height with independent vertical scrolling)
  if (activeTab === 'dashboard') {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-6 p-6 sm:p-8 max-w-6xl mx-auto animate-in fade-in duration-150">
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
                    <span className="text-xs font-mono tracking-wider uppercase font-semibold text-gray-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
                      {isPreview ? 'Tuesday, 17 November 2026' : formatTopBarDate()}
                    </span>
                    {isPreview ? (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-400 text-amber-950 shadow-xs">
                        Sample Data
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
                  <p className="text-sm text-gray-300 mt-1.5 max-w-xl">
                    Here is your focused daily workload snapshot. Select an area below to inspect its tasks.
                  </p>
                </div>

                {onNewTaskClick && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onNewTaskClick}
                    className="self-start sm:self-auto gap-1.5 shadow-md text-sm py-2 px-3.5"
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
                  className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'today'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[var(--accent)]" /> Today
                    </span>
                    {dashboardCategory === 'today' && (
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    )}
                  </div>
                  <div className="text-3xl font-black tracking-tight text-white">
                    {currentDashboard.today.totalCount}
                  </div>
                  <span className="text-sm text-gray-300 mt-1 block">Due by end of day</span>
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
                  className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'needsAttention'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> Attention
                    </span>
                    {dashboardCategory === 'needsAttention' && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <div className="text-3xl font-black tracking-tight text-amber-300">
                    {currentDashboard.needsAttention.totalCount}
                  </div>
                  <span className="text-sm text-gray-300 mt-1 block">Overdue or urgent</span>
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
                  className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'upcoming'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" /> Upcoming
                    </span>
                    {dashboardCategory === 'upcoming' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    )}
                  </div>
                  <div className="text-3xl font-black tracking-tight text-white">
                    {currentDashboard.upcoming.totalCount}
                  </div>
                  <span className="text-sm text-gray-300 mt-1 block">Scheduled later</span>
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
                  className={`p-4 sm:p-5 rounded-xl cursor-pointer transition-all border ${
                    dashboardCategory === 'completed'
                      ? 'bg-white/15 border-white/40 ring-2 ring-white/30 shadow-md'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Delivered
                    </span>
                    {dashboardCategory === 'completed' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    )}
                  </div>
                  <div className="text-3xl font-black tracking-tight text-emerald-300">
                    {currentDashboard.recentlyCompleted.totalCount}
                  </div>
                  <span className="text-sm text-gray-300 mt-1 block">Finished this week</span>
                </div>
              </div>
            </div>
          </section>

          {/* Active Category Tasks Preview on Dashboard */}
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[var(--ink)] tracking-tight">
                  {activeDashboardSection.title}
                </h2>
                <span className="text-sm font-semibold px-3 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]">
                  {activeDashboardSection.items.length}
                </span>
              </div>

              {dashboardCategory !== 'completed' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus(dashboardCategory);
                    try {
                      navigate(`${basePath}/tasks`, { state: { status: dashboardCategory } });
                    } catch {
                      setActiveTab('tasks');
                    }
                  }}
                  className="text-sm font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  Open in Tasks view <ArrowRight className="w-4 h-4" />
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
                    isPreview={isPreview}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
                <p className="text-base font-medium text-[var(--muted)]">{activeDashboardSection.emptyText}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // 2. GOOGLE TASKS REDESIGNED VIEW (Strictly horizontal scroll, zero outer vertical scroll)
  return (
    <div className="w-full h-full flex-1 min-h-0 flex flex-col px-6 pt-4 pb-2 overflow-hidden animate-in fade-in duration-150">
      {/* Screen-reader heading for accessibility and test suites */}
      <h1 className="sr-only">Tasks</h1>

      {/* Task Container: TasksBoardView fills the remaining height with zero outer vertical scroll */}
      {activeTaskCount === 0 && displayedTasks.length === 0 && allTasks.length > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--surface)] border border-[var(--line)] rounded-2xl my-auto max-w-md mx-auto space-y-2">
          <div className="w-12 h-12 rounded-full bg-[var(--canvas)] flex items-center justify-center text-[var(--muted)] mb-2">
            <Filter className="w-5 h-5 text-[var(--muted)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--ink)]">No tasks match your filters</p>
          <p className="text-xs text-[var(--muted)]">
            Try adjusting your category, priority, or timeline filter from the top bar to view all responsibilities.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="mt-2"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col">
          <TasksBoardView
            tasks={displayedTasks}
            selectedCategories={activeCategories}
            priorityColors={priorityColors}
            customLists={customLists}
            onCreateList={onCreateList}
            onRenameList={onRenameList}
            onDeleteList={onDeleteList}
            onReorderLists={onReorderLists}
            onToggleTask={(task) => onToggleTask && onToggleTask(task)}
            onUpdateTask={onUpdateTask || (() => {})}
            onDeleteTask={onDeleteTask}
            onToggleStar={onToggleStar || (() => {})}
            onAddTask={onQuickAddTask || (() => {})}
            referenceDateStr={isPreview ? BENCHMARK_DATE_STR : todayStr}
            isPreview={isPreview}
            onMoveTask={onMoveTask}
            onDeleteCompletedTasks={onDeleteCompletedTasks}
            onCleanUpOldTasks={onCleanUpOldTasks}
          />
        </div>
      )}
    </div>
  );
};
