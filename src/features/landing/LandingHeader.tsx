import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--dark)] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            V
          </div>
          <span className="font-display font-semibold text-xl tracking-tight text-[var(--ink)]">ViDo</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--muted)]">
          <a href="#preview" className="hover:text-[var(--ink)] transition-colors">
            Overview
          </a>
          <a href="#use-cases" className="hover:text-[var(--ink)] transition-colors">
            Use Cases
          </a>
          <a href="#benefits" className="hover:text-[var(--ink)] transition-colors">
            Principles
          </a>
          <Link to="/style-lab" className="hover:text-[var(--ink)] transition-colors">
            Themes
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/auth" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
            Sign in
          </Link>
          <Button variant="secondary" size="sm" onClick={() => navigate('/app')}>
            Open App
          </Button>
        </div>
      </div>
    </header>
  );
};
