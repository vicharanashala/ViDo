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

  it('renders filter button and opens filter card with aesthetic ticks on click', () => {
    const handleCategory = vi.fn();
    const handlePriority = vi.fn();
    const handleStatus = vi.fn();
    const handleClear = vi.fn();

    render(
      <MemoryRouter>
        <WorkspaceTopBar
          title="Filter Test"
          categoryFilter="personal"
          onToggleCategoryFilter={handleCategory}
          onTogglePriorityFilter={handlePriority}
          onToggleStatusFilter={handleStatus}
          onClearFilters={handleClear}
        />
      </MemoryRouter>
    );

    // Filter button is present
    const filterBtn = screen.getByRole('button', { name: /filter tasks/i });
    expect(filterBtn).toBeInTheDocument();

    // Click to open filter popover
    fireEvent.click(filterBtn);

    // Dialog card is visible with sections: Category, Priority, Timeline / Status
    expect(screen.getByRole('dialog', { name: /filter options/i })).toBeInTheDocument();
    expect(screen.getByText(/^category$/i)).toBeInTheDocument();
    expect(screen.getByText(/^priority$/i)).toBeInTheDocument();
    expect(screen.getByText(/^timeline \/ status$/i)).toBeInTheDocument();

    // Personal category is ticked
    const personalOption = screen.getByRole('button', { name: /personal/i });
    expect(personalOption).toBeInTheDocument();

    // Click High Priority option
    const highPriorityOption = screen.getByRole('button', { name: /high priority/i });
    fireEvent.click(highPriorityOption);
    expect(handlePriority).toHaveBeenCalledWith('high');

    // Click Due Today status option
    const dueTodayOption = screen.getByRole('button', { name: /due today/i });
    fireEvent.click(dueTodayOption);
    expect(handleStatus).toHaveBeenCalledWith('today');

    // Clear all filters button is present when active
    const clearBtn = screen.getByRole('button', { name: /clear all filters/i });
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('supports multi-select categories and displays correct filter badge count', () => {
    const handleCategory = vi.fn();
    render(
      <MemoryRouter>
        <WorkspaceTopBar
          title="Multi Category Test"
          selectedCategories={['personal', 'work']}
          onToggleCategoryFilter={handleCategory}
        />
      </MemoryRouter>
    );

    // Button label reflects multi-filters: Filters (2)
    expect(screen.getByText('Filters (2)')).toBeInTheDocument();

    const filterBtn = screen.getByRole('button', { name: /filter tasks/i });
    fireEvent.click(filterBtn);

    // Both personal and work should be checked
    const personalOption = screen.getByRole('button', { name: /personal/i });
    const workOption = screen.getByRole('button', { name: /work \/ professional/i });
    expect(personalOption).toBeInTheDocument();
    expect(workOption).toBeInTheDocument();

    // Clicking Household/Living triggers toggle with 'home'
    const homeOption = screen.getByRole('button', { name: /household \/ living/i });
    fireEvent.click(homeOption);
    expect(handleCategory).toHaveBeenCalledWith('home');
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
