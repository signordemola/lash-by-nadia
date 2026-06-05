import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — Studio Dashboard",
  description: "Sign in to your studio dashboard.",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
