import { toDateKey } from '../data/taskDates';

const PROFILE_KEY = 'vido.profile.v1';
const INTENTION_PREFIX = 'vido.intention.';
const REST_PREFIX = 'vido.rest.';

export interface Profile {
  name: string;
  welcomed: boolean;
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadProfile(): Profile {
  const store = storage();
  if (!store) return { name: '', welcomed: false };
  try {
    const raw = store.getItem(PROFILE_KEY);
    if (!raw) return { name: '', welcomed: false };
    const parsed = JSON.parse(raw) as Partial<Profile>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      welcomed: Boolean(parsed.welcomed),
    };
  } catch {
    return { name: '', welcomed: false };
  }
}

export function saveProfile(profile: Profile): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore blocked storage.
  }
}

export function intentionKey(dateKey: string = toDateKey(new Date())): string {
  return `${INTENTION_PREFIX}${dateKey}`;
}

export function loadIntention(dateKey: string = toDateKey(new Date())): string {
  const store = storage();
  if (!store) return '';
  try {
    return store.getItem(intentionKey(dateKey)) ?? '';
  } catch {
    return '';
  }
}

export function saveIntention(dateKey: string, text: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(intentionKey(dateKey), text);
  } catch {
    // Ignore blocked storage.
  }
}

export function restKey(dateKey: string = toDateKey(new Date())): string {
  return `${REST_PREFIX}${dateKey}`;
}

export function loadRested(dateKey: string = toDateKey(new Date())): boolean {
  const store = storage();
  if (!store) return false;
  try {
    return store.getItem(restKey(dateKey)) === '1';
  } catch {
    return false;
  }
}

export function saveRested(dateKey: string, rested: boolean): void {
  const store = storage();
  if (!store) return;
  try {
    if (rested) store.setItem(restKey(dateKey), '1');
    else store.removeItem(restKey(dateKey));
  } catch {
    // Ignore blocked storage.
  }
}

export function clearWelcomeStorage(): void {
  const store = storage();
  if (!store) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && (key === PROFILE_KEY || key.startsWith(INTENTION_PREFIX) || key.startsWith(REST_PREFIX))) keys.push(key);
    }
    keys.forEach((key) => store.removeItem(key));
  } catch {
    // Ignore blocked storage.
  }
}
