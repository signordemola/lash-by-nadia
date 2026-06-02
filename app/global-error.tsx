"use client"

import { Button } from "@/components/ui/button"

export default function GlobalErrorPage({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background px-6">
          <div className="max-w-md text-center">
            <span className="mb-4 block font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
              Error
            </span>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Something went wrong.
            </h1>
            <p className="mb-8 text-sm text-muted-foreground">
              A critical error occurred. Please try again.
            </p>
            <Button onClick={reset}>Try again</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
