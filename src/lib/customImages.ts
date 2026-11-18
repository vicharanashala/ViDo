export const CUSTOM_IMAGES_KEY = 'vido.customImages.v1';

export interface CustomImageRule {
  id: string;
  keyword: string;
  dataUrl: string;
  createdAt: string;
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'this',
  'that',
  'task',
  'today',
  'tomorrow',
  'about',
  'into',
  'your',
  'our',
  'my',
  'a',
  'an',
  'to',
  'of',
  'in',
  'on',
  'at',
  'is',
  'are',
  'be',
  'do',
  'get',
  'buy',
  'make',
  'write',
  'read',
  'call',
  'pay',
  'clean',
  'fix',
  'submit',
  'review',
  'finalize',
  'schedule',
  'follow',
  'up',
  'bake',
  'cook',
  'prepare',
  'plan',
  'start',
  'finish',
  'check',
  'update',
  'send',
  'email',
  'order',
  'return',
  'renew',
  'register',
  'wash',
  'water',
  'feed',
  'walk',
  'paint',
  'build',
  'create',
  'design',
  'organize',
  'sort',
  'pack',
  'unpack',
  'visit',
  'meet',
  'practice',
  'learn',
  'study',
]);

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 40);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function deriveImageKeyword(title: string): string {
  const words = title.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? [];
  const meaningful = words.find((word) => word.length > 2 && !STOP_WORDS.has(word));
  return normalizeKeyword(meaningful ?? words[0] ?? 'custom');
}

export function loadCustomImageRules(): CustomImageRule[] {
  const store = storage();
  if (!store) return [];
  try {
    const raw = store.getItem(CUSTOM_IMAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (rule): rule is CustomImageRule =>
        Boolean(rule) &&
        typeof rule.id === 'string' &&
        typeof rule.keyword === 'string' &&
        typeof rule.dataUrl === 'string' &&
        rule.keyword.trim().length > 0 &&
        rule.dataUrl.startsWith('data:image/')
    );
  } catch {
    return [];
  }
}

export function saveCustomImageRules(rules: CustomImageRule[]): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(rules));
  } catch {
    // Storage can be full or blocked; the current session still works.
  }
}

export function saveCustomImageRule(keyword: string, dataUrl: string): CustomImageRule | null {
  const cleanKeyword = normalizeKeyword(keyword);
  if (!cleanKeyword || !dataUrl.startsWith('data:image/')) return null;

  const rules = loadCustomImageRules();
  const next: CustomImageRule = {
    id: `custom-image-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    keyword: cleanKeyword,
    dataUrl,
    createdAt: new Date().toISOString(),
  };
  saveCustomImageRules([next, ...rules.filter((rule) => rule.keyword !== cleanKeyword)]);
  return next;
}

export function removeCustomImageRule(keyword: string): void {
  const cleanKeyword = normalizeKeyword(keyword);
  if (!cleanKeyword) return;
  saveCustomImageRules(loadCustomImageRules().filter((rule) => rule.keyword !== cleanKeyword));
}

export function findCustomImageRule(keyword: string): CustomImageRule | null {
  const cleanKeyword = normalizeKeyword(keyword);
  if (!cleanKeyword) return null;
  return loadCustomImageRules().find((rule) => rule.keyword === cleanKeyword) ?? null;
}

export function findCustomImageForTitle(
  title: string,
  keyword?: string
): CustomImageRule | null {
  const exact = keyword ? findCustomImageRule(keyword) : null;
  if (exact) return exact;

  return (
    loadCustomImageRules().find((rule) =>
      new RegExp(`\\b${escapeRegExp(rule.keyword)}\\b`, 'i').test(title)
    ) ?? null
  );
}
