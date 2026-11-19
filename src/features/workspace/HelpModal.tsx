import React, { useEffect, useRef } from 'react';
import { Button } from '../../components/ui';
import { X, MousePointer2, Keyboard, Image as ImageIcon } from 'lucide-react';

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIEWS = [
  ['Home', 'Your calm overview.'],
  ['Today', 'Only tasks due today.'],
  ['Upcoming', 'Later, when you have room.'],
  ['Task paths', 'Break a task into small, visible steps.'],
  ['Momentum trail', 'A gentle board of completed work.'],
  ['Past', 'Earlier tasks. Bring one forward, or leave it.'],
  ['Completed', 'Finished work, kept for perspective.'],
  ['Archived', 'Put away, still kept.'],
  ['Profile', 'Edit name, email, date of birth, and phone.'],
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      setTimeout(() => closeRef.current?.focus(), 50);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-2xl relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close help"
          className="absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-lg hover:bg-[var(--canvas)]"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="help-title" className="text-xl font-bold text-[var(--ink)]">
          How ViDo works
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          A short guide. No documentation required.
        </p>

        <section className="mt-5">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-[var(--muted)] mb-2">
            The views
          </h3>
          <dl className="space-y-1.5">
            {VIEWS.map(([label, description]) => (
              <div key={label} className="flex items-baseline gap-2 text-xs">
                <dt className="font-semibold text-[var(--ink)] min-w-[112px]">{label}</dt>
                <dd className="text-[var(--muted)]">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-5">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-[var(--muted)] flex items-center gap-1.5 mb-2">
            <MousePointer2 className="w-3.5 h-3.5" /> Checking in
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Use the Calendar dropdown in quick add to pick a planned date, deadline date, or deadline
            time. Drag a task image into the check-in tray, tap the image, or click the circle beside a task. Choose
            <span className="font-semibold text-[var(--ink)]"> Done</span>,
            <span className="font-semibold text-[var(--ink)]"> Not today — I&apos;ll do it another day</span>,
            or <span className="font-semibold text-[var(--ink)]"> Not important right now — later</span>.
            All three answers are okay.
          </p>
          <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
            A task with a future deadline stays in Today until that deadline day passes. If you set a
            deadline time, it becomes Pending when that time passes, but you can still update it until
            midnight.
          </p>
          <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
            To repeat a task until its deadline, open Calendar and choose Daily, Weekdays, or Weekly.
            Finishing one occurrence schedules the next one automatically.
          </p>
          <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
            Reminders are set in Create task or Task details and appear while ViDo is open. To share a
            task with an email or phone number, sign in from Profile, then open the task details.
          </p>
          <p className="text-xs text-[var(--muted)] leading-relaxed mt-2">
            For a bigger task, open its Task path and add small steps. Pending cards also offer
            **Break into steps**. The path keeps the next move visible without turning the task into
            another project. When every step is done, the task completes automatically. Adding a new
            step reopens it.
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-[var(--muted)] flex items-center gap-1.5 mb-2">
            <Keyboard className="w-3.5 h-3.5" /> Keyboard
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--canvas)]">Enter</kbd> opens a task,{' '}
            <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--canvas)]">Space</kbd> checks in, <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--canvas)]">C</kbd> opens check-in,{' '}
            <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--canvas)]">F</kbd> begins focus,{' '}
            <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--canvas)]">1 / 2 / 3</kbd> choose a check-in
            answer, and <kbd className="px-1 py-0.5 rounded border border-[var(--line)] bg-[var(--canvas)]">Esc</kbd> closes.
          </p>
        </section>

        <section className="mt-5">
          <h3 className="text-[11px] uppercase tracking-wider font-bold text-[var(--muted)] flex items-center gap-1.5 mb-2">
            <ImageIcon className="w-3.5 h-3.5" /> Images
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Images are visual anchors. Every task also shows its title, so the picture never has to
            carry the meaning alone. If no image fits, open the task and add your own; ViDo reuses it
            for similar task names on this device.
          </p>
        </section>

        <div className="mt-6 pt-4 border-t border-[var(--line)] flex justify-end">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
