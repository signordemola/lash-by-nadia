import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { DataTable } from "@/components/ui/data-table"
import { columns, type ClientRow } from "./columns"

export const metadata: Metadata = {
  title: "Clients",
}

export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    include: { _count: { select: { appointments: true } } },
    orderBy: { name: "asc" },
  })

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold tracking-tight">Clients</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        {clients.length} client{clients.length !== 1 ? "s" : ""}
      </p>
      <DataTable
        columns={columns}
        data={clients as ClientRow[]}
        searchKey="name"
      />
    </div>
  )
}
