import type { EveningCheckIn, JournalEntry } from '../data/journalTypes';
import type { PromptState } from '../data/nightlyReview';

const ENTRY_PREFIX = 'vido.journal.entries.';
const EVENING_PREFIX = 'vido.journal.evening.';
const DEFER_PREFIX = 'vido.journal.defer.';
const PAUSED_KEY = 'vido.journal.pausedUntil';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(key: string): T | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore blocked storage.
  }
}

function remove(key: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    // Ignore blocked storage.
  }
}

function newEntryId(): string {
  return `journal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Accepts both the old single-entry shape and the new array shape. */
function readDay(dateKey: string): JournalEntry[] {
  const raw = readJson<unknown>(`${ENTRY_PREFIX}${dateKey}`);
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .filter((item): item is Partial<JournalEntry> => Boolean(item) && typeof item === 'object')
      .filter((item) => typeof item.text === 'string')
      .map((item, index) => ({
        id: typeof item.id === 'string' ? item.id : `${dateKey}-entry-${index + 1}`,
        dateKey,
        text: item.text as string,
        createdAt:
          typeof item.createdAt === 'string'
            ? item.createdAt
            : typeof item.updatedAt === 'string'
              ? item.updatedAt
              : new Date().toISOString(),
        updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : undefined,
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  const legacy = raw as Partial<JournalEntry> & { updatedAt?: string };
  if (typeof legacy.text === 'string') {
    return [
      {
        id: `${dateKey}-entry-1`,
        dateKey,
        text: legacy.text,
        createdAt: legacy.createdAt ?? legacy.updatedAt ?? new Date().toISOString(),
        updatedAt: legacy.updatedAt,
      },
    ];
  }

  return [];
}

function writeDay(dateKey: string, entries: JournalEntry[]): void {
  if (entries.length === 0) {
    remove(`${ENTRY_PREFIX}${dateKey}`);
    return;
  }
  writeJson(`${ENTRY_PREFIX}${dateKey}`, entries);
}

export function loadJournalEntries(dateKey: string): JournalEntry[] {
  return readDay(dateKey);
}

export function addJournalEntry(
  dateKey: string,
  text: string,
  now: Date = new Date()
): JournalEntry | null {
  if (!text.trim()) return null;
  const entry: JournalEntry = {
    id: newEntryId(),
    dateKey,
    text,
    createdAt: now.toISOString(),
  };
  writeDay(dateKey, [...readDay(dateKey), entry]);
  return entry;
}

export function updateJournalEntry(dateKey: string, id: string, text: string): void {
  const entries = readDay(dateKey);
  const next = entries.map((entry) =>
    entry.id === id
      ? { ...entry, text, updatedAt: new Date().toISOString() }
      : entry
  );
  writeDay(dateKey, next);
}

export function deleteJournalEntry(dateKey: string, id: string): void {
  writeDay(
    dateKey,
    readDay(dateKey).filter((entry) => entry.id !== id)
  );
}

export function deleteJournalDay(dateKey: string): void {
  remove(`${ENTRY_PREFIX}${dateKey}`);
}

export function listJournalEntries(): JournalEntry[] {
  return listKeys(ENTRY_PREFIX)
    .flatMap((key) => readDay(key.slice(ENTRY_PREFIX.length)))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey) || b.createdAt.localeCompare(a.createdAt));
}

export function listJournalDays(): Record<string, number> {
  const days: Record<string, number> = {};
  listKeys(ENTRY_PREFIX).forEach((key) => {
    const dateKey = key.slice(ENTRY_PREFIX.length);
    const count = readDay(dateKey).length;
    if (count > 0) days[dateKey] = count;
  });
  return days;
}

export function loadEveningCheckIn(dateKey: string): EveningCheckIn | null {
  return readJson<EveningCheckIn>(`${EVENING_PREFIX}${dateKey}`);
}

export function saveEveningCheckIn(checkIn: EveningCheckIn): void {
  writeJson(`${EVENING_PREFIX}${checkIn.dateKey}`, checkIn);
}

export function listEveningCheckIns(): EveningCheckIn[] {
  return listByPrefix<EveningCheckIn>(EVENING_PREFIX)
    .filter((entry) => typeof entry.dateKey === 'string' && typeof entry.mood === 'string')
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

export function markDeferred(dateKey: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(`${DEFER_PREFIX}${dateKey}`, '1');
  } catch {
    // Ignore blocked storage.
  }
}

export function isDeferred(dateKey: string): boolean {
  return listKeys(DEFER_PREFIX).includes(`${DEFER_PREFIX}${dateKey}`);
}

export function loadPausedUntil(): string | null {
  const store = storage();
  if (!store) return null;
  try {
    return store.getItem(PAUSED_KEY);
  } catch {
    return null;
  }
}

export function savePausedUntil(dateKey: string | null): void {
  if (!dateKey) {
    remove(PAUSED_KEY);
    return;
  }
  const store = storage();
  if (!store) return;
  try {
    store.setItem(PAUSED_KEY, dateKey);
  } catch {
    // Ignore blocked storage.
  }
}

export function loadPromptState(): PromptState {
  return {
    answeredDateKeys: listEveningCheckIns().map((entry) => entry.dateKey),
    deferredDateKeys: listKeys(DEFER_PREFIX).map((key) => key.slice(DEFER_PREFIX.length)),
    pausedUntil: loadPausedUntil(),
  };
}

export interface JournalExport {
  app: 'vido';
  kind: 'journal';
  exportedAt: string;
  entries: JournalEntry[];
  checkIns: EveningCheckIn[];
}

export function buildJournalExport(): JournalExport {
  return {
    app: 'vido',
    kind: 'journal',
    exportedAt: new Date().toISOString(),
    entries: listJournalEntries(),
    checkIns: listEveningCheckIns(),
  };
}

export function clearJournalStorage(): void {
  [ENTRY_PREFIX, EVENING_PREFIX, DEFER_PREFIX].forEach((prefix) => {
    listKeys(prefix).forEach(remove);
  });
  remove(PAUSED_KEY);
}

function listKeys(prefix: string): string[] {
  const store = storage();
  if (!store) return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
    return keys;
  } catch {
    return [];
  }
}

function listByPrefix<T>(prefix: string): T[] {
  return listKeys(prefix)
    .map((key) => readJson<T>(key))
    .filter((value): value is T => Boolean(value));
}
