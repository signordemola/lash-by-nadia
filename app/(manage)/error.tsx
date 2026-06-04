"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"

export default function ManageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[manage] Unhandled error:", error)
  }, [error])

  const isUnavailable = error.name === "DatabaseUnavailableError"

  return (
    <div className="mx-auto max-w-xl text-center">
      <StatusBadge variant="destructive" className="mb-6">
        {isUnavailable ? "Service unavailable" : "Error"}
      </StatusBadge>
      <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
        {isUnavailable
          ? "We\u2019re having trouble connecting."
          : "Something went wrong."}
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {isUnavailable
          ? "Our database is temporarily unreachable. Your appointment is safe \u2014 please try again in a few minutes."
          : "An unexpected error occurred. Please try again or contact us if the problem persists."}
      </p>
      <div className="flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </div>
  )
}
