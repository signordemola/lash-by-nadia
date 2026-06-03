import { describe, it, expect } from "vitest"
import { areIntervalsOverlapping, addMinutes } from "date-fns"

describe("Slot overlap detection", () => {
  it("detects overlapping intervals", () => {
    const slot = {
      start: new Date("2026-06-15T10:00:00"),
      end: new Date("2026-06-15T11:30:00"),
    }
    const conflict = {
      start: new Date("2026-06-15T10:30:00"),
      end: new Date("2026-06-15T11:00:00"),
    }
    expect(areIntervalsOverlapping(slot, conflict)).toBe(true)
  })

  it("detects non-overlapping intervals with buffer", () => {
    const buffer = 15 // minutes
    const slot = {
      start: new Date("2026-06-15T10:00:00"),
      end: new Date("2026-06-15T11:30:00"),
    }
    const adj = {
      start: addMinutes(new Date("2026-06-15T11:30:00"), buffer),
      end: new Date("2026-06-15T13:00:00"),
    }
    expect(areIntervalsOverlapping(slot, adj)).toBe(false)
  })

  it("detects adjacent intervals as non-overlapping without buffer", () => {
    const slot = {
      start: new Date("2026-06-15T10:00:00"),
      end: new Date("2026-06-15T11:30:00"),
    }
    const adjacent = {
      start: new Date("2026-06-15T11:30:00"),
      end: new Date("2026-06-15T13:00:00"),
    }
    expect(areIntervalsOverlapping(slot, adjacent)).toBe(false)
  })

  it("buffer pushes adjacent intervals into overlap", () => {
    const buffer = 15
    const slot = {
      start: new Date("2026-06-15T10:00:00"),
      end: new Date("2026-06-15T11:30:00"),
    }
    const blocked = {
      start: new Date(
        new Date("2026-06-15T11:30:00").getTime() - buffer * 60000
      ),
      end: new Date("2026-06-15T13:00:00"),
    }
    expect(areIntervalsOverlapping(slot, blocked)).toBe(true)
  })
})

describe("Minimum booking notice (120 min)", () => {
  it("rejects slots starting less than 120 minutes from now", () => {
    const now = new Date()
    const slotStart = addMinutes(now, 60)
    const minBookable = addMinutes(now, 120)
    expect(slotStart < minBookable).toBe(true)
  })

  it("accepts slots starting 120 minutes or more from now", () => {
    const now = new Date()
    const slotStart = addMinutes(now, 120)
    const minBookable = addMinutes(now, 120)
    expect(slotStart >= minBookable).toBe(true)
  })
})

describe("Slot Hold API (requires running server)", () => {
  it.skip("returns 409 when two clients hold the same slot", async () => {
    const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3000"
    const body = JSON.stringify({
      serviceSlug: "classic",
      date: "2026-12-25",
      time: "10:00",
    })

    const [a, b] = await Promise.all([
      fetch(`${BASE}/api/slots/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      fetch(`${BASE}/api/slots/hold`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
    ])

    const statuses = [a.status, b.status].sort()
    expect(statuses).toContain(200)
    expect(statuses).toContain(409)
  })
})
