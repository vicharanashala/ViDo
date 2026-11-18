import { beforeEach, describe, expect, it } from 'vitest';
import {
  deriveImageKeyword,
  findCustomImageForTitle,
  findCustomImageRule,
  loadCustomImageRules,
  removeCustomImageRule,
  saveCustomImageRule,
} from './customImages';

const image = 'data:image/webp;base64,abc123';

describe('custom task images', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves a rule and finds it by task name', () => {
    const rule = saveCustomImageRule('Sourdough', image);

    expect(rule?.keyword).toBe('sourdough');
    expect(findCustomImageForTitle('Bake sourdough bread')?.dataUrl).toBe(image);
    expect(findCustomImageForTitle('Bake sourdough bread', 'sourdough')?.keyword).toBe('sourdough');
    expect(findCustomImageForTitle('Buy milk')).toBeNull();
  });

  it('replaces an existing keyword instead of duplicating it', () => {
    saveCustomImageRule('sourdough', image);
    saveCustomImageRule('sourdough', 'data:image/webp;base64,new');

    const rules = loadCustomImageRules();
    expect(rules).toHaveLength(1);
    expect(rules[0].dataUrl).toBe('data:image/webp;base64,new');
  });

  it('removes a rule', () => {
    saveCustomImageRule('sourdough', image);
    removeCustomImageRule('sourdough');

    expect(findCustomImageRule('sourdough')).toBeNull();
    expect(loadCustomImageRules()).toHaveLength(0);
  });

  it('derives a useful default keyword from the task title', () => {
    expect(deriveImageKeyword('Buy milk')).toBe('milk');
    expect(deriveImageKeyword('Bake sourdough bread')).toBe('sourdough');
    expect(deriveImageKeyword('Review the budget')).toBe('budget');
  });
});
