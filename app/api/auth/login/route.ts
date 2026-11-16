import { NextRequest, NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth"
import { createRateLimiter } from "@/lib/rate-limit"
import { createOwnerSession } from "@/lib/owner-session"
import {
  OWNER_SESSION_COOKIE,
  OWNER_SESSION_TTL_SECONDS,
} from "@/lib/owner-session-cookie"

const limiter = createRateLimiter(5, "1 m")

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon"
  const { success } = await limiter.limit(`login:${ip}`)
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    )
  }

  const body = await request.json()
  const { email, password } = body

  const ownerEmail = process.env.OWNER_EMAIL
  const ownerHash = process.env.OWNER_PASSWORD_HASH

  if (!ownerEmail || !ownerHash) {
    return NextResponse.json(
      { error: "Server not configured" },
      { status: 500 }
    )
  }

  if (email !== ownerEmail) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const valid = verifyPassword(password, ownerHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const sessionToken = await createOwnerSession()

  const response = NextResponse.json({ redirect: "/dashboard" })
  response.cookies.set(OWNER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OWNER_SESSION_TTL_SECONDS,
  })

  return response
}
