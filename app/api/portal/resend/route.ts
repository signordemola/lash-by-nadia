import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { DatabaseUnavailableError } from "@/lib/tokens"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        client: { email: email.trim().toLowerCase() },
        status: "CONFIRMED",
      },
      orderBy: { startsAt: "asc" },
      select: { manageToken: true },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: "No upcoming booking found for that email address." },
        { status: 404 }
      )
    }

    return NextResponse.json({ token: appointment.manageToken })
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again." },
        { status: 503 }
      )
    }
    console.error("[portal/resend] Unhandled error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
