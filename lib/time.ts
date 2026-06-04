import { fromZonedTime } from "date-fns-tz"

const TZ = "Europe/London"

export function londonDate(dateStr: string, time: string): Date {
  return fromZonedTime(`${dateStr}T${time}:00`, TZ)
}

export function londonDateOnly(dateStr: string): Date {
  return fromZonedTime(`${dateStr}T00:00:00`, TZ)
}

export { TZ }
