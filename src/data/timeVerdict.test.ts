import { describe, expect, it } from 'vitest';
import { timeVerdict } from './timeVerdict';

describe('timeVerdict', () => {
  it('recognises effort when the task is done, over or under the plan', () => {
    expect(timeVerdict({ plannedMinutes: 60, actualMinutes: 95, completed: true })?.kind).toBe(
      'appreciated'
    );
    expect(timeVerdict({ plannedMinutes: 60, actualMinutes: 30, completed: true })?.message).toMatch(
      /effort you put in counts/i
    );
  });

  it('acknowledges spent time without pushing procrastination when it is still open', () => {
    const verdict = timeVerdict({ plannedMinutes: 60, actualMinutes: 75, completed: false });
    expect(verdict?.kind).toBe('invited');
    expect(verdict?.message).toMatch(/bonus, not a debt/i);
    expect(verdict?.message).not.toMatch(/another day|wait/i);
  });

  it('invites more when there is room left in the plan', () => {
    const verdict = timeVerdict({ plannedMinutes: 60, actualMinutes: 20, completed: false });
    expect(verdict?.message).toMatch(/still room/i);
    expect(verdict?.message).not.toMatch(/another day|wait/i);
  });

  it('stays quiet without a plan or without tracked time', () => {
    expect(timeVerdict({ actualMinutes: 40, completed: true })).toBeNull();
    expect(timeVerdict({ plannedMinutes: 0, actualMinutes: 40, completed: true })).toBeNull();
    expect(timeVerdict({ plannedMinutes: 60, completed: true })).toBeNull();
    expect(timeVerdict({ plannedMinutes: 60, actualMinutes: 0, completed: false })).toBeNull();
  });
});
