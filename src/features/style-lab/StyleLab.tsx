import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge, Card, Input } from '../../components/ui';
import { Clock, ArrowLeft, Sun, Sunset, Moon } from 'lucide-react';
import { useTheme } from '../../lib/theme';

export type AccentCandidate = 'blue' | 'indigo' | 'green';

export const ACCENTS: { id: AccentCandidate; name: string; hex: string; bgHex: string; desc: string }[] = [
  {
    id: 'blue',
    name: 'Cobalt Blue',
    hex: '#305fdd',
    bgHex: '#eef3ff',
    desc: 'Crisp, direct, and classic productivity tone. Ideal for clean modern workspaces.',
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    hex: '#4338ca',
    bgHex: '#eef2ff',
    desc: 'Warm, refined, professional software tone. Higher contrast against white surfaces.',
  },
  {
    id: 'green',
    name: 'Forest Green',
    hex: '#247a56',
    bgHex: '#eaf6f0',
    desc: 'Calm, grounded, organic focus. Emphasizes steady progress and low-anxiety execution.',
  },
];

export const StyleLab: React.FC = () => {
  const [activeAccent, setActiveAccent] = useState<AccentCandidate>('blue');
  const { mode: celestialMode, isDay, isEvening, setMode: setCelestialMode } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', activeAccent);
  }, [activeAccent]);

  return (
    <div className="min-h-screen bg-transparent text-[var(--ink)] p-6 md:p-12 relative">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line-glass)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                to="/"
                className="inline-flex items-center text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
              </Link>
              <span className="text-xs text-[var(--faint)]">•</span>
              <Link
                to="/preview"
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Go to Preview
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ViDo Theme & Accent Lab</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Select and preview your preferred celestial horizon atmosphere and accent palette across all workspace components.
            </p>
          </div>
        </div>

        {/* Section 1: Celestial Horizon Theme Switcher */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>1. Celestial Atmosphere & Horizon</span>
              <Badge variant="accent">Day / Night</Badge>
            </h2>
            <span className="text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-glass-card)] border border-[var(--line-glass)]">
              {isDay ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Active: Sun (Daytime)
                </>
              ) : isEvening ? (
                <>
                  <Sunset className="w-3.5 h-3.5 text-rose-500" /> Active: Evening (Sunset)
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Active: Moon (Nighttime)
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Auto (Clock) */}
            <div
              role="button"
              tabIndex={0}
              data-testid="stylelab-theme-auto"
              onClick={() => setCelestialMode('auto')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCelestialMode('auto')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                celestialMode === 'auto'
                  ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent-soft)] shadow-md'
                  : 'border-[var(--line-glass)] bg-[var(--surface-glass-card)] hover:bg-[var(--surface)]/90 backdrop-blur-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-[var(--accent)]" />
                <span className="font-bold text-base text-[var(--ink)]">Auto (Celestial Clock)</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Switches smoothly between Sun (06:00–17:00), Evening (17:00–20:00), and Moon (20:00–06:00).
              </p>
            </div>

            {/* Always Light (Sun) */}
            <div
              role="button"
              tabIndex={0}
              data-testid="stylelab-theme-light"
              onClick={() => setCelestialMode('light')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCelestialMode('light')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                celestialMode === 'light'
                  ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50 dark:bg-amber-950/20 shadow-md'
                  : 'border-[var(--line-glass)] bg-[var(--surface-glass-card)] hover:bg-[var(--surface)]/90 backdrop-blur-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-base text-[var(--ink)]">Light (Always Sun)</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Golden dawn horizon with light frosted glass cards and radiant solar highlights.
              </p>
            </div>

            {/* Always Evening (Sunset) */}
            <div
              role="button"
              tabIndex={0}
              data-testid="stylelab-theme-evening"
              onClick={() => setCelestialMode('evening')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCelestialMode('evening')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                celestialMode === 'evening'
                  ? 'border-rose-400 ring-2 ring-rose-400/30 bg-rose-50 dark:bg-rose-950/20 shadow-md'
                  : 'border-[var(--line-glass)] bg-[var(--surface-glass-card)] hover:bg-[var(--surface)]/90 backdrop-blur-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sunset className="w-5 h-5 text-rose-500" />
                <span className="font-bold text-base text-[var(--ink)]">Evening (Sunset)</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Fiery reddish horizon with setting sun, crimson aura, and warm twilight rose glass.
              </p>
            </div>

            {/* Always Dark (Moon) */}
            <div
              role="button"
              tabIndex={0}
              data-testid="stylelab-theme-dark"
              onClick={() => setCelestialMode('dark')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setCelestialMode('dark')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                celestialMode === 'dark'
                  ? 'border-indigo-400 ring-2 ring-indigo-400/30 bg-indigo-50 dark:bg-indigo-950/20 shadow-md'
                  : 'border-[var(--line-glass)] bg-[var(--surface-glass-card)] hover:bg-[var(--surface)]/90 backdrop-blur-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-base text-[var(--ink)]">Dark (Always Moon)</span>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Cosmic deep night with radiant bluish lunar glow, starlight fields, and midnight glass.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Accent Selection Panel */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>2. Choose Accent Palette</span>
            <Badge variant="accent">Theme Switcher</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACCENTS.map((accent) => {
              const isSelected = activeAccent === accent.id;
              return (
                <div
                  key={accent.id}
                  onClick={() => setActiveAccent(accent.id)}
                  className={`p-4 rounded-xl border bg-[var(--surface-glass-card)] backdrop-blur-md cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/20 shadow-sm'
                      : 'border-[var(--line-glass)] hover:border-gray-300'
                  }`}
                  data-testid={`accent-card-${accent.id}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: accent.hex }}
                    />
                    <div>
                      <span className="font-semibold text-sm block">{accent.name}</span>
                      <span className="text-xs font-mono text-[var(--muted)]">{accent.hex}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2">{accent.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Component Showcase */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">3. Component Showcase on Frosted Glass</h2>

          {/* Buttons */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              Button Variants
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="primary" disabled>
                Disabled Button
              </Button>
            </div>
          </Card>

          {/* Badges */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              Status Badges
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">Active Accent</Badge>
              <Badge variant="success">Completed</Badge>
              <Badge variant="warning">In Progress</Badge>
              <Badge variant="danger">High Priority</Badge>
              <Badge variant="neutral">Default Status</Badge>
            </div>
          </Card>

          {/* Form Inputs */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              Form Inputs & Focus Ring
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Task Title"
                placeholder="e.g. Renew passport by end of month"
                helperText="Focus this field to verify the visible focus indicator"
              />
              <Input
                label="Disabled State"
                value="Locked configuration value"
                disabled
                helperText="Disabled inputs remain readable but immutable"
              />
            </div>
          </Card>

          {/* Mock Task Card */}
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider">
              Task Card Preview
            </h3>
            <div className="p-4 rounded-xl border border-[var(--line-glass)] bg-[var(--surface-glass)]/90 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--accent)] flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Prepare presentation deck for client review</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Due Today at 5:00 PM
                    </span>
                    <span>•</span>
                    <Badge variant="warning" size="sm">
                      Medium Priority
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm">
                  View Details
                </Button>
                <Button variant="primary" size="sm">
                  Complete Task
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};
