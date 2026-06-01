import { getIronSession, SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import type { SessionData } from "@/types/appointment"

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "lash-by-nadia-session",
  ttl: 60 * 60 * 24 * 7,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function requireOwner() {
  const session = await getSession()
  if (!session.isLoggedIn) {
    redirect("/login")
  }
  return session
}
