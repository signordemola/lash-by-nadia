import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isSameDay } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"

const TZ = "Europe/London"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(pence: number): string {
  const pounds = (pence / 100).toFixed(2)
  return `£${pounds}`
}

export function formatDate(date: Date): string {
  return formatInTimeZone(date, TZ, "EEEE d MMMM yyyy")
}

export function formatDateShort(date: Date): string {
  return formatInTimeZone(date, TZ, "d MMM yyyy")
}

export function formatTime(date: Date): string {
  return formatInTimeZone(date, TZ, "HH:mm")
}

export function formatDateISO(date: Date): string {
  return formatInTimeZone(date, TZ, "yyyy-MM-dd")
}

export function formatTimeISO(date: Date): string {
  return formatInTimeZone(date, TZ, "HH:mm")
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}
