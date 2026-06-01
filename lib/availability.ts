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

  const [service, availability, existingAppointments] = await Promise.all([
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
  ])

  if (!service || !availability) return []

  const slotDuration = service.duration + BUFFER_MINUTES
  const startMinutes = timeToMinutes(availability.startTime)
  const endMinutes = timeToMinutes(availability.endTime)
  const now = new Date()

  const slots: SlotOption[] = []

  for (
    let mins = startMinutes;
    mins + service.duration <= endMinutes;
    mins += slotDuration
  ) {
    const slotStart = setMinutes(
      setHours(startOfDay(date), Math.floor(mins / 60)),
      mins % 60
    )
    const slotEnd = addMinutes(slotStart, service.duration)

    if (isBefore(slotStart, now)) continue

    const overlaps = existingAppointments.some((apt) =>
      areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: apt.startsAt, end: apt.endsAt }
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
