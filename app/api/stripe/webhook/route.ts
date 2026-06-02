import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Prisma } from "@/generated/prisma/client"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { generateManageToken } from "@/lib/tokens"
import { formatCurrency } from "@/lib/utils"
import { resend } from "@/lib/resend"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type !== "payment_intent.succeeded") {
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const metadata = paymentIntent.metadata

  const service = await prisma.service.findUnique({
    where: { slug: metadata.serviceSlug },
  })
  if (!service) {
    return NextResponse.json({ received: true })
  }

  const existingClient = await prisma.client.findUnique({
    where: { email: metadata.email },
  })

  const client = existingClient
    ? await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          name: metadata.name,
          phone: metadata.phone,
          allergies: metadata.allergies || undefined,
          referralSource: metadata.referralSource || undefined,
        },
      })
    : await prisma.client.create({
        data: {
          email: metadata.email,
          name: metadata.name,
          phone: metadata.phone,
          allergies: metadata.allergies || undefined,
          referralSource: metadata.referralSource || undefined,
        },
      })

  const [hours, minutes] = metadata.time.split(":").map(Number)
  const startsAt = new Date(metadata.date)
  startsAt.setHours(hours, minutes, 0, 0)
  const endsAt = new Date(startsAt.getTime() + service.duration * 60000)

  const manageToken = generateManageToken()

  try {
    await prisma.appointment.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        startsAt,
        endsAt,
        depositAmount: service.deposit,
        depositStatus: "HELD",
        stripePaymentIntentId: paymentIntent.id,
        manageToken,
        policyAgreedAt: new Date(),
      },
    })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json({ received: true })
    }
    throw e
  }

  await prisma.slotHold.deleteMany({ where: { startsAt } })

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [metadata.email],
    subject: `Booking confirmed — ${service.name}`,
    text: `Hi ${metadata.name},\n\nYour ${service.name} appointment is confirmed for ${metadata.date} at ${metadata.time}.\n\nManage your booking: ${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${manageToken}\n\nDeposit paid: ${formatCurrency(service.deposit)}`,
  })

  return NextResponse.json({ received: true })
}
