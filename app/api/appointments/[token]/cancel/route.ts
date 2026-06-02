import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { getCancellationOutcome } from "@/lib/policy"
import { resend } from "@/lib/resend"

const outcomeLabels: Record<string, string> = {
  refund: "fully refunded to your card",
  credit: "held as credit toward your next visit",
  forfeit: "forfeited",
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
    include: { service: true, client: true },
  })

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (appointment.status === "CANCELLED") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 409 })
  }

  const outcome = getCancellationOutcome(appointment.startsAt)

  if (outcome === "refund" && appointment.stripePaymentIntentId) {
    await stripe.refunds.create({
      payment_intent: appointment.stripePaymentIntentId,
    })
  }

  const depositStatus =
    outcome === "refund"
      ? "REFUNDED"
      : outcome === "credit"
        ? "CREDITED"
        : "FORFEITED"

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: "CANCELLED",
      depositStatus,
      cancelledAt: new Date(),
    },
  })

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [appointment.client.email],
    subject: `Appointment cancelled — ${appointment.service.name}`,
    text: `Hi ${appointment.client.name},\n\nYour ${appointment.service.name} appointment has been cancelled.\n\nYour deposit has been ${outcomeLabels[outcome]}.\n\nBook again: ${process.env.NEXT_PUBLIC_BASE_URL}`,
  })

  return NextResponse.json({
    outcome,
    amount: appointment.depositAmount,
  })
}
