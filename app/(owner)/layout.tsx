"use client"

import { useState } from "react"
import { OwnerSidebar } from "@/components/dashboard/owner-sidebar"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <OwnerSidebar className="hidden md:flex" />

      {/* Mobile Sidebar overlay/drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
          {/* Sliding content */}
          <div className="relative flex h-full w-64 animate-in duration-200 slide-in-from-left">
            <OwnerSidebar
              className="flex h-full w-full border-r"
              onClose={() => setIsOpen(false)}
            />
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-4 right-4 text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar to toggle sidebar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          <span className="flex-1 text-center font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Studio Dashboard
          </span>
          <div className="w-8" /> {/* Spacer to center title */}
        </header>

        {/* Content viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10">{children}</main>
      </div>
    </div>
  )
}
