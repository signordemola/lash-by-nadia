"use client"

import { type ColumnDef } from "@tanstack/react-table"
import type { Client } from "@/generated/prisma/client"
import { StatusBadge } from "@/components/shared/status-badge"

export type ClientRow = Client & {
  _count: { appointments: number }
}

export const columns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.name}</span>
        {row.original.isFlagged && (
          <StatusBadge variant="destructive">Flagged</StatusBadge>
        )}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.phone}</span>
    ),
  },
  {
    accessorKey: "_count.appointments",
    header: "Visits",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original._count.appointments}
      </span>
    ),
  },
  {
    accessorKey: "noShowCount",
    header: "No-shows",
    cell: ({ row }) => {
      const count = row.original.noShowCount
      return (
        <span
          className={`font-mono text-sm ${count > 0 ? "text-destructive" : "text-muted-foreground"}`}
        >
          {count}
        </span>
      )
    },
  },
]
