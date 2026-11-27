import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StyleLab } from './StyleLab';
import { ThemeProvider, THEME_STORAGE_KEY } from '../../lib/theme';

describe('StyleLab', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('renders title, celestial mode options, and accent options', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <StyleLab />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /ViDo Theme & Accent Lab/i })).toBeInTheDocument();
    expect(screen.getByText('Auto (Celestial Clock)')).toBeInTheDocument();
    expect(screen.getByText('Light (Always Sun)')).toBeInTheDocument();
    expect(screen.getByText('Evening (Sunset)')).toBeInTheDocument();
    expect(screen.getByText('Dark (Always Moon)')).toBeInTheDocument();
    expect(screen.getByText('Cobalt Blue')).toBeInTheDocument();
    expect(screen.getByText('Deep Indigo')).toBeInTheDocument();
    expect(screen.getByText('Forest Green')).toBeInTheDocument();
  });

  it('switches celestial theme mode on selection', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <StyleLab />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Switch to dark mode
    const darkBtn = screen.getByTestId('stylelab-theme-dark');
    fireEvent.click(darkBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    // Switch to light mode
    const lightBtn = screen.getByTestId('stylelab-theme-light');
    fireEvent.click(lightBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('switches active accent theme on selection', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <StyleLab />
        </ThemeProvider>
      </BrowserRouter>
    );

    // Initial default is blue
    expect(document.documentElement.getAttribute('data-accent')).toBe('blue');

    // Click Deep Indigo
    const indigoCard = screen.getByTestId('accent-card-indigo');
    fireEvent.click(indigoCard);
    expect(document.documentElement.getAttribute('data-accent')).toBe('indigo');

    // Click Forest Green
    const greenCard = screen.getByTestId('accent-card-green');
    fireEvent.click(greenCard);
    expect(document.documentElement.getAttribute('data-accent')).toBe('green');
  });

  it('renders component testing controls', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <StyleLab />
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /primary button/i })).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
  });
});
