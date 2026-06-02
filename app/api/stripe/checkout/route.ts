import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { CreateBookingSchema } from "@/schemas/booking.schema"
import { createRateLimiter } from "@/lib/rate-limit"

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

  const paymentIntent = await stripe.paymentIntents.create({
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
  })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
