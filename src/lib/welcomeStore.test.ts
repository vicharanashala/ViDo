import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearWelcomeStorage,
  loadIntention,
  loadProfile,
  saveIntention,
  saveProfile,
} from './welcomeStore';

describe('welcomeStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts unwelcomed and persists a profile', () => {
    expect(loadProfile().welcomed).toBe(false);

    saveProfile({ name: 'Asha', welcomed: true });
    const profile = loadProfile();
    expect(profile.name).toBe('Asha');
    expect(profile.welcomed).toBe(true);
  });

  it('stores one intention per day', () => {
    saveIntention('2026-11-17', 'Move slowly.');
    expect(loadIntention('2026-11-17')).toBe('Move slowly.');
    expect(loadIntention('2026-11-18')).toBe('');
  });

  it('clears only welcome data', () => {
    saveProfile({ name: 'Asha', welcomed: true });
    saveIntention('2026-11-17', 'Move slowly.');

    clearWelcomeStorage();

    expect(loadProfile().welcomed).toBe(false);
    expect(loadIntention('2026-11-17')).toBe('');
  });
});
