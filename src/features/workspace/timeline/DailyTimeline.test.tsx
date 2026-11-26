import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { SampleTask } from '../../../data/sampleTasks';
import { getAtmosphereMinutes, setAtmosphereMinutes } from '../../../theme/atmosphere';
import { DailyTimeline } from './DailyTimeline';

const originalMinutes = getAtmosphereMinutes();

const middayTask: SampleTask = {
  id: 'midday-task',
  title: 'Midday task',
  dueDate: '2026-11-26',
  startTime: '12:00',
  endTime: '13:00',
  state: 'active',
  category: 'personal',
  createdAt: '2026-11-26T09:00:00Z',
};

describe('DailyTimeline midday appearance', () => {
  afterEach(() => {
    setAtmosphereMinutes(originalMinutes);
  });

  it('keeps the normal status palette at 12:30 PM with no rain override', () => {
    setAtmosphereMinutes(12 * 60 + 30);
    render(
      <DailyTimeline
        tasks={[middayTask]}
        selectedDate="2026-11-26"
        onTaskClick={vi.fn()}
      />
    );

    const taskCard = screen.getByTitle(/Midday task \(12:00 PM - 1:00 PM\)/i);
    expect(taskCard).not.toHaveAttribute('data-rainy-task');
    expect(taskCard).not.toHaveClass('border-black');
  });
});
