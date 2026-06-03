import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { canMarkNoShow } from "@/lib/policy"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("owner-token")
  if (token?.value !== "valid") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: { client: true },
  })

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (appointment.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Cannot mark non-confirmed appointment as no-show" },
      { status: 409 }
    )
  }

  if (!canMarkNoShow(appointment.startsAt)) {
    return NextResponse.json(
      {
        error:
          "Can only mark no-show after appointment start time on the same day",
      },
      { status: 403 }
    )
  }

  const newNoShowCount = appointment.client.noShowCount + 1

  await prisma.appointment.update({
    where: { id },
    data: {
      status: "NO_SHOW",
      depositStatus: "FORFEITED",
      noShowMarkedAt: new Date(),
    },
  })

  await prisma.client.update({
    where: { id: appointment.clientId },
    data: {
      noShowCount: newNoShowCount,
      isFlagged: newNoShowCount >= 2,
    },
  })

  return NextResponse.json({ status: "NO_SHOW" })
}
