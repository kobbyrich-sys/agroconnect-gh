import { describe, it, expect } from 'vitest';

const shared = await import('@agroconnect/shared');

describe('validators', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(shared.isValidEmail('user@example.com')).toBe(true);
      expect(shared.isValidEmail('john.doe@agroconnect.gh')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(shared.isValidEmail('')).toBe(false);
      expect(shared.isValidEmail('not-an-email')).toBe(false);
      expect(shared.isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('accepts Ghana 0-prefix numbers', () => {
      expect(shared.isValidPhone('0241234567')).toBe(true);
      expect(shared.isValidPhone('0541234567')).toBe(true);
    });

    it('accepts Ghana 233-prefix numbers', () => {
      expect(shared.isValidPhone('233241234567')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(shared.isValidPhone('123')).toBe(false);
      expect(shared.isValidPhone('')).toBe(false);
    });
  });

  describe('isValidGhanaCard', () => {
    it('accepts valid Ghana Card format', () => {
      expect(shared.isValidGhanaCard('GHA-123456789-1')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(shared.isValidGhanaCard('')).toBe(false);
      expect(shared.isValidGhanaCard('1234567890')).toBe(false);
    });
  });

  describe('isValidGPSAddress', () => {
    it('accepts valid GPS addresses', () => {
      expect(shared.isValidGPSAddress('GA-1234-5678')).toBe(true);
      expect(shared.isValidGPSAddress('AK-0001-0001')).toBe(true);
    });

    it('rejects invalid GPS addresses', () => {
      expect(shared.isValidGPSAddress('')).toBe(false);
      expect(shared.isValidGPSAddress('GA-123-456')).toBe(false);
    });
  });

  describe('isValidPrice', () => {
    it('accepts positive finite numbers', () => {
      expect(shared.isValidPrice(1)).toBe(true);
      expect(shared.isValidPrice(99.99)).toBe(true);
    });

    it('rejects zero, negative, and non-finite', () => {
      expect(shared.isValidPrice(0)).toBe(false);
      expect(shared.isValidPrice(-5)).toBe(false);
      expect(shared.isValidPrice(Infinity)).toBe(false);
      expect(shared.isValidPrice(NaN)).toBe(false);
    });
  });

  describe('isValidStock', () => {
    it('accepts non-negative integers', () => {
      expect(shared.isValidStock(0)).toBe(true);
      expect(shared.isValidStock(100)).toBe(true);
    });

    it('rejects negative and non-integer', () => {
      expect(shared.isValidStock(-1)).toBe(false);
      expect(shared.isValidStock(1.5)).toBe(false);
    });
  });

  describe('isValidRating', () => {
    it('accepts 1-5', () => {
      expect(shared.isValidRating(1)).toBe(true);
      expect(shared.isValidRating(3)).toBe(true);
      expect(shared.isValidRating(5)).toBe(true);
    });

    it('rejects out of range', () => {
      expect(shared.isValidRating(0)).toBe(false);
      expect(shared.isValidRating(6)).toBe(false);
    });
  });

  describe('isValidDiscountPercentage', () => {
    it('accepts 0-100', () => {
      expect(shared.isValidDiscountPercentage(0)).toBe(true);
      expect(shared.isValidDiscountPercentage(50)).toBe(true);
      expect(shared.isValidDiscountPercentage(100)).toBe(true);
    });

    it('rejects out of range', () => {
      expect(shared.isValidDiscountPercentage(-1)).toBe(false);
      expect(shared.isValidDiscountPercentage(101)).toBe(false);
    });
  });
});
