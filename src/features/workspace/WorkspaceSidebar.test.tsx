import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceSidebar } from './WorkspaceSidebar';

describe('WorkspaceSidebar', () => {
  it('renders the brand, new task action, and focused navigation', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <WorkspaceSidebar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /vido/i })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^upcoming$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^task paths$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^momentum trail$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^past$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^completed$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^archived$/i })).toBeInTheDocument();
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
