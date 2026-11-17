import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui';

export interface IntentionBarProps {
  value: string;
  onSave: (text: string) => void;
}

export const IntentionBar: React.FC<IntentionBarProps> = ({ value, onSave }) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const submit = () => onSave(draft);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center gap-2 shrink-0">
        <Sparkles className="w-4 h-4 text-[var(--accent)]" />
        <span className="text-xs font-semibold text-[var(--ink)]">A small intention for today</span>
      </div>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        }}
        placeholder="Optional: one thing that would make today lighter"
        aria-label="Daily intention"
        className="flex-1 min-w-0 bg-transparent text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none py-1"
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={submit}
        disabled={draft === value}
        className="shrink-0 self-end sm:self-auto"
      >
        Save
      </Button>
    </section>
  );
};
