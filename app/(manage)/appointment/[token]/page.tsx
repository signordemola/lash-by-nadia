import { notFound } from "next/navigation"
import Link from "next/link"
import { getAppointmentByToken } from "@/lib/tokens"
import { getCancellationOutcome, isRescheduleAllowed } from "@/lib/policy"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function ManagePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const appointment = await getAppointmentByToken(token)

  if (
    !appointment ||
    appointment.status === "CANCELLED" ||
    appointment.status === "NO_SHOW"
  ) {
    notFound()
  }

  const outcome = getCancellationOutcome(appointment.startsAt)
  const canReschedule = isRescheduleAllowed(appointment.startsAt)

  const outcomeLabel: Record<string, string> = {
    refund: "fully refunded",
    credit: "held as credit",
    forfeit: "forfeited",
  }

  return (
    <div className="mx-auto max-w-xl">
      <StatusBadge variant="accent" className="mb-6">
        {appointment.status === "COMPLETED" ? "Completed" : "Confirmed"}
      </StatusBadge>

      <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
        Your appointment
        {appointment.client.name && (
          <>
            ,{" "}
            <span className="italic">
              {appointment.client.name.split(" ")[0]}
            </span>
          </>
        )}
        .
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        {appointment.status === "CONFIRMED"
          ? `Reschedule available up to 48 hours before. Cancel anytime — your deposit may be affected.`
          : `This appointment is complete.`}
      </p>

      <Card className="mb-8 p-6">
        <dl className="space-y-4">
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Treatment
            </dt>
            <dd className="text-sm font-medium">{appointment.service.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Date
            </dt>
            <dd className="text-sm font-medium">
              {formatDate(appointment.startsAt)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Time
            </dt>
            <dd className="text-sm font-medium">
              {formatTime(appointment.startsAt)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Duration
            </dt>
            <dd className="text-sm font-medium">
              {appointment.service.duration} min
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              Deposit
            </dt>
            <dd className="text-sm font-medium">
              {formatCurrency(appointment.depositAmount)} (paid)
            </dd>
          </div>
        </dl>
      </Card>

      {appointment.status === "CONFIRMED" && (
        <div className="mb-8 space-y-3">
          {canReschedule ? (
            <Link href={`/appointment/${token}/reschedule`} className="block">
              <Button variant="outline" className="w-full justify-between">
                Reschedule
                <span className="font-mono text-[10px] text-muted-foreground">
                  Available
                </span>
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Reschedule
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                Locked inside 48h window
              </span>
            </Button>
          )}

          <Link href={`/appointment/${token}/cancel`} className="block">
            <Button
              variant="outline"
              className="w-full justify-between text-destructive hover:text-destructive"
            >
              Cancel appointment
              <span className="font-mono text-[10px] text-muted-foreground">
                Deposit {outcomeLabel[outcome]}
              </span>
            </Button>
          </Link>
        </div>
      )}

      <div className="rounded-sm border border-border p-6">
        <h2 className="mb-1 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Studio info
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Cambridge Heath Road, Bethnal Green, London E2.</li>
          <li>Entrance via the teal doors.</li>
          <li>Come with clean, makeup-free lashes.</li>
          <li>Questions? Reply to your confirmation email.</li>
        </ul>
      </div>

      <div className="mt-10 text-center">
        <Link href="/">
          <Button>Book another appointment</Button>
        </Link>
      </div>
    </div>
  )
}
