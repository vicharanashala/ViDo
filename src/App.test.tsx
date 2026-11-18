import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('ViDo app routes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('renders the landing page', () => {
    render(<App />);

    expect(screen.getAllByText('ViDo')[0]).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /simple enough for anyone\. structured enough for serious work\./i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Personal Tasks')).toBeInTheDocument();
    expect(screen.getByText('Clarity over complexity')).toBeInTheDocument();
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  it('opens the workspace from the landing page', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /open app/i }));

    expect(screen.getByRole('heading', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/new task title/i)).toBeInTheDocument();
    expect(screen.queryByText('DEMO PREVIEW')).not.toBeInTheDocument();
  });

  it('redirects the old preview route to the real workspace', () => {
    window.history.pushState({}, '', '/preview/today');
    render(<App />);

    expect(screen.getByRole('heading', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/new task title/i)).toBeInTheDocument();
  });
});
