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
    second: '2-digit',
  });
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' });
  const date = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <span
      aria-label={`System time: ${weekday}, ${date} ${time}`}
      title={now.toLocaleString('en-GB')}
      className="hidden shrink-0 flex-col items-end text-right lg:flex"
    >
      <span className="flex w-[148px] flex-col items-center gap-0.5 rounded-xl border border-[var(--accent)]/20 bg-[var(--surface)] px-2 py-3 shadow-xs">
        <Clock3 className="h-3.5 w-3.5 text-[var(--accent)]" />
        <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--faint)]">{weekday}</span>
        <span className="font-display text-[10px] font-semibold leading-tight text-[var(--ink)]">{date}</span>
        <span className="mt-0.5 font-mono text-base font-extrabold leading-none text-[var(--accent)]">{time}</span>
      </span>
    </span>
  );
};
