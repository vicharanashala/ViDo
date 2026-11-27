import { describe, it, expect } from 'vitest';
import { hexToRgba, getTaskPriorityCardStyle } from './priorityColor';

describe('priorityColor utilities', () => {
  it('converts hex to rgba with alpha', () => {
    const rgba = hexToRgba('#ef4444', 0.1);
    expect(rgba).toBe('rgba(239, 68, 68, 0.1)');
  });

  it('returns appropriate card style for high, medium, and low priority', () => {
    const highStyle = getTaskPriorityCardStyle('high');
    expect(highStyle.backgroundColor).toBeDefined();
    expect(highStyle.borderColor).toBeDefined();

    const lowStyle = getTaskPriorityCardStyle('low');
    expect(lowStyle).toEqual({});

    const defaultStyle = getTaskPriorityCardStyle(undefined);
    expect(defaultStyle).toEqual({});
  });
});
