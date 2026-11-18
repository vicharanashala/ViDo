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
    day: 'numeric',
    month: 'short',
  });

  return (
    <span
      aria-label={`System time: ${date} ${time}`}
      title={now.toLocaleString('en-GB')}
      className="hidden lg:flex shrink-0 flex-col items-end gap-1 text-right"
    >
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--faint)]">
        System time
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-[10px] font-semibold text-[var(--muted)]">
        <Clock3 className="h-3.5 w-3.5 text-[var(--faint)]" />
        <span>{date}</span>
        <span className="text-[var(--faint)]">·</span>
        <span className="text-[11px] font-bold text-[var(--ink)]">{time}</span>
      </span>
    </span>
  );
};
