import { useSyncExternalStore } from 'react';

/**
 * Time-driven atmosphere tokens sampled from the supplied weather reference.
 * The values are interpolated between keyframes and published as CSS custom
 * properties so every dashboard surface can share one continuous sky theme.
 */

type RGBA = { r: number; g: number; b: number; a: number };

export interface Atmosphere {
  top: string;
  mid: string;
  low: string;
  glow: string;
  haze: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  muted: string;
  faint: string;
  line: string;
  lineStrong: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  green: string;
  greenSoft: string;
  amber: string;
  amberSoft: string;
  red: string;
  redSoft: string;
  shadow: string;
  chrome: string;
  rainTop: string;
  rainMid: string;
  rainLow: string;
  daylight: number;
}

interface AtmosphereStop {
  at: number;
  palette: Atmosphere;
}

const DAY_MINUTES = 24 * 60;
const COLOR_KEYS = [
  'top',
  'mid',
  'low',
  'glow',
  'haze',
  'surface',
  'surfaceStrong',
  'text',
  'muted',
  'faint',
  'line',
  'lineStrong',
  'accent',
  'onAccent',
  'accentSoft',
  'green',
  'greenSoft',
  'amber',
  'amberSoft',
  'red',
  'redSoft',
  'shadow',
  'chrome',
  'rainTop',
  'rainMid',
  'rainLow',
] as const;

type ColorKey = (typeof COLOR_KEYS)[number];

function parseColor(color: string): RGBA {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) throw new Error(`Unsupported atmosphere color: ${color}`);
  const parts = match[1].split(',').map((p) => Number(p.trim()));
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 };
}

function formatColor(color: RGBA): string {
  const r = Math.round(color.r);
  const g = Math.round(color.g);
  const b = Math.round(color.b);
  return color.a >= 0.999
    ? `rgb(${r}, ${g}, ${b})`
    : `rgba(${r}, ${g}, ${b}, ${Number(color.a.toFixed(3))})`;
}

function mixColor(from: string, to: string, amount: number): string {
  const a = parseColor(from);
  const b = parseColor(to);
  return formatColor({
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount,
    a: a.a + (b.a - a.a) * amount,
  });
}

const FOREGROUND_KEYS: readonly ColorKey[] = [
  'surface',
  'surfaceStrong',
  'text',
  'muted',
  'faint',
  'line',
  'lineStrong',
  'accent',
  'onAccent',
  'accentSoft',
  'green',
  'greenSoft',
  'amber',
  'amberSoft',
  'red',
  'redSoft',
  'shadow',
  'chrome',
];

function mixPalette(from: Atmosphere, to: Atmosphere, amount: number): Atmosphere {
  const mixed = {} as Atmosphere;
  for (const key of COLOR_KEYS) {
    mixed[key] = mixColor(from[key], to[key], amount);
  }
  mixed.daylight = from.daylight + (to.daylight - from.daylight) * amount;

  // Foreground colours must never pass through a low-contrast grey while the
  // sky interpolates. Keep the readable set from the nearest daylight endpoint
  // (ties stay on the earlier palette); registered CSS custom properties then
  // crossfade the change smoothly.
  const current = Number(mixed.daylight.toFixed(3));
  const fromDistance = Number(Math.abs(current - from.daylight).toFixed(3));
  const toDistance = Number(Math.abs(current - to.daylight).toFixed(3));
  const foreground = amount > 0 && (amount >= 1 || toDistance < fromDistance) ? to : from;
  for (const key of FOREGROUND_KEYS) {
    mixed[key] = formatColor(parseColor(foreground[key]));
  }
  return mixed;
}

const RAIN_TOP = '#2a558a';
const RAIN_MID = '#3c608e';
const RAIN_LOW = '#576a84';

