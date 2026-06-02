import { Card } from "@/components/ui/card"

export default function AppointmentsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Appointments</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        View and manage all upcoming and past appointments.
      </p>
      <Card className="flex min-h-[300px] items-center justify-center rounded-sm p-12">
        <p className="text-sm text-muted-foreground">
          Appointment list coming soon.
        </p>
      </Card>
    </div>
  )
}
