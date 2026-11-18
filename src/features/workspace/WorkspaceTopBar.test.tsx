import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceTopBar } from './WorkspaceTopBar';

describe('WorkspaceTopBar', () => {
  it('renders a calm header and reveals filters on demand', () => {
    const handleSearch = vi.fn();
    const handlePriority = vi.fn();
    const handleHelp = vi.fn();

    render(
      <MemoryRouter>
        <WorkspaceTopBar
          title="Home Overview"
          subtitle="Daily task summary"
          searchQuery=""
          onSearchChange={handleSearch}
          priority="all"
          onPriorityChange={handlePriority}
          onHelpClick={handleHelp}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /home overview/i })).toBeInTheDocument();
    expect(screen.getByText('Daily task summary')).toBeInTheDocument();
    expect(screen.queryByLabelText(/filter by priority/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/search tasks/i), { target: { value: 'budget' } });
    expect(handleSearch).toHaveBeenCalledWith('budget');

    fireEvent.click(screen.getByRole('button', { name: /toggle filters/i }));
    fireEvent.change(screen.getByLabelText(/filter by priority/i), { target: { value: 'high' } });
    expect(handlePriority).toHaveBeenCalledWith('high');

    fireEvent.click(screen.getByRole('button', { name: /how vido works/i }));
    expect(handleHelp).toHaveBeenCalled();
  });
});
