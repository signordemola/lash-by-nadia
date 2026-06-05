"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { cn, formatCurrency, formatTime } from "@/lib/utils"
import { useMarkComplete, useMarkNoShow } from "@/hooks/use-dashboard"
import type { Appointment, Client, Service } from "@/generated/prisma/client"
import { Calendar, CreditCard, Clock, UserX } from "lucide-react"

type AppointmentWithRelations = Appointment & {
  client: Client
  service: Service
}

type Props = {
  user?: { name?: string | null; email: string }
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
    <div className="mx-auto max-w-5xl animate-in space-y-8 duration-300 fade-in">
      <div className="flex items-center justify-between border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Today&apos;s view
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.name ?? user?.email ?? "Studio dashboard"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="This month"
          value={String(stats.monthBookings)}
          meta="bookings"
          icon={Calendar}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(stats.monthRevenue)}
          meta="this month"
          icon={CreditCard}
        />
        <StatCard
          label="Today"
          value={String(stats.todayCount)}
          meta="appointments"
          icon={Clock}
        />
        <StatCard
          label="No-shows"
          value={String(stats.noShows)}
          meta="this month"
          icon={UserX}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Left Column: Today's Appointments */}
        <div className="space-y-4 md:col-span-7 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[10px] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
              Today&apos;s appointments
            </h2>
            <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              {todayAppointments.length} total
            </span>
          </div>
          {todayAppointments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center border border-dashed border-border p-12">
              <Clock className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                No appointments today.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt) => (
                <AppointmentRow key={apt.id} appointment={apt} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Glance */}
        <div className="space-y-4 md:col-span-5 lg:col-span-4">
          <h2 className="font-mono text-[10px] font-semibold tracking-[0.25em] text-muted-foreground uppercase">
            This week
          </h2>
          <div className="grid grid-cols-7 gap-1.5 md:grid-cols-1 md:gap-2">
            {weekDays.map((d) => (
              <div
                key={d.day}
                className={cn(
                  "rounded-lg border p-2 text-center transition-all md:flex md:items-center md:justify-between md:p-3.5 md:text-left",
                  d.today
                    ? "border-accent bg-accent/5 font-semibold shadow-xs"
                    : "border-border hover:border-foreground/10"
                )}
              >
                <div className="md:flex md:items-center md:gap-4">
                  <span
                    className={cn(
                      "block font-mono text-[10px] uppercase md:w-8",
                      d.today
                        ? "font-bold text-accent"
                        : "text-muted-foreground"
                    )}
                  >
                    {d.day}
                  </span>
                  <span className="block text-sm font-medium text-foreground">
                    {d.date}
                  </span>
                </div>
                <span
                  className={cn(
                    "mt-1 block font-mono text-[10px] md:mt-0 md:text-xs",
                    d.count > 0
                      ? d.today
                        ? "font-bold text-accent"
                        : "font-semibold text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {d.count > 0
                    ? `${d.count} ${d.count === 1 ? "apt" : "apts"}`
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
}: {
  label: string
  value: string
  meta?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border border-border shadow-xs transition-colors hover:border-foreground/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="font-mono text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pt-2">
        <span className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </span>
        {meta && (
          <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
            {meta}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function AppointmentRow({
  appointment: initialApt,
}: {
  appointment: AppointmentWithRelations
}) {
  const [apt, setApt] = useState(initialApt)
  const complete = useMarkComplete()
  const noShow = useMarkNoShow()
  const isPast = new Date() > apt.startsAt

  const statusVariant =
    apt.status === "COMPLETED"
      ? "default"
      : apt.status === "NO_SHOW"
        ? "destructive"
        : "accent"

  const statusLabel =
    apt.status === "CONFIRMED" && isPast ? "In session" : apt.status

  function markComplete() {
    complete.mutate(apt.id, {
      onSuccess: () => setApt({ ...apt, status: "COMPLETED" }),
    })
  }

  // Mark no show
  function markNoShow() {
    noShow.mutate(apt.id, {
      onSuccess: () => setApt({ ...apt, status: "NO_SHOW" }),
    })
  }

  const isLoading = complete.isPending || noShow.isPending
  const mutationError = complete.error || noShow.error

  // Extract initials for the client avatar
  const initials = apt.client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card className="flex flex-col justify-between gap-4 border border-border p-4 transition-all hover:border-foreground/10 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {/* Visual initials avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 font-mono text-xs font-semibold text-accent select-none">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {apt.client.name}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatTime(apt.startsAt)}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            {apt.service.name} · {apt.service.duration}min ·{" "}
            {formatCurrency(apt.depositAmount)}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
        <StatusBadge
          variant={statusVariant as "accent" | "destructive" | "default"}
        >
          {statusLabel}
        </StatusBadge>
        {apt.status === "CONFIRMED" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              className="h-7 px-2.5 font-mono text-[9px] tracking-widest uppercase"
              onClick={isPast ? markComplete : undefined}
              disabled={isLoading || !isPast}
            >
              {isLoading ? "..." : isPast ? "Complete" : "Arrived"}
            </Button>
            {isPast && (
              <Button
                variant="destructive"
                size="xs"
                className="h-7 px-2.5 font-mono text-[9px] tracking-widest uppercase"
                onClick={markNoShow}
                disabled={isLoading}
              >
                No-show
              </Button>
            )}
            {mutationError && (
              <span className="font-mono text-[9px] text-destructive">
                {mutationError.message}
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
