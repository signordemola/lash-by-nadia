import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { OWNER_SESSION_COOKIE } from "@/lib/owner-session-cookie"

export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next()
  }

  if (request.cookies.has(OWNER_SESSION_COOKIE)) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
