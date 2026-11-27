import React, { useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { applyTheme, loadTheme, saveTheme, type ThemeChoice } from '../../lib/themeStore';

const OPTIONS: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Day', Icon: Sun },
  { value: 'dark', label: 'Night', Icon: Moon },
];

export const ThemeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [choice, setChoice] = useState<ThemeChoice>(() => loadTheme());

  const choose = (value: ThemeChoice) => {
    setChoice(value);
    saveTheme(value);
    applyTheme(value);
  };

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--canvas)] p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-pressed={choice === value}
          onClick={() => choose(value)}
          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-semibold transition-colors ${
            choice === value
              ? 'bg-[var(--surface)] text-[var(--ink)] shadow-xs'
              : 'text-[var(--muted)] hover:text-[var(--ink)]'
          }`}
        >
          <Icon className="h-3 w-3" />
          {!compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
};
