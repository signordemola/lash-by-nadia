import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { CreateBookingSchema } from "@/schemas/booking.schema"
import { createRateLimiter } from "@/lib/rate-limit"
import { londonDate } from "@/lib/time"
import { generateManageToken } from "@/lib/tokens"
import { formatCurrency } from "@/lib/utils"
import { generateICS } from "@/lib/ics"
import { confirmationHtml } from "@/emails/confirmation"
import { resend } from "@/lib/resend"

const limiter = createRateLimiter(5, "1 m")

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon"
  const { success } = await limiter.limit(ip)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await request.json()
  const parsed = CreateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data" }, { status: 400 })
  }

  const { holdToken, serviceSlug, date: dateStr, time } = parsed.data

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
  })
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const hold = await prisma.slotHold.findUnique({
    where: { id: holdToken },
  })

  if (!hold || hold.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Your hold has expired. Please select a new slot." },
      { status: 410 }
    )
  }

  const startsAt = londonDate(dateStr, time)

  if (service.deposit === 0) {
    const existingClient = await prisma.client.findUnique({
      where: { email: parsed.data.email },
    })

    const client = existingClient
      ? await prisma.client.update({
          where: { id: existingClient.id },
          data: {
            name: parsed.data.name,
            phone: parsed.data.phone,
            allergies: parsed.data.allergies || undefined,
            referralSource: parsed.data.referralSource || undefined,
          },
        })
      : await prisma.client.create({
          data: {
            email: parsed.data.email,
            name: parsed.data.name,
            phone: parsed.data.phone,
            allergies: parsed.data.allergies || undefined,
            referralSource: parsed.data.referralSource || undefined,
          },
        })

    const endsAt = new Date(startsAt.getTime() + service.duration * 60000)
    const manageToken = generateManageToken()

    await prisma.appointment.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        startsAt,
        endsAt,
        depositAmount: 0,
        depositStatus: "HELD",
        manageToken,
        policyAgreedAt: new Date(),
      },
    })

    await prisma.slotHold.deleteMany({ where: { startsAt } })

    const icsContent = generateICS({
      startsAt,
      endsAt,
      serviceName: service.name,
      clientName: parsed.data.name,
      clientEmail: parsed.data.email,
      manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${manageToken}`,
    })

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [parsed.data.email],
      subject: `Booking confirmed — ${service.name}`,
      html: confirmationHtml({
        clientName: parsed.data.name,
        service: service.name,
        date: dateStr,
        time,
        deposit: formatCurrency(0),
        manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${manageToken}`,
      }),
      attachments: icsContent
        ? [{ filename: "appointment.ics", content: icsContent }]
        : undefined,
    })
    if (error) {
      console.error("[checkout] Email failed:", error)
    } else {
      console.log(
        "[checkout] Email sent to:",
        parsed.data.email,
        "id:",
        data?.id
      )
    }

    return NextResponse.json({ free: true, manageToken })
  }

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: service.deposit,
      currency: "gbp",
      metadata: {
        holdToken,
        serviceSlug,
        date: dateStr,
        time,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        allergies: parsed.data.allergies ?? "",
        referralSource: parsed.data.referralSource ?? "",
      },
    },
    {
      idempotencyKey: `booking_${holdToken}`,
    }
  )

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
