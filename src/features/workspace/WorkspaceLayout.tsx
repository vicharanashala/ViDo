import React, { useEffect, useState, useMemo } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Link,
  Navigate,
  useParams,
} from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import {
  BENCHMARK_DATE_STR,
  BENCHMARK_DATE_TIME,
  SAMPLE_TASKS,
  type SampleTask,
} from '../../data/sampleTasks';
import { getFilteredTasks, buildHomeDashboard } from '../../data/taskFilters';
import { getTodayDateString } from '../../utils/dateUtils';
import { todayISO } from '../../data/calendar';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import {
  WorkspaceTopBar,
  StatusFilter,
  PriorityFilter,
} from './WorkspaceTopBar';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { SettingsModal } from './SettingsModal';
import { NotFoundView } from './views/NotFoundView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { useAuth } from '../auth';
import { TeamSpaceView } from '../teams/TeamSpaceView';
import {
  PriorityColors,
  DEFAULT_PRIORITY_COLORS,
} from '../../utils/priorityColor';
import { CreateTeamModal } from '../teams/CreateTeamModal';
import { getTeamRepository } from '../teams/teamRepository';
import { Team } from '../teams/types';
import { useCalendar } from './useCalendar';
import { usePlanningTargets } from './usePlanningTargets';
import { useCategories } from './useCategories';
import {
  fetchUserTasks,
  createUserTask,
  updateUserTask,
} from '../../lib/taskStore';

export interface WorkspaceLayoutProps {
  isPreview?: boolean;
}

const TeamSpaceRouteWrapper: React.FC<{
  currentUser: { id: string; name: string; email: string };
  basePath: string;
}> = ({ currentUser, basePath }) => {
  const { teamId } = useParams<{ teamId: string }>();
  if (!teamId) return null;
  return <TeamSpaceView teamId={teamId} currentUser={currentUser} basePath={basePath} />;
};

export const isKnownWorkspacePath = (pathname: string, basePath: string): boolean => {
  // Normalize pathname and basePath: collapse consecutive slashes and strip trailing slashes (except root)
  const normalized = pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  const normalizedBase = basePath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';

  if (normalized === normalizedBase) return true;
  if (!normalized.startsWith(`${normalizedBase}/`)) return false;

  const subPath = normalized.slice(normalizedBase.length + 1);

  const exactKnownSubPaths = new Set([
    'dashboard',
    'tasks',
    'today',
    'upcoming',
    'needs-attention',
    'completed',
    'archived',
    'calendar',
    'analytics',
    'settings',
  ]);

  if (exactKnownSubPaths.has(subPath)) return true;

  // team/:teamId only - exactly one segment after team/, with no further sub-paths
  if (subPath.startsWith('team/')) {
    const teamParts = subPath.split('/');
    return teamParts.length === 2 && Boolean(teamParts[1]);
  }

  return false;
};

