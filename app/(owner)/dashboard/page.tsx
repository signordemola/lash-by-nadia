import { prisma } from "@/lib/db"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { londonDateOnly } from "@/lib/time"
import { DashboardView } from "@/components/dashboard/today-view"

export const dynamic = "force-dynamic"

const TZ = "Europe/London"

export default async function DashboardPage() {
  const todayStr = formatInTimeZone(new Date(), TZ, "yyyy-MM-dd")
  const todayStart = londonDateOnly(todayStr)
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: {
        gte: todayStart,
        lt: todayEnd,
      },
      status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] },
    },
    include: { client: true, service: true },
    orderBy: { startsAt: "asc" },
  })

  const monthStart = londonDateOnly(
    formatInTimeZone(new Date(), TZ, "yyyy-MM-01")
  )
  const nextMonthStart = new Date(
    Number(formatInTimeZone(new Date(), TZ, "yyyy")),
    Number(formatInTimeZone(new Date(), TZ, "MM")),
    1
  )
  const monthEnd = londonDateOnly(
    formatInTimeZone(nextMonthStart, TZ, "yyyy-MM-dd")
  )

  const monthStats = await prisma.appointment.aggregate({
    where: {
      startsAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    _count: true,
    _sum: { depositAmount: true },
  })

  const noShowsThisMonth = await prisma.appointment.count({
    where: {
      status: "NO_SHOW",
      startsAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  })

  const weekEnd = new Date(todayEnd.getTime() + 6 * 86400000)
  const weekAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: {
        gte: todayStart,
        lt: weekEnd,
      },
      status: "CONFIRMED",
    },
    select: { startsAt: true },
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayStart.getTime() + i * 86400000)
    const dStr = formatInTimeZone(d, TZ, "yyyy-MM-dd")
    return {
      day: format(d, "EEE"),
      date: new Date(d).getDate(),
      today: i === 0,
      count: weekAppointments.filter((a: { startsAt: Date }) => {
        const aptDate = formatInTimeZone(a.startsAt, TZ, "yyyy-MM-dd")
        return aptDate === dStr
      }).length,
    }
  })

  return (
    <DashboardView
      todayAppointments={todayAppointments}
      stats={{
        monthBookings: monthStats._count,
        monthRevenue: monthStats._sum.depositAmount ?? 0,
        noShows: noShowsThisMonth,
        todayCount: todayAppointments.length,
      }}
      weekDays={weekDays}
    />
  )
}
