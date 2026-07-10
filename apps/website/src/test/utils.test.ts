import { describe, it, expect, vi } from 'vitest';

const shared = await import('@agroconnect/shared');

describe('utils', () => {
  describe('cn', () => {
    it('joins truthy classes', () => {
      expect(shared.cn('a', 'b')).toBe('a b');
      expect(shared.cn('a', false && 'b', 'c')).toBe('a c');
      expect(shared.cn()).toBe('');
    });
  });

  describe('generateSlug', () => {
    it('generates URL-friendly slugs', () => {
      expect(shared.generateSlug('Fresh Tomatoes')).toBe('fresh-tomatoes');
      expect(shared.generateSlug('  Organic  Eggs  ')).toBe('organic-eggs');
      expect(shared.generateSlug('Maize (corn)')).toBe('maize-corn');
    });
  });

  describe('generateOrderNumber', () => {
    it('generates order number with correct format', () => {
      const num = shared.generateOrderNumber();
      expect(num).toMatch(/^AGC-\d{4}-\d{6}$/);
      expect(num).toContain(String(new Date().getFullYear()));
    });
  });

  describe('generateSKU', () => {
    it('generates SKU from inputs', () => {
      expect(shared.generateSKU('VEG', 'abc123def456', 1)).toBe('VEG-ABC1-0001');
      expect(shared.generateSKU('FRT', 'xyz789', 42)).toBe('FRT-XYZ7-0042');
    });
  });

  describe('truncate', () => {
    it('truncates long strings with ellipsis', () => {
      expect(shared.truncate('Hello World', 5)).toBe('Hello...');
    });

    it('returns full string if within length', () => {
      expect(shared.truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('debounce', () => {
    it('delays function execution', () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = shared.debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });

  describe('pluralize', () => {
    it('returns singular for count 1', () => {
      expect(shared.pluralize(1, 'item')).toBe('item');
    });

    it('returns plural for other counts', () => {
      expect(shared.pluralize(0, 'item')).toBe('items');
      expect(shared.pluralize(2, 'item')).toBe('items');
    });

    it('uses custom plural if provided', () => {
      expect(shared.pluralize(2, 'box', 'boxes')).toBe('boxes');
    });
  });
});
