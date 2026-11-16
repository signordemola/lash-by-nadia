import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hasOwnerSession } from "@/lib/require-owner"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasOwnerSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  })

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (appointment.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Cannot mark non-confirmed appointment as complete" },
      { status: 409 }
    )
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "COMPLETED" },
  })

  return NextResponse.json({ status: "COMPLETED" })
}
