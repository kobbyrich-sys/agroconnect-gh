import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@agroconnect/shared', () => ({
  createServerClient: vi.fn(() => mockSupabase),
}));

const { POST } = await import('@/app/api/auth/register/route');

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com' }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toContain('required');
  });

  it('returns 400 when password is too short', async () => {
    const res = await POST(makeRequest({ email: 'a@b.com', password: 'short', full_name: 'Test' }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('Password must be at least 8 characters');
  });

  it('returns 201 on successful registration', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: 'new-user', email: 'test@example.com', created_at: '2026-01-01T00:00:00Z' },
        session: null,
      },
      error: null,
    });

    const res = await POST(makeRequest({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      phone: '0241234567',
      role: 'buyer',
    }));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.user.email).toBe('test@example.com');
  });

  it('returns 400 when signup fails', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });

    const res = await POST(makeRequest({
      email: 'exists@example.com',
      password: 'password123',
      full_name: 'Existing',
    }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBe('User already registered');
  });

  it('returns 500 on unexpected errors', async () => {
    mockSupabase.auth.signUp.mockRejectedValue(new Error('Network error'));

    const res = await POST(makeRequest({
      email: 'a@b.com',
      password: 'password123',
      full_name: 'Test',
    }));
    expect(res.status).toBe(500);
  });
});
