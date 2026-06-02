"use client"

import { Suspense, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useBookingState } from "@/hooks/use-booking-state"
import { services } from "@/lib/studio-data"
import { SlotPickerStep } from "@/components/booking/step-slot-picker"
import { IntakeStep } from "@/components/booking/step-intake"
import { PolicyStep } from "@/components/booking/step-policy"
import { PaymentStep } from "@/components/booking/step-payment"
import { ConfirmationStep } from "@/components/booking/step-confirmation"

function Wizard() {
  const params = useParams<{ serviceSlug: string }>()
  const searchParams = useSearchParams()
  const { step } = useBookingState()
  const paymentIntent = searchParams.get("payment_intent")
  const expired = searchParams.get("expired")

  useEffect(() => {
    useBookingState.getState().setService(params.serviceSlug)
  }, [params.serviceSlug])

  const service = services.find((s) => s.slug === params.serviceSlug)

  if (!service) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    )
  }

  if (paymentIntent) {
    return <ConfirmationStep showFallback />
  }

  if (step === "complete") {
    return <ConfirmationStep showFallback />
  }

  return (
    <>
      {expired === "1" && (step === "service" || step === "slot") && (
        <div className="mx-auto mb-8 max-w-2xl rounded-sm bg-amber-500/10 px-4 py-3 text-center font-mono text-[10px] tracking-[0.15em] text-amber-600 uppercase">
          Your hold expired. Please select a new slot.
        </div>
      )}
      {(step === "service" || step === "slot") && <SlotPickerStep />}
      {step === "intake" && <IntakeStep />}
      {step === "policy" && <PolicyStep />}
      {step === "payment" && <PaymentStep />}
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense>
      <Wizard />
    </Suspense>
  )
}
