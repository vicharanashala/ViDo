import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCategories } from './useCategories';

describe('useCategories', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default standard categories', () => {
    const { result } = renderHook(() => useCategories(null, 'demo'));

    expect(result.current.categories.length).toBe(3);
    expect(result.current.categories.map((c) => c.id)).toEqual(['personal', 'home', 'work']);
    expect(result.current.customCategories).toEqual([]);
  });

  it('adds a personalised custom category and persists to storage', async () => {
    const { result } = renderHook(() => useCategories(null, 'demo'));

    await act(async () => {
      await result.current.addCategory({ name: 'Health & Fitness', color: '#10b981' });
    });

    expect(result.current.categories.length).toBe(4);
    const added = result.current.categories.find((c) => c.name === 'Health & Fitness');
    expect(added).toBeDefined();
    expect(added?.id).toBe('health-fitness');
    expect(added?.color).toBe('#10b981');
    expect(added?.isCustom).toBe(true);

    // Verify localStorage persistence in demo mode
    const stored = JSON.parse(localStorage.getItem('vido-demo-custom-categories-v1') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('health-fitness');
  });

  it('deletes a custom category', async () => {
    const { result } = renderHook(() => useCategories(null, 'demo'));

    await act(async () => {
      await result.current.addCategory({ name: 'Finance' });
    });
    expect(result.current.categories.length).toBe(4);

    await act(async () => {
      await result.current.deleteCategory('finance');
    });

    expect(result.current.categories.length).toBe(3);
    expect(result.current.categories.find((c) => c.id === 'finance')).toBeUndefined();
  });
});
