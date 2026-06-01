import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isSameDay } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(pence: number): string {
  const pounds = (pence / 100).toFixed(2)
  return `£${pounds}`
}

export function formatDate(date: Date): string {
  return format(date, "EEEE d MMMM yyyy")
}

export function formatDateShort(date: Date): string {
  return format(date, "d MMM yyyy")
}

export function formatTime(date: Date): string {
  return format(date, "HH:mm")
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return isSameDay(a, b)
}
