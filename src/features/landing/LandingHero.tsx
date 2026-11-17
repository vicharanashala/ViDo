import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from '../../components/ui';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LandingHero: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-2 mb-6">
        <Badge variant="accent" size="md">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          A calmer way to get things done
        </Badge>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--ink)] leading-[1.12]">
        Simple enough for anyone.{' '}
        <span className="text-[var(--accent)] block sm:inline">Structured enough for serious work.</span>
      </h1>

      <p className="mt-6 text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto font-normal leading-relaxed">
        A calm, focused task workspace for personal errands, household responsibilities, and professional
        deadlines — with progress you can actually see.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/app')}
          className="w-full sm:w-auto shadow-md"
        >
          Open Workspace <ArrowRight className="w-4 h-4 ml-1" />
        </Button>

        <a href="#preview" className="w-full sm:w-auto">
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            See how it works
          </Button>
        </a>
      </div>

      <p className="mt-3 text-xs text-[var(--faint)]">
        No account needed. Your tasks are saved on this device.
      </p>
    </section>
  );
};
