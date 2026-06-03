"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useBookingState } from "@/hooks/use-booking-state"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { services } from "@/lib/studio-data"

export function ConfirmationStep({
  showFallback = false,
}: {
  showFallback?: boolean
}) {
  const searchParams = useSearchParams()
  const { serviceSlug, date, time, clientInfo, reset } = useBookingState()

  const service = services.find((s) => s.slug === serviceSlug)
  const paymentIntent = searchParams.get("payment_intent")

  if (
    showFallback &&
    !paymentIntent &&
    (!serviceSlug || !date || !time || !clientInfo || !service)
  ) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <StatusBadge variant="accent" className="mb-6">
          Booking received
        </StatusBadge>
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Thank you.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Your booking is being processed. You&apos;ll receive a confirmation
          email shortly.
        </p>
        <Link href="/" onClick={reset}>
          <Button>Book another appointment</Button>
        </Link>
      </div>
    )
  }

  if (!serviceSlug || !date || !time || !clientInfo || !service) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <StatusBadge variant="accent" className="mb-6">
          Confirmed
        </StatusBadge>
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Thank you.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Your booking has been confirmed.
        </p>
        <Link href="/" onClick={reset}>
          <Button>Book another appointment</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <StatusBadge variant="accent" className="mb-6">
        Confirmed
      </StatusBadge>

      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
        You&apos;re booked,{" "}
        <span className="italic">{clientInfo.name.split(" ")[0]}</span>.
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        A confirmation email is on its way to {clientInfo.email}.
      </p>

      <div className="mb-8 rounded-sm border border-border bg-muted/30 p-6">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Treatment
            </dt>
            <dd className="text-sm font-medium">{service.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Date
            </dt>
            <dd className="text-sm font-medium">{date}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Time
            </dt>
            <dd className="text-sm font-medium">{time}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Deposit
            </dt>
            <dd className="text-sm font-medium">£{service.deposit}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-sm border border-border p-6">
        <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Before you arrive
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>1. Arrive 5 minutes before your slot.</li>
          <li>2. Come with clean, makeup-free lashes.</li>
          <li>3. No caffeine 2 hours before.</li>
          <li>
            4. Cambridge Heath Road, Bethnal Green. Entrance via the teal doors.
          </li>
        </ul>
      </div>

      <div className="mt-10 text-center">
        <Link href="/" onClick={reset}>
          <Button>Return home</Button>
        </Link>
      </div>
    </div>
  )
}
