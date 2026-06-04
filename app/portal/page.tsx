"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"

export default function PortalPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError("Enter the email address used when booking.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/portal/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      router.push(`/appointment/${data.token}`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20">
      <StatusBadge variant="accent" className="mb-6">
        Manage booking
      </StatusBadge>

      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
        Find your booking.
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Enter the email address you used when booking to view or manage your
        upcoming appointment.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
          >
            Email address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
            placeholder="you@example.com"
            className="text-sm"
            autoComplete="email"
          />
        </div>

        {error && (
          <p className="rounded-sm bg-destructive/10 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Looking up..." : "Find my booking"}
        </Button>
      </form>

      <p className="mt-10 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        <Link href="/" className="transition-colors hover:text-foreground">
          ← Back to home
        </Link>
      </p>
    </div>
  )
}
