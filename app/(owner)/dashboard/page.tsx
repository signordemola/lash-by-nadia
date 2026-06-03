import { prisma } from "@/lib/db"
import { startOfDay, endOfDay, format } from "date-fns"
import { DashboardView } from "@/components/dashboard/today-view"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const today = new Date()

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: {
        gte: startOfDay(today),
        lte: endOfDay(today),
      },
      status: { in: ["CONFIRMED", "COMPLETED", "NO_SHOW"] },
    },
    include: { client: true, service: true },
    orderBy: { startsAt: "asc" },
  })

  const monthStats = await prisma.appointment.aggregate({
    where: {
      startsAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
        lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      },
    },
    _count: true,
    _sum: { depositAmount: true },
  })

  const noShowsThisMonth = await prisma.appointment.count({
    where: {
      status: "NO_SHOW",
      startsAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), 1),
        lte: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      },
    },
  })

  const weekAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: {
        gte: startOfDay(today),
        lte: endOfDay(new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)),
      },
      status: "CONFIRMED",
    },
    select: { startsAt: true },
  })

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    return {
      day: format(d, "EEE"),
      date: d.getDate(),
      today: i === 0,
      count: weekAppointments.filter((a: { startsAt: Date }) => {
        const aptDate = format(a.startsAt, "yyyy-MM-dd")
        return aptDate === format(d, "yyyy-MM-dd")
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
