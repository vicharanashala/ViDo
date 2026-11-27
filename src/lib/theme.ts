import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type ThemeMode = 'auto' | 'light' | 'evening' | 'dark';
export type ResolvedTheme = 'light' | 'evening' | 'dark';

export const THEME_STORAGE_KEY = 'vido_theme_mode';

/**
 * Returns:
 * - 'evening' (Sunrise / Dawn & Sunset / Dusk with warm reddish atmosphere)
 *   between 05:00 and 07:59 inclusive (Dawn/Sunrise) AND between 17:00 and 19:59 inclusive (Dusk/Sunset)
 * - 'light' (Radiant Midday Sun) between 08:00 and 16:59 inclusive
 * - 'dark' (Cosmic Moon / Night) between 20:00 and 04:59 inclusive
 */
export function getSystemDayPeriod(date: Date = new Date()): ResolvedTheme {
  const hours = date.getHours();
  // Sunrise / Dawn (05:00-07:59) & Sunset / Dusk (17:00-19:59)
  if ((hours >= 5 && hours < 8) || (hours >= 17 && hours < 20)) return 'evening';
  // Radiant Midday Sun (08:00-16:59)
  if (hours >= 8 && hours < 17) return 'light';
  // Cosmic Moon (20:00-04:59)
  return 'dark';
}

/**
 * Safely reads the user's stored theme preference from localStorage.
 */
export function getStoredThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'evening' || stored === 'dark' || stored === 'auto') {
      return stored;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return 'auto';
}

/**
 * Resolves the effective theme based on mode and time.
 */
export function resolveTheme(mode: ThemeMode, date: Date = new Date()): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'evening') return 'evening';
  if (mode === 'dark') return 'dark';
  return getSystemDayPeriod(date);
}

/**
 * Synchronizes the theme mode to documentElement attribute and class.
 */
export function applyThemeToDocument(theme: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark' || theme === 'evening') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Initializes theme synchronously to prevent flash of wrong theme before render.
 */
export function initializeTheme(): ResolvedTheme {
  const mode = getStoredThemeMode();
  const resolved = resolveTheme(mode);
  applyThemeToDocument(resolved);
  return resolved;
}

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  isDay: boolean;
  isEvening: boolean;
  isNight: boolean;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(getStoredThemeMode);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const resolvedTheme = useMemo(() => resolveTheme(mode, currentDate), [mode, currentDate]);
  const isDay = resolvedTheme === 'light';
  const isEvening = resolvedTheme === 'evening';
  const isNight = resolvedTheme === 'dark';

  // Apply to document when resolved theme changes
  useEffect(() => {
    applyThemeToDocument(resolvedTheme);
  }, [resolvedTheme]);

  // Periodic 60-second ticker to smoothly handle dawn/dusk transitions in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;

    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, [mode]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch {
      // Ignore
    }
    const nextResolved = resolveTheme(newMode, currentDate);
    applyThemeToDocument(nextResolved);
  };

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      isDay,
      isEvening,
      isNight,
      setMode,
    }),
    [mode, resolvedTheme, isDay, isEvening, isNight]
  );

  return React.createElement(ThemeContext.Provider, { value }, children);
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if rendered outside provider (e.g. isolated unit tests)
    const mode = getStoredThemeMode();
    const resolvedTheme = resolveTheme(mode);
    return {
      mode,
      resolvedTheme,
      isDay: resolvedTheme === 'light',
      isEvening: resolvedTheme === 'evening',
      isNight: resolvedTheme === 'dark',
      setMode: (newMode: ThemeMode) => {
        try {
          localStorage.setItem(THEME_STORAGE_KEY, newMode);
        } catch {
          // Ignore
        }
        const resolved = resolveTheme(newMode);
        applyThemeToDocument(resolved);
      },
    };
  }
  return context;
};
