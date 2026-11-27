import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Task } from '../../../data/taskTypes';
import { formatTimeLabel, getTaskPace, greeting, paceTone, relativeDayLabel, toDateKey } from '../../../data/taskDates';
import { TaskRow } from '../TaskRow';
import { DoodleTitle } from '../doodles/DoodleTitle';
import { WelcomeCard } from '../WelcomeCard';
import { IntentionBar } from '../IntentionBar';
import { DailyQuote } from '../DailyQuote';
import { MomentumStrip } from '../MomentumStrip';
import { Doodle } from '../doodles/Doodles';
import { loadRested, saveRested } from '../../../lib/welcomeStore';
import { ArrowRight, Clock, Dot, Maximize2 } from 'lucide-react';
import { Badge, Button, ProgressRing } from '../../../components/ui';

export interface TodayMomentum {
  completed: number;
  total: number;
}

export interface TodayTasks {
  items: Task[];
  totalCount: number;
}

export interface HomeViewProps {
  todayTasks: TodayTasks;
  todayLabel: string;
  todayMomentum: TodayMomentum;
  focusTask: Task | null;
  allTasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  onFocusTask: (task: Task) => void;
  onCheckInStart?: (task: Task) => void;
  onOpenPath?: (taskId: string) => void;
  userName?: string;
  userPrefix?: string;
  welcomed?: boolean;
  onSaveProfile?: (profile: { prefix: string; name: string }) => void;
  intention?: string;
  onIntentionChange?: (text: string) => void;
  eveningReview?: { onOpen: () => void };
}

function focusMessage(status: ReturnType<typeof getTaskPace>['status']): string {
  if (status === 'behind') return 'No rush. Pick the smallest next step.';
  if (status === 'at-risk') return 'One small update is enough.';
  if (status === 'ahead') return 'You are moving. Keep it light.';
  return 'One thing at a time.';
}

const HERO_GRADIENT =
  'linear-gradient(135deg, #fff1df 0%, #f8fbf1 48%, #f8e1d3 100%)';

