import { prisma } from "@/lib/db"

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
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "18:00", isActive: true },
    ],
  })

  const nextWeek = new Date(now.getTime() + 7 * 86400000)
  await prisma.blockedDate.create({
    data: { date: nextWeek, reason: "Personal day — demo blocked date" },
  })

  function d(offsetDays: number, hours: number, minutes = 0) {
    const dt = new Date(now.getTime() + offsetDays * 86400000)
    dt.setHours(hours, minutes, 0, 0)
    return dt
  }

  function end(start: Date, durationMin: number) {
    return new Date(start.getTime() + durationMin * 60000)
  }

  const [amara, priya, maya, sofia, yuki, eleanor] = await Promise.all([
    prisma.client.create({
      data: {
        email: "amara@example.com",
        name: "Amara Okonkwo",
        phone: "07111 111111",
      },
    }),
    prisma.client.create({
      data: {
        email: "priya.s@example.com",
        name: "Priya Shah",
        phone: "07222 222222",
      },
    }),
    prisma.client.create({
      data: {
        email: "maya.l@example.com",
        name: "Maya Lindqvist",
        phone: "07333 333333",
      },
    }),
    prisma.client.create({
      data: {
        email: "sofia.r@example.com",
        name: "Sofia Reyes",
        phone: "07444 444444",
        noShowCount: 2,
        isFlagged: true,
      },
    }),
    prisma.client.create({
      data: {
        email: "yuki@example.com",
        name: "Yuki Tanaka",
        phone: "07555 555555",
      },
    }),
    prisma.client.create({
      data: {
        email: "e.cho@example.com",
        name: "Eleanor Cho",
        phone: "07666 666666",
      },
    }),
  ])

  const classic = services[0]
  const hybrid = services[1]
  const volume = services[2]
  const fill = services[3]

  const upcoming = [
    { client: amara, service: hybrid, start: d(0, 10, 0), deposit: 2500 },
    { client: maya, service: volume, start: d(0, 12, 30), deposit: 3000 },
    { client: yuki, service: fill, start: d(1, 11, 30), deposit: 1500 },
  ]

  for (const a of upcoming) {
    await prisma.appointment.create({
      data: {
        clientId: a.client.id,
        serviceId: a.service.id,
        startsAt: a.start,
        endsAt: end(a.start, a.service.duration),
        status: "CONFIRMED",
        depositAmount: a.deposit,
        depositStatus: "HELD",
        manageToken: `demo-${a.client.email.split("@")[0]}`,
        policyAgreedAt: now,
      },
    })
  }

  const completed = [
    { client: priya, service: classic, start: d(-3, 14, 0), deposit: 2000 },
    { client: eleanor, service: volume, start: d(-5, 10, 0), deposit: 3000 },
  ]

  for (const a of completed) {
    await prisma.appointment.create({
      data: {
        clientId: a.client.id,
        serviceId: a.service.id,
        startsAt: a.start,
        endsAt: end(a.start, a.service.duration),
        status: "COMPLETED",
        depositAmount: a.deposit,
        depositStatus: "HELD",
        manageToken: `demo-${a.client.email.split("@")[0]}`,
        policyAgreedAt: now,
      },
    })
  }

  const noShows = [
    { client: sofia, service: fill, start: d(-1, 14, 0), deposit: 1500 },
    { client: sofia, service: hybrid, start: d(-10, 10, 0), deposit: 2500 },
  ]

  for (const a of noShows) {
    await prisma.appointment.create({
      data: {
        clientId: a.client.id,
        serviceId: a.service.id,
        startsAt: a.start,
        endsAt: end(a.start, a.service.duration),
        status: "NO_SHOW",
        depositAmount: a.deposit,
        depositStatus: "FORFEITED",
        manageToken: `demo-${a.client.email.split("@")[0]}-ns`,
        policyAgreedAt: now,
        noShowMarkedAt: now,
      },
    })
  }

  console.log(
    "Seed complete: 5 services, 5 availability, 1 blocked, 6 clients, 7 appointments"
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
