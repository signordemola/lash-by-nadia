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

export function useAvailability(serviceSlug: string, date: string | null) {
  return useQuery({
    queryKey: ["availability", serviceSlug, date],
    queryFn: () => fetchAvailability(serviceSlug, date!),
    enabled: !!serviceSlug && !!date,
  })
}
