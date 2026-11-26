import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, X, Clock3, CalendarDays } from 'lucide-react';
import type { SampleTask } from '../../data/sampleTasks';
import { Button } from '../../components/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: SampleTask[];
  date: string; // YYYY-MM-DD
  isPreview?: boolean;
  onToggleTask?: (task: SampleTask) => void;
  onUpdateTask?: (taskId: string, updates: Partial<SampleTask>) => void;
}

type Decision = 'completed' | 'not_completed' | 'cancelled';
type ReviewState = {
  decisions: Record<string, Decision>;
  reschedules: Record<string, { date: string; time: string }>;
  finalized: boolean;
};

function keyFor(isPreview: boolean | undefined, date: string) {
  return `vido_eod_review_${isPreview ? 'preview' : 'live'}_${date}`;
}

export const EndOfDayReview: React.FC<Props> = ({ isOpen, onClose, tasks, date, isPreview, onToggleTask, onUpdateTask }) => {
  const storageKey = keyFor(isPreview, date);
  const [state, setState] = useState<ReviewState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as ReviewState;
    } catch { /* ignore */ }
    return { decisions: {}, reschedules: {}, finalized: false };
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState(JSON.parse(raw) as ReviewState);
      else setState({ decisions: {}, reschedules: {}, finalized: false });
    } catch {
      setState({ decisions: {}, reschedules: {}, finalized: false });
    }
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, storageKey]);

  const dayTasks = useMemo(() =>
    tasks.filter((t) => !t.isArchived && t.dueDate === date),
  [tasks, date]);

  const reviewTasks = useMemo(() => dayTasks.filter((t) => {
    if (t.state === 'completed' || t.state === 'cancelled') return false;
    if (state.decisions[t.id]) return false;
    return true;
  }), [dayTasks, state.decisions]);

  if (!isOpen) return null;

  const setDecision = (taskId: string, decision: Decision) => {
    setState((s) => ({ ...s, decisions: { ...s.decisions, [taskId]: decision }, finalized: false }));
  };

  const setReschedule = (taskId: string, field: 'date' | 'time', value: string) => {
    setState((s) => ({ ...s, reschedules: { ...s.reschedules, [taskId]: { date: s.reschedules[taskId]?.date || date, time: s.reschedules[taskId]?.time || '09:00', [field]: value } }, finalized: false }));
  };

  const applyDecision = (task: SampleTask) => {
    const decision = state.decisions[task.id];
    if (!decision) return;
    if (decision === 'completed') {
      if (task.state !== 'completed') onToggleTask?.(task);
    } else if (decision === 'cancelled') {
      onUpdateTask?.(task.id, { state: 'cancelled' });
    } else if (decision === 'not_completed') {
      const r = state.reschedules[task.id];
      if (r?.date) {
        onUpdateTask?.(task.id, { state: 'active', dueDate: r.date, dueTime: r.time || task.dueTime, startTime: undefined, endTime: r.time || task.endTime, completedAt: undefined });
      } else {
        onUpdateTask?.(task.id, { state: 'active', completedAt: undefined });
      }
    }
  };

  const handleFinalize = () => {
    reviewTasks.forEach(applyDecision);
    setState((s) => ({ ...s, finalized: true }));
  };

  const totalScheduled = dayTasks.length;
  const completedCount = dayTasks.filter((t) => t.state === 'completed' || state.decisions[t.id] === 'completed').length;
  const notCompletedCount = dayTasks.filter((t) => state.decisions[t.id] === 'not_completed').length;
  const cancelledCount = dayTasks.filter((t) => t.state === 'cancelled' || state.decisions[t.id] === 'cancelled').length;
  const awaitingCount = Math.max(0, totalScheduled - completedCount - notCompletedCount - cancelledCount);
  const completionPct = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={onClose}>
      <div className="w-full max-w-3xl bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 sm:p-6 border-b border-[var(--line)] flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5 mb-1"><Clock3 className="w-3.5 h-3.5 text-[var(--accent)]" /> End-of-Day Review</div>
            <h2 className="text-xl font-bold text-[var(--ink)]">Review your day</h2>
            <p className="text-xs text-[var(--muted)] mt-1">Confirm what was completed, keep pending items for carry forward, or cancel tasks you won’t do.</p>
          </div>
          <button onClick={onClose} aria-label="Close review" className="p-2 rounded-lg hover:bg-[var(--canvas)] text-[var(--muted)] cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {reviewTasks.length === 0 && !state.finalized ? (
            <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] text-sm text-[var(--muted)]">No tasks awaiting confirmation for this day.</div>
          ) : (
            <div className="space-y-3">
              {reviewTasks.map((task) => {
                const decision = state.decisions[task.id];
                const reschedule = state.reschedules[task.id];
                return (
                  <div key={task.id} className="p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)]/40">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[var(--ink)]">{task.title}</div>
                        <div className="text-[11px] text-[var(--muted)] font-mono mt-0.5">{task.startTime || task.dueTime || '--:--'}{task.endTime ? ` - ${task.endTime}` : ''}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        <button type="button" onClick={() => setDecision(task.id, 'completed')} className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${decision === 'completed' ? 'bg-[var(--green)] text-[var(--on-accent)] border-[var(--green)]' : 'bg-[var(--green-soft)] text-[var(--green)] border-[var(--green)]/35 hover:bg-[var(--canvas)]'}`}>✓ Completed</button>
                        <button type="button" onClick={() => setDecision(task.id, 'not_completed')} className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${decision === 'not_completed' ? 'bg-[var(--amber)] text-[var(--on-accent)] border-[var(--amber)]' : 'bg-[var(--amber-soft)] text-[var(--amber)] border-[var(--amber)]/35 hover:bg-[var(--canvas)]'}`}>✕ Not Completed</button>
                        <button type="button" onClick={() => setDecision(task.id, 'cancelled')} className={`px-3 py-2 rounded-lg text-xs font-bold border cursor-pointer ${decision === 'cancelled' ? 'bg-[var(--red)] text-[var(--on-accent)] border-[var(--red)]' : 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/35 hover:bg-[var(--canvas)]'}`}>✕ Cancelled</button>
                      </div>
                    </div>
                    {decision === 'not_completed' && (
                      <div className="mt-3 pt-3 border-t border-[var(--line)] flex flex-col sm:flex-row gap-2 sm:items-center">
                        <span className="text-[11px] font-semibold text-[var(--muted)] flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Reschedule (optional):</span>
                        <input type="date" value={reschedule?.date || ''} onChange={(e) => setReschedule(task.id, 'date', e.target.value)} className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface)]" />
                        <input type="time" value={reschedule?.time || ''} onChange={(e) => setReschedule(task.id, 'time', e.target.value)} className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--line)] bg-[var(--surface)]" />
                        <span className="text-[11px] text-[var(--faint)]">Leave blank to keep pending.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-[var(--muted)]">{reviewTasks.length} task(s) awaiting confirmation</div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
              <Button variant="primary" size="sm" onClick={handleFinalize} disabled={reviewTasks.length === 0}>Complete Review</Button>
            </div>
          </div>

          {state.finalized && (
            <div className="mt-2 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
              <div className="flex items-center gap-2 font-bold text-[var(--ink)] mb-3"><CheckCircle2 className="w-4 h-4 text-[var(--green)]" /> Daily Summary</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[var(--canvas)] border border-[var(--line)]"><div className="text-[10px] uppercase text-[var(--muted)] font-bold">Scheduled</div><div className="text-lg font-black text-[var(--ink)]">{totalScheduled}</div></div>
                <div className="p-3 rounded-lg bg-[var(--green-soft)] border border-[var(--green)]/30"><div className="text-[10px] uppercase text-[var(--green)] font-bold">Completed</div><div className="text-lg font-black text-[var(--green)]">{completedCount}</div></div>
                <div className="p-3 rounded-lg bg-[var(--amber-soft)] border border-[var(--amber)]/30"><div className="text-[10px] uppercase text-[var(--amber)] font-bold">Not Completed</div><div className="text-lg font-black text-[var(--amber)]">{notCompletedCount}</div></div>
                <div className="p-3 rounded-lg bg-[var(--red-soft)] border border-[var(--red)]/30"><div className="text-[10px] uppercase text-[var(--red)] font-bold">Awaiting</div><div className="text-lg font-black text-[var(--red)]">{awaitingCount}</div></div>
                <div className="p-3 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]/30"><div className="text-[10px] uppercase text-[var(--accent)] font-bold">Completion</div><div className="text-lg font-black text-[var(--accent)]">{completionPct}%</div></div>
              </div>
              {cancelledCount > 0 && <div className="text-[11px] text-[var(--muted)] mt-2">Cancelled: {cancelledCount}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};