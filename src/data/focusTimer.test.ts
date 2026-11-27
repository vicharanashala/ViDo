import { describe, expect, it } from 'vitest';
import { flushMinutes, formatElapsed } from './focusTimer';

describe('focusTimer', () => {
  it('turns seconds into whole minutes and keeps the remainder', () => {
    expect(flushMinutes(0)).toEqual({ minutes: 0, remainderSeconds: 0 });
    expect(flushMinutes(59)).toEqual({ minutes: 0, remainderSeconds: 59 });
    expect(flushMinutes(60)).toEqual({ minutes: 1, remainderSeconds: 0 });
    expect(flushMinutes(185)).toEqual({ minutes: 3, remainderSeconds: 5 });
    expect(flushMinutes(-4)).toEqual({ minutes: 0, remainderSeconds: 0 });
  });

  it('formats elapsed time without a pressure countdown', () => {
    expect(formatElapsed(0)).toBe('00:00');
    expect(formatElapsed(65)).toBe('01:05');
    expect(formatElapsed(3725)).toBe('1:02:05');
  });
});
