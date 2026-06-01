import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isRescheduleAllowed } from "@/lib/policy"
import { getAvailableSlots } from "@/lib/availability"
import { formatDate, formatTime } from "@/lib/utils"
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

  const date = new Date(dateStr)
  const slots = await getAvailableSlots(appointment.service.slug, date)
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

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: [appointment.client.email],
    subject: `Appointment rescheduled — ${appointment.service.name}`,
    text: `Hi ${appointment.client.name},\n\nYour ${appointment.service.name} appointment has been rescheduled.\n\nNew date: ${formatDate(slot.startsAt)}\nNew time: ${formatTime(slot.startsAt)}\n\nManage: ${process.env.NEXT_PUBLIC_BASE_URL}/appointment/${token}`,
  })

  return NextResponse.json({
    newDate: formatDate(slot.startsAt),
    newTime: slot.time,
  })
}
