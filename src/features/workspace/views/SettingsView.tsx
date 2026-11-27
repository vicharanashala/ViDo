import React, { useState } from 'react';
import {
  Palette,
  User,
  Sliders,
  Check,
  CheckCircle2,
  Shield,
  Sparkles,
  LogOut,
  RotateCcw,
  Tag,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button, Badge, Input } from '../../../components/ui';
import {
  DEFAULT_CATEGORIES,
  CATEGORY_COLOR_OPTIONS,
  type UserCategory,
} from '../../../data/categories';

export type AccentCandidate = 'blue' | 'indigo' | 'green';

export const ACCENTS: {
  id: AccentCandidate;
  name: string;
  hex: string;
  bgHex: string;
  desc: string;
}[] = [
  {
    id: 'blue',
    name: 'Cobalt Blue',
    hex: '#305fdd',
    bgHex: '#eef3ff',
    desc: 'Crisp, direct, and classic productivity tone. Ideal for clean modern workspaces.',
  },
  {
    id: 'indigo',
    name: 'Deep Indigo',
    hex: '#4338ca',
    bgHex: '#eef2ff',
    desc: 'Warm, refined, professional software tone. Higher contrast against white surfaces.',
  },
  {
    id: 'green',
    name: 'Forest Green',
    hex: '#247a56',
    bgHex: '#eaf6f0',
    desc: 'Calm, grounded, organic focus. Emphasizes steady progress and low-anxiety execution.',
  },
];

export type SettingsSection = 'account' | 'theme' | 'categories' | 'preferences' | 'workspace';

export interface SettingsSectionItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    description: 'Profile identity, initials, and session info',
  },
  {
    id: 'theme',
    label: 'Theme & Appearance',
    icon: Palette,
    description: 'Accent colors, contrast, and visual styling',
  },
  {
    id: 'categories',
    label: 'Personalised Categories',
    icon: Tag,
    description: 'Custom categories stored in your database',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    icon: Sliders,
    description: 'Default categories, priorities, and deadlines',
  },
  {
    id: 'workspace',
    label: 'Workspace Actions',
    icon: Shield,
    description: 'Demo resets and session sign out',
  },
];

