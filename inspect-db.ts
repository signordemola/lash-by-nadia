import { prisma } from "@/lib/db"

async function main() {
  const slotHolds = await prisma.slotHold.findMany()
  console.log("SLOT HOLDS IN DB:", slotHolds)

  const appointments = await prisma.appointment.count()
  console.log("APPOINTMENTS COUNT:", appointments)

  const clients = await prisma.client.count()
  console.log("CLIENTS COUNT:", clients)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
