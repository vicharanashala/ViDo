import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AlertCircle, Archive, Calendar, CheckCircle2, Clock, LayoutDashboard, Plus, X } from 'lucide-react';
import type { NewTaskInput, Task } from '../../data/taskTypes';
import {
  applyTaskFilters,
  EMPTY_TASK_FILTERS,
  getFilteredTasks,
  getHomeDashboardTasks,
  pickFocusTask,
  type TaskFilterState,
} from '../../data/taskFilters';
import { formatDateLong, toDateKey } from '../../data/taskDates';
import { WorkspaceSidebar } from './WorkspaceSidebar';
import { WorkspaceTopBar } from './WorkspaceTopBar';
import { HomeView } from './views/HomeView';
import { ListView } from './views/ListView';
import { TodayQueueView } from './views/TodayQueueView';
import { TaskDetailModal } from './TaskDetailModal';
import { TaskCreateModal } from './TaskCreateModal';
import { QuickAdd } from './QuickAdd';
import { FocusMode } from './FocusMode';
import { TaskCheckInTray } from './TaskCheckInTray';
import { HelpModal } from './HelpModal';
import { Doodle } from './doodles/Doodles';
import type { DoodleKind } from './doodles/doodleMap';
import type { CheckInKind } from './checkInTypes';
import { useTaskStore } from './useTaskStore';
import { useWelcome } from './useWelcome';

