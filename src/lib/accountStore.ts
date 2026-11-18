export interface Account {
  id: string;
  name: string;
  email: string;
  dob: string;
  phone?: string;
  prefix?: string;
  createdAt: string;
}

interface PendingOtp {
  email: string;
  code: string;
  expiresAt: number;
  draft?: Omit<Account, 'id' | 'createdAt'>;
}

const ACCOUNTS_KEY = 'vido.accounts.v1';
const SESSION_KEY = 'vido.session.v1';
const OTP_KEY = 'vido.otp.v1';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function loadAccounts(): Account[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore blocked storage.
  }
}

export function loadSession(): Account | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Account;
    return typeof parsed?.email === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

function saveSession(account: Account): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(SESSION_KEY, JSON.stringify(account));
  } catch {
    // Ignore blocked storage.
  }
}

export function clearSession(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(SESSION_KEY);
  } catch {
    // Ignore blocked storage.
  }
}

function savePendingOtp(pending: PendingOtp): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(OTP_KEY, JSON.stringify(pending));
  } catch {
    // Ignore blocked storage.
  }
}

function loadPendingOtp(): PendingOtp | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(OTP_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingOtp;
  } catch {
    return null;
  }
}

export function requestOtp(
  email: string,
  draft?: Omit<Account, 'id' | 'createdAt'>
): { code: string; expiresAt: number } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  savePendingOtp({ email: email.trim().toLowerCase(), code, expiresAt, draft });
  return { code, expiresAt };
}

export function verifyOtp(email: string, code: string): Account | null {
  const pending = loadPendingOtp();
  if (!pending) return null;
  if (pending.code !== code.trim()) return null;
  if (Date.now() > pending.expiresAt) return null;
  if (pending.email !== email.trim().toLowerCase()) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const accounts = loadAccounts();
  let account = accounts.find((item) => item.email === normalizedEmail) ?? null;

  if (!account && pending.draft) {
    account = {
      ...pending.draft,
      id: `account-${Date.now().toString(36)}`,
      email: normalizedEmail,
      createdAt: new Date().toISOString(),
    };
    saveAccounts([account, ...accounts]);
  }

  if (!account) return null;

  saveSession(account);
  const store = storage();
  try { store?.removeItem(OTP_KEY); } catch { /* ignored */ }
  return account;
}

export function registerAccount(input: Omit<Account, 'id' | 'createdAt'>): Account | null {
  const email = input.email.trim().toLowerCase();
  const accounts = loadAccounts();
  if (accounts.some((account) => account.email === email)) return null;
  const account: Account = {
    ...input,
    email,
    id: `account-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  saveAccounts([account, ...accounts]);
  saveSession(account);
  const store = storage();
  try { store?.removeItem(OTP_KEY); } catch { /* ignored */ }
  return account;
}

export function findAccount(email: string): Account | null {
  return loadAccounts().find((account) => account.email === email.trim().toLowerCase()) ?? null;
}

export function updateAccount(email: string, patch: Partial<Account>): Account | null {
  const normalized = email.trim().toLowerCase();
  const accounts = loadAccounts();
  const index = accounts.findIndex((account) => account.email === normalized);
  if (index < 0) return null;
  const next = { ...accounts[index], ...patch, email: normalized };
  accounts[index] = next;
  saveAccounts(accounts);
  if (loadSession()?.email === normalized) saveSession(next);
  return next;
}
