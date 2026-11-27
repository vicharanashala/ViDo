import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from './SettingsView';

describe('SettingsView', () => {
  it('renders settings sections navigation tabs and allows switching views', () => {
    render(
      <SettingsView
        isPreview={true}
        user={{ id: 'demo-1', name: 'Demo User', email: 'demo@vido.app' }}
      />
    );

    expect(screen.getByRole('heading', { level: 1, name: /^settings$/i })).toBeInTheDocument();

    // Verify all 5 navigation tabs exist
    expect(screen.getByRole('tab', { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /theme & appearance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /personalised categories/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /workspace actions/i })).toBeInTheDocument();

    // Default section is Account (Profile & Identity)
    expect(screen.getByRole('heading', { name: /profile & identity/i })).toBeInTheDocument();

    // Switch to Theme & Appearance tab
    fireEvent.click(screen.getByRole('tab', { name: /theme & appearance/i }));
    expect(screen.getByRole('heading', { name: /appearance & themes/i })).toBeInTheDocument();
    expect(screen.getByText('Auto (Clock)')).toBeInTheDocument();
    expect(screen.getByText('Always Sun')).toBeInTheDocument();
    expect(screen.getByText('Always Moon')).toBeInTheDocument();

    // Switch to Personalised Categories tab
    fireEvent.click(screen.getByRole('tab', { name: /personalised categories/i }));
    expect(screen.getByRole('heading', { name: /personalised categories/i })).toBeInTheDocument();

    // Switch to Preferences tab
    fireEvent.click(screen.getByRole('tab', { name: /preferences/i }));
    expect(screen.getByRole('heading', { name: /task & planning preferences/i })).toBeInTheDocument();

    // Switch to Workspace Actions tab
    fireEvent.click(screen.getByRole('tab', { name: /workspace actions/i }));
    expect(screen.getByRole('heading', { name: /workspace actions/i })).toBeInTheDocument();
  });

  it('renders celestial atmosphere theme controls and excludes obsolete accent cards', () => {
    localStorage.clear();
    render(<SettingsView isPreview={true} initialSection="theme" />);

    expect(screen.getByText('Celestial Horizon Atmosphere')).toBeInTheDocument();
    expect(screen.getByTestId('theme-mode-auto')).toBeInTheDocument();
    expect(screen.getByTestId('theme-mode-light')).toBeInTheDocument();
    expect(screen.getByTestId('theme-mode-evening')).toBeInTheDocument();
    expect(screen.getByTestId('theme-mode-dark')).toBeInTheDocument();
    expect(screen.queryByTestId('accent-card-green')).not.toBeInTheDocument();
  });

  it('switches celestial atmosphere theme mode and updates document and storage', () => {
    localStorage.clear();
    render(<SettingsView isPreview={true} initialSection="theme" />);

    const eveningBtn = screen.getByTestId('theme-mode-evening');
    fireEvent.click(eveningBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('evening');
    expect(localStorage.getItem('vido_theme_mode')).toBe('evening');

    const darkBtn = screen.getByTestId('theme-mode-dark');
    fireEvent.click(darkBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('vido_theme_mode')).toBe('dark');

    const lightBtn = screen.getByTestId('theme-mode-light');
    fireEvent.click(lightBtn);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('vido_theme_mode')).toBe('light');
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

    expect(screen.getByRole('heading', { name: /personalised categories/i })).toBeInTheDocument();
    expect(screen.getByText('Fitness & Health')).toBeInTheDocument();
    expect(screen.getByText('Personalized')).toBeInTheDocument();

    // Create new category
    const catInput = screen.getByLabelText(/category name \*/i);
    fireEvent.change(catInput, { target: { value: 'Finance' } });
    const createBtn = screen.getByRole('button', { name: /create category/i });
    fireEvent.click(createBtn);

    expect(handleAddCat).toHaveBeenCalledWith({ name: 'Finance', color: '#305fdd' });

    // Delete custom category
    const deleteBtn = screen.getByRole('button', { name: /delete fitness & health category/i });
    fireEvent.click(deleteBtn);
    expect(handleDeleteCat).toHaveBeenCalledWith('fitness');
  });
});
