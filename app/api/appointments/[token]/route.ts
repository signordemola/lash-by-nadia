import { NextRequest, NextResponse } from "next/server"
import { getAppointmentByToken } from "@/lib/tokens"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const appointment = await getAppointmentByToken(token)

  if (!appointment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(appointment)
}
