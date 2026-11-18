import { beforeEach, describe, expect, it } from 'vitest';
import {
  findAccount,
  isValidEmail,
  loadSession,
  requestOtp,
  updateAccount,
  verifyOtp,
} from './accountStore';

const draft = {
  name: 'Asha',
  email: 'asha@example.com',
  dob: '1995-04-12',
  phone: '+910000000000',
  prefix: 'Ms.',
};

describe('accountStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('validates email addresses', () => {
    expect(isValidEmail('asha@example.com')).toBe(true);
    expect(isValidEmail('not-an-email')).toBe(false);
  });

  it('registers with email and a one-time code', () => {
    const { code } = requestOtp('asha@example.com', draft);
    const account = verifyOtp('asha@example.com', code);

    expect(account?.name).toBe('Asha');
    expect(account?.dob).toBe('1995-04-12');
    expect(findAccount('asha@example.com')?.email).toBe('asha@example.com');
    expect(loadSession()?.email).toBe('asha@example.com');
  });

  it('rejects a wrong code and can update the profile', () => {
    const { code } = requestOtp('asha@example.com', draft);
    expect(verifyOtp('asha@example.com', '000000')).toBeNull();

    verifyOtp('asha@example.com', code);
    const updated = updateAccount('asha@example.com', { name: 'Asha Rao' });
    expect(updated?.name).toBe('Asha Rao');
    expect(loadSession()?.name).toBe('Asha Rao');
  });
});
