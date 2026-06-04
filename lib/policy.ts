import { differenceInHours } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import type { CancellationOutcome } from "@/types/booking"

const TZ = "Europe/London"

export function getCancellationOutcome(
  appointmentStartsAt: Date
): CancellationOutcome {
  const hoursUntil = differenceInHours(appointmentStartsAt, new Date())

  if (hoursUntil >= 48) return "refund"
  if (hoursUntil >= 24) return "credit"
  return "forfeit"
}

export function isRescheduleAllowed(appointmentStartsAt: Date): boolean {
  const hoursUntil = differenceInHours(appointmentStartsAt, new Date())
  return hoursUntil >= 48
}

export function canMarkNoShow(appointmentStartsAt: Date): boolean {
  const now = new Date()
  const nowDateStr = formatInTimeZone(now, TZ, "yyyy-MM-dd")
  const aptDateStr = formatInTimeZone(appointmentStartsAt, TZ, "yyyy-MM-dd")
  return now > appointmentStartsAt && nowDateStr === aptDateStr
}
