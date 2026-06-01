import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

const HOLD_TTL = 120_000

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { serviceSlug, date: dateStr, time } = body

  if (!serviceSlug || !dateStr || !time) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const service = await prisma.service.findUnique({
    where: { slug: serviceSlug },
  })
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const [hours, minutes] = time.split(":").map(Number)
  const startsAt = new Date(dateStr)
  startsAt.setHours(hours, minutes, 0, 0)
  const endsAt = new Date(startsAt.getTime() + service.duration * 60000)

  if (startsAt < new Date()) {
    return NextResponse.json({ error: "Slot is in the past" }, { status: 409 })
  }

  const existing = await prisma.slotHold.findFirst({
    where: { startsAt, expiresAt: { gt: new Date() } },
  })
  if (existing) {
    return NextResponse.json({ error: "Slot is already held" }, { status: 409 })
  }

  const conflicting = await prisma.appointment.findFirst({
    where: { startsAt, status: "CONFIRMED" },
  })
  if (conflicting) {
    return NextResponse.json(
      { error: "Slot no longer available" },
      { status: 409 }
    )
  }

  const holdToken = nanoid(21)

  await prisma.slotHold.create({
    data: {
      startsAt,
      endsAt,
      expiresAt: new Date(Date.now() + HOLD_TTL),
      id: holdToken,
    },
  })

  return NextResponse.json({ holdToken, expiresAt: Date.now() + HOLD_TTL })
}
