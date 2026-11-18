import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

export const SystemClock: React.FC = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <span
      aria-label={`System time: ${date} ${time}`}
      title={now.toLocaleString('en-GB')}
      className="hidden lg:flex shrink-0 flex-col items-end gap-1 text-right"
    >
      <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        Right now
      </span>
      <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--accent)]/20 bg-[var(--surface)] px-3 py-1.5 shadow-xs">
        <Clock3 className="h-3.5 w-3.5 text-[var(--accent)]" />
        <span className="font-display text-[11px] font-semibold tracking-tight text-[var(--ink)]">
          {date}
        </span>
        <span className="text-[var(--faint)]">·</span>
        <span className="font-mono text-sm font-extrabold text-[var(--accent)]">{time}</span>
      </span>
    </span>
  );
};
