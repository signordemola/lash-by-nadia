import { NextRequest, NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
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

  const valid = await verifyPassword(password, ownerHash)
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  const response = NextResponse.json({ redirect: "/dashboard" })
  response.cookies.set("owner-token", "valid", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return response
}
