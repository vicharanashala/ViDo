export interface UserCategory {
  id: string;
  name: string;
  color?: string;
  isCustom?: boolean;
  createdAt?: string;
}

export const DEFAULT_CATEGORIES: UserCategory[] = [
  { id: 'personal', name: 'Personal', color: '#305fdd', isCustom: false },
  { id: 'home', name: 'Household', color: '#10b981', isCustom: false },
  { id: 'work', name: 'Work', color: '#6366f1', isCustom: false },
];

export const CATEGORY_COLOR_OPTIONS: { name: string; hex: string }[] = [
  { name: 'Blue', hex: '#305fdd' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Slate', hex: '#64748b' },
];

export function slugifyCategory(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `cat-${Date.now()}`;
}
