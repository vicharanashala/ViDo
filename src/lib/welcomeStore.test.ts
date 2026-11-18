import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearWelcomeStorage,
  loadIntention,
  loadProfile,
  loadRested,
  saveIntention,
  saveProfile,
  saveRested,
} from './welcomeStore';

describe('welcomeStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts unwelcomed and persists a profile', () => {
    expect(loadProfile().welcomed).toBe(false);

    saveProfile({ prefix: 'Ms.', name: 'Asha', email: 'asha@example.com', dob: '1995-04-12', phone: '+910000000000', welcomed: true });
    const profile = loadProfile();
    expect(profile.prefix).toBe('Ms.');
    expect(profile.name).toBe('Asha');
    expect(profile.welcomed).toBe(true);
  });

  it('stores one intention per day', () => {
    saveIntention('2026-11-17', 'Move slowly.');
    expect(loadIntention('2026-11-17')).toBe('Move slowly.');
    expect(loadIntention('2026-11-18')).toBe('');
  });

  it('stores a per-day rest state', () => {
    saveRested('2026-11-17', true);
    expect(loadRested('2026-11-17')).toBe(true);
    expect(loadRested('2026-11-18')).toBe(false);

    saveRested('2026-11-17', false);
    expect(loadRested('2026-11-17')).toBe(false);
  });

  it('clears only personal data', () => {
    saveProfile({ prefix: 'Ms.', name: 'Asha', email: 'asha@example.com', dob: '1995-04-12', phone: '+910000000000', welcomed: true });
    saveIntention('2026-11-17', 'Move slowly.');
    saveRested('2026-11-17', true);

    clearWelcomeStorage();

    expect(loadProfile().welcomed).toBe(false);
    expect(loadIntention('2026-11-17')).toBe('');
    expect(loadRested('2026-11-17')).toBe(false);
  });
});