const MOBILE_NAV = [
  { to: '/app', label: 'Home', icon: <LayoutDashboard className="w-3.5 h-3.5" />, end: true },
  { to: '/app/today', label: 'Today', icon: <Clock className="w-3.5 h-3.5" /> },
  { to: '/app/upcoming', label: 'Upcoming', icon: <Calendar className="w-3.5 h-3.5" /> },
  { to: '/app/needs-attention', label: 'Past', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  { to: '/app/completed', label: 'Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { to: '/app/archived', label: 'Archived', icon: <Archive className="w-3.5 h-3.5" /> },
];

function deliveryNotice(task: Task): string {
  return task.priority === 'high' ? 'Important thing done. That counts.' : 'Done. That counts.';
}

const ATMOSPHERE_TASKS: { kind: DoodleKind; style: React.CSSProperties }[] = [
  { kind: 'laundry', style: { top: '10%', left: '23%', width: 62, height: 62, animationDelay: '-2s' } },
  { kind: 'reading', style: { top: '16%', right: '7%', width: 54, height: 54, animationDelay: '-7s' } },
  { kind: 'groceries', style: { top: '38%', left: '4%', width: 58, height: 58, animationDelay: '-12s' } },
  { kind: 'writing', style: { top: '44%', right: '12%', width: 60, height: 60, animationDelay: '-5s' } },
  { kind: 'run', style: { top: '68%', left: '24%', width: 66, height: 66, animationDelay: '-16s' } },
  { kind: 'cooking', style: { top: '72%', right: '20%', width: 52, height: 52, animationDelay: '-9s' } },
  { kind: 'plants', style: { top: '84%', left: '6%', width: 48, height: 48, animationDelay: '-20s' } },
  { kind: 'cricket', style: { top: '88%', right: '5%', width: 56, height: 56, animationDelay: '-13s' } },
  { kind: 'travel', style: { top: '30%', left: '76%', width: 48, height: 48, animationDelay: '-18s' } },
  { kind: 'basketball', style: { top: '58%', right: '3%', width: 46, height: 46, animationDelay: '-3s' } },
];

export const WorkspaceLayout: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    setProgress,
    toggleComplete,
    addCheckpoint,
    archiveTask,
    restoreTask,
    deleteTask,
  } = useTaskStore();
  const welcome = useWelcome();

  const [filters, setFilters] = useState<TaskFilterState>(EMPTY_TASK_FILTERS);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const [checkInTaskId, setCheckInTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const location = useLocation();
  const now = new Date();
  const todayLabel = formatDateLong(now);
  const todayKey = toDateKey(now);
  const todayTasks = tasks.filter((task) => task.dueDate === todayKey && !task.archivedAt);
  const todayMomentum = {
    completed: todayTasks.filter((task) => task.state === 'completed').length,
    total: todayTasks.length,
  };

  const filteredTasks = useMemo(() => applyTaskFilters(tasks, filters, now), [tasks, filters, todayKey]);
  const filteredViews = useMemo(() => getFilteredTasks(filteredTasks, now), [filteredTasks, todayKey]);
  const dashboard = useMemo(() => getHomeDashboardTasks(filteredTasks, now), [filteredTasks, todayKey]);
  const suggestedFocusTask = useMemo(() => pickFocusTask(tasks, now), [tasks, todayKey]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null;
  const activeFocusTask = tasks.find((task) => task.id === focusTaskId) ?? null;
  const checkInTask = tasks.find((task) => task.id === checkInTaskId) ?? null;
  const filtersActive =
    filters.query.trim().length > 0 ||
    filters.priority !== 'all' ||
    filters.category !== 'all' ||
    filters.deadline !== 'all';

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleStartFocus = (task: Task) => {
    setSelectedTaskId(null);
    setFocusTaskId(task.id);
  };

  const handleQuickAdd = (input: NewTaskInput) => {
    addTask(input);
    setNotice(`Added "${input.title}".`);
  };

  const handleCreate = (input: NewTaskInput) => {
    addTask(input);
    setNotice(`Created "${input.title}".`);
  };

  const handleToggleComplete = (task: Task) => {
    toggleComplete(task.id);
    setNotice(task.state === 'completed' ? `Reopened "${task.title}".` : deliveryNotice(task));
  };

  const handleCheckInStart = (task: Task) => {
    if (task.state === 'completed') {
      handleToggleComplete(task);
      return;
    }
    setCheckInTaskId(task.id);
  };

  const handleBringToToday = (task: Task) => {
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const keepTime = task.dueTime && task.dueTime > nowTime ? task.dueTime : undefined;
    updateTask(task.id, { dueDate: todayKey, dueTime: keepTime, parkedAt: undefined });
    addCheckpoint(task.id, 'Chosen for today.');
    setNotice(`"${task.title}" is on today's list.`);
  };

  const handleCheckIn = (task: Task, kind: CheckInKind, progress?: number) => {
    if (kind === 'done') {
      toggleComplete(task.id);
      setNotice('That counts.');
      return;
    }

    if (kind === 'progress') {
      const value = Math.max(0, Math.min(99, progress ?? task.progress + 25));
      addCheckpoint(task.id, `Worked on it — now at ${value}%.`, value);
      setNotice(`Now at ${value}%. That counts.`);
      return;
    }

    updateTask(task.id, {
      parkedAt: new Date().toISOString(),
      dueTime: undefined,
      priority: kind === 'not-important' ? 'low' : task.priority,
    });
    addCheckpoint(
      task.id,
      kind === 'not-today' ? 'Set aside to pick up again.' : 'Set aside for later — not urgent.'
    );
    setNotice(
      kind === 'not-today'
        ? 'Set aside. Pick it up whenever you choose.'
        : 'Set aside for later. No pressure.'
    );
  };

  const handleArchive = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    archiveTask(id);
    setSelectedTaskId(null);
    if (focusTaskId === id) setFocusTaskId(null);
    setNotice(task ? `Archived "${task.title}".` : 'Task archived.');
  };

  const handleDelete = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    deleteTask(id);
    setSelectedTaskId(null);
    if (focusTaskId === id) setFocusTaskId(null);
    setNotice(task ? `Deleted "${task.title}".` : 'Task deleted.');
  };

  const getHeaderInfo = () => {
    const path = location.pathname;
    if (path.endsWith('/today')) {
      return { title: 'Today', subtitle: 'A few things for today, no rush' };
    }
    if (path.endsWith('/upcoming')) {
      return { title: 'Upcoming', subtitle: 'For when you have room — also called Later' };
    }
    if (path.endsWith('/needs-attention')) {
      return { title: 'Past', subtitle: 'Earlier tasks — pick what to do today, or leave them' };
    }
    if (path.endsWith('/completed')) {
      return { title: 'Completed', subtitle: 'What you finished — also called Done' };
    }
    if (path.endsWith('/archived')) {
      return { title: 'Archived', subtitle: 'Kept out of the way — also called Put away' };
    }
    return { title: 'Home' };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="workspace-studio flex min-h-screen text-[var(--ink)] antialiased">
      <div className="workspace-atmosphere" aria-hidden="true">
        {ATMOSPHERE_TASKS.map(({ kind, style }) => (
          <span key={kind} className="workspace-task-mark" style={style}>
            <Doodle kind={kind} />
          </span>
        ))}
      </div>
      <WorkspaceSidebar
        userName={welcome.name}
        userPrefix={welcome.prefix}
        onNewTaskClick={() => setIsCreateOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <WorkspaceTopBar
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          searchQuery={filters.query}
          onSearchChange={(query) => setFilters((current) => ({ ...current, query }))}
          priority={filters.priority}
          onPriorityChange={(priority) => setFilters((current) => ({ ...current, priority }))}
          deadline={filters.deadline}
          onDeadlineChange={(deadline) => setFilters((current) => ({ ...current, deadline }))}
          filtersActive={filtersActive}
          onClearFilters={() => setFilters(EMPTY_TASK_FILTERS)}
          onHelpClick={() => setIsHelpOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-2 max-w-6xl mx-auto">
            <QuickAdd onAdd={handleQuickAdd} />
          </div>

          <Routes>
            <Route
              index
              element={
                <HomeView
                  todayTasks={dashboard.today}
                  todayLabel={todayLabel}
                  todayMomentum={todayMomentum}
                  focusTask={suggestedFocusTask}
                  allTasks={tasks}
                  onTaskClick={handleTaskClick}
                  onToggleComplete={handleToggleComplete}
                  onFocusTask={handleStartFocus}
                  userName={welcome.name}
                  userPrefix={welcome.prefix}
                  welcomed={welcome.welcomed}
                  onSaveProfile={welcome.saveProfile}
                  intention={welcome.intention}
                  onIntentionChange={welcome.updateIntention}
                  onCheckInStart={handleCheckInStart}
                />
              }
            />
            <Route
              path="today"
              element={
                <TodayQueueView
                  tasks={filteredTasks}
                  onTaskClick={handleTaskClick}
                  onNewTaskClick={() => setIsCreateOpen(true)}
                  onToggleComplete={handleToggleComplete}
                  onFocusTask={handleStartFocus}
                  onCheckInStart={handleCheckInStart}
                  onBringToToday={handleBringToToday}
                />
              }
            />
            <Route
              path="upcoming"
              element={
                <ListView
                  title="Upcoming"
                  description="For when you have room — also called Later."
                  tasks={filteredViews.upcoming}
                  onTaskClick={handleTaskClick}
                  onNewTaskClick={() => setIsCreateOpen(true)}
                  onToggleComplete={handleToggleComplete}
                  onFocusTask={handleStartFocus}
                  onCheckInStart={handleCheckInStart}
                />
              }
            />
            <Route
              path="needs-attention"
              element={
                <ListView
                  title="Past"
                  description="Earlier tasks. Pick what to do today, or leave them here."
                  tasks={filteredViews.needsAttention}
                  onTaskClick={handleTaskClick}
                  onNewTaskClick={() => setIsCreateOpen(true)}
                  onToggleComplete={handleToggleComplete}
                  onFocusTask={handleStartFocus}
                  onCheckInStart={handleCheckInStart}
                  onBringToToday={handleBringToToday}
                />
              }
            />
            <Route
              path="completed"
              element={
                <ListView
                  title="Completed"
                  description="What you finished — also called Done."
                  tasks={filteredViews.completed}
                  onTaskClick={handleTaskClick}
                  onToggleComplete={handleToggleComplete}
                  onCheckInStart={handleCheckInStart}
                />
              }
            />
            <Route
              path="archived"
              element={
                <ListView
                  title="Archived"
                  description="Kept out of the way — also called Put away."
                  tasks={filteredViews.archived}
                  onTaskClick={handleTaskClick}
                />
              }
            />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
      </div>

      <TaskDetailModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={updateTask}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onRestore={(id) => {
          restoreTask(id);
          setNotice('Task restored.');
        }}
        onSetProgress={(id, value) => {
          setProgress(id, value);
          setNotice(value >= 100 ? 'Task completed.' : 'Progress updated.');
        }}
        onToggleComplete={(id) => {
          const task = tasks.find((item) => item.id === id);
          toggleComplete(id);
            if (task) {
              setNotice(task.state === 'completed' ? `Reopened "${task.title}".` : deliveryNotice(task));
            }
        }}
        onAddCheckpoint={(id, note) => {
          addCheckpoint(id, note);
          setNotice('Checkpoint logged.');
        }}
        onFocus={() => {
          if (selectedTask) handleStartFocus(selectedTask);
        }}
      />

      <TaskCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        defaultDate={todayKey}
      />

      <nav
        aria-label="Mobile views"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--surface)]/95 backdrop-blur border-t border-[var(--line)] px-1 py-1.5 flex items-center justify-around"
      >
        {MOBILE_NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[9px] font-medium text-[var(--muted)] hover:text-[var(--ink)]"
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setIsCreateOpen(true)}
        aria-label="New task"
        className="md:hidden fixed bottom-20 right-5 z-30 w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/20 flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="w-5 h-5" />
      </button>

      {activeFocusTask && (
        <FocusMode
          task={activeFocusTask}
          onClose={() => setFocusTaskId(null)}
          onSetProgress={(id, value) => {
            setProgress(id, value);
            setNotice(value >= 100 ? 'Task completed.' : 'Progress updated.');
          }}
          onAddCheckpoint={(id, note) => {
            addCheckpoint(id, note);
            setNotice('Checkpoint logged.');
          }}
          onToggleComplete={(id) => {
            const task = tasks.find((item) => item.id === id);
            toggleComplete(id);
            if (task) {
              setNotice(task.state === 'completed' ? `Reopened "${task.title}".` : deliveryNotice(task));
            }
          }}
          onOpenDetails={() => {
            setFocusTaskId(null);
            setSelectedTaskId(activeFocusTask.id);
          }}
        />
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {checkInTask && (
        <TaskCheckInTray
          task={checkInTask}
          onSelect={(kind, progress) => handleCheckIn(checkInTask, kind, progress)}
          onClose={() => setCheckInTaskId(null)}
        />
      )}

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--ink)] px-4 py-2.5 text-xs font-medium text-white shadow-xl"
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
