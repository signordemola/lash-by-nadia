import { OwnerSidebar } from "@/components/dashboard/owner-sidebar"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <OwnerSidebar />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  )
}
