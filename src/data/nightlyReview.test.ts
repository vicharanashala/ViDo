import { describe, expect, it } from 'vitest';
import {
  followUpQuestions,
  nightlyPrompt,
  pauseUntilAfterSkips,
  reviewDateKey,
} from './nightlyReview';

function at(hour: number, minute = 0): Date {
  return new Date(2026, 10, 20, hour, minute);
}

describe('reviewDateKey', () => {
  it('returns null during the day', () => {
    expect(reviewDateKey(at(8))).toBeNull();
    expect(reviewDateKey(at(20, 59))).toBeNull();
  });

  it('returns today from 21:00', () => {
    expect(reviewDateKey(at(21))).toBe('2026-11-20');
    expect(reviewDateKey(at(23, 59))).toBe('2026-11-20');
  });

  it('returns the previous evening after midnight', () => {
    expect(reviewDateKey(at(0, 30))).toBe('2026-11-19');
    expect(reviewDateKey(at(3, 59))).toBe('2026-11-19');
    expect(reviewDateKey(at(4))).toBeNull();
  });
});

describe('nightlyPrompt', () => {
  const empty = { answeredDateKeys: [], deferredDateKeys: [] };

  it('asks with a sheet on the first open of the night', () => {
    expect(nightlyPrompt(at(21, 5), empty)).toEqual({ kind: 'sheet', dateKey: '2026-11-20' });
  });

  it('goes quiet after Later instead of interrupting again', () => {
    expect(
      nightlyPrompt(at(22), { answeredDateKeys: [], deferredDateKeys: ['2026-11-20'] })
    ).toEqual({ kind: 'quiet', dateKey: '2026-11-20' });
  });

  it('stops once the evening is answered', () => {
    expect(
      nightlyPrompt(at(22), { answeredDateKeys: ['2026-11-20'], deferredDateKeys: [] })
    ).toEqual({ kind: 'none', dateKey: '2026-11-20', reason: 'answered' });
  });

  it('stays silent while paused', () => {
    expect(
      nightlyPrompt(at(22), {
        answeredDateKeys: [],
        deferredDateKeys: [],
        pausedUntil: '2026-11-27',
      })
    ).toEqual({ kind: 'none', dateKey: '2026-11-20', reason: 'paused' });
  });

  it('asks again on a fresh session once a deferral is ignored', () => {
    expect(
      nightlyPrompt(
        at(22),
        { answeredDateKeys: [], deferredDateKeys: ['2026-11-20'] },
        { ignoreDeferrals: true }
      )
    ).toEqual({ kind: 'sheet', dateKey: '2026-11-20' });
  });

  it('still respects answers and pauses when deferrals are ignored', () => {
    expect(
      nightlyPrompt(
        at(22),
        { answeredDateKeys: ['2026-11-20'], deferredDateKeys: [] },
        { ignoreDeferrals: true }
      ).kind
    ).toBe('none');
    expect(
      nightlyPrompt(
        at(22),
        { answeredDateKeys: [], deferredDateKeys: [], pausedUntil: '2026-11-27' },
        { ignoreDeferrals: true }
      ).kind
    ).toBe('none');
  });

  it('does nothing during the day', () => {
    expect(nightlyPrompt(at(14), empty)).toEqual({ kind: 'none', reason: 'daytime' });
  });
});

describe('pauseUntilAfterSkips', () => {
  it('pauses for a week after three unanswered nights in a row', () => {
    const now = at(22);
    const deferred = ['2026-11-17', '2026-11-18', '2026-11-19'];
    expect(pauseUntilAfterSkips(deferred, [], now)).toBe('2026-11-27');
  });

  it('does not pause when a night was answered', () => {
    const now = at(22);
    const deferred = ['2026-11-18', '2026-11-19'];
    expect(pauseUntilAfterSkips(deferred, ['2026-11-17'], now)).toBeNull();
  });

  it('does not pause before three skips', () => {
    const now = at(22);
    expect(pauseUntilAfterSkips(['2026-11-18', '2026-11-19'], [], now)).toBeNull();
  });
});

describe('followUpQuestions', () => {
  it('asks work and task questions only', () => {
    const words = ['calm', 'steady', 'stretched', 'heavy', 'drained', 'mixed'] as const;
    const personal = /family|friend|health|money|relationship|partner|child/i;
    words.forEach((mood) => {
      const questions = followUpQuestions(mood);
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((question) => expect(question).not.toMatch(personal));
    });
  });
});
