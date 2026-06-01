import { prisma } from "@/lib/db"

async function main() {
  const now = new Date().toISOString()

  await prisma.service.deleteMany()
  await prisma.weeklyAvailability.deleteMany()
  await prisma.blockedDate.deleteMany()

  await prisma.service.createMany({
    data: [
      {
        slug: "classic",
        name: "Classic Set",
        duration: 90,
        price: 6500,
        deposit: 2000,
        displayOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: "hybrid",
        name: "Hybrid Set",
        duration: 120,
        price: 8000,
        deposit: 2500,
        displayOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: "volume",
        name: "Volume Set",
        duration: 150,
        price: 9500,
        deposit: 3000,
        displayOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: "fill",
        name: "Lash Fill",
        duration: 60,
        price: 4500,
        deposit: 1500,
        displayOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        slug: "removal",
        name: "Lash Removal",
        duration: 30,
        price: 2000,
        deposit: 0,
        displayOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
    ],
  })

  await prisma.weeklyAvailability.createMany({
    data: [
      { dayOfWeek: 2, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 3, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 4, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 5, startTime: "10:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 6, startTime: "10:00", endTime: "18:00", isActive: true },
    ],
  })

  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  await prisma.blockedDate.create({
    data: {
      date: nextWeek,
      reason: "Personal day — demo blocked date",
    },
  })

  console.log("Seed complete: 5 services, 5 availability rows, 1 blocked date")
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
