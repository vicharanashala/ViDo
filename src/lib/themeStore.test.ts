import { beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, loadTheme, resolvedTheme, saveTheme } from './themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('defaults to system and remembers a choice', () => {
    expect(loadTheme()).toBe('system');
    saveTheme('dark');
    expect(loadTheme()).toBe('dark');
    saveTheme('light');
    expect(loadTheme()).toBe('light');
  });

  it('resolves explicit choices and writes the data attribute', () => {
    expect(resolvedTheme('light')).toBe('light');
    expect(resolvedTheme('dark')).toBe('dark');
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    applyTheme('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('ignores unknown stored values', () => {
    window.localStorage.setItem('vido.theme.v1', 'sepia');
    expect(loadTheme()).toBe('system');
  });
});
