"use client"

import { useState } from "react"
import { useBookingState } from "@/hooks/use-booking-state"
import { useStripeCheckout } from "@/hooks/use-stripe-checkout"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { services } from "@/lib/studio-data"
import { getStripe } from "@/lib/stripe-client"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { CreateBookingSchema } from "@/schemas/booking.schema"

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const { serviceSlug, date, time, goToStep } = useBookingState()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [elementReady, setElementReady] = useState(false)

  const service = services.find((s) => s.slug === serviceSlug)
  if (!service || !date || !time) return null

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? "Payment failed")
      setProcessing(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${serviceSlug}`,
      },
    })

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed")
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 rounded-sm border border-border bg-muted/30 p-6">
        <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Deposit payment
        </h2>
        <p className="text-2xl font-bold tracking-tight">
          £{service.deposit} deposit
        </p>
        <p className="text-sm text-muted-foreground">
          {service.name} on {date} at {time}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Refundable up to 48 hours before your appointment.
        </p>
      </div>

      <div className="mb-6 rounded-sm border border-border p-4">
        <PaymentElement onReady={() => setElementReady(true)} />
      </div>

      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith(
        "pk_test"
      ) && (
        <div className="mb-6 rounded-sm border border-border bg-muted/30 px-3 py-2">
          <p className="font-mono text-[10px] text-muted-foreground">
            <span className="tracking-[0.15em] uppercase">Demo ·</span> Use card{" "}
            <span className="text-foreground/70 tabular-nums">
              4242 4242 4242 4242
            </span>{" "}
            · any future date · any CVC
          </p>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-sm bg-destructive/10 px-4 py-3 font-mono text-[10px] tracking-[0.15em] text-destructive uppercase">
          {error}
        </p>
      )}

      <p className="mb-6 text-xs text-muted-foreground">
        By paying, you confirm you have read and agree to our cancellation and
        no-show policy. Deposit refundable up to 48 hours before your
        appointment.
      </p>

      <div className="flex justify-between border-t border-border pt-6">
        <Button
          variant="link"
          onClick={() => goToStep("policy")}
          className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
        >
          Back
        </Button>
        <Button type="submit" disabled={!stripe || processing || !elementReady}>
          {processing ? "Processing..." : `Pay £${service.deposit} deposit`}
        </Button>
      </div>
    </form>
  )
}

export function PaymentStep() {
  const { serviceSlug, date, time, clientInfo, holdToken, goToStep } =
    useBookingState()

  const bookingData =
    clientInfo && holdToken
      ? {
          holdToken,
          serviceSlug,
          date,
          time,
          name: clientInfo.name,
          email: clientInfo.email,
          phone: clientInfo.phone,
          allergies: clientInfo.allergies,
          referralSource: clientInfo.referralSource,
          policyAgreed: true as const,
        }
      : null

  const parsed = bookingData ? CreateBookingSchema.safeParse(bookingData) : null
  const checkout = useStripeCheckout(parsed?.success ? parsed.data : null)

  if (!serviceSlug || !date || !time || !clientInfo || !holdToken) return null

  return (
    <div className="mx-auto max-w-xl">
      <StatusBadge variant="accent" className="mb-6">
        Step 4 of 4
      </StatusBadge>

      <h1 className="mb-8 text-3xl font-bold tracking-tight md:text-4xl">
        Secure your slot.
      </h1>

      {parsed && !parsed.success ? (
        <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="mb-4 text-sm text-destructive">
            Invalid booking data. Please go back and try again.
          </p>
          <Button onClick={() => goToStep("policy")}>Go back</Button>
        </div>
      ) : checkout.data?.clientSecret ? (
        <Elements
          stripe={getStripe()}
          options={{
            clientSecret: checkout.data.clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <PaymentForm />
        </Elements>
      ) : checkout.data?.free ? (
        <div>
          <div className="mb-6 rounded-sm border border-border bg-muted/30 p-6">
            <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Free booking
            </h2>
            <p className="text-2xl font-bold tracking-tight">£0</p>
            <p className="text-sm text-muted-foreground">
              {services.find((s) => s.slug === serviceSlug)?.name ??
                serviceSlug}{" "}
              on {date} at {time}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No deposit required for this service.
            </p>
          </div>
          <div className="flex justify-between border-t border-border pt-6">
            <Button
              variant="link"
              onClick={() => goToStep("policy")}
              className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
            >
              Back
            </Button>
            <Button onClick={() => goToStep("complete")}>
              Confirm booking
            </Button>
          </div>
        </div>
      ) : checkout.isError ? (
        <div className="rounded-sm border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="mb-4 text-sm text-destructive">
            {checkout.error?.message ?? "Failed to create payment session."}
          </p>
          <Button onClick={() => goToStep("policy")}>Go back</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-sm bg-muted" />
          ))}
        </div>
      )}
    </div>
  )
}
