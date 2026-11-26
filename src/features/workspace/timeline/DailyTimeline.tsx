import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertCircle, PlayCircle, Maximize2, Minimize2 } from 'lucide-react';
import type { SampleTask } from '../../../data/sampleTasks';
import { WeatherPanel, getWeatherCondition } from './WeatherPanel';
import { setAtmosphereMinutes, useAtmosphereMinutes } from '../../../theme/atmosphere';

export interface DailyTimelineProps {
  tasks: SampleTask[];
  selectedDate: string; // YYYY-MM-DD
  onTaskClick: (task: SampleTask) => void;
  onToggleTask?: (task: SampleTask) => void;
  onUpdateTask?: (taskId: string, updates: Partial<SampleTask>) => void;
  isPreview?: boolean;
}

type NoticeKind = 'upcoming' | 'completion';
interface NoticeRecord { action: 'dismissed' | 'completed' | 'not_completed' | 'rescheduled'; at: string; }

type TimelineStatus = 'completed' | 'ongoing' | 'upcoming' | 'overdue';

interface TimelineItem {
  task: SampleTask;
  startMin: number;
  endMin: number;
  lane: number;
  top: boolean;
  status: TimelineStatus;
}

const HOURS = Array.from({ length: 25 }, (_, i) => i);
const DAY_MINUTES = 24 * 60;

