import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StyleLab } from './StyleLab';

describe('StyleLab', () => {
  it('renders title and accent options', () => {
    render(
      <BrowserRouter>
        <StyleLab />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /ViDo Theme & Accent Lab/i })).toBeInTheDocument();
    expect(screen.getByText('Cobalt Blue')).toBeInTheDocument();
    expect(screen.getByText('Deep Indigo')).toBeInTheDocument();
    expect(screen.getByText('Forest Green')).toBeInTheDocument();
  });

  it('switches active accent theme on selection', () => {
    render(
      <BrowserRouter>
        <StyleLab />
      </BrowserRouter>
    );

    // Initial default is clay
    expect(document.documentElement.getAttribute('data-accent')).toBe('clay');

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
        <StyleLab />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /primary button/i })).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
  });
});

