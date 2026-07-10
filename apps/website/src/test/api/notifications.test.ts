import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock('@agroconnect/shared', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

const { GET, PUT } = await import('@/app/api/notifications/route');

describe('notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    });
  });

  describe('GET', () => {
    const baseUrl = 'http://localhost:3000/api/notifications';

    it('returns 401 when unauthenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      const res = await GET(new Request(baseUrl));
      expect(res.status).toBe(401);
    });

    it('returns paginated notifications', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => ({
                data: [
                  { id: 'n1', title: 'Order Shipped', message: 'Your order has shipped', is_read: false, created_at: '2026-07-08T12:00:00Z' },
                ],
                count: 1,
                error: null,
              })),
            })),
          })),
        })),
      });

      const res = await GET(new Request(`${baseUrl}?page=1&limit=10`));
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.notifications).toHaveLength(1);
      expect(json.pagination.total).toBe(1);
    });

    it('filters unread notifications', async () => {
      let appliedFilter = false;
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              eq: vi.fn(() => {
                appliedFilter = true;
                return {
                  range: vi.fn(() => ({ data: [], count: 0, error: null })),
                };
              }),
            })),
          })),
        })),
      });

      await GET(new Request(`${baseUrl}?unread=true`));
      expect(appliedFilter).toBe(true);
    });
  });

  describe('PUT', () => {
    it('marks all notifications as read', async () => {
      let updateCalled = false;
      mockSupabase.from.mockImplementation(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => {
              updateCalled = true;
              return { error: null };
            }),
          })),
        })),
      }));

      const res = await PUT();
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(updateCalled).toBe(true);
    });
  });
});
