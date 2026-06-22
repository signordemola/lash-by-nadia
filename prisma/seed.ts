import { prisma } from "@/lib/db"
import { londonDate, londonDateOnly } from "@/lib/time"
import { formatInTimeZone } from "date-fns-tz"

const TZ = "Europe/London"

async function main() {
  const now = new Date()

  await prisma.slotHold.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.client.deleteMany()
  await prisma.service.deleteMany()
  await prisma.weeklyAvailability.deleteMany()
  await prisma.blockedDate.deleteMany()

  const services = await Promise.all([
    prisma.service.create({
      data: {
        slug: "classic",
        name: "Classic Set",
        duration: 90,
        price: 6500,
        deposit: 2000,
        displayOrder: 1,
      },
    }),
    prisma.service.create({
      data: {
        slug: "hybrid",
        name: "Hybrid Set",
        duration: 120,
        price: 8000,
        deposit: 2500,
        displayOrder: 2,
      },
    }),
    prisma.service.create({
      data: {
        slug: "volume",
        name: "Volume Set",
        duration: 150,
        price: 9500,
        deposit: 3000,
        displayOrder: 3,
      },
    }),
    prisma.service.create({
      data: {
        slug: "fill",
        name: "Lash Fill",
        duration: 60,
        price: 4500,
        deposit: 1500,
        displayOrder: 4,
      },
    }),
    prisma.service.create({
      data: {
        slug: "removal",
        name: "Lash Removal",
        duration: 30,
        price: 2000,
        deposit: 0,
        displayOrder: 5,
      },
    }),
  ])

  await prisma.weeklyAvailability.createMany({
    data: [
      { dayOfWeek: 1, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "18:00", isActive: true },
    ],
  })

  const nextWeekBase = new Date(now.getTime() + 7 * 86400000)
  const nextWeekStr = formatInTimeZone(nextWeekBase, TZ, "yyyy-MM-dd")
  await prisma.blockedDate.create({
    data: { date: londonDateOnly(nextWeekStr), reason: "Personal day" },
  })

  function d(offsetDays: number, hours: number, minutes = 0): Date {
    const base = new Date(now.getTime() + offsetDays * 86400000)
    const dateStr = formatInTimeZone(base, TZ, "yyyy-MM-dd")
    const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    return londonDate(dateStr, timeStr)
  }

  function end(start: Date, durationMin: number) {
    return new Date(start.getTime() + durationMin * 60000)
  }

  const [
    amara,
    priya,
    maya,
    sofia,
    yuki,
    eleanor,
    olivia,
    chloe,
    grace,
    isabella,
  ] = await Promise.all([
    prisma.client.create({
      data: {
        email: "amara@example.com",
        name: "Amara Okonkwo",
        phone: "07712 483920",
      },
    }),
    prisma.client.create({
      data: {
        email: "priya.s@example.com",
        name: "Priya Shah",
        phone: "07834 619047",
      },
    }),
    prisma.client.create({
      data: {
        email: "maya.l@example.com",
        name: "Maya Lindqvist",
        phone: "07958 302716",
      },
    }),
    prisma.client.create({
      data: {
        email: "sofia.r@example.com",
        name: "Sofia Reyes",
        phone: "07463 851290",
        noShowCount: 2,
        isFlagged: true,
      },
    }),
    prisma.client.create({
      data: {
        email: "yuki@example.com",
        name: "Yuki Tanaka",
        phone: "07391 274856",
      },
    }),
    prisma.client.create({
      data: {
        email: "e.cho@example.com",
        name: "Eleanor Cho",
        phone: "07527 963401",
      },
    }),
    prisma.client.create({
      data: {
        email: "olivia.c@example.com",
        name: "Olivia Chen",
        phone: "07648 130592",
      },
    }),
    prisma.client.create({
      data: {
        email: "chloe.p@example.com",
        name: "Chloe Patel",
        phone: "07793 408165",
      },
    }),
    prisma.client.create({
      data: {
        email: "grace.t@example.com",
        name: "Grace Thompson",
        phone: "07821 054739",
      },
    }),
    prisma.client.create({
      data: {
        email: "isabella.r@example.com",
        name: "Isabella Rossi",
        phone: "07904 372618",
      },
    }),
  ])

  const classic = services[0]
  const hybrid = services[1]
  const volume = services[2]
  const fill = services[3]
  const removal = services[4]

  const appointmentsData = [
    {
      client: priya,
      service: classic,
      start: d(-20, 10, 0),
      status: "COMPLETED",
      deposit: 2000,
    },
    {
      client: chloe,
      service: hybrid,
      start: d(-18, 13, 0),
      status: "COMPLETED",
      deposit: 2500,
    },
    {
      client: grace,
      service: volume,
      start: d(-15, 10, 30),
      status: "COMPLETED",
      deposit: 3000,
    },
    {
      client: isabella,
      service: fill,
      start: d(-14, 14, 0),
      status: "COMPLETED",
      deposit: 1500,
    },
    {
      client: amara,
      service: hybrid,
      start: d(-12, 11, 0),
      status: "COMPLETED",
      deposit: 2500,
    },
    {
      client: sofia,
      service: hybrid,
      start: d(-10, 10, 0),
      status: "NO_SHOW",
      deposit: 2500,
      depositStatus: "FORFEITED",
      noShowMarked: true,
    },
    {
      client: eleanor,
      service: removal,
      start: d(-10, 14, 0),
      status: "COMPLETED",
      deposit: 0,
    },
    {
      client: yuki,
      service: classic,
      start: d(-8, 13, 30),
      status: "COMPLETED",
      deposit: 2000,
    },
    {
      client: maya,
      service: volume,
      start: d(-7, 10, 0),
      status: "COMPLETED",
      deposit: 3000,
    },
    {
      client: eleanor,
      service: volume,
      start: d(-5, 10, 0),
      status: "COMPLETED",
      deposit: 3000,
    },
    {
      client: priya,
      service: fill,
      start: d(-5, 14, 30),
      status: "COMPLETED",
      deposit: 1500,
    },
    {
      client: priya,
      service: classic,
      start: d(-3, 14, 0),
      status: "COMPLETED",
      deposit: 2000,
    },
    {
      client: sofia,
      service: fill,
      start: d(-1, 14, 0),
      status: "NO_SHOW",
      deposit: 1500,
      depositStatus: "FORFEITED",
      noShowMarked: true,
    },
    {
      client: amara,
      service: hybrid,
      start: d(0, 10, 0),
      status: "CONFIRMED",
      deposit: 2500,
    },
    {
      client: maya,
      service: volume,
      start: d(0, 13, 0),
      status: "CONFIRMED",
      deposit: 3000,
    },
    {
      client: olivia,
      service: fill,
      start: d(0, 16, 0),
      status: "CONFIRMED",
      deposit: 1500,
    },
    {
      client: yuki,
      service: fill,
      start: d(1, 11, 30),
      status: "CONFIRMED",
      deposit: 1500,
    },
    {
      client: chloe,
      service: classic,
      start: d(2, 10, 0),
      status: "CONFIRMED",
      deposit: 2000,
    },
    {
      client: grace,
      service: volume,
      start: d(3, 14, 0),
      status: "CONFIRMED",
      deposit: 3000,
    },
    {
      client: isabella,
      service: hybrid,
      start: d(4, 11, 0),
      status: "CONFIRMED",
      deposit: 2500,
    },
  ]

  for (const a of appointmentsData) {
    await prisma.appointment.create({
      data: {
        clientId: a.client.id,
        serviceId: a.service.id,
        startsAt: a.start,
        endsAt: end(a.start, a.service.duration),
        status: a.status as "CONFIRMED" | "COMPLETED" | "NO_SHOW",
        depositAmount: a.deposit,
        depositStatus: (a.depositStatus ?? "HELD") as "HELD" | "FORFEITED",
        manageToken: `demo-${a.client.email.split("@")[0]}-${a.start.getTime()}`,
        policyAgreedAt: now,
        noShowMarkedAt: a.noShowMarked ? now : null,
      },
    })
  }

  console.log(
    "Seed complete: 5 services, 6 availability (Mon-Sat), 1 blocked, 10 clients, 20 appointments"
  )
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
