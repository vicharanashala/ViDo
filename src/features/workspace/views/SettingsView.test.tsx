// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from './SettingsView';
import { DEFAULT_PRIORITY_COLORS } from '../../../utils/priorityColor';

describe('SettingsView', () => {
  it('renders settings sections navigation tabs and allows switching views', () => {
    render(
      <SettingsView
        isPreview={true}
        user={{ id: 'demo-1', name: 'Demo User', email: 'demo@vido.app' }}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /^settings$/i })).toBeInTheDocument();

    // Verify navigation tabs exist
    expect(screen.getByRole('tab', { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /theme & appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /priority colors/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /task lists & categories/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /workspace actions/i })).toBeInTheDocument();

    // Default section is Account (Profile & Identity)
    expect(screen.getByRole('heading', { name: /profile & identity/i })).toBeInTheDocument();

    // Switch to Theme & Appearance tab
    fireEvent.click(screen.getByRole('tab', { name: /theme & appearance/i }));
    expect(screen.getByRole('heading', { name: /appearance & themes/i })).toBeInTheDocument();
    expect(screen.getByText('Cobalt Blue')).toBeInTheDocument();
    expect(screen.getByText('Deep Indigo')).toBeInTheDocument();
    expect(screen.getByText('Forest Green')).toBeInTheDocument();

    // Switch to Task Lists & Categories tab
    fireEvent.click(screen.getByRole('tab', { name: /task lists & categories/i }));
    expect(screen.getByRole('heading', { name: /task lists & categories/i })).toBeInTheDocument();

    // Switch to Preferences tab
    fireEvent.click(screen.getByRole('tab', { name: /preferences/i }));
    expect(screen.getByRole('heading', { name: /task & planning preferences/i })).toBeInTheDocument();

    // Switch to Workspace Actions tab
    fireEvent.click(screen.getByRole('tab', { name: /workspace actions/i }));
    expect(screen.getByRole('heading', { name: /workspace actions/i })).toBeInTheDocument();
  });

  it('switches active theme and updates document data-accent attribute', () => {
    localStorage.clear();
    render(<SettingsView isPreview={true} initialSection="theme" />);

    const greenCard = screen.getByTestId('accent-card-green');
    fireEvent.click(greenCard);

    expect(document.documentElement.getAttribute('data-accent')).toBe('green');
    expect(localStorage.getItem('vido_accent')).toBe('green');

    const indigoCard = screen.getByTestId('accent-card-indigo');
    fireEvent.click(indigoCard);

    expect(document.documentElement.getAttribute('data-accent')).toBe('indigo');
    expect(localStorage.getItem('vido_accent')).toBe('indigo');
  });

  it('allows updating user profile display name in account section', () => {
    render(
      <SettingsView
        isPreview={true}
        initialSection="account"
        user={{ id: 'user-123', name: 'Original Name', email: 'user@example.com' }}
      />
    );

    const nameInput = screen.getByLabelText(/display name/i);
    expect(nameInput).toHaveValue('Original Name');

    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
    const saveBtn = screen.getByRole('button', { name: /save profile/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    expect(localStorage.getItem('vido_user_display_name')).toBe('Jane Doe');
  });

  it('allows updating task creation preferences in preferences section', () => {
    render(<SettingsView isPreview={true} initialSection="preferences" />);

    const categorySelect = screen.getByLabelText(/default category/i);
    fireEvent.change(categorySelect, { target: { value: 'work' } });

    const prioritySelect = screen.getByLabelText(/default priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    const timeSelect = screen.getByLabelText(/default due time/i);
    fireEvent.change(timeSelect, { target: { value: '17:00' } });

    const savePrefsBtn = screen.getByRole('button', { name: /save preferences/i });
    fireEvent.click(savePrefsBtn);

    expect(screen.getByText(/preferences saved!/i)).toBeInTheDocument();
    expect(localStorage.getItem('vido_pref_category')).toBe('work');
    expect(localStorage.getItem('vido_pref_priority')).toBe('high');
    expect(localStorage.getItem('vido_pref_duetime')).toBe('17:00');
  });

  it('triggers sign out callback when Sign Out button is clicked in workspace section', () => {
    const handleSignOut = vi.fn();
    render(<SettingsView isPreview={true} initialSection="workspace" onSignOut={handleSignOut} />);

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });

  it('allows adding and deleting personalised categories in categories section', async () => {
    const handleAddCat = vi.fn().mockResolvedValue({
      id: 'fitness',
      name: 'Fitness & Health',
      color: '#10b981',
      isCustom: true,
    });
    const handleDeleteCat = vi.fn();
    window.confirm = vi.fn().mockReturnValue(true);

    const initialCategories = [
      { id: 'personal', name: 'Personal', isCustom: false },
      { id: 'home', name: 'Household', isCustom: false },
      { id: 'work', name: 'Work', isCustom: false },
      { id: 'fitness', name: 'Fitness & Health', color: '#10b981', isCustom: true },
    ];

    render(
      <SettingsView
        isPreview={true}
        initialSection="categories"
        categories={initialCategories}
        onAddCategory={handleAddCat}
        onDeleteCategory={handleDeleteCat}
      />
    );

    expect(screen.getByRole('heading', { name: /task lists & categories/i })).toBeInTheDocument();
    expect(screen.getByText('Fitness & Health')).toBeInTheDocument();

    // Create new category
    const catInput = screen.getByLabelText(/list \/ category name \*/i);
    fireEvent.change(catInput, { target: { value: 'Finance' } });
    const createBtn = screen.getByRole('button', { name: /add list \/ category/i });
    fireEvent.click(createBtn);

    expect(handleAddCat).toHaveBeenCalledWith({ name: 'Finance', color: '#305fdd' });

    // Delete custom category
    const deleteBtn = screen.getByRole('button', { name: /delete fitness & health list/i });
    fireEvent.click(deleteBtn);
    expect(handleDeleteCat).toHaveBeenCalledWith('fitness');
  });

  it('switches to Priority Colors tab and renders color pickers and live card previews', () => {
    const handleUpdate = vi.fn();
    render(
      <SettingsView
        priorityColors={DEFAULT_PRIORITY_COLORS}
        onUpdatePriorityColors={handleUpdate}
      />
    );

    // Click Priority Colors tab in left sub-nav
    const priorityTabBtn = screen.getByRole('tab', { name: /priority colors/i });
    fireEvent.click(priorityTabBtn);

    // Verify Priority Colors view
    expect(screen.getByRole('heading', { name: /^priority colors$/i })).toBeInTheDocument();
    expect(screen.getByText('High Priority Tasks')).toBeInTheDocument();
    expect(screen.getByText('Medium Priority Tasks')).toBeInTheDocument();
    expect(screen.getByText('Low Priority Tasks')).toBeInTheDocument();

    // Presets are present
    expect(screen.getByTitle('Red')).toBeInTheDocument();
    expect(screen.getByTitle('Yellow')).toBeInTheDocument();
    expect(screen.getByTitle('Emerald')).toBeInTheDocument();

    // Click Crimson preset for High Priority
    const crimsonBtn = screen.getByTitle('Crimson');
    fireEvent.click(crimsonBtn);
    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        high: '#dc2626',
      })
    );

    // Live preview cards are rendered
    expect(screen.getByText(/live preview: how cards appear on your board/i)).toBeInTheDocument();
    expect(screen.getByText('Submit Quarterly Review')).toBeInTheDocument();
    expect(screen.getByText('Weekly Product Sync')).toBeInTheDocument();
    expect(screen.getByText('Organize Workspace Notes')).toBeInTheDocument();
  });

  it('filters navigation items based on search query', () => {
    const handleUpdate = vi.fn();
    render(
      <SettingsView
        priorityColors={DEFAULT_PRIORITY_COLORS}
        onUpdatePriorityColors={handleUpdate}
      />
    );

    const searchInput = screen.getByPlaceholderText('Find a setting...');
    fireEvent.change(searchInput, { target: { value: 'priority' } });

    expect(screen.getByRole('tab', { name: /priority colors/i })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /account/i })).not.toBeInTheDocument();
  });

  it('resets priority colors to default when Reset to Defaults is clicked', () => {
    const handleUpdate = vi.fn();
    render(
      <SettingsView
        priorityColors={{ high: '#000000', medium: '#111111', low: '#222222' }}
        onUpdatePriorityColors={handleUpdate}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /priority colors/i }));

    const resetBtn = screen.getByRole('button', { name: /reset to defaults/i });
    fireEvent.click(resetBtn);

    expect(handleUpdate).toHaveBeenCalledWith(DEFAULT_PRIORITY_COLORS);
  });

  it('switches to Task Lists tab and supports adding a new list', () => {
    const handleCreateList = vi.fn();
    render(
      <SettingsView
        priorityColors={DEFAULT_PRIORITY_COLORS}
        onUpdatePriorityColors={vi.fn()}
        onCreateList={handleCreateList}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /task lists & categories/i }));

    expect(screen.getByRole('heading', { name: /task lists & categories/i })).toBeInTheDocument();
    const input = screen.getByLabelText(/list \/ category name \*/i);
    fireEvent.change(input, { target: { value: 'Academics & Research' } });

    const addBtn = screen.getByTestId('create-list-submit-btn');
    fireEvent.click(addBtn);

    expect(handleCreateList).toHaveBeenCalledWith('Academics & Research');
    expect(screen.getByText(/created successfully/i)).toBeInTheDocument();
  });

  it('supports quick Add list button in the sidebar', () => {
    render(
      <SettingsView
        priorityColors={DEFAULT_PRIORITY_COLORS}
        onUpdatePriorityColors={vi.fn()}
      />
    );

    const quickAddBtn = screen.getByTestId('sidebar-add-list-btn');
    fireEvent.click(quickAddBtn);

    expect(screen.getByRole('heading', { name: /task lists & categories/i })).toBeInTheDocument();
  });

  it('supports renaming and deleting lists in Task Lists tab', () => {
    const handleRenameList = vi.fn();
    const handleDeleteList = vi.fn();
    const customLists = [
      { id: 'personal', title: 'Personal & Routine' },
      { id: 'custom-1', title: 'Coders High' },
    ];

    render(
      <SettingsView
        priorityColors={DEFAULT_PRIORITY_COLORS}
        onUpdatePriorityColors={vi.fn()}
        customLists={customLists}
        onRenameList={handleRenameList}
        onDeleteList={handleDeleteList}
      />
    );

    fireEvent.click(screen.getByRole('tab', { name: /task lists & categories/i }));

    const renameButtons = screen.getAllByTitle('Rename List');
    fireEvent.click(renameButtons[1]);

    const editInput = screen.getByDisplayValue('Coders High');
    fireEvent.change(editInput, { target: { value: 'Coders Elite' } });
    fireEvent.click(screen.getByTitle('Save'));

    expect(handleRenameList).toHaveBeenCalledWith('custom-1', 'Coders Elite');

    const deleteBtns = screen.getAllByTitle('Delete List');
    expect(deleteBtns.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(deleteBtns[1]);

    expect(handleDeleteList).toHaveBeenCalledWith('custom-1');
  });
});
