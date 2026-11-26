import React, { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  formatMonthLabel,
  formatWeekRange,
  getWeekDays,
  weekdayLabel,
} from '../../../data/calendar';
import {
  computeMonthStats,
  computeWeekStats,
  isTargetReached,
  type PlanningTargets,
  type PeriodStats,
} from '../../../data/analytics';
import type { SampleTask } from '../../../data/sampleTasks';
import { ChevronLeft, ChevronRight, Target, TrendingUp } from 'lucide-react';

const ProgressBar: React.FC<{
  label: string;
  value: number;
  tone?: 'accent' | 'emerald';
}> = ({ label, value, tone = 'accent' }) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    className="h-2 w-full rounded-full bg-[var(--line)] overflow-hidden"
  >
    <div
      className={`h-full rounded-full transition-all ${
        tone === 'emerald' ? 'bg-[var(--green)]' : 'bg-[var(--accent)]'
      }`}
      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
    />
  </div>
);

const StatCard: React.FC<{ label: string; value: string | number; hint?: string }> = ({
  label,
  value,
  hint,
}) => (
  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
      {label}
    </p>
    <p className="text-xl font-extrabold text-[var(--ink)] mt-1">{value}</p>
    {hint && <p className="text-[10px] text-[var(--faint)] mt-0.5">{hint}</p>}
  </div>
);

