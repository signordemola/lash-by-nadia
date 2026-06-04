"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { StatusBadge } from "@/components/shared/status-badge"
import { useAvailability, useAvailableDates } from "@/hooks/use-availability"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

type AppointmentInfo = {
  service: { slug: string; name: string }
  startsAt: string
}

export default function ReschedulePage() {
  const { token } = useParams<{ token: string }>()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(
    format(new Date(), "yyyy-MM")
  )
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null

  const { data: appointment, isError: appointmentError } = useQuery({
    queryKey: ["appointment", token],
    queryFn: async () => {
      const r = await fetch(`/api/appointments/${token}`)
      if (!r.ok) throw new Error("Failed to load")
      return r.json() as Promise<AppointmentInfo>
    },
  })

  const { data: slots = [], isLoading } = useAvailability(
    appointment?.service.slug ?? "",
    dateStr
  )

  const { data: availableDateStrings = [], isLoading: datesLoading } =
    useAvailableDates(appointment?.service.slug ?? "", currentMonth)

  const availableDates = availableDateStrings.map(
    (d) => new Date(d + "T00:00:00")
  )

  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    newDate: string
    newTime: string
  } | null>(null)

  if (appointmentError) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm text-muted-foreground">
          Failed to load appointment details.
        </p>
      </div>
    )
  }

  async function handleSlotSelect(time: string) {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/appointments/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, time }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to reschedule.")
        return
      }

      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <StatusBadge variant="accent" className="mb-6">
          Rescheduled
        </StatusBadge>
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          See you then.
        </h1>
        <p className="mb-2 text-sm text-muted-foreground">
          Your appointment has been moved.
        </p>
        <p className="mb-8 text-lg font-bold tracking-tight">
          {result.newDate} at {result.newTime}
        </p>
        <Link href={`/appointment/${token}`}>
          <Button>View appointment</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StatusBadge variant="accent" className="mb-6">
        Reschedule
      </StatusBadge>

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Pick a new date & time.
      </h1>

      {appointment && (
        <p className="mb-10 text-sm text-muted-foreground">
          {appointment.service.name} · currently{" "}
          {format(new Date(appointment.startsAt), "EEEE d MMMM")}
        </p>
      )}

      <div className="mb-10">
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Select a date
        </h2>
        {datesLoading ? (
          <div className="h-[280px] w-[280px] animate-pulse rounded-sm border border-border bg-muted" />
        ) : (
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
            className="mx-auto w-fit rounded-sm border border-border"
          />
        )}
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
                  onClick={() => handleSlotSelect(slot.time)}
                  disabled={submitting}
                  className="rounded-sm p-3 font-mono text-xs hover:bg-foreground hover:text-background"
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-sm bg-destructive/10 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase">
          {error}
        </p>
      )}

      <div className="mt-12 border-t border-border pt-6">
        <Link href={`/appointment/${token}`}>
          <Button
            variant="link"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
          >
            Keep current time
          </Button>
        </Link>
      </div>
    </div>
  )
}
