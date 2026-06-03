import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isRescheduleAllowed } from "@/lib/policy"
import { getAvailableSlots } from "@/lib/availability"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { generateICS } from "@/lib/ics"
import { confirmationHtml } from "@/emails/confirmation"
import { resend } from "@/lib/resend"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const body = await request.json()
  const { date: dateStr, time } = body

  if (!dateStr || !time) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const appointment = await prisma.appointment.findUnique({
    where: { manageToken: token },
    include: { service: true, client: true },
  })

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!isRescheduleAllowed(appointment.startsAt)) {
    return NextResponse.json(
      { error: "Rescheduling only available 48+ hours before" },
      { status: 403 }
    )
  }

  const slots = await getAvailableSlots(appointment.service.slug, dateStr)
  const slot = slots.find((s) => s.time === time)

  if (!slot) {
    return NextResponse.json(
      { error: "Slot no longer available" },
      { status: 409 }
    )
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
    },
  })

  const icsContent = generateICS({
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    serviceName: appointment.service.name,
    clientName: appointment.client.name,
    clientEmail: appointment.client.email,
    manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${token}`,
  })

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [appointment.client.email],
    subject: `Appointment rescheduled — ${appointment.service.name}`,
    html: confirmationHtml({
      clientName: appointment.client.name,
      service: appointment.service.name,
      date: formatDate(slot.startsAt),
      time: formatTime(slot.startsAt),
      deposit: formatCurrency(appointment.depositAmount),
      manageUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${token}`,
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

  return NextResponse.json({
    newDate: formatDate(slot.startsAt),
    newTime: slot.time,
  })
}
