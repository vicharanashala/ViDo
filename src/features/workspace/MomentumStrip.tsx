import React from 'react';
import type { Task } from '../../data/taskTypes';
import { getWeeklyMomentum } from '../../data/taskFilters';

export interface MomentumStripProps {
  tasks: Task[];
  reference?: Date;
}

export const MomentumStrip: React.FC<MomentumStripProps> = ({ tasks, reference = new Date() }) => {
  const days = getWeeklyMomentum(tasks, reference);
  const max = Math.max(1, ...days.map((day) => day.count));

  return (
    <div className="flex items-end gap-2" aria-label="7-day momentum">
      {days.map((day) => (
        <div
          key={day.date}
          className="flex flex-col items-center gap-1"
          title={`${day.count} delivered on ${day.label}`}
        >
          <div className="w-6 h-10 rounded-full bg-[var(--line)] overflow-hidden flex items-end">
            <div
              className="w-full rounded-full bg-[var(--green)] transition-all motion-reduce:transition-none"
              style={{ height: `${Math.max(day.count === 0 ? 8 : 25, (day.count / max) * 100)}%` }}
            />
          </div>
          <span className="text-[9px] font-mono uppercase text-[var(--muted)]">{day.weekday.slice(0, 1)}</span>
        </div>
      ))}
    </div>
  );
};
