import { NextRequest, NextResponse } from "next/server"
import { areIntervalsOverlapping } from "date-fns"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/db"
import { londonDate, londonDateOnly } from "@/lib/time"
import { nanoid } from "nanoid"
import { createRateLimiter } from "@/lib/rate-limit"

const limiter = createRateLimiter(10, "1 m")
const HOLD_TTL = 420_000
const MINIMUM_BOOKING_NOTICE = 120

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon"
  const { success } = await limiter.limit(ip)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

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

  const startsAt = londonDate(dateStr, time)
  const endsAt = new Date(startsAt.getTime() + service.duration * 60000)

  const minBookable = new Date(Date.now() + MINIMUM_BOOKING_NOTICE * 60000)
  if (startsAt < minBookable) {
    return NextResponse.json(
      { error: "Bookings must be at least 2 hours in advance" },
      { status: 409 }
    )
  }

  const dayStart = londonDateOnly(dateStr)
  const dayEnd = new Date(dayStart.getTime() + 86400000)

  const [existingHolds, conflictingAppointments] = await Promise.all([
    prisma.slotHold.findMany({
      where: {
        startsAt: { gte: dayStart, lt: dayEnd },
        expiresAt: { gt: new Date() },
      },
      select: { startsAt: true, endsAt: true },
    }),
    prisma.appointment.findMany({
      where: {
        startsAt: { gte: dayStart, lt: dayEnd },
        status: "CONFIRMED",
      },
      select: { startsAt: true, endsAt: true },
    }),
  ])

  const holdOverlaps = existingHolds.some((h) =>
    areIntervalsOverlapping(
      { start: startsAt, end: endsAt },
      { start: h.startsAt, end: h.endsAt }
    )
  )
  if (holdOverlaps) {
    return NextResponse.json({ error: "Slot is already held" }, { status: 409 })
  }

  const appointmentOverlaps = conflictingAppointments.some((a) =>
    areIntervalsOverlapping(
      { start: startsAt, end: endsAt },
      { start: a.startsAt, end: a.endsAt }
    )
  )
  if (appointmentOverlaps) {
    return NextResponse.json(
      { error: "Slot no longer available" },
      { status: 409 }
    )
  }

  const holdToken = nanoid(21)

  await prisma.slotHold.deleteMany({
    where: { startsAt, expiresAt: { lte: new Date() } },
  })

  try {
    await prisma.slotHold.create({
      data: {
        startsAt,
        endsAt,
        expiresAt: new Date(Date.now() + HOLD_TTL),
        id: holdToken,
      },
    })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slot is already held" },
        { status: 409 }
      )
    }
    throw e
  }

  return NextResponse.json({ holdToken, expiresAt: Date.now() + HOLD_TTL })
}
