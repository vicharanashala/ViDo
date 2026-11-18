import React, { useEffect, useState } from 'react';
import { Check, UserRound } from 'lucide-react';
import { Button } from '../../../components/ui';
import { PROFILE_PREFIXES } from '../profileOptions';

export interface ProfileViewProps {
  prefix: string;
  name: string;
  onSave: (profile: { prefix: string; name: string }) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ prefix, name, onSave }) => {
  const [draftPrefix, setDraftPrefix] = useState(prefix);
  const [draftName, setDraftName] = useState(name);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraftPrefix(prefix);
    setDraftName(name);
  }, [prefix, name]);

  const displayName = [draftPrefix, draftName].filter(Boolean).join(' ') || 'You';

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-xl font-bold text-[var(--accent)]">
            {draftName.trim() ? draftName.trim().charAt(0).toUpperCase() : <UserRound className="h-6 w-6" />}
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Your profile
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{displayName}</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              This is how ViDo addresses you. Saved only on this device.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ prefix: draftPrefix, name: draftName });
            setSaved(true);
          }}
        >
          <div>
            <label htmlFor="profile-prefix" className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Prefix</label>
            <select
              id="profile-prefix"
              value={draftPrefix}
              onChange={(event) => {
                setDraftPrefix(event.target.value);
                setSaved(false);
              }}
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              {PROFILE_PREFIXES.map((value) => (
                <option key={value || 'none'} value={value}>
                  {value || 'No prefix'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-[var(--muted)] mb-1.5">Name</label>
            <input
              id="profile-name"
              value={draftName}
              onChange={(event) => {
                setDraftName(event.target.value);
                setSaved(false);
              }}
              placeholder="Your name (optional)"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[10px] text-[var(--faint)]">No account. No upload. Just this browser.</span>
            <Button type="submit" size="sm" variant="primary">
              <Check className="h-3.5 w-3.5" /> Save profile
            </Button>
          </div>
          {saved && (
            <p role="status" className="text-[11px] font-semibold text-[var(--green)]">
              Profile saved.
            </p>
          )}
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--canvas)] p-4">
        <h2 className="text-xs font-bold text-[var(--ink)]">What lives here</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
          Prefix and name for greetings. Tasks, paths, custom images, and intentions stay in your
          browser too. Clearing site data removes them.
        </p>
      </section>
    </div>
  );
};
