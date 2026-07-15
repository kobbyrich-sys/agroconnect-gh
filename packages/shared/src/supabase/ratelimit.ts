export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private maxAttempts: number,
    private windowMs: number,
  ) {}

  check(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record) return { allowed: true };

    if (now >= record.resetAt) {
      this.store.delete(key);
      return { allowed: true };
    }

    if (record.count >= this.maxAttempts) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfter: retryAfter > 0 ? retryAfter : 60 };
    }

    return { allowed: true };
  }

  increment(key: string): void {
    const now = Date.now();
    const record = this.store.get(key);

    if (record && now < record.resetAt) {
      record.count += 1;
    } else {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
    }
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}
