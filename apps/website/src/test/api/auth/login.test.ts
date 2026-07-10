import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
};

vi.mock('@agroconnect/shared', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

const { POST } = await import('@/app/api/auth/login/route');

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when email and password are missing', async () => {
    const res = await POST(makeRequest({ email: '', password: '' }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Email and password are required');
  });

  it('returns 401 for invalid credentials', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    const res = await POST(makeRequest({ email: 'a@b.com', password: 'wrong' }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toBe('Invalid email or password');
  });

  it('returns 200 with user and session on success', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'test@example.com',
      email_confirmed_at: '2026-01-01T00:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    };
    const fakeSession = {
      access_token: 'tok_123',
      refresh_token: 'ref_456',
      expires_at: 9999999999,
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: fakeUser, session: fakeSession },
      error: null,
    });

    mockSupabase.from.mockImplementation(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'user-1',
              full_name: 'Test User',
              phone: '0241234567',
              avatar_url: null,
              role: 'buyer',
              status: 'active',
            },
            error: null,
          })),
        })),
      })),
    }));

    const res = await POST(makeRequest({ email: 'test@example.com', password: 'password123' }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.email).toBe('test@example.com');
    expect(json.session.access_token).toBe('tok_123');
  });

  it('returns 500 on unexpected errors', async () => {
    mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('DB crash'));

    const res = await POST(makeRequest({ email: 'a@b.com', password: 'pass1234' }));
    expect(res.status).toBe(500);
  });
});
