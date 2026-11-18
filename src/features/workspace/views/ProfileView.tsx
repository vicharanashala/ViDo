import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, LogIn, LogOut, UserRound } from 'lucide-react';
import { Button } from '../../../components/ui';
import { PROFILE_PREFIXES } from '../profileOptions';

export interface ProfileFields {
  prefix: string;
  name: string;
  email: string;
  dob: string;
  phone: string;
}

export interface ProfileViewProps extends ProfileFields {
  signedIn?: boolean;
  onSave: (profile: ProfileFields) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  prefix,
  name,
  email,
  dob,
  phone,
  signedIn = false,
  onSave,
  onSignOut,
}) => {
  const [draft, setDraft] = useState<ProfileFields>({ prefix, name, email, dob, phone });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft({ prefix, name, email, dob, phone });
  }, [prefix, name, email, dob, phone]);

  const displayName = [draft.prefix, draft.name].filter(Boolean).join(' ') || 'You';
  const update = (patch: Partial<ProfileFields>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setSaved(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-xl font-bold text-[var(--accent)]">
            {draft.name.trim() ? draft.name.trim().charAt(0).toUpperCase() : <UserRound className="h-6 w-6" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              Your profile
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-[var(--ink)]">{displayName}</h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {signedIn ? 'Signed in on this device.' : 'Local profile. Sign in to secure account details.'}
            </p>
          </div>
          {signedIn && onSignOut && (
            <Button variant="ghost" size="sm" onClick={onSignOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </Button>
          )}
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(draft);
            setSaved(true);
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
            <div>
              <label htmlFor="profile-prefix" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                Prefix
              </label>
              <select
                id="profile-prefix"
                value={draft.prefix}
                onChange={(event) => update({ prefix: event.target.value })}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]"
              >
                {PROFILE_PREFIXES.map((value) => (
                  <option key={value || 'none'} value={value}>
                    {value || 'None'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                Name
              </label>
              <input
                id="profile-name"
                value={draft.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="Your name"
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={draft.email}
              onChange={(event) => update({ email: event.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-dob" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                Date of birth
              </label>
              <input
                id="profile-dob"
                type="date"
                value={draft.dob}
                onChange={(event) => update({ dob: event.target.value })}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]"
              />
            </div>
            <div>
              <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                Phone
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={draft.phone}
                onChange={(event) => update({ phone: event.target.value })}
                placeholder="+91…"
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--canvas)] px-3 py-2 text-sm text-[var(--ink)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {!signedIn ? (
              <Link to="/auth" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline">
                <LogIn className="h-3.5 w-3.5" /> Sign in or create account
              </Link>
            ) : (
              <span className="text-[10px] text-[var(--faint)]">No password is stored.</span>
            )}
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
          Name, email, date of birth, phone, tasks, paths, and images stay in your browser. Clearing
          site data removes them.
        </p>
      </section>
    </div>
  );
};
