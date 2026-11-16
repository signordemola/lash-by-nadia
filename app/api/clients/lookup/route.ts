import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createRateLimiter } from "@/lib/rate-limit"
import { ReturningClientLookupSchema } from "@/schemas/booking.schema"

const limiter = createRateLimiter(5, "1 m")

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anon"
  const { success } = await limiter.limit(`client-lookup:${ip}`)
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = await request.json()
  const parsed = ReturningClientLookupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const client = await prisma.client.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  })

  return NextResponse.json({ found: client !== null })
}
