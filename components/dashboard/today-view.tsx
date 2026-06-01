"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatTime } from "@/lib/utils"
import type { Appointment, Client, Service } from "@/generated/prisma/client"

type AppointmentWithRelations = Appointment & {
  client: Client
  service: Service
}

type Props = {
  user: { name?: string | null; email: string }
  todayAppointments: AppointmentWithRelations[]
  stats: {
    monthBookings: number
    monthRevenue: number
    noShows: number
    todayCount: number
  }
  weekDays: {
    day: string
    date: number
    today: boolean
    count: number
  }[]
}

export function DashboardView({
  user,
  todayAppointments,
  stats,
  weekDays,
}: Props) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Today&apos;s view
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.name ?? user.email}
          </p>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="This month"
          value={String(stats.monthBookings)}
          meta="bookings"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.monthRevenue)}
          meta="this month"
        />
        <StatCard
          label="Today"
          value={String(stats.todayCount)}
          meta="appointments"
        />
        <StatCard
          label="No-shows"
          value={String(stats.noShows)}
          meta="this month"
        />
      </div>

      <div className="mb-10">
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          This week
        </h2>
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((d) => (
            <div
              key={d.day}
              className={`rounded-sm border p-2 text-center ${
                d.today ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <span className="block font-mono text-[10px] text-muted-foreground uppercase">
                {d.day}
              </span>
              <span className="block text-sm font-medium">{d.date}</span>
              <span className="block font-mono text-[10px] text-muted-foreground">
                {d.count > 0 ? d.count : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Today&apos;s appointments
        </h2>
        {todayAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No appointments today.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((apt) => (
              <AppointmentRow key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  meta,
}: {
  label: string
  value: string
  meta?: string
}) {
  return (
    <Card className="rounded-sm p-4">
      <span className="block font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
      <span className="mt-1 block text-2xl font-bold tracking-tight">
        {value}
      </span>
      {meta && (
        <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
          {meta}
        </span>
      )}
    </Card>
  )
}

function AppointmentRow({
  appointment,
}: {
  appointment: AppointmentWithRelations
}) {
  const isPast = new Date() > appointment.startsAt
  const statusVariant =
    appointment.status === "COMPLETED"
      ? "default"
      : appointment.status === "NO_SHOW"
        ? "destructive"
        : "accent"

  const statusLabel =
    appointment.status === "CONFIRMED" && isPast
      ? "In session"
      : appointment.status

  return (
    <Card className="flex items-center justify-between rounded-sm p-4">
      <div className="flex items-center gap-4">
        <span className="font-mono text-sm tracking-tight">
          {formatTime(appointment.startsAt)}
        </span>
        <div>
          <p className="text-sm font-medium">{appointment.client.name}</p>
          <p className="font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
            {appointment.service.name} · {appointment.service.duration}min ·{" "}
            {formatCurrency(appointment.depositAmount)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge
          variant={statusVariant as "accent" | "destructive" | "default"}
        >
          {statusLabel}
        </StatusBadge>
        {appointment.status === "CONFIRMED" && (
          <Button
            variant="outline"
            size="xs"
            className="font-mono text-[10px] tracking-[0.15em] uppercase"
          >
            {isPast ? "Complete" : "Arrived"}
          </Button>
        )}
      </div>
    </Card>
  )
}