export const HomeView: React.FC<HomeViewProps> = ({
  todayTasks,
  todayLabel,
  todayMomentum,
  focusTask,
  allTasks,
  onTaskClick,
  onToggleComplete,
  onFocusTask,
  onCheckInStart,
  onOpenPath,
  userName,
  userPrefix,
  welcomed = true,
  onSaveProfile,
  intention = '',
  onIntentionChange,
  eveningReview,
}) => {
  const focusPace = focusTask ? getTaskPace(focusTask) : null;
  const displayName = [userPrefix, userName].filter(Boolean).join(' ');
  const greetingText = displayName ? `${greeting()}, ${displayName}` : greeting();
  const todayKey = toDateKey(new Date());
  const [rested, setRested] = useState(() => loadRested(todayKey));

  const stopForToday = () => {
    setRested(true);
    saveRested(todayKey, true);
  };

  const showList = () => {
    setRested(false);
    saveRested(todayKey, false);
  };

  const momentumPercent =
    todayMomentum.total > 0
      ? Math.round((todayMomentum.completed / todayMomentum.total) * 100)
      : 0;

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {!welcomed && onSaveProfile && (
        <div className="mx-auto w-full max-w-5xl">
          <WelcomeCard onSave={onSaveProfile} />
        </div>
      )}

      <section
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--line)] p-6 sm:p-8 shadow-sm"
        style={{ background: HERO_GRADIENT }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-[rgba(131,184,168,0.18)] blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
              {todayLabel}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] mt-1">
              {greetingText}
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Make yourself at home. One thing at a time.
            </p>
          </div>
          <ProgressRing
            value={momentumPercent}
            size={82}
            strokeWidth={7}
            label={`${todayMomentum.completed}`}
            subLabel="done today"
            className="hidden sm:inline-flex"
          />
        </div>

        {focusTask && focusPace ? (
          <div className="relative mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center rounded-2xl bg-[var(--surface)]/85 border border-[var(--line)] p-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)]">
                One small thing
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--ink)] mt-1 leading-snug">
                <DoodleTitle title={focusTask.title} category={focusTask.category} customImageKey={focusTask.customImageKey} size="lg" />
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {relativeDayLabel(focusTask.dueDate)}
                  {focusTask.dueTime ? ` · ${formatTimeLabel(focusTask.dueTime)}` : ''}
                </span>
                <Dot className="w-3 h-3 text-[var(--faint)] shrink-0" aria-hidden="true" />
                <span>{focusTask.progress}% complete</span>
                <Badge size="sm" variant={paceTone(focusPace.status)}>
                  {focusPace.label}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => onFocusTask(focusTask)}>
                  <Maximize2 className="w-3.5 h-3.5" /> Begin
                </Button>
                <span className="text-[11px] text-[var(--muted)]">{focusMessage(focusPace.status)}</span>
              </div>
            </div>
            <ProgressRing
              value={focusTask.progress}
              size={112}
              strokeWidth={8}
              label={`${focusTask.progress}%`}
              className="mx-auto sm:mx-0"
            />
          </div>
        ) : (
          <div className="relative mt-6 rounded-2xl bg-[var(--surface)]/85 border border-[var(--line)] p-5">
            <p className="text-sm text-[var(--muted)]">Nothing urgent. Add a task or enjoy the clear day.</p>
          </div>
        )}

        <div className="relative mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">7-day momentum</span>
            <div className="mt-2">
              <MomentumStrip tasks={allTasks} />
            </div>
          </div>
          <span className="text-xs text-[var(--muted)]">A little progress today.</span>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-1">
        <DailyQuote dateKey={toDateKey(new Date())} />
      </div>

      {onIntentionChange && (
        <div className="mx-auto w-full max-w-5xl">
          <IntentionBar value={intention} onSave={onIntentionChange} />
        </div>
      )}

      {eveningReview && (
        <button
          type="button"
          onClick={eveningReview.onOpen}
          className="w-full text-left rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5 hover:border-[var(--accent)]/40 transition-colors"
        >
          <span className="text-[11px] font-semibold text-[var(--ink)]">How did today sit?</span>
          <span className="text-[11px] text-[var(--muted)]"> A few quiet questions, whenever you are ready.</span>
        </button>
      )}

      <section aria-labelledby="today-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="today-heading" className="text-lg font-bold text-[var(--ink)] tracking-tight">
            Today
          </h2>

          <Link
            to="/app/today"
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            Open queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!rested && todayTasks.items.length > 0 && (
          <p className="text-[11px] text-[var(--muted)]">
            Tip: drag a task image into a check-in zone — or tap the circle.
          </p>
        )}

        {rested ? (
          <div className="p-8 text-center border border-[var(--line)] rounded-xl bg-[var(--surface)]">
            <div className="w-12 h-12 mx-auto mb-3">
              <Doodle kind="plants" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ink)]">You can stop here.</h3>
            <p className="text-xs text-[var(--muted)] mt-1">The rest will keep until tomorrow.</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={showList}>
              Show the list
            </Button>
          </div>
        ) : todayTasks.items.length > 0 ? (
          <>
            <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
              {todayTasks.items.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  onToggleComplete={onToggleComplete}
                  onFocus={onFocusTask}
                  onCheckInStart={onCheckInStart}
                  onOpenPath={onOpenPath}
                />
              ))}
            </div>
            <div className="flex justify-center pt-1">
              <Button variant="ghost" size="sm" onClick={stopForToday}>
                That's enough for today
              </Button>
            </div>
          </>
        ) : (
          <div className="p-10 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
            <p className="text-xs text-[var(--muted)]">No tasks due today. You are fully caught up.</p>
          </div>
        )}
      </section>
    </div>
  );
};
