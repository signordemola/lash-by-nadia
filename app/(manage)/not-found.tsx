import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ManageNotFound() {
  return (
    <div className="mx-auto max-w-xl py-20 text-center">
      <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
        This link is no longer available.
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Your appointment may have been cancelled, completed, or the link has
        expired.
      </p>
      <Link href="/">
        <Button>Book a new appointment</Button>
      </Link>
    </div>
  )
}
