export type TimeVerdictKind = 'appreciated' | 'invited';

export interface TimeVerdict {
  kind: TimeVerdictKind;
  message: string;
}

export interface TimeVerdictInput {
  plannedMinutes?: number;
  actualMinutes?: number;
  completed: boolean;
}

/**
 * Compares planned and actual minutes in a calm register: effort is recognised,
 * and anything unfinished is invited forward rather than pushed away.
 */
export function timeVerdict({
  plannedMinutes,
  actualMinutes,
  completed,
}: TimeVerdictInput): TimeVerdict | null {
  if (!plannedMinutes || plannedMinutes <= 0) return null;
  if (actualMinutes === undefined || actualMinutes <= 0) return null;

  if (completed) {
    return {
      kind: 'appreciated',
      message:
        'This one is done. Whether it took more time than you planned or less, the effort you put in counts.',
    };
  }

  if (actualMinutes >= plannedMinutes) {
    return {
      kind: 'invited',
      message:
        'You have already given this the time you planned. Anything left is a bonus, not a debt.',
    };
  }

  return {
    kind: 'invited',
    message: 'There is still room in your plan. Use as much of it as feels right.',
  };
}
