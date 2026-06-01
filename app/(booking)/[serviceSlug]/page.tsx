"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAvailability } from "@/hooks/use-availability"
import { Button } from "@/components/ui/button"
import { useBookingState } from "@/hooks/use-booking-state"
import { services } from "@/lib/studio-data"
import { Calendar } from "@/components/ui/calendar"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"

export default function SlotPickerPage() {
  const params = useParams<{ serviceSlug: string }>()
  const router = useRouter()
  const { setSlot, goToStep } = useBookingState()

  const service = services.find((s) => s.slug === params.serviceSlug)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null

  const { data: slots = [], isLoading } = useAvailability(
    params.serviceSlug,
    dateStr
  )

  if (!service) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StatusBadge variant="accent" className="mb-6">
        Step 1 of 4
      </StatusBadge>

      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
        Pick a date & time.
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        {service.name} · £{service.price} · {service.duration} min
      </p>

      <div className="mb-10">
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Select a date
        </h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={{ before: new Date() }}
          className="mx-auto w-fit rounded-sm border border-border"
        />
      </div>

      {selectedDate && (
        <div>
          <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Available times for {format(selectedDate, "EEEE d MMMM")}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-sm bg-muted"
                />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No available slots for this date.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
              {slots.map((slot) => (
                <Button
                  key={slot.time}
                  variant="outline"
                  onClick={() => {
                    setSlot(dateStr!, slot.time)
                    router.push("/intake")
                  }}
                  className="rounded-sm p-3 font-mono text-xs hover:bg-foreground hover:text-background"
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-12 flex justify-between border-t border-border pt-6">
        <Button
          variant="link"
          onClick={() => goToStep("service")}
          className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
        >
          Change service
        </Button>
      </div>
    </div>
  )
}
