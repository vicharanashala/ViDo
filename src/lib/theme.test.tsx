import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  getSystemDayPeriod,
  getStoredThemeMode,
  resolveTheme,
  applyThemeToDocument,
  initializeTheme,
  ThemeProvider,
  useTheme,
  THEME_STORAGE_KEY,
} from './theme';

describe('theme utilities and engine', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  describe('getSystemDayPeriod', () => {
    it('returns evening between 05:00 and 07:59 (dawn/sunrise)', () => {
      const sunriseEarly = new Date(2026, 10, 27, 5, 0, 0);
      const sunrise = new Date(2026, 10, 27, 6, 30, 0);
      const sunriseLate = new Date(2026, 10, 27, 7, 59, 59);

      expect(getSystemDayPeriod(sunriseEarly)).toBe('evening');
      expect(getSystemDayPeriod(sunrise)).toBe('evening');
      expect(getSystemDayPeriod(sunriseLate)).toBe('evening');
    });

    it('returns light between 08:00 and 16:59 (midday sun)', () => {
      const morning = new Date(2026, 10, 27, 8, 0, 0);
      const noon = new Date(2026, 10, 27, 12, 30, 0);
      const afternoon = new Date(2026, 10, 27, 16, 59, 59);

      expect(getSystemDayPeriod(morning)).toBe('light');
      expect(getSystemDayPeriod(noon)).toBe('light');
      expect(getSystemDayPeriod(afternoon)).toBe('light');
    });

    it('returns evening between 17:00 and 19:59 (dusk/sunset)', () => {
      const dusk = new Date(2026, 10, 27, 17, 0, 0);
      const sunset = new Date(2026, 10, 27, 18, 30, 0);
      const lateEvening = new Date(2026, 10, 27, 19, 59, 59);

      expect(getSystemDayPeriod(dusk)).toBe('evening');
      expect(getSystemDayPeriod(sunset)).toBe('evening');
      expect(getSystemDayPeriod(lateEvening)).toBe('evening');
    });

    it('returns dark between 20:00 and 04:59 (night moon)', () => {
      const night = new Date(2026, 10, 27, 20, 0, 0);
      const midnight = new Date(2026, 10, 27, 0, 0, 0);
      const preDawn = new Date(2026, 10, 27, 4, 59, 59);

      expect(getSystemDayPeriod(night)).toBe('dark');
      expect(getSystemDayPeriod(midnight)).toBe('dark');
      expect(getSystemDayPeriod(preDawn)).toBe('dark');
    });
  });

  describe('getStoredThemeMode and resolveTheme', () => {
    it('defaults to auto when no preference is stored', () => {
      expect(getStoredThemeMode()).toBe('auto');
    });

    it('reads stored preference when valid', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      expect(getStoredThemeMode()).toBe('dark');

      localStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(getStoredThemeMode()).toBe('light');
    });

    it('resolveTheme returns explicit mode when not auto', () => {
      const midnight = new Date(2026, 10, 27, 0, 0, 0);
      const noon = new Date(2026, 10, 27, 12, 0, 0);

      expect(resolveTheme('light', midnight)).toBe('light');
      expect(resolveTheme('dark', noon)).toBe('dark');
    });

    it('resolveTheme calculates based on time when mode is auto', () => {
      const midnight = new Date(2026, 10, 27, 0, 0, 0);
      const noon = new Date(2026, 10, 27, 12, 0, 0);

      expect(resolveTheme('auto', midnight)).toBe('dark');
      expect(resolveTheme('auto', noon)).toBe('light');
    });
  });

  describe('applyThemeToDocument & initializeTheme', () => {
    it('updates documentElement attributes correctly', () => {
      applyThemeToDocument('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      applyThemeToDocument('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('initializeTheme sets the theme on page load', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      const resolved = initializeTheme();
      expect(resolved).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('ThemeProvider and useTheme hook', () => {
    it('allows changing mode and updates documentElement and localStorage', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setMode('dark');
      });

      expect(result.current.mode).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDay).toBe(false);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

      act(() => {
        result.current.setMode('light');
      });

      expect(result.current.mode).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(result.current.isDay).toBe(true);
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });
  });
});
