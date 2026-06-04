"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useAvailability, useAvailableDates } from "@/hooks/use-availability"
import { Button } from "@/components/ui/button"
import { useBookingState } from "@/hooks/use-booking-state"
import { services } from "@/lib/studio-data"
import { Calendar } from "@/components/ui/calendar"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"

export function SlotPickerStep() {
  const params = useParams<{ serviceSlug: string }>()
  const queryClient = useQueryClient()
  const { setSlot, setHold } = useBookingState()
  const [holdError, setHoldError] = useState<string | null>(null)
  const [holdingTime, setHoldingTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  )

  const {
    data: availableDateStrings = [],
    isLoading: datesLoading,
    isFetching: datesFetching,
  } = useAvailableDates(params.serviceSlug, currentMonth)

  const availableDates = availableDateStrings.map(
    (d) => new Date(d + "T00:00:00")
  )

  const service = services.find((s) => s.slug === params.serviceSlug)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null

  const {
    data: slots = [],
    isLoading,
    isFetching,
  } = useAvailability(params.serviceSlug, dateStr)

  async function handleSlotClick(slot: { time: string }) {
    setHoldingTime(slot.time)
    setHoldError(null)

    const res = await fetch("/api/slots/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceSlug: params.serviceSlug,
        date: dateStr,
        time: slot.time,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setHoldError(data.error ?? "This slot was just taken. Pick another.")
      setHoldingTime(null)
      queryClient.invalidateQueries({
        queryKey: ["availability", params.serviceSlug, dateStr],
      })
      return
    }

    const { holdToken: token, expiresAt } = await res.json()
    setHold(token, expiresAt)
    setSlot(dateStr!, slot.time)
  }

  if (!service) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <StatusBadge variant="accent" className="mb-6">
        Step 1 of 4
      </StatusBadge>

      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
        Pick a date & time.
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        {service.name} · £{service.price} · {service.duration} min
      </p>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <div className="shrink-0">
          <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Select a date
          </h2>
          {datesLoading ? (
            <div className="h-[280px] w-[280px] animate-pulse rounded-sm border border-border bg-muted" />
          ) : (
            <div
              className={
                datesFetching && !datesLoading
                  ? "opacity-60 transition-opacity"
                  : ""
              }
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onMonthChange={(month: Date) => {
                  setCurrentMonth(format(month, "yyyy-MM"))
                  setSelectedDate(undefined)
                }}
                disabled={[
                  { before: new Date() },
                  (date: Date) =>
                    !availableDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    ),
                ]}
                className="w-fit rounded-sm border border-border"
              />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Available times
          </h2>

          {!selectedDate ? (
            <div className="flex h-full min-h-[200px] items-center justify-center rounded-sm border border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Select a date to see available times.
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-sm bg-muted"
                />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-sm border border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                No available slots for this date.
              </p>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-3 gap-2 md:grid-cols-4"
                role="listbox"
                aria-label="Available time slots"
              >
                {slots.map((slot) => (
                  <Button
                    key={slot.time}
                    role="option"
                    aria-label={`Select ${slot.time} time slot`}
                    variant="outline"
                    onClick={() => handleSlotClick(slot)}
                    disabled={!!holdingTime}
                    className="relative rounded-sm p-3 font-mono text-xs hover:bg-foreground hover:text-background"
                  >
                    {holdingTime === slot.time ? (
                      <span className="flex items-center gap-1.5">
                        <svg
                          className="h-3 w-3 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        {slot.time}
                      </span>
                    ) : (
                      slot.time
                    )}
                  </Button>
                ))}
              </div>
              {holdingTime && (
                <p className="mt-3 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
                  Securing your slot…
                </p>
              )}
              {isFetching && !isLoading && !holdingTime && (
                <p className="mt-3 text-[10px] text-muted-foreground">
                  Refreshing...
                </p>
              )}
            </>
          )}

          {holdError && (
            <p
              className="mt-4 rounded-sm bg-destructive/10 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase"
              role="alert"
              aria-live="assertive"
            >
              {holdError}
            </p>
          )}
        </div>
      </div>

      <div className="mt-12 flex justify-between border-t border-border pt-6">
        <Button
          variant="link"
          onClick={() => (window.location.href = "/")}
          className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
        >
          Change service
        </Button>
      </div>
    </div>
  )
}