const NIGHT: Atmosphere = {
  top: '#0b1c44',
  mid: '#0c1d3d',
  low: '#081836',
  glow: 'rgba(148, 197, 255, 0.16)',
  haze: 'rgba(18, 36, 72, 0.45)',
  surface: 'rgba(15, 30, 62, 0.86)',
  surfaceStrong: 'rgba(12, 25, 52, 0.94)',
  text: '#f8fafc',
  muted: '#aab8cf',
  faint: '#7f90ad',
  line: 'rgba(148, 163, 184, 0.24)',
  lineStrong: 'rgba(148, 163, 184, 0.42)',
  accent: '#7aa7ff',
  onAccent: '#06122a',
  accentSoft: 'rgba(122, 167, 255, 0.18)',
  green: '#4ade80',
  greenSoft: 'rgba(74, 222, 128, 0.14)',
  amber: '#fbbf24',
  amberSoft: 'rgba(251, 191, 36, 0.14)',
  red: '#f87171',
  redSoft: 'rgba(248, 113, 113, 0.14)',
  shadow: 'rgba(2, 8, 23, 0.45)',
  chrome: '#0a1226',
  rainTop: RAIN_TOP,
  rainMid: RAIN_MID,
  rainLow: RAIN_LOW,
  daylight: 0,
};

const DAWN: Atmosphere = {
  top: '#0c214c',
  mid: '#132849',
  low: '#12243e',
  glow: 'rgba(148, 197, 255, 0.22)',
  haze: 'rgba(30, 58, 95, 0.48)',
  surface: 'rgba(19, 40, 73, 0.86)',
  surfaceStrong: 'rgba(14, 31, 60, 0.94)',
  text: '#f1f5f9',
  muted: '#b6c4d8',
  faint: '#8ea1bb',
  line: 'rgba(148, 163, 184, 0.28)',
  lineStrong: 'rgba(148, 163, 184, 0.46)',
  accent: '#8fb8ff',
  onAccent: '#07142c',
  accentSoft: 'rgba(143, 184, 255, 0.18)',
  green: '#4ade80',
  greenSoft: 'rgba(74, 222, 128, 0.14)',
  amber: '#fbbf24',
  amberSoft: 'rgba(251, 191, 36, 0.16)',
  red: '#f87171',
  redSoft: 'rgba(248, 113, 113, 0.14)',
  shadow: 'rgba(4, 12, 32, 0.4)',
  chrome: '#0c1a34',
  rainTop: RAIN_TOP,
  rainMid: RAIN_MID,
  rainLow: RAIN_LOW,
  daylight: 0.25,
};

const DAY: Atmosphere = {
  top: '#4489dd',
  mid: '#a0c4ef',
  low: '#e5eef7',
  glow: 'rgba(253, 224, 71, 0.28)',
  haze: 'rgba(255, 255, 255, 0.30)',
  surface: 'rgba(255, 255, 255, 0.82)',
  surfaceStrong: 'rgba(255, 255, 255, 0.94)',
  text: '#16233a',
  muted: '#5b6b82',
  faint: '#7b8aa0',
  line: 'rgba(71, 105, 145, 0.18)',
  lineStrong: 'rgba(71, 105, 145, 0.36)',
  accent: '#305fdd',
  onAccent: '#ffffff',
  accentSoft: 'rgba(48, 95, 221, 0.10)',
  green: '#247a56',
  greenSoft: 'rgba(36, 122, 86, 0.10)',
  amber: '#936019',
  amberSoft: 'rgba(147, 96, 25, 0.10)',
  red: '#a44747',
  redSoft: 'rgba(164, 71, 71, 0.10)',
  shadow: 'rgba(30, 63, 105, 0.16)',
  chrome: '#17345c',
  rainTop: RAIN_TOP,
  rainMid: RAIN_MID,
  rainLow: RAIN_LOW,
  daylight: 1,
};

