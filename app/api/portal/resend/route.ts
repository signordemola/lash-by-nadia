import { NextRequest, NextResponse } from "next/server"
import { formatInTimeZone } from "date-fns-tz"
import { prisma } from "@/lib/db"
import { resend } from "@/lib/resend"
import { createRateLimiter } from "@/lib/rate-limit"
import { DatabaseUnavailableError } from "@/lib/tokens"
import { manageLinkHtml } from "@/emails/manage-link"
import { ReturningClientLookupSchema } from "@/schemas/booking.schema"

const limiter = createRateLimiter(5, "1 m")
const TZ = "Europe/London"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon"
  const { success } = await limiter.limit(`portal:${ip}`)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const body = await request.json()
    const parsed = ReturningClientLookupSchema.safeParse({
      email: typeof body?.email === "string" ? body.email.trim() : body?.email,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        client: { email: parsed.data.email.toLowerCase() },
        status: "CONFIRMED",
      },
      orderBy: { startsAt: "asc" },
      include: { client: true, service: true },
    })

    if (appointment) {
      const { error } = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: [appointment.client.email],
        subject: `Your booking link — ${appointment.service.name}`,
        html: manageLinkHtml({
          clientName: appointment.client.name,
          service: appointment.service.name,
          date: formatInTimeZone(appointment.startsAt, TZ, "EEEE d MMMM yyyy"),
          time: formatInTimeZone(appointment.startsAt, TZ, "HH:mm"),
          manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${appointment.manageToken}`,
        }),
      })
      if (error) {
        console.error("[portal/resend] Email failed:", error)
      }
    }

    return NextResponse.json({ sent: true })
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
