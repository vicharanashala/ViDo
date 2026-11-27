const QUOTE_PREFIX = 'vido.quote.';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadOwnQuote(dateKey: string): string | null {
  const store = storage();
  if (!store) return null;
  try {
    const value = store.getItem(`${QUOTE_PREFIX}${dateKey}`);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function saveOwnQuote(dateKey: string, text: string): void {
  const store = storage();
  if (!store) return;
  try {
    if (!text.trim()) {
      store.removeItem(`${QUOTE_PREFIX}${dateKey}`);
      return;
    }
    store.setItem(`${QUOTE_PREFIX}${dateKey}`, text.trim());
  } catch {
    // Ignore blocked storage.
  }
}

export function clearOwnQuote(dateKey: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(`${QUOTE_PREFIX}${dateKey}`);
  } catch {
    // Ignore blocked storage.
  }
}
