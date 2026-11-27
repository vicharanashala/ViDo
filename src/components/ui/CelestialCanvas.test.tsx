import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CelestialCanvas } from './CelestialCanvas';

describe('CelestialCanvas Component', () => {
  it('renders the celestial canvas container with test ID', () => {
    render(<CelestialCanvas />);
    const canvas = screen.getByTestId('celestial-canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders sun, evening, and moon celestial layers', () => {
    render(<CelestialCanvas />);
    expect(screen.getByTestId('celestial-sun')).toBeInTheDocument();
    expect(screen.getByTestId('celestial-evening')).toBeInTheDocument();
    expect(screen.getByTestId('celestial-moon')).toBeInTheDocument();
  });

  it('applies custom className and renders children', () => {
    render(
      <CelestialCanvas className="custom-test-canvas">
        <div data-testid="child-content">Star Content</div>
      </CelestialCanvas>
    );
    const canvas = screen.getByTestId('celestial-canvas');
    expect(canvas).toHaveClass('custom-test-canvas');
    expect(screen.getByTestId('child-content')).toHaveTextContent('Star Content');
  });

  it('handles explicit light, evening, and dark mode overrides', () => {
    const { rerender } = render(<CelestialCanvas mode="light" />);
    expect(screen.getByTestId('celestial-sun')).not.toHaveClass('opacity-0');
    expect(screen.getByTestId('celestial-evening')).toHaveClass('opacity-0');
    expect(screen.getByTestId('celestial-moon')).toHaveClass('opacity-0');

    rerender(<CelestialCanvas mode="evening" />);
    expect(screen.getByTestId('celestial-sun')).toHaveClass('opacity-0');
    expect(screen.getByTestId('celestial-evening')).not.toHaveClass('opacity-0');
    expect(screen.getByTestId('celestial-moon')).toHaveClass('opacity-0');

    rerender(<CelestialCanvas mode="dark" />);
    expect(screen.getByTestId('celestial-sun')).toHaveClass('opacity-0');
    expect(screen.getByTestId('celestial-evening')).toHaveClass('opacity-0');
    expect(screen.getByTestId('celestial-moon')).not.toHaveClass('opacity-0');
  });

  it('renders white glowing drifting particles inside the night moon theme layer', () => {
    render(<CelestialCanvas mode="dark" />);
    const particlesContainer = screen.getByTestId('night-glowing-particles');
    expect(particlesContainer).toBeInTheDocument();
    expect(screen.getByTestId('night-particle-1')).toBeInTheDocument();
    expect(screen.getByTestId('night-particle-10')).toBeInTheDocument();
  });

  it('renders silhouetted birds gliding in sunrise and evening theme layer', () => {
    render(<CelestialCanvas mode="evening" />);
    const birdsContainer = screen.getByTestId('celestial-birds');
    expect(birdsContainer).toBeInTheDocument();
    expect(screen.getByTestId('bird-1')).toBeInTheDocument();
    expect(screen.getByTestId('bird-2')).toBeInTheDocument();
  });

  it('renders swaying leaf particles in day theme layer', () => {
    render(<CelestialCanvas mode="light" />);
    const leavesContainer = screen.getByTestId('day-leaf-particles');
    expect(leavesContainer).toBeInTheDocument();
    expect(screen.getByTestId('leaf-1')).toBeInTheDocument();
  });
});
