import { describe, expect, it } from 'vitest';
import { analyseNote } from './journalAnalysis';

describe('analyseNote', () => {
  it('counts work topics and builds a neutral sentence', () => {
    const result = analyseNote(
      'Three meetings and a call. The deadline pressure was real, and there was no focus time.'
    );
    expect(result.tags).toEqual([
      { label: 'meetings', count: 2 },
      { label: 'deadline pressure', count: 1 },
      { label: 'focus time', count: 1 },
    ]);
    expect(result.summary).toBe(
      'This note mentioned meetings (2), deadline pressure (1) and focus time (1).'
    );
  });

  it('returns nothing for an empty note', () => {
    expect(analyseNote('   ')).toEqual({ tags: [], summary: '' });
  });

  it('produces no signal for personal-life vocabulary', () => {
    const result = analyseNote('The family is visiting and money is tight.');
    expect(result.tags).toEqual([]);
    expect(result.summary).toBe('');
  });

  it('keeps personal asides from changing work signals', () => {
    const result = analyseNote('Two meetings, but the family call was lovely.');
    expect(result.tags).toEqual([{ label: 'meetings', count: 2 }]);
    expect(result.summary).toBe('This note mentioned meetings (2).');
  });
});
