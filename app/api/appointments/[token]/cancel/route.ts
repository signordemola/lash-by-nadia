import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { stripe } from "@/lib/stripe"
import { getCancellationOutcome } from "@/lib/policy"
import { generateICS } from "@/lib/ics"
import { formatCurrency, formatDateISO, formatTimeISO } from "@/lib/utils"
import { cancellationHtml } from "@/emails/cancellation"
import { resend } from "@/lib/resend"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
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

    const icsContent = generateICS({
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      serviceName: appointment.service.name,
      clientName: appointment.client.name,
      clientEmail: appointment.client.email,
      status: "CANCELLED",
    })

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [appointment.client.email],
      subject: `Appointment cancelled — ${appointment.service.name}`,
      html: cancellationHtml({
        clientName: appointment.client.name,
        service: appointment.service.name,
        date: formatDateISO(appointment.startsAt),
        time: formatTimeISO(appointment.startsAt),
        deposit: formatCurrency(appointment.depositAmount),
        outcome,
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
      console.error("[cancel] Email failed:", error)
    } else {
      console.log(
        "[cancel] Email sent to:",
        appointment.client.email,
        "id:",
        data?.id
      )
    }

    return NextResponse.json({
      outcome,
      amount: appointment.depositAmount,
    })
  } catch (err) {
    console.error("[cancel] Unhandled error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
