import {
  addMinutes,
  areIntervalsOverlapping,
  getDay,
  isBefore,
  startOfDay,
  startOfMonth,
  endOfMonth,
} from "date-fns"
import { prisma } from "@/lib/db"
import { londonDateOnly } from "@/lib/time"
import type { SlotOption } from "@/types/booking"

const BUFFER_MINUTES = 15
const MINIMUM_BOOKING_NOTICE = 120

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

interface Interval {
  start: Date
  end: Date
}

interface WeeklyAvail {
  dayOfWeek: number
  startTime: string
  endTime: string
}

function hasAvailableSlot(
  dateStr: string,
  serviceDuration: number,
  availability: WeeklyAvail,
  appointments: Interval[],
  holds: Interval[]
): boolean {
  const startMinutes = timeToMinutes(availability.startTime)
  const endMinutes = timeToMinutes(availability.endTime)
  const now = new Date()
  const minBookable = addMinutes(now, MINIMUM_BOOKING_NOTICE)
  const base = londonDateOnly(dateStr)

  const blocked = [
    ...appointments.map((a) => ({
      start: new Date(a.start.getTime() - BUFFER_MINUTES * 60000),
      end: new Date(a.end.getTime() + BUFFER_MINUTES * 60000),
    })),
    ...holds.map((h) => ({
      start: new Date(h.start.getTime() - BUFFER_MINUTES * 60000),
      end: new Date(h.end.getTime() + BUFFER_MINUTES * 60000),
    })),
  ]

  for (
    let mins = startMinutes;
    mins + serviceDuration <= endMinutes;
    mins += BUFFER_MINUTES
  ) {
    const slotStart = addMinutes(base, mins)
    const slotEnd = addMinutes(slotStart, serviceDuration)

    if (isBefore(slotStart, minBookable)) continue

    const overlaps = blocked.some((i) =>
      areIntervalsOverlapping(
        { start: slotStart, end: slotEnd },
        { start: i.start, end: i.end }
      )
    )
    if (!overlaps) return true
  }

  return false
}

export async function getAvailableDates(
  serviceSlug: string,
  month: Date
): Promise<string[]> {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const monthEndExclusive = new Date(monthEnd.getTime() + 86400000)

  const [service, availabilities, appointments, holds, blockedDates] =
    await Promise.all([
      prisma.service.findUnique({ where: { slug: serviceSlug } }),
      prisma.weeklyAvailability.findMany({ where: { isActive: true } }),
      prisma.appointment.findMany({
        where: {
          startsAt: { gte: monthStart, lt: monthEndExclusive },
          status: "CONFIRMED",
        },
        select: { startsAt: true, endsAt: true },
      }),
      prisma.slotHold.findMany({
        where: {
          startsAt: { gte: monthStart, lt: monthEndExclusive },
          expiresAt: { gt: new Date() },
        },
        select: { startsAt: true, endsAt: true },
      }),
      prisma.blockedDate.findMany({
        where: { date: { gte: monthStart, lte: monthEnd } },
        select: { date: true },
      }),
    ])

  if (!service) return []

  const blockedSet = new Set(
    blockedDates.map((b: { date: Date }) => {
      const d = new Date(b.date)
      return formatDateKey(d)
    })
  )

  const apptsByDate = new Map<string, Interval[]>()
  const holdsByDate = new Map<string, Interval[]>()

  for (const a of appointments) {
    const key = formatDateKey(a.startsAt)
    if (!apptsByDate.has(key)) apptsByDate.set(key, [])
    apptsByDate.get(key)!.push({ start: a.startsAt, end: a.endsAt })
  }
  for (const h of holds) {
    const key = formatDateKey(h.startsAt)
    if (!holdsByDate.has(key)) holdsByDate.set(key, [])
    holdsByDate.get(key)!.push({ start: h.startsAt, end: h.endsAt })
  }

  const now = new Date()
  const result: string[] = []
  let d = monthStart

  while (d <= monthEnd) {
    const key = formatDateKey(d)
    const dayOfWeek = getDay(d)
    const avail = availabilities.find((a) => a.dayOfWeek === dayOfWeek)

    if (
      d >= startOfDay(now) &&
      avail &&
      !blockedSet.has(key) &&
      hasAvailableSlot(
        key,
        service.duration,
        avail,
        apptsByDate.get(key) ?? [],
        holdsByDate.get(key) ?? []
      )
    ) {
      result.push(key)
    }

    d = new Date(d.getTime() + 86400000)
  }

  return result
}

export async function getAvailableSlots(
  serviceSlug: string,
  dateStr: string
): Promise<SlotOption[]> {
  const date = londonDateOnly(dateStr)
  const [y, mo, dy] = dateStr.split("-").map(Number)
  const dayOfWeek = new Date(y, mo - 1, dy).getDay()
  const dayEnd = new Date(date.getTime() + 86400000)

  const [service, availability, existingAppointments, heldSlots] =
    await Promise.all([
      prisma.service.findUnique({ where: { slug: serviceSlug } }),
      prisma.weeklyAvailability.findFirst({
        where: { dayOfWeek, isActive: true },
      }),
      prisma.appointment.findMany({
        where: {
          startsAt: { gte: date, lt: dayEnd },
          status: "CONFIRMED",
        },
      }),
      prisma.slotHold.findMany({
        where: {
          startsAt: { gte: date, lt: dayEnd },
          expiresAt: { gt: new Date() },
        },
      }),
    ])

  if (!service || !availability) return []

  const startMinutes = timeToMinutes(availability.startTime)
  const endMinutes = timeToMinutes(availability.endTime)
  const now = new Date()
  const minBookable = addMinutes(now, MINIMUM_BOOKING_NOTICE)
  const base = londonDateOnly(dateStr)

  const blockedIntervals: Interval[] = [
    ...existingAppointments.map((a: { startsAt: Date; endsAt: Date }) => ({
      start: new Date(a.startsAt.getTime() - BUFFER_MINUTES * 60000),
      end: new Date(a.endsAt.getTime() + BUFFER_MINUTES * 60000),
    })),
    ...heldSlots.map((h: { startsAt: Date; endsAt: Date }) => ({
      start: new Date(h.startsAt.getTime() - BUFFER_MINUTES * 60000),
      end: new Date(h.endsAt.getTime() + BUFFER_MINUTES * 60000),
    })),
  ]

  const slots: SlotOption[] = []

  for (
    let mins = startMinutes;
    mins + service.duration <= endMinutes;
    mins += BUFFER_MINUTES
  ) {
    const slotStart = addMinutes(base, mins)
    const slotEnd = addMinutes(slotStart, service.duration)

    if (isBefore(slotStart, minBookable)) continue

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
