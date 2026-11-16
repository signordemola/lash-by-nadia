import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  retry: { retries: 1 },
})

export function createRateLimiter(
  requests: number,
  window: `${number} m` | `${number} s`
) {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  })

  return {
    limit: async (identifier: string): Promise<{ success: boolean }> => {
      try {
        const { success } = await ratelimit.limit(identifier)
        return { success }
      } catch (error) {
        console.error(
          "[rate-limit] Store unreachable. Request allowed without a limit:",
          error
        )
        return { success: true }
      }
    },
  }
}
