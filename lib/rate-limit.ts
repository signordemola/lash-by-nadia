type RateLimitWindow = `${number} m` | `${number} s`

type Counter = { count: number; resetAt: number }

const MAX_TRACKED_IDENTIFIERS = 5000

const toMilliseconds = (window: RateLimitWindow): number => {
  const [amount, unit] = window.split(" ")
  return Number(amount) * (unit === "m" ? 60_000 : 1000)
}

const removeExpired = (counters: Map<string, Counter>, now: number): void => {
  for (const [identifier, counter] of counters) {
    if (counter.resetAt <= now) {
      counters.delete(identifier)
    }
  }
}

export const createRateLimiter = (
  requests: number,
  window: RateLimitWindow
) => {
  const windowMs = toMilliseconds(window)
  const counters = new Map<string, Counter>()

  return {
    limit: async (
      identifier: string,
      now: number = Date.now()
    ): Promise<{ success: boolean }> => {
      const counter = counters.get(identifier)

      if (!counter || counter.resetAt <= now) {
        if (counters.size >= MAX_TRACKED_IDENTIFIERS) {
          removeExpired(counters, now)
        }
        counters.set(identifier, { count: 1, resetAt: now + windowMs })
        return { success: true }
      }

      counter.count += 1
      return { success: counter.count <= requests }
    },
  }
}
