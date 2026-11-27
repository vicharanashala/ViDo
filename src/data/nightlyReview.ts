import { addDays, toDateKey } from './taskDates';
import type { MoodWord } from './journalTypes';

export const NIGHT_START_HOUR = 21;
export const NIGHT_END_HOUR = 4;
export const PAUSE_AFTER_SKIPPED_NIGHTS = 3;
export const PAUSE_DAYS = 7;

export interface PromptState {
  answeredDateKeys: string[];
  deferredDateKeys: string[];
  pausedUntil?: string | null;
}

export type NightlyPromptKind = 'sheet' | 'quiet' | 'none';

export interface NightlyPrompt {
  kind: NightlyPromptKind;
  dateKey?: string;
  reason?: 'daytime' | 'answered' | 'paused';
}

/** The evening that the current moment belongs to, or null during the day. */
export function reviewDateKey(now: Date): string | null {
  const hour = now.getHours();
  if (hour >= NIGHT_START_HOUR) return toDateKey(now);
  if (hour < NIGHT_END_HOUR) return toDateKey(addDays(now, -1));
  return null;
}

export interface NightlyPromptOptions {
  /**
   * A night deferred earlier only quiets the current session; a fresh app open
   * may ask again. Set true to treat a deferral as still due.
   */
  ignoreDeferrals?: boolean;
}

export function nightlyPrompt(
  now: Date,
  state: PromptState,
  options: NightlyPromptOptions = {}
): NightlyPrompt {
  const dateKey = reviewDateKey(now);
  if (!dateKey) return { kind: 'none', reason: 'daytime' };
  if (state.answeredDateKeys.includes(dateKey)) {
    return { kind: 'none', dateKey, reason: 'answered' };
  }
  if (state.pausedUntil && dateKey <= state.pausedUntil) {
    return { kind: 'none', dateKey, reason: 'paused' };
  }
  if (!options.ignoreDeferrals && state.deferredDateKeys.includes(dateKey)) {
    return { kind: 'quiet', dateKey };
  }
  return { kind: 'sheet', dateKey };
}

/** Pause prompting for a week after three nights in a row go unanswered. */
export function pauseUntilAfterSkips(
  deferredDateKeys: string[],
  answeredDateKeys: string[],
  now: Date
): string | null {
  const answered = new Set(answeredDateKeys);
  let consecutive = 0;
  let cursor = addDays(now, -1);
  while (consecutive < PAUSE_AFTER_SKIPPED_NIGHTS) {
    const key = toDateKey(cursor);
    if (answered.has(key)) break;
    if (!deferredDateKeys.includes(key)) break;
    consecutive += 1;
    cursor = addDays(cursor, -1);
  }
  return consecutive >= PAUSE_AFTER_SKIPPED_NIGHTS ? toDateKey(addDays(now, PAUSE_DAYS)) : null;
}

const FOLLOW_UPS: Record<MoodWord, string[]> = {
  calm: ['What went well enough to keep?', 'What would you repeat tomorrow?'],
  steady: ['What kept the day steady?', 'What would you repeat tomorrow?'],
  stretched: ['What felt heavier than planned?', 'What could you cut tomorrow?'],
  heavy: ['Which task took the most out of you?', 'What needs to be smaller tomorrow?'],
  drained: ['What drained the most today?', 'What can wait until tomorrow?'],
  mixed: ['Which part of the day felt steady?', 'Which part took the most?'],
};

export function followUpQuestions(mood: MoodWord): string[] {
  return [...FOLLOW_UPS[mood]];
}

export const TIME_CHIPS = [10, 30, 60, 90, 120];
