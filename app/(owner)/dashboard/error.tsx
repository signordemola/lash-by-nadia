"use client"

import { useEffect } from "react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[dashboard] Error boundary caught:", error)
  }, [error])

  const isDbError =
    error.message?.includes("ETIMEDOUT") ||
    error.message?.includes("P1001") ||
    error.message?.includes("P1002") ||
    error.message?.includes("Can't reach database")

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {isDbError ? "Database unavailable" : "Something went wrong"}
      </p>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">
        {isDbError ? "The database is waking up." : "Dashboard error"}
      </h1>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        {isDbError
          ? "Neon paused the database due to inactivity. Wait a moment and try again."
          : error.message}
      </p>
      <button
        onClick={reset}
        className="border border-border px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors hover:bg-muted"
      >
        Try again
      </button>
    </div>
  )
}
