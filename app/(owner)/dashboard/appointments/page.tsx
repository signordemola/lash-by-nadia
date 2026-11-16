import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { requireOwnerPage } from "@/lib/require-owner"
import { DataTable } from "@/components/ui/data-table"
import { columns, type AppointmentRow } from "./columns"

export const metadata: Metadata = {
  title: "Appointments",
}

export const dynamic = "force-dynamic"

export default async function AppointmentsPage() {
  await requireOwnerPage()

  const appointments = await prisma.appointment.findMany({
    include: { client: true, service: true },
    orderBy: { startsAt: "desc" },
    take: 100,
  })

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Appointments</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
      </p>
      <DataTable
        columns={columns}
        data={appointments as AppointmentRow[]}
        searchKey="client.name"
      />
    </div>
  )
}
