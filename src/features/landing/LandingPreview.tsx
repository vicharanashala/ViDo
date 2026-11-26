import React from 'react';
import { Badge } from '../../components/ui';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const LandingPreview: React.FC = () => {
  return (
    <section id="preview" className="px-6 max-w-6xl mx-auto py-12">
      <div className="text-center mb-8">
        <Badge variant="neutral" className="mb-2">
          Dashboard Overview
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--ink)]">
          Designed for clarity. Built without clutter.
        </h2>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-xl mx-auto">
          See how ViDo organizes your responsibilities into calm, section-limited views that keep you focused on what matters next.
        </p>
      </div>

      {/* Desktop Window Frame */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl overflow-hidden transition-all">
        {/* Browser Top Window Chrome */}
        <div className="bg-[var(--canvas)] border-b border-[var(--line)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <span className="ml-2 text-xs font-mono text-[var(--muted)]">vido.app/preview</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--muted)] bg-[var(--surface)] px-2.5 py-0.5 rounded-full border border-[var(--line)]">
            Today: 17 Nov 2026
          </span>
        </div>

        {/* Dashboard Shell Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-[460px]">
          {/* Mock Sidebar */}
          <div className="bg-[var(--dark)] text-white p-5 hidden md:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 rounded bg-white text-[var(--dark)] flex items-center justify-center font-black text-xs">
                V
              </div>
              <span className="font-bold text-sm">ViDo</span>
            </div>

            <div className="space-y-1 text-xs font-medium text-gray-400">
              <div className="p-2 rounded-lg bg-white/10 text-white font-semibold flex items-center justify-between">
                <span>Home</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">0</span>
              </div>
              <div className="p-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                <span>Today</span>
                <span className="text-[10px] text-gray-500">0</span>
              </div>
              <div className="p-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                <span>Upcoming</span>
                <span className="text-[10px] text-gray-500">0</span>
              </div>
              <div className="p-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                <span>Needs Attention</span>
                <span className="text-[10px] text-gray-500">0</span>
              </div>
              <div className="p-2 rounded-lg hover:bg-white/5 flex items-center justify-between">
                <span>Completed</span>
                <span className="text-[10px] text-gray-500">0</span>
              </div>
            </div>
          </div>

          {/* Mock Dashboard Content Area */}
          <div className="md:col-span-3 p-6 bg-[var(--canvas)] space-y-6">
            {/* Top Bar Mock */}
            <div className="flex items-center justify-between bg-[var(--surface)] p-3 rounded-xl border border-[var(--line)]">
              <span className="text-xs text-[var(--faint)]">Search tasks or filter by priority...</span>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-xs font-bold">
                  DU
                </span>
              </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Today Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> Today (0)
                  </h3>
                  <span className="text-[11px] text-[var(--accent)] font-semibold">View all</span>
                </div>

                <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)] shadow-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[var(--ink)]">No tasks for today yet</span>
                    <Badge variant="neutral" size="sm">Empty</Badge>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] mt-1 block">Add a task when you are ready to plan.</span>
                </div>
              </div>

              {/* Needs Attention Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--amber)] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Needs Attention (0)
                  </h3>
                  <span className="text-[11px] text-[var(--accent)] font-semibold">View all</span>
                </div>

                <div className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--line)] shadow-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[var(--ink)]">Nothing needs attention</span>
                    <Badge variant="neutral" size="sm">Clear</Badge>
                  </div>
                  <span className="text-[10px] text-[var(--muted)] mt-1 block">You are all caught up.</span>
                </div>
              </div>
            </div>

            {/* Recently Completed Section */}
            <div className="pt-2 border-t border-[var(--line)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--green)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Recently Completed (Last 7 Days)
                </h3>
                <span className="text-[11px] text-[var(--accent)] font-semibold">View all</span>
              </div>
              <div className="bg-[var(--surface)] p-2.5 rounded-lg border border-[var(--line)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">No completed tasks yet</span>
                <span className="text-[10px] text-[var(--muted)] font-medium">Start with one task</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
