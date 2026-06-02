import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <span className="mb-4 block font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
          404
        </span>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Page not found.
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <Link href="/">
          <Button>Return home</Button>
        </Link>
      </div>
    </div>
  )
}
