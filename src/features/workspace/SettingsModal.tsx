import React, { useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { Button } from '../../components/ui';
import { SettingsView, type SettingsSection, type CustomListDefinition } from './views/SettingsView';
import type { UserCategory } from '../../data/categories';
import type { PriorityColors } from '../../utils/priorityColor';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: SettingsSection;
  isPreview?: boolean;
  user?: {
    id?: string;
    name: string;
    email?: string;
  };
  categories?: UserCategory[];
  onAddCategory?: (params: { name: string; color?: string }) => Promise<UserCategory> | UserCategory;
  onDeleteCategory?: (categoryId: string) => Promise<void> | void;
  onSignOut?: () => void;
  priorityColors?: PriorityColors;
  onUpdatePriorityColors?: (colors: PriorityColors) => void;
  customLists?: CustomListDefinition[];
  onCreateList?: (title: string) => void;
  onRenameList?: (id: string, newTitle: string) => void;
  onDeleteList?: (id: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialSection = 'account',
  isPreview = true,
  user,
  categories,
  onAddCategory,
  onDeleteCategory,
  onSignOut,
  priorityColors,
  onUpdatePriorityColors,
  customLists,
  onCreateList,
  onRenameList,
  onDeleteList,
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl h-[640px] max-h-[92vh] bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h2 id="settings-modal-title" className="text-xl font-bold tracking-tight text-[var(--ink)]">
              Settings
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Embedded YouTube Studio Two-Column Settings */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <SettingsView
            isPreview={isPreview}
            initialSection={initialSection}
            user={user}
            categories={categories}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
            onSignOut={onSignOut}
            isModal={true}
            onClose={onClose}
            priorityColors={priorityColors}
            onUpdatePriorityColors={onUpdatePriorityColors}
            customLists={customLists}
            onCreateList={onCreateList}
            onRenameList={onRenameList}
            onDeleteList={onDeleteList}
          />
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[var(--line)] px-6 py-3.5 flex items-center justify-end gap-3 bg-[var(--surface)] shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="px-5 text-sm font-semibold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
