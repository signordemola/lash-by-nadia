"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mb-4 block font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          Error
        </span>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Something went wrong.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
