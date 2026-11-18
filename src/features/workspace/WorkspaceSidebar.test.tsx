import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceSidebar } from './WorkspaceSidebar';

describe('WorkspaceSidebar', () => {
  it('renders the brand, new task action, and gentle views', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <WorkspaceSidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /vido/i })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: /home base/i })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: /today's move/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pick up again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /what's next/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /your paths/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /wins so far/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /resting/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /themes/i })).toBeInTheDocument();
    expect(screen.queryByText('DEMO')).not.toBeInTheDocument();
  });

  it('triggers the new task callback', () => {
    const handleNewTask = vi.fn();
    render(
      <MemoryRouter initialEntries={['/app']}>
        <WorkspaceSidebar onNewTaskClick={handleNewTask} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /new task/i }));
    expect(handleNewTask).toHaveBeenCalledTimes(1);
  });
});
