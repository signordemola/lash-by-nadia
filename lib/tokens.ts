import { nanoid } from "nanoid"
import { prisma } from "@/lib/db"

export function generateManageToken(): string {
  return nanoid(21)
}

export async function getAppointmentByToken(token: string) {
  return prisma.appointment.findUnique({
    where: { manageToken: token },
    include: { client: true, service: true },
  })
}
