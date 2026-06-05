"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Clock,
  ExternalLink,
  LogOut,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/dashboard/appointments", label: "Appointments", icon: Calendar },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/availability", label: "Availability", icon: Clock },
]

interface OwnerSidebarProps {
  className?: string
  onClose?: () => void
}

export function OwnerSidebar({ className, onClose }: OwnerSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <aside
      className={cn(
        "flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex items-center gap-3 p-6">
        <Logo size={22} asLink={false} />
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-2">
        <div className="mb-2 px-3">
          <span className="font-mono text-[9px] font-semibold tracking-[0.25em] text-sidebar-foreground/40 uppercase">
            Overview
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-xs"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-accent" : "text-sidebar-foreground/50"
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="space-y-4 border-t border-sidebar-border p-4">
        {/* View Site Link */}
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 rounded-md px-3 py-2 font-mono text-[10px] tracking-widest text-sidebar-foreground/60 uppercase transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span>View site</span>
        </Link>

        {/* Profile Card */}
        <div className="flex items-center gap-3 rounded-lg border border-sidebar-border/40 bg-sidebar-accent/30 px-3 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 font-mono text-xs font-semibold text-accent select-none">
            N
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs leading-none font-semibold text-sidebar-foreground">
              Nadia
            </p>
            <p className="mt-1 truncate font-mono text-[9px] text-sidebar-foreground/50">
              nadia@lashbynadia.co.uk
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-start font-mono text-[10px] tracking-[0.2em] text-sidebar-foreground/50 uppercase transition-colors hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-3.5 w-3.5 shrink-0" />
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
  )
}
