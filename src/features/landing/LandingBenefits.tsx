import React from 'react';
import { Badge } from '../../components/ui';
import { Eye, History, Shield, MessageSquareOff } from 'lucide-react';

export const LandingBenefits: React.FC = () => {
  const principles = [
    {
      icon: <Eye className="w-5 h-5 text-[var(--accent)]" />,
      title: 'Clarity over complexity',
      desc: 'No endless configuration screens or micro-toggles. Everything is organized so you can answer what needs to be done in seconds.',
    },
    {
      icon: <History className="w-5 h-5 text-[var(--green)]" />,
      title: 'History over guesswork',
      desc: 'Measurable progress checkpoints and completion timestamps replace vague "in progress" statuses with observable evidence.',
    },
    {
      icon: <Shield className="w-5 h-5 text-[var(--amber)]" />,
      title: 'Privacy by default',
      desc: 'Your private tasks are strictly your own. Sharing is an intentional action, keeping your personal life separate from work.',
    },
    {
      icon: <MessageSquareOff className="w-5 h-5 text-indigo-600" />,
      title: 'Collaboration without noise',
      desc: 'Clear task ownership and chronological checkpoint timelines answer "what is the status?" without scheduling another meeting.',
    },
  ];

  return (
    <section id="benefits" className="px-6 max-w-6xl mx-auto py-16 border-t border-[var(--line)]">
      <div className="text-center mb-12">
        <Badge variant="neutral" className="mb-2">
          Product Principles
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
          Built on principles that respect your attention
        </h2>
        <p className="text-sm text-[var(--muted)] mt-2 max-w-xl mx-auto">
          ViDo is purposefully restrained. We resist adding features that clutter your day with unnecessary notifications or guilt.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {principles.map((p, i) => (
          <div
            key={i}
            className="p-5 rounded-xl border border-[var(--line-glass)] bg-[var(--surface-glass-card)] backdrop-blur-md shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--canvas)] flex items-center justify-center mb-4">
                {p.icon}
              </div>
              <h3 className="text-base font-bold text-[var(--ink)] mb-2">{p.title}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

