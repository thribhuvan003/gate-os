type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, RateLimitEntry>();
const windowMilliseconds = 10 * 60 * 1000;
const maximumAttempts = 8;

export function checkInviteRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = attempts.get(identifier);

  if (!existing || existing.resetAt <= now) {
    attempts.set(identifier, { count: 1, resetAt: now + windowMilliseconds });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= maximumAttempts) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
