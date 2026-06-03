"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import type { Appointment, Client, Service } from "@/generated/prisma/client"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type AppointmentRow = Appointment & {
  client: Client
  service: Service
}

export const columns: ColumnDef<AppointmentRow>[] = [
  {
    accessorKey: "client.name",
    header: "Client",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.client.name}</span>
    ),
  },
  {
    accessorKey: "service.name",
    header: "Service",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
        {row.original.service.name}
      </span>
    ),
  },
  {
    accessorKey: "startsAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="xs"
        className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.startsAt)
      return (
        <span className="font-mono text-sm">
          {date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      )
    },
  },
  {
    accessorKey: "startsAt",
    id: "time",
    header: "Time",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatTime(row.original.startsAt)}
      </span>
    ),
  },
  {
    accessorKey: "depositAmount",
    header: "Deposit",
    cell: ({ row }) => (
      <span className="font-mono text-[10px]">
        {formatCurrency(row.original.depositAmount)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const variant =
        status === "CONFIRMED"
          ? "accent"
          : status === "COMPLETED"
            ? "default"
            : status === "NO_SHOW"
              ? "destructive"
              : "default"
      return (
        <StatusBadge variant={variant as "accent" | "destructive" | "default"}>
          {status}
        </StatusBadge>
      )
    },
  },
]
