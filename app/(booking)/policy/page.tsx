"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingState } from "@/hooks/use-booking-state"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "@/components/shared/status-badge"
import { services, policy } from "@/lib/studio-data"

export default function PolicyPage() {
  const router = useRouter()
  const { serviceSlug, date, time, clientInfo, agreePolicy, goToStep } =
    useBookingState()
  const [agreed, setAgreed] = useState(false)

  if (!serviceSlug || !date || !time || !clientInfo) {
    router.replace("/")
    return null
  }

  const service = services.find((s) => s.slug === serviceSlug)!

  function handleConfirm() {
    if (!agreed) return
    agreePolicy()
    router.push("/payment")
  }

  return (
    <div className="mx-auto max-w-2xl">
      <StatusBadge variant="accent" className="mb-6">
        Step 3 of 4
      </StatusBadge>

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Studio policy.
      </h1>

      <div className="mb-8 rounded-sm border border-border bg-muted/30 p-6">
        <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Your booking
        </h2>
        <p className="text-lg font-bold tracking-tight">
          {service.name} · £{service.price}
        </p>
        <p className="text-sm text-muted-foreground">
          {date} at {time} · Deposit: £{service.deposit}
        </p>
      </div>

      <div className="mb-10">
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Cancellation policy
        </h2>
        <dl className="divide-y divide-border border-y border-border">
          {policy.map((p) => (
            <div
              key={p.window}
              className="grid grid-cols-12 items-baseline gap-4 py-4"
            >
              <dt className="col-span-12 font-mono text-sm tracking-tight sm:col-span-5">
                {p.window}
              </dt>
              <dd className="col-span-12 text-sm text-muted-foreground sm:col-span-7">
                {p.outcome}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mb-8 flex items-start gap-3">
        <Checkbox
          id="agree"
          checked={agreed}
          onCheckedChange={(v) => setAgreed(!!v)}
        />
        <label htmlFor="agree" className="text-sm leading-relaxed">
          I have read and agree to the cancellation and no-show policy. I
          understand my deposit may be forfeited if I cancel within 24 hours or
          do not show up.
        </label>
      </div>

      <div className="flex justify-between border-t border-border pt-6">
        <Button
          variant="link"
          onClick={() => goToStep("intake")}
          className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
        >
          Back
        </Button>
        <Button onClick={handleConfirm} disabled={!agreed}>
          Proceed to payment
        </Button>
      </div>
    </div>
  )
}
