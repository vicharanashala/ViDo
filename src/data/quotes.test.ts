import { describe, expect, it } from 'vitest';
import { DAILY_QUOTES, dailyQuote } from './quotes';

describe('dailyQuote', () => {
  it('returns a stable quote for a given day', () => {
    expect(dailyQuote('2026-11-28')).toBe(dailyQuote('2026-11-28'));
    expect(DAILY_QUOTES).toContain(dailyQuote('2026-11-28'));
  });

  it('moves on to the next quote the next day', () => {
    expect(dailyQuote('2026-11-29')).not.toBe(dailyQuote('2026-11-28'));
  });

  it('wraps around without breaking', () => {
    expect(DAILY_QUOTES).toContain(dailyQuote('2030-01-01'));
  });
});
