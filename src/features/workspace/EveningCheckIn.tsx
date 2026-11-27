import React, { useEffect, useMemo, useState } from 'react';
import type { Task } from '../../data/taskTypes';
import type { EveningCheckIn as EveningCheckInRecord, MoodWord, TimeLogEntry } from '../../data/journalTypes';
import { MOOD_WORDS } from '../../data/journalTypes';
import { followUpQuestions, TIME_CHIPS } from '../../data/nightlyReview';
import { analyseNote } from '../../../intelligent-layer/evening-review';
import { timeVerdict } from '../../data/timeVerdict';
import { saveEveningCheckIn } from '../../lib/journalStore';
import { saveIntention } from '../../lib/welcomeStore';
import { addDays, parseDateKey, toDateKey } from '../../data/taskDates';
import { Button } from '../../components/ui';
import { Moon, X } from 'lucide-react';

export interface EveningCheckInProps {
  dateKey: string;
  tasks: Task[];
  onClose: () => void;
  onLater: () => void;
  onSaved?: (checkIn: EveningCheckInRecord) => void;
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export const EveningCheckIn: React.FC<EveningCheckInProps> = ({
  dateKey,
  tasks,
  onClose,
  onLater,
  onSaved,
}) => {
  const dayTasks = useMemo(
    () => tasks.filter((task) => task.dueDate === dateKey && !task.archivedAt),
    [tasks, dateKey]
  );
  const [mood, setMood] = useState<MoodWord | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [movedIds, setMovedIds] = useState<string[]>(() =>
    dayTasks.filter((task) => task.state === 'completed').map((task) => task.id)
  );
  const [heavyIds, setHeavyIds] = useState<string[]>([]);
  const [lightIds, setLightIds] = useState<string[]>([]);

  const toggleHeavy = (id: string) => {
    setHeavyIds((previous) => {
      const next = toggle(previous, id);
      if (next.includes(id)) setLightIds((light) => light.filter((item) => item !== id));
      return next;
    });
  };

  const toggleLight = (id: string) => {
    setLightIds((previous) => {
      const next = toggle(previous, id);
      if (next.includes(id)) setHeavyIds((heavy) => heavy.filter((item) => item !== id));
      return next;
    });
  };
  const [minutes, setMinutes] = useState<Record<string, string>>({});
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [journey, setJourney] = useState('');
  const [intention, setIntention] = useState('');

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onLater();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onLater]);

  const questions = mood ? followUpQuestions(mood) : [];
  const timeRows = useMemo(
    () =>
      dayTasks.filter(
        (task) =>
          extraIds.includes(task.id) ||
          movedIds.includes(task.id) ||
          heavyIds.includes(task.id) ||
          lightIds.includes(task.id) ||
          task.spentMinutes !== undefined ||
          task.plannedMinutes !== undefined
      ),
    [dayTasks, extraIds, movedIds, heavyIds, lightIds]
  );
  const remainingTasks = dayTasks.filter((task) => !timeRows.includes(task));

  const save = () => {
    if (!mood) return;
    const timeLog: TimeLogEntry[] = timeRows.map((task) => {
      const typed = Number(minutes[task.id]);
      const manual = Number.isFinite(typed) && typed > 0 ? Math.round(typed) : undefined;
      const actualMinutes = manual ?? task.spentMinutes;
      const source = task.spentMinutes !== undefined ? 'timer' : manual !== undefined ? 'manual' : 'none';
      return {
        taskId: task.id,
        taskTitle: task.title,
        plannedMinutes: task.plannedMinutes,
        actualMinutes,
        source,
      };
    });
    const checkIn: EveningCheckInRecord = {
      dateKey,
      mood,
      answers: questions
        .map((question, index) => ({ question, answer: (answers[index] ?? '').trim() }))
        .filter((item) => item.answer.length > 0),
      movedTaskIds: movedIds,
      movedTaskTitles: dayTasks.filter((task) => movedIds.includes(task.id)).map((task) => task.title),
      heavyTaskIds: heavyIds,
      heavyTaskTitles: dayTasks.filter((task) => heavyIds.includes(task.id)).map((task) => task.title),
      lightTaskIds: lightIds,
      lightTaskTitles: dayTasks.filter((task) => lightIds.includes(task.id)).map((task) => task.title),
      timeLog,
      note: note.trim() || undefined,
      analysis: note.trim() ? analyseNote(note) : undefined,
      journey: journey.trim() || undefined,
      journeyAnalysis: journey.trim() ? analyseNote(journey) : undefined,
      answeredAt: new Date().toISOString(),
    };
    saveEveningCheckIn(checkIn);
    if (intention.trim()) {
      saveIntention(toDateKey(addDays(parseDateKey(dateKey), 1)), intention.trim());
    }
    onSaved?.(checkIn);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evening-check-in-title"
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs"
      onClick={onLater}
    >
      <div
        className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-[var(--surface)] border border-[var(--line)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[var(--accent)]">
              <Moon className="w-3.5 h-3.5" /> Evening review
            </p>
            <h2 id="evening-check-in-title" className="text-lg font-bold text-[var(--ink)] mt-1">
              How did today sit?
            </h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              A few quiet questions. Skip anything, and a line is enough. Nothing leaves this device.
            </p>
          </div>
          <button
            onClick={onLater}
            aria-label="Close evening review"
            className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="How the day felt">
          {MOOD_WORDS.map((word) => (
            <button
              key={word.value}
              type="button"
              aria-pressed={mood === word.value}
              onClick={() => setMood(word.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold capitalize transition-colors ${
                mood === word.value
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
              }`}
            >
              {word.label}
            </button>
          ))}
        </div>

        {mood && (
          <div className="mt-4 space-y-2">
            {questions.map((question, index) => (
              <label key={question} className="block">
                <span className="block text-xs font-semibold text-[var(--muted)] mb-1">{question}</span>
                <input
                  value={answers[index] ?? ''}
                  onChange={(event) =>
                    setAnswers((previous) => ({ ...previous, [index]: event.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </label>
            ))}
          </div>
        )}

        <section aria-label="What got done" className="mt-5">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1">
            What got done?
          </h3>
          <p className="text-[11px] text-[var(--faint)] mb-1.5">
            Tap any task that moved forward, even a little.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dayTasks.length === 0 && (
              <p className="text-xs text-[var(--faint)]">No tasks were planned for this day.</p>
            )}
            {dayTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                aria-pressed={movedIds.includes(task.id)}
                onClick={() => setMovedIds((previous) => toggle(previous, task.id))}
                className={`max-w-full truncate px-2.5 py-1 rounded-lg border text-[11px] ${
                  movedIds.includes(task.id)
                    ? 'bg-[var(--green-soft)] text-[var(--green)] border-[var(--green)]/30'
                    : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]'
                }`}
              >
                {task.title}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="What felt heavy" className="mt-4">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1">
            What felt heavy?
          </h3>
          <p className="text-[11px] text-[var(--faint)] mb-1.5">
            Tasks that took more out of you than you wanted.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dayTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                aria-pressed={heavyIds.includes(task.id)}
                onClick={() => toggleHeavy(task.id)}
                className={`max-w-full truncate px-2.5 py-1 rounded-lg border text-[11px] ${
                  heavyIds.includes(task.id)
                    ? 'bg-[var(--amber-soft)] text-[var(--amber)] border-[var(--amber)]/30'
                    : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]'
                }`}
              >
                {task.title}
              </button>
            ))}
          </div>
        </section>

        <section aria-label="What felt easy" className="mt-4">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1">
            What felt easy?
          </h3>
          <p className="text-[11px] text-[var(--faint)] mb-1.5">
            Tasks that came more naturally than you expected.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {dayTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                aria-pressed={lightIds.includes(task.id)}
                onClick={() => toggleLight(task.id)}
                className={`max-w-full truncate px-2.5 py-1 rounded-lg border text-[11px] ${
                  lightIds.includes(task.id)
                    ? 'bg-[var(--green-soft)] text-[var(--green)] border-[var(--green)]/30'
                    : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)]'
                }`}
              >
                {task.title}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <label className="block">
            <span className="block text-xs font-semibold text-[var(--muted)] mb-1">
              How did the work itself go? (optional)
            </span>
            <span className="block text-[11px] text-[var(--faint)] mb-1.5">
              Where you got stuck, what flowed, what you learned.
            </span>
            <textarea
              rows={3}
              value={journey}
              onChange={(event) => setJourney(event.target.value)}
              placeholder="What was hard, what flowed, what you learned."
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg resize-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
          </label>
        </section>

        <section className="mt-5">
          <h3 className="text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1">
            Planned vs actual time
          </h3>
          <p className="text-[11px] text-[var(--faint)] mb-1.5">
            How long each task took, against the time you planned for it.
          </p>
          {timeRows.length === 0 ? (
            <p className="text-xs text-[var(--faint)]">
              No time was tracked. Choose a task to add about how long it took.
            </p>
          ) : (
            <div className="space-y-2">
              {timeRows.map((task) => (
                <div key={task.id} className="rounded-lg border border-[var(--line)] bg-[var(--canvas)] p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--ink)] truncate">{task.title}</span>
                    <span className="text-[10px] text-[var(--muted)] shrink-0">
                      {task.plannedMinutes ? `planned ${task.plannedMinutes}m` : 'no plan'}
                      {task.spentMinutes !== undefined ? ` · tracked ${task.spentMinutes}m` : ''}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {TIME_CHIPS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setMinutes((previous) => ({ ...previous, [task.id]: String(value) }))
                        }
                        aria-label={`Set ${value} minutes for ${task.title}`}
                        className="px-2 py-0.5 rounded-md border border-[var(--line)] text-[10px] text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        {value}m
                      </button>
                    ))}
                    <input
                      aria-label={`Actual minutes for ${task.title}`}
                      type="number"
                      min={1}
                      placeholder="min"
                      value={minutes[task.id] ?? ''}
                      onChange={(event) =>
                        setMinutes((previous) => ({ ...previous, [task.id]: event.target.value }))
                      }
                      className="w-16 px-1.5 py-0.5 text-[11px] bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-md"
                    />
                  </div>
                  {(() => {
                    const typed = Number(minutes[task.id]);
                    const actual = Number.isFinite(typed) && typed > 0 ? typed : task.spentMinutes;
                    const verdict = timeVerdict({
                      plannedMinutes: task.plannedMinutes,
                      actualMinutes: actual,
                      completed: task.state === 'completed',
                    });
                    if (!verdict) return null;
                    return (
                      <p
                        className={`mt-1 text-[10px] leading-relaxed ${
                          verdict.kind === 'appreciated' ? 'text-[var(--green)]' : 'text-[var(--muted)]'
                        }`}
                      >
                        {verdict.message}
                      </p>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
          {remainingTasks.length > 0 && (
            <select
              aria-label="Add time for another task"
              value=""
              onChange={(event) => {
                if (event.target.value) setExtraIds((previous) => [...previous, event.target.value]);
              }}
              className="mt-2 w-full px-2.5 py-1.5 text-[11px] bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] rounded-lg"
            >
              <option value="">Add time for another task...</option>
              {remainingTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          )}
        </section>

        <section className="mt-5">
          <label className="block">
            <span className="block text-xs font-semibold text-[var(--muted)] mb-1">
              Anything else you want to share? (optional)
            </span>
            <span className="block text-[11px] text-[var(--faint)] mb-1.5">
              Write about your day, anything at all, for better task suggestions.
            </span>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="A line is enough. Whatever you want to put down."
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg resize-none focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
          </label>
        </section>

        <section className="mt-4">
          <label className="block">
            <span className="block text-xs font-semibold text-[var(--muted)] mb-1">
              One thing for tomorrow (optional)
            </span>
            <input
              value={intention}
              onChange={(event) => setIntention(event.target.value)}
              placeholder="Becomes tomorrow's intention"
              className="w-full px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
          </label>
        </section>

        <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onLater}>
            Later
          </Button>
          <Button variant="primary" size="sm" onClick={save} disabled={!mood}>
            Save the evening
          </Button>
        </div>
      </div>
    </div>
  );
};
