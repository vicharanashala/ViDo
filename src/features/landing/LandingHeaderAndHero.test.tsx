import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';

describe('LandingHeader and LandingHero', () => {
  it('renders the header with navigation and an app entry link', () => {
    render(
      <BrowserRouter>
        <LandingHeader />
      </BrowserRouter>
    );

    expect(screen.getByText('ViDo')).toBeInTheDocument();
    expect(screen.getByText('Themes')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open app/i })).toBeInTheDocument();
  });

  it('renders the universal hero message and CTAs', () => {
    render(
      <BrowserRouter>
        <LandingHero />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', {
        name: /simple enough for anyone\. structured enough for serious work\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /open workspace/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see how it works/i })).toHaveAttribute('href', '#preview');
  });
});
