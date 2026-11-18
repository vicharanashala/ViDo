import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Task } from '../../data/taskTypes';
import { DoodleTitle } from './doodles/DoodleTitle';
import type { CheckInKind } from './checkInTypes';
import { X } from 'lucide-react';

export interface TaskCheckInTrayProps {
  task: Task;
  onSelect: (kind: CheckInKind, progress?: number) => void;
  onClose: () => void;
}

const REACTION_CLASS: Record<CheckInKind, string> = {
  done: 'task-reaction-done',
  progress: 'task-reaction-progress',
  'not-today': 'task-reaction-soft',
  'not-important': 'task-reaction-later',
};

const FEEDBACK: Record<CheckInKind, string> = {
  done: 'That counts.',
  progress: 'A little further. That counts.',
  'not-today': 'Set aside. Pick it up whenever you choose.',
  'not-important': 'Set aside for later. No pressure.',
};

const ZONES: { kind: CheckInKind; title: string; detail: string; tone: string }[] = [
  {
    kind: 'done',
    title: 'Yesss — I did it!',
    detail: 'Mark this one done.',
    tone: 'border-[var(--green)]/30 bg-[var(--green-soft)] text-[var(--green)] hover:border-[var(--green)]',
  },
  {
    kind: 'progress',
    title: 'Worked on it — a little further.',
    detail: 'Add a little progress.',
    tone: 'border-[var(--amber)]/30 bg-[var(--amber-soft)] text-[var(--amber)] hover:border-[var(--amber)]',
  },
  {
    kind: 'not-today',
    title: "Not today — I'll do it another day.",
    detail: 'Set it aside. Pick it up whenever you choose.',
    tone: 'border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] hover:border-[var(--accent)]',
  },
  {
    kind: 'not-important',
    title: 'Not important right now — later.',
    detail: 'Set it aside for later.',
    tone: 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--muted)]',
  },
];

const PERCENTAGE_CHOICES = [10, 25, 50, 75, 90];

export const TaskCheckInTray: React.FC<TaskCheckInTrayProps> = ({ task, onSelect, onClose }) => {
  const [selectedKind, setSelectedKind] = useState<CheckInKind | null>(null);
  const [selectedProgress, setSelectedProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<CheckInKind | null>(null);
  const firstZoneRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = window.setTimeout(onClose, 700);
  }, [onClose]);

  const chooseZone = useCallback(
    (kind: CheckInKind) => {
      if (selectedKind) return;
      if (kind === 'progress') {
        setSelectedKind('progress');
        return;
      }
      setSelectedKind(kind);
      onSelect(kind);
      scheduleClose();
    },
    [selectedKind, onSelect, scheduleClose]
  );

  const chooseProgress = useCallback(
    (value: number) => {
      if (selectedKind !== 'progress' || selectedProgress !== null) return;
      const safe = Math.max(0, Math.min(99, value));
      setSelectedProgress(safe);
      onSelect('progress', safe);
      scheduleClose();
    },
    [selectedKind, selectedProgress, onSelect, scheduleClose]
  );

  useEffect(() => {
    firstZoneRef.current?.focus();
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (selectedKind === 'progress' && selectedProgress === null) {
        const map: Record<string, number> = { '1': 10, '2': 25, '3': 50, '4': 75, '5': 90 };
        if (map[event.key]) chooseProgress(map[event.key]);
        return;
      }

      if (!selectedKind) {
        if (event.key === '1') chooseZone('done');
        if (event.key === '2') chooseZone('progress');
        if (event.key === '3') chooseZone('not-today');
        if (event.key === '4') chooseZone('not-important');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chooseProgress, chooseZone, onClose, selectedKind, selectedProgress]);

  const reactionKind =
    selectedProgress !== null ? 'progress' : selectedKind === 'progress' ? null : selectedKind;
  const reactionClass = reactionKind ? REACTION_CLASS[reactionKind] : '';
  const feedback =
    selectedKind === 'progress' && selectedProgress !== null
      ? `Now at ${selectedProgress}%. That counts.`
      : selectedKind
        ? FEEDBACK[selectedKind]
        : '';

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="check-in-title"
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[70] w-auto sm:w-[min(760px,calc(100vw-2rem))] rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="check-in-title" className="text-sm font-bold text-[var(--ink)]">
            What happened with this one?
          </h2>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            Drag the image into a zone, or choose one. All answers are okay.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close check-in"
          className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className={`mt-3 inline-flex items-center gap-2 rounded-xl transition-all ${reactionClass}`}>
        <DoodleTitle title={task.title} category={task.category} customImageKey={task.customImageKey} size="lg" className="text-sm font-semibold text-[var(--ink)]" />
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {ZONES.map((zone, index) => (
          <button
            key={zone.kind}
            ref={index === 0 ? firstZoneRef : undefined}
            type="button"
            onClick={() => chooseZone(zone.kind)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(zone.kind);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(null);
              chooseZone(zone.kind);
            }}
            className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${zone.tone} ${
              dragOver === zone.kind ? 'ring-2 ring-[var(--accent)] scale-[1.01]' : ''
            } ${selectedKind === zone.kind ? 'ring-2 ring-[var(--accent)]' : ''}`}
          >
            <span className="text-xs font-bold block leading-snug">{zone.title}</span>
            <span className="text-[10px] opacity-80 block mt-0.5">{zone.detail}</span>
          </button>
        ))}
      </div>

      {selectedKind === 'progress' && selectedProgress === null && (
        <div className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
          <p className="text-xs font-semibold text-[var(--ink)]">How far along is it now?</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">
            Currently {task.progress}%. The task stays in Today; Done is a separate choice.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PERCENTAGE_CHOICES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => chooseProgress(value)}
                className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {value}%
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 min-h-[16px]">
        {feedback && (
          <p role="status" className="text-[11px] font-medium text-[var(--accent)]">
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
};
