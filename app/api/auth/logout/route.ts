import { NextRequest, NextResponse } from "next/server"
import { deleteOwnerSession } from "@/lib/owner-session"
import { OWNER_SESSION_COOKIE } from "@/lib/owner-session-cookie"

export async function POST(request: NextRequest) {
  await deleteOwnerSession(request.cookies.get(OWNER_SESSION_COOKIE)?.value)

  const response = NextResponse.json({ redirect: "/login" })
  response.cookies.set(OWNER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
