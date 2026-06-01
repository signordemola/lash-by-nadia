import { z } from "zod"

export const AvailabilityQuerySchema = z.object({
  serviceSlug: z.string().min(1),
  date: z.string().min(1),
})

export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>
