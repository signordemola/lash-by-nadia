import {
  addMinutes,
  areIntervalsOverlapping,
  getDay,
  isBefore,
  startOfDay,
  setHours,
  setMinutes,
} from "date-fns"
import { prisma } from "@/lib/db"
import type { SlotOption } from "@/types/booking"

const BUFFER_MINUTES = 15

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export async function isDateAvailable(date: Date): Promise<boolean> {
  const dayOfWeek = getDay(date)

  const availability = await prisma.weeklyAvailability.findFirst({
    where: { dayOfWeek, isActive: true },
  })
  if (!availability) return false

  const blocked = await prisma.blockedDate.findFirst({
    where: { date: startOfDay(date) },
  })
  if (blocked) return false

  return true
}

export async function getAvailableSlots(
  serviceSlug: string,
  date: Date
): Promise<SlotOption[]> {
  const dayOfWeek = getDay(date)

  const [service, availability, existingAppointments, heldSlots] =
    await Promise.all([
      prisma.service.findUnique({ where: { slug: serviceSlug } }),
      prisma.weeklyAvailability.findFirst({
        where: { dayOfWeek, isActive: true },
      }),
      prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: startOfDay(date),
            lt: startOfDay(new Date(date.getTime() + 86400000)),
          },
          status: "CONFIRMED",
        },
      }),
      prisma.slotHold.findMany({
        where: {
          startsAt: {
            gte: startOfDay(date),
            lt: startOfDay(new Date(date.getTime() + 86400000)),
          },
          expiresAt: { gt: new Date() },
        },
      }),
    ])

  if (!service || !availability) return []

  const startMinutes = timeToMinutes(availability.startTime)
  const endMinutes = timeToMinutes(availability.endTime)
  const now = new Date()

  const blockedIntervals: { start: Date; end: Date }[] = [
    ...existingAppointments.map((a: { startsAt: Date; endsAt: Date }) => ({
      start: a.startsAt,
      end: a.endsAt,
    })),
    ...heldSlots.map((h: { startsAt: Date; endsAt: Date }) => ({
      start: h.startsAt,
      end: h.endsAt,
    })),
  ]

  const slots: SlotOption[] = []

  for (
    let mins = startMinutes;
    mins + service.duration <= endMinutes;
    mins += BUFFER_MINUTES
  ) {
    const slotStart = setMinutes(
      setHours(startOfDay(date), Math.floor(mins / 60)),
      mins % 60
    )
    const slotEnd = addMinutes(slotStart, service.duration)

    if (isBefore(slotStart, now)) continue

    const overlaps = blockedIntervals.some((interval) =>
      areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: interval.start, end: interval.end }
      )
    )
    if (overlaps) continue

    slots.push({
      startsAt: slotStart,
      endsAt: slotEnd,
      time: `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`,
    })
  }

  return slots
}
