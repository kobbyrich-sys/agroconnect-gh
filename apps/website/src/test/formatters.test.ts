import { describe, it, expect } from 'vitest';

const shared = await import('@agroconnect/shared');

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats GHS prices with commas', () => {
      expect(shared.formatPrice(0)).toBe('₵0.00');
      expect(shared.formatPrice(1000)).toBe('₵1,000.00');
      expect(shared.formatPrice(1234567.89)).toBe('₵1,234,567.89');
    });
  });

  describe('formatDiscount', () => {
    it('formats percentage', () => {
      expect(shared.formatDiscount(25)).toBe('25% OFF');
      expect(shared.formatDiscount(50.7)).toBe('51% OFF');
    });
  });

  describe('formatDate', () => {
    it('formats a date string', () => {
      const result = shared.formatDate('2026-07-01');
      expect(result).toContain('Jul');
      expect(result).toContain('2026');
    });
  });

  describe('formatTimeAgo', () => {
    it('returns "just now" for recent dates', () => {
      expect(shared.formatTimeAgo(new Date())).toBe('just now');
    });

    it('returns minutes ago', () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(shared.formatTimeAgo(fiveMinAgo)).toBe('5m ago');
    });

    it('returns hours ago', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000);
      expect(shared.formatTimeAgo(threeHoursAgo)).toBe('3h ago');
    });

    it('returns days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400 * 1000);
      expect(shared.formatTimeAgo(twoDaysAgo)).toBe('2d ago');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats 10-digit numbers', () => {
      expect(shared.formatPhoneNumber('0241234567')).toBe('0241 234 567');
    });

    it('formats 233-prefix numbers', () => {
      expect(shared.formatPhoneNumber('233241234567')).toBe('0241 234 567');
    });
  });

  describe('formatStock', () => {
    it('returns out_of_stock for 0', () => {
      expect(shared.formatStock(0, 5)).toEqual({ label: 'Out of Stock', variant: 'out_of_stock' });
    });

    it('returns low_stock below threshold', () => {
      expect(shared.formatStock(3, 5)).toEqual({ label: '3 left', variant: 'low_stock' });
    });

    it('returns in_stock above threshold', () => {
      expect(shared.formatStock(100, 5)).toEqual({ label: 'In Stock', variant: 'in_stock' });
    });
  });

  describe('formatRating', () => {
    it('formats to one decimal', () => {
      expect(shared.formatRating(4)).toBe('4.0');
      expect(shared.formatRating(4.567)).toBe('4.6');
    });
  });
});
