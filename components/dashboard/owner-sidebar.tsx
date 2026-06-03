"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LashMark } from "@/components/shared/lash-mark"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Today" },
  { href: "/dashboard/appointments", label: "Appointments" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/availability", label: "Availability" },
]

export function OwnerSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-3 p-6">
        <LashMark size={22} className="text-sidebar-foreground" />
        <span className="text-sm font-bold tracking-tight uppercase">
          Lash by Nadia
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <span className="size-1.5 shrink-0 rounded-full bg-accent" />
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Button
          variant="destructive"
          className="w-full justify-start font-mono text-[10px] tracking-[0.2em] text-sidebar-foreground/50 uppercase hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          Sign out
        </Button>
      </div>
    </aside>
  )
}
