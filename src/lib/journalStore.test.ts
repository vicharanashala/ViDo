import { beforeEach, describe, expect, it } from 'vitest';
import {
  addJournalEntry,
  buildJournalExport,
  clearJournalStorage,
  deleteJournalDay,
  deleteJournalEntry,
  isDeferred,
  listEveningCheckIns,
  listJournalDays,
  listJournalEntries,
  loadEveningCheckIn,
  loadJournalEntries,
  loadPromptState,
  markDeferred,
  saveEveningCheckIn,
  savePausedUntil,
  updateJournalEntry,
} from './journalStore';
import type { EveningCheckIn } from '../data/journalTypes';

function checkIn(dateKey: string): EveningCheckIn {
  return {
    dateKey,
    mood: 'steady',
    answers: [{ question: 'What kept the day steady?', answer: 'One thing at a time.' }],
    movedTaskIds: ['task-1'],
    movedTaskTitles: ['Write the summary'],
    heavyTaskIds: [],
    heavyTaskTitles: [],
    timeLog: [
      {
        taskId: 'task-1',
        taskTitle: 'Write the summary',
        plannedMinutes: 60,
        actualMinutes: 45,
        source: 'timer',
      },
    ],
    note: 'One meeting and two calls.',
    analysis: { tags: [{ label: 'meetings', count: 1 }], summary: 'This note mentioned meetings (1).' },
    answeredAt: '2026-11-20T22:00:00.000Z',
  };
}

describe('journalStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps several timed entries on the same day', () => {
    addJournalEntry('2026-11-20', 'Morning thought.', new Date('2026-11-20T09:00:00.000Z'));
    addJournalEntry('2026-11-20', 'Evening thought.', new Date('2026-11-20T21:30:00.000Z'));

    const entries = loadJournalEntries('2026-11-20');
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.text)).toEqual(['Morning thought.', 'Evening thought.']);
    expect(entries[0].id).not.toBe(entries[1].id);
  });

  it('ignores blank thoughts', () => {
    expect(addJournalEntry('2026-11-20', '   ')).toBeNull();
    expect(loadJournalEntries('2026-11-20')).toEqual([]);
  });

  it('reads the old single-entry shape', () => {
    window.localStorage.setItem(
      'vido.journal.entries.2026-11-19',
      JSON.stringify({ dateKey: '2026-11-19', text: 'Legacy note.', updatedAt: '2026-11-19T20:00:00.000Z' })
    );

    const entries = loadJournalEntries('2026-11-19');
    expect(entries).toHaveLength(1);
    expect(entries[0].text).toBe('Legacy note.');
    expect(entries[0].createdAt).toBe('2026-11-19T20:00:00.000Z');
  });

  it('updates and deletes a single entry', () => {
    const entry = addJournalEntry('2026-11-20', 'First draft.');
    expect(entry).not.toBeNull();
    updateJournalEntry('2026-11-20', entry!.id, 'Second draft.');

    expect(loadJournalEntries('2026-11-20')[0].text).toBe('Second draft.');
    deleteJournalEntry('2026-11-20', entry!.id);
    expect(loadJournalEntries('2026-11-20')).toEqual([]);
  });

  it('deletes a whole day without touching other days', () => {
    addJournalEntry('2026-11-20', 'Keep me.');
    addJournalEntry('2026-11-19', 'Remove me.');
    deleteJournalDay('2026-11-19');

    expect(loadJournalEntries('2026-11-19')).toEqual([]);
    expect(loadJournalEntries('2026-11-20')).toHaveLength(1);
  });

  it('lists days with counts and all entries newest first', () => {
    addJournalEntry('2026-11-18', 'One.');
    addJournalEntry('2026-11-20', 'Two.');
    addJournalEntry('2026-11-20', 'Three.');

    expect(listJournalDays()).toEqual({ '2026-11-18': 1, '2026-11-20': 2 });
    expect(listJournalEntries().map((entry) => entry.dateKey)).toEqual([
      '2026-11-20',
      '2026-11-20',
      '2026-11-18',
    ]);
  });

  it('saves and lists evening check-ins', () => {
    saveEveningCheckIn(checkIn('2026-11-19'));
    saveEveningCheckIn(checkIn('2026-11-20'));

    expect(loadEveningCheckIn('2026-11-20')?.mood).toBe('steady');
    expect(listEveningCheckIns().map((entry) => entry.dateKey)).toEqual([
      '2026-11-20',
      '2026-11-19',
    ]);
  });

  it('records deferrals and pause state for the prompt rules', () => {
    markDeferred('2026-11-20');
    saveEveningCheckIn(checkIn('2026-11-18'));
    savePausedUntil('2026-11-27');

    expect(isDeferred('2026-11-20')).toBe(true);
    const state = loadPromptState();
    expect(state.deferredDateKeys).toContain('2026-11-20');
    expect(state.answeredDateKeys).toContain('2026-11-18');
    expect(state.pausedUntil).toBe('2026-11-27');
  });

  it('exports every entry with its timestamp', () => {
    addJournalEntry('2026-11-20', 'A quiet day.', new Date('2026-11-20T18:00:00.000Z'));
    saveEveningCheckIn(checkIn('2026-11-20'));

    const exportData = buildJournalExport();
    expect(exportData.app).toBe('vido');
    expect(exportData.kind).toBe('journal');
    expect(exportData.entries).toHaveLength(1);
    expect(exportData.entries[0].createdAt).toBe('2026-11-20T18:00:00.000Z');
    expect(exportData.checkIns).toHaveLength(1);
  });

  it('clears every journal key and leaves tasks alone', () => {
    window.localStorage.setItem('vido.tasks.v1', '[]');
    addJournalEntry('2026-11-20', 'A quiet day.');
    saveEveningCheckIn(checkIn('2026-11-20'));
    markDeferred('2026-11-21');
    savePausedUntil('2026-11-27');

    clearJournalStorage();

    expect(listJournalEntries()).toEqual([]);
    expect(listEveningCheckIns()).toEqual([]);
    expect(isDeferred('2026-11-21')).toBe(false);
    expect(loadPromptState().pausedUntil).toBeNull();
    expect(window.localStorage.getItem('vido.tasks.v1')).toBe('[]');
  });
});
