import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPreview } from './LandingPreview';
import { LandingUseCases } from './LandingUseCases';

describe('LandingPreview and LandingUseCases', () => {
  it('renders the dashboard preview frame with a live date', () => {
    render(<LandingPreview />);
    expect(screen.getByText(/dashboard overview/i)).toBeInTheDocument();
    expect(screen.getByText(/today:/i)).toBeInTheDocument();
    expect(screen.getByText(/vido\.app\/app/i)).toBeInTheDocument();
    expect(screen.getByText(/Today \(4\)/i)).toBeInTheDocument();
  });

  it('renders Personal, Home, and Work use cases', () => {
    render(<LandingUseCases />);
    expect(screen.getByText('Personal Tasks')).toBeInTheDocument();
    expect(screen.getByText('Household & Living')).toBeInTheDocument();
    expect(screen.getByText('Work & Projects')).toBeInTheDocument();
  });
});