export const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
  isPreview: explicitIsPreview,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, loading, signOut, authMode } = useAuth();

  const isPreview =
    explicitIsPreview !== undefined
      ? explicitIsPreview
      : location.pathname.startsWith('/preview');
  const isLive = !isPreview;
  const basePath = isPreview ? '/preview' : '/workspace';
  const referenceDate = isPreview ? BENCHMARK_DATE_STR : todayISO();

  const user = isPreview
    ? { id: 'demo-user-uid', name: 'Demo User', email: 'demo@vido.app' }
    : {
        id: authUser?.uid || 'user-1',
        name: authUser?.displayName || 'Authenticated User',
        email: authUser?.email || 'user@vido.app',
      };

  // Team workspace state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const loadTeams = async () => {
    try {
      const repo = getTeamRepository();
      const userTeams = await repo.getTeams(user.id);
      setTeams(userTeams);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isPreview && loading) return;
    void loadTeams();
    const handleFocus = () => {
      void loadTeams();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user.id, user.email, isPreview, loading]);

  // Calendar events, planning targets, and custom categories live in the NestJS
  // backend database for signed-in users.
  const calendar = useCalendar(authUser?.uid, isLive ? 'live' : 'demo');
  const planningTargets = usePlanningTargets(authUser?.uid, isLive ? 'live' : 'demo');
  const categoriesState = useCategories(authUser?.uid, isLive ? 'live' : 'demo');

  // Task state: for preview, use SAMPLE_TASKS. For authenticated users, fetch from NestJS backend API.
  const [tasks, setTasks] = useState<SampleTask[]>(() => {
    if (isPreview) {
      return SAMPLE_TASKS;
    }
    return [];
  });

  // Re-sync tasks from NestJS backend when active user changes
  useEffect(() => {
    if (isPreview) {
      setTasks(SAMPLE_TASKS);
      return;
    }
    if (!authUser?.uid) {
      setTasks([]);
      return;
    }

    let isCurrent = true;
    fetchUserTasks(authUser.uid)
      .then((serverTasks) => {
        if (isCurrent) {
          setTasks(serverTasks);
        }
      })
      .catch(() => {
        // Handled via memory fallback
      });

    return () => {
      isCurrent = false;
    };
  }, [authUser?.uid, isPreview]);

  const [selectedTask, setSelectedTask] = useState<SampleTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isSettingsRoute = location.pathname.endsWith('/settings');
  const showSettingsModal = isSettingsOpen || isSettingsRoute;

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
    if (isSettingsRoute) {
      navigate(basePath, { replace: true });
    }
  };

  const todayStr = getTodayDateString();
  const benchmarkDateStr = isPreview ? BENCHMARK_DATE_STR : todayStr;
  const benchmarkDateTime = isPreview ? BENCHMARK_DATE_TIME : new Date().toISOString();

  const views = useMemo(
    () => getFilteredTasks(tasks, benchmarkDateStr, benchmarkDateTime, todayStr),
    [tasks, benchmarkDateStr, benchmarkDateTime, todayStr]
  );

  const dashboard = useMemo(
    () => buildHomeDashboard(views),
    [views]
  );
  const syncError = calendar.error ?? planningTargets.error;

  // Authentication guards: evaluated AFTER all hooks have executed unconditionally
  if (!isPreview && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--canvas)] text-[var(--muted)] text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    );
  }

  // If the path is not a recognized workspace route, render the standalone not-found view directly
  // without the sidebar or top bar chrome.
  if (!isKnownWorkspacePath(location.pathname, basePath)) {
    return <NotFoundView isPreview={isPreview} />;
  }

  if (!isPreview && !authUser) {
    return <Navigate to="/" replace />;
  }

  const handleTaskClick = (task: SampleTask) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCreateTask = (newTask: SampleTask) => {
    setTasks((prev) => [newTask, ...prev]);
    if (!isPreview && authUser?.uid) {
      void createUserTask(newTask, authUser.uid).catch(() => undefined);
    }
    setToastMessage(`Task "${newTask.title}" added to your workspace.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTask = (taskToToggle: SampleTask) => {
    const isNowCompleted = taskToToggle.state !== 'completed';
    const nowIso = new Date().toISOString();
    const nextCheckpoints = [
      ...(taskToToggle.checkpoints || []),
      {
        id: `cp-${Date.now()}`,
        timestamp: nowIso,
        note: isNowCompleted
          ? 'Task marked as completed.'
          : 'Task reopened in workspace.',
      },
    ];

    const updates: Partial<SampleTask> = {
      state: isNowCompleted ? 'completed' : 'active',
      completedAt: isNowCompleted ? nowIso : undefined,
      checkpoints: nextCheckpoints,
    };

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskToToggle.id
          ? {
              ...t,
              ...updates,
            }
          : t
      )
    );
    if (selectedTask && selectedTask.id === taskToToggle.id) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              ...updates,
            }
          : null
      );
    }
    if (!isPreview && authUser?.uid) {
      void updateUserTask(taskToToggle.id, updates, authUser.uid).catch(() => undefined);
    }
    setToastMessage(
      isNowCompleted
        ? `Task "${taskToToggle.title}" marked as completed!`
        : `Task "${taskToToggle.title}" reopened.`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<SampleTask>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleToggleStar = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, starred: !t.starred } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setToastMessage('Task deleted.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const DEFAULT_CUSTOM_LISTS = [
    { id: 'personal', title: 'Personal & Routine' },
    { id: 'home', title: 'Household & Living' },
    { id: 'work', title: 'Work & Professional' },
  ];

  const [customLists, setCustomLists] = useState(() => {
    try {
      const key = authUser ? `vido_custom_lists_${authUser.uid}` : 'vido_custom_lists_demo';
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CUSTOM_LISTS;
  });

  useEffect(() => {
    try {
      const key = authUser ? `vido_custom_lists_${authUser.uid}` : 'vido_custom_lists_demo';
      localStorage.setItem(key, JSON.stringify(customLists));
    } catch {}
  }, [customLists, authUser?.uid]);

  const handleCreateList = (title: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `list-${Date.now()}`;
    const id = customLists.some((l) => l.id === slug) ? `${slug}-${Date.now()}` : slug;
    setCustomLists((prev) => [...prev, { id, title }]);
    void categoriesState.addCategory({ name: title });
    setToastMessage(`List "${title}" created.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRenameList = (listId: string, newTitle: string) => {
    setCustomLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, title: newTitle } : l))
    );
  };

  const handleDeleteList = (listId: string) => {
    setCustomLists((prev) => prev.filter((l) => l.id !== listId));
    void categoriesState.deleteCategory(listId);
    const fallbackListId = customLists.find((l) => l.id !== listId)?.id || 'personal';
    setTasks((prev) =>
      prev.map((t) => (t.category === listId ? { ...t, category: fallbackListId as any } : t))
    );
    setToastMessage('List deleted.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleAddCategory = async (params: { name: string; color?: string }) => {
    const created = await categoriesState.addCategory(params);
    setCustomLists((prev) =>
      prev.some((l) => l.id === created.id) ? prev : [...prev, { id: created.id, title: created.name }]
    );
    return created;
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await categoriesState.deleteCategory(categoryId);
    setCustomLists((prev) => prev.filter((l) => l.id !== categoryId));
  };

  const handleReorderLists = (newOrder: { id: string; title: string }[]) => {
    setCustomLists(newOrder);
  };

  const handleQuickAddTask = (
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
  ) => {
    const newTask: SampleTask = {
      id: `task-${Date.now()}`,
      title: title.trim(),
      description: options?.description?.trim() || undefined,
      dueDate: options?.dueDate || '',
      dueTime: options?.dueTime || undefined,
      deadline: options?.deadline || undefined,
      priority: options?.priority || 'low',
      starred: Boolean(options?.starred),
      state: 'active',
      category: (category as any) || 'personal',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setToastMessage(`Task "${title}" added to ${category}.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleMoveTask = (
    taskId: string,
    targetCategory: string,
    targetTaskId?: string,
    position?: 'before' | 'after'
  ) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      const taskToMove = prev[taskIndex];
      const updatedTask: SampleTask = {
        ...taskToMove,
        category: targetCategory as any,
      };

      const withoutTask = prev.filter((t) => t.id !== taskId);

      if (targetTaskId && targetTaskId !== taskId) {
        const targetIndex = withoutTask.findIndex((t) => t.id === targetTaskId);
        if (targetIndex !== -1) {
          const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex;
          const next = [...withoutTask];
          next.splice(insertIndex, 0, updatedTask);
          return next;
        }
      }

      const lastIndexInTarget = withoutTask.reduce(
        (last, t, idx) => (t.category === targetCategory ? idx : last),
        -1
      );

      if (lastIndexInTarget !== -1) {
        const next = [...withoutTask];
        next.splice(lastIndexInTarget + 1, 0, updatedTask);
        return next;
      }

      return [...withoutTask, updatedTask];
    });
  };

  const handleDeleteCompletedTasks = (columnId: string) => {
    setTasks((prev) =>
      prev.filter((t) => !(t.category === columnId && t.state === 'completed'))
    );
    setToastMessage('Completed tasks deleted.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCleanUpOldTasks = (columnId: string) => {
    setTasks((prev) =>
      prev.filter((t) => {
        if (t.category !== columnId) return true;
        if (t.state === 'completed') return true;
        const isOld = Boolean(
          (t.dueDate && t.dueDate < referenceDate) ||
          (!t.dueDate && t.createdAt && t.createdAt.slice(0, 10) < referenceDate)
        );
        return !isOld;
      })
    );
    setToastMessage('Old uncompleted tasks cleaned up.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSignOut = () => {
    if (!isPreview) {
      void signOut();
    }
    navigate('/');
  };

  // Filter state for WorkspaceTopBar and HomeView
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Custom priority colors state
  const [priorityColors, setPriorityColors] = useState<PriorityColors>(() => {
    try {
      const key = authUser ? `vido_priority_colors_${authUser.uid}` : 'vido_priority_colors_demo';
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PRIORITY_COLORS;
  });

  useEffect(() => {
    try {
      const key = authUser ? `vido_priority_colors_${authUser.uid}` : 'vido_priority_colors_demo';
      localStorage.setItem(key, JSON.stringify(priorityColors));
    } catch {}
  }, [priorityColors, authUser?.uid]);

  const handleToggleStatusFilter = (status: StatusFilter) => {
    setStatusFilter((prev) => (prev === status ? 'all' : status));
  };

  const handleToggleCategoryFilter = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((id) => id !== cat) : [...prev, cat]
    );
  };

  const handleTogglePriorityFilter = (pri: PriorityFilter) => {
    setPriorityFilter((prev) => (prev === pri ? 'all' : pri));
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSelectedCategories([]);
    setPriorityFilter('all');
  };

  const isTasksRoute = location.pathname.endsWith('/tasks') || location.pathname.endsWith('/settings');

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--canvas)] text-[var(--ink)] antialiased">
      {/* 1. Global Persistent Demo Preview Notice Bar - ONLY in Preview mode */}
      {isPreview && (
        <aside
          aria-label="Demo environment announcement"
          className="sticky top-0 z-50 bg-[var(--dark)] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-bold text-sm shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Landing Page</span>
            </Link>

            <span className="h-4 w-px bg-white/20 hidden sm:inline-block" />

            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 font-mono shadow-xs shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-pulse" />
                DEMO PREVIEW
              </span>
              <p className="text-sm text-gray-200 truncate hidden md:block">
                <span className="font-semibold text-white">Interactive Demo:</span> You are exploring
                ViDo with mock data. Real account sync is disabled.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-gray-300 hidden sm:block shrink-0">
            Preview Mode
          </div>
        </aside>
      )}

      {syncError && (
        <div
          role="alert"
          className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-2.5 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{syncError}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex flex-1 min-h-0">
        {/* Persistent Left Desktop Sidebar */}
        <WorkspaceSidebar
          isPreview={isPreview}
          basePath={basePath}
          user={user}
          counts={{
            total: tasks.filter((t) => t.state === 'active').length,
            today: views.today.length,
            needsAttention: views.needsAttention.length,
            upcoming: views.upcoming.length,
            completed: views.completed.length,
            archived: views.archived.length,
          }}
          teams={teams}
          onNewTaskClick={() => setIsCreateOpen(true)}
          onCreateTeamClick={() => setIsCreateTeamOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <WorkspaceTopBar
            isPreview={isPreview}
            basePath={basePath}
            isSettings={showSettingsModal}
            user={user}
            authMode={authMode}
            onSignOut={handleSignOut}
            statusFilter={statusFilter}
            categoryFilter={selectedCategories[0] || 'all'}
            selectedCategories={selectedCategories}
            priorityFilter={priorityFilter}
            onToggleStatusFilter={handleToggleStatusFilter}
            onToggleCategoryFilter={handleToggleCategoryFilter}
            onTogglePriorityFilter={handleTogglePriorityFilter}
            onClearFilters={handleClearFilters}
            customLists={customLists}
            onRespondInvitation={async (invitationId, accept) => {
              const repo = getTeamRepository();
              await repo.respondToInvitation(invitationId, accept, user);
              if (accept) {
                await loadTeams();
              }
            }}
          />

          <main className={`flex-1 min-h-0 flex flex-col ${isTasksRoute ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            <Routes>
              <Route
                index
                element={
                  <HomeView
                    isPreview={isPreview}
                    basePath={basePath}
                    user={user}
                    tasks={tasks}
                    categories={categoriesState.categories}
                    dashboard={dashboard}
                    initialTab="dashboard"
                    onTaskClick={handleTaskClick}
                    onToggleTask={handleToggleTask}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                  />
                }
              />
              <Route
                path="dashboard"
                element={<Navigate to={basePath} replace />}
              />
              <Route
                path="tasks"
                element={
                  <HomeView
                    isPreview={isPreview}
                    basePath={basePath}
                    user={user}
                    tasks={tasks}
                    categories={categoriesState.categories}
                    dashboard={dashboard}
                    initialTab="tasks"
                    initialStatus="all"
                    statusFilter={statusFilter}
                    selectedCategories={selectedCategories}
                    priorityFilter={priorityFilter}
                    priorityColors={priorityColors}
                    onStatusFilterChange={setStatusFilter}
                    onClearFilters={handleClearFilters}
                    onTaskClick={handleTaskClick}
                    onToggleTask={handleToggleTask}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onToggleStar={handleToggleStar}
                    onQuickAddTask={handleQuickAddTask}
                    customLists={customLists}
                    onCreateList={handleCreateList}
                    onRenameList={handleRenameList}
                    onDeleteList={handleDeleteList}
                    onReorderLists={handleReorderLists}
                    onMoveTask={handleMoveTask}
                    onDeleteCompletedTasks={handleDeleteCompletedTasks}
                    onCleanUpOldTasks={handleCleanUpOldTasks}
                  />
                }
              />
              <Route
                path="team/:teamId"
                element={<TeamSpaceRouteWrapper currentUser={user} basePath={basePath} />}
              />
              <Route
                path="today"
                element={
                  <ListView
                    title="Today's Work"
                    description={
                      isPreview
                        ? 'Tasks targeted for completion by end of day 17 November 2026.'
                        : 'Tasks targeted for completion by end of day today.'
                    }
                    tasks={views.today}
                    categories={categoriesState.categories}
                    onTaskClick={handleTaskClick}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                    isPreview={isPreview}
                  />
                }
              />
              <Route
                path="upcoming"
                element={
                  <ListView
                    title="Upcoming Schedule"
                    description="Planned tasks due beyond today's horizon."
                    tasks={views.upcoming}
                    categories={categoriesState.categories}
                    onTaskClick={handleTaskClick}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                    isPreview={isPreview}
                  />
                }
              />
              <Route
                path="needs-attention"
                element={
                  <ListView
                    title="Needs Attention"
                    description="Tasks past their target deadline or requiring urgent intervention."
                    tasks={views.needsAttention}
                    categories={categoriesState.categories}
                    onTaskClick={handleTaskClick}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                    isPreview={isPreview}
                  />
                }
              />
              <Route
                path="completed"
                element={
                  <ListView
                    title="Completed Tasks"
                    description="Full historical record of delivered responsibilities."
                    tasks={views.completed}
                    categories={categoriesState.categories}
                    onTaskClick={handleTaskClick}
                    isPreview={isPreview}
                  />
                }
              />
              <Route
                path="archived"
                element={
                  <ListView
                    title="Archived Tasks"
                    description="Shelved tasks preserved with their complete checkpoint history."
                    tasks={views.archived}
                    categories={categoriesState.categories}
                    onTaskClick={handleTaskClick}
                    isPreview={isPreview}
                  />
                }
              />
              <Route
                path="calendar"
                element={
                  <CalendarView
                    tasks={tasks}
                    events={calendar.events}
                    onCreateEvent={(event) => {
                      void calendar.addEvent(event).catch(() => undefined);
                    }}
                    onDeleteEvent={(eventId) => {
                      void calendar.deleteEvent(eventId).catch(() => undefined);
                    }}
                    onCreateTask={handleCreateTask}
                    onTaskClick={handleTaskClick}
                    referenceDate={referenceDate}
                    mode={isLive ? 'live' : 'demo'}
                  />
                }
              />
              <Route
                path="analytics"
                element={
                  <AnalyticsView
                    tasks={tasks}
                    targets={planningTargets.targets}
                    onTargetsChange={(next) => {
                      void planningTargets.setTargets(next).catch(() => undefined);
                    }}
                    referenceDate={referenceDate}
                    mode={isLive ? 'live' : 'demo'}
                  />
                }
              />
              <Route
                path="settings"
                element={
                  <SettingsView
                    priorityColors={priorityColors}
                    onUpdatePriorityColors={setPriorityColors}
                    user={user}
                    isPreview={isPreview}
                    categories={categoriesState.categories}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={handleDeleteCategory}
                    customLists={customLists}
                    onCreateList={handleCreateList}
                    onRenameList={handleRenameList}
                    onDeleteList={handleDeleteList}
                  />
                }
              />
              <Route path="*" element={<Navigate to={basePath} replace />} />
            </Routes>
          </main>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={handleCloseSettings}
        isPreview={isPreview}
        user={user}
        categories={categoriesState.categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSignOut={handleSignOut}
        priorityColors={priorityColors}
        onUpdatePriorityColors={setPriorityColors}
        customLists={customLists}
        onCreateList={handleCreateList}
        onRenameList={handleRenameList}
        onDeleteList={handleDeleteList}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        onToggleTask={handleToggleTask}
        isPreview={isPreview}
      />

      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={handleCreateTask}
        categories={categoriesState.categories}
        onAddCategory={handleAddCategory}
      />

      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        currentUser={user}
        onTeamCreated={(newTeam) => {
          setTeams((prev) => [...prev, newTeam]);
          navigate(`${basePath}/team/${newTeam.id}`);
        }}
      />

      {/* Floating Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[var(--dark)] text-white px-4 py-3 rounded-xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <p className="text-xs font-medium text-gray-100">{toastMessage}</p>
          <button
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white text-xs ml-2 cursor-pointer"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
