// Rate Limiting (BE-011)
// Upstash Redis 기반 슬라이딩 윈도우 — 미설정 시 In-Memory 폴백
// 주의: In-Memory는 Edge 다중 인스턴스 환경에서는 인스턴스별로 독립 동작
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// Upstash 설정 여부에 따라 클라이언트 초기화
function createRatelimit(): Ratelimit | null {
  const url = process.env['UPSTASH_REDIS_REST_URL'];
  const token = process.env['UPSTASH_REDIS_REST_TOKEN'];
  if (!url || !token) return null;

  try {
    return new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'choijang:rl',
    });
  } catch {
    return null;
  }
}

// In-Memory 폴백 (개발 환경 / Upstash 미설정 시)
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();
const IN_MEMORY_LIMIT = 10;
const IN_MEMORY_WINDOW_MS = 60_000;

function checkInMemory(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = inMemoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    inMemoryStore.set(identifier, { count: 1, resetAt: now + IN_MEMORY_WINDOW_MS });
    return { success: true, remaining: IN_MEMORY_LIMIT - 1, reset: now + IN_MEMORY_WINDOW_MS };
  }

  if (record.count >= IN_MEMORY_LIMIT) {
    return { success: false, remaining: 0, reset: record.resetAt };
  }

  record.count++;
  return { success: true, remaining: IN_MEMORY_LIMIT - record.count, reset: record.resetAt };
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const ratelimit = createRatelimit();

  if (ratelimit) {
    try {
      const result = await ratelimit.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.error('Upstash rate limit 실패, in-memory 폴백:', error);
    }
  }

  return checkInMemory(identifier);
}
