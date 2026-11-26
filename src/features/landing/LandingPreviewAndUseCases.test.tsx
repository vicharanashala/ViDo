import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPreview } from './LandingPreview';
import { LandingUseCases } from './LandingUseCases';

describe('LandingPreview and LandingUseCases', () => {
  it('renders an empty dashboard preview frame and date', () => {
    render(<LandingPreview />);
    expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();
    expect(screen.getByText(/17 Nov 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/vido\.app\/preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Today \(0\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/review q4 budget/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/insurance declaration/i)).not.toBeInTheDocument();
  });

  it('renders Personal, Home, and Work use cases', () => {
    render(<LandingUseCases />);
    expect(screen.getByText('Personal Tasks')).toBeInTheDocument();
    expect(screen.getByText('Household & Living')).toBeInTheDocument();
    expect(screen.getByText('Work & Projects')).toBeInTheDocument();
  });
});