export interface AnalyticsViewProps {
  tasks: SampleTask[];
  targets: PlanningTargets;
  onTargetsChange: (targets: PlanningTargets) => void;
  referenceDate: string;
  mode: 'demo' | 'live';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  targets,
  onTargetsChange,
  referenceDate,
  mode,
}) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [cursor, setCursor] = useState(referenceDate);

  useEffect(() => {
    setCursor(referenceDate);
  }, [referenceDate]);

  const week = useMemo(
    () => computeWeekStats(tasks, cursor, targets.weekly),
    [tasks, cursor, targets.weekly]
  );
  const month = useMemo(
    () => computeMonthStats(tasks, cursor, targets.monthly),
    [tasks, cursor, targets.monthly]
  );

  const active: PeriodStats = period === 'week' ? week : month;
  const reached = isTargetReached(active);

  const step = (direction: number) => {
    setCursor((prev) =>
      period === 'week'
        ? addDays(prev, direction * 7)
        : addMonths(prev, direction)
    );
  };

  const changeTarget = (field: keyof PlanningTargets, value: string) => {
    const parsed = Number(value);
    const next = Math.max(1, Number.isFinite(parsed) ? Math.round(parsed) : 1);
    onTargetsChange({ ...targets, [field]: next });
  };

  const daily = period === 'week' ? getWeekDays(cursor) : [];

  return (
    <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)]">Completion Analytics</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Weekly completion, personal targets, and cumulative monthly goal tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Analytics period"
            className="inline-flex rounded-lg border border-[var(--line)] overflow-hidden"
          >
            {(['week', 'month'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={period === option}
                onClick={() => setPeriod(option)}
                className={`px-3 py-1.5 text-xs font-semibold capitalize cursor-pointer transition-colors ${
                  period === option
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--canvas)]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`Previous ${period}`}
              onClick={() => step(-1)}
              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor(referenceDate)}
              className="px-2.5 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--canvas)] cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              aria-label={`Next ${period}`}
              onClick={() => step(1)}
              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-mono font-semibold text-[var(--muted)] min-w-[150px] text-center">
            {period === 'week' ? formatWeekRange(cursor) : formatMonthLabel(cursor)}
          </span>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {period === 'week' ? 'Weekly task completion' : 'Monthly goal progress'}
              </p>
              {reached && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30">
                  Target reached
                </span>
              )}
            </div>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-4xl font-extrabold text-[var(--ink)]">
                {active.completionPercentage}%
              </span>
              <span className="text-xs text-[var(--muted)] pb-1.5">
                {active.completed} of {active.planned} planned tasks completed
              </span>
            </div>
          </div>

          <div className="sm:w-64">
            <label
              htmlFor={`target-${period}`}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              {period === 'week' ? 'Weekly target' : 'Monthly goal'}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`target-${period}`}
                type="number"
                min={1}
                value={period === 'week' ? targets.weekly : targets.monthly}
                onChange={(e) =>
                  changeTarget(period === 'week' ? 'weekly' : 'monthly', e.target.value)
                }
                className="w-24 px-3 py-1.5 text-sm bg-[var(--canvas)] border border-[var(--line)] rounded-lg text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              />
              <span className="text-xs text-[var(--muted)]">tasks to complete</span>
            </div>
            <p className="text-[10px] text-[var(--faint)] mt-1">
              {mode === 'live'
                ? 'Saved to Firestore for this account.'
                : 'Saved in this browser for the demo.'}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-[var(--ink)]">
                Completion against planned work
              </span>
              <span className="font-mono text-[var(--muted)]">
                {active.completionPercentage}%
              </span>
            </div>
            <ProgressBar
              label={`${period} completion against planned work`}
              value={active.completionPercentage}
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-[var(--ink)]">
                Target achievement ({active.completed}/{active.target})
              </span>
              <span className="font-mono text-[var(--muted)]">
                {active.targetPercentage}%
              </span>
            </div>
            <ProgressBar
              label={`${period} target achievement`}
              value={active.targetPercentage}
              tone="emerald"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <StatCard label="Planned" value={active.planned} hint="Tasks due in period" />
          <StatCard label="Completed" value={active.completed} hint="Finished tasks" />
          <StatCard label="Remaining" value={active.remaining} hint="Still open" />
          <StatCard label="Target" value={active.target} hint="Your goal" />
        </div>
      </section>

      {period === 'week' ? (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[var(--ink)]">Daily workload</h3>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            Tasks scheduled on each day of the selected week.
          </p>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {daily.map((day) => {
              const dayTasks = tasks.filter(
                (task) => !task.isArchived && task.dueDate === day
              );
              const completed = dayTasks.filter(
                (task) => task.state === 'completed'
              ).length;
              return (
                <div key={day} className="text-center">
                  <p className="text-[10px] font-bold uppercase text-[var(--muted)]">
                    {weekdayLabel(day)}
                  </p>
                  <div
                    className="mt-2 mx-auto w-8 rounded-t-md bg-[var(--accent)]/25 flex items-end justify-center"
                    style={{ height: `${Math.max(8, dayTasks.length * 14)}px` }}
                    aria-label={`${dayTasks.length} tasks on ${day}`}
                  >
                    <span className="text-[10px] font-bold text-[var(--ink)] pb-0.5">
                      {dayTasks.length}
                    </span>
                  </div>
                  <p className="text-[9px] text-[var(--green)] mt-1 font-semibold">
                    {completed} done
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
          <h3 className="text-sm font-bold text-[var(--ink)]">
            Weekly contributions to the monthly goal
          </h3>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            Each week's completions roll up into the cumulative monthly total.
          </p>
          <div className="mt-4 space-y-3">
            {month.weeks.map((item, index) => (
              <div key={item.start} className="grid grid-cols-[110px_1fr_70px] gap-3 items-center">
                <span className="text-[10px] font-mono text-[var(--muted)] truncate">
                  {item.label}
                </span>
                <ProgressBar
                  label={`Week ${index + 1} completion`}
                  value={item.completionPercentage}
                />
                <span className="text-[10px] font-mono text-[var(--ink)] text-right">
                  {item.completed}/{item.planned} · {month.cumulativeCompleted[index]} total
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--line)]">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="font-semibold text-[var(--ink)]">
                Cumulative monthly target ({month.completed}/{targets.monthly})
              </span>
              <span className="font-mono text-[var(--muted)]">
                {month.targetPercentage}%
              </span>
            </div>
            <ProgressBar
              label="Cumulative monthly target"
              value={month.targetPercentage}
              tone="emerald"
            />
          </div>
        </section>
      )}
    </div>
  );
};
