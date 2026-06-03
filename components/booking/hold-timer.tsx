"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingState } from "@/hooks/use-booking-state"
import { cn } from "@/lib/utils"

export function HoldTimer() {
  const { holdToken, holdExpiresAt, serviceSlug, reset } = useBookingState()
  const router = useRouter()
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (!holdExpiresAt || !holdToken) return
    const tick = () => {
      const r = Math.max(0, Math.ceil((holdExpiresAt - Date.now()) / 1000))
      setRemaining(r)
      if (r === 0) {
        clearInterval(id)
        router.push(`/${serviceSlug}?expired=1`)
        reset()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [holdExpiresAt, holdToken, serviceSlug, router, reset])

  if (!holdToken || !holdExpiresAt) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const warn = remaining <= 120
  const critical = remaining <= 30

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Slot held, ${mins} minutes ${secs} seconds remaining`}
      className={cn(
        "border-b border-border px-6 py-2 text-center font-mono text-[10px] tracking-[0.15em] uppercase",
        critical && "animate-pulse bg-destructive/15 text-destructive",
        warn && !critical && "bg-amber-500/10 text-amber-600",
        !warn && "bg-muted/30 text-muted-foreground"
      )}
    >
      Slot held · {String(mins).padStart(2, "0")}:
      {String(secs).padStart(2, "0")}
    </div>
  )
}
