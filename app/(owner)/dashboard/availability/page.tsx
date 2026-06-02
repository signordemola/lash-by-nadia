import { Card } from "@/components/ui/card"

export default function AvailabilityPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Availability</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Set your weekly working hours and block off dates.
      </p>
      <Card className="flex min-h-[300px] items-center justify-center rounded-sm p-12">
        <p className="text-sm text-muted-foreground">
          Availability management coming soon.
        </p>
      </Card>
    </div>
  )
}
