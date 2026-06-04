import { NextRequest, NextResponse } from "next/server"
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
  console.log("[webhook] POST received")
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    console.error("[webhook] Missing stripe-signature header")
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log("[webhook] Signature verified, event:", event.type)
  } catch (err) {
    console.error(
      "[webhook] Signature verification failed:",
      (err as Error).message
    )
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type !== "payment_intent.succeeded") {
    console.log("[webhook] Skipping non-payment event:", event.type)
    return NextResponse.json({ received: true })
  }

  const paymentIntent = event.data.object as Stripe.PaymentIntent
  const metadata = paymentIntent.metadata
  console.log("[webhook] PaymentIntent metadata:", JSON.stringify(metadata))

  const service = await prisma.service.findUnique({
    where: { slug: metadata.serviceSlug },
  })
  if (!service) {
    console.error("[webhook] Service not found:", metadata.serviceSlug)
    return NextResponse.json({ received: true })
  }
  console.log("[webhook] Service found:", service.name)

  const existingClient = await prisma.client.findUnique({
    where: { email: metadata.email },
  })

  const client = existingClient
    ? (console.log("[webhook] Client found:", existingClient.id),
      await prisma.client.update({
        where: { id: existingClient.id },
        data: {
          name: metadata.name,
          phone: metadata.phone,
          allergies: metadata.allergies || undefined,
          referralSource: metadata.referralSource || undefined,
        },
      }))
    : (console.log("[webhook] Creating new client:", metadata.email),
      await prisma.client.create({
        data: {
          email: metadata.email,
          name: metadata.name,
          phone: metadata.phone,
          allergies: metadata.allergies || undefined,
          referralSource: metadata.referralSource || undefined,
        },
      }))

  const startsAt = londonDate(metadata.date, metadata.time)
  const endsAt = new Date(startsAt.getTime() + service.duration * 60000)
  console.log(
    "[webhook] Date range:",
    startsAt.toISOString(),
    "–",
    endsAt.toISOString()
  )

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
    console.log("[webhook] Appointment created:", manageToken)
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      console.log("[webhook] P2002 — duplicate PaymentIntent, skipping")
      return NextResponse.json({ received: true })
    }
    console.error("[webhook] Appointment create failed:", e)
    throw e
  }

  await prisma.slotHold.deleteMany({ where: { startsAt } })
  console.log("[webhook] Slot holds cleaned up")

  const icsContent = generateICS({
    startsAt,
    endsAt,
    serviceName: service.name,
    clientName: metadata.name,
    clientEmail: metadata.email,
    manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${manageToken}`,
  })

  const { data, error } = await resend.emails.send({
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
  if (error) {
    console.error("[webhook] Email failed:", error)
  } else {
    console.log("[webhook] Email sent to:", metadata.email, "id:", data?.id)
  }

  return NextResponse.json({ received: true })
}
