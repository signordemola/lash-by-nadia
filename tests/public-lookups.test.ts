import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"

const testDatabaseUrl = process.env.TEST_DATABASE_URL

const limit = vi.fn()
const sendEmail = vi.fn()

vi.mock("@/lib/rate-limit", () => ({
  createRateLimiter: () => ({ limit }),
}))

vi.mock("@/lib/resend", () => ({
  resend: { emails: { send: sendEmail } },
}))

const CLIENT_EMAIL = "amara.okafor@lookup-test.example"
const UNKNOWN_EMAIL = "nobody@lookup-test.example"
const MANAGE_TOKEN = "lookup-test-manage-token"
const SERVICE_SLUG = "lookup-test-classic"

const jsonRequest = (path: string, body: unknown) =>
  new NextRequest(`http://localhost${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7",
    },
    body: JSON.stringify(body),
  })

describe.skipIf(!testDatabaseUrl)("public lookups", () => {
  const loadDb = async () => {
    process.env.DATABASE_URL = testDatabaseUrl
    process.env.EMAIL_FROM = "Lash by Nadia <noreply@example.com>"
    process.env.NEXT_PUBLIC_BASE_URL = "https://studio.example"
    const { prisma } = await import("@/lib/db")
    return prisma
  }

  const removeFixtures = async () => {
    const prisma = await loadDb()
    await prisma.appointment.deleteMany({
      where: { manageToken: MANAGE_TOKEN },
    })
    await prisma.client.deleteMany({ where: { email: CLIENT_EMAIL } })
    await prisma.service.deleteMany({ where: { slug: SERVICE_SLUG } })
  }

  beforeEach(async () => {
    limit.mockReset()
    limit.mockResolvedValue({ success: true })
    sendEmail.mockReset()
    sendEmail.mockResolvedValue({ data: { id: "email-1" }, error: null })

    const prisma = await loadDb()
    await removeFixtures()
    const service = await prisma.service.create({
      data: {
        slug: SERVICE_SLUG,
        name: "Classic Set",
        duration: 90,
        price: 6500,
        deposit: 2000,
      },
    })
    const client = await prisma.client.create({
      data: {
        email: CLIENT_EMAIL,
        name: "Amara Okafor",
        phone: "07700 900123",
        allergies: "Latex",
      },
    })
    await prisma.appointment.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        startsAt: new Date("2030-06-05T09:00:00Z"),
        endsAt: new Date("2030-06-05T10:30:00Z"),
        depositAmount: 2000,
        manageToken: MANAGE_TOKEN,
      },
    })
  })

  afterAll(async () => {
    await removeFixtures()
    const prisma = await loadDb()
    await prisma.$disconnect()
  })

  describe("POST /api/portal/resend", () => {
    const callPortal = async (body: unknown) => {
      await loadDb()
      const { POST } = await import("@/app/api/portal/resend/route")
      return POST(jsonRequest("/api/portal/resend", body))
    }

    it("emails the manage link and never returns it", async () => {
      const response = await callPortal({ email: CLIENT_EMAIL })
      const text = await response.text()

      expect(response.status).toBe(200)
      expect(JSON.parse(text)).toEqual({ sent: true })
      expect(text).not.toContain(MANAGE_TOKEN)
      expect(sendEmail).toHaveBeenCalledTimes(1)
      const email = sendEmail.mock.calls[0][0]
      expect(email.to).toEqual([CLIENT_EMAIL])
      expect(email.html).toContain(
        `https://studio.example/appointment/${MANAGE_TOKEN}`
      )
    })

    it("gives the same response for an email with no booking", async () => {
      const known = await callPortal({ email: CLIENT_EMAIL })
      const unknown = await callPortal({ email: UNKNOWN_EMAIL })

      expect(unknown.status).toBe(known.status)
      expect(await unknown.json()).toEqual(await known.json())
      expect(sendEmail).toHaveBeenCalledTimes(1)
    })

    it("finds the booking when the email has other letter case and spaces", async () => {
      const response = await callPortal({
        email: `  ${CLIENT_EMAIL.toUpperCase()} `,
      })

      expect(response.status).toBe(200)
      expect(sendEmail).toHaveBeenCalledTimes(1)
    })

    it("rejects a value that is not an email address", async () => {
      const response = await callPortal({ email: "not-an-email" })

      expect(response.status).toBe(400)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it("stops before the database when the rate limit is reached", async () => {
      limit.mockResolvedValue({ success: false })
      const response = await callPortal({ email: CLIENT_EMAIL })

      expect(response.status).toBe(429)
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it("keeps the same response when the email provider fails", async () => {
      sendEmail.mockResolvedValue({ data: null, error: { message: "down" } })
      const response = await callPortal({ email: CLIENT_EMAIL })

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ sent: true })
    })
  })

  describe("POST /api/clients/lookup", () => {
    const callLookup = async (body: unknown) => {
      await loadDb()
      const { POST } = await import("@/app/api/clients/lookup/route")
      return POST(jsonRequest("/api/clients/lookup", body))
    }

    it("returns only a found flag for a known client", async () => {
      const response = await callLookup({ email: CLIENT_EMAIL })
      const text = await response.text()

      expect(JSON.parse(text)).toEqual({ found: true })
      expect(text).not.toContain("Amara")
      expect(text).not.toContain("07700")
      expect(text).not.toContain("Latex")
    })

    it("returns found false for an unknown email", async () => {
      const response = await callLookup({ email: UNKNOWN_EMAIL })

      expect(await response.json()).toEqual({ found: false })
    })

    it("stops before the database when the rate limit is reached", async () => {
      limit.mockResolvedValue({ success: false })
      const response = await callLookup({ email: CLIENT_EMAIL })

      expect(response.status).toBe(429)
      expect(await response.json()).toEqual({ error: "Too many requests" })
    })
  })

  describe("POST /api/auth/login", () => {
    const callLogin = async (body: unknown) => {
      const prisma = await loadDb()
      process.env.OWNER_EMAIL = "owner@example.com"
      process.env.OWNER_PASSWORD_HASH =
        "a5e4b8c0c1d1d7f0e7b5b3b5c1c3d0d4c0c2f8c1d2e3f4a5b6c7d8e9f0a1b2c3"
      const { POST } = await import("@/app/api/auth/login/route")
      const response = await POST(jsonRequest("/api/auth/login", body))
      return { response, prisma }
    }

    it("stops before the password check when the rate limit is reached", async () => {
      limit.mockResolvedValue({ success: false })
      const sessionsBefore = await (await loadDb()).ownerSession.count()
      const { response, prisma } = await callLogin({
        email: "owner@example.com",
        password: "any",
      })

      expect(response.status).toBe(429)
      expect(response.headers.get("set-cookie")).toBeNull()
      expect(limit).toHaveBeenCalledWith("login:203.0.113.7")
      expect(await prisma.ownerSession.count()).toBe(sessionsBefore)
    })

    it("rejects a wrong password and sets no cookie", async () => {
      const { response } = await callLogin({
        email: "owner@example.com",
        password: "wrong-password",
      })

      expect(response.status).toBe(401)
      expect(response.headers.get("set-cookie")).toBeNull()
    })
  })
})
