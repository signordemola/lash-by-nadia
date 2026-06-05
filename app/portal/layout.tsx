import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find My Booking",
  description: "Look up and manage your upcoming appointment.",
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
