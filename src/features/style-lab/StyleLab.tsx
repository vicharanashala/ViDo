import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge, Card, Input } from '../../components/ui';
import { CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Doodle } from '../workspace/doodles/Doodles';
import { DOODLE_LABELS, type DoodleKind } from '../workspace/doodles/doodleMap';

export type AccentCandidate = 'clay' | 'blue' | 'indigo' | 'green';

export const ACCENTS: { id: AccentCandidate; name: string; hex: string; bgHex: string; desc: string }[] = [
  {
    id: 'clay',
    name: 'Warm Clay',
    hex: '#c45a3c',
    bgHex: '#f9e7df',
    desc: 'Warm, human, and editorial. Pairs with the cream canvas for a calmer daily workspace.',
  },
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
  const [activeAccent, setActiveAccent] = useState<AccentCandidate>('clay');

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', activeAccent);
  }, [activeAccent]);

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
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
                to="/app"
                className="text-xs font-semibold text-[var(--accent)] hover:underline"
              >
                Go to App
              </Link>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">ViDo Theme & Accent Lab</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Select and preview your preferred accent palette across all workspace components.
            </p>
          </div>
        </div>

        {/* Accent Selection Panel */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>1. Choose Accent Palette</span>
            <Badge variant="accent">Theme Switcher</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACCENTS.map((accent) => {
              const isSelected = activeAccent === accent.id;
              return (
                <div
                  key={accent.id}
                  onClick={() => setActiveAccent(accent.id)}
                  className={`p-4 rounded-xl border bg-[var(--surface)] cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--accent)] ring-2 ring-[var(--accent)] ring-offset-2 shadow-sm'
                      : 'border-[var(--line)] hover:border-gray-300'
                  }`}
                  data-testid={`accent-card-${accent.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-sm">{accent.name}</span>
                    <span
                      className="w-5 h-5 rounded-full border border-black/10"
                      style={{ backgroundColor: accent.hex }}
                    />
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">{accent.desc}</p>
                  <div className="flex items-center justify-between text-xs font-mono text-[var(--faint)] border-t border-[var(--line)] pt-2">
                    <span>{accent.hex}</span>
                    <span className="text-[10px] uppercase font-bold">{isSelected ? 'Active' : 'Select'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Component Showcase */}
        <section className="space-y-6">
          <h2 className="text-lg font-semibold">2. Live Component Preview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <Card>
              <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
                Buttons
              </h3>
              <div className="flex flex-wrap gap-3 mb-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="ghost">Ghost Action</Button>
                <Button variant="danger">Danger</Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button variant="secondary" size="sm">
                  Small Secondary
                </Button>
                <Button variant="primary" size="lg">
                  Large Primary
                </Button>
              </div>
            </Card>

            {/* Badges */}
            <Card>
              <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
                Badges & Statuses
              </h3>
              <div className="flex flex-wrap gap-2.5">
                <Badge variant="accent">In Progress</Badge>
                <Badge variant="success">Completed</Badge>
                <Badge variant="warning">Needs Attention</Badge>
                <Badge variant="danger">Overdue</Badge>
                <Badge variant="neutral">Draft</Badge>
                <Badge variant="accent" size="sm">
                  Small Tag
                </Badge>
              </div>
            </Card>

            {/* Form Inputs */}
            <Card>
              <h3 className="text-sm font-semibold mb-4 text-[var(--muted)] uppercase tracking-wider">
                Form Inputs
              </h3>
              <div className="space-y-3.5">
                <Input label="Task Title" placeholder="e.g., Prepare quarterly budget review" />
                <Input
                  label="Target Deadline"
                  defaultValue="17 November 2026, 17:00"
                  helperText="Exact date and time format"
                />
                <Input label="Invalid Field Example" error="Title cannot be empty" />
              </div>
            </Card>

            {/* Card & Elevation */}
            <Card hoverable>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="accent" size="sm" className="mb-2">
                    Work Workspace
                  </Badge>
                  <h4 className="text-base font-semibold">Prepare Q4 Strategic Product Roadmap</h4>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Align strategic goals, team allocations, and key deliverables.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-medium text-[var(--amber)] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Due Today
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" /> 2 Checkpoints logged
                </span>
                <span className="font-semibold text-[var(--accent)]">Inspect Task →</span>
              </div>
            </Card>
          </div>
        </section>

        {/* Doodle Library */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">3. Doodle Library</h2>
            <p className="text-xs text-[var(--muted)] mt-1">
              Recognised task titles become these illustrated titles. Unrecognised tasks stay as text.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.keys(DOODLE_LABELS) as DoodleKind[]).map((kind) => {
              const meta = DOODLE_LABELS[kind];
              return (
                <div
                  key={kind}
                  className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
                >
                  <div className="w-16 h-12 shrink-0 text-[var(--ink)]">
                    <Doodle kind={kind} />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{meta.label}</span>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">{meta.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Accessibility & Focus Verification */}
        <section className="p-5 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold">Keyboard Focus Accessibility</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Press the <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">Tab</kbd> key to navigate between cards, inputs, and buttons. Interactive elements feature a high-contrast focus ring with explicit offset to meet accessibility standards.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
