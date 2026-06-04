import { NextRequest, NextResponse } from "next/server"
import { getAvailableDates } from "@/lib/availability"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const serviceSlug = searchParams.get("serviceSlug")
  const monthStr = searchParams.get("month")

  if (!serviceSlug || !monthStr) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  try {
    const month = new Date(monthStr + "-01")
    const dates = await getAvailableDates(serviceSlug, month)

    return NextResponse.json(dates, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (err) {
    const code =
      err != null && typeof err === "object" && "code" in err
        ? (err as { code: string }).code
        : null

    if (code === "P1001" || code === "P1002" || code === "ETIMEDOUT") {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again." },
        { status: 503 }
      )
    }

    console.error("[availability/dates] Unhandled error:", err)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
