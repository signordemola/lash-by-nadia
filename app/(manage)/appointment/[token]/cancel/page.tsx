"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency } from "@/lib/utils"

type OutcomeInfo = {
  title: string
  description: string
  variant: "accent" | "destructive" | "default"
}

const outcomeInfo: Record<string, OutcomeInfo> = {
  refund: {
    title: "You are outside the 48-hour window.",
    description:
      "Your deposit will be fully refunded to your card within 3–5 working days.",
    variant: "accent",
  },
  credit: {
    title: "You are inside the 24–48 hour window.",
    description: "Your deposit will be held as credit toward your next visit.",
    variant: "accent",
  },
  forfeit: {
    title: "You are inside the 24-hour window.",
    description:
      "Your deposit will be forfeited, per the policy you agreed to when booking.",
    variant: "destructive",
  },
}

export default function CancelPage() {
  const { token } = useParams<{ token: string }>()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    outcome: string
    amount?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/appointments/${token}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to cancel. Please try again.")
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
    const info = outcomeInfo[result.outcome] ?? outcomeInfo.forfeit
    return (
      <div className="mx-auto max-w-xl text-center">
        <StatusBadge variant="default" className="mb-6">
          Cancelled
        </StatusBadge>
        <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Appointment cancelled.
        </h1>
        <Card className="mb-8 p-6 text-left">
          <p className="mb-2 text-sm font-medium">{info.title}</p>
          <p className="text-sm text-muted-foreground">{info.description}</p>
          {result.amount && (
            <p className="mt-2 font-mono text-sm">
              {formatCurrency(result.amount)}
            </p>
          )}
        </Card>
        <Link href="/">
          <Button>Book another appointment</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl">
      <StatusBadge variant="destructive" className="mb-6">
        Cancel appointment
      </StatusBadge>

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Are you sure?
      </h1>

      <div className="mb-8 rounded-sm border border-border p-6">
        <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Cancellation policy
        </h2>
        <dl className="space-y-1 divide-y divide-border">
          {[
            { w: "48h+", o: "Full deposit refunded" },
            { w: "24–48h", o: "Deposit held as credit" },
            { w: "<24h", o: "Deposit forfeited" },
            { w: "No-show", o: "Deposit forfeited, flagged" },
          ].map((p) => (
            <div key={p.w} className="flex justify-between py-2 text-sm">
              <dt className="font-mono text-muted-foreground">{p.w}</dt>
              <dd>{p.o}</dd>
            </div>
          ))}
        </dl>
      </div>

      {error && (
        <p className="mb-4 rounded-sm bg-destructive/10 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase">
          {error}
        </p>
      )}

      <div className="flex justify-between border-t border-border pt-6">
        <Link href={`/appointment/${token}`}>
          <Button
            variant="link"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
          >
            Never mind, keep it
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={handleCancel}
          disabled={submitting}
        >
          {submitting ? "Cancelling..." : "Cancel my appointment"}
        </Button>
      </div>
    </div>
  )
}
