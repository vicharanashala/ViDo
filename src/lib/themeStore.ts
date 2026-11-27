export type ThemeChoice = 'system' | 'light' | 'dark';

const THEME_KEY = 'vido.theme.v1';

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function prefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function loadTheme(): ThemeChoice {
  const store = storage();
  if (!store) return 'system';
  try {
    const value = store.getItem(THEME_KEY);
    return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(choice: ThemeChoice): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(THEME_KEY, choice);
  } catch {
    // Ignore blocked storage.
  }
}

export function resolvedTheme(choice: ThemeChoice): 'light' | 'dark' {
  if (choice === 'system') return prefersDark() ? 'dark' : 'light';
  return choice;
}

export function applyTheme(choice: ThemeChoice): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = resolvedTheme(choice);
}

/** Keep system following the OS while the choice is "system". */
export function watchSystemTheme(): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    if (loadTheme() === 'system') applyTheme('system');
  };
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }
  media.addListener(handler);
  return () => media.removeListener(handler);
}
