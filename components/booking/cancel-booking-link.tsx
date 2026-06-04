"use client"

import { useRouter } from "next/navigation"
import { useBookingState } from "@/hooks/use-booking-state"
import { useQueryClient } from "@tanstack/react-query"

export function CancelBookingLink() {
  const { holdToken, serviceSlug, date, reset, releaseHold } = useBookingState()
  const router = useRouter()
  const queryClient = useQueryClient()

  function handleCancel() {
    if (holdToken) {
      releaseHold()
      queryClient.invalidateQueries({
        queryKey: ["availability", serviceSlug, date],
      })
    }
    reset()
    router.push("/")
  }

  return (
    <button
      onClick={handleCancel}
      className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
    >
      Cancel
    </button>
  )
}
