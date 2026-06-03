"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { LashMark } from "@/components/shared/lash-mark"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Invalid credentials")
      setLoading(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden items-center justify-center bg-foreground p-12 lg:flex">
        <div className="max-w-xs text-background">
          <div className="mb-8 flex items-center gap-3">
            <LashMark size={32} className="text-background" />
            <span className="text-base font-bold tracking-tight uppercase">
              Lash by Nadia
            </span>
          </div>
          <p className="text-2xl leading-tight font-bold tracking-tight">
            Solo lash artistry in East London.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-background/70">
            The private dashboard for your studio. View today&apos;s
            appointments, manage clients, and keep your calendar running
            smoothly.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <LashMark size={28} />
            <span className="text-sm font-bold tracking-tight uppercase">
              Lash by Nadia
            </span>
          </div>

          <h1 className="mb-1 text-3xl font-bold tracking-tight">
            Welcome back.
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Sign in to your studio dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Field data-invalid={!!error}>
              <FieldLabel
                htmlFor="email"
                className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nadia@lashbynadia.co.uk"
                aria-invalid={!!error}
              />
            </Field>

            <Field data-invalid={!!error}>
              <FieldLabel
                htmlFor="password"
                className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
              >
                Password
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="········"
                aria-invalid={!!error}
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
