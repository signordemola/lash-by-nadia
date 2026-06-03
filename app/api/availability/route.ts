import { NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/availability"
import { AvailabilityQuerySchema } from "@/schemas/availability.schema"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const serviceSlug = searchParams.get("serviceSlug")
  const dateStr = searchParams.get("date")

  const parsed = AvailabilityQuerySchema.safeParse({
    serviceSlug,
    date: dateStr,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const slots = await getAvailableSlots(
    parsed.data.serviceSlug,
    parsed.data.date
  )

  return NextResponse.json(slots)
}
