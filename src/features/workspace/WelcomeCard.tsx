import React, { useState } from 'react';
import { Button } from '../../components/ui';
import { Doodle } from './doodles/Doodles';
import { PROFILE_PREFIXES } from './profileOptions';

export interface WelcomeCardProps {
  onSave: (profile: { prefix: string; name: string }) => void;
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ onSave }) => {
  const [prefix, setPrefix] = useState('');
  const [name, setName] = useState('');

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
      <div className="w-20 h-16 shrink-0">
        <Doodle kind="plants" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-extrabold text-[var(--ink)]">Welcome. Make yourself at home.</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          No account. No pressure. This is your space. What should we call you?
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ prefix, name });
          }}
          className="mt-3 flex flex-col sm:flex-row gap-2"
        >
          <select
            value={prefix}
            onChange={(event) => setPrefix(event.target.value)}
            aria-label="Prefix"
            className="sm:w-28 px-3 py-2 text-sm bg-[var(--canvas)] text-[var(--ink)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            {PROFILE_PREFIXES.map((value) => (
              <option key={value || 'none'} value={value}>
                {value || 'No prefix'}
              </option>
            ))}
          </select>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name (optional)"
            aria-label="Your name"
            className="flex-1 px-3.5 py-2 text-sm bg-[var(--canvas)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          />
          <Button type="submit" size="sm" variant="primary">
            Save
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onSave({ prefix: '', name: '' })}>
            Skip for now
          </Button>
        </form>
        <p className="text-[10px] text-[var(--faint)] mt-2">Stays on this device.</p>

        <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] p-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted)]">How ViDo works</p>
          <ul className="mt-1.5 space-y-1 text-[11px] text-[var(--muted)] leading-snug">
            <li>• Today is your queue. The other views are gentle filters.</li>
            <li>• Images are visual anchors; every task has a title.</li>
            <li>• Drag or tap a task image to check in — or tap the circle.</li>
            <li>• All three answers are okay.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
