import { afterAll, beforeEach, describe, expect, it } from "vitest"

const testDatabaseUrl = process.env.TEST_DATABASE_URL

describe.skipIf(!testDatabaseUrl)("owner session", () => {
  const loadModules = async () => {
    process.env.DATABASE_URL = testDatabaseUrl
    const { prisma } = await import("@/lib/db")
    const ownerSession = await import("@/lib/owner-session")
    return { prisma, ...ownerSession }
  }

  beforeEach(async () => {
    const { prisma } = await loadModules()
    await prisma.ownerSession.deleteMany()
  })

  afterAll(async () => {
    const { prisma } = await loadModules()
    await prisma.$disconnect()
  })

  it("accepts the token that sign-in created", async () => {
    const { createOwnerSession, isOwnerSessionValid } = await loadModules()
    const token = await createOwnerSession()

    expect(await isOwnerSessionValid(token)).toBe(true)
  })

  it("rejects a missing token, a forged token and the old fixed value", async () => {
    const { createOwnerSession, isOwnerSessionValid } = await loadModules()
    await createOwnerSession()

    expect(await isOwnerSessionValid(undefined)).toBe(false)
    expect(await isOwnerSessionValid("")).toBe(false)
    expect(await isOwnerSessionValid("valid")).toBe(false)
    expect(await isOwnerSessionValid("not-a-real-session-token")).toBe(false)
  })

  it("stores a hash, so a database row cannot be used as a cookie", async () => {
    const { prisma, createOwnerSession, isOwnerSessionValid } =
      await loadModules()
    const token = await createOwnerSession()
    const rows = await prisma.ownerSession.findMany()

    expect(rows).toHaveLength(1)
    expect(rows[0].id).not.toBe(token)
    expect(await isOwnerSessionValid(rows[0].id)).toBe(false)
  })

  it("rejects a token after 24 hours", async () => {
    const { createOwnerSession, isOwnerSessionValid } = await loadModules()
    const signedInAt = new Date("2026-11-16T10:00:00Z")
    const token = await createOwnerSession(signedInAt)

    expect(
      await isOwnerSessionValid(token, new Date("2026-11-17T09:59:59Z"))
    ).toBe(true)
    expect(
      await isOwnerSessionValid(token, new Date("2026-11-17T10:00:00Z"))
    ).toBe(false)
  })

  it("rejects a token after sign-out", async () => {
    const { createOwnerSession, deleteOwnerSession, isOwnerSessionValid } =
      await loadModules()
    const token = await createOwnerSession()
    await deleteOwnerSession(token)

    expect(await isOwnerSessionValid(token)).toBe(false)
  })

  it("keeps a second device signed in when the first signs out", async () => {
    const { createOwnerSession, deleteOwnerSession, isOwnerSessionValid } =
      await loadModules()
    const first = await createOwnerSession()
    const second = await createOwnerSession()
    await deleteOwnerSession(first)

    expect(await isOwnerSessionValid(second)).toBe(true)
  })

  it("removes expired rows at the next sign-in", async () => {
    const { prisma, createOwnerSession } = await loadModules()
    await createOwnerSession(new Date("2026-11-01T10:00:00Z"))
    await createOwnerSession(new Date("2026-11-16T10:00:00Z"))

    expect(await prisma.ownerSession.count()).toBe(1)
  })
})