function parseHHmm(value?: string): number | null {
  if (!value) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatHour(hour: number) {
  if (hour === 0 || hour === 24) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

function formatTime(totalMinutes: number) {
  // Round first so dragged fractional minutes never render as decimals.
  const mins = ((Math.round(totalMinutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatRange(startMin: number, endMin: number) {
  return `${formatTime(startMin)} - ${formatTime(endMin)}`;
}

function minutesToInputTime(totalMinutes: number) {
  const mins = ((Math.round(totalMinutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
}

function isValidTimeInput(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function getStatus(task: SampleTask, selectedDate: string, nowMin: number, isToday: boolean): TimelineStatus {
  if (task.state === 'completed') return 'completed';
  if (isToday) {
    const start = parseHHmm(task.startTime) ?? (parseHHmm(task.dueTime ?? task.endTime) ?? 0);
    const end = parseHHmm(task.endTime ?? task.dueTime) ?? start;
    const s = clamp(Math.min(start, end), 0, 1439);
    const e = clamp(Math.max(start, end), 0, 1439);
    if (nowMin >= s && nowMin <= e) return 'ongoing';
    if (nowMin > e) return 'overdue';
    return 'upcoming';
  }
  if (task.dueDate < selectedDate) return 'overdue';
  return 'upcoming';
}

function statusStyles(status: TimelineStatus) {
  switch (status) {
    case 'completed':
      return {
        segment: 'bg-[var(--green)]/80 border-[var(--green)]',
        segmentSoft: 'bg-[var(--green)]/15',
        dot: 'bg-[var(--green)] border-[var(--green)]',
        pill: 'bg-[var(--green-soft)] border-[var(--green)]/35 text-[var(--green)]',
        text: 'text-[var(--green)]',
        connector: 'bg-[var(--green)]/60',
        badge: 'Completed',
      };
    case 'ongoing':
      return {
        segment: 'bg-[var(--amber)]/85 border-[var(--amber)]',
        segmentSoft: 'bg-[var(--amber)]/15',
        dot: 'bg-[var(--amber)] border-[var(--amber)]',
        pill: 'bg-[var(--amber-soft)] border-[var(--amber)]/35 text-[var(--amber)]',
        text: 'text-[var(--amber)]',
        connector: 'bg-[var(--amber)]/70',
        badge: 'Ongoing',
      };
    case 'overdue':
      return {
        segment: 'bg-[var(--red)]/80 border-[var(--red)]',
        segmentSoft: 'bg-[var(--red)]/15',
        dot: 'bg-[var(--red)] border-[var(--red)]',
        pill: 'bg-[var(--red-soft)] border-[var(--red)]/35 text-[var(--red)]',
        text: 'text-[var(--red)]',
        connector: 'bg-[var(--red)]/60',
        badge: 'Overdue',
      };
    default:
      return {
        segment: 'bg-[var(--accent)]/80 border-[var(--accent)]',
        segmentSoft: 'bg-[var(--accent)]/12',
        dot: 'bg-[var(--accent)] border-[var(--accent)]',
        pill: 'bg-[var(--accent-soft)] border-[var(--accent)]/35 text-[var(--accent)]',
        text: 'text-[var(--accent)]',
        connector: 'bg-[var(--accent)]/45',
        badge: 'Upcoming',
      };
  }
}

function resolveTimeRange(task: SampleTask): { startMin: number; endMin: number } | null {
  const start = parseHHmm(task.startTime);
  const end = parseHHmm(task.endTime ?? task.dueTime);
  const due = parseHHmm(task.dueTime);

  let s = start;
  let e = end;

  if (s == null && e == null && due == null) return null;
  if (s == null && e != null) s = clamp(e - 60, 0, 1439);
  if (e == null && s != null) e = clamp(s + 60, 0, 1439);
  if (s == null && e == null && due != null) {
    e = due;
    s = clamp(due - 60, 0, 1439);
  }
  if (s == null || e == null) return null;
  s = clamp(s, 0, 1439);
  e = clamp(e, 0, 1439);
  if (e < s) e = clamp(s + 30, 0, 1439);
  if (e === s) e = clamp(s + 30, 0, 1439);
  return { startMin: s, endMin: e };
}

function getLocalDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ tasks, selectedDate, onTaskClick, onToggleTask, onUpdateTask, isPreview }) => {
  // TEMPORARY (testing): disable real-time clock alignment. Drag the indicator horizontally to test.
  const TEST_MODE = true;
  const testNowMin = useAtmosphereMinutes(); // shared demo time; starts at 12:00 PM
  const [now, setNow] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'overview' | 'focus'>('focus');
  const scrollRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const noticeStorageKey = `vido_timeline_notifications_${isPreview ? 'preview' : 'live'}`;
  const [noticeState, setNoticeState] = useState<Record<string, NoticeRecord>>(() => {
    try {
      const raw = localStorage.getItem(noticeStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed as Record<string, NoticeRecord>;
      }
    } catch { /* ignore */ }
    return {};
  });

  useEffect(() => {
    try { localStorage.setItem(noticeStorageKey, JSON.stringify(noticeState)); } catch { /* ignore */ }
  }, [noticeState, noticeStorageKey]);

  interface RescheduleDraft { date: string; start: string; end: string }
  const [rescheduleEditorKey, setRescheduleEditorKey] = useState<string | null>(null);
  const [rescheduleDraft, setRescheduleDraft] = useState<RescheduleDraft>({ date: selectedDate, start: '09:00', end: '10:00' });
  const [rescheduleError, setRescheduleError] = useState('');

  const beginReschedule = (key: string, task: SampleTask, startMin: number, endMin: number) => {
    setRescheduleDraft({
      date: task.dueDate || selectedDate,
      start: task.startTime || minutesToInputTime(startMin),
      end: task.endTime || minutesToInputTime(endMin),
    });
    setRescheduleError('');
    setRescheduleEditorKey(key);
  };

  const saveReschedule = (key: string, task: SampleTask) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rescheduleDraft.date) || !isValidTimeInput(rescheduleDraft.start) || !isValidTimeInput(rescheduleDraft.end)) {
      setRescheduleError('Enter a valid date and start/end times.');
      return;
    }
    if (rescheduleDraft.end <= rescheduleDraft.start) {
      setRescheduleError('End time must be after start time.');
      return;
    }
    onUpdateTask?.(task.id, {
      dueDate: rescheduleDraft.date,
      dueTime: rescheduleDraft.end,
      startTime: rescheduleDraft.start,
      endTime: rescheduleDraft.end,
    });
    setNoticeState((s) => ({ ...s, [key]: { action: 'rescheduled', at: new Date().toISOString() } }));
    setRescheduleEditorKey(null);
    setRescheduleError('');
  };

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 10000); // smooth periodic updates
    return () => window.clearInterval(id);
  }, []);

  const todayStr = getLocalDateStr(now);
  const isToday = TEST_MODE ? true : selectedDate === todayStr;
  const nowMin = TEST_MODE ? testNowMin : (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60);
  const isRaining = getWeatherCondition(nowMin) === 'raining';

  // Rain darkens the sky behind the timeline, so task cards need a high-contrast
  // black outline and black lettering to stay readable.
  const taskPillClass = (styles: ReturnType<typeof statusStyles>) =>
    isRaining
      ? 'bg-white/85 border-2 border-black text-black shadow-sm'
      : styles.pill;
  const taskConnectorClass = (styles: ReturnType<typeof statusStyles>) =>
    isRaining ? 'bg-black/70' : styles.connector;

  const setNowMinFromClientX = (clientX: number) => {
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setAtmosphereMinutes(ratio * DAY_MINUTES);
  };

  useEffect(() => {
    if (!TEST_MODE) return;
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      setNowMinFromClientX(e.clientX);
    };
    const onUp = () => { draggingRef.current = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [TEST_MODE]);

  const dayTasks = useMemo(
    () => tasks.filter((t) => !t.isArchived && t.dueDate === selectedDate),
    [tasks, selectedDate]
  );

  const { scheduled, unscheduled } = useMemo(() => {
    const scheduledItems: Array<{ task: SampleTask; startMin: number; endMin: number; status: TimelineStatus }> = [];
    const unscheduledItems: SampleTask[] = [];
    for (const task of dayTasks) {
      const range = resolveTimeRange(task);
      if (!range) {
        unscheduledItems.push(task);
        continue;
      }
      scheduledItems.push({
        task,
        ...range,
        status: getStatus(task, selectedDate, nowMin, isToday),
      });
    }
    scheduledItems.sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin || a.task.title.localeCompare(b.task.title));
    return { scheduled: scheduledItems, unscheduled: unscheduledItems };
  }, [dayTasks, selectedDate, nowMin, isToday]);

  const positioned: TimelineItem[] = useMemo(() => {
    const laneEnds: number[][] = [[], []]; // top, bottom
    const GAP = 75; // minutes, horizontal spacing for labels/segments

    return scheduled.map((item, idx) => {
      const preferTop = idx % 2 === 0;
      const sides = preferTop ? [0, 1] : [1, 0];
      let chosenSide = sides[0];
      let chosenLane = 0;

      for (const side of sides) {
        const ends = laneEnds[side];
        let lane = ends.findIndex((end) => item.startMin >= end + GAP);
        if (lane === -1) {
          if (ends.length < 4) {
            lane = ends.length;
            ends.push(item.endMin);
          } else {
            // pick lane with earliest end
            lane = ends.reduce((best, end, i, arr) => (end < arr[best] ? i : best), 0);
            ends[lane] = item.endMin;
          }
        } else {
          ends[lane] = item.endMin;
        }
        chosenSide = side;
        chosenLane = lane;
        // prefer first side if it fit without reusing a crowded lane badly; simple heuristic
        const fit = laneEnds[side][lane] === item.endMin;
        if (fit) break;
      }

      return {
        task: item.task,
        startMin: item.startMin,
        endMin: item.endMin,
        lane: chosenLane,
        top: chosenSide === 0,
        status: item.status,
      };
    });
  }, [scheduled]);

  const completedCount = dayTasks.filter((t) => t.state === 'completed').length;
  const scheduledCount = dayTasks.filter((t) => t.state !== 'cancelled').length;
  const pendingCount = Math.max(0, scheduledCount - completedCount);
  const completionPct = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

  // Small EOD box: active day tasks whose scheduled end has already passed at the dragged time.
  const pendingEndOfDayTasks = isToday
    ? scheduled
        .filter((item) => item.task.state === 'active' && item.endMin <= nowMin)
        .sort((a, b) => a.endMin - b.endMin)
    : dayTasks
        .filter((t) => t.state === 'active' && t.dueDate < selectedDate)
        .map((t) => ({ task: t, startMin: 0, endMin: 0 }));

  const ongoingTask = isToday ? positioned.find((p) => nowMin >= p.startMin && nowMin <= p.endMin && p.status === 'ongoing') : null;
  const isFreeTime = isToday && !ongoingTask && !positioned.some((p) => nowMin >= p.startMin && nowMin <= p.endMin);

  const activeNotices = useMemo(() => {
    if (!isToday) return [] as Array<{ kind: NoticeKind; task: TimelineItem; next: TimelineItem | null; key: string; minutes?: number }>;
    const notices: Array<{ kind: NoticeKind; task: TimelineItem; next: TimelineItem | null; key: string; minutes?: number }> = [];
    const activeItems = positioned.filter((p) => p.task.state !== 'completed' && p.task.state !== 'cancelled');
    for (let i = 0; i < activeItems.length; i++) {
      const item = activeItems[i];
      const next = activeItems[i + 1] ?? null;
      const endMin = item.endMin;
      const minsToEnd = endMin - nowMin;
      const upcomingKey = `${selectedDate}|${item.task.id}|upcoming|${endMin}`;
      const completionKey = `${selectedDate}|${item.task.id}|completion|${endMin}`;

      if (minsToEnd > 0 && minsToEnd <= 10 && nowMin >= item.startMin && !noticeState[upcomingKey]) {
        notices.push({ kind: 'upcoming', task: item, next, key: upcomingKey, minutes: Math.ceil(minsToEnd) });
      }
      if (nowMin >= endMin && !noticeState[completionKey]) {
        notices.push({ kind: 'completion', task: item, next, key: completionKey });
      }
    }

    // Also notify when free time and next task starts within 10 minutes
    const nextStarting = activeItems.find((p) => p.startMin > nowMin && p.startMin - nowMin <= 10);
    if (nextStarting) {
      const minsToStart = Math.ceil(nextStarting.startMin - nowMin);
      const startKey = `${selectedDate}|${nextStarting.task.id}|upcoming-start|${nextStarting.startMin}`;
      if (!noticeState[startKey] && !notices.some((n) => n.key.includes(nextStarting.task.id) && n.kind === 'upcoming')) {
        notices.unshift({ kind: 'upcoming', task: nextStarting, next: nextStarting, key: startKey, minutes: minsToStart });
      }
    }
    return notices.slice(0, 2);
  }, [isToday, positioned, nowMin, selectedDate, noticeState]);

  useEffect(() => {
    if (viewMode !== 'focus') return;
    const el = scrollRef.current;
    if (!el) return;
    const targetMin = isToday
      ? nowMin
      : scheduled.length
        ? (Math.min(...scheduled.map((s) => s.startMin)) + Math.max(...scheduled.map((s) => s.endMin))) / 2
        : 12 * 60;
    const targetPct = targetMin / DAY_MINUTES;
    const scrollToTarget = () => {
      const contentW = el.scrollWidth;
      if (!contentW) return;
      const left = targetPct * contentW - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
    };
    // wait a frame for layout
    const raf = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(raf);
  }, [viewMode, selectedDate, isToday]);

  return (
    <div>
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-xs overflow-hidden">
        {/* Compact progress list, kept at the very top of the timeline box. */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-[var(--line)] bg-[var(--canvas)]/40 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-[var(--muted)]">
          <span>Scheduled <strong className="text-[var(--ink)]">{scheduledCount}</strong></span>
          <span className="text-[var(--green)]">Completed <strong>{completedCount}</strong></span>
          <span className="text-[var(--amber)]">Pending <strong>{pendingCount}</strong></span>
          <span className="inline-flex items-center gap-2">Completion <strong className="text-[var(--accent)]">{completionPct}%</strong>
            <span className="inline-block w-16 h-1.5 rounded-full bg-[var(--line)] overflow-hidden align-middle">
              <span className="block h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </span>
          </span>
        </div>

        <div className="px-4 sm:px-5 py-3 border-b border-[var(--line)] bg-[var(--canvas)]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]/80" /> Upcoming</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--amber)]/85" /> Ongoing</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--green)]/80" /> Completed</span>
            <span className="inline-flex items-center gap-1.5 text-[var(--muted)]"><span className="w-2.5 h-2.5 rounded-sm bg-[var(--red)]/80" /> Overdue</span>
            {isToday && (
              <span className="inline-flex items-center gap-1.5 text-[var(--red)] font-semibold">
                <span className="w-0.5 h-3.5 bg-[var(--red)] rounded-full" /> Live time {formatTime(nowMin)}
              </span>
            )}
            {isFreeTime && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/35 font-semibold">
                Free time now
              </span>
            )}
            {ongoingTask && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--amber-soft)] text-[var(--amber)] border border-[var(--amber)]/35 font-semibold">
                Ongoing: {ongoingTask.task.title}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface)] p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('focus')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${viewMode === 'focus' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
                aria-pressed={viewMode === 'focus'}
              >
                <Maximize2 className="w-3.5 h-3.5" /> Focused
              </button>
              <button
                type="button"
                onClick={() => setViewMode('overview')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${viewMode === 'overview' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)] hover:text-[var(--ink)]'}`}
                aria-pressed={viewMode === 'overview'}
              >
                <Minimize2 className="w-3.5 h-3.5" /> Full 24h
              </button>
            </div>
          </div>
        </div>

        {activeNotices.length > 0 && (
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--line)] bg-[var(--canvas)]/30 space-y-2">
            {activeNotices.map((notice) => {
              const isUpcoming = notice.kind === 'upcoming';
              const isStartNotice = notice.key.includes('|upcoming-start|');
              const mins = notice.minutes ?? Math.max(0, Math.ceil(notice.task.endMin - nowMin));
              const nextText = notice.next && !isStartNotice
                ? `Your next task, ${notice.next.task.title}, starts at ${formatTime(notice.next.startMin)}.`
                : !isStartNotice ? 'Your next time slot is free.' : '';
              return (
                <div key={notice.key} className={`rounded-xl border px-3.5 py-3 text-xs ${isUpcoming ? 'bg-[var(--amber-soft)] border-[var(--amber)]/35 text-[var(--amber)]' : 'bg-[var(--accent-soft)] border-[var(--accent)]/35 text-[var(--accent)]'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-bold mb-0.5">{isUpcoming ? 'Upcoming task alert' : 'Task completion check'}</div>
                      <p className="leading-relaxed">
                        {isUpcoming
                          ? isStartNotice
                            ? `Your next task, ${notice.task.task.title}, starts in ${mins} minute${mins === 1 ? '' : 's'} at ${formatTime(notice.task.startMin)}.`
                            : `${notice.task.task.title} is ending in ${mins} minute${mins === 1 ? '' : 's'}. ${nextText}`
                          : `Did you complete "${notice.task.task.title}" (scheduled until ${formatTime(notice.task.endMin)})?`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {isUpcoming ? (
                        <button
                          type="button"
                          onClick={() => setNoticeState((s) => ({ ...s, [notice.key]: { action: 'dismissed', at: new Date().toISOString() } }))}
                          className="px-3 py-1.5 rounded-lg border border-[var(--amber)]/40 bg-[var(--surface)] hover:bg-[var(--canvas)] font-semibold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              if (onToggleTask && notice.task.task.state !== 'completed') onToggleTask(notice.task.task);
                              setNoticeState((s) => ({ ...s, [notice.key]: { action: 'completed', at: new Date().toISOString() } }));
                            }}
                            className="px-3 py-1.5 rounded-lg border border-[var(--green)]/40 bg-[var(--green)] text-[var(--on-accent)] hover:opacity-90 font-semibold cursor-pointer"
                          >
                            ✓ Completed
                          </button>
                          <button
                            type="button"
                            onClick={() => setNoticeState((s) => ({ ...s, [notice.key]: { action: 'not_completed', at: new Date().toISOString() } }))}
                            className="px-3 py-1.5 rounded-lg border border-[var(--red)]/35 bg-[var(--surface)] text-[var(--red)] hover:bg-[var(--canvas)] font-semibold cursor-pointer"
                          >
                            ✕ Not Completed
                          </button>
                          <button
                            type="button"
                            onClick={() => beginReschedule(notice.key, notice.task.task, notice.task.startMin, notice.task.endMin)}
                            className="px-3 py-1.5 rounded-lg border border-[var(--accent)]/35 bg-[var(--surface)] text-[var(--accent)] hover:bg-[var(--canvas)] font-semibold cursor-pointer"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                    </div>

                    {rescheduleEditorKey === notice.key && (
                      <div className="mt-3 rounded-xl border border-[var(--accent)]/35 bg-[var(--surface)] p-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-2">Reschedule task</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <label className="text-[10px] text-[var(--muted)]">Date
                            <input
                              type="date"
                              value={rescheduleDraft.date}
                              onChange={(e) => setRescheduleDraft((d) => ({ ...d, date: e.target.value }))}
                              className="mt-0.5 w-full px-2 py-1.5 text-xs rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                            />
                          </label>
                          <label className="text-[10px] text-[var(--muted)]">Start
                            <input
                              type="time"
                              value={rescheduleDraft.start}
                              onChange={(e) => setRescheduleDraft((d) => ({ ...d, start: e.target.value }))}
                              className="mt-0.5 w-full px-2 py-1.5 text-xs rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                            />
                          </label>
                          <label className="text-[10px] text-[var(--muted)]">End
                            <input
                              type="time"
                              value={rescheduleDraft.end}
                              onChange={(e) => setRescheduleDraft((d) => ({ ...d, end: e.target.value }))}
                              className="mt-0.5 w-full px-2 py-1.5 text-xs rounded-md border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]"
                            />
                          </label>
                        </div>
                        {rescheduleError && <div className="mt-1.5 text-[10px] text-[var(--red)]">{rescheduleError}</div>}
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveReschedule(notice.key, notice.task.task)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md bg-[var(--accent)] text-white hover:opacity-90 cursor-pointer"
                          >
                            Save schedule
                          </button>
                          <button
                            type="button"
                            onClick={() => { setRescheduleEditorKey(null); setRescheduleError(''); }}
                            className="px-2.5 py-1.5 text-[11px] font-semibold rounded-md border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="relative">
          <WeatherPanel minutes={nowMin} />
          <div ref={scrollRef} className="relative z-10 overflow-x-auto">
          <div className={`${viewMode === 'focus' ? 'min-w-[2800px]' : 'min-w-[1100px]'} px-6 sm:px-8 py-6 transition-[min-width] duration-200`}>
            <div className="relative" ref={timelineRef}>
              {isToday && (
                <div
                  className="absolute top-0 bottom-0 z-20 pointer-events-none"
                  style={{ left: `${(nowMin / DAY_MINUTES) * 100}%` }}
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-y-0 -translate-x-1/2 w-[10px] cursor-ew-resize pointer-events-auto"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      draggingRef.current = true;
                      setNowMinFromClientX(e.clientX);
                    }}
                    title="Drag to test time"
                  >
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-[var(--red)]/90 shadow-[0_0_0_1px_var(--atmo-haze)]" />
                  </div>
                  <div className="absolute top-0 -translate-x-1/2 -translate-y-full mb-1 pointer-events-auto cursor-ew-resize"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      draggingRef.current = true;
                      setNowMinFromClientX(e.clientX);
                    }}
                  >
                    <div className="px-1.5 py-0.5 rounded-md bg-[var(--red)] text-[var(--on-accent)] text-[10px] font-mono font-bold whitespace-nowrap shadow-sm">
                      {formatTime(nowMin)}
                    </div>
                  </div>
                </div>
              )}
            <div className="relative h-[190px] mb-1">
              {positioned.filter((p) => p.top).map((p) => {
                const left = (p.startMin / DAY_MINUTES) * 100;
                const width = Math.max(((p.endMin - p.startMin) / DAY_MINUTES) * 100, 0.8);
                const mid = left + width / 2;
                const bottom = 10 + p.lane * 56;
                const styles = statusStyles(p.status);
                return (
                  <div key={p.task.id} className="absolute" style={{ left: `${mid}%`, bottom: `${bottom}px`, transform: 'translateX(-50%)' }}>
                    <button
                      type="button"
                      onClick={() => onTaskClick(p.task)}
                      className={`block w-[190px] max-w-[190px] text-left px-2.5 py-2 rounded-xl border backdrop-blur-xs shadow-2xs hover:shadow-sm transition-all cursor-pointer ${taskPillClass(styles)}`}
                      data-rainy-task={isRaining ? 'true' : undefined}
                      title={`${p.task.title} (${formatRange(p.startMin, p.endMin)})`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono opacity-80 mb-1">
                        <span>{formatRange(p.startMin, p.endMin)}</span>
                        {p.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : p.status === 'ongoing' ? <PlayCircle className="w-3 h-3" /> : p.status === 'overdue' ? <AlertCircle className="w-3 h-3" /> : null}
                      </div>
                      <div className={`text-[11px] font-semibold leading-snug line-clamp-2 ${p.task.state === 'completed' ? 'line-through opacity-75' : ''}`}>
                        {p.task.title}
                      </div>
                    </button>
                    <div className={`w-px mx-auto ${taskConnectorClass(styles)}`} style={{ height: `${20 + p.lane * 8}px` }} />
                  </div>
                );
              })}
            </div>

            <div className="relative h-20 select-none">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[4px] rounded-full bg-gradient-to-r from-[var(--line)] via-[var(--accent)]/25 to-[var(--line)]" />

              {HOURS.map((hour) => {
                const left = (hour / 24) * 100;
                const major = hour % 3 === 0 || hour === 24;
                return (
                  <div key={hour} className="absolute top-1/2" style={{ left: `${left}%`, transform: 'translate(-50%, -50%)' }}>
                    <div className={`w-px ${major ? 'h-6 bg-[var(--muted)]/55' : 'h-3 bg-[var(--line)]'}`} />
                    {major && (
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[var(--muted)] whitespace-nowrap">
                        {formatHour(hour)}
                      </div>
                    )}
                  </div>
                );
              })}

              {positioned.map((p) => {
                const left = (p.startMin / DAY_MINUTES) * 100;
                const width = Math.max(((p.endMin - p.startMin) / DAY_MINUTES) * 100, 0.7);
                const styles = statusStyles(p.status);
                return (
                  <button
                    key={`seg-${p.task.id}`}
                    type="button"
                    aria-label={`${p.task.title}, ${formatRange(p.startMin, p.endMin)}, ${styles.badge}`}
                    onClick={() => onTaskClick(p.task)}
                    className={`absolute top-1/2 -translate-y-1/2 h-3 rounded-full border shadow-xs hover:h-4 hover:z-10 transition-all cursor-pointer ${styles.segment}`}
                    style={{ left: `${left}%`, width: `${width}%`, minWidth: '10px' }}
                    title={`${p.task.title}\n${formatRange(p.startMin, p.endMin)}\n${styles.badge}`}
                  />
                );
              })}


            </div>

            <div className="relative h-[190px] mt-1">
              {positioned.filter((p) => !p.top).map((p) => {
                const left = (p.startMin / DAY_MINUTES) * 100;
                const width = Math.max(((p.endMin - p.startMin) / DAY_MINUTES) * 100, 0.8);
                const mid = left + width / 2;
                const top = 10 + p.lane * 56;
                const styles = statusStyles(p.status);
                return (
                  <div key={p.task.id} className="absolute" style={{ left: `${mid}%`, top: `${top}px`, transform: 'translateX(-50%)' }}>
                    <div className={`w-px mx-auto ${taskConnectorClass(styles)}`} style={{ height: `${20 + p.lane * 8}px` }} />
                    <button
                      type="button"
                      onClick={() => onTaskClick(p.task)}
                      className={`block w-[190px] max-w-[190px] text-left px-2.5 py-2 rounded-xl border backdrop-blur-xs shadow-2xs hover:shadow-sm transition-all cursor-pointer ${taskPillClass(styles)}`}
                      data-rainy-task={isRaining ? 'true' : undefined}
                      title={`${p.task.title} (${formatRange(p.startMin, p.endMin)})`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono opacity-80 mb-1">
                        <span>{formatRange(p.startMin, p.endMin)}</span>
                        {p.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : p.status === 'ongoing' ? <PlayCircle className="w-3 h-3" /> : p.status === 'overdue' ? <AlertCircle className="w-3 h-3" /> : null}
                      </div>
                      <div className={`text-[11px] font-semibold leading-snug line-clamp-2 ${p.task.state === 'completed' ? 'line-through opacity-75' : ''}`}>
                        {p.task.title}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            </div>
          </div>
          </div>

          {pendingEndOfDayTasks.length > 0 && (
            <div className="absolute left-3 top-3 z-30 w-[220px] max-w-[calc(100%-1.5rem)] rounded-xl border border-[var(--amber)]/35 bg-[var(--surface)] p-2.5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--amber)]">Pending at end of day</span>
                <span className="text-[10px] font-mono text-[var(--amber)]">{pendingEndOfDayTasks.length}</span>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
                {pendingEndOfDayTasks.map((item) => (
                  <button
                    key={item.task.id}
                    type="button"
                    onClick={() => onTaskClick(item.task)}
                    className="block w-full text-left rounded-md px-1.5 py-1 hover:bg-[var(--canvas)] cursor-pointer"
                    title={`Open ${item.task.title}`}
                  >
                    <span className="block truncate text-[11px] font-semibold text-[var(--ink)]">{item.task.title}</span>
                    <span className="text-[9px] text-[var(--muted)] font-mono">
                      {isToday ? `Ended ${formatTime(item.endMin)}` : item.task.dueDate}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {unscheduled.length > 0 && (
          <div className="px-4 sm:px-5 py-3 border-t border-[var(--line)] bg-[var(--canvas)]/20 flex items-center justify-between gap-3 text-[11px] text-[var(--muted)]">
            <span><strong className="text-[var(--ink)]">{unscheduled.length}</strong> unscheduled task{unscheduled.length === 1 ? '' : 's'} for this day</span>
            <span className="text-[var(--faint)]">Assign a time slot from the Unscheduled Tasks section.</span>
          </div>
        )}
      </div>
    </div>
  );
};