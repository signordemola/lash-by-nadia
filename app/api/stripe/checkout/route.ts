import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { CreateBookingSchema } from "@/schemas/booking.schema"
import { getAvailableSlots } from "@/lib/availability"

const HOLD_TTL = 120_000

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = CreateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid booking data" }, { status: 400 })
  }

  const { serviceSlug, date: dateStr, time } = parsed.data

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
  })
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const [hours, minutes] = time.split(":").map(Number)
  const startsAt = new Date(dateStr)
  startsAt.setHours(hours, minutes, 0, 0)

  const existingHold = await prisma.slotHold.findFirst({
    where: { startsAt, expiresAt: { gt: new Date() } },
  })

  if (!existingHold) {
    await prisma.slotHold.create({
      data: {
        startsAt,
        endsAt: new Date(startsAt.getTime() + service.duration * 60000),
        expiresAt: new Date(Date.now() + HOLD_TTL),
      },
    })
  }

  const slots = await getAvailableSlots(serviceSlug, new Date(dateStr))
  const slot = slots.find((s) => s.time === time)
  if (!slot) {
    return NextResponse.json(
      { error: "Slot no longer available" },
      { status: 409 }
    )
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: service.deposit,
    currency: "gbp",
    metadata: {
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
