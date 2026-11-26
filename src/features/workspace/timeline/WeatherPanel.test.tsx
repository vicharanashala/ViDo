import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherPanel, getWeatherCondition, getWeatherGradient } from './WeatherPanel';

describe('WeatherPanel', () => {
  it('keeps the sky clear through the former 12 PM to 2 PM rain window', () => {
    expect(getWeatherCondition(11 * 60 + 59)).toBe('clear');
    expect(getWeatherCondition(12 * 60)).toBe('clear');
    expect(getWeatherCondition(13 * 60 + 59)).toBe('clear');
    expect(getWeatherCondition(14 * 60)).toBe('clear');
  });

  it('renders a background-only sky without a forecast box or condition selector', () => {
    render(<WeatherPanel minutes={12 * 60} />);

    expect(screen.getByLabelText(/weather background/i)).toBeInTheDocument();
    expect(screen.queryByText(/demo forecast/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/raining/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/°c/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(document.querySelector('[data-weather-icon="rain"]')).toBeNull();
  });

  it('adds a moon and exactly two tiny stars to the night sky', () => {
    const { container } = render(<WeatherPanel minutes={2 * 60} />);

    expect(container.querySelector('[data-weather="moon"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-weather="star"]')).toHaveLength(2);
  });

  it('uses layered, token-driven gradients for a more realistic sky', () => {
    expect(getWeatherGradient('night', 'clear')).toContain('radial-gradient');
    expect(getWeatherGradient('night', 'clear')).toContain('var(--atmo-page)');
    expect(getWeatherGradient('day', 'clear')).toContain('var(--atmo-glow)');
  });

  it('renders a brighter sun and cloud in the background art', () => {
    const { container: sunContainer } = render(<WeatherPanel minutes={10 * 60} />);
    const { container: cloudContainer } = render(<WeatherPanel minutes={7 * 60} />);
    const sun = sunContainer.querySelector('[data-weather-icon="sun"]');
    const cloud = cloudContainer.querySelector('[data-weather-icon="cloud"] path');

    expect(sun?.innerHTML).toContain('#ffd84d');
    expect(sun?.innerHTML).toContain('#ffb703');
    expect(cloud?.getAttribute('fill')).toMatch(/rgba\((226, 232, 240|248, 250, 252), 0\.98\)/);
  });
});
