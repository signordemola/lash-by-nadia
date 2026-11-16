import { describe, expect, it } from "vitest"
import { createRateLimiter } from "@/lib/rate-limit"

const START = Date.parse("2026-11-16T10:00:00Z")

describe("createRateLimiter", () => {
  it("allows requests up to the limit and blocks the next one", async () => {
    const limiter = createRateLimiter(3, "1 m")

    expect(await limiter.limit("1.2.3.4", START)).toEqual({ success: true })
    expect(await limiter.limit("1.2.3.4", START + 1000)).toEqual({
      success: true,
    })
    expect(await limiter.limit("1.2.3.4", START + 2000)).toEqual({
      success: true,
    })
    expect(await limiter.limit("1.2.3.4", START + 3000)).toEqual({
      success: false,
    })
  })

  it("allows requests again when the window ends", async () => {
    const limiter = createRateLimiter(1, "1 m")
    await limiter.limit("1.2.3.4", START)

    expect(await limiter.limit("1.2.3.4", START + 59_999)).toEqual({
      success: false,
    })
    expect(await limiter.limit("1.2.3.4", START + 60_000)).toEqual({
      success: true,
    })
  })

  it("counts each identifier separately", async () => {
    const limiter = createRateLimiter(1, "1 m")
    await limiter.limit("1.2.3.4", START)

    expect(await limiter.limit("5.6.7.8", START)).toEqual({ success: true })
  })

  it("keeps separate counts for separate limiters", async () => {
    const signIn = createRateLimiter(1, "1 m")
    const portal = createRateLimiter(1, "1 m")
    await signIn.limit("1.2.3.4", START)

    expect(await portal.limit("1.2.3.4", START)).toEqual({ success: true })
  })

  it("reads a window in seconds", async () => {
    const limiter = createRateLimiter(1, "10 s")
    await limiter.limit("1.2.3.4", START)

    expect(await limiter.limit("1.2.3.4", START + 9_999)).toEqual({
      success: false,
    })
    expect(await limiter.limit("1.2.3.4", START + 10_000)).toEqual({
      success: true,
    })
  })
})