export interface SettingsViewProps {
  isPreview?: boolean;
  basePath?: string;
  initialSection?: SettingsSection;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  categories?: UserCategory[];
  onAddCategory?: (params: { name: string; color?: string }) => Promise<UserCategory> | UserCategory;
  onDeleteCategory?: (categoryId: string) => Promise<void> | void;
  onSignOut?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isPreview = true,
  initialSection = 'account',
  user,
  categories = DEFAULT_CATEGORIES,
  onAddCategory,
  onDeleteCategory,
  onSignOut,
  isModal = false,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialSection);

  // Theme state
  const [activeAccent, setActiveAccent] = useState<AccentCandidate>(() => {
    try {
      const saved = localStorage.getItem('vido_accent') as AccentCandidate;
      if (saved && (saved === 'blue' || saved === 'indigo' || saved === 'green')) {
        return saved;
      }
    } catch {
      // ignore
    }
    return (document.documentElement.getAttribute('data-accent') as AccentCandidate) || 'blue';
  });

  // Profile state
  const [displayName, setDisplayName] = useState(user?.name || 'Demo User');
  const [profileSaved, setProfileSaved] = useState(false);

  // Preference state
  const [defaultCategory, setDefaultCategory] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('vido_pref_category');
      if (saved) return saved;
    } catch {}
    return 'personal';
  });

  const [defaultPriority, setDefaultPriority] = useState<'low' | 'medium' | 'high'>(() => {
    try {
      const saved = localStorage.getItem('vido_pref_priority');
      if (saved === 'low' || saved === 'medium' || saved === 'high') return saved;
    } catch {}
    return 'medium';
  });

  const [defaultDueTime, setDefaultDueTime] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('vido_pref_duetime');
      if (saved) return saved;
    } catch {}
    return '23:59';
  });

  const [prefsSaved, setPrefsSaved] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);

  // Custom Category creation state
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLOR_OPTIONS[0].hex);
  const [catCreationNotice, setCatCreationNotice] = useState<string | null>(null);

  const handleSelectAccent = (accentId: AccentCandidate) => {
    setActiveAccent(accentId);
    document.documentElement.setAttribute('data-accent', accentId);
    try {
      localStorage.setItem('vido_accent', accentId);
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('vido_user_display_name', displayName);
    } catch {}
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('vido_pref_category', defaultCategory);
      localStorage.setItem('vido_pref_priority', defaultPriority);
      localStorage.setItem('vido_pref_duetime', defaultDueTime);
    } catch {}
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    if (onAddCategory) {
      try {
        await onAddCategory({ name: trimmed, color: selectedColor });
        setNewCatName('');
        setCatCreationNotice(`Category "${trimmed}" saved to your personal database.`);
        setTimeout(() => setCatCreationNotice(null), 3000);
      } catch (err: any) {
        setCatCreationNotice(err?.message || 'Failed to create category.');
      }
    }
  };

  const handleDeleteCustomCategory = async (catId: string, catName: string) => {
    if (window.confirm(`Delete the custom category "${catName}"?`)) {
      if (onDeleteCategory) {
        await onDeleteCategory(catId);
      }
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo tasks back to original template values?')) {
      try {
        localStorage.removeItem('vido-demo-calendar-v1');
        localStorage.removeItem('vido-demo-planning-targets-v1');
        localStorage.removeItem('vido-demo-custom-categories-v1');
      } catch {}
      setResetNotice(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--surface)] text-[var(--ink)] ${isModal ? '' : 'p-6 sm:p-10 max-w-5xl mx-auto space-y-6'}`}>
      {/* Standalone View Header */}
      {!isModal && (
        <div className="border-b border-[var(--line)] pb-5">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">Settings</h1>
          <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed max-w-2xl">
            Configure your workspace account, theme appearance, personalized categories, and planning defaults.
          </p>
        </div>
      )}

      {/* YouTube Studio Two-Column Layout */}
      <div className={`flex flex-1 min-h-0 ${isModal ? 'h-full' : 'border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs h-[640px]'}`}>
        {/* Left Column Navigation (Sections) */}
        <nav
          aria-label="Settings sections"
          role="tablist"
          className="w-52 sm:w-60 border-r border-[var(--line)] bg-[var(--canvas)]/40 p-2.5 sm:p-3 space-y-1 shrink-0 overflow-y-auto"
        >
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isCurrent = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                id={`tab-${section.id}`}
                aria-selected={isCurrent}
                aria-controls={`panel-${section.id}`}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isCurrent
                    ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface)]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-white' : 'text-[var(--muted)]'}`} />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Column Content Area */}
        <div
          role="tabpanel"
          id={`panel-${activeSection}`}
          aria-labelledby={`tab-${activeSection}`}
          className="flex-1 p-6 sm:p-8 overflow-y-auto min-w-0 bg-[var(--surface)]"
        >
          {/* SECTION 1: Account */}
          {activeSection === 'account' && (
            <section aria-labelledby="profile-settings-heading" className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 id="profile-settings-heading" className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Profile & Identity
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Manage your personal workspace identity, avatar initials, and active session details.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-5">
                <div className="flex items-center gap-4 pb-4 border-b border-[var(--line)]">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent)] text-white font-black text-xl flex items-center justify-center shadow-xs">
                    {(displayName || 'Demo User')
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[var(--ink)]">{displayName}</p>
                    <p className="text-sm text-[var(--muted)]">{user?.email || 'demo@vido.app'}</p>
                    <div className="mt-1">
                      {isPreview ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-400 text-amber-950">
                          <Shield className="w-3 h-3" /> DEMO ENVIRONMENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                          <Shield className="w-3 h-3" /> AUTHENTICATED WORKSPACE
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                  />
                  <Input
                    label="Email Address"
                    value={user?.email || 'demo@vido.app'}
                    disabled
                    helperText="Email cannot be changed directly in this environment"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {profileSaved && (
                      <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                        <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                      </span>
                    )}
                  </div>
                  <Button type="submit" variant="primary" size="md" className="px-5 py-2.5 text-sm font-semibold">
                    Save Profile
                  </Button>
                </div>
              </form>
            </section>
          )}

          {/* SECTION 2: Theme & Appearance */}
          {activeSection === 'theme' && (
            <section aria-labelledby="theme-settings-heading" className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 id="theme-settings-heading" className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Appearance & Themes
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Select an accent color palette. The selected theme applies instantly across all buttons, badges, and active navigation indicators.
                </p>
              </div>

              {/* Theme Option Cards */}
              <div className="space-y-3.5">
                {ACCENTS.map((accent) => {
                  const isSelected = activeAccent === accent.id;
                  return (
                    <div
                      key={accent.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => handleSelectAccent(accent.id)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectAccent(accent.id)}
                      className={`p-4 sm:p-5 rounded-2xl border bg-[var(--surface)] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/30 bg-[var(--accent-soft)]/20 shadow-xs'
                          : 'border-[var(--line)] hover:border-gray-300 hover:bg-[var(--canvas)]/50 hover:shadow-2xs'
                      }`}
                      data-testid={`accent-card-${accent.id}`}
                    >
                      {/* Left: Swatch Icon & Details */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className="w-11 h-11 rounded-xl border border-black/10 shrink-0 shadow-2xs flex items-center justify-center transition-transform"
                          style={{ backgroundColor: accent.hex }}
                        >
                          {isSelected && <Check className="w-5 h-5 text-white" />}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-base text-[var(--ink)]">{accent.name}</span>
                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[var(--canvas)] border border-[var(--line)] text-[var(--muted)]">
                              Hex {accent.hex}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
                            {accent.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right: Color Tones Preview & Action Badge */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--canvas)] border border-[var(--line)]">
                          <span className="text-[11px] font-mono font-medium text-[var(--muted)] mr-1">Tones</span>
                          <span
                            className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                            style={{ backgroundColor: accent.hex }}
                            title={`Primary: ${accent.hex}`}
                          />
                          <span
                            className="w-5 h-5 rounded-md border border-black/10 shadow-2xs"
                            style={{ backgroundColor: accent.bgHex }}
                            title={`Soft background: ${accent.bgHex}`}
                          />
                        </div>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1.5 rounded-full border border-[var(--accent)]/30 shadow-2xs shrink-0">
                            <Check className="w-4 h-4" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-[var(--muted)] px-3.5 py-1.5 rounded-full border border-[var(--line)] hover:border-[var(--ink)]/30 hover:text-[var(--ink)] transition-colors shrink-0">
                            Select
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Theme Preview Showcase */}
              <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                    <div>
                      <h3 className="text-base font-bold text-[var(--ink)]">Live Theme Preview</h3>
                      <p className="text-xs text-[var(--muted)]">
                        Real-time demonstration of how the selected palette styles workspace components
                      </p>
                    </div>
                  </div>
                  <Badge variant="accent" className="px-3 py-1 text-xs font-bold">
                    Previewing: {activeAccent.toUpperCase()}
                  </Badge>
                </div>

                {/* Simulated Task Component */}
                <div className="p-4 rounded-xl border border-[var(--line)] bg-[var(--canvas)] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--ink)] truncate">
                        Deliver quarterly strategic roadmap & deliverables
                      </p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">
                        Due today · 17:00 · <span className="font-semibold text-[var(--accent)]">High Priority</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 shrink-0">
                    Work Project
                  </span>
                </div>

                {/* Simulated Controls */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Button variant="primary" size="md" className="px-5 font-semibold">
                    <Plus className="w-4 h-4 mr-1.5" /> Primary Button
                  </Button>
                  <Button variant="secondary" size="md" className="px-5 font-semibold">
                    Secondary Button
                  </Button>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 shadow-2xs">
                    Interactive Tag
                  </span>
                  <span className="text-sm font-semibold text-[var(--accent)] underline hover:opacity-80 transition-opacity cursor-pointer">
                    Accent Hyperlink
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 3: Categories */}
          {activeSection === 'categories' && (
            <section aria-labelledby="custom-categories-heading" className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 id="custom-categories-heading" className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Personalised Categories
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Create user-specific categories stored in your personal database. These appear throughout your workspace, filter menus, and task forms.
                </p>
              </div>

              {/* Create Category Form */}
              {onAddCategory && (
                <form
                  onSubmit={handleCreateCategory}
                  className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-4"
                >
                  <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[var(--accent)]" /> Add New Category
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="sm:col-span-2">
                      <Input
                        label="Category Name *"
                        placeholder="e.g., Health & Wellness, Finance, Research"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[var(--muted)] mb-1.5">
                        Color Accent
                      </label>
                      <div className="flex items-center gap-2 h-[42px] px-2 bg-[var(--canvas)] rounded-xl border border-[var(--line)]">
                        {CATEGORY_COLOR_OPTIONS.slice(0, 6).map((colorOpt) => (
                          <button
                            key={colorOpt.hex}
                            type="button"
                            aria-label={`Color ${colorOpt.name}`}
                            onClick={() => setSelectedColor(colorOpt.hex)}
                            className={`w-6 h-6 rounded-full cursor-pointer transition-all ${
                              selectedColor === colorOpt.hex
                                ? 'ring-2 ring-[var(--accent)] ring-offset-1 scale-110'
                                : 'hover:scale-105 opacity-80'
                            }`}
                            style={{ backgroundColor: colorOpt.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {catCreationNotice && (
                        <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                          <CheckCircle2 className="w-4 h-4" /> {catCreationNotice}
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={!newCatName.trim()}
                      className="px-5 py-2.5 text-sm font-semibold"
                    >
                      Create Category
                    </Button>
                  </div>
                </form>
              )}

              {/* Categories List */}
              <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-3">
                <h3 className="text-base font-bold text-[var(--ink)] mb-3">
                  Active Categories ({categories.length})
                </h3>

                <div className="divide-y divide-[var(--line)]">
                  {categories.map((cat) => (
                    <div key={cat.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat.color || '#305fdd' }}
                        />
                        <div>
                          <span className="font-semibold text-sm text-[var(--ink)] block truncate">
                            {cat.name}
                          </span>
                          <span className="text-xs font-mono text-[var(--faint)] block">
                            id: {cat.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {cat.isCustom ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
                            Personalized
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-[var(--canvas)] text-[var(--muted)] border border-[var(--line)]">
                            System Default
                          </span>
                        )}

                        {cat.isCustom && onDeleteCategory && (
                          <button
                            type="button"
                            aria-label={`Delete ${cat.name} category`}
                            onClick={() => handleDeleteCustomCategory(cat.id, cat.name)}
                            className="p-1.5 text-[var(--muted)] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 4: Preferences */}
          {activeSection === 'preferences' && (
            <section aria-labelledby="preferences-settings-heading" className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 id="preferences-settings-heading" className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Task & Planning Preferences
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Configure default values pre-filled when creating new responsibilities.
                </p>
              </div>

              <form onSubmit={handleSavePreferences} className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="pref-category" className="block text-sm font-semibold text-[var(--muted)] mb-1.5">
                      Default Category
                    </label>
                    <select
                      id="pref-category"
                      value={defaultCategory}
                      onChange={(e) => setDefaultCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.isCustom ? '★' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pref-priority" className="block text-sm font-semibold text-[var(--muted)] mb-1.5">
                      Default Priority
                    </label>
                    <select
                      id="pref-priority"
                      value={defaultPriority}
                      onChange={(e) => setDefaultPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pref-duetime" className="block text-sm font-semibold text-[var(--muted)] mb-1.5">
                      Default Due Time
                    </label>
                    <select
                      id="pref-duetime"
                      value={defaultDueTime}
                      onChange={(e) => setDefaultDueTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-xl focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                    >
                      <option value="23:59">23:59 (End of Day)</option>
                      <option value="17:00">17:00 (End of Business)</option>
                      <option value="12:00">12:00 (Noon)</option>
                      <option value="09:00">09:00 (Morning)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    {prefsSaved && (
                      <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-150">
                        <CheckCircle2 className="w-4 h-4" /> Preferences saved!
                      </span>
                    )}
                  </div>
                  <Button type="submit" variant="primary" size="md" className="px-5 py-2.5 text-sm font-semibold">
                    Save Preferences
                  </Button>
                </div>
              </form>
            </section>
          )}

          {/* SECTION 5: Workspace Actions */}
          {activeSection === 'workspace' && (
            <section aria-labelledby="workspace-actions-heading" className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 id="workspace-actions-heading" className="text-2xl font-bold tracking-tight text-[var(--ink)]">
                  Workspace Actions
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Manage high-level workspace maintenance and session termination.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] divide-y divide-[var(--line)]">
                {isPreview && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
                    <div>
                      <p className="text-base font-bold text-[var(--ink)]">Reset Demo Workspace</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">
                        Restores all demo tasks and planning fixtures back to default baseline.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleResetDemoData}
                      className="text-amber-700 border-amber-300 hover:bg-amber-50 shrink-0"
                    >
                      <RotateCcw className="w-4 h-4 mr-1.5" /> Reset Demo Data
                    </Button>
                  </div>
                )}

                {resetNotice && (
                  <div className="py-3 text-sm text-amber-700 font-semibold animate-pulse">
                    Resetting demo workspace data...
                  </div>
                )}

                {onSignOut && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
                    <div>
                      <p className="text-base font-bold text-[var(--ink)]">Sign Out of Session</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">
                        Securely end your current workspace session on this browser.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={onSignOut}
                      className="text-red-600 border-red-200 hover:bg-red-50 shrink-0"
                    >
                      <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
