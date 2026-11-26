import React, { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  addMonths,
  compareEvents,
  formatLongDate,
  formatMonthLabel,
  formatWeekRange,
  getMonthGrid,
  getWeekDays,
  isSameMonth,
  weekdayLabel,
  type CalendarEvent,
} from '../../../data/calendar';
import type { SampleTask } from '../../../data/sampleTasks';
import { Button, Input } from '../../../components/ui';
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Link2,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

type CalendarItem =
  | { kind: 'task'; date: string; time?: string; task: SampleTask }
  | { kind: 'event'; date: string; time?: string; event: CalendarEvent };

export interface CalendarViewProps {
  tasks: SampleTask[];
  events: CalendarEvent[];
  onCreateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  onCreateTask: (task: SampleTask) => void;
  onTaskClick: (task: SampleTask) => void;
  referenceDate: string;
  mode: 'demo' | 'live';
}

const EventDialog: React.FC<{
  event: CalendarEvent;
  onClose: () => void;
  onImport: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}> = ({ event, onClose, onImport, onDelete }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label={`Calendar event: ${event.title}`}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Close calendar event"
        onClick={onClose}
        className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30">
          Planning calendar
        </span>
        {event.linkedTaskId && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/30 flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Linked task
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-[var(--ink)] pr-6">{event.title}</h3>
      <p className="text-xs text-[var(--muted)] mt-1">
        {formatLongDate(event.date)}
        {event.time ? ` ┬À ${event.time}${event.endTime ? `ÔÇô${event.endTime}` : ''}` : ''}
      </p>
      {event.description && (
        <p className="text-xs text-[var(--ink)] mt-3 leading-relaxed">{event.description}</p>
      )}

      <div className="mt-5 pt-4 border-t border-[var(--line)] flex flex-wrap gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={() => onDelete(event.id)}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove event
        </Button>
        <Button variant="primary" size="sm" onClick={() => onImport(event)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add as task
        </Button>
      </div>
    </div>
  </div>
);

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  events,
  onCreateEvent,
  onDeleteEvent,
  onCreateTask,
  onTaskClick,
  referenceDate,
  mode,
}) => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [cursor, setCursor] = useState(referenceDate);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [draft, setDraft] = useState({
    title: '',
    date: referenceDate,
    time: '09:00',
    description: '',
  });

  useEffect(() => {
    setCursor(referenceDate);
    setDraft((prev) => ({ ...prev, date: referenceDate }));
  }, [referenceDate]);

  const days = useMemo(
    () => (period === 'week' ? getWeekDays(cursor) : getMonthGrid(cursor)),
    [period, cursor]
  );

  const visibleEvents = useMemo(
    () => [...events].sort(compareEvents),
    [events]
  );

  const itemsForDay = (date: string): CalendarItem[] => {
    const taskItems: CalendarItem[] = tasks
      .filter((task) => !task.isArchived && task.dueDate === date)
      .map((task) => ({
        kind: 'task',
        date,
        time: task.dueTime,
        task,
      }));
    const eventItems: CalendarItem[] = visibleEvents
      .filter((event) => event.date === date)
      .map((event) => ({ kind: 'event', date, time: event.time, event }));

    return [...taskItems, ...eventItems].sort((a, b) =>
      (a.time ?? '23:59').localeCompare(b.time ?? '23:59')
    );
  };

  const step = (direction: number) => {
    setCursor((prev) =>
      period === 'week'
        ? addDays(prev, direction * 7)
        : addMonths(prev, direction)
    );
  };

  const periodLabel =
    period === 'week'
      ? formatWeekRange(cursor)
      : formatMonthLabel(cursor);

  const addTaskToCalendar = (task: SampleTask) => {
    onCreateEvent({
      id: `event-from-task-${task.id}-${Date.now()}`,
      title: task.title,
      date: task.dueDate,
      time: task.dueTime,
      description: task.description,
      source: 'calendar',
      linkedTaskId: task.id,
    });
  };

  const importEventAsTask = (event: CalendarEvent) => {
    onCreateTask({
      id: `task-from-event-${Date.now()}`,
      title: event.title,
      description: event.description,
      dueDate: event.date,
      dueTime: event.time,
      state: 'active',
      category: 'work',
      createdAt: new Date().toISOString(),
      checkpoints: [
        {
          id: `cp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          note: 'Imported from calendar.',
        },
      ],
    });
    setSelectedEvent(null);
  };

  const submitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    onCreateEvent({
      id: `event-${Date.now()}`,
      title: draft.title.trim(),
      date: draft.date || referenceDate,
      time: draft.time || undefined,
      description: draft.description.trim() || undefined,
      source: 'calendar',
    });
    setDraft({ title: '', date: draft.date, time: '09:00', description: '' });
    setIsAddOpen(false);
  };

  const renderItem = (item: CalendarItem, compact = false) => {
    const isTask = item.kind === 'task';
    const title = isTask ? item.task.title : item.event.title;
    return (
      <div
        key={`${item.kind}-${isTask ? item.task.id : item.event.id}`}
        className={`rounded-md border-l-2 px-1.5 py-1 flex items-start gap-1 ${
          isTask
            ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
            : 'bg-[var(--accent-soft)] border-[var(--accent)]'
        }`}
      >
        <button
          type="button"
          onClick={() =>
            isTask
              ? onTaskClick(item.task)
              : setSelectedEvent((item as { kind: 'event'; event: CalendarEvent }).event)
          }
          aria-label={`${isTask ? 'Task' : 'Calendar event'}: ${title}`}
          className="min-w-0 flex-1 text-left cursor-pointer"
        >
          <span
            className={`block text-[10px] font-semibold truncate leading-tight ${
              isTask
                ? 'text-[var(--ink)]'
                : 'text-[var(--accent)]'
            }`}
          >
            {title}
          </span>
          {!compact && (
            <span className="block text-[9px] text-[var(--muted)] mt-0.5">
              {item.time ?? 'All day'} ┬À {isTask ? 'Task' : 'Calendar'}
            </span>
          )}
        </button>
        {isTask && (
          <button
            type="button"
            onClick={() => addTaskToCalendar(item.task)}
            aria-label={`Add ${title} to calendar`}
            title="Add to calendar"
            className="shrink-0 p-0.5 rounded text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface)] cursor-pointer"
          >
            <CalendarPlus className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--ink)]">Planning Calendar</h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Tasks and calendar commitments in one place. Weekly and monthly views.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Calendar period"
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
            {periodLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 bg-[var(--surface)] border-[var(--line)]">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarPlus className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[var(--ink)]">Planning calendar</p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">
              {mode === 'live'
                ? 'Events are saved per user in Firestore. Add tasks to the calendar or import events as tasks.'
                : 'Demo events are stored in this browser. Add tasks to the calendar or import events as tasks.'}
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add event
        </Button>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" /> ViDo task
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent)]" /> Calendar event
        </span>
        <span className="hidden sm:inline">Select a day to inspect its items.</span>
      </div>

      <div className="overflow-x-auto pb-2">
        {period === 'week' ? (
          <div className="grid grid-cols-7 gap-2 min-w-[840px]">
            {days.map((day) => {
              const items = itemsForDay(day);
              const isReferenceDay = day === referenceDate;
              return (
                <section
                  key={day}
                  aria-label={formatLongDate(day)}
                  className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-2 min-h-[220px]"
                >
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      {weekdayLabel(day)} {Number(day.slice(-2))}
                    </span>
                    {isReferenceDay && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent)] text-white">
                        TODAY
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {items.length === 0 && (
                      <p className="text-[10px] text-[var(--faint)] px-0.5">No items</p>
                    )}
                    {items.map((item) => renderItem(item))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-px bg-[var(--line)] border border-[var(--line)] min-w-[840px]">
            {days.map((day) => {
              const items = itemsForDay(day);
              const inMonth = isSameMonth(day, cursor);
              return (
                <section
                  key={day}
                  aria-label={formatLongDate(day)}
                  className={`bg-[var(--surface)] min-h-[110px] p-1.5 ${
                    inMonth ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold ${
                        day === referenceDate
                          ? 'w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center'
                          : 'text-[var(--muted)]'
                      }`}
                    >
                      {Number(day.slice(-2))}
                    </span>
                    <button
                      type="button"
                      aria-label={`Open week of ${formatLongDate(day)}`}
                      onClick={() => {
                        setCursor(day);
                        setPeriod('week');
                      }}
                      className="text-[9px] text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      Week
                    </button>
                  </div>
                  <div className="space-y-1">
                    {items.slice(0, 3).map((item) => renderItem(item, true))}
                    {items.length > 3 && (
                      <p className="text-[9px] text-[var(--muted)] pl-1">
                        +{items.length - 3} more
                      </p>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {isAddOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add calendar event"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close add event"
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-[var(--ink)]">Add calendar event</h3>
            <p className="text-xs text-[var(--muted)] mt-1 mb-4">
              Saved to your planning calendar.
            </p>
            <form onSubmit={submitEvent} className="space-y-3">
              <Input
                label="Event title *"
                required
                value={draft.title}
                placeholder="e.g., Project kickoff"
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))}
                />
                <Input
                  label="Time"
                  type="time"
                  value={draft.time}
                  onChange={(e) => setDraft((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <Input
                label="Description"
                value={draft.description}
                placeholder="Optional context"
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Save event
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onImport={importEventAsTask}
          onDelete={(id) => {
            onDeleteEvent(id);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};
