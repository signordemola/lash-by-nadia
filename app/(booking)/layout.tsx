import type { Metadata } from "next"
import { Logo } from "@/components/shared/logo"
import { HoldTimer } from "@/components/booking/hold-timer"
import { CancelBookingLink } from "@/components/booking/cancel-booking-link"

export const metadata: Metadata = {
  title: "Book a Treatment — Lash by Nadia",
  description:
    "Book your lash treatment in Bethnal Green. Select a service, pick a date, and secure your appointment with a deposit.",
}

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between p-6">
          <Logo size={22} />
          <CancelBookingLink />
        </div>
      </header>

      <HoldTimer />
      <main className="mx-auto max-w-screen-xl px-6 py-12 md:py-20">
        {children}
      </main>
    </div>
  )
}
