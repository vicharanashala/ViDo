import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { relativeDayLabel, toDateKey } from '../../../data/taskDates';
import { formatDayKey } from '../../../data/journalCalendar';
import { moodLabel } from '../../../data/journalTypes';
import type { EveningCheckIn, JournalEntry } from '../../../data/journalTypes';
import { JournalCalendar } from './JournalCalendar';
import {
  addJournalEntry,
  buildJournalExport,
  deleteJournalDay,
  deleteJournalEntry,
  listEveningCheckIns,
  listJournalDays,
  listJournalEntries,
  loadJournalEntries,
  updateJournalEntry,
} from '../../../lib/journalStore';
import { BookOpen, Download, Lock, Moon, Pencil, Plus, Trash2 } from 'lucide-react';

const SAVE_DELAY_MS = 800;

function downloadJson(): void {
  const data = buildJournalExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vido-journal-${toDateKey(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clockTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export const JournalView: React.FC = () => {
  const today = toDateKey(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState(today);
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadJournalEntries(today));
  const [days, setDays] = useState<Record<string, number>>(() => listJournalDays());
  const [draftText, setDraftText] = useState('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedAt, setSavedAt] = useState('');
  const [version, setVersion] = useState(0);

  const mountedRef = useRef(true);
  const dayRef = useRef(selectedDateKey);
  const textRef = useRef(draftText);
  const idRef = useRef(draftId);
  dayRef.current = selectedDateKey;
  textRef.current = draftText;
  idRef.current = draftId;

  const refresh = useCallback((dateKey: string) => {
    setEntries(loadJournalEntries(dateKey));
    setDays(listJournalDays());
    setVersion((value) => value + 1);
  }, []);

  const commit = useCallback(() => {
    const text = textRef.current;
    if (!text.trim()) return;
    const dateKey = dayRef.current;
    if (idRef.current) {
      updateJournalEntry(dateKey, idRef.current, text);
    } else {
      const entry = addJournalEntry(dateKey, text);
      if (entry) {
        idRef.current = entry.id;
        if (mountedRef.current) setDraftId(entry.id);
      }
    }
    if (!mountedRef.current) return;
    setEntries(loadJournalEntries(dateKey));
    setDays(listJournalDays());
    setVersion((value) => value + 1);
    setStatus('saved');
    setSavedAt(clockTime(new Date().toISOString()));
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => commit();
  }, [commit]);

  useEffect(() => {
    const handleUnload = () => commit();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [commit]);

  useEffect(() => {
    if (!draftText.trim()) {
      setStatus('idle');
      return;
    }
    setStatus('saving');
    const timer = window.setTimeout(commit, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [draftText, commit]);

  const selectDay = (dateKey: string) => {
    if (dateKey === selectedDateKey) return;
    commit();
    setSelectedDateKey(dateKey);
    setDraftId(null);
    setDraftText('');
    setStatus('idle');
    setEntries(loadJournalEntries(dateKey));
    setDays(listJournalDays());
  };

  const startNewThought = () => {
    commit();
    setDraftId(null);
    setDraftText('');
    setStatus('idle');
  };

  const editEntry = (entry: JournalEntry) => {
    commit();
    setDraftId(entry.id);
    setDraftText(entry.text);
    setStatus('idle');
  };

  const removeEntry = (entry: JournalEntry) => {
    deleteJournalEntry(selectedDateKey, entry.id);
    if (draftId === entry.id) {
      setDraftId(null);
      setDraftText('');
      setStatus('idle');
    }
    refresh(selectedDateKey);
  };

  const removeDay = () => {
    deleteJournalDay(selectedDateKey);
    setDraftId(null);
    setDraftText('');
    setStatus('idle');
    refresh(selectedDateKey);
  };

  const checkIns = useMemo<EveningCheckIn[]>(() => listEveningCheckIns(), [version]);
  const allEntries = useMemo(() => listJournalEntries(), [version]);
  const tagTotals = useMemo(() => {
    const totals = new Map<string, number>();
    checkIns.forEach((checkIn) =>
      checkIn.analysis?.tags.forEach((tag) => {
        totals.set(tag.label, (totals.get(tag.label) ?? 0) + tag.count);
      })
    );
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [checkIns]);

  const editing = entries.find((entry) => entry.id === draftId) ?? null;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--ink)] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" /> Journal
        </h1>
        <p className="text-xs text-[var(--muted)] mt-1">
          Free writing lives here. The evening review keeps its own short write-up.
        </p>
      </header>

      <div className="flex items-start gap-3 px-1 sm:px-2">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--green-soft)] text-[var(--green)]">
          <Lock className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold tracking-tight text-[var(--green)] leading-tight">
            This page is only yours.
          </p>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-xl leading-relaxed">
            Write anything — feelings, people, small moments. It is never analysed, never scored,
            and never sent anywhere.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[260px_minmax(0,1fr)] items-start">
        <JournalCalendar
          selectedDateKey={selectedDateKey}
          daysWithEntries={days}
          onSelect={selectDay}
        />

        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm font-semibold text-[var(--ink)] font-mono">
                {formatDayKey(selectedDateKey)}
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                {relativeDayLabel(selectedDateKey)}
              </span>
              {editing && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
                  Editing {clockTime(editing.createdAt)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[var(--faint)]" role="status">
              {status === 'saving' ? 'Saving…' : status === 'saved' ? `Saved ${savedAt}` : ''}
            </span>
          </div>

          <label className="mt-3 block">
            <span className="block text-[11px] text-[var(--faint)] mb-1.5">
              Write about this day, anything at all.
            </span>
            <textarea
              rows={6}
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              placeholder="Whatever is on your mind. A line is enough."
              className="w-full px-3 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg resize-y focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
          </label>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={startNewThought}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
            >
              <Plus className="w-3.5 h-3.5" /> New thought
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={downloadJson}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <Download className="w-3.5 h-3.5" /> Export journal
              </button>
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={removeDay}
                  className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Delete this day
                </button>
              )}
            </div>
          </div>

          {entries.length > 0 && (
            <div className="mt-4 space-y-2">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-lg border px-3 py-2.5 ${
                    entry.id === draftId
                      ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)]/40'
                      : 'border-[var(--line)] bg-[var(--canvas)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[var(--muted)]">
                      {clockTime(entry.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Edit entry from ${clockTime(entry.createdAt)}`}
                        onClick={() => editEntry(entry)}
                        className="text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete entry from ${clockTime(entry.createdAt)}`}
                        onClick={() => removeEntry(entry)}
                        className="text-[var(--muted)] hover:text-[var(--ink)]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-[var(--ink)] whitespace-pre-wrap">{entry.text}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5" /> Evenings
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-xs text-[var(--faint)] mt-2">
            No evening reviews yet. One appears after 9pm when you open the app.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {checkIns.map((checkIn) => (
              <article
                key={checkIn.dateKey}
                className="rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono text-[var(--muted)]">
                    {formatDayKey(checkIn.dateKey)}
                  </span>
                  <span className="text-[11px] font-semibold capitalize text-[var(--ink)]">
                    {moodLabel(checkIn.mood)}
                  </span>
                  {checkIn.movedTaskTitles.length > 0 && (
                    <span className="text-[10px] text-[var(--muted)]">
                      finished {checkIn.movedTaskTitles.length}
                    </span>
                  )}
                </div>
                {checkIn.analysis && checkIn.analysis.tags.length > 0 ? (
                  <div className="mt-1.5">
                    <div className="flex flex-wrap gap-1">
                      {checkIn.analysis.tags.map((tag) => (
                        <span
                          key={tag.label}
                          className="px-1.5 py-0.5 rounded-md bg-[var(--accent-soft)] text-[10px] text-[var(--accent)]"
                        >
                          {tag.label} ({tag.count})
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] mt-1">{checkIn.analysis.summary}</p>
                  </div>
                ) : checkIn.note ? (
                  <p className="text-[11px] text-[var(--faint)] mt-1">Not analysed.</p>
                ) : null}
                {checkIn.heavyTaskTitles.length > 0 && (
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Felt heavy: {checkIn.heavyTaskTitles.join(', ')}
                  </p>
                )}
                {checkIn.timeLog.length > 0 && (
                  <p className="text-[11px] text-[var(--muted)] mt-1">
                    Time:{' '}
                    {checkIn.timeLog
                      .map((entry) =>
                        entry.actualMinutes
                          ? `${entry.taskTitle} ${entry.actualMinutes}m${
                              entry.plannedMinutes ? ` of ${entry.plannedMinutes}m` : ''
                            }`
                          : `${entry.taskTitle} untracked`
                      )
                      .join(' · ')}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
        {tagTotals.length > 0 && (
          <p className="text-[11px] text-[var(--faint)] mt-3">
            Recent work signals: {tagTotals.map(([label, count]) => `${label} ${count}`).join(', ')}
          </p>
        )}
      </section>

      {allEntries.length > 0 && (
        <p className="text-[11px] text-[var(--faint)] px-1">
          {allEntries.length} {allEntries.length === 1 ? 'entry' : 'entries'} across{' '}
          {Object.keys(days).length} {Object.keys(days).length === 1 ? 'day' : 'days'}. Use the
          calendar to revisit one.
        </p>
      )}
    </div>
  );
};
