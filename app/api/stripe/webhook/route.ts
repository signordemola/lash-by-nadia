import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import Stripe from "stripe"
import { Prisma } from "@/generated/prisma/client"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/db"
import { generateManageToken } from "@/lib/tokens"
import { formatCurrency } from "@/lib/utils"
import { generateICS } from "@/lib/ics"
import { londonDate } from "@/lib/time"
import { confirmationHtml } from "@/emails/confirmation"
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

  const startsAt = londonDate(metadata.date, metadata.time)
  const endsAt = new Date(startsAt.getTime() + service.duration * 60000)

  const idempotencyKey = createHash("sha256")
    .update(`${startsAt.toISOString()}-${metadata.email}`)
    .digest("hex")

  const existing = await prisma.appointment.findUnique({
    where: { idempotencyKey },
  })
  if (existing) {
    return NextResponse.json({ received: true })
  }

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
        idempotencyKey,
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

  const icsContent = generateICS({
    startsAt,
    endsAt,
    serviceName: service.name,
    clientName: metadata.name,
    clientEmail: metadata.email,
    manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${manageToken}`,
  })

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [metadata.email],
    subject: `Booking confirmed — ${service.name}`,
    html: confirmationHtml({
      clientName: metadata.name,
      service: service.name,
      date: metadata.date,
      time: metadata.time,
      deposit: formatCurrency(service.deposit),
      manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${manageToken}`,
    }),
    attachments: icsContent
      ? [
          {
            filename: "appointment.ics",
            content: icsContent,
          },
        ]
      : undefined,
  })

  return NextResponse.json({ received: true })
}
