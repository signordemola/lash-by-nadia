import { createEvent, type DateArray } from "ics"

const STUDIO_NAME = "Lash by Nadia"
const STUDIO_EMAIL = "nadia@lashbynadia.com"
const STUDIO_ADDRESS =
  "Cambridge Heath Road, Bethnal Green, London E2. Entrance via the teal doors."

export function generateICS(params: {
  startsAt: Date
  endsAt: Date
  serviceName: string
  clientName: string
  clientEmail: string
  status?: "CONFIRMED" | "CANCELLED"
  manageUrl?: string
}): string | null {
  const start: DateArray = [
    params.startsAt.getUTCFullYear(),
    params.startsAt.getUTCMonth() + 1,
    params.startsAt.getUTCDate(),
    params.startsAt.getUTCHours(),
    params.startsAt.getUTCMinutes(),
  ]

  const durationMs = params.endsAt.getTime() - params.startsAt.getTime()
  const durationMinutes = Math.round(durationMs / 60000)

  const description = [
    `${params.serviceName} at ${STUDIO_NAME}`,
    "",
    `Location: ${STUDIO_ADDRESS}`,
    params.manageUrl ? `Manage booking: ${params.manageUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n")

  const { value } = createEvent({
    start,
    duration: { minutes: durationMinutes },
    title: `${params.serviceName} — ${STUDIO_NAME}`,
    description,
    location: STUDIO_ADDRESS,
    status: params.status || "CONFIRMED",
    organizer: { name: STUDIO_NAME, email: STUDIO_EMAIL },
    attendees: [
      {
        name: params.clientName,
        email: params.clientEmail,
        partstat: "ACCEPTED",
      },
    ],
  })

  return value ?? null
}
