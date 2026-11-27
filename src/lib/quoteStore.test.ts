import { beforeEach, describe, expect, it } from 'vitest';
import { clearOwnQuote, loadOwnQuote, saveOwnQuote } from './quoteStore';

describe('quoteStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps an own quote per day', () => {
    saveOwnQuote('2026-11-28', 'Be where your feet are.');
    saveOwnQuote('2026-11-29', 'Another day, another line.');

    expect(loadOwnQuote('2026-11-28')).toBe('Be where your feet are.');
    expect(loadOwnQuote('2026-11-27')).toBeNull();
  });

  it('clears back to the daily quote', () => {
    saveOwnQuote('2026-11-28', 'Temporary.');
    clearOwnQuote('2026-11-28');
    expect(loadOwnQuote('2026-11-28')).toBeNull();
  });

  it('ignores blank text', () => {
    saveOwnQuote('2026-11-28', '   ');
    expect(loadOwnQuote('2026-11-28')).toBeNull();
  });
});
