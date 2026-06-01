import { differenceInHours } from "date-fns"
import type { CancellationOutcome } from "@/types/booking"

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
  return (
    now > appointmentStartsAt &&
    now.toDateString() === appointmentStartsAt.toDateString()
  )
}
