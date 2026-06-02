import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
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
