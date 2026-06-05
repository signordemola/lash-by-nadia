import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Studio Dashboard",
  description: "Lash by Nadia owner dashboard.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
