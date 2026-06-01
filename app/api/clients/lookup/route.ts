import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ReturningClientLookupSchema } from "@/schemas/booking.schema"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = ReturningClientLookupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const client = await prisma.client.findUnique({
    where: { email: parsed.data.email },
    select: {
      name: true,
      phone: true,
      allergies: true,
    },
  })

  if (!client) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({ found: true, ...client })
}
