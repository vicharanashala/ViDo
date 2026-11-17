import React from 'react';
import { Link } from 'react-router-dom';
import type { Task } from '../../../data/taskTypes';
import { getTaskPace, greeting, paceTone, relativeDayLabel } from '../../../data/taskDates';
import { TaskRow } from '../TaskRow';
import { DoodleTitle } from '../doodles/DoodleTitle';
import { WelcomeCard } from '../WelcomeCard';
import { IntentionBar } from '../IntentionBar';
import { MomentumStrip } from '../MomentumStrip';
import { ArrowRight, Clock, Maximize2 } from 'lucide-react';
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
  userName?: string;
  welcomed?: boolean;
  onSaveName?: (name: string) => void;
  intention?: string;
  onIntentionChange?: (text: string) => void;
}

function focusMessage(status: ReturnType<typeof getTaskPace>['status']): string {
  if (status === 'behind') return 'Narrow the next step and log one update.';
  if (status === 'at-risk') return 'A small update will get this back on pace.';
  if (status === 'ahead') return 'You are ahead. Keep the next step small.';
  return 'Open one task. Leave everything else here.';
}

const HERO_GRADIENT =
  'linear-gradient(135deg, #eaf2e8 0%, #fbfdf8 55%, #f4e9dc 100%)';

export const HomeView: React.FC<HomeViewProps> = ({
  todayTasks,
  todayLabel,
  todayMomentum,
  focusTask,
  allTasks,
  onTaskClick,
  onToggleComplete,
  onFocusTask,
  userName,
  welcomed = true,
  onSaveName,
  intention = '',
  onIntentionChange,
}) => {
  const focusPace = focusTask ? getTaskPace(focusTask) : null;
  const greetingText = userName ? `${greeting()}, ${userName}` : greeting();
  const momentumPercent =
    todayMomentum.total > 0
      ? Math.round((todayMomentum.completed / todayMomentum.total) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {!welcomed && onSaveName && <WelcomeCard onSave={onSaveName} />}

      <section
        className="relative overflow-hidden rounded-3xl border border-[var(--line)] p-6 sm:p-8 shadow-sm"
        style={{ background: HERO_GRADIENT }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[var(--accent)]/10 blur-3xl" />

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
            label={`${todayMomentum.completed}/${todayMomentum.total}`}
            subLabel="today"
            className="hidden sm:inline-flex"
          />
        </div>

        {focusTask && focusPace ? (
          <div className="relative mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center rounded-2xl bg-[var(--surface)]/85 border border-[var(--line)] p-5">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)]">
                Focus next
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--ink)] mt-1 leading-snug">
                <DoodleTitle title={focusTask.title} size="lg" />
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {relativeDayLabel(focusTask.dueDate)}
                </span>
                <span className="text-[var(--faint)]">•</span>
                <span>{focusTask.progress}% complete</span>
                <Badge size="sm" variant={paceTone(focusPace.status)}>
                  {focusPace.label}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm" onClick={() => onFocusTask(focusTask)}>
                  <Maximize2 className="w-3.5 h-3.5" /> Start focus
                </Button>
                <span className="text-[11px] text-[var(--muted)]">{focusMessage(focusPace.status)}</span>
              </div>
            </div>
            <ProgressRing
              value={focusTask.progress}
              size={112}
              strokeWidth={8}
              label={`${focusTask.progress}%`}
              subLabel={`expected ${focusPace.expected}%`}
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
          <span className="text-xs font-mono text-[var(--muted)]">
            {todayMomentum.completed}/{todayMomentum.total} delivered today
          </span>
        </div>
      </section>

      {onIntentionChange && <IntentionBar value={intention} onSave={onIntentionChange} />}

      <section aria-labelledby="today-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 id="today-heading" className="text-lg font-bold text-[var(--ink)] tracking-tight">
              Today
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]">
              {todayTasks.items.length} of {todayTasks.totalCount}
            </span>
          </div>

          <Link
            to="/app/today"
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
          >
            Open queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayTasks.items.length > 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl divide-y divide-[var(--line)] shadow-xs overflow-hidden">
            {todayTasks.items.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onClick={onTaskClick}
                onToggleComplete={onToggleComplete}
                onFocus={onFocusTask}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center border border-dashed border-[var(--line)] rounded-xl bg-[var(--surface)]">
            <p className="text-xs text-[var(--muted)]">No tasks due today. You are fully caught up.</p>
          </div>
        )}
      </section>
    </div>
  );
};
