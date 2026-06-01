import type { Metadata } from "next"
import Link from "next/link"
import { LashMark } from "@/components/shared/lash-mark"
import { StatusBadge } from "@/components/shared/status-badge"

export const metadata: Metadata = {
  title: "Manage Booking — Lash by Nadia",
  description: "Manage your lash appointment.",
}

export default function ManageLayout({
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
          <StatusBadge>Private link</StatusBadge>
        </div>
      </header>
      <main className="mx-auto max-w-screen-xl px-6 py-12 md:py-20">
        {children}
      </main>
    </div>
  )
}
