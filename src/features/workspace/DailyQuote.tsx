import React, { useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { dailyQuote } from '../../data/quotes';
import { clearOwnQuote, loadOwnQuote, saveOwnQuote } from '../../lib/quoteStore';

export interface DailyQuoteProps {
  dateKey: string;
}

export const DailyQuote: React.FC<DailyQuoteProps> = ({ dateKey }) => {
  const [own, setOwn] = useState<string | null>(() => loadOwnQuote(dateKey));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const text = own ?? dailyQuote(dateKey);

  const save = () => {
    saveOwnQuote(dateKey, draft);
    setOwn(draft.trim() ? draft.trim() : null);
    setEditing(false);
  };

  const reset = () => {
    clearOwnQuote(dateKey);
    setOwn(null);
    setEditing(false);
  };

  return (
    <section aria-label="Quote for today" className="px-1 sm:px-2">
      {editing ? (
        <div>
          <label className="block text-[10px] uppercase font-bold tracking-wider text-[var(--muted)] mb-1">
            Your line for today
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Write something you want to read today"
              aria-label="Your quote"
              className="flex-1 px-3 py-2 text-sm bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--faint)] border border-[var(--line)] rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={save}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[11px] font-semibold"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              {own && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  <RotateCcw className="w-3 h-3" /> Today&apos;s quote
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm sm:text-base text-[var(--muted)] italic leading-relaxed">{text}</p>
          <button
            type="button"
            aria-label="Write your own quote"
            onClick={() => {
              setDraft(own ?? '');
              setEditing(true);
            }}
            className="shrink-0 mt-0.5 text-[var(--faint)] hover:text-[var(--ink)] p-1 rounded-md"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </section>
  );
};
