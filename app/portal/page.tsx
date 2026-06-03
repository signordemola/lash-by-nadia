"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"

export default function PortalPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) {
      setError("Enter your booking reference.")
      return
    }

    setLoading(true)
    setError(null)

    const res = await fetch(`/api/appointments/${trimmed}`)
    if (!res.ok) {
      setError("Booking not found. Check your reference and try again.")
      setLoading(false)
      return
    }

    router.push(`/appointment/${trimmed}`)
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <StatusBadge variant="accent" className="mb-6">
        Manage booking
      </StatusBadge>

      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
        Your booking.
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Enter your booking reference from your confirmation email to view,
        reschedule, or cancel your appointment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="token"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
          >
            Booking reference
          </label>
          <Input
            id="token"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
              setError(null)
            }}
            placeholder="e.g. abc123def456ghi789jkl"
            className="font-mono text-sm tracking-[0.05em]"
            autoComplete="off"
          />
        </div>

        {error && (
          <p className="rounded-sm bg-destructive/10 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Looking up..." : "Look up"}
        </Button>
      </form>
    </div>
  )
}
