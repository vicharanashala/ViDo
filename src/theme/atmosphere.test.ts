import { describe, it, expect } from 'vitest';
import { applyAtmosphere, getAtmosphere } from './atmosphere';

describe('atmosphere theme', () => {
  it('uses the sampled night and day sky colors', () => {
    expect(getAtmosphere(0).top).toBe('rgb(11, 28, 68)');
    expect(getAtmosphere(12 * 60).top).toBe('rgb(68, 137, 221)');
    expect(getAtmosphere(12 * 60).low).toBe('rgb(229, 238, 247)');
  });

  it('transitions night to day between 6 AM and 8 AM without jumps', () => {
    const six = getAtmosphere(6 * 60);
    const seven = getAtmosphere(7 * 60);
    const eight = getAtmosphere(8 * 60);

    expect(six.top).toBe('rgb(11, 28, 68)');
    expect(seven.top).not.toBe(six.top);
    expect(seven.top).not.toBe(eight.top);
    expect(getAtmosphere(7 * 60 + 59).top).toBe(eight.top);
  });

  it('transitions day to night between 6 PM and 7 PM', () => {
    expect(getAtmosphere(18 * 60).top).toBe('rgb(68, 137, 221)');
    expect(getAtmosphere(18.5 * 60).top).toBe('rgb(43, 86, 138)');
    expect(getAtmosphere(19 * 60).top).toBe('rgb(11, 28, 68)');
    expect(getAtmosphere(18 * 60 + 59).top).toBe(getAtmosphere(19 * 60).top);
  });

  it('keeps foreground readable through dawn and dusk transitions', () => {
    expect(getAtmosphere(7 * 60 + 30).text).toBe('rgb(241, 245, 249)');
    expect(getAtmosphere(7 * 60 + 30).surface).toBe('rgba(19, 40, 73, 0.86)');
    expect(getAtmosphere(18 * 60 + 30).text).toBe('rgb(248, 250, 252)');
    expect(getAtmosphere(18 * 60 + 30).surface).toBe('rgba(39, 76, 120, 0.84)');
    expect(getAtmosphere(19 * 60).surface).toBe('rgba(15, 30, 62, 0.86)');
  });

  it('publishes the palette as reusable CSS variables', () => {
    applyAtmosphere(12 * 60);
    const root = document.documentElement;

    expect(root.style.getPropertyValue('--atmo-top')).toBe('rgb(68, 137, 221)');
    expect(root.style.getPropertyValue('--atmo-text')).toBe('rgb(22, 35, 58)');
    expect(root.style.getPropertyValue('--atmo-rain-top')).toBe('rgb(42, 85, 138)');
    expect(root.style.getPropertyValue('--atmo-daylight')).toBe('1.000');
  });
});
