import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock('@agroconnect/shared', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

const { GET, POST, DELETE } = await import('@/app/api/wishlist/route');

function makeURL(path: string, params?: Record<string, string>) {
  const url = new URL(`http://localhost:3000${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

describe('wishlist API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
  });

  describe('GET', () => {
    it('returns 401 when unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it('returns empty items when wishlist is empty', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      const res = await GET();
      const json = await res.json();
      expect(json.items).toEqual([]);
    });

    it('returns mapped wishlist items', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: 'w1',
                  created_at: '2026-07-01T00:00:00Z',
                  product: {
                    id: 'p1',
                    name: 'Tomatoes',
                    slug: 'tomatoes',
                    retail_price: 25.00,
                    discount_percentage: 10,
                    average_rating: 4.5,
                    status: 'active',
                    product_images: [
                      { image_url: 'https://img.com/tomato.jpg', is_primary: true },
                    ],
                  },
                },
              ],
              error: null,
            })),
          })),
        })),
      });

      const res = await GET();
      const json = await res.json();
      expect(json.items).toHaveLength(1);
      expect(json.items[0].wishlist_id).toBe('w1');
      expect(json.items[0].primary_image).toBe('https://img.com/tomato.jpg');
    });
  });

  describe('POST', () => {
    it('returns 401 when unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const res = await POST(new Request(makeURL('/api/wishlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1' }),
      }));
      expect(res.status).toBe(401);
    });

    it('returns 400 when product_id missing', async () => {
      const res = await POST(new Request(makeURL('/api/wishlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }));
      expect(res.status).toBe(400);
    });

    it('adds item to wishlist', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({ data: null, error: null })),
            })),
          })),
        })),
        insert: vi.fn(() => ({ error: null })),
      }));

      const res = await POST(new Request(makeURL('/api/wishlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1' }),
      }));
      const json = await res.json();
      expect(json.action).toBe('added');
      expect(res.status).toBe(201);
    });

    it('toggles (removes) existing wishlist item', async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => ({ data: { id: 'w1' }, error: null })),
            })),
          })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({ error: null })),
        })),
      }));

      const res = await POST(new Request(makeURL('/api/wishlist'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: 'p1' }),
      }));
      const json = await res.json();
      expect(json.action).toBe('removed');
    });
  });

  describe('DELETE', () => {
    it('removes wishlist item by product_id', async () => {
      mockSupabase.from.mockImplementation(() => ({
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() => ({ error: null })),
          })),
        })),
      }));

      const url = makeURL('/api/wishlist', { product_id: 'p1' });
      const res = await DELETE(new Request(url, { method: 'DELETE' }));
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
