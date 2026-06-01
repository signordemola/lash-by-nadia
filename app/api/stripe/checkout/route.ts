import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { CreateBookingSchema } from "@/schemas/booking.schema"
import { getAvailableSlots } from "@/lib/availability"

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

  const date = new Date(dateStr)
  const slots = await getAvailableSlots(serviceSlug, date)
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