const DUSK: Atmosphere = {
  top: '#2b568a',
  mid: '#44648c',
  low: '#546985',
  glow: 'rgba(244, 148, 116, 0.30)',
  haze: 'rgba(43, 86, 138, 0.42)',
  surface: 'rgba(39, 76, 120, 0.84)',
  surfaceStrong: 'rgba(30, 61, 99, 0.94)',
  text: '#f8fafc',
  muted: '#d6e2ef',
  faint: '#aebfd3',
  line: 'rgba(226, 232, 240, 0.28)',
  lineStrong: 'rgba(226, 232, 240, 0.46)',
  accent: '#9dc4ff',
  onAccent: '#061529',
  accentSoft: 'rgba(157, 196, 255, 0.18)',
  green: '#4ade80',
  greenSoft: 'rgba(74, 222, 128, 0.14)',
  amber: '#fbbf24',
  amberSoft: 'rgba(251, 191, 36, 0.16)',
  red: '#f87171',
  redSoft: 'rgba(248, 113, 113, 0.14)',
  shadow: 'rgba(6, 18, 40, 0.42)',
  chrome: '#0f2440',
  rainTop: RAIN_TOP,
  rainMid: RAIN_MID,
  rainLow: RAIN_LOW,
  daylight: 0.35,
};

const STOPS: AtmosphereStop[] = [
  { at: 0, palette: NIGHT },
  { at: 6 * 60, palette: NIGHT },
  { at: 7 * 60, palette: DAWN },
  { at: 8 * 60, palette: DAY },
  { at: 18 * 60, palette: DAY },
  { at: 18.5 * 60, palette: DUSK },
  { at: 19 * 60, palette: NIGHT },
  { at: DAY_MINUTES, palette: NIGHT },
];

function normalizeMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 12 * 60;
  return ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
}

function smoothstep(value: number): number {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

export function getAtmosphere(minutes: number): Atmosphere {
  const value = normalizeMinutes(minutes);
  for (let i = 1; i < STOPS.length; i++) {
    const from = STOPS[i - 1];
    const to = STOPS[i];
    if (value <= to.at) {
      const progress = smoothstep((value - from.at) / (to.at - from.at));
      return mixPalette(from.palette, to.palette, progress);
    }
  }
  return NIGHT;
}

const CSS_VARIABLES: Record<ColorKey, string> = {
  top: '--atmo-top',
  mid: '--atmo-mid',
  low: '--atmo-low',
  glow: '--atmo-glow',
  haze: '--atmo-haze',
  surface: '--atmo-surface',
  surfaceStrong: '--atmo-surface-strong',
  text: '--atmo-text',
  muted: '--atmo-muted',
  faint: '--atmo-faint',
  line: '--atmo-line',
  lineStrong: '--atmo-line-strong',
  accent: '--atmo-accent',
  onAccent: '--atmo-on-accent',
  accentSoft: '--atmo-accent-soft',
  green: '--atmo-green',
  greenSoft: '--atmo-green-soft',
  amber: '--atmo-amber',
  amberSoft: '--atmo-amber-soft',
  red: '--atmo-red',
  redSoft: '--atmo-red-soft',
  shadow: '--atmo-shadow',
  chrome: '--atmo-chrome',
  rainTop: '--atmo-rain-top',
  rainMid: '--atmo-rain-mid',
  rainLow: '--atmo-rain-low',
};

/** Publish a palette to the document root once per time change. */
export function applyAtmosphere(minutes: number): Atmosphere {
  const palette = getAtmosphere(minutes);
  if (typeof document === 'undefined') return palette;

  const root = document.documentElement;
  for (const key of COLOR_KEYS) {
    root.style.setProperty(CSS_VARIABLES[key], palette[key]);
  }
  root.style.setProperty('--atmo-daylight', palette.daylight.toFixed(3));

  return palette;
}

let currentMinutes = 12 * 60;
const listeners = new Set<() => void>();

export function getAtmosphereMinutes(): number {
  return currentMinutes;
}

export function setAtmosphereMinutes(minutes: number): void {
  const next = normalizeMinutes(minutes);
  if (next === currentMinutes) return;
  currentMinutes = next;
  applyAtmosphere(next);
  listeners.forEach((listener) => listener());
}

export function subscribeAtmosphere(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAtmosphereMinutes(): number {
  return useSyncExternalStore(subscribeAtmosphere, getAtmosphereMinutes, getAtmosphereMinutes);
}

if (typeof document !== 'undefined') {
  applyAtmosphere(currentMinutes);
}
