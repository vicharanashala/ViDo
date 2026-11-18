import React from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingPreview } from './LandingPreview';
import { LandingUseCases } from './LandingUseCases';
import { LandingBenefits } from './LandingBenefits';
import { LandingFooter } from './LandingFooter';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--ink)] flex flex-col justify-between selection:bg-[var(--accent-soft)] selection:text-[var(--accent)]">
      <div>
        <LandingHeader />
        <main>
          <LandingHero />
          <LandingPreview />
          <LandingUseCases />
          <LandingBenefits />
        </main>
      </div>

      <LandingFooter />
    </div>
  );
};
