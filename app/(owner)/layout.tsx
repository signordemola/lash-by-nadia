import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { OwnerSidebar } from "@/components/dashboard/owner-sidebar"

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <OwnerSidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  )
}
