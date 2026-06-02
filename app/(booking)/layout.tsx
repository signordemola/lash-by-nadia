import type { Metadata } from "next"
import Link from "next/link"
import { LashMark } from "@/components/shared/lash-mark"
import { HoldTimer } from "@/components/booking/hold-timer"

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
          <Link href="/" className="flex items-center gap-3">
            <LashMark size={22} />
            <span className="text-sm font-bold tracking-tight uppercase">
              Lash by Nadia
            </span>
          </Link>
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </header>
      <HoldTimer />
      <main className="mx-auto max-w-screen-xl px-6 py-12 md:py-20">
        {children}
      </main>
    </div>
  )
}
