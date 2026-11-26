import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BENCHMARK_DATE_STR, SAMPLE_TASKS, type SampleTask } from '../../../data/sampleTasks';
import { type HomeDashboardTasks } from '../../../data/taskFilters';
import { addDays, todayISO } from '../../../data/calendar';
import { TaskRow } from '../TaskRow';
import { DailyTimeline } from '../timeline/DailyTimeline';
import { EndOfDayReview } from '../EndOfDayReview';
import { Button } from '../../../components/ui';
import {
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Clock3,
  LayoutDashboard,
  PlayCircle,
  Plus,
  X,
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
  referenceDate?: string;
  onTaskClick?: (task: SampleTask) => void;
  onToggleTask?: (task: SampleTask) => void;
  onNewTaskClick?: () => void;
  onUpdateTask?: (taskId: string, updates: Partial<SampleTask>) => void;
  categories?: Array<{ id: string; name: string }>;
}

function getGreeting(now: Date) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

function formatSelectedDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseHHmm(value?: string): number | null {
  if (!value) return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  return hh * 60 + mm;
}

function minutesToHHmm(totalMinutes: number) {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(totalMinutes)));
  const hh = String(Math.floor(clamped / 60)).padStart(2, '0');
  const mm = String(clamped % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatHHmm(value: string) {
  const [hh, mm] = value.split(':').map(Number);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
}

function minutesUntil(targetMin: number, nowMin: number) {
  return targetMin - nowMin;
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return 'now';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export const HomeView: React.FC<HomeViewProps> = ({
  isPreview = false,
  basePath = '/workspace',
  user,
  tasks,
  dashboard,
  initialTab = 'dashboard',
  initialStatus = 'today',
  onTaskClick = () => {},
  onToggleTask = () => {},
  onNewTaskClick,
  onUpdateTask,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks'>(initialTab);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  const [statusFilter, setStatusFilter] = useState<'today' | 'needsAttention' | 'upcoming' | 'completed' | 'all'>(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'personal' | 'home' | 'work'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'none'>('all');

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState<Array<'status' | 'category' | 'priority'>>(() => {
    const initial: Array<'status' | 'category' | 'priority'> = [];
    if (initialStatus !== 'all') initial.push('status');
    return initial;
  });

  const addFilter = (type: 'status' | 'category' | 'priority') => {
    if (!visibleFilters.includes(type)) setVisibleFilters((prev) => [...prev, type]);
    setIsFilterMenuOpen(false);
  };
  const removeFilter = (type: 'status' | 'category' | 'priority') => {
    setVisibleFilters((prev) => prev.filter((f) => f !== type));
    if (type === 'status') setStatusFilter('all');
    if (type === 'category') setCategoryFilter('all');
    if (type === 'priority') setPriorityFilter('all');
  };
  const clearAllFilters = () => {
    setVisibleFilters([]);
    setStatusFilter('all');
    setCategoryFilter('all');
    setPriorityFilter('all');
  };

  const allTasks = useMemo(() => {
    if (tasks) return tasks;
    if (dashboard) {
      return [
        ...dashboard.needsAttention.items,
        ...dashboard.today.items,
        ...dashboard.upcoming.items,
        ...dashboard.recentlyCompleted.items,
      ].filter((t, i, self) => self.findIndex((x) => x.id === t.id) === i);
    }
    return isPreview ? SAMPLE_TASKS : [];
  }, [tasks, dashboard, isPreview]);

  const useBenchmarkDate = isPreview || tasks === SAMPLE_TASKS || (!tasks && !!dashboard);
  const previewToday = useMemo(() => (useBenchmarkDate ? BENCHMARK_DATE_STR : todayISO()), [useBenchmarkDate]);
  const [selectedDate, setSelectedDate] = useState<string>(previewToday);
  useEffect(() => { setSelectedDate(previewToday); }, [previewToday]);

  // Live clock for header/progress/next task
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10000);
    return () => window.clearInterval(id);
  }, []);

  const selectedIsToday = selectedDate === previewToday;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Auto-open end-of-day review at 21:00 local for selected day only
  useEffect(() => {
    if (!selectedIsToday) return;
    const flag = `vido_eod_auto_${isPreview ? 'preview' : 'live'}_${selectedDate}`;
    const maybeOpen = () => {
      const d = new Date();
      if (d.getHours() < 21) return;
      if (localStorage.getItem(flag)) return;
      setIsReviewOpen(true);
      try { localStorage.setItem(flag, '1'); } catch { /* ignore */ }
    };
    maybeOpen();
    const id = window.setInterval(maybeOpen, 30000);
    return () => window.clearInterval(id);
  }, [isPreview, selectedDate, selectedIsToday]);

  const displayedTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (task.state === 'completed') return false;
      if (task.isArchived) return false;
      if (statusFilter !== 'all') {
        if (statusFilter === 'today' && task.dueDate !== selectedDate) return false;
        if (statusFilter === 'needsAttention' && !(task.dueDate < selectedDate)) return false;
        if (statusFilter === 'upcoming' && !(task.dueDate > selectedDate)) return false;
      }
      if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
      if (priorityFilter !== 'all') {
        if (priorityFilter === 'none' && task.priority) return false;
        if (priorityFilter !== 'none' && task.priority !== priorityFilter) return false;
      }
      return true;
    });
  }, [allTasks, statusFilter, categoryFilter, priorityFilter, selectedDate]);

  const selectedDayTasks = useMemo(
    () => allTasks.filter((t) => !t.isArchived && t.dueDate === selectedDate),
    [allTasks, selectedDate]
  );

  const scheduledDayTasks = useMemo(
    () => selectedDayTasks.filter((t) => t.state !== 'cancelled' && (t.startTime || t.endTime || t.dueTime)),
    [selectedDayTasks]
  );
  const unscheduledDayTasks = useMemo(
    () => selectedDayTasks.filter((t) => t.state !== 'cancelled' && !t.startTime && !t.endTime && !t.dueTime),
    [selectedDayTasks]
  );

  const nextTaskInfo = useMemo(() => {
    const candidates = scheduledDayTasks
      .filter((t) => t.state === 'active')
      .map((t) => {
        const start = parseHHmm(t.startTime) ?? parseHHmm(t.dueTime) ?? parseHHmm(t.endTime);
        const endRaw = parseHHmm(t.endTime) ?? parseHHmm(t.dueTime) ?? (start !== null ? start + 30 : null);
        if (start === null || endRaw === null) return null;
        const end = endRaw > start ? endRaw : start + 30;
        return { task: t, start, end };
      })
      .filter((x): x is { task: SampleTask; start: number; end: number } => Boolean(x))
      .sort((a, b) => a.start - b.start);

    if (!selectedIsToday) {
      const first = candidates[0];
      if (!first) return { state: 'none' as const };
      return { state: 'scheduled' as const, task: first.task, start: first.start, end: first.end, minutes: null as number | null };
    }

    const ongoing = candidates.find((c) => nowMinutes >= c.start && nowMinutes < c.end);
    if (ongoing) {
      const next = candidates.find((c) => c.start >= ongoing.end);
      if (!next) return { state: 'ongoing-none' as const, task: ongoing.task, start: ongoing.start, end: ongoing.end };
      return { state: 'ongoing-next' as const, task: next.task, start: next.start, end: next.end, minutes: minutesUntil(next.start, nowMinutes) };
    }
    const next = candidates.find((c) => c.start > nowMinutes);
    if (!next) return { state: 'none' as const };
    return { state: 'upcoming' as const, task: next.task, start: next.start, end: next.end, minutes: minutesUntil(next.start, nowMinutes) };
  }, [scheduledDayTasks, selectedIsToday, nowMinutes]);

  const pendingConfirmations = useMemo(() => {
    const isPastDay = selectedDate < previewToday;
    return selectedDayTasks.filter((t) => {
      if (t.state !== 'active') return false;
      const end = parseHHmm(t.endTime) ?? parseHHmm(t.dueTime) ?? parseHHmm(t.startTime);
      if (end === null) return false;
      if (isPastDay) return true;
      if (!selectedIsToday) return false;
      return nowMinutes >= end;
    }).sort((a, b) => (parseHHmm(a.endTime) ?? parseHHmm(a.dueTime) ?? 0) - (parseHHmm(b.endTime) ?? parseHHmm(b.dueTime) ?? 0));
  }, [selectedDayTasks, selectedIsToday, selectedDate, previewToday, nowMinutes]);

  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [assignStart, setAssignStart] = useState('09:00');
  const [assignEnd, setAssignEnd] = useState('10:00');

  const beginAssign = (task: SampleTask) => {
    setAssigningTaskId(task.id);
    const base = parseHHmm(task.dueTime) ?? 9 * 60;
    setAssignStart(minutesToHHmm(base));
    setAssignEnd(minutesToHHmm(base + 60));
  };

  const saveAssign = (task: SampleTask) => {
    if (!onUpdateTask) return;
    const s = parseHHmm(assignStart);
    const e = parseHHmm(assignEnd);
    if (s === null || e === null || e <= s) return;
    onUpdateTask(task.id, { startTime: assignStart, endTime: assignEnd, dueTime: assignEnd, dueDate: selectedDate });
    setAssigningTaskId(null);
  };

  const assignError = useMemo(() => {
    const s = parseHHmm(assignStart);
    const e = parseHHmm(assignEnd);
    if (s === null || e === null) return 'Enter valid start and end times.';
    if (e <= s) return 'End time must be after start time.';
    return '';
  }, [assignStart, assignEnd]);

  const jumpToToday = () => setSelectedDate(previewToday);

  const greeting = getGreeting(now);
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--line)]" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          onClick={() => { setActiveTab('dashboard'); navigate(basePath); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'tasks'}
          onClick={() => { setActiveTab('tasks'); navigate(`${basePath}/tasks`); }}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'tasks'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Tasks
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. HEADER */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 sm:px-6 py-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--muted)]">
                  {selectedIsToday ? 'Today' : formatShortDate(selectedDate)}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)]">
                  {greeting}, {firstName}
                </h1>
                <p className="text-sm text-[var(--muted)] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[var(--accent)]" />
                  {formatSelectedDate(selectedDate)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-1">
                  <button
                    aria-label="Previous day"
                    onClick={() => setSelectedDate((d) => addDays(d, -1))}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="px-3 text-xs font-semibold text-[var(--ink)] min-w-[120px] text-center">
                    {formatShortDate(selectedDate)}
                  </div>
                  <button
                    aria-label="Next day"
                    onClick={() => setSelectedDate((d) => addDays(d, 1))}
                    className="p-2 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <Button variant={selectedIsToday ? 'primary' : 'secondary'} size="sm" onClick={jumpToToday}>
                  Today
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsReviewOpen(true)}>
                  <Clock3 className="w-4 h-4 mr-1.5" /> Daily Review
                </Button>
              </div>
            </div>
          </section>

          {/* 2. MAIN TIMELINE */}
          <section aria-label="Main timeline" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[var(--accent)] rounded-full" /> 24-Hour Interactive Timeline
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">Horizontal 24-hour timeline with live current-time indicator, ongoing and upcoming task highlighting.</p>
              </div>
            </div>
            <DailyTimeline
              tasks={selectedDayTasks}
              selectedDate={selectedDate}
              onTaskClick={onTaskClick}
              onToggleTask={onToggleTask}
              onUpdateTask={onUpdateTask}
              isPreview={isPreview}
            />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* 4. NEXT TASK */}
            <section aria-label="Next task" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3">
                <PlayCircle className="w-4 h-4 text-[var(--accent)]" /> Next Task
              </div>
              {nextTaskInfo.state === 'none' ? (
                <div className="text-sm text-[var(--muted)]">No upcoming scheduled task. You have a free slot.</div>
              ) : nextTaskInfo.state === 'ongoing-none' ? (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-[var(--ink)]">{nextTaskInfo.task.title}</div>
                  <div className="text-xs text-[var(--muted)]">Ongoing now · ends {formatHHmm(minutesToHHmm(nextTaskInfo.end))}</div>
                  <div className="text-xs text-[var(--faint)]">No next task scheduled after this.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {(nextTaskInfo.state === 'ongoing-next') && (
                    <div className="text-[11px] font-semibold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 rounded-md px-2 py-1 inline-flex">Up next after current task</div>
                  )}
                  <div className="text-base font-semibold text-[var(--ink)] leading-snug">{nextTaskInfo.task.title}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {formatHHmm(minutesToHHmm(nextTaskInfo.start))} – {formatHHmm(minutesToHHmm(nextTaskInfo.end))}
                  </div>
                  <div className="text-xs font-medium text-[var(--accent)]">
                    {selectedIsToday && nextTaskInfo.minutes !== null
                      ? nextTaskInfo.minutes <= 0 ? 'Starting now' : `Starts in ${formatDuration(nextTaskInfo.minutes)}`
                      : 'Scheduled for this day'}
                  </div>
                  <button
                    type="button"
                    onClick={() => onTaskClick(nextTaskInfo.task)}
                    className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--accent)] cursor-pointer"
                  >
                    View task details
                  </button>
                </div>
              )}
            </section>

            {/* 5. UNSCHEDULED TASKS */}
            <section aria-label="Unscheduled tasks" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <CircleDashed className="w-4 h-4 text-[var(--accent)]" /> Unscheduled Tasks
                </div>
                <span className="text-[11px] text-[var(--faint)]">{unscheduledDayTasks.length}</span>
              </div>
              {unscheduledDayTasks.length === 0 ? (
                <div className="text-sm text-[var(--muted)]">All tasks for this day have time slots.</div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {unscheduledDayTasks.map((task) => (
                    <div key={task.id} className="rounded-lg border border-[var(--line)] bg-[var(--canvas)]/40 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <button type="button" onClick={() => onTaskClick(task)} className="text-sm font-medium text-[var(--ink)] text-left hover:text-[var(--accent)] cursor-pointer">
                          {task.title}
                        </button>
                        {onUpdateTask && assigningTaskId !== task.id && (
                          <button type="button" onClick={() => beginAssign(task)} className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer shrink-0">
                            Assign time
                          </button>
                        )}
                      </div>
                      {assigningTaskId === task.id && onUpdateTask && (
                        <div className="mt-2 pt-2 border-t border-[var(--line)] space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-[10px] text-[var(--muted)]">Start
                              <input type="time" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} className="mt-0.5 w-full px-2 py-1.5 text-xs rounded-md border border-[var(--line)] bg-[var(--surface)]" />
                            </label>
                            <label className="text-[10px] text-[var(--muted)]">End
                              <input type="time" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} className="mt-0.5 w-full px-2 py-1.5 text-xs rounded-md border border-[var(--line)] bg-[var(--surface)]" />
                            </label>
                          </div>
                          {assignError && <div className="text-[10px] text-[var(--red)]">{assignError}</div>}
                          <div className="flex gap-2">
                            <button type="button" disabled={!!assignError} onClick={() => saveAssign(task)} className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-[var(--accent)] text-white disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">Save</button>
                            <button type="button" onClick={() => setAssigningTaskId(null)} className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md border border-[var(--line)] text-[var(--muted)] cursor-pointer">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 6. DAILY REVIEW */}
            <section aria-label="Daily review" className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                  <CheckCircle2 className="w-4 h-4 text-[var(--accent)]" /> Daily Review
                </div>
                <button type="button" onClick={() => setIsReviewOpen(true)} className="text-[11px] font-semibold text-[var(--accent)] hover:underline cursor-pointer">
                  Open full review
                </button>
              </div>
              {pendingConfirmations.length === 0 ? (
                <div className="text-sm text-[var(--muted)]">No pending completion confirmations.</div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {pendingConfirmations.map((task) => (
                    <div key={task.id} className="rounded-lg border border-[var(--line)] bg-[var(--canvas)]/40 p-3">
                      <div className="text-sm font-medium text-[var(--ink)]">{task.title}</div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5">
                        {task.startTime || task.dueTime || '--:--'}{task.endTime ? ` - ${task.endTime}` : ''}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => onToggleTask(task)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-[var(--green)] text-[var(--on-accent)] hover:opacity-90 cursor-pointer"
                        >
                          ✓ Completed
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateTask?.(task.id, { state: 'active', completedAt: undefined })}
                          className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/30 hover:bg-[var(--canvas)] cursor-pointer"
                        >
                          ✕ Not completed
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
            <div>
              <h2 className="text-2xl font-bold text-[var(--ink)] tracking-tight">Tasks</h2>
              <p className="text-sm text-[var(--muted)] mt-1">View and manage all your responsibilities, from daily tasks to long-term goals.</p>
            </div>
            {onNewTaskClick && (
              <Button variant="primary" size="sm" className="shrink-0" onClick={onNewTaskClick}>
                <Plus className="w-4 h-4 mr-1.5" /> New Task
              </Button>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 p-1 -ml-1">
              {visibleFilters.includes('status') && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-soft)] text-[var(--accent)] rounded-lg text-xs font-semibold border border-[var(--accent)]/20 animate-in fade-in zoom-in-95 duration-200">
                  <span>Status: {statusFilter === 'all' ? 'All' : statusFilter === 'today' ? "Today's Agenda" : statusFilter === 'needsAttention' ? 'Needs Attention' : statusFilter === 'upcoming' ? 'Upcoming' : 'Completed'}</span>
                  <button onClick={() => removeFilter('status')} className="hover:bg-[var(--accent)]/20 p-0.5 rounded-md transition-colors cursor-pointer" aria-label="Remove status filter"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {visibleFilters.includes('category') && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] text-[var(--ink)] rounded-lg text-xs font-semibold border border-[var(--line)] shadow-xs animate-in fade-in zoom-in-95 duration-200">
                  <span>Category: {categoryFilter === 'all' ? 'All' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}</span>
                  <button onClick={() => removeFilter('category')} className="hover:bg-[var(--canvas)] p-0.5 rounded-md transition-colors text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer" aria-label="Remove category filter"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {visibleFilters.includes('priority') && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] text-[var(--ink)] rounded-lg text-xs font-semibold border border-[var(--line)] shadow-xs animate-in fade-in zoom-in-95 duration-200">
                  <span>Priority: {priorityFilter === 'all' ? 'All' : priorityFilter.charAt(0).toUpperCase() + priorityFilter.slice(1)}</span>
                  <button onClick={() => removeFilter('priority')} className="hover:bg-[var(--canvas)] p-0.5 rounded-md transition-colors text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer" aria-label="Remove priority filter"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              <div className="relative">
                <Button variant="ghost" size="sm" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className="text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] border border-dashed border-[var(--line)]">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Filter
                </Button>
                {isFilterMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterMenuOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--line)] shadow-lg rounded-xl p-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="text-[10px] font-bold text-[var(--faint)] uppercase tracking-wider px-2 py-1.5 mb-1">Filter By</div>
                      {!visibleFilters.includes('status') && (
                        <div className="space-y-0.5 mb-2">
                          <div className="px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">Status</div>
                          <button onClick={() => { addFilter('status'); setStatusFilter('today'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Today</button>
                          <button onClick={() => { addFilter('status'); setStatusFilter('needsAttention'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Needs Attention</button>
                          <button onClick={() => { addFilter('status'); setStatusFilter('upcoming'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Upcoming</button>
                        </div>
                      )}
                      {!visibleFilters.includes('category') && (
                        <div className="space-y-0.5 mb-2 border-t border-[var(--line)] pt-2">
                          <div className="px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">Category</div>
                          <button onClick={() => { addFilter('category'); setCategoryFilter('personal'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Personal</button>
                          <button onClick={() => { addFilter('category'); setCategoryFilter('home'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Home</button>
                          <button onClick={() => { addFilter('category'); setCategoryFilter('work'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Work</button>
                        </div>
                      )}
                      {!visibleFilters.includes('priority') && (
                        <div className="space-y-0.5 border-t border-[var(--line)] pt-2">
                          <div className="px-2 py-1 text-[10px] font-semibold text-[var(--muted)]">Priority</div>
                          <button onClick={() => { addFilter('priority'); setPriorityFilter('high'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">High Priority</button>
                          <button onClick={() => { addFilter('priority'); setPriorityFilter('medium'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Medium Priority</button>
                          <button onClick={() => { addFilter('priority'); setPriorityFilter('low'); }} className="w-full text-left px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--canvas)] rounded-md cursor-pointer">Low Priority</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {visibleFilters.length > 0 && (
                <button onClick={clearAllFilters} className="text-xs font-medium text-[var(--muted)] hover:text-[var(--red)] px-2 py-1.5 transition-colors ml-auto sm:ml-2 cursor-pointer">
                  Clear all
                </button>
              )}
            </div>

            {displayedTasks.length > 0 ? (
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-sm overflow-hidden divide-y divide-[var(--line)]">
                {displayedTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onClick={onTaskClick} onToggle={onToggleTask} isPreview={isPreview} />
                ))}
              </div>
            ) : allTasks.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)] space-y-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mx-auto">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-[var(--ink)]">Your workspace is empty</p>
                <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">Get started by creating your first task to track your personal, household, or work responsibilities.</p>
                {onNewTaskClick && (
                  <Button variant="primary" size="sm" onClick={onNewTaskClick} className="mt-2">
                    <Plus className="w-4 h-4 mr-1.5" /> Create First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-12 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)] space-y-2">
                <p className="text-sm font-semibold text-[var(--ink)]">No tasks match your filters</p>
                <p className="text-xs text-[var(--muted)]">Try adjusting your active filters or clear them to view all responsibilities.</p>
                <Button variant="secondary" size="sm" onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setPriorityFilter('all'); }} className="mt-2">
                  Reset Filters
                </Button>
              </div>
            )}
          </section>
        </div>
      )}

      <EndOfDayReview
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        tasks={allTasks}
        date={selectedDate}
        isPreview={isPreview}
        onToggleTask={onToggleTask}
        onUpdateTask={onUpdateTask}
      />
    </div>
  );
};