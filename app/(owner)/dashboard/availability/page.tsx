import type { Metadata } from "next"
import { prisma } from "@/lib/db"
import { requireOwnerPage } from "@/lib/require-owner"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Availability",
}

export const dynamic = "force-dynamic"

const dayLabels: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}

export default async function AvailabilityPage() {
  await requireOwnerPage()

  const availability = await prisma.weeklyAvailability.findMany({
    where: { isActive: true },
    orderBy: { dayOfWeek: "asc" },
  })

  const blockedDates = await prisma.blockedDate.findMany({
    orderBy: { date: "asc" },
  })

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="mb-2 text-2xl font-bold tracking-tight">Availability</h1>
        <p className="text-sm text-muted-foreground">
          Current working hours and blocked dates.
        </p>
      </div>

      <div>
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Weekly working hours
        </h2>
        <div className="space-y-1">
          {availability.map((a) => (
            <Card
              key={a.id}
              className="flex items-center justify-between rounded-sm p-3"
            >
              <span className="text-sm font-medium">
                {dayLabels[a.dayOfWeek]}
              </span>
              <span className="font-mono text-sm">
                {a.startTime} – {a.endTime}
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
          Blocked dates
        </h2>
        {blockedDates.length === 0 ? (
          <Card className="flex min-h-[80px] items-center justify-center rounded-sm">
            <p className="text-sm text-muted-foreground">No blocked dates.</p>
          </Card>
        ) : (
          <div className="space-y-1">
            {blockedDates.map((b) => {
              const d = new Date(b.date)
              return (
                <Card
                  key={b.id}
                  className="flex items-center justify-between rounded-sm p-3"
                >
                  <span className="text-sm font-medium">{formatDate(d)}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {(b.reason ?? "Blocked")
                      .replace(/\s*[—–-]\s*demo\b.*$/i, "")
                      .trim() || "Blocked"}
                  </span>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
