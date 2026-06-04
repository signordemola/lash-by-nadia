import { nanoid } from "nanoid"
import { prisma } from "@/lib/db"

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("Database is currently unreachable")
    this.name = "DatabaseUnavailableError"
  }
}

export function generateManageToken(): string {
  return nanoid(21)
}

export async function getAppointmentByToken(token: string) {
  try {
    return await prisma.appointment.findUnique({
      where: { manageToken: token },
      include: { client: true, service: true },
    })
  } catch (err) {
    // P1001 = can't reach DB, P1002 = timed out reaching DB
    const isUnreachable =
      err != null &&
      typeof err === "object" &&
      "code" in err &&
      (err.code === "P1001" || err.code === "P1002")

    const isInitError =
      err != null &&
      typeof err === "object" &&
      "name" in err &&
      err.name === "PrismaClientInitializationError"

    if (isUnreachable || isInitError) {
      throw new DatabaseUnavailableError()
    }
    throw err
  }
}
