import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SAMPLE_TASKS, SampleTask, BENCHMARK_DATE_STR } from '../../data/sampleTasks';
import { getFilteredTasks, getHomeDashboardTasks } from '../../data/taskFilters';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { useAuth } from '../auth';
import { TeamSpaceView } from '../teams/TeamSpaceView';
import { CreateTeamModal } from '../teams/CreateTeamModal';
import { getTeamRepository } from '../teams/teamRepository';
import { Team } from '../teams/types';

/**
 * The demo preview is anchored to a fixed day (see AGENTS.md), so its pickers
 * must treat that moment as "now" to agree with the Today / Upcoming views.
 */
const PREVIEW_NOW = (() => {
  const [y, m, d] = BENCHMARK_DATE_STR.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0);
})();

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

  const basePath = isPreview ? '/preview' : '/workspace';

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
    } catch (e) {
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

  // Task state: for preview, use SAMPLE_TASKS. For authenticated users, scope to user ID.
  const userStorageKey = authUser ? `vido_tasks_${authUser.uid}` : 'vido_live_workspace_tasks';

  const [tasks, setTasks] = useState<SampleTask[]>(() => {
    if (isPreview) {
      return SAMPLE_TASKS;
    }
    try {
      const saved = localStorage.getItem(userStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      // Fallback
    }
    // New users start with a clean, empty personal workspace
    return [];
  });

  // Re-sync tasks if active user changes
  useEffect(() => {
    if (!isPreview && authUser) {
      try {
        const saved = localStorage.getItem(`vido_tasks_${authUser.uid}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTasks(parsed);
            return;
          }
        }
      } catch (e) {
        // Ignore
      }
      setTasks([]);
    }
  }, [authUser?.uid, isPreview]);

  useEffect(() => {
    if (!isPreview && authUser) {
      try {
        localStorage.setItem(`vido_tasks_${authUser.uid}`, JSON.stringify(tasks));
      } catch (e) {
        // Ignore quota errors
      }
    }
  }, [tasks, isPreview, authUser?.uid]);

  const [selectedTask, setSelectedTask] = useState<SampleTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const views = getFilteredTasks(tasks);
  const dashboard = getHomeDashboardTasks(tasks);

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

  if (!isPreview && !authUser) {
    return <Navigate to="/" replace />;
  }

  const handleTaskClick = (task: SampleTask) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleCreateTask = (newTask: SampleTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setToastMessage(`Task "${newTask.title}" added to your workspace.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTask = (taskToToggle: SampleTask) => {
    const isNowCompleted = taskToToggle.state !== 'completed';
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskToToggle.id
          ? {
              ...t,
              state: isNowCompleted ? 'completed' : 'active',
              completedAt: isNowCompleted ? '2026-11-17T12:00:00Z' : undefined,
              checkpoints: [
                ...(t.checkpoints || []),
                {
                  id: `cp-${Date.now()}`,
                  timestamp: '2026-11-17T12:00:00Z',
                  note: isNowCompleted
                    ? 'Task marked as completed.'
                    : 'Task reopened in workspace.',
                },
              ],
            }
          : t
      )
    );
    if (selectedTask && selectedTask.id === taskToToggle.id) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              state: isNowCompleted ? 'completed' : 'active',
              completedAt: isNowCompleted ? '2026-11-17T12:00:00Z' : undefined,
            }
          : null
      );
    }
    setToastMessage(
      isNowCompleted
        ? `Task "${taskToToggle.title}" marked as completed!`
        : `Task "${taskToToggle.title}" reopened.`
    );
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSignOut = () => {
    if (!isPreview) {
      void signOut();
    }
    navigate('/');
  };

  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.endsWith('/tasks')) {
      return { title: 'Tasks', subtitle: 'Manage, filter, and track all your active responsibilities' };
    }
    if (path.endsWith('/today')) {
      return { title: 'Today', subtitle: 'Responsibilities due on 17 November 2026' };
    }
    if (path.endsWith('/upcoming')) {
      return { title: 'Upcoming', subtitle: 'Scheduled responsibilities for future dates' };
    }
    if (path.endsWith('/needs-attention')) {
      return { title: 'Needs Attention', subtitle: 'Overdue or urgent items requiring action' };
    }
    if (path.endsWith('/completed')) {
      return { title: 'Completed', subtitle: 'All finished work with completion timings' };
    }
    if (path.endsWith('/archived')) {
      return { title: 'Archived', subtitle: 'Shelved and preserved task history' };
    }
    if (path.includes('/team/')) {
      const activeTeamId = path.split('/team/')[1]?.split('/')[0];
      const currentTeam = teams.find((t) => t.id === activeTeamId);
      return {
        title: currentTeam?.name || 'Team Workspace',
        subtitle: currentTeam?.description || 'Collaborative team deliverables and phased milestones',
      };
    }
    return {
      title: 'Dashboard',
      subtitle: isPreview
        ? 'Calm snapshot of today, urgent work, and upcoming items'
        : `Personal overview for ${user.name}`,
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex flex-col min-h-screen bg-[var(--canvas)] text-[var(--ink)] antialiased">
      {/* 1. Global Persistent Demo Preview Notice Bar - ONLY in Preview mode */}
      {isPreview && (
        <aside
          aria-label="Demo environment announcement"
          className="sticky top-0 z-50 bg-[var(--dark)] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 border-b border-white/10 shadow-sm"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Landing Page</span>
            </Link>

            <span className="h-4 w-px bg-white/20 hidden sm:inline-block" />

            <div className="flex items-center gap-2 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 font-mono shadow-xs shrink-0 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-pulse" />
                DEMO PREVIEW
              </span>
              <p className="text-xs text-gray-200 truncate hidden md:block">
                <span className="font-semibold text-white">Interactive Demo:</span> You are exploring ViDo with mock data. Real account sync is disabled.
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-gray-400 hidden sm:block shrink-0">
            Preview Mode
          </div>
        </aside>
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
          onSignOut={handleSignOut}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <WorkspaceTopBar
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            isPreview={isPreview}
            user={user}
            authMode={authMode}
            onSignOut={handleSignOut}
            onRespondInvitation={async (invitationId, accept) => {
              const repo = getTeamRepository();
              await repo.respondToInvitation(invitationId, accept, user);
              if (accept) {
                await loadTeams();
              }
            }}
          />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route
                index
                element={
                  <HomeView
                    isPreview={isPreview}
                    basePath={basePath}
                    user={user}
                    tasks={tasks}
                    dashboard={dashboard}
                    now={isPreview ? PREVIEW_NOW : undefined}
                    initialTab="dashboard"
                    onTaskClick={handleTaskClick}
                    onToggleTask={handleToggleTask}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                  />
                }
              />
              <Route
                path="tasks"
                element={
                  <HomeView
                    isPreview={isPreview}
                    basePath={basePath}
                    user={user}
                    tasks={tasks}
                    dashboard={dashboard}
                    now={isPreview ? PREVIEW_NOW : undefined}
                    initialTab="tasks"
                    onTaskClick={handleTaskClick}
                    onToggleTask={handleToggleTask}
                    onNewTaskClick={() => setIsCreateOpen(true)}
                  />
                }
              />
              <Route
                path="team/:teamId/*"
                element={<TeamSpaceRouteWrapper currentUser={user} basePath={basePath} />}
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
                    description="Tasks targeted for completion by end of day 17 November 2026."
                    tasks={views.today}
                    onTaskClick={handleTaskClick}
                    onNewTaskClick={() => setIsCreateOpen(true)}
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
                    onTaskClick={handleTaskClick}
                    onNewTaskClick={() => setIsCreateOpen(true)}
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
                    onTaskClick={handleTaskClick}
                    onNewTaskClick={() => setIsCreateOpen(true)}
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
                    onTaskClick={handleTaskClick}
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
                    onTaskClick={handleTaskClick}
                  />
                }
              />
            </Routes>
          </main>
        </div>
      </div>

      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        onToggleTask={handleToggleTask}
      />

      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateTask={handleCreateTask}
        now={isPreview ? PREVIEW_NOW : undefined}
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
