import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkspaceTopBar } from './WorkspaceTopBar';

describe('WorkspaceTopBar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders workspace label, search placeholder, preview badge, and avatar trigger', () => {
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

    // Circular avatar trigger with initials "DU"
    const avatarBtn = screen.getByRole('button', { name: /user profile menu/i });
    expect(avatarBtn).toBeInTheDocument();
    expect(avatarBtn).toHaveTextContent('DU');

    const searchInput = screen.getByLabelText(/search tasks/i);
    fireEvent.focus(searchInput);
    expect(handleFocus).toHaveBeenCalledTimes(1);
  });

  it('renders GitHub-style sidebar toggle button and triggers onToggleSidebar', () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <MemoryRouter>
        <WorkspaceTopBar isSidebarCollapsed={false} onToggleSidebar={handleToggle} />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);

    rerender(
      <MemoryRouter>
        <WorkspaceTopBar isSidebarCollapsed={true} onToggleSidebar={handleToggle} />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it('toggles profile dropdown menu on avatar click with user details and actions', () => {
    const handleSignOut = vi.fn();
    const handleOpenSettings = vi.fn();

    render(
      <MemoryRouter>
        <WorkspaceTopBar
          onSignOut={handleSignOut}
          onOpenSettings={handleOpenSettings}
        />
      </MemoryRouter>
    );

    const avatarBtn = screen.getByRole('button', { name: /user profile menu/i });
    expect(screen.queryByRole('menu', { name: /user profile options/i })).not.toBeInTheDocument();

    // Click to open dropdown
    fireEvent.click(avatarBtn);

    const menu = screen.getByRole('menu', { name: /user profile options/i });
    expect(menu).toBeInTheDocument();
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('Personal Workspace')).toBeInTheDocument();
    expect(screen.getByText('Atmosphere & Theme')).toBeInTheDocument();

    // Verify theme buttons exist
    expect(screen.getByTitle('Switch theme to Day')).toBeInTheDocument();
    expect(screen.getByTitle('Switch theme to Dusk')).toBeInTheDocument();
    expect(screen.getByTitle('Switch theme to Night')).toBeInTheDocument();
    expect(screen.getByTitle('Switch theme to Auto')).toBeInTheDocument();

    // Click Day theme
    fireEvent.click(screen.getByTitle('Switch theme to Day'));
    expect(localStorage.getItem('vido_theme_mode')).toBe('light');

    // Verify links
    const settingsLink = screen.getByRole('menuitem', { name: /workspace settings/i });
    expect(settingsLink).toBeInTheDocument();
    fireEvent.click(settingsLink);
    expect(handleOpenSettings).toHaveBeenCalledTimes(1);

    // Reopen menu to verify sign out
    fireEvent.click(avatarBtn);
    const signOutBtn = screen.getByRole('menuitem', { name: /sign out/i });
    fireEvent.click(signOutBtn);
    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });

  it('dismisses dropdown when Escape key is pressed or clicked outside', () => {
    render(
      <MemoryRouter>
        <WorkspaceTopBar />
      </MemoryRouter>
    );

    const avatarBtn = screen.getByRole('button', { name: /user profile menu/i });
    fireEvent.click(avatarBtn);
    expect(screen.getByRole('menu', { name: /user profile options/i })).toBeInTheDocument();

    // Escape key closes menu
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu', { name: /user profile options/i })).not.toBeInTheDocument();

    // Click outside closes menu
    fireEvent.click(avatarBtn);
    expect(screen.getByRole('menu', { name: /user profile options/i })).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu', { name: /user profile options/i })).not.toBeInTheDocument();
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
