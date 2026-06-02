import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LashMark } from "@/components/shared/lash-mark"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Today" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/availability", label: "Availability" },
  { href: "/dashboard/clients", label: "Clients" },
]

export default async function DashboardLayout({
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between p-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <LashMark size={22} />
            <span className="text-sm font-bold tracking-tight uppercase">
              Lash by Nadia
            </span>
          </Link>
          <Link
            href="/"
            className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            View site
          </Link>
        </div>
        <nav className="mx-auto max-w-screen-xl px-6 pb-3">
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="xs"
                  className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase hover:text-foreground"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-screen-xl px-6 py-12">{children}</main>
    </div>
  )
}
