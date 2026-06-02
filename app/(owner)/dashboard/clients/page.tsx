import { Card } from "@/components/ui/card"

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Clients</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Search client history, notes, and contact details.
      </p>
      <Card className="flex min-h-[300px] items-center justify-center rounded-sm p-12">
        <p className="text-sm text-muted-foreground">
          Client directory coming soon.
        </p>
      </Card>
    </div>
  )
}
