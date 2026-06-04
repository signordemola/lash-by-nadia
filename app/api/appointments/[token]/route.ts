import { NextRequest, NextResponse } from "next/server"
import { getAppointmentByToken, DatabaseUnavailableError } from "@/lib/tokens"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const appointment = await getAppointmentByToken(token)

    if (!appointment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(appointment)
  } catch (err) {
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again." },
        { status: 503 }
      )
    }
    console.error("[appointments/token] Unhandled error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
