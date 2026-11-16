import { beforeEach, describe, expect, it, vi } from "vitest"

const storeLimit = vi.fn()

vi.mock("@upstash/redis", () => ({
  Redis: class {},
}))

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = () => ({})
    limit = storeLimit
  },
}))

import { createRateLimiter } from "@/lib/rate-limit"

describe("createRateLimiter", () => {
  beforeEach(() => {
    storeLimit.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("allows a request that is under the limit", async () => {
    storeLimit.mockResolvedValue({ success: true, remaining: 4 })

    expect(await createRateLimiter(5, "1 m").limit("login:1.2.3.4")).toEqual({
      success: true,
    })
    expect(storeLimit).toHaveBeenCalledWith("login:1.2.3.4")
  })

  it("blocks a request that is over the limit", async () => {
    storeLimit.mockResolvedValue({ success: false, remaining: 0 })

    expect(await createRateLimiter(5, "1 m").limit("login:1.2.3.4")).toEqual({
      success: false,
    })
  })

  it("allows the request and logs when the store cannot be reached", async () => {
    storeLimit.mockRejectedValue(new Error("fetch failed"))

    expect(await createRateLimiter(5, "1 m").limit("login:1.2.3.4")).toEqual({
      success: true,
    })
    expect(console.error).toHaveBeenCalledTimes(1)
  })
})
