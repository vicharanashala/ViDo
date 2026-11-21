import React from 'react';
import { SampleTask } from '../../data/sampleTasks';
import { getWorkloadInsight } from '../../data/taskRecommendations';

export interface WorkloadInsightCardProps {
  tasks: SampleTask[];
  now: Date;
  className?: string;
}

export const WorkloadInsightCard: React.FC<WorkloadInsightCardProps> = ({
  tasks,
  now,
  className = '',
}) => {
  const insight = getWorkloadInsight(tasks, now);

  return (
    <section className={`bg-[var(--surface)] border border-[var(--line)] rounded-xl p-4 shadow-xs ${className}`}>
      <h3 className="text-sm font-bold text-[var(--ink)] mb-3">Workload Insight</h3>
      <p className="text-[11px] text-[var(--faint)] mb-3">As of {now.toLocaleDateString('en-GB')}</p>

      {insight.pendingCount === 0 ? (
        <p className="text-xs text-[var(--muted)]">No pending tasks.</p>
      ) : (
        <ul className="space-y-1.5 text-xs text-[var(--ink)]">
          <li>Overdue: {insight.overdueCount}</li>
          <li>Due today: {insight.dueTodayCount}</li>
          <li>High priority due soon: {insight.highPriorityDueSoonCount}</li>
        </ul>
      )}
    </section>
  );
};

WorkloadInsightCard.displayName = 'WorkloadInsightCard';
