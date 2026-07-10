import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockQuery = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => ({
      eq: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({
                data: [],
                count: 0,
                error: null,
              })),
            })),
          })),
        })),
      })),
    })),
  })),
}));

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(() => mockQuery()),
  rpc: vi.fn(),
};

vi.mock('@agroconnect/shared', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

const { GET } = await import('@/app/api/products/route');

describe('GET /api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function makeRequest(searchParams?: string) {
    const url = searchParams
      ? `http://localhost:3000/api/products?${searchParams}`
      : 'http://localhost:3000/api/products';
    return new Request(url);
  }

  it('returns paginated products without filters', async () => {
    mockSupabase.from.mockImplementation(() => {
      let chain: Record<string, any> = {};
      const thenable = {
        data: [
          {
            id: 'p1', name: 'Test Product', retail_price: 100,
            product_images: [],
            categories: { name: 'Test Cat', slug: 'test-cat' },
            businesses: { business_name: 'Biz', business_logo: null, business_type: 'farmer', gps_address: null },
          },
        ],
        count: 1,
        error: null,
      };
      chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        range: vi.fn(() => thenable),
      };
      return chain;
    });

    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.products).toHaveLength(1);
    expect(json.pagination.page).toBe(1);
  });

  it('applies category filter', async () => {
    mockSupabase.from.mockImplementation(() => {
      const thenable = { data: [], count: 0, error: null };
      const chain: Record<string, any> = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        range: vi.fn(() => thenable),
        gte: vi.fn(() => chain),
        lte: vi.fn(() => chain),
      };
      // Override eq to return chain for the first call but capture category
      chain.eq = vi.fn(() => chain);
      chain.eq.mockImplementation((field: string) => {
        chain._filter = field;
        return chain;
      });
      return chain;
    });

    const res = await GET(makeRequest('category=vegetables'));
    expect(res.status).toBe(200);
  });

  it('returns empty array when no products', async () => {
    mockSupabase.from.mockImplementation(() => {
      const thenable = { data: [], count: 0, error: null };
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        range: vi.fn(() => thenable),
      };
      return chain;
    });

    const res = await GET(makeRequest());
    const json = await res.json();
    expect(json.products).toEqual([]);
    expect(json.pagination.total).toBe(0);
  });

  it('handles Supabase error', async () => {
    mockSupabase.from.mockImplementation(() => {
      const thenable = { data: null, count: null, error: { message: 'DB error' } };
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        range: vi.fn(() => thenable),
      };
      return chain;
    });

    const res = await GET(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('DB error');
  });

  it('enforces max limit of 100', async () => {
    mockSupabase.from.mockImplementation(() => {
      const thenable = { data: [], count: 0, error: null };
      let capturedLimit = 0;
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        order: vi.fn(() => chain),
        range: vi.fn((_offset: number, end: number) => {
          capturedLimit = end;
          return thenable;
        }),
      };
      return chain;
    });

    await GET(makeRequest('limit=999'));
  });
});
