import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock('@agroconnect/shared', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

const { GET, POST } = await import('@/app/api/cart/route');

const baseUrl = 'http://localhost:3000/api/cart';

describe('cart API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
  });

  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const res = await GET(new Request(baseUrl));
      expect(res.status).toBe(401);
    });

    it('creates cart if none exists and returns empty items', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'carts') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => ({ data: null, error: null })),
              })),
            })),
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({ data: { id: 'cart-new' }, error: null })),
              })),
            })),
          };
        }
        if (table === 'cart_items') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  data: [],
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const res = await GET(new Request(baseUrl));
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.cart_id).toBe('cart-new');
      expect(json.items).toEqual([]);
      expect(json.subtotal).toBe(0);
    });

    it('returns cart items with subtotal', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'carts') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => ({ data: { id: 'cart-1' }, error: null })),
              })),
            })),
            insert: vi.fn(),
          };
        }
        if (table === 'cart_items') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  data: [
                    {
                      id: 'ci1', quantity: 2, wholesale: false, created_at: '2026-01-01T00:00:00Z',
                      product: {
                        id: 'p1', name: 'Maize', slug: 'maize', retail_price: '50.00',
                        wholesale_price: null, wholesale_min_quantity: null,
                        stock_quantity: 100, low_stock_threshold: 10, discount_percentage: 0,
                        status: 'active', average_rating: 4.5, sold_count: 20,
                        primary_image: [{ image_url: 'https://img.com/maize.jpg', is_primary: true }],
                      },
                    },
                  ],
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const res = await GET(new Request(baseUrl));
      const json = await res.json();
      expect(json.items).toHaveLength(1);
      expect(json.subtotal).toBe(100);
      expect(json.item_count).toBe(1);
    });
  });

  describe('POST', () => {
    it('requires product_id and quantity', async () => {
      const res = await POST(new Request(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }));
      expect(res.status).toBe(400);
    });

    it('rejects quantity less than 1', async () => {
      const res = await POST(new Request(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1', quantity: 0 }),
      }));
      expect(res.status).toBe(400);
    });

    it('returns 404 for unavailable product', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({ data: null, error: null })),
              })),
            })),
          };
        }
        return {};
      });

      const res = await POST(new Request(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1', quantity: 1 }),
      }));
      expect(res.status).toBe(404);
    });

    it('adds item to cart', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { id: 'p1', stock_quantity: 100, status: 'active' },
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'carts') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(() => ({ data: { id: 'cart-1' }, error: null })),
              })),
            })),
            insert: vi.fn(),
          };
        }
        if (table === 'cart_items') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(() => ({ data: null, error: null })),
                })),
              })),
            })),
            insert: vi.fn(() => ({ error: null })),
          };
        }
        return {};
      });

      const res = await POST(new Request(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1', quantity: 2 }),
      }));
      expect(res.status).toBe(200);
    });

    it('rejects when quantity exceeds stock', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: { id: 'p1', stock_quantity: 5, status: 'active' },
                  error: null,
                })),
              })),
            })),
          };
        }
        return {};
      });

      const res = await POST(new Request(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1', quantity: 10 }),
      }));
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Only 5 in stock');
    });
  });
});
