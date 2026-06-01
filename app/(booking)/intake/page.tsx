"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingState } from "@/hooks/use-booking-state"
import { useClientLookup } from "@/hooks/use-client-lookup"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { StatusBadge } from "@/components/shared/status-badge"
import { NewClientSchema } from "@/schemas/booking.schema"
import type { ClientInfo } from "@/hooks/use-booking-state"

export default function IntakePage() {
  const router = useRouter()
  const { serviceSlug, date, time, setClientInfo, goToStep } = useBookingState()
  const [email, setEmail] = useState("")
  const lookup = useClientLookup()
  const [form, setForm] = useState<ClientInfo>({
    name: "",
    email: "",
    phone: "",
    allergies: "",
    referralSource: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!serviceSlug || !date || !time) {
    router.replace("/")
    return null
  }

  function handleLookup() {
    lookup.mutate(email, {
      onSuccess: (data) => {
        if (data.found) {
          setForm({
            name: data.name,
            email,
            phone: data.phone,
            allergies: data.allergies ?? "",
            referralSource: "",
          })
        }
      },
    })
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = NewClientSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setClientInfo(parsed.data)
    router.push("/policy")
  }

  return (
    <div className="mx-auto max-w-xl">
      <StatusBadge variant="accent" className="mb-6">
        Step 2 of 4
      </StatusBadge>

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Your details.
      </h1>

      {!lookup.data && (
        <div className="mb-10 rounded-sm border border-border p-6">
          <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Booked with us before?
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Enter your email and we&apos;ll fill in your details.
          </p>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleLookup}
              disabled={lookup.isPending || !email}
              className="shrink-0"
            >
              {lookup.isPending ? "Checking..." : "Look up"}
            </Button>
          </div>
        </div>
      )}

      {lookup.data && !lookup.data.found && (
        <div className="mb-10 rounded-sm border border-border p-6">
          <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            New here?
          </h2>
          <p className="text-sm text-muted-foreground">
            No account found for {email}. Please fill in your details below.
          </p>
        </div>
      )}

      {lookup.data && lookup.data.found && (
        <div className="mb-10 rounded-sm border border-border bg-muted/30 p-6">
          <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            We found your details. Confirm they&apos;re still correct.
          </p>
        </div>
      )}

      {(!lookup.data || !lookup.data.found) && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
              aria-invalid={!!errors.name}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>

          <Field data-invalid={!!errors.phone}>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="07123 456 789"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <FieldError>{errors.phone}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="allergies">
              Allergies or sensitivities (optional)
            </FieldLabel>
            <Input
              id="allergies"
              value={form.allergies ?? ""}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder="E.g. latex, adhesive patch test needed"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="referral">
              How did you hear about us? (optional)
            </FieldLabel>
            <Input
              id="referral"
              value={form.referralSource ?? ""}
              onChange={(e) =>
                setForm({ ...form, referralSource: e.target.value })
              }
              placeholder="Instagram, friend, etc."
            />
          </Field>

          <div className="flex justify-between border-t border-border pt-6">
            <Button
              variant="link"
              onClick={() => goToStep("slot")}
              className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
            >
              Back
            </Button>
            <Button type="submit">Review policy</Button>
          </div>
        </form>
      )}
    </div>
  )
}
