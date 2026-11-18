import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-[var(--dark)] text-white flex items-center justify-center font-bold text-xs">
              V
            </div>
            <span className="font-display font-semibold text-lg text-[var(--ink)]">ViDo</span>
          </div>
          <p className="text-xs text-[var(--muted)] max-w-sm">
            Simple enough for anyone. Structured enough for serious work.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--muted)] font-medium">
          <Link to="/app" className="hover:text-[var(--ink)] transition-colors">
            Workspace
          </Link>
          <Link to="/style-lab" className="hover:text-[var(--ink)] transition-colors">
            Themes
          </Link>
          <a
            href="https://github.com/vicharanashala/ViDo"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--ink)] transition-colors"
          >
            GitHub Repository
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-[var(--line)] text-center text-xs text-[var(--faint)]">
        &copy; 2026 ViDo. All rights reserved.
      </div>
    </footer>
  );
};
