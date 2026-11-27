import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceTopBar } from './WorkspaceTopBar';

describe('WorkspaceTopBar', () => {
  it('renders workspace label, search placeholder, and preview badge', () => {
    const handleFocus = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceTopBar
          onSearchFocus={handleFocus}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Interactive Preview')).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('Personal Workspace')).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/search tasks/i);
    fireEvent.focus(searchInput);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('renders notification bell with pending team invitations and allows responding', () => {
    const handleRespond = vi.fn().mockResolvedValue(undefined);
    const mockInvites = [
      {
        id: 'invite-topbar-1',
        teamId: 'team-topbar',
        teamName: 'Beta Launch',
        inviterId: 'lead-1',
        inviterName: 'Sarah Chen',
        inviterEmail: 'sarah@vido.app',
        inviteeEmail: 'alex@vido.app',
        status: 'pending' as const,
        createdAt: '2026-11-18T10:00:00Z',
      },
    ];

    render(
      <MemoryRouter>
        <WorkspaceTopBar
          invitations={mockInvites}
          onRespondInvitation={handleRespond}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /notifications: 1 pending/i })).toBeInTheDocument();
    expect(screen.getByTestId('notification-badge')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: /notifications: 1 pending/i }));
    expect(screen.getByText('Beta Launch')).toBeInTheDocument();
  });

  it('renders current date dynamically in top bar badge', () => {
    render(
      <MemoryRouter>
        <WorkspaceTopBar />
      </MemoryRouter>
    );

    const dateBadge = screen.getByTestId('topbar-date');
    expect(dateBadge).toBeInTheDocument();
    expect(dateBadge.textContent).not.toBe('');
  });

  it('renders custom currentDate prop when provided', () => {
    render(
      <MemoryRouter>
        <WorkspaceTopBar currentDate="Friday, 25 Dec 2026" />
      </MemoryRouter>
    );

    expect(screen.getByText('Friday, 25 Dec 2026')).toBeInTheDocument();
  });

  it('changes top bar layout and breadcrumbs when on the settings page', () => {
    render(
      <MemoryRouter initialEntries={['/workspace/settings']}>
        <WorkspaceTopBar basePath="/workspace" isSettings={true} />
      </MemoryRouter>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to dashboard/i })).toBeInTheDocument();
    expect(screen.getByText('Preferences & Customization')).toBeInTheDocument();
    expect(screen.queryByLabelText(/search tasks/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/filter tasks/i)).not.toBeInTheDocument();
  });
});
