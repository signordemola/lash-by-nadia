import { useQuery } from "@tanstack/react-query"
import type { SlotOption } from "@/types/booking"

async function fetchAvailability(
  serviceSlug: string,
  date: string
): Promise<SlotOption[]> {
  const params = new URLSearchParams({ serviceSlug, date })
  const res = await fetch(`/api/availability?${params}`)
  if (!res.ok) return []
  return res.json()
}

async function fetchAvailableDates(
  serviceSlug: string,
  month: string
): Promise<string[]> {
  const params = new URLSearchParams({ serviceSlug, month })
  const res = await fetch(`/api/availability/dates?${params}`)
  if (!res.ok) return []
  return res.json()
}

export function useAvailability(serviceSlug: string, date: string | null) {
  return useQuery({
    queryKey: ["availability", serviceSlug, date],
    queryFn: () => fetchAvailability(serviceSlug, date!),
    enabled: !!serviceSlug && !!date,
  })
}

export function useAvailableDates(serviceSlug: string, month: string) {
  return useQuery({
    queryKey: ["availability-dates", serviceSlug, month],
    queryFn: () => fetchAvailableDates(serviceSlug, month),
    enabled: !!serviceSlug && !!month,
    staleTime: 60_000,
  })
}
