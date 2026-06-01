import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL!

const adapter = new PrismaPg({ connectionString })
const prismaClient = new PrismaClient({ adapter })

export const prisma = globalForPrisma.prisma ?? prismaClient

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
