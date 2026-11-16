import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { isOwnerSessionValid } from "@/lib/owner-session"
import { OWNER_SESSION_COOKIE } from "@/lib/owner-session-cookie"

export const hasOwnerSession = async (): Promise<boolean> => {
  const cookieStore = await cookies()
  return isOwnerSessionValid(cookieStore.get(OWNER_SESSION_COOKIE)?.value)
}

export const requireOwnerPage = async (): Promise<void> => {
  if (!(await hasOwnerSession())) {
    redirect("/login")
  }
}
