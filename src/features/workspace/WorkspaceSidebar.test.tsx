import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceSidebar } from './WorkspaceSidebar';

describe('WorkspaceSidebar', () => {
  const mockCounts = {
    today: 6,
    needsAttention: 4,
    upcoming: 5,
    completed: 5,
    archived: 2,
  };

  it('renders the brand, new task action, and view counts', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <WorkspaceSidebar counts={mockCounts} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /vido/i })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: /today 6/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /needs attention 4/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /upcoming 5/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /completed 5/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /archived 2/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /themes/i })).toBeInTheDocument();
    expect(screen.queryByText('DEMO')).not.toBeInTheDocument();
  });

  it('triggers the new task callback', () => {
    const handleNewTask = vi.fn();
    render(
      <MemoryRouter initialEntries={['/app']}>
        <WorkspaceSidebar counts={mockCounts} onNewTaskClick={handleNewTask} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /new task/i }));
    expect(handleNewTask).toHaveBeenCalledTimes(1);
  });
});
